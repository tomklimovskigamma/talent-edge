// lib/analytics.ts
import type { Candidate } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { ASSESSED_PLUS_STAGES, classifyTrack } from "@/lib/cohort";

export type Track = "Finance" | "Technology" | "People & Culture";

export type FunnelMetric = { stage: StageName; count: number; retainedPct: number };
export type TrackScoreDist = { track: Track; high: number; emerging: number; developing: number };
export type TimeInStage = { stage: StageName; avgDays: number };
export type ScoreBand = { band: "High Potential" | "Emerging" | "Developing"; count: number; color: string };

const BAND_COLORS = {
  high: "#10B981",       // emerald-500
  emerging: "#F59E0B",   // amber-500
  developing: "#F43F5E", // rose-500
};

function assessedPlus(candidates: Candidate[]): Candidate[] {
  return candidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
}

function bandFor(score: number): "high" | "emerging" | "developing" {
  if (score >= 80) return "high";
  if (score >= 65) return "emerging";
  return "developing";
}

export function computeFunnelMetrics(counts: Record<StageName, number>): FunnelMetric[] {
  const firstCount = counts[stages[0].label] || 1; // avoid /0
  return stages.map((s) => ({
    stage: s.label,
    count: counts[s.label],
    retainedPct: Math.round((counts[s.label] / firstCount) * 100),
  }));
}

export function computeScoreDistByTrack(candidates: Candidate[]): TrackScoreDist[] {
  const pool = assessedPlus(candidates);
  const tracks: Track[] = ["Finance", "Technology", "People & Culture"];
  return tracks.map((track) => {
    const members = pool.filter((c) => classifyTrack(c.degree) === track);
    let high = 0, emerging = 0, developing = 0;
    for (const c of members) {
      const b = bandFor(c.potentialScore);
      if (b === "high") high++;
      else if (b === "emerging") emerging++;
      else developing++;
    }
    return { track, high, emerging, developing };
  });
}

export function computeTimeInStage(candidates: Candidate[]): TimeInStage[] {
  const out: TimeInStage[] = [];
  for (const s of stages) {
    const members = candidates.filter((c) => c.stage === s.label);
    if (members.length === 0) continue;
    const sum = members.reduce((acc, c) => acc + c.daysInStage, 0);
    out.push({ stage: s.label, avgDays: Math.round(sum / members.length) });
  }
  return out;
}

export function computeScoreBandBreakdown(candidates: Candidate[]): ScoreBand[] {
  const pool = assessedPlus(candidates);
  let high = 0, emerging = 0, developing = 0;
  for (const c of pool) {
    const b = bandFor(c.potentialScore);
    if (b === "high") high++;
    else if (b === "emerging") emerging++;
    else developing++;
  }
  return [
    { band: "High Potential", count: high, color: BAND_COLORS.high },
    { band: "Emerging", count: emerging, color: BAND_COLORS.emerging },
    { band: "Developing", count: developing, color: BAND_COLORS.developing },
  ];
}
