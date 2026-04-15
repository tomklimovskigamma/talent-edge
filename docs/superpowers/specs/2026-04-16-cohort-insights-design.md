# AI Cohort Insights — Dashboard Card Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Add a "Cohort Intelligence" card to the program dashboard that surfaces three insight strings computed from the real candidate data in `lib/data/candidates.ts`. The strings are generated at render time, not hardcoded.

## Placement

Inserted between `<MetricsRow />` and the funnel/score-distribution grid on `app/dashboard/page.tsx`. Full-width card, above the two-column chart row.

## Insights

1. **Strongest dimension** — the dimension with the highest average score across assessed+ candidates.
   Example: "Collaboration is this cohort's standout strength — averaging 87 across all assessed candidates."
2. **Weakest dimension** — the dimension with the lowest average score, referencing the gap to the strongest.
   Example: "Drive is the development opportunity — cohort average of 71, 9 points below Collaboration."
3. **Track comparison** — averages `potentialScore` for candidates classified into Finance, Technology, and People & Culture tracks; surfaces the leader.
   Example: "Finance track candidates lead on overall potential score (84 avg) vs Technology (79) and People & Culture (76)."

All figures are computed from `lib/data/candidates.ts`, filtered to `ASSESSED_PLUS_STAGES` (Assessed, Shortlisted, Interview, Offer, Hired).

## Track Classification

No `track` field is added to `Candidate`. Tracks are derived from the existing `degree` string via a pure helper:

```ts
classifyTrack(degree: string): "Finance" | "Technology" | "People & Culture" | "Other"
```

**Keyword rules** (case-insensitive, first match wins in listed order):

- **Finance:** `finance`, `commerce`, `economics`, `accounting`, `business`
- **Technology:** `engineering`, `computer`, `software`, `data`, `information technology`, `IT`
- **People & Culture:** `psychology`, `human resources`, `HR`, `arts`, `sociology`, `education`
- **Other:** fallback — excluded from track averages

Order matters because "B. Commerce (Data Analytics)" would match both Finance (commerce) and Technology (data). Finance is checked first since the degree's primary discipline usually dominates the string.

## Architecture

**New file:** `lib/cohort.ts` — pure computation helpers, no React:

```ts
export function classifyTrack(degree: string): Track
export function computeDimensionAverages(candidates: Candidate[]): Record<keyof PotentialDimensions, number>
export function strongestDimension(avgs): { dim; label; average; gap }
export function weakestDimension(avgs): { dim; label; average; gap }
export function computeTrackAverages(candidates: Candidate[]): Record<Track, number>
```

`computeDimensionAverages` and `computeTrackAverages` internally filter to `ASSESSED_PLUS_STAGES`. The `ASSESSED_PLUS_STAGES` set already exists in `lib/utils.ts`; it moves to `lib/cohort.ts` and `lib/utils.ts` re-exports it (both files need it; cohort.ts is the more natural owner).

Dimension label map (`adaptability → "Adaptability"`, `cognitiveAgility → "Cognitive Agility"`, etc.) lives in `lib/cohort.ts` as a `DIMENSION_LABELS` constant.

**New file:** `components/dashboard/CohortInsights.tsx` — server component that calls the helpers and renders three bullets.

**New file:** `__tests__/cohort.test.ts` — covers `classifyTrack`, `computeDimensionAverages` (excludes Applied stage), `strongestDimension` / `weakestDimension` (correct pick + gap), `computeTrackAverages`.

## Rendering

```
┌─ [Sparkles] Cohort Intelligence ───────────────┐
│ ● Collaboration is this cohort's standout…     │
│ ● Drive is the development opportunity — …     │
│ ● Finance track candidates lead on overall…    │
└────────────────────────────────────────────────┘
```

- Wrapper: `bg-white border rounded-xl shadow-sm p-5`
- Header: `text-sm font-semibold text-slate-700` with a `Sparkles` icon (lucide-react, indigo-500, size 14)
- Three bullets, each prefixed by a 1.5px colored dot (indigo, violet, amber respectively)
- Bullet text: `text-sm text-slate-600 leading-relaxed`

## Non-Goals

- No persona gating (dashboard is admin-only by route).
- No client-side state, hooks, or interactivity.
- No fallback UI for empty cohorts — the seed data guarantees ≥ 5 assessed candidates.
- `track` is not persisted on `Candidate`. Adding a `track` field is deferred to when the Tier 3 "Program analytics page" makes per-track breakdowns a first-class concern.

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** Track classification order (Finance first) is justified in the Track Classification section; helper signatures match the component's usage.
- **Scope:** Single card, single file plus one pure-lib file plus one test file — a one-plan feature.
- **Ambiguity:** The `ASSESSED_PLUS_STAGES` move is called out explicitly so the implementation plan doesn't accidentally duplicate it.
