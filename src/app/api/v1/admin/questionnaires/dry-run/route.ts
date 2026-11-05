import { NextRequest, NextResponse } from "next/server";
import { parseAndDryRunExcel } from "@/lib/excel/dryRunParser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          status: "VALIDATION_FAILED",
          total_rows_parsed: 0,
          error_count: 1,
          errors: [
            {
              row: 0,
              column: "file",
              error_code: "ERR_NO_FILE",
              message: "Berkas template Excel BARS wajib diunggah.",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Size limit check: 5MB (PRD 4.2 Stage 2)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          status: "VALIDATION_FAILED",
          total_rows_parsed: 0,
          error_count: 1,
          errors: [
            {
              row: 0,
              column: "file",
              error_code: "ERR_FILE_TOO_LARGE",
              message: "Ukuran berkas melebihi batas maksimal 5 MB.",
            },
          ],
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseAndDryRunExcel(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dry-run parsing error:", error);
    return NextResponse.json(
      {
        status: "VALIDATION_FAILED",
        total_rows_parsed: 0,
        error_count: 1,
        errors: [
          {
            row: 0,
            column: "file",
            error_code: "ERR_PARSER_EXCEPTION",
            message:
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan internal saat memproses berkas Excel.",
          },
        ],
      },
      { status: 500 }
    );
  }
}
