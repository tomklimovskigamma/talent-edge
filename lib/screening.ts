import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";

const strengthDescriptions: Record<keyof PotentialDimensions, string> = {
  adaptability: "capacity to adapt through change",
  cognitiveAgility: "speed of learning and reasoning under uncertainty",
  emotionalIntelligence: "emotional intelligence and interpersonal awareness",
  collaboration: "collaborative instinct and team elevation",
  drive: "drive and self-imposed ambition",
};

const dimensionNames: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};

function percentileText(score: number): string {
  if (score >= 90) return "top 5%";
  if (score >= 85) return "top 15%";
  if (score >= 80) return "top 30%";
  if (score >= 75) return "top 45%";
  if (score >= 65) return "above average";
  return "below the cohort average";
}

export type Recommendation = {
  text: string;
  variant: "advance" | "review" | "hold";
};

export type ScreeningSummary = {
  text: string;
  recommendation: Recommendation;
};

export function generateScreeningSummary(candidate: Candidate): ScreeningSummary {
  const { dimensions, potentialScore, name } = candidate;
  const firstName = name.split(" ")[0];

  const sorted = (Object.entries(dimensions) as [keyof PotentialDimensions, number][])
    .sort((a, b) => b[1] - a[1]);

  const top1 = sorted[0][0];
  const top2 = sorted[1][0];
  const bottom = sorted[sorted.length - 1][0];

  const percentile = percentileText(potentialScore);
  const cohortPhrase =
    potentialScore >= 65
      ? `place them in the ${percentile} of assessed candidates`
      : `place them ${percentile}`;

  const text =
    `${firstName}'s ${strengthDescriptions[top1]} and ${strengthDescriptions[top2]} ` +
    `${cohortPhrase}. ${dimensionNames[bottom]} is an area for development.`;

  const recommendation: Recommendation =
    potentialScore >= 80
      ? { text: "Recommended for progression", variant: "advance" }
      : potentialScore >= 65
      ? { text: "Review before progressing", variant: "review" }
      : { text: "Not recommended for progression", variant: "hold" };

  return { text, recommendation };
}
