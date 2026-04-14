import { describe, it, expect } from "vitest";
import { generateScreeningSummary } from "@/lib/screening";
import type { Candidate } from "@/lib/data/candidates";

// Candidate with clear non-tied scores for deterministic assertions
const candidate: Candidate = {
  id: "test-1",
  name: "Jordan Lee",
  university: "Test University",
  degree: "B. Commerce",
  graduationYear: 2026,
  stage: "Assessed",
  appliedDate: "2026-01-01",
  daysInStage: 1,
  potentialScore: 89,
  avatarInitials: "JL",
  assessmentHistory: [],
  dimensions: {
    adaptability: 70,           // bottom
    cognitiveAgility: 90,       // top 2
    emotionalIntelligence: 75,
    collaboration: 95,          // top 1
    drive: 80,
  },
};

describe("generateScreeningSummary", () => {
  it("uses the candidate's first name only", () => {
    const result = generateScreeningSummary(candidate);
    expect(result.text).toContain("Jordan");
    expect(result.text).not.toContain("Lee");
  });

  it("mentions the top two dimensions in the summary text", () => {
    const result = generateScreeningSummary(candidate);
    // collaboration (95) and cognitiveAgility (90) are top 2
    expect(result.text).toContain("collaborative instinct and team elevation");
    expect(result.text).toContain("speed of learning and reasoning under uncertainty");
  });

  it("names the weakest dimension as a development area", () => {
    const result = generateScreeningSummary(candidate);
    // adaptability (70) is the bottom
    expect(result.text).toContain("Adaptability");
    expect(result.text).toContain("development");
  });

  it("returns advance recommendation for score >= 80", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 80 });
    expect(result.recommendation.variant).toBe("advance");
    expect(result.recommendation.text).toBe("Recommended for progression");
  });

  it("returns review recommendation for score 65–79", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 72 });
    expect(result.recommendation.variant).toBe("review");
    expect(result.recommendation.text).toBe("Review before progressing");
  });

  it("returns hold recommendation for score < 65", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 60 });
    expect(result.recommendation.variant).toBe("hold");
    expect(result.recommendation.text).toBe("Not recommended for progression");
  });

  it("includes a cohort percentile phrase for high scorers", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 89 });
    expect(result.text).toContain("top 15%");
  });

  it("returns review recommendation at the lower boundary (score 65)", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 65 });
    expect(result.recommendation.variant).toBe("review");
  });

  it("returns hold recommendation just below the lower boundary (score 64)", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 64 });
    expect(result.recommendation.variant).toBe("hold");
  });

  it("uses a different cohort phrase for below-average candidates (score < 65)", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 60 });
    expect(result.text).toContain("below the cohort average");
    expect(result.text).not.toContain("of assessed candidates");
  });
});
