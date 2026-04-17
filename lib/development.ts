// lib/development.ts
import type { Candidate, DevelopmentGoal, PotentialDimensions } from "@/lib/data/candidates";

type DimKey = keyof PotentialDimensions;
type Activity = { title: string; offsetDays: number };

export const INDUCTION_GOAL: Activity = {
  title: "Complete 2026 induction program",
  offsetDays: 14,
};

export const DEVELOPMENT_ACTIVITIES: Record<DimKey, { low: Activity; mid: Activity }> = {
  adaptability: {
    low: { title: "Rotate through three business units in the first six months", offsetDays: 120 },
    mid: { title: "Shadow a senior leader during a change initiative", offsetDays: 75 },
  },
  cognitiveAgility: {
    low: { title: "Complete structured problem-solving course (e.g. McKinsey Problem Solving)", offsetDays: 90 },
    mid: { title: "Pair with a mentor on a cross-domain analytical project", offsetDays: 60 },
  },
  emotionalIntelligence: {
    low: { title: "Enrol in a facilitated EQ workshop and coaching follow-ups", offsetDays: 60 },
    mid: { title: "Seek 360° feedback after three months and review with mentor", offsetDays: 90 },
  },
  collaboration: {
    low: { title: "Join a cross-functional peer group — monthly sessions", offsetDays: 30 },
    mid: { title: "Co-lead a team initiative with a peer from another track", offsetDays: 75 },
  },
  drive: {
    low: { title: "Pair with a mentor to define quarterly stretch targets", offsetDays: 45 },
    mid: { title: "Identify an extracurricular stretch goal and review quarterly", offsetDays: 60 },
  },
};

export const LEVERAGE_ACTIVITIES: Record<DimKey, Activity> = {
  adaptability: { title: "Champion a new-process pilot within the first six months", offsetDays: 90 },
  cognitiveAgility: { title: "Lead a problem-framing workshop for the next cohort", offsetDays: 120 },
  emotionalIntelligence: { title: "Mentor an incoming graduate in the 2027 cohort", offsetDays: 150 },
  collaboration: { title: "Facilitate a cross-team retro or kick-off session", offsetDays: 75 },
  drive: { title: "Propose and scope a stretch initiative for quarterly review", offsetDays: 90 },
};

function toGoal(activity: Activity, offset: (days: number) => string): DevelopmentGoal {
  return {
    title: activity.title,
    status: "not-started",
    dueDate: offset(activity.offsetDays),
  };
}

export function generateDevelopmentGoals(candidate: Candidate): DevelopmentGoal[] {
  if (!candidate.startDate) return [];

  const start = new Date(candidate.startDate);
  const offset = (days: number): string => {
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const ranked = (Object.entries(candidate.dimensions) as [DimKey, number][])
    .sort((a, b) => a[1] - b[1]);

  const weakest = ranked.slice(0, 3);
  const strongest = ranked[ranked.length - 1];

  const goals: DevelopmentGoal[] = [toGoal(INDUCTION_GOAL, offset)];

  for (const [dim, score] of weakest) {
    const band: "low" | "mid" = score < 65 ? "low" : "mid";
    goals.push(toGoal(DEVELOPMENT_ACTIVITIES[dim][band], offset));
  }

  goals.push(toGoal(LEVERAGE_ACTIVITIES[strongest[0]], offset));

  return goals;
}
