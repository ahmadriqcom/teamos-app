import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cycles = await prisma.evaluationCycle.findMany({
      include: {
        version: true,
        _count: {
          select: {
            assignments: true,
            results: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cycles);
  } catch (error) {
    console.error("Fetch cycles error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar siklus evaluasi." },
      { status: 500 }
    );
  }
}
