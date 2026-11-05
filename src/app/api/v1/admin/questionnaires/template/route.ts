import { NextResponse } from "next/server";
import { generateBarsMatrixTemplate } from "@/lib/excel/templateBuilder";

export async function GET() {
  try {
    const buffer = await generateBarsMatrixTemplate();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="bars_matrix_template.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error generating Excel template:", error);
    return NextResponse.json(
      { error: "Gagal membuat template Excel BARS." },
      { status: 500 }
    );
  }
}
