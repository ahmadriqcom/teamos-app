/**
 * TeamOS Scoring Engine - Trimmed Mean
 * PRD Section 5.1:
 * "Bila jumlah penilai m >= 4 dalam kelompok rater yang sama, 1 nilai tertinggi
 * dan 1 nilai terendah dipangkas otomatis."
 */

export interface TrimmedMeanResult {
  rawScores: number[];
  trimmedScores: number[];
  wasTrimmed: boolean;
  score: number;
}

export function calculateTrimmedMean(scores: number[]): TrimmedMeanResult {
  if (!scores || scores.length === 0) {
    return {
      rawScores: [],
      trimmedScores: [],
      wasTrimmed: false,
      score: 0,
    };
  }

  if (scores.length < 4) {
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = Number((sum / scores.length).toFixed(2));
    return {
      rawScores: [...scores],
      trimmedScores: [...scores],
      wasTrimmed: false,
      score: avg,
    };
  }

  // m >= 4: Trim 1 highest and 1 lowest
  const sorted = [...scores].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, sorted.length - 1);
  const sum = trimmed.reduce((acc, curr) => acc + curr, 0);
  const avg = Number((sum / trimmed.length).toFixed(2));

  return {
    rawScores: scores,
    trimmedScores: trimmed,
    wasTrimmed: true,
    score: avg,
  };
}
