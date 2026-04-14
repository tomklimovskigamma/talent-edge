// __tests__/keepwarm.test.ts
import { describe, it, expect } from "vitest";
import { generateKeepWarmFeed } from "@/lib/keepwarm";
import type { Candidate } from "@/lib/data/candidates";

const hiredCandidate: Candidate = {
  id: "test-hired",
  name: "Grace Halliday",
  university: "Test University",
  degree: "B. Science",
  graduationYear: 2025,
  stage: "Hired",
  appliedDate: "2025-03-01",
  daysInStage: 12,
  potentialScore: 91,
  avatarInitials: "GH",
  startDate: "2026-05-19",
  assessmentHistory: [
    { date: "2025-03-01", stage: "Applied", note: "Applied." },
    { date: "2025-04-08", stage: "Hired", note: "Accepted." },
  ],
  dimensions: {
    adaptability: 93,
    cognitiveAgility: 90,
    emotionalIntelligence: 95,
    collaboration: 92,
    drive: 88,
  },
};

describe("generateKeepWarmFeed", () => {
  it("returns exactly 5 events", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events).toHaveLength(5);
  });

  it("first event is offer-sent on hire date", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[0].id).toBe("offer-sent");
    expect(events[0].date).toBe("2025-04-08");
  });

  it("welcome-video is 2 days after hire date", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[1].id).toBe("welcome-video");
    expect(events[1].date).toBe("2025-04-10");
  });

  it("team-intro is 7 days after hire date", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[2].id).toBe("team-intro");
    expect(events[2].date).toBe("2025-04-15");
  });

  it("countdown-30 is 30 days before start date", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[3].id).toBe("countdown-30");
    expect(events[3].date).toBe("2026-04-19");
  });

  it("onboarding-checklist is 14 days before start date", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[4].id).toBe("onboarding-checklist");
    expect(events[4].date).toBe("2026-05-05");
  });

  it("past events have status sent", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[0].status).toBe("sent");
    expect(events[1].status).toBe("sent");
    expect(events[2].status).toBe("sent");
  });

  it("event within 14 days is scheduled", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    // countdown-30 is 2026-04-19 = 5 days away
    expect(events[3].status).toBe("scheduled");
  });

  it("event more than 14 days away is upcoming", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    // onboarding-checklist is 2026-05-05 = 21 days away
    expect(events[4].status).toBe("upcoming");
  });

  it("welcome-video description includes candidate's first name", () => {
    const events = generateKeepWarmFeed(hiredCandidate, "2026-04-14");
    expect(events[1].description).toContain("Grace");
  });
});
