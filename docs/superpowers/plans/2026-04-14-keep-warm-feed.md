# Keep Warm Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Keep Warm Feed" timeline to hired candidate profiles showing 5 automated touchpoints from offer acceptance to start date — visible to admins only, directly targeting the Grad-Engage competitive positioning.

**Architecture:** Pure logic lives in `lib/keepwarm.ts` — it derives 5 timed events from a candidate's hire date and start date and stamps each with a status (`sent`, `scheduled`, or `upcoming`) relative to today. A client component `KeepWarmFeed` renders the timeline using the same vertical connector pattern as `AssessmentTimeline`. The `Candidate` type gains an optional `startDate` field; three hired candidates in the demo data get distinct start dates so that different profiles show different status mixes. Each task produces a passing build.

**Tech Stack:** TypeScript, vitest (already configured), React 19 client components, lucide-react, Tailwind v4, existing `usePersona` hook from `lib/persona.tsx`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/data/candidates.ts` | Modify | Add `startDate?: string` to `Candidate` type; populate for c004, c011, c018 |
| `lib/keepwarm.ts` | Create | Pure `generateKeepWarmFeed(candidate, today?)` function + exported types |
| `__tests__/keepwarm.test.ts` | Create | 10 unit tests for event dates, statuses, and description content |
| `components/profile/KeepWarmFeed.tsx` | Create | Admin-only, Hired-only client component rendering the 5-event timeline |
| `app/candidates/[id]/page.tsx` | Modify | Import and render `<KeepWarmFeed candidate={candidate} />` below the grid |

---

### Task 1: Add `startDate` to Candidate type and demo data

**Files:**
- Modify: `lib/data/candidates.ts`

Three hired candidates get distinct start dates so clicking through profiles shows different status mixes during the demo:
- **c004 Liam O'Brien** — start date `2026-02-23` (past; all 5 events show as "Sent")
- **c011 Grace Halliday** — start date `2026-05-19` (future; events 1-3 Sent, event 4 Scheduled, event 5 Upcoming)
- **c018 Ethan Brooks** — start date `2026-06-02` (further future; events 1-3 Sent, events 4-5 Upcoming)

- [ ] **Step 1: Add `startDate?: string` to the `Candidate` type**

In `lib/data/candidates.ts`, find the `Candidate` type definition and add the optional field after `avatarInitials`:

```ts
export type Candidate = {
  id: string;
  name: string;
  university: string;
  degree: string;
  graduationYear: number;
  stage: StageName;
  appliedDate: string;
  daysInStage: number;
  potentialScore: number;
  dimensions: PotentialDimensions;
  assessmentHistory: AssessmentEvent[];
  developmentGoals?: DevelopmentGoal[];
  avatarInitials: string;
  startDate?: string;
};
```

- [ ] **Step 2: Add `startDate` to c004 (Liam O'Brien)**

Find candidate `c004` and add `startDate: "2026-02-23"` directly after `avatarInitials: "LO"`:

```ts
  {
    id: "c004",
    name: "Liam O'Brien",
    // ... existing fields ...
    avatarInitials: "LO",
    startDate: "2026-02-23",
    // ... rest of candidate ...
  },
```

- [ ] **Step 3: Add `startDate` to c011 (Grace Halliday) and update hire note**

Find candidate `c011` and add `startDate: "2026-05-19"` after `avatarInitials: "GH"`. Also update the Hired assessment history note to match:

```ts
  {
    id: "c011",
    name: "Grace Halliday",
    // ... existing fields ...
    avatarInitials: "GH",
    startDate: "2026-05-19",
    assessmentHistory: [
      { date: "2025-03-01", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-09", stage: "Assessed", note: "Score: 91. Exceptional EQ." },
      { date: "2025-03-17", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-24", stage: "Interview", note: "Outstanding interview." },
      { date: "2025-03-31", stage: "Offer", note: "Offer made." },
      { date: "2025-04-08", stage: "Hired", note: "Accepted. Start date: 19 May 2026." },
    ],
    // ... rest of candidate ...
  },
```

- [ ] **Step 4: Add `startDate` to c018 (Ethan Brooks) and update hire note**

Find candidate `c018` and add `startDate: "2026-06-02"` after `avatarInitials: "EB"`. Also update the Hired note:

```ts
  {
    id: "c018",
    name: "Ethan Brooks",
    // ... existing fields ...
    avatarInitials: "EB",
    startDate: "2026-06-02",
    assessmentHistory: [
      { date: "2025-02-25", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-05", stage: "Assessed", note: "Score: 89. Top 10% of cohort." },
      { date: "2025-03-13", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-20", stage: "Interview", note: "Excellent panel interview." },
      { date: "2025-03-28", stage: "Offer", note: "Offer made." },
      { date: "2025-04-05", stage: "Hired", note: "Accepted. Start date: 2 Jun 2026." },
    ],
    // ... rest of candidate ...
  },
```

- [ ] **Step 5: Run build to confirm no type errors**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build
```

Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git add lib/data/candidates.ts
git commit -m "feat: add startDate field to Candidate type and populate for hired candidates"
```

---

### Task 2: Pure Keep Warm logic in `lib/keepwarm.ts`

**Files:**
- Create: `__tests__/keepwarm.test.ts`
- Create: `lib/keepwarm.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/keepwarm.test.ts`**

```ts
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

// today = 2026-04-14 used throughout so assertions are deterministic

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
    expect(events[0].status).toBe("sent"); // 2025-04-08 < today
    expect(events[1].status).toBe("sent"); // 2025-04-10 < today
    expect(events[2].status).toBe("sent"); // 2025-04-15 < today
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- --reporter=verbose 2>&1 | head -20
```

Expected: 10 tests fail with `Cannot find module '@/lib/keepwarm'`.

- [ ] **Step 3: Create `lib/keepwarm.ts`**

```ts
// lib/keepwarm.ts
import type { Candidate } from "@/lib/data/candidates";

export type KeepWarmEventStatus = "sent" | "scheduled" | "upcoming";

export type KeepWarmEvent = {
  id: string;
  label: string;
  description: string;
  date: string; // ISO date YYYY-MM-DD
  status: KeepWarmEventStatus;
  iconType: "mail" | "video" | "users" | "clock" | "list";
};

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function deriveStatus(eventDate: string, today: string): KeepWarmEventStatus {
  if (eventDate <= today) return "sent";
  if (eventDate <= addDays(today, 14)) return "scheduled";
  return "upcoming";
}

export function generateKeepWarmFeed(
  candidate: Candidate,
  today: string = new Date().toISOString().split("T")[0]
): KeepWarmEvent[] {
  const hireEntry = candidate.assessmentHistory.find((e) => e.stage === "Hired");
  const hireDate = hireEntry?.date ?? candidate.appliedDate;
  const startDate = candidate.startDate ?? addDays(hireDate, 300);
  const firstName = candidate.name.split(" ")[0];

  const definitions: Omit<KeepWarmEvent, "status">[] = [
    {
      id: "offer-sent",
      label: "Offer letter sent",
      description: "Official offer letter emailed via DocuSign. Acceptance deadline: 7 days.",
      date: hireDate,
      iconType: "mail",
    },
    {
      id: "welcome-video",
      label: "Welcome video shared",
      description: `Personalised welcome video from Sarah Chen, Graduate Program Manager, sent to ${firstName}.`,
      date: addDays(hireDate, 2),
      iconType: "video",
    },
    {
      id: "team-intro",
      label: "Meet your team call scheduled",
      description: "30-minute intro call with the graduate cohort booked via calendar invite.",
      date: addDays(hireDate, 7),
      iconType: "users",
    },
    {
      id: "countdown-30",
      label: "30-day countdown check-in",
      description: "Automated check-in email sent: start date confirmed, IT setup instructions, building access info.",
      date: addDays(startDate, -30),
      iconType: "clock",
    },
    {
      id: "onboarding-checklist",
      label: "Onboarding checklist sent",
      description: "Pre-start checklist emailed: tax forms, ID verification, parking registration.",
      date: addDays(startDate, -14),
      iconType: "list",
    },
  ];

  return definitions.map((def) => ({
    ...def,
    status: deriveStatus(def.date, today),
  }));
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
npm test
```

Expected: `43 tests passed` (33 existing + 10 new).

- [ ] **Step 5: Commit**

```bash
git add lib/keepwarm.ts __tests__/keepwarm.test.ts
git commit -m "feat: add generateKeepWarmFeed pure function with tests"
```

---

### Task 3: `KeepWarmFeed` client component

**Files:**
- Create: `components/profile/KeepWarmFeed.tsx`

Renders only for admin persona and Hired stage candidates. Uses the same vertical connector pattern as `AssessmentTimeline`. Three status badges: emerald for sent, amber for scheduled, slate for upcoming.

- [ ] **Step 1: Create `components/profile/KeepWarmFeed.tsx`**

```tsx
// components/profile/KeepWarmFeed.tsx
"use client";
import { useState, useEffect } from "react";
import { Mail, Video, Users, Clock, List, CalendarClock } from "lucide-react";
import { usePersona } from "@/lib/persona";
import { generateKeepWarmFeed } from "@/lib/keepwarm";
import type { KeepWarmEvent, KeepWarmEventStatus } from "@/lib/keepwarm";
import type { Candidate } from "@/lib/data/candidates";

const iconMap: Record<KeepWarmEvent["iconType"], React.ElementType> = {
  mail: Mail,
  video: Video,
  users: Users,
  clock: Clock,
  list: List,
};

const statusConfig: Record<
  KeepWarmEventStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  sent: {
    label: "Sent",
    badgeClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-400",
  },
  scheduled: {
    label: "Scheduled",
    badgeClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-400",
  },
  upcoming: {
    label: "Upcoming",
    badgeClass: "bg-slate-100 text-slate-500",
    dotClass: "bg-slate-300",
  },
};

export function KeepWarmFeed({ candidate }: { candidate: Candidate }) {
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  if (!mounted || persona !== "admin" || candidate.stage !== "Hired") return null;

  const events = generateKeepWarmFeed(candidate);

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock size={14} className="text-violet-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-700">Keep Warm Feed</h3>
        <span className="text-xs text-slate-400 ml-auto">Powered by Grad-Engage</span>
      </div>
      <div className="space-y-4">
        {events.map((event, i) => {
          const Icon = iconMap[event.iconType];
          const config = statusConfig[event.status];
          return (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dotClass}`} />
                {i < events.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 my-1" />
                )}
              </div>
              <div className="pb-1 flex-1">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-xs font-semibold text-slate-700">{event.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">
                      {new Date(event.date).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 ml-[18px]">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add components/profile/KeepWarmFeed.tsx
git commit -m "feat: add KeepWarmFeed client component (admin + Hired only)"
```

---

### Task 4: Wire into the candidate profile page

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

Add `KeepWarmFeed` below the radar/timeline grid so it appears as a full-width block at the bottom of hired profiles.

The current bottom of the page JSX looks like:

```tsx
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PotentialRadar dimensions={candidate.dimensions} />
          <div className="space-y-4">
            <AssessmentTimeline history={candidate.assessmentHistory} />
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
```

- [ ] **Step 1: Add import and component to `app/candidates/[id]/page.tsx`**

Add to the imports:

```tsx
import { KeepWarmFeed } from "@/components/profile/KeepWarmFeed";
```

Add `<KeepWarmFeed>` after the grid, before the closing `</div>`:

```tsx
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PotentialRadar dimensions={candidate.dimensions} />
          <div className="space-y-4">
            <AssessmentTimeline history={candidate.assessmentHistory} />
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
          </div>
        </div>

        <KeepWarmFeed candidate={candidate} />

      </div>
    </AppShell>
```

The full updated file:

```tsx
import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { AiScreeningSummary } from "@/components/profile/AiScreeningSummary";
import { FeedbackReportButton } from "@/components/profile/FeedbackReportButton";
import { KeepWarmFeed } from "@/components/profile/KeepWarmFeed";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) notFound();

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/pipeline" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={14} />
            Pipeline
          </Link>
          <div className="flex items-center gap-2">
            <FeedbackReportButton candidate={candidate} />
            {candidate.stage === "Applied" && (
              <Link href="/assessment">
                <Button size="sm" variant="outline" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  <Send size={13} />
                  Send Assessment
                </Button>
              </Link>
            )}
          </div>
        </div>

        <ProfileHeader candidate={candidate} />

        <AiScreeningSummary candidate={candidate} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PotentialRadar dimensions={candidate.dimensions} />
          <div className="space-y-4">
            <AssessmentTimeline history={candidate.assessmentHistory} />
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
          </div>
        </div>

        <KeepWarmFeed candidate={candidate} />

      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

1. Go to `http://localhost:3000` and choose **Admin**.
2. Navigate to **Pipeline** → click **Liam O'Brien** (c004, Hired).
3. Confirm: Keep Warm Feed appears below the radar/timeline grid with 5 events, all showing "Sent" (start date 2026-02-23 is past).
4. Go back and click **Grace Halliday** (c011, Hired).
5. Confirm: events 1-3 show "Sent", event 4 (30-day countdown) shows "Scheduled" or "Upcoming", event 5 (onboarding checklist) shows "Upcoming".
6. Click **Ethan Brooks** (c018, Hired).
7. Confirm: events 1-3 "Sent", events 4-5 "Upcoming".
8. Click any non-Hired candidate (e.g. Anika Sharma, Shortlisted).
9. Confirm: Keep Warm Feed is absent.
10. Switch to Graduate persona at `/` and navigate to a hired candidate URL directly.
11. Confirm: Keep Warm Feed is absent for Graduate persona.

- [ ] **Step 4: Commit**

```bash
git add app/candidates/\[id\]/page.tsx
git commit -m "feat: add KeepWarmFeed to candidate profile page (Hired + admin only)"
```

---

## Self-Review

**Spec coverage:**
- ✅ 5-event static timeline on hired profiles — Task 2 (`generateKeepWarmFeed`) + Task 3 (component)
- ✅ Events: offer letter sent, welcome video, team intro call, 30-day countdown, onboarding checklist
- ✅ Admin-only — Task 3 (`persona !== "admin"` guard)
- ✅ Hired-only — Task 3 (`candidate.stage !== "Hired"` guard)
- ✅ Targets Grad-Engage — "Powered by Grad-Engage" label in component header
- ✅ Different status mixes across hired profiles — Task 1 (distinct start dates for c004/c011/c018)
- ✅ Hydration safety — Task 3 (`mounted` + `useEffect` pattern)

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `KeepWarmEvent["iconType"]` is `"mail" | "video" | "users" | "clock" | "list"` — matches the `iconMap` keys in `KeepWarmFeed.tsx`. ✅
- `KeepWarmEventStatus` is `"sent" | "scheduled" | "upcoming"` — matches the `statusConfig` keys in `KeepWarmFeed.tsx`. ✅
- `generateKeepWarmFeed` signature `(candidate: Candidate, today?: string): KeepWarmEvent[]` — used in `KeepWarmFeed.tsx` as `generateKeepWarmFeed(candidate)` (no `today` arg, uses default). ✅
- `Candidate.startDate?: string` added in Task 1 — accessed as `candidate.startDate` in `lib/keepwarm.ts`. ✅
