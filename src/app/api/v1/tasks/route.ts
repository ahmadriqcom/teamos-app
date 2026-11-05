import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    const tasks = await prisma.taskEngine.findMany({
      where,
      include: {
        sop: true,
        assignee: true,
        assigner: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar tugas operasional." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sopId, assignedTo, assignedBy, taskTitle, dueDate } = body;

    if (!sopId || !assignedTo || !taskTitle || !dueDate) {
      return NextResponse.json(
        { error: "Parameter sopId, assignedTo, taskTitle, dan dueDate wajib diisi." },
        { status: 400 }
      );
    }

    const sop = await prisma.masterSop.findUnique({ where: { id: sopId } });
    if (!sop) {
      return NextResponse.json(
        { error: "Dokumen SOP yang dirujuk tidak ditemukan." },
        { status: 404 }
      );
    }

    let steps: { step: number; title: string }[] = [];
    try {
      steps = JSON.parse(sop.checklistSteps);
    } catch {
      steps = [];
    }

    const initialProgress = steps.map((s) => ({
      step: s.step,
      completed: false,
    }));

    const task = await prisma.taskEngine.create({
      data: {
        sopId,
        assignedTo,
        assignedBy: assignedBy || "u-mgr-01",
        taskTitle,
        checklistProgress: JSON.stringify(initialProgress),
        status: "TODO",
        dueDate: new Date(dueDate),
      },
      include: {
        sop: true,
        assignee: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Gagal membuat tiket tugas operasional." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, checklistProgress, status } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Parameter taskId wajib disertakan." },
        { status: 400 }
      );
    }

    const currentTask = await prisma.taskEngine.findUnique({
      where: { id: taskId },
      include: { sop: true },
    });

    if (!currentTask) {
      return NextResponse.json(
        { error: "Tugas operasional tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    let activeProgressList: { step: number; completed: boolean }[] = [];
    if (checklistProgress) {
      activeProgressList =
        typeof checklistProgress === "string"
          ? JSON.parse(checklistProgress)
          : checklistProgress;
      updateData.checklistProgress = JSON.stringify(activeProgressList);
    } else {
      try {
        activeProgressList = JSON.parse(currentTask.checklistProgress);
      } catch {
        activeProgressList = [];
      }
    }

    // PRD 7.2 Enforcement:
    // Task cannot be completed unless ALL checklist steps are marked completed: true
    if (status === "COMPLETED") {
      const allStepsCompleted =
        activeProgressList.length > 0 &&
        activeProgressList.every((step) => step.completed === true);

      if (!allStepsCompleted) {
        return NextResponse.json(
          {
            error:
              "Kepatuhan SOP: Tugas tidak dapat diselesaikan karena masih ada langkah checklist SOP yang belum dicentang.",
            incompleteSteps: activeProgressList.filter((s) => !s.completed),
          },
          { status: 400 }
        );
      }

      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
    } else if (status) {
      updateData.status = status;
      if (status !== "COMPLETED") {
        updateData.completedAt = null;
      }
    }

    const updatedTask = await prisma.taskEngine.update({
      where: { id: taskId },
      data: updateData,
      include: {
        sop: true,
        assignee: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status tugas operasional." },
      { status: 500 }
    );
  }
}
