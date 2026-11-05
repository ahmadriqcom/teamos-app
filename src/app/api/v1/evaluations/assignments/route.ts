import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId");
    const raterId = searchParams.get("raterId");
    const employeeId = searchParams.get("employeeId");
    const clientToken = searchParams.get("clientToken");

    const where: Record<string, unknown> = {};
    if (cycleId) where.cycleId = cycleId;
    if (raterId) where.raterId = raterId;
    if (employeeId) where.employeeId = employeeId;
    if (clientToken) where.clientToken = clientToken;

    const assignments = await prisma.evaluationAssignment.findMany({
      where,
      include: {
        employee: true,
        rater: true,
        cycle: {
          include: {
            version: {
              include: {
                barsQuestions: {
                  include: {
                    aspect: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { isSubmitted: "asc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Fetch assignments error:", error);
    return NextResponse.json(
      { error: "Gagal memuat penugasan evaluasi." },
      { status: 500 }
    );
  }
}
