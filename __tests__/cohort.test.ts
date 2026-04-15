// __tests__/cohort.test.ts
import { describe, it, expect } from "vitest";
import type { Candidate } from "@/lib/data/candidates";
import {
  classifyTrack,
  computeDimensionAverages,
  strongestDimension,
  weakestDimension,
  computeTrackAverages,
} from "@/lib/cohort";

const stub = (overrides: Partial<Candidate>): Candidate =>
  ({
    id: "x",
    name: "Test",
    university: "Test Uni",
    degree: "B. Commerce (Finance)",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-01-01",
    daysInStage: 1,
    potentialScore: 80,
    dimensions: {
      adaptability: 80,
      cognitiveAgility: 80,
      emotionalIntelligence: 80,
      collaboration: 80,
      drive: 80,
    },
    assessmentHistory: [],
    avatarInitials: "T",
    ...overrides,
  } as Candidate);

describe("classifyTrack", () => {
  it("classifies Finance degrees", () => {
    expect(classifyTrack("B. Commerce (Finance)")).toBe("Finance");
    expect(classifyTrack("Bachelor of Economics")).toBe("Finance");
    expect(classifyTrack("B. Business (Accounting)")).toBe("Finance");
  });

  it("classifies Technology degrees", () => {
    expect(classifyTrack("B. Software Engineering")).toBe("Technology");
    expect(classifyTrack("B. Computer Science")).toBe("Technology");
    expect(classifyTrack("B. Information Technology")).toBe("Technology");
  });

  it("classifies People & Culture degrees", () => {
    expect(classifyTrack("B. Psychology")).toBe("People & Culture");
    expect(classifyTrack("B. Arts (Sociology)")).toBe("People & Culture");
    expect(classifyTrack("B. Human Resources")).toBe("People & Culture");
  });

  it("prefers Finance when a degree matches both Finance and Technology keywords", () => {
    expect(classifyTrack("B. Commerce (Data Analytics)")).toBe("Finance");
  });

  it("returns Other for unrecognised degrees", () => {
    expect(classifyTrack("B. Medicine")).toBe("Other");
  });

  it("is case-insensitive", () => {
    expect(classifyTrack("B. FINANCE")).toBe("Finance");
  });
});

describe("computeDimensionAverages", () => {
  it("averages dimensions across assessed+ candidates only", () => {
    const cohort = [
      stub({ stage: "Assessed", dimensions: { adaptability: 80, cognitiveAgility: 70, emotionalIntelligence: 60, collaboration: 90, drive: 50 } }),
      stub({ stage: "Hired", dimensions: { adaptability: 70, cognitiveAgility: 80, emotionalIntelligence: 60, collaboration: 70, drive: 50 } }),
      stub({ stage: "Applied", dimensions: { adaptability: 10, cognitiveAgility: 10, emotionalIntelligence: 10, collaboration: 10, drive: 10 } }),
    ];
    const avgs = computeDimensionAverages(cohort);
    expect(avgs.adaptability).toBe(75);
    expect(avgs.cognitiveAgility).toBe(75);
    expect(avgs.emotionalIntelligence).toBe(60);
    expect(avgs.collaboration).toBe(80);
    expect(avgs.drive).toBe(50);
  });
});

describe("strongestDimension / weakestDimension", () => {
  const avgs = {
    adaptability: 75,
    cognitiveAgility: 75,
    emotionalIntelligence: 60,
    collaboration: 87,
    drive: 71,
  };

  it("strongestDimension returns the highest with label and gap to weakest", () => {
    const s = strongestDimension(avgs);
    expect(s.dim).toBe("collaboration");
    expect(s.label).toBe("Collaboration");
    expect(s.average).toBe(87);
    expect(s.gap).toBe(27);
  });

  it("weakestDimension returns the lowest with label and gap to strongest", () => {
    const w = weakestDimension(avgs);
    expect(w.dim).toBe("emotionalIntelligence");
    expect(w.label).toBe("Emotional Intelligence");
    expect(w.average).toBe(60);
    expect(w.gap).toBe(27);
  });
});

describe("computeTrackAverages", () => {
  it("averages potentialScore per track, excluding Applied and Other", () => {
    const cohort = [
      stub({ stage: "Assessed", degree: "B. Commerce (Finance)", potentialScore: 84 }),
      stub({ stage: "Hired", degree: "B. Economics", potentialScore: 84 }),
      stub({ stage: "Interview", degree: "B. Software Engineering", potentialScore: 79 }),
      stub({ stage: "Offer", degree: "B. Psychology", potentialScore: 76 }),
      stub({ stage: "Applied", degree: "B. Finance", potentialScore: 10 }),
      stub({ stage: "Hired", degree: "B. Medicine", potentialScore: 99 }),
    ];
    const t = computeTrackAverages(cohort);
    expect(t.Finance).toBe(84);
    expect(t.Technology).toBe(79);
    expect(t["People & Culture"]).toBe(76);
  });

  it("returns 0 for a track with no matching candidates", () => {
    const cohort = [stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 80 })];
    const t = computeTrackAverages(cohort);
    expect(t.Technology).toBe(0);
    expect(t["People & Culture"]).toBe(0);
  });
});
