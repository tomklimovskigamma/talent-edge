import type { VideoInterviewAnalysis, PotentialDimensions } from "@/lib/data/candidates";

// Demo-safe mock analyser. Deterministic per candidate id so repeat demos look identical.
// Real Whisper + Claude pipeline lives behind a feature flag in Task 8.

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function scoreIn(min: number, max: number, seed: number): number {
  return min + (seed % (max - min + 1));
}

export function runMockAnalysis(candidateId: string): VideoInterviewAnalysis {
  const seed = hashString(candidateId);

  const scores: PotentialDimensions = {
    adaptability: scoreIn(72, 94, seed),
    cognitiveAgility: scoreIn(70, 96, seed + 1),
    emotionalIntelligence: scoreIn(68, 92, seed + 2),
    collaboration: scoreIn(74, 93, seed + 3),
    drive: scoreIn(75, 95, seed + 4),
  };

  const sorted = (Object.entries(scores) as [keyof PotentialDimensions, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const strongestKey = sorted[0][0];
  const weakestKey = sorted[4][0];

  const strongestLabels: Record<keyof PotentialDimensions, string> = {
    adaptability: "Adaptability",
    cognitiveAgility: "Cognitive Agility",
    emotionalIntelligence: "Emotional Intelligence",
    collaboration: "Collaboration",
    drive: "Drive",
  };

  const summary =
    `Across the three responses, the candidate demonstrated clear reasoning and structured thinking. ` +
    `Their answers showed specific examples rather than generalities, and they navigated ambiguity ` +
    `in the second question with confidence. Strongest signal came through in ${strongestLabels[strongestKey]}.`;

  const probeMap: Record<keyof PotentialDimensions, string> = {
    adaptability: "Ask about a time they had to abandon a plan entirely — not just adjust it.",
    cognitiveAgility: "Probe how they know when they have enough information to decide.",
    emotionalIntelligence: "Explore how they handle feedback they disagree with.",
    collaboration: "Ask when they've chosen not to share something with their team, and why.",
    drive: "Probe what they do when motivation runs out — the discipline question.",
  };

  return {
    competencyScores: scores,
    summary,
    strongestArea: strongestLabels[strongestKey],
    probeInF2F: probeMap[weakestKey],
    analysedAt: new Date().toISOString(),
  };
}

export type AnalysisMode = "mock" | "real";

export function getAnalysisMode(): AnalysisMode {
  // Client-safe env var only — NEXT_PUBLIC_*.
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_VIDEO_ANALYSIS_MODE === "real") {
    return "real";
  }
  return "mock";
}

export async function runAnalysis(candidateId: string): Promise<VideoInterviewAnalysis> {
  // Interview completion seeds mock scores; live Whisper analysis runs on-demand
  // from the profile panel's "Analyse with AI" button (see VideoInterviewPanel).
  return runMockAnalysis(candidateId);
}
