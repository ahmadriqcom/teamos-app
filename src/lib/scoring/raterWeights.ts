/**
 * TeamOS Rater Relationship Weight Matrix & Dynamic Re-weighting
 * PRD Section 3.2
 */

export type RaterRole = "MGR" | "PEER" | "CROSS" | "CLI";

export interface AspectRaterWeights {
  MGR: number;
  PEER: number;
  CROSS: number;
  CLI: number;
}

export const BASELINE_RATER_WEIGHTS: Record<string, AspectRaterWeights> = {
  ASP_KS: { MGR: 0.3, PEER: 0.4, CROSS: 0.3, CLI: 0.0 },
  ASP_KB: { MGR: 0.6, PEER: 0.2, CROSS: 0.2, CLI: 0.0 },
  ASP_KR: { MGR: 0.35, PEER: 0.35, CROSS: 0.15, CLI: 0.15 },
  ASP_SK: { MGR: 0.4, PEER: 0.2, CROSS: 0.2, CLI: 0.2 },
};

/**
 * Returns normalized weights for a given aspect based on whether client feedback exists.
 * If hasClient is false:
 * CLI weight is redistributed: 60% to MGR and 40% to CROSS.
 */
export function getEffectiveRaterWeights(
  aspectCode: string,
  hasClient: boolean
): AspectRaterWeights {
  const base = BASELINE_RATER_WEIGHTS[aspectCode] || {
    MGR: 0.4,
    PEER: 0.3,
    CROSS: 0.3,
    CLI: 0.0,
  };

  if (hasClient || base.CLI === 0) {
    return { ...base };
  }

  // CLI weight reallocation: 60% to MGR, 40% to CROSS
  const cliWeight = base.CLI;
  const mgrExtra = cliWeight * 0.6;
  const crossExtra = cliWeight * 0.4;

  return {
    MGR: Number((base.MGR + mgrExtra).toFixed(4)),
    PEER: base.PEER,
    CROSS: Number((base.CROSS + crossExtra).toFixed(4)),
    CLI: 0,
  };
}
