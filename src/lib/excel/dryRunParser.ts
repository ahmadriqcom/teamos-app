import ExcelJS from "exceljs";

export interface ParsedBarsQuestion {
  aspectCode: string;
  targetRole: string;
  questionCode: string;
  scenarioQuestion: string;
  level1Desc: string;
  level2Desc: string;
  level3Desc: string;
  level4Desc: string;
  level5Desc: string;
  rowNumber: number;
}

export interface DryRunError {
  row: number;
  column: string;
  error_code: string;
  message: string;
}

export interface DryRunSuccessResult {
  status: "VALIDATION_SUCCESS";
  total_rows_parsed: number;
  error_count: 0;
  preview_summary: {
    by_aspect: Record<string, number>;
    by_role: Record<string, number>;
  };
  temporary_session_id: string;
  parsed_questions: ParsedBarsQuestion[];
}

export interface DryRunFailureResult {
  status: "VALIDATION_FAILED";
  total_rows_parsed: number;
  error_count: number;
  errors: DryRunError[];
}

export type DryRunResult = DryRunSuccessResult | DryRunFailureResult;

// In-memory session store for validated dry-runs before publish
export const dryRunSessions = new Map<
  string,
  {
    questions: ParsedBarsQuestion[];
    createdAt: number;
  }
>();

const VALID_ASPECTS = new Set(["ASP_KS", "ASP_KB", "ASP_KR", "ASP_SK"]);
const VALID_ROLES = new Set(["MGR", "PEER", "CROSS", "CLI"]);

export async function parseAndDryRunExcel(
  fileBuffer: Buffer
): Promise<DryRunResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  // Find 'Questions' sheet or first sheet
  const sheet = workbook.getWorksheet("Questions") || workbook.worksheets[0];
  if (!sheet) {
    return {
      status: "VALIDATION_FAILED",
      total_rows_parsed: 0,
      error_count: 1,
      errors: [
        {
          row: 1,
          column: "Sheet",
          error_code: "ERR_MISSING_SHEET",
          message: "Lembar kerja 'Questions' tidak ditemukan dalam berkas Excel.",
        },
      ],
    };
  }

  const errors: DryRunError[] = [];
  const parsedQuestions: ParsedBarsQuestion[] = [];
  const seenQuestionCodes = new Set<string>();

  // Stage 1: Structural Check (Row 1 Header Validation)
  const expectedHeaders = [
    "aspect_code",
    "target_role",
    "question_code",
    "scenario_question",
    "level_1_behavior",
    "level_2_behavior",
    "level_3_behavior",
    "level_4_behavior",
    "level_5_behavior",
  ];

  const headerRow = sheet.getRow(1);
  for (let colIdx = 0; colIdx < expectedHeaders.length; colIdx++) {
    const val = String(headerRow.getCell(colIdx + 1).value || "")
      .trim()
      .toLowerCase();
    if (val !== expectedHeaders[colIdx]) {
      errors.push({
        row: 1,
        column: expectedHeaders[colIdx],
        error_code: "ERR_HEADER_MISMATCH",
        message: `Header kolom ${colIdx + 1} harus '${expectedHeaders[colIdx]}' (ditemukan: '${val}').`,
      });
    }
  }

  // Iterate over data rows
  let rowCount = 0;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const getVal = (col: number) => {
      const cellVal = row.getCell(col).value;
      if (cellVal === null || cellVal === undefined) return "";
      if (typeof cellVal === "object" && "text" in cellVal) {
        return String((cellVal as { text: string }).text).trim();
      }
      return String(cellVal).trim();
    };

    const aspectCode = getVal(1).toUpperCase();
    const targetRole = getVal(2).toUpperCase();
    const questionCode = getVal(3).toUpperCase();
    const scenarioQuestion = getVal(4);
    const level1 = getVal(5);
    const level2 = getVal(6);
    const level3 = getVal(7);
    const level4 = getVal(8);
    const level5 = getVal(9);

    // If whole row is empty, skip
    if (
      !aspectCode &&
      !targetRole &&
      !questionCode &&
      !scenarioQuestion &&
      !level1 &&
      !level2 &&
      !level3 &&
      !level4 &&
      !level5
    ) {
      return;
    }

    rowCount++;

    // Stage 3: Code Constraint Check
    if (!aspectCode) {
      errors.push({
        row: rowNumber,
        column: "aspect_code",
        error_code: "ERR_EMPTY_FIELD",
        message: "Kode aspek tidak boleh kosong.",
      });
    } else if (!VALID_ASPECTS.has(aspectCode)) {
      errors.push({
        row: rowNumber,
        column: "aspect_code",
        error_code: "ERR_INVALID_CODE",
        message: `Kode aspek '${aspectCode}' tidak terdaftar pada Master Aspek (Pilihan: ASP_KS, ASP_KB, ASP_KR, ASP_SK).`,
      });
    }

    if (!targetRole) {
      errors.push({
        row: rowNumber,
        column: "target_role",
        error_code: "ERR_EMPTY_FIELD",
        message: "Target peran rater tidak boleh kosong.",
      });
    } else if (!VALID_ROLES.has(targetRole)) {
      errors.push({
        row: rowNumber,
        column: "target_role",
        error_code: "ERR_INVALID_CODE",
        message: `Target peran '${targetRole}' tidak valid (Pilihan: MGR, PEER, CROSS, CLI).`,
      });
    }

    if (!questionCode) {
      errors.push({
        row: rowNumber,
        column: "question_code",
        error_code: "ERR_EMPTY_FIELD",
        message: "Kode butir soal (question_code) tidak boleh kosong.",
      });
    } else if (seenQuestionCodes.has(questionCode)) {
      errors.push({
        row: rowNumber,
        column: "question_code",
        error_code: "ERR_DUPLICATE_CODE",
        message: `Kode butir soal '${questionCode}' duplikat di baris ini.`,
      });
    } else {
      seenQuestionCodes.add(questionCode);
    }

    if (!scenarioQuestion) {
      errors.push({
        row: rowNumber,
        column: "scenario_question",
        error_code: "ERR_EMPTY_FIELD",
        message: "Narasi skenario pertanyaan tidak boleh kosong.",
      });
    }

    // Stage 2: Value Boundary Check (Level 1-5)
    const levels = [
      { col: "level_1_behavior", val: level1, lvl: 1 },
      { col: "level_2_behavior", val: level2, lvl: 2 },
      { col: "level_3_behavior", val: level3, lvl: 3 },
      { col: "level_4_behavior", val: level4, lvl: 4 },
      { col: "level_5_behavior", val: level5, lvl: 5 },
    ];

    levels.forEach((lvlItem) => {
      if (!lvlItem.val) {
        errors.push({
          row: rowNumber,
          column: lvlItem.col,
          error_code: "ERR_EMPTY_FIELD",
          message: `Deskripsi perilaku level ${lvlItem.lvl} tidak boleh kosong.`,
        });
      }
    });

    parsedQuestions.push({
      aspectCode,
      targetRole,
      questionCode,
      scenarioQuestion,
      level1Desc: level1,
      level2Desc: level2,
      level3Desc: level3,
      level4Desc: level4,
      level5Desc: level5,
      rowNumber,
    });
  });

  if (rowCount === 0) {
    errors.push({
      row: 2,
      column: "general",
      error_code: "ERR_EMPTY_DATASET",
      message: "Berkas Excel tidak memiliki baris data pertanyaan BARS yang valid.",
    });
  }

  // If errors encountered, return failure
  if (errors.length > 0) {
    return {
      status: "VALIDATION_FAILED",
      total_rows_parsed: rowCount,
      error_count: errors.length,
      errors,
    };
  }

  // Stage 4: Balance Matrix Check & Aggregation
  const byAspect: Record<string, number> = {
    ASP_KS: 0,
    ASP_KB: 0,
    ASP_KR: 0,
    ASP_SK: 0,
  };
  const byRole: Record<string, number> = {
    MGR: 0,
    PEER: 0,
    CROSS: 0,
    CLI: 0,
  };

  parsedQuestions.forEach((q) => {
    byAspect[q.aspectCode] = (byAspect[q.aspectCode] || 0) + 1;
    byRole[q.targetRole] = (byRole[q.targetRole] || 0) + 1;
  });

  // Stage 5: Session generation
  const sessionId = `dry_session_${Math.random().toString(36).substring(2, 10)}`;
  dryRunSessions.set(sessionId, {
    questions: parsedQuestions,
    createdAt: Date.now(),
  });

  // Clean old sessions (> 1 hour)
  const now = Date.now();
  for (const [key, sess] of dryRunSessions.entries()) {
    if (now - sess.createdAt > 3600000) {
      dryRunSessions.delete(key);
    }
  }

  return {
    status: "VALIDATION_SUCCESS",
    total_rows_parsed: rowCount,
    error_count: 0,
    preview_summary: {
      by_aspect: byAspect,
      by_role: byRole,
    },
    temporary_session_id: sessionId,
    parsed_questions: parsedQuestions,
  };
}
