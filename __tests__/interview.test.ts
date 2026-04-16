// __tests__/interview.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  BLANK_SCORECARD,
  getScorecard,
  saveScorecard,
  __resetScorecardStore,
  type Scorecard,
} from "@/lib/interview";

beforeEach(() => {
  __resetScorecardStore();
});

describe("getScorecard", () => {
  it("returns a blank scorecard for unseen candidate ids", () => {
    expect(getScorecard("unknown")).toEqual(BLANK_SCORECARD);
  });

  it("returns a fresh copy (not the shared BLANK_SCORECARD reference)", () => {
    const card = getScorecard("unknown");
    card.notes = "mutated";
    expect(BLANK_SCORECARD.notes).toBe("");
  });
});

describe("saveScorecard", () => {
  it("round-trips a stored scorecard", () => {
    const card: Scorecard = {
      communication: 4,
      culturalFit: 5,
      problemSolving: 3,
      overallImpression: 4,
      notes: "Strong communicator, thoughtful answers.",
      recommendation: "advance",
    };
    saveScorecard("c001", card);
    expect(getScorecard("c001")).toEqual(card);
  });

  it("isolates stores by candidate id", () => {
    saveScorecard("c001", { ...BLANK_SCORECARD, communication: 5 });
    saveScorecard("c002", { ...BLANK_SCORECARD, communication: 1 });
    expect(getScorecard("c001").communication).toBe(5);
    expect(getScorecard("c002").communication).toBe(1);
  });

  it("clones input so later mutations do not leak into the store", () => {
    const card: Scorecard = { ...BLANK_SCORECARD, notes: "original" };
    saveScorecard("c001", card);
    card.notes = "mutated";
    expect(getScorecard("c001").notes).toBe("original");
  });

  it("clones output so consumer mutations do not leak into the store", () => {
    saveScorecard("c001", { ...BLANK_SCORECARD, notes: "kept" });
    const fetched = getScorecard("c001");
    fetched.notes = "leaked";
    expect(getScorecard("c001").notes).toBe("kept");
  });
});
