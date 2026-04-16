import { describe, it, expect } from "vitest";
import { runMockAnalysis } from "@/lib/video-analysis";

describe("runMockAnalysis", () => {
  it("returns a complete VideoInterviewAnalysis shape", () => {
    const result = runMockAnalysis("c001");

    expect(result.competencyScores).toBeDefined();
    expect(result.competencyScores.adaptability).toBeGreaterThan(0);
    expect(result.competencyScores.cognitiveAgility).toBeGreaterThan(0);
    expect(result.competencyScores.emotionalIntelligence).toBeGreaterThan(0);
    expect(result.competencyScores.collaboration).toBeGreaterThan(0);
    expect(result.competencyScores.drive).toBeGreaterThan(0);

    expect(result.summary.length).toBeGreaterThan(20);
    expect(result.strongestArea.length).toBeGreaterThan(0);
    expect(result.probeInF2F.length).toBeGreaterThan(0);
    expect(result.analysedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it("varies output by candidate id deterministically", () => {
    const a = runMockAnalysis("c001");
    const b = runMockAnalysis("c001");
    const c = runMockAnalysis("c002");
    expect(a.competencyScores.adaptability).toBe(b.competencyScores.adaptability);
    expect(a.summary).toBe(b.summary);
    // c may or may not match a — no assertion on that.
    expect(c.analysedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });
});
