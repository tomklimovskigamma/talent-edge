// __tests__/pipeline.test.ts
import { describe, it, expect } from "vitest";
import { getNextStage } from "@/lib/pipeline";

describe("getNextStage", () => {
  it("Applied → Assessed", () => {
    expect(getNextStage("Applied")).toBe("Assessed");
  });

  it("Assessed → Shortlisted", () => {
    expect(getNextStage("Assessed")).toBe("Shortlisted");
  });

  it("Shortlisted → Interview", () => {
    expect(getNextStage("Shortlisted")).toBe("Interview");
  });

  it("Interview → Offer", () => {
    expect(getNextStage("Interview")).toBe("Offer");
  });

  it("Offer → Hired", () => {
    expect(getNextStage("Offer")).toBe("Hired");
  });

  it("Hired → null (no next stage)", () => {
    expect(getNextStage("Hired")).toBeNull();
  });
});
