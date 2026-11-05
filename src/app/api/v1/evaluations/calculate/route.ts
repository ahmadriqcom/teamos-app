import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTrimmedMean } from "@/lib/scoring/trimmedMean";
import { getEffectiveRaterWeights } from "@/lib/scoring/raterWeights";
import { evaluateClassification } from "@/lib/decision/hierarchicalEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cycleId, employeeId, deltaIncident = 0 } = body;

    if (!cycleId || !employeeId) {
      return NextResponse.json(
        { error: "Parameter 'cycleId' dan 'employeeId' wajib disertakan." },
        { status: 400 }
      );
    }

    // Clamp delta incident to [-15, +5] (PRD 5.1)
    const clampedDelta = Math.max(-15, Math.min(5, Number(deltaIncident) || 0));

    // Fetch master aspects to get dynamic global weights
    const masterAspects = await prisma.masterAspect.findMany();
    const aspectWeights: Record<string, number> = {};
    masterAspects.forEach((asp) => {
      aspectWeights[asp.aspectCode] = asp.globalWeightPct / 100.0;
    });

    // Default fallbacks if aspect table is customized
    if (!aspectWeights.ASP_KS) aspectWeights.ASP_KS = 0.3;
    if (!aspectWeights.ASP_KR) aspectWeights.ASP_KR = 0.25;
    if (!aspectWeights.ASP_SK) aspectWeights.ASP_SK = 0.25;
    if (!aspectWeights.ASP_KB) aspectWeights.ASP_KB = 0.2;

    // Fetch all submitted assignments for this employee
    const assignments = await prisma.evaluationAssignment.findMany({
      where: {
        cycleId,
        employeeId,
        isSubmitted: true,
        isFlaggedAnomaly: false, // exclude quarantined anomaly submissions
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (assignments.length === 0) {
      return NextResponse.json(
        {
          error:
            "Belum ada data evaluasi tervalidasi yang diserahkan untuk karyawan ini pada siklus terkait.",
        },
        { status: 400 }
      );
    }

    // Check if client rater exists
    const hasClientRater = assignments.some((a) => a.relationship === "CLI");

    // Group answers by aspectCode and relationship
    const scoresMatrix: Record<string, Record<string, number[]>> = {
      ASP_KS: { MGR: [], PEER: [], CROSS: [], CLI: [] },
      ASP_KB: { MGR: [], PEER: [], CROSS: [], CLI: [] },
      ASP_KR: { MGR: [], PEER: [], CROSS: [], CLI: [] },
      ASP_SK: { MGR: [], PEER: [], CROSS: [], CLI: [] },
    };

    assignments.forEach((assignment) => {
      const rel = assignment.relationship;
      assignment.answers.forEach((ans) => {
        const asp = ans.question.aspectCode;
        if (scoresMatrix[asp] && scoresMatrix[asp][rel]) {
          scoresMatrix[asp][rel].push(ans.calculatedScore);
        }
      });
    });

    // Compute aspect scores
    const aspectScores: Record<string, number> = {};
    const calculationBreakdown: Record<string, unknown> = {};

    for (const aspectCode of ["ASP_KS", "ASP_KB", "ASP_KR", "ASP_SK"]) {
      const weights = getEffectiveRaterWeights(aspectCode, hasClientRater);
      let aspectTotal = 0;
      let totalEffectiveWeight = 0;

      const raterDetails: Record<string, unknown> = {};

      for (const role of ["MGR", "PEER", "CROSS", "CLI"] as const) {
        const rawScores = scoresMatrix[aspectCode][role];
        const roleWeight = weights[role];

        if (rawScores.length > 0 && roleWeight > 0) {
          const trimmedResult = calculateTrimmedMean(rawScores);
          const contribution = trimmedResult.score * roleWeight;
          aspectTotal += contribution;
          totalEffectiveWeight += roleWeight;

          raterDetails[role] = {
            rawScores,
            trimmedScores: trimmedResult.trimmedScores,
            wasTrimmed: trimmedResult.wasTrimmed,
            roleScore: trimmedResult.score,
            weight: roleWeight,
            weightedScore: Number(contribution.toFixed(2)),
          };
        }
      }

      // Normalize if some non-client roles had no raters
      const finalAspectScore =
        totalEffectiveWeight > 0
          ? Number((aspectTotal / totalEffectiveWeight).toFixed(2))
          : 0;

      aspectScores[aspectCode] = finalAspectScore;
      calculationBreakdown[aspectCode] = {
        finalScore: finalAspectScore,
        globalWeight: aspectWeights[aspectCode],
        raters: raterDetails,
      };
    }

    // Final Composite Score (FCS)
    // FCS = sum(S_A * W_A) + Delta_Incident
    const scoreCooperation = aspectScores.ASP_KS || 0;
    const scoreCapability = aspectScores.ASP_KB || 0;
    const scoreCharacter = aspectScores.ASP_KR || 0;
    const scoreAttitude = aspectScores.ASP_SK || 0;

    const rawComposite =
      scoreCooperation * aspectWeights.ASP_KS +
      scoreCapability * aspectWeights.ASP_KB +
      scoreCharacter * aspectWeights.ASP_KR +
      scoreAttitude * aspectWeights.ASP_SK;

    const finalCompositeScore = Number((rawComposite + clampedDelta).toFixed(2));

    // Decision Engine Execution
    const decision = evaluateClassification({
      cooperation: scoreCooperation,
      capability: scoreCapability,
      character: scoreCharacter,
      attitude: scoreAttitude,
      fcs: finalCompositeScore,
    });

    // Save or update EmployeeCycleResult
    const result = await prisma.$transaction(async (tx) => {
      const savedResult = await tx.employeeCycleResult.upsert({
        where: {
          cycleId_employeeId: {
            cycleId,
            employeeId,
          },
        },
        create: {
          cycleId,
          employeeId,
          scoreCooperation,
          scoreCapability,
          scoreCharacter,
          scoreAttitude,
          deltaIncident: clampedDelta,
          finalCompositeScore,
          finalClassification: decision.classification,
          actionTriggers: JSON.stringify(decision.actionTriggers),
        },
        update: {
          scoreCooperation,
          scoreCapability,
          scoreCharacter,
          scoreAttitude,
          deltaIncident: clampedDelta,
          finalCompositeScore,
          finalClassification: decision.classification,
          actionTriggers: JSON.stringify(decision.actionTriggers),
          calculatedAt: new Date(),
        },
      });

      // Automatically create action tickets based on decision triggers
      if (decision.classification === "TIPE_C_SKILL") {
        // Find a Tipe A mentor or manager
        const mentor = await tx.user.findFirst({
          where: {
            role: "ROLE_STAFF",
            cycleResults: {
              some: { finalClassification: "TIPE_A" },
            },
          },
        });

        await tx.actionTicket.create({
          data: {
            employeeId,
            cycleId,
            ticketType: "PIP_30_DAYS",
            title: "Program Pendampingan Teknis PIP 30 Hari",
            description:
              "Karyawan terdeteksi memiliki gap kemampuan teknis (< 60). Wajib menjalani program pelatihan terstruktur 30 hari.",
            mentorId: mentor?.id || null,
            dueDate: new Date(Date.now() + 86400000 * 30),
          },
        });
      } else if (decision.classification === "TIPE_C_ATTITUDE") {
        const mgr = await tx.user.findFirst({
          where: { role: "ROLE_MANAGER" },
        });

        await tx.actionTicket.create({
          data: {
            employeeId,
            cycleId,
            ticketType: "COUNSELING_1ON1",
            title: "Tiket Darurat Konseling 1-on-1 Manajerial (Maksimal 3x24 Jam)",
            description:
              "Karyawan terdeteksi memiliki risiko sikap kerja / integritas (< 60). Wajib sesi konseling manajerial langsung dalam 3x24 jam dan pembatasan wewenang delegasi lintas divisi.",
            mentorId: mgr?.id || null,
            dueDate: new Date(Date.now() + 86400000 * 3),
          },
        });
      }

      return savedResult;
    });

    return NextResponse.json({
      status: "CALCULATION_SUCCESS",
      employeeId,
      cycleId,
      scores: {
        cooperation: scoreCooperation,
        capability: scoreCapability,
        character: scoreCharacter,
        attitude: scoreAttitude,
        deltaIncident: clampedDelta,
        finalCompositeScore,
      },
      decision,
      breakdown: calculationBreakdown,
      resultId: result.id,
    });
  } catch (error) {
    console.error("Calculate score error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan internal saat menghitung skor BARS.",
      },
      { status: 500 }
    );
  }
}
