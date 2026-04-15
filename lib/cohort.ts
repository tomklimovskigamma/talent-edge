// lib/cohort.ts
import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";
import { dimensionLabels } from "@/lib/data/candidates";
import type { StageName } from "@/lib/data/program";

export const ASSESSED_PLUS_STAGES: ReadonlySet<StageName> = new Set<StageName>([
  "Assessed",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
]);

export type Track = "Finance" | "Technology" | "People & Culture" | "Other";

const TRACK_KEYWORDS: { track: Exclude<Track, "Other">; patterns: string[] }[] = [
  { track: "Finance", patterns: ["finance", "commerce", "economics", "accounting", "business"] },
  { track: "Technology", patterns: ["engineering", "computer", "software", "data", "information technology", " it"] },
  { track: "People & Culture", patterns: ["psychology", "human resources", "hr", "arts", "sociology", "education"] },
];

export function classifyTrack(degree: string): Track {
  const lower = ` ${degree.toLowerCase()} `;
  for (const { track, patterns } of TRACK_KEYWORDS) {
    if (patterns.some((p) => lower.includes(p))) return track;
  }
  return "Other";
}

const DIM_KEYS: (keyof PotentialDimensions)[] = [
  "adaptability",
  "cognitiveAgility",
  "emotionalIntelligence",
  "collaboration",
  "drive",
];

function assessedPlus(candidates: Candidate[]): Candidate[] {
  return candidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
}

export function computeDimensionAverages(
  candidates: Candidate[]
): Record<keyof PotentialDimensions, number> {
  const pool = assessedPlus(candidates);
  const out = {} as Record<keyof PotentialDimensions, number>;
  for (const key of DIM_KEYS) {
    const sum = pool.reduce((acc, c) => acc + c.dimensions[key], 0);
    out[key] = pool.length === 0 ? 0 : Math.round(sum / pool.length);
  }
  return out;
}

type DimInsight = {
  dim: keyof PotentialDimensions;
  label: string;
  average: number;
  gap: number;
};

export function strongestDimension(
  averages: Record<keyof PotentialDimensions, number>
): DimInsight {
  const sorted = [...DIM_KEYS].sort((a, b) => averages[b] - averages[a]);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  return {
    dim: top,
    label: dimensionLabels[top],
    average: averages[top],
    gap: averages[top] - averages[bottom],
  };
}

export function weakestDimension(
  averages: Record<keyof PotentialDimensions, number>
): DimInsight {
  const sorted = [...DIM_KEYS].sort((a, b) => averages[a] - averages[b]);
  const bottom = sorted[0];
  const top = sorted[sorted.length - 1];
  return {
    dim: bottom,
    label: dimensionLabels[bottom],
    average: averages[bottom],
    gap: averages[top] - averages[bottom],
  };
}

export function computeTrackAverages(
  candidates: Candidate[]
): Record<Exclude<Track, "Other">, number> {
  const pool = assessedPlus(candidates);
  const out: Record<Exclude<Track, "Other">, number> = {
    Finance: 0,
    Technology: 0,
    "People & Culture": 0,
  };
  for (const track of ["Finance", "Technology", "People & Culture"] as const) {
    const members = pool.filter((c) => classifyTrack(c.degree) === track);
    if (members.length === 0) continue;
    const sum = members.reduce((acc, c) => acc + c.potentialScore, 0);
    out[track] = Math.round(sum / members.length);
  }
  return out;
}
