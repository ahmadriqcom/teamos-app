import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sops = await prisma.masterSop.findMany({
      include: {
        creator: true,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(sops);
  } catch (error) {
    console.error("Fetch SOPs error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar dokumen SOP." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sopCode, title, description, checklistSteps, createdBy } = body;

    if (!sopCode || !title || !checklistSteps) {
      return NextResponse.json(
        { error: "Parameter sopCode, title, dan checklistSteps wajib diisi." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findFirst({ where: { role: "ROLE_MANAGER" } });
    const creatorId = createdBy || admin?.id || "u-mgr-01";

    const sop = await prisma.masterSop.create({
      data: {
        sopCode,
        title,
        description: description || null,
        checklistSteps:
          typeof checklistSteps === "string"
            ? checklistSteps
            : JSON.stringify(checklistSteps),
        createdBy: creatorId,
      },
    });

    return NextResponse.json(sop, { status: 201 });
  } catch (error) {
    console.error("Create SOP error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan dokumen SOP." },
      { status: 500 }
    );
  }
}
