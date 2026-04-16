// __tests__/development.test.ts
import { describe, it, expect } from "vitest";
import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";
import {
  generateDevelopmentGoals,
  INDUCTION_GOAL,
  DEVELOPMENT_ACTIVITIES,
  LEVERAGE_ACTIVITIES,
} from "@/lib/development";

const baseDimensions: PotentialDimensions = {
  adaptability: 80,
  cognitiveAgility: 80,
  emotionalIntelligence: 80,
  collaboration: 80,
  drive: 80,
};

const stub = (overrides: Partial<Candidate>): Candidate =>
  ({
    id: "hire",
    name: "Test",
    university: "U",
    degree: "D",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-01-01",
    daysInStage: 1,
    potentialScore: 85,
    dimensions: baseDimensions,
    assessmentHistory: [],
    avatarInitials: "T",
    startDate: "2026-03-01",
    ...overrides,
  } as Candidate);

describe("generateDevelopmentGoals", () => {
  it("returns [] when startDate is missing", () => {
    const c = stub({ startDate: undefined });
    expect(generateDevelopmentGoals(c)).toEqual([]);
  });

  it("returns exactly 5 goals for a Hired candidate with a startDate", () => {
    expect(generateDevelopmentGoals(stub({}))).toHaveLength(5);
  });

  it("first goal is the induction goal", () => {
    const goals = generateDevelopmentGoals(stub({}));
    expect(goals[0].title).toBe(INDUCTION_GOAL.title);
  });

  it("targets the three weakest dimensions for goals 2–4", () => {
    const c = stub({
      dimensions: {
        adaptability: 90,
        cognitiveAgility: 85,
        emotionalIntelligence: 55,
        collaboration: 70,
        drive: 75,
      },
    });
    const goals = generateDevelopmentGoals(c);
    expect(goals[1].title).toBe(DEVELOPMENT_ACTIVITIES.emotionalIntelligence.low.title);
    expect(goals[2].title).toBe(DEVELOPMENT_ACTIVITIES.collaboration.mid.title);
    expect(goals[3].title).toBe(DEVELOPMENT_ACTIVITIES.drive.mid.title);
  });

  it("last goal is the leverage activity for the strongest dimension", () => {
    const c = stub({
      dimensions: {
        adaptability: 95,
        cognitiveAgility: 60,
        emotionalIntelligence: 62,
        collaboration: 70,
        drive: 75,
      },
    });
    const goals = generateDevelopmentGoals(c);
    expect(goals[4].title).toBe(LEVERAGE_ACTIVITIES.adaptability.title);
  });

  it("selects low band for scores < 65 and mid band for scores 65–79", () => {
    const c = stub({
      dimensions: {
        adaptability: 50,
        cognitiveAgility: 70,
        emotionalIntelligence: 78,
        collaboration: 85,
        drive: 90,
      },
    });
    const goals = generateDevelopmentGoals(c);
    expect(goals[1].title).toBe(DEVELOPMENT_ACTIVITIES.adaptability.low.title);
    expect(goals[2].title).toBe(DEVELOPMENT_ACTIVITIES.cognitiveAgility.mid.title);
    expect(goals[3].title).toBe(DEVELOPMENT_ACTIVITIES.emotionalIntelligence.mid.title);
  });

  it("due dates equal startDate + offsetDays (YYYY-MM-DD)", () => {
    const goals = generateDevelopmentGoals(stub({ startDate: "2026-03-01" }));
    expect(goals[0].dueDate).toBe("2026-03-15");
  });

  it("all goals are seeded 'not-started'", () => {
    for (const g of generateDevelopmentGoals(stub({}))) {
      expect(g.status).toBe("not-started");
    }
  });
});
