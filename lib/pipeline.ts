// lib/pipeline.ts
import { type StageName } from "@/lib/data/program";
import type { Candidate } from "@/lib/data/candidates";

const stageOrder = [
  "Applied",
  "Assessed",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
] as const satisfies readonly StageName[];

export function getNextStage(current: StageName): StageName | null {
  const idx = stageOrder.indexOf(current as (typeof stageOrder)[number]);
  if (idx === -1 || idx === stageOrder.length - 1) return null;
  return stageOrder[idx + 1];
}

export type ScoreBand = "all" | "high" | "emerging";

export function filterCandidates(
  candidates: Candidate[],
  search: string,
  scoreBand: ScoreBand
): Candidate[] {
  const q = search.trim().toLowerCase();
  return candidates.filter((c) => {
    if (scoreBand === "high" && c.potentialScore < 80) return false;
    if (scoreBand === "emerging" && (c.potentialScore < 65 || c.potentialScore >= 80)) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.university.toLowerCase().includes(q) ||
      c.degree.toLowerCase().includes(q)
    );
  });
}
