# AI-Generated Development Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded `developmentGoals` on Hired candidates with a deterministic generator that maps each candidate's dimension scores onto curated activities, producing 5 personalised goals with due dates anchored to `startDate`.

**Architecture:** A new `lib/development.ts` exports the activity lookup tables (induction, per-dimension-band development, per-dimension leverage) plus a pure `generateDevelopmentGoals(candidate)` function. Tests cover ranking, band selection, date arithmetic, and the missing-`startDate` edge case. The candidate profile page swaps from `candidate.developmentGoals` to the generator's output, gated on `stage === "Hired"`. Seeded `developmentGoals` arrays on three Hired candidates are removed.

**Tech Stack:** TypeScript, vitest. No UI/React changes beyond the one import + render swap.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/development.ts` | Create | `INDUCTION_GOAL`, `DEVELOPMENT_ACTIVITIES`, `LEVERAGE_ACTIVITIES`, `generateDevelopmentGoals` |
| `__tests__/development.test.ts` | Create | Unit tests for the generator |
| `lib/data/candidates.ts` | Modify | Remove `developmentGoals` arrays from three Hired candidates |
| `app/candidates/[id]/page.tsx` | Modify | Import and call generator, gate on `stage === "Hired"` |

---

### Task 1: `lib/development.ts` — lookup tables + generator + tests

**Files:**
- Create: `lib/development.ts`
- Create: `__tests__/development.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/development.test.ts`:

```ts
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
    const c = stub({});
    expect(generateDevelopmentGoals(c)).toHaveLength(5);
  });

  it("first goal is the induction goal", () => {
    const c = stub({});
    const goals = generateDevelopmentGoals(c);
    expect(goals[0].title).toBe(INDUCTION_GOAL.title);
  });

  it("targets the three weakest dimensions for goals 2–4", () => {
    const c = stub({
      dimensions: {
        adaptability: 90,
        cognitiveAgility: 85,
        emotionalIntelligence: 55, // weakest → low band
        collaboration: 70,         // second weakest → mid band
        drive: 75,                 // third weakest → mid band
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
        adaptability: 95, // strongest
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
        adaptability: 50,          // weakest → low
        cognitiveAgility: 70,      // second weakest → mid
        emotionalIntelligence: 78, // third weakest → mid
        collaboration: 85,
        drive: 90,                 // strongest (leverage)
      },
    });
    const goals = generateDevelopmentGoals(c);
    expect(goals[1].title).toBe(DEVELOPMENT_ACTIVITIES.adaptability.low.title);
    expect(goals[2].title).toBe(DEVELOPMENT_ACTIVITIES.cognitiveAgility.mid.title);
    expect(goals[3].title).toBe(DEVELOPMENT_ACTIVITIES.emotionalIntelligence.mid.title);
  });

  it("due dates equal startDate + offsetDays (YYYY-MM-DD)", () => {
    const c = stub({ startDate: "2026-03-01" });
    const goals = generateDevelopmentGoals(c);
    // induction offset is 14 → 2026-03-15
    expect(goals[0].dueDate).toBe("2026-03-15");
  });

  it("all goals are seeded 'not-started'", () => {
    const c = stub({});
    for (const g of generateDevelopmentGoals(c)) {
      expect(g.status).toBe("not-started");
    }
  });
});
```

- [ ] **Step 2: Confirm tests fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/development.test.ts 2>&1 | tail -15
```

Expected: module-not-found on `@/lib/development`.

- [ ] **Step 3: Create `lib/development.ts`**

```ts
// lib/development.ts
import type { Candidate, DevelopmentGoal, PotentialDimensions } from "@/lib/data/candidates";

type DimKey = keyof PotentialDimensions;
type Activity = { title: string; offsetDays: number };

export const INDUCTION_GOAL: Activity = {
  title: "Complete 2026 induction program",
  offsetDays: 14,
};

export const DEVELOPMENT_ACTIVITIES: Record<DimKey, { low: Activity; mid: Activity }> = {
  adaptability: {
    low: { title: "Rotate through three business units in the first six months", offsetDays: 120 },
    mid: { title: "Shadow a senior leader during a change initiative", offsetDays: 75 },
  },
  cognitiveAgility: {
    low: { title: "Complete structured problem-solving course (e.g. McKinsey Problem Solving)", offsetDays: 90 },
    mid: { title: "Pair with a mentor on a cross-domain analytical project", offsetDays: 60 },
  },
  emotionalIntelligence: {
    low: { title: "Enrol in a facilitated EQ workshop and coaching follow-ups", offsetDays: 60 },
    mid: { title: "Seek 360° feedback after three months and review with mentor", offsetDays: 90 },
  },
  collaboration: {
    low: { title: "Join a cross-functional peer group — monthly sessions", offsetDays: 30 },
    mid: { title: "Co-lead a team initiative with a peer from another track", offsetDays: 75 },
  },
  drive: {
    low: { title: "Pair with a mentor to define quarterly stretch targets", offsetDays: 45 },
    mid: { title: "Identify an extracurricular stretch goal and review quarterly", offsetDays: 60 },
  },
};

export const LEVERAGE_ACTIVITIES: Record<DimKey, Activity> = {
  adaptability: { title: "Champion a new-process pilot within the first six months", offsetDays: 90 },
  cognitiveAgility: { title: "Lead a problem-framing workshop for the next cohort", offsetDays: 120 },
  emotionalIntelligence: { title: "Mentor an incoming graduate in the 2027 cohort", offsetDays: 150 },
  collaboration: { title: "Facilitate a cross-team retro or kick-off session", offsetDays: 75 },
  drive: { title: "Propose and scope a stretch initiative for quarterly review", offsetDays: 90 },
};

function toGoal(activity: Activity, offset: (days: number) => string): DevelopmentGoal {
  return {
    title: activity.title,
    status: "not-started",
    dueDate: offset(activity.offsetDays),
  };
}

export function generateDevelopmentGoals(candidate: Candidate): DevelopmentGoal[] {
  if (!candidate.startDate) return [];

  const start = new Date(candidate.startDate);
  const offset = (days: number): string => {
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const ranked = (Object.entries(candidate.dimensions) as [DimKey, number][])
    .sort((a, b) => a[1] - b[1]); // ascending score

  const weakest = ranked.slice(0, 3);
  const strongest = ranked[ranked.length - 1];

  const goals: DevelopmentGoal[] = [toGoal(INDUCTION_GOAL, offset)];

  for (const [dim, score] of weakest) {
    const band: "low" | "mid" = score < 65 ? "low" : "mid";
    goals.push(toGoal(DEVELOPMENT_ACTIVITIES[dim][band], offset));
  }

  goals.push(toGoal(LEVERAGE_ACTIVITIES[strongest[0]], offset));

  return goals;
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test -- __tests__/development.test.ts 2>&1 | tail -15
```

Expected: 8/8 pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 171/171 pass (163 existing + 8 new).

- [ ] **Step 6: Commit**

```bash
git add lib/development.ts __tests__/development.test.ts
git commit -m "feat: add AI development plan generator with tests"
```

---

### Task 2: Remove seeded `developmentGoals` from three Hired candidates

**Files:**
- Modify: `lib/data/candidates.ts`

There are exactly three Hired candidates with seeded `developmentGoals` arrays (verified via grep at lines 160, 335, 509). Remove the entire `developmentGoals: [ ... ],` block from each, leaving a valid JSON-like trailing candidate object.

- [ ] **Step 1: Remove block at line ~160 (candidate `c004` or similar — search by context)**

In `lib/data/candidates.ts`, find the block:

```ts
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Shadow senior analyst for 4 weeks", status: "not-started", dueDate: "2026-04-30" },
      { title: "First solo client deliverable", status: "not-started", dueDate: "2026-06-30" },
    ],
```

Delete those five lines entirely (the `developmentGoals:` key, its array, and the trailing comma). The candidate object above the `},` closing brace will still be syntactically valid because the preceding `assessmentHistory: [ ... ],` line retains its trailing comma.

- [ ] **Step 2: Remove block at line ~335**

Find:

```ts
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Lead first team project", status: "not-started", dueDate: "2026-05-31" },
    ],
```

Delete those four lines.

- [ ] **Step 3: Remove block at line ~509**

Find:

```ts
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Assigned mentor", status: "not-started", dueDate: "2026-03-20" },
      { title: "First client-facing role", status: "not-started", dueDate: "2026-07-31" },
    ],
```

Delete those five lines.

- [ ] **Step 4: Verify no `developmentGoals:` arrays remain**

```bash
grep -n "developmentGoals:" lib/data/candidates.ts
```

Expected: only the type-definition reference (around line 51: `developmentGoals?: DevelopmentGoal[];`). Zero array-literal occurrences should remain in the candidate objects.

- [ ] **Step 5: Full test suite + build**

```bash
npm test 2>&1 | tail -5
npm run build 2>&1 | tail -5
```

Expected: 171/171 pass; clean build.

- [ ] **Step 6: Commit**

```bash
git add lib/data/candidates.ts
git commit -m "chore: remove seeded developmentGoals from Hired candidates"
```

---

### Task 3: Wire the generator into the candidate profile

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

- [ ] **Step 1: Edit `app/candidates/[id]/page.tsx`**

Add the import after the existing profile-component imports (near `import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";`):

```tsx
import { generateDevelopmentGoals } from "@/lib/development";
```

Find the current conditional:

```tsx
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
```

Replace with:

```tsx
            {candidate.stage === "Hired" && (
              <DevelopmentTracker goals={generateDevelopmentGoals(candidate)} />
            )}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test 2>&1 | tail -5
```

Expected: 171/171 pass.

- [ ] **Step 3: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000`.
2. Navigate to the **Pipeline** and open a **Hired** candidate's profile (Any of the three seeded Hired candidates — e.g. search for names that land in Hired).
3. Confirm the **Post-Hire Development** tracker renders with **5 goals**:
   - First goal: "Complete 2026 induction program"
   - Next three: activity titles from `DEVELOPMENT_ACTIVITIES` matching that candidate's three weakest dimensions
   - Last: a "leverage" activity for the strongest dimension
4. Confirm each goal's due date is offset from the candidate's start date (e.g. start `2026-02-23` + 14 days → `2026-03-09`).
5. Navigate to another Hired candidate — confirm the goals differ according to their dimensions.
6. Navigate to a non-Hired candidate (Applied / Assessed / Interview / Offer) — confirm no development tracker appears.

- [ ] **Step 5: Commit**

```bash
git add app/candidates/[id]/page.tsx
git commit -m "feat: use AI-generated development goals on profiles"
```

---

## Self-Review

**Spec coverage:**
- ✅ Induction goal first with +14d offset — Task 1 (`INDUCTION_GOAL`, first push in `generateDevelopmentGoals`)
- ✅ Three weakest dimensions targeted with band-appropriate activity — Task 1 (`ranked.slice(0, 3)` + band selection)
- ✅ Strongest dimension's leverage activity last — Task 1 (`LEVERAGE_ACTIVITIES[strongest[0]]`)
- ✅ `low` band for `< 65`, `mid` for `65–79` — Task 1 (`score < 65 ? "low" : "mid"`)
- ✅ Due dates = `startDate + offsetDays`, ISO `YYYY-MM-DD` — Task 1 (`offset` closure slicing `toISOString()`)
- ✅ Missing `startDate` → `[]` — Task 1 (early return)
- ✅ All goals `status: "not-started"` — Task 1 (`toGoal` constant)
- ✅ Seeded `developmentGoals` removed from Hired candidates — Task 2
- ✅ Page swap to gate on `stage === "Hired"` and call generator — Task 3
- ✅ No `DevelopmentTracker` changes — Task 3 consumes the component unchanged
- ✅ Tests cover all 8 scenarios — Task 1

**Placeholder scan:** None.

**Type consistency:**
- `generateDevelopmentGoals(candidate: Candidate): DevelopmentGoal[]` — signature consistent across Task 1 definition, tests (Task 1), and call site (Task 3). ✅
- `DimKey = keyof PotentialDimensions` — derived from the existing type; activity tables fully cover all five dimensions. ✅
- `DevelopmentGoal` shape (`title`, `status`, `dueDate`) matches the existing type at `lib/data/candidates.ts:33–37`. ✅
- `INDUCTION_GOAL`, `DEVELOPMENT_ACTIVITIES`, `LEVERAGE_ACTIVITIES` exports match test imports. ✅
