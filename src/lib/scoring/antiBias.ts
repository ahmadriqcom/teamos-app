/**
 * TeamOS Anti-Bias & Anomaly Filter Engine
 * PRD Section 5.2:
 * 1. Straight-Lining detection (uniform answers >= 80% on level 1 or level 5)
 * 2. Mandatory Evidence verification (>= 50 chars for Level 1 & Level 5)
 */

export interface AnswerInput {
  questionId: string;
  selectedLevel: number;
  evidenceText?: string | null;
}

export interface AntiBiasValidationResult {
  isValid: boolean;
  isFlaggedAnomaly: boolean;
  anomalyReason?: string;
  validationErrors: { questionId: string; message: string }[];
}

export function validateAntiBiasSubmission(answers: AnswerInput[]): AntiBiasValidationResult {
  const validationErrors: { questionId: string; message: string }[] = [];

  if (!answers || answers.length === 0) {
    return {
      isValid: false,
      isFlaggedAnomaly: false,
      validationErrors: [{ questionId: "general", message: "Jawaban kuisioner tidak boleh kosong." }],
    };
  }

  // 1. Mandatory Evidence Rule (Level 1 and Level 5 require >= 50 characters)
  for (const ans of answers) {
    if (ans.selectedLevel === 1 || ans.selectedLevel === 5) {
      const text = ans.evidenceText ? ans.evidenceText.trim() : "";
      if (text.length < 50) {
        validationErrors.push({
          questionId: ans.questionId,
          message: `Pilihan Level ${ans.selectedLevel} wajib menyertakan catatan bukti insiden konkret minimal 50 karakter (saat ini ${text.length} karakter).`,
        });
      }
    }
  }

  // 2. Straight-Lining Anomaly Rule
  // Detect if >= 80% answers are identical level 1 or level 5
  const total = answers.length;
  const countL1 = answers.filter((a) => a.selectedLevel === 1).length;
  const countL5 = answers.filter((a) => a.selectedLevel === 5).length;

  let isFlaggedAnomaly = false;
  let anomalyReason: string | undefined;

  if (total >= 4) {
    if (countL5 / total >= 0.8) {
      isFlaggedAnomaly = true;
      anomalyReason = `Flagged: Low Effort / Suspicious (Pola Straight-Lining Level 5 terdeteksi: ${(
        (countL5 / total) *
        100
      ).toFixed(0)}% seragam)`;
    } else if (countL1 / total >= 0.8) {
      isFlaggedAnomaly = true;
      anomalyReason = `Flagged: Low Effort / Suspicious (Pola Straight-Lining Level 1 terdeteksi: ${(
        (countL1 / total) *
        100
      ).toFixed(0)}% seragam)`;
    }
  }

  return {
    isValid: validationErrors.length === 0,
    isFlaggedAnomaly,
    anomalyReason,
    validationErrors,
  };
}
