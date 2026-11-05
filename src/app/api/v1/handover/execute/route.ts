import { NextRequest, NextResponse } from "next/server";
import { executeAutomatedHandover } from "@/lib/handover/handoverService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resignedUserId, successorUserId } = body;

    if (!resignedUserId || !successorUserId) {
      return NextResponse.json(
        { error: "Parameter 'resignedUserId' dan 'successorUserId' wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await executeAutomatedHandover(resignedUserId, successorUserId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Handover error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan internal saat mengeksekusi automated handover.",
      },
      { status: 400 }
    );
  }
}
