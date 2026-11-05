import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dryRunSessions } from "@/lib/excel/dryRunParser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { temporary_session_id, version_tag, description } = body;

    if (!temporary_session_id || !version_tag) {
      return NextResponse.json(
        { error: "Parameter 'temporary_session_id' dan 'version_tag' wajib diisi." },
        { status: 400 }
      );
    }

    // Retrieve session data
    const session = dryRunSessions.get(temporary_session_id);
    if (!session || !session.questions || session.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Sesi dry-run kedaluwarsa atau tidak valid. Silakan unggah ulang berkas Excel.",
        },
        { status: 400 }
      );
    }

    // TC-IMP-03 Immutability Check:
    // Check if version_tag already exists and is attached to an ACTIVE cycle
    const existingVersion = await prisma.questionnaireVersion.findUnique({
      where: { versionTag: version_tag },
      include: {
        evaluationCycles: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (existingVersion && existingVersion.evaluationCycles.length > 0) {
      return NextResponse.json(
        {
          error: "Tidak dapat memodifikasi instrumen pada siklus yang sedang berjalan",
        },
        { status: 403 }
      );
    }

    // If version exists but no active cycle, we can either reject duplicate or require a new tag
    if (existingVersion) {
      return NextResponse.json(
        {
          error: `Versi '${version_tag}' sudah terdaftar dalam sistem. Harap gunakan tag versi baru (semantic versioning).`,
        },
        { status: 409 }
      );
    }

    // Default admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: "ROLE_SUPERADMIN" },
    });
    const uploadedBy = adminUser?.id || "u-admin-01";

    // Stage 5: Atomic Commit & Version Locking
    const newVersion = await prisma.$transaction(async (tx) => {
      const ver = await tx.questionnaireVersion.create({
        data: {
          versionTag: version_tag,
          description: description || "Instrumen BARS revisi yang dipublikasikan via Import Wizard",
          uploadedBy,
          status: "PUBLISHED",
          totalQuestions: session.questions.length,
        },
      });

      for (const q of session.questions) {
        await tx.masterBarsQuestion.create({
          data: {
            versionId: ver.id,
            aspectCode: q.aspectCode,
            targetRole: q.targetRole,
            questionCode: q.questionCode,
            scenarioQuestion: q.scenarioQuestion,
            level1Desc: q.level1Desc,
            level2Desc: q.level2Desc,
            level3Desc: q.level3Desc,
            level4Desc: q.level4Desc,
            level5Desc: q.level5Desc,
          },
        });
      }

      return ver;
    });

    // Remove temporary session
    dryRunSessions.delete(temporary_session_id);

    return NextResponse.json({
      status: "PUBLISHED_SUCCESS",
      version_id: newVersion.id,
      version_tag: newVersion.versionTag,
      total_questions: newVersion.totalQuestions,
      message: `Versi instrumen ${newVersion.versionTag} berhasil dipublikasikan dan dikunci secara atomik.`,
    });
  } catch (error) {
    console.error("Publish questionnaire error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan internal saat mempublikasikan instrumen BARS.",
      },
      { status: 500 }
    );
  }
}
