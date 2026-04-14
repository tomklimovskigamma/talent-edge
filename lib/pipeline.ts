// lib/pipeline.ts
import { type StageName } from "@/lib/data/program";

const stageOrder: StageName[] = [
  "Applied",
  "Assessed",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
];

export function getNextStage(current: StageName): StageName | null {
  const idx = stageOrder.indexOf(current);
  if (idx === -1 || idx === stageOrder.length - 1) return null;
  return stageOrder[idx + 1];
}
