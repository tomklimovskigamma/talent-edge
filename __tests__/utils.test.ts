import { describe, it, expect } from "vitest";
import { scorePercentile, scorePercentileLabel } from "@/lib/utils";
import type { Candidate } from "@/lib/data/candidates";

const stub = (stage: string, potentialScore: number): Candidate =>
  ({
    id: potentialScore.toString(),
    name: "Test",
    university: "Test",
    degree: "Test",
    graduationYear: 2025,
    stage: stage as Candidate["stage"],
    appliedDate: "2025-01-01",
    daysInStage: 1,
    potentialScore,
    dimensions: { adaptability: 75, cognitiveAgility: 75, emotionalIntelligence: 75, collaboration: 75, drive: 75 },
    assessmentHistory: [],
    avatarInitials: "T",
  } as Candidate);

// Cohort: 5 assessed+ candidates (92, 88, 85, 90, 80) + 1 Applied (70, excluded)
const cohort = [
  stub("Assessed",    92),
  stub("Shortlisted", 88),
  stub("Interview",   85),
  stub("Offer",       90),
  stub("Hired",       80),
  stub("Applied",     70), // must be excluded from ranking
];

describe("scorePercentile", () => {
  it("returns Top 1% for the highest scorer (no one above)", () => {
    // aboveCount=0 → Math.max(1, round(0/142*100)) = 1
    expect(scorePercentile(92, cohort)).toBe("Top 1% of cohort");
  });

  it("returns Top 1% for a score above everyone in the cohort", () => {
    expect(scorePercentile(99, cohort)).toBe("Top 1% of cohort");
  });

  it("excludes Applied-stage candidates from ranking", () => {
    // score 80: assessed+ above = [92, 88, 85, 90] = 4
    // Math.max(1, round(4/142*100)) = Math.max(1, round(2.82)) = 3
    expect(scorePercentile(80, cohort)).toBe("Top 3% of cohort");
  });

  it("counts correctly for a mid-range score", () => {
    // score 85: assessed+ above = [92, 88, 90] = 3
    // Math.max(1, round(3/142*100)) = Math.max(1, round(2.11)) = 2
    expect(scorePercentile(85, cohort)).toBe("Top 2% of cohort");
  });

  it("returns Top 1% minimum even for the lowest scorer", () => {
    const single = [stub("Assessed", 80)];
    expect(scorePercentile(80, single)).toBe("Top 1% of cohort");
  });
});

describe("scorePercentileLabel", () => {
  it("returns null for Applied-stage candidates", () => {
    const applied = stub("Applied", 90);
    expect(scorePercentileLabel(applied, cohort)).toBeNull();
  });

  it("returns a Top N% label for Assessed+ candidates", () => {
    const assessed = stub("Assessed", 85);
    expect(scorePercentileLabel(assessed, cohort)).toBe("Top 2% of cohort");
  });
});
