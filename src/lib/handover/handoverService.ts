import { prisma } from "@/lib/prisma";

export interface HandoverResult {
  success: boolean;
  resignedUserId: string;
  resignedUserName: string;
  successorUserId: string;
  successorUserName: string;
  tasksTransferred: number;
  sopsTransferred: number;
  executionMs: number;
  message: string;
}

export async function executeAutomatedHandover(
  resignedUserId: string,
  successorUserId: string
): Promise<HandoverResult> {
  const startTime = Date.now();

  if (resignedUserId === successorUserId) {
    throw new Error("Staf yang resign dan staf pengganti tidak boleh orang yang sama.");
  }

  const [resignedUser, successorUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: resignedUserId } }),
    prisma.user.findUnique({ where: { id: successorUserId } }),
  ]);

  if (!resignedUser) {
    throw new Error(`Karyawan dengan ID ${resignedUserId} tidak ditemukan.`);
  }
  if (!successorUser) {
    throw new Error(`Karyawan penerima dengan ID ${successorUserId} tidak ditemukan.`);
  }

  // Atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Find all active/in-progress tasks of resigned user
    const activeTasks = await tx.taskEngine.findMany({
      where: {
        assignedTo: resignedUserId,
        status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] },
      },
    });

    // 2. Reassign active tasks to successor
    const taskUpdateResult = await tx.taskEngine.updateMany({
      where: {
        assignedTo: resignedUserId,
        status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] },
      },
      data: {
        assignedTo: successorUserId,
      },
    });

    // 3. Reassign ownership of SOPs created/managed by resigned user
    const sopUpdateResult = await tx.masterSop.updateMany({
      where: {
        createdBy: resignedUserId,
      },
      data: {
        createdBy: successorUserId,
      },
    });

    // 4. Mark resigned user status
    await tx.user.update({
      where: { id: resignedUserId },
      data: { isResigned: true },
    });

    const executionMs = Date.now() - startTime;

    // 5. Log audit handover
    await tx.handoverLog.create({
      data: {
        resignedUserId,
        successorUserId,
        tasksTransferred: taskUpdateResult.count,
        sopsTransferred: sopUpdateResult.count,
        executionMs,
        status: "SUCCESS",
      },
    });

    return {
      tasksTransferred: taskUpdateResult.count,
      sopsTransferred: sopUpdateResult.count,
      executionMs,
    };
  });

  return {
    success: true,
    resignedUserId,
    resignedUserName: resignedUser.name,
    successorUserId,
    successorUserName: successorUser.name,
    tasksTransferred: result.tasksTransferred,
    sopsTransferred: result.sopsTransferred,
    executionMs: result.executionMs,
    message: `Handover berhasil diselesaikan dalam ${result.executionMs} ms (${result.tasksTransferred} tugas aktif & ${result.sopsTransferred} SOP dialihkan).`,
  };
}
