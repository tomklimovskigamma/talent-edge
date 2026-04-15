import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Candidate } from "@/lib/data/candidates";
import type { StageName } from "@/lib/data/program";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-800";
  if (score >= 65) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "High Potential";
  if (score >= 65) return "Emerging";
  return "Developing";
}

export function stageColor(stage: string): string {
  const map: Record<string, string> = {
    Applied: "bg-slate-100 text-slate-700",
    Assessed: "bg-blue-100 text-blue-700",
    Shortlisted: "bg-violet-100 text-violet-700",
    Interview: "bg-amber-100 text-amber-700",
    Offer: "bg-orange-100 text-orange-700",
    Hired: "bg-emerald-100 text-emerald-700",
  };
  return map[stage] ?? "bg-slate-100 text-slate-700";
}

const ASSESSED_PLUS_STAGES: ReadonlySet<StageName> = new Set<StageName>(["Assessed", "Shortlisted", "Interview", "Offer", "Hired"]);
const FULL_COHORT_SIZE = 142;

export function scorePercentile(score: number, allCandidates: Candidate[]): string {
  const assessed = allCandidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
  const aboveCount = assessed.filter((c) => c.potentialScore > score).length;
  const percentile = Math.max(1, Math.round((aboveCount / FULL_COHORT_SIZE) * 100));
  return `Top ${percentile}% of cohort`;
}
