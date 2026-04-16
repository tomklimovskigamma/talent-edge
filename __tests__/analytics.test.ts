// __tests__/analytics.test.ts
import { describe, it, expect } from "vitest";
import type { Candidate } from "@/lib/data/candidates";
import type { StageName } from "@/lib/data/program";
import {
  computeFunnelMetrics,
  computeScoreDistByTrack,
  computeTimeInStage,
  computeScoreBandBreakdown,
} from "@/lib/analytics";

const stub = (overrides: Partial<Candidate>): Candidate =>
  ({
    id: "x",
    name: "T",
    university: "U",
    degree: "B. Finance",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-01-01",
    daysInStage: 5,
    potentialScore: 75,
    dimensions: {
      adaptability: 75, cognitiveAgility: 75, emotionalIntelligence: 75, collaboration: 75, drive: 75,
    },
    assessmentHistory: [],
    avatarInitials: "T",
    ...overrides,
  } as Candidate);

describe("computeFunnelMetrics", () => {
  it("first stage has retainedPct === 100", () => {
    const counts: Record<StageName, number> = {
      Applied: 200, Assessed: 150, Shortlisted: 80, Interview: 40, Offer: 20, Hired: 10, Rejected: 0,
    };
    const result = computeFunnelMetrics(counts);
    expect(result[0].retainedPct).toBe(100);
  });

  it("percentages are integers and monotonically non-increasing", () => {
    const counts: Record<StageName, number> = {
      Applied: 200, Assessed: 150, Shortlisted: 80, Interview: 40, Offer: 20, Hired: 10, Rejected: 0,
    };
    const result = computeFunnelMetrics(counts);
    for (const r of result) expect(Number.isInteger(r.retainedPct)).toBe(true);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].retainedPct).toBeLessThanOrEqual(result[i - 1].retainedPct);
    }
  });

  it("excludes Rejected from output", () => {
    const counts: Record<StageName, number> = {
      Applied: 10, Assessed: 8, Shortlisted: 6, Interview: 4, Offer: 2, Hired: 1, Rejected: 99,
    };
    const result = computeFunnelMetrics(counts);
    expect(result.find((r) => r.stage === "Rejected")).toBeUndefined();
    expect(result).toHaveLength(6);
  });
});

describe("computeScoreDistByTrack", () => {
  it("excludes Applied candidates", () => {
    const cohort = [
      stub({ stage: "Applied", degree: "B. Finance", potentialScore: 90 }),
      stub({ stage: "Hired", degree: "B. Finance", potentialScore: 90 }),
    ];
    const result = computeScoreDistByTrack(cohort);
    const finance = result.find((r) => r.track === "Finance")!;
    expect(finance.high).toBe(1);
    expect(finance.emerging).toBe(0);
    expect(finance.developing).toBe(0);
  });

  it("returns exactly three tracks, each with zero counts when empty", () => {
    const result = computeScoreDistByTrack([]);
    expect(result.map((r) => r.track).sort()).toEqual(
      ["Finance", "People & Culture", "Technology"]
    );
    for (const r of result) {
      expect(r.high + r.emerging + r.developing).toBe(0);
    }
  });

  it("partitions bands at 65 and 80", () => {
    const cohort = [
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 64 }),
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 65 }),
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 79 }),
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 80 }),
    ];
    const finance = computeScoreDistByTrack(cohort).find((r) => r.track === "Finance")!;
    expect(finance.developing).toBe(1);
    expect(finance.emerging).toBe(2);
    expect(finance.high).toBe(1);
  });

  it("excludes Other-track candidates", () => {
    const cohort = [
      stub({ stage: "Hired", degree: "B. Medicine", potentialScore: 95 }),
      stub({ stage: "Hired", degree: "B. Finance", potentialScore: 95 }),
    ];
    const result = computeScoreDistByTrack(cohort);
    const total = result.reduce((s, r) => s + r.high + r.emerging + r.developing, 0);
    expect(total).toBe(1);
  });
});

describe("computeTimeInStage", () => {
  it("averages daysInStage per current stage", () => {
    const cohort = [
      stub({ stage: "Assessed", daysInStage: 10 }),
      stub({ stage: "Assessed", daysInStage: 20 }),
      stub({ stage: "Interview", daysInStage: 5 }),
    ];
    const result = computeTimeInStage(cohort);
    const assessed = result.find((r) => r.stage === "Assessed")!;
    const interview = result.find((r) => r.stage === "Interview")!;
    expect(assessed.avgDays).toBe(15);
    expect(interview.avgDays).toBe(5);
  });

  it("omits stages with zero members", () => {
    const cohort = [stub({ stage: "Assessed", daysInStage: 4 })];
    const result = computeTimeInStage(cohort);
    expect(result.find((r) => r.stage === "Offer")).toBeUndefined();
    expect(result.find((r) => r.stage === "Hired")).toBeUndefined();
  });
});

describe("computeScoreBandBreakdown", () => {
  it("partitions at 65 and 80, excluding Applied candidates", () => {
    const cohort = [
      stub({ stage: "Applied",   potentialScore: 95 }),
      stub({ stage: "Assessed",  potentialScore: 64 }),
      stub({ stage: "Assessed",  potentialScore: 65 }),
      stub({ stage: "Assessed",  potentialScore: 79 }),
      stub({ stage: "Hired",     potentialScore: 80 }),
    ];
    const result = computeScoreBandBreakdown(cohort);
    const byBand = Object.fromEntries(result.map((r) => [r.band, r.count]));
    expect(byBand["Developing"]).toBe(1);
    expect(byBand["Emerging"]).toBe(2);
    expect(byBand["High Potential"]).toBe(1);
  });

  it("always returns exactly three bands", () => {
    expect(computeScoreBandBreakdown([])).toHaveLength(3);
  });
});
