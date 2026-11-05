import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId");

    const cycleWhere = cycleId ? { id: cycleId } : { status: "ACTIVE" };
    const activeCycle = await prisma.evaluationCycle.findFirst({
      where: cycleWhere,
      include: { version: true },
    });

    if (!activeCycle) {
      return NextResponse.json({
        cycle: null,
        results: [],
        tickets: [],
        users: [],
        distribution: { TIPE_A: 0, TIPE_B: 0, TIPE_C_SKILL: 0, TIPE_C_ATTITUDE: 0 },
      });
    }

    const [results, tickets, users] = await Promise.all([
      prisma.employeeCycleResult.findMany({
        where: { cycleId: activeCycle.id },
        include: { employee: true },
        orderBy: { finalCompositeScore: "desc" },
      }),
      prisma.actionTicket.findMany({
        where: { cycleId: activeCycle.id },
        include: { employee: true, mentor: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: { not: "ROLE_CLIENT" } },
        orderBy: { name: "asc" },
      }),
    ]);

    const distribution = {
      TIPE_A: 0,
      TIPE_B: 0,
      TIPE_C_SKILL: 0,
      TIPE_C_ATTITUDE: 0,
    };

    results.forEach((r) => {
      if (r.finalClassification in distribution) {
        distribution[r.finalClassification as keyof typeof distribution]++;
      }
    });

    return NextResponse.json({
      cycle: activeCycle,
      results,
      tickets,
      users,
      distribution,
    });
  } catch (error) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json(
      { error: "Gagal memuat analitik matriks evaluasi." },
      { status: 500 }
    );
  }
}
