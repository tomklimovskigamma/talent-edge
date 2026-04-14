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

  it("uses the Assessed stage history entry date, not the last history entry", () => {
    const hiredCandidate: Candidate = {
      ...candidate,
      stage: "Hired",
      assessmentHistory: [
        { date: "2026-01-01", stage: "Applied", note: "Applied." },
        { date: "2026-01-10", stage: "Assessed", note: "Assessed." },
        { date: "2026-02-01", stage: "Shortlisted", note: "Shortlisted." },
        { date: "2026-03-01", stage: "Hired", note: "Hired." },
      ],
    };
    const report = generateFeedbackReport(hiredCandidate);
    expect(report.assessmentDate).toBe("2026-01-10"); // assessed date, NOT "2026-03-01"
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

  it("returns assessment link next steps for Applied candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Applied" });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/assessment/i);
  });

  it("returns interview scheduling next steps for Shortlisted candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Shortlisted" });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/interview/i);
  });

  it("returns debrief next steps for Interview-stage candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Interview" });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/debrief/i);
  });

  it("returns offer/hire next steps for Hired candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Hired" });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/offer/i);
  });

  it("potentialLabel matches the score band", () => {
    const report = generateFeedbackReport({ ...candidate, potentialScore: 89 });
    expect(report.potentialLabel).toBe("High Potential");
  });

  it("uses developing interpretation for a low-scoring dimension", () => {
    const lowCandidate: Candidate = {
      ...candidate,
      dimensions: { adaptability: 50, cognitiveAgility: 55, emotionalIntelligence: 48, collaboration: 60, drive: 52 },
      potentialScore: 53,
    };
    const report = generateFeedbackReport(lowCandidate);
    // All dimensions are below 65, so interpretation should use developing tier language
    expect(report.strengths[0].interpretation).toMatch(/development area|structured practice|deliberate|proactive|stretch goals/i);
  });
});
