import { describe, it, expect } from "vitest";
import { generateFeedbackReport } from "@/lib/report";
import type { Candidate } from "@/lib/data/candidates";

const candidate: Candidate = {
  id: "test-1",
  name: "Jordan Lee",
  university: "University of Melbourne",
  degree: "B. Commerce (Finance)",
  graduationYear: 2026,
  stage: "Assessed",
  appliedDate: "2026-01-01",
  daysInStage: 1,
  potentialScore: 89,
  avatarInitials: "JL",
  assessmentHistory: [
    { date: "2026-01-01", stage: "Applied", note: "Applied." },
    { date: "2026-01-10", stage: "Assessed", note: "Assessed." },
  ],
  dimensions: {
    adaptability: 70,
    cognitiveAgility: 90,
    emotionalIntelligence: 75,
    collaboration: 95,
    drive: 80,
  },
};

describe("generateFeedbackReport", () => {
  it("includes the candidate name and potential score", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.candidateName).toBe("Jordan Lee");
    expect(report.potentialScore).toBe(89);
  });

  it("uses the most recent assessment history date as assessmentDate", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.assessmentDate).toBe("2026-01-10");
  });

  it("falls back to appliedDate when assessmentHistory is empty", () => {
    const report = generateFeedbackReport({ ...candidate, assessmentHistory: [] });
    expect(report.assessmentDate).toBe("2026-01-01");
  });

  it("strengths contains the top two dimensions", () => {
    const report = generateFeedbackReport(candidate);
    const strengthKeys = report.strengths.map((s) => s.key);
    expect(strengthKeys).toContain("collaboration");
    expect(strengthKeys).toContain("cognitiveAgility");
  });

  it("developmentArea is the lowest scoring dimension", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.developmentArea.key).toBe("adaptability");
  });

  it("developmentArea includes a development suggestion", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.developmentArea.developmentSuggestion).toBeTruthy();
    expect(typeof report.developmentArea.developmentSuggestion).toBe("string");
  });

  it("returns shortlisting next steps for high-scoring Assessed candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Assessed", potentialScore: 85 });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/shortlist/i);
  });

  it("returns review next steps for emerging Assessed candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Assessed", potentialScore: 72 });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/review/i);
  });

  it("returns not-recommended next steps for developing Assessed candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Assessed", potentialScore: 60 });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/not recommended/i);
  });

  it("each strength has a label, score, and non-empty interpretation", () => {
    const report = generateFeedbackReport(candidate);
    for (const strength of report.strengths) {
      expect(strength.label).toBeTruthy();
      expect(typeof strength.score).toBe("number");
      expect(strength.interpretation.length).toBeGreaterThan(20);
    }
  });
});
