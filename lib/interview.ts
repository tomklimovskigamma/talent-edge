// lib/interview.ts
export type Recommendation = "advance" | "hold" | "decline";

export type Scorecard = {
  communication: number; // 0–5; 0 means unset
  culturalFit: number;
  problemSolving: number;
  overallImpression: number;
  notes: string;
  recommendation: Recommendation | null;
};

export const BLANK_SCORECARD: Scorecard = {
  communication: 0,
  culturalFit: 0,
  problemSolving: 0,
  overallImpression: 0,
  notes: "",
  recommendation: null,
};

const store = new Map<string, Scorecard>();

function clone(card: Scorecard): Scorecard {
  return { ...card };
}

export function getScorecard(candidateId: string): Scorecard {
  const stored = store.get(candidateId);
  return stored ? clone(stored) : clone(BLANK_SCORECARD);
}

export function saveScorecard(candidateId: string, card: Scorecard): void {
  store.set(candidateId, clone(card));
}

// Test-only: reset the in-memory store between tests.
export function __resetScorecardStore(): void {
  store.clear();
}
