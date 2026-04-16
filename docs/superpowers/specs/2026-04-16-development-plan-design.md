# AI-Generated Development Plan Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Replace the hardcoded `developmentGoals` arrays on Hired candidates with a deterministic generator that maps each candidate's dimension scores onto a curated activity table, producing five personalised goals with due dates anchored to the candidate's start date.

## Generator Contract

**`lib/development.ts`** exposes:

```ts
import type { Candidate, DevelopmentGoal } from "@/lib/data/candidates";
export function generateDevelopmentGoals(candidate: Candidate): DevelopmentGoal[];
```

Returns `[]` when `candidate.startDate` is missing. Otherwise returns five goals in this order:

1. **Induction** — universal: `"Complete 2026 induction program"`, offset +14 days.
2. **Weakness 1** — lowest-scoring dimension × band activity.
3. **Weakness 2** — second-lowest dimension × band activity.
4. **Weakness 3** — third-lowest dimension × band activity.
5. **Leverage** — strongest dimension's leverage activity.

All goals are seeded `status: "not-started"`. `dueDate` = ISO date computed from `startDate + offsetDays`.

## Score Bands

Aligned with the existing `scoreLabel` thresholds in `lib/utils.ts`:

- `low` — score `< 65`
- `mid` — score `65–79`
- `high` — score `>= 80` (used only for leverage goals, never for weakness selection — a 90 could still be "weakest" relative to five 95s, in which case the generator's `low/mid` band selection applies since `score < 80`).

## Lookup Table

```ts
type Activity = { title: string; offsetDays: number };

const INDUCTION_GOAL: Activity = {
  title: "Complete 2026 induction program",
  offsetDays: 14,
};

const DEVELOPMENT_ACTIVITIES: Record<DimKey, { low: Activity; mid: Activity }> = {
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

const LEVERAGE_ACTIVITIES: Record<DimKey, Activity> = {
  adaptability: { title: "Champion a new-process pilot within the first six months", offsetDays: 90 },
  cognitiveAgility: { title: "Lead a problem-framing workshop for the next cohort", offsetDays: 120 },
  emotionalIntelligence: { title: "Mentor an incoming graduate in the 2027 cohort", offsetDays: 150 },
  collaboration: { title: "Facilitate a cross-team retro or kick-off session", offsetDays: 75 },
  drive: { title: "Propose and scope a stretch initiative for quarterly review", offsetDays: 90 },
};
```

`DimKey` = `keyof PotentialDimensions`. All ten dimensions × bands have entries; the table is exhaustive so the generator has no default branch.

## Selection Algorithm

```ts
export function generateDevelopmentGoals(candidate: Candidate): DevelopmentGoal[] {
  if (!candidate.startDate) return [];

  const start = new Date(candidate.startDate);
  const offset = (days: number): string => {
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const ranked = (Object.entries(candidate.dimensions) as [DimKey, number][])
    .sort((a, b) => a[1] - b[1]); // ascending

  const weakest = ranked.slice(0, 3);
  const strongest = ranked[ranked.length - 1];

  const goals: DevelopmentGoal[] = [];

  goals.push(toGoal(INDUCTION_GOAL, offset));

  for (const [dim, score] of weakest) {
    const band = score < 65 ? "low" : "mid";
    goals.push(toGoal(DEVELOPMENT_ACTIVITIES[dim][band], offset));
  }

  goals.push(toGoal(LEVERAGE_ACTIVITIES[strongest[0]], offset));

  return goals;
}

function toGoal(a: Activity, offset: (d: number) => string): DevelopmentGoal {
  return { title: a.title, status: "not-started", dueDate: offset(a.offsetDays) };
}
```

Tie-break on equal scores is implementation-defined (JS `sort` is stable, so input order wins). This is acceptable for a demo — documenting the behaviour only matters if we start making claims about "weakness N" ordering that depend on ties.

## Data Changes

**`lib/data/candidates.ts`** — remove the `developmentGoals:` arrays from both seeded Hired candidates (c005 around line 160, and the other Hired candidate around line 335). Do NOT remove the `developmentGoals?: DevelopmentGoal[]` field from the `Candidate` type — it remains useful for manual test fixtures and signals that the generator's output satisfies the same shape.

## Consumer Change

In `app/candidates/[id]/page.tsx`, replace:

```tsx
{candidate.developmentGoals && (
  <DevelopmentTracker goals={candidate.developmentGoals} />
)}
```

with:

```tsx
{candidate.stage === "Hired" && (
  <DevelopmentTracker goals={generateDevelopmentGoals(candidate)} />
)}
```

plus the new import:

```tsx
import { generateDevelopmentGoals } from "@/lib/development";
```

The tracker now appears for every Hired candidate, not just the two that had seed arrays. No changes to `DevelopmentTracker.tsx`.

## Tests

**`__tests__/development.test.ts`:**

- Returns `[]` when `startDate` is missing.
- Returns exactly 5 goals for a Hired candidate with a start date.
- First goal is the induction goal (`title` matches `INDUCTION_GOAL.title`).
- Second, third, fourth goals correspond to the three weakest dimensions — verified by checking that their titles come from the matching `DEVELOPMENT_ACTIVITIES[dim][band]` entry.
- Fifth goal is the leverage activity for the strongest dimension.
- Score bands are applied correctly: a dimension at 50 → `low` activity; at 70 → `mid` activity.
- Due dates equal `startDate + offsetDays` (ISO-formatted, `YYYY-MM-DD`).
- All goals are seeded `status: "not-started"`.

`DEVELOPMENT_ACTIVITIES`, `LEVERAGE_ACTIVITIES`, and `INDUCTION_GOAL` are exported (named exports) so tests can reference them without duplicating strings.

## Non-Goals

- No UI changes to `DevelopmentTracker` or the profile page layout.
- No editing or marking goals complete in the UI.
- No persistence — each profile render regenerates the goals. Since the generator is deterministic, this is invisible to the user.
- No real AI inference — the "AI" is a curated lookup with clear selection rules.
- No rethinking of the existing score-band thresholds (`< 65`, `65–79`, `>= 80`).
- No cross-dimension interactions (e.g. low drive + low collaboration → specific combo goal). Additive only.

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/development.ts` | Create | Activity tables + `generateDevelopmentGoals` |
| `__tests__/development.test.ts` | Create | Unit tests for the generator |
| `lib/data/candidates.ts` | Modify | Remove seeded `developmentGoals` arrays from Hired candidates |
| `app/candidates/[id]/page.tsx` | Modify | Replace static goals with generator, gate on `stage === "Hired"` |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** Band thresholds match `scoreLabel`. Table structure matches generator access patterns. Return types match `DevelopmentGoal` from `lib/data/candidates.ts`.
- **Scope:** Four files, one generator + tests, small data cleanup, one wiring change. Single-plan feature.
- **Ambiguity:** Explicit ordering rule (induction first, weaknesses 2–4, leverage last). Tie-breaking is called out. Missing `startDate` → empty array is explicit. `high`-band is explicitly not used for weakness selection (the weakest dimension with a score of 80 still picks from the `mid` activity, which is fine because the selection algorithm picks `low` for `< 65`, else `mid`).
