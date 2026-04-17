# Interview Scorecard Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Add a collapsible "Interview Scorecard" section to the candidate profile for Interview-stage candidates (admin only), with four 1–5 star ratings, a freeform notes textarea, a recommendation selector, and an inline save confirmation.

## Visibility

Rendered only when ALL of:
- `candidate.stage === "Interview"`
- `persona === "admin"`
- `mounted === true` (SSR hydration guard — matches pattern used by `FeedbackReportButton.tsx:27`)

Collapsed by default. The section header is a clickable row with a chevron icon that flips between `ChevronDown` (collapsed) and `ChevronUp` (expanded).

## Placement

In `app/candidates/[id]/page.tsx`, inserted between `<AiScreeningSummary />` and the two-column grid (`<PotentialRadar />` + timeline). The scorecard groups with the admin decision-support content for Interview-stage candidates.

## Component Structure

**`components/profile/InterviewScorecard.tsx`** — client component. Reads existing state via `getScorecard(candidate.id)` on mount, renders the form, and calls `saveScorecard(candidate.id, card)` on save.

State held in component: `open`, and the four form fields (`communication`, `culturalFit`, `problemSolving`, `overallImpression`, `notes`, `recommendation`) plus a transient `justSaved: boolean` for the button feedback window.

## Form Fields

**Four 1–5 star ratings** (rendered by a shared inline `<StarRow>`):
- Communication
- Cultural Fit
- Problem Solving
- Overall Impression

Each rating is a horizontal row of five star glyphs using lucide-react's `Star` icon (size 18). Filled (rating >= index + 1) = `fill-amber-400 text-amber-400`; empty = `text-slate-300`. Clicking a star sets the rating to that index + 1. Clicking the currently-selected value clears it (sets to 0).

**Notes** — textarea, 4 rows, `placeholder="Interview notes…"`, `text-sm` inputs styled consistently with the rest of the project.

**Recommendation** — radio-button row with three pill-style labels:
- `Advance to Offer` — emerald when selected
- `Hold` — amber when selected
- `Decline` — rose when selected

Unselected: `bg-slate-50 text-slate-500 border-slate-200`. Selected uses the coloured token per option (`bg-emerald-100 text-emerald-800 border-emerald-300`, etc.).

## Save Behavior

"Save Scorecard" button in the section footer. On click:

1. `saveScorecard(candidate.id, { ...fields })` stores the current form values.
2. `setJustSaved(true)`; after 2000ms, `setJustSaved(false)` via `setTimeout`.
3. While `justSaved`, the button renders "Saved ✓" with emerald styling (`bg-emerald-100 text-emerald-800`) and is disabled.

No validation — an empty scorecard can be saved. The inline confirmation is the only feedback; no toast system is introduced.

## Persistence Layer

**`lib/interview.ts`** owns the in-memory store:

```ts
export type Recommendation = "advance" | "hold" | "decline";

export type Scorecard = {
  communication: number;      // 0–5
  culturalFit: number;
  problemSolving: number;
  overallImpression: number;
  notes: string;
  recommendation: Recommendation | null;
};

export const BLANK_SCORECARD: Scorecard;

export function getScorecard(candidateId: string): Scorecard;
export function saveScorecard(candidateId: string, card: Scorecard): void;
```

Internally: a module-level `Map<string, Scorecard>`. `getScorecard` returns the stored card or a clone of `BLANK_SCORECARD`. `saveScorecard` clones before storing to prevent the caller's mutations leaking into the store.

Refreshing the page clears everything. This is acceptable for a demo — the spec does not require durable persistence.

## Tests

**`__tests__/interview.test.ts`** covers the storage helpers:

- `getScorecard` returns a fresh blank for unseen ids
- `saveScorecard` followed by `getScorecard` returns the same values
- Two candidate ids are isolated (saving one does not affect the other)
- `saveScorecard` clones input (mutating the input after save does not change stored values)

The component itself is not unit-tested; its behaviour is trivial and verified manually in the browser.

## Non-Goals

- No durable persistence (localStorage, server, db).
- No toast system.
- No multi-user concurrency concerns.
- No scorecard history — saving overwrites.
- No PDF export of the scorecard (the existing `FeedbackReportButton` is a separate feature).
- No cross-profile summary ("average star rating across interviewed candidates") — out of scope.

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/interview.ts` | Create | `Scorecard` type, `BLANK_SCORECARD`, `getScorecard`, `saveScorecard` |
| `__tests__/interview.test.ts` | Create | Unit tests for storage helpers |
| `components/profile/InterviewScorecard.tsx` | Create | The collapsible admin-only scorecard UI |
| `app/candidates/[id]/page.tsx` | Modify | Insert `<InterviewScorecard candidate={candidate} />` in the page layout |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** Visibility rules are defined once; Recommendation union is used consistently across storage and UI. Star rating range (0–5, 0 = unset) is explicit.
- **Scope:** One file of pure logic, one component file, one integration point, one test file. Single-plan feature.
- **Ambiguity:** "Save" semantics are explicit (last-write-wins, in-memory, session-scoped). Star click-to-clear behaviour is explicit. Recommendation `null` state (nothing selected) is explicit.
