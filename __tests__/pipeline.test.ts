// __tests__/pipeline.test.ts
import { describe, it, expect } from "vitest";
import { getNextStage } from "@/lib/pipeline";
import type { Candidate } from "@/lib/data/candidates";
import { filterCandidates } from "@/lib/pipeline";

describe("getNextStage", () => {
  it("Applied → Assessed", () => {
    expect(getNextStage("Applied")).toBe("Assessed");
  });

  it("Assessed → Shortlisted", () => {
    expect(getNextStage("Assessed")).toBe("Shortlisted");
  });

  it("Shortlisted → Video Interview", () => {
    expect(getNextStage("Shortlisted")).toBe("Video Interview");
  });

  it("Video Interview → Interview", () => {
    expect(getNextStage("Video Interview")).toBe("Interview");
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

// Minimal stubs — only the fields filterCandidates actually reads
const stub = (overrides: Partial<Candidate>): Candidate =>
  ({
    id: "x",
    name: "Test User",
    university: "Test University",
    degree: "B. Test",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-01-01",
    daysInStage: 1,
    potentialScore: 75,
    dimensions: { adaptability: 75, cognitiveAgility: 75, emotionalIntelligence: 75, collaboration: 75, drive: 75 },
    assessmentHistory: [],
    avatarInitials: "TU",
    ...overrides,
  } as Candidate);

const alice  = stub({ id: "a", name: "Alice Brown",   university: "UNSW",               degree: "B. Commerce",              potentialScore: 85 });
const bob    = stub({ id: "b", name: "Bob Zhang",     university: "University of Melb",  degree: "B. Engineering",           potentialScore: 72 });
const carla  = stub({ id: "c", name: "Carla Nguyen",  university: "Monash University",   degree: "B. Science (Psychology)",  potentialScore: 60 });
const all    = [alice, bob, carla];

const atLow   = stub({ id: "d", name: "Low Edge",  potentialScore: 65 });  // emerging lower boundary
const atHigh  = stub({ id: "e", name: "High Edge", potentialScore: 79 });  // emerging upper boundary
const atFloor = stub({ id: "f", name: "Floor",     potentialScore: 80 });  // high lower boundary

describe("filterCandidates", () => {
  it("returns all candidates when search is empty and band is all", () => {
    expect(filterCandidates(all, "", "all")).toEqual(all);
  });

  it("filters by name (case-insensitive)", () => {
    expect(filterCandidates(all, "alice", "all")).toEqual([alice]);
    expect(filterCandidates(all, "ALICE", "all")).toEqual([alice]);
  });

  it("filters by university (case-insensitive substring)", () => {
    expect(filterCandidates(all, "monash", "all")).toEqual([carla]);
  });

  it("filters by degree (case-insensitive substring)", () => {
    expect(filterCandidates(all, "engineering", "all")).toEqual([bob]);
  });

  it("returns empty array when no candidates match search", () => {
    expect(filterCandidates(all, "zzz", "all")).toEqual([]);
  });

  it("high band keeps only potentialScore >= 80", () => {
    expect(filterCandidates(all, "", "high")).toEqual([alice]);
  });

  it("emerging band keeps potentialScore 65–79 inclusive", () => {
    expect(filterCandidates(all, "", "emerging")).toEqual([bob]);
  });

  it("applies both search and band together", () => {
    expect(filterCandidates(all, "engineering", "emerging")).toEqual([bob]);
    expect(filterCandidates(all, "alice", "emerging")).toEqual([]);
  });

  it("trims whitespace from search string", () => {
    expect(filterCandidates(all, "  alice  ", "all")).toEqual([alice]);
  });

  it("emerging band includes potentialScore === 65 (lower boundary)", () => {
    expect(filterCandidates([atLow], "", "emerging")).toEqual([atLow]);
  });

  it("emerging band includes potentialScore === 79 (upper boundary)", () => {
    expect(filterCandidates([atHigh], "", "emerging")).toEqual([atHigh]);
  });

  it("high band includes potentialScore === 80 (lower boundary)", () => {
    expect(filterCandidates([atFloor], "", "high")).toEqual([atFloor]);
  });
});
