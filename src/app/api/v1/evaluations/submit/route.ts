import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAntiBiasSubmission } from "@/lib/scoring/antiBias";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignmentId, answers } = body;

    if (!assignmentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Parameter 'assignmentId' dan array 'answers' wajib diisi." },
        { status: 400 }
      );
    }

    const assignment = await prisma.evaluationAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        cycle: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Penugasan evaluasi tidak ditemukan." },
        { status: 404 }
      );
    }

    if (assignment.cycle.status === "CLOSED") {
      return NextResponse.json(
        { error: "Siklus evaluasi telah ditutup. Tidak dapat mengirimkan jawaban." },
        { status: 400 }
      );
    }

    // Anti-Bias & Evidence Validation
    const validation = validateAntiBiasSubmission(answers);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          status: "VALIDATION_FAILED",
          error: "Validasi bukti insiden tidak terpenuhi.",
          validationErrors: validation.validationErrors,
        },
        { status: 400 }
      );
    }

    // Atomic submission
    await prisma.$transaction(async (tx) => {
      // Delete existing answers if any (re-submission support)
      await tx.evaluationAnswer.deleteMany({
        where: { assignmentId },
      });

      for (const ans of answers) {
        await tx.evaluationAnswer.create({
          data: {
            assignmentId,
            questionId: ans.questionId,
            selectedLevel: ans.selectedLevel,
            evidenceText: ans.evidenceText || null,
            calculatedScore: ans.selectedLevel * 20.0,
          },
        });
      }

      await tx.evaluationAssignment.update({
        where: { id: assignmentId },
        data: {
          isSubmitted: true,
          submittedAt: new Date(),
          isFlaggedAnomaly: validation.isFlaggedAnomaly,
          anomalyReason: validation.anomalyReason || null,
        },
      });
    });

    return NextResponse.json({
      status: "SUBMIT_SUCCESS",
      message: "Evaluasi BARS berhasil disimpan.",
      isFlaggedAnomaly: validation.isFlaggedAnomaly,
      anomalyReason: validation.anomalyReason,
    });
  } catch (error) {
    console.error("Submit evaluation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses jawaban evaluasi.",
      },
      { status: 500 }
    );
  }
}
