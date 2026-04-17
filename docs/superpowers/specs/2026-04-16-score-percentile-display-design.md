# Score Percentile Display Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Surface a "Top N% of cohort" label alongside the raw `potentialScore` on two existing UI surfaces: the candidate profile header and pipeline cards (admin only). The percentile is suppressed for Applied-stage candidates, who have not yet been assessed.

## Why

The raw score (`84`) tells a recruiter how a candidate performed in isolation. The percentile label puts that number in cohort context ("Top 7% of cohort") so it communicates relative performance at a glance. Displaying it on candidates who have not yet completed assessment would be misleading, so it is scoped to Assessed+ candidates only.

## Reusing Existing Code

`scorePercentile(score, allCandidates)` already exists in `lib/utils.ts:37`. It ranks a score against all `ASSESSED_PLUS_STAGES` candidates and maps onto the 142-candidate assumed cohort. This function needs no changes.

## New Helper

Add `scorePercentileLabel(candidate, allCandidates): string | null` to `lib/utils.ts`. It returns `null` when the candidate's stage is `"Applied"` and otherwise returns `scorePercentile(candidate.potentialScore, allCandidates)`.

Keeping the suppression rule in one place (rather than in each UI file) guarantees both surfaces stay consistent.

## UI Wiring

### `components/profile/ProfileHeader.tsx`

Under the existing `scoreLabel` line (current file, lines 53–56), render a second paragraph with the percentile when the helper returns non-null:

- Classes: `text-xs text-slate-500 mt-0.5`
- No persona gating. Graduates viewing their own profile seeing "Top 7% of cohort" is acceptable — it's flattering and true; score visibility rules for graduates are already handled elsewhere via `scoreLabel`.

### `components/pipeline/CandidateCard.tsx`

Below the score badge (current file, lines 83–85), render a small sub-label:

- Classes: `text-[10px] text-slate-400 font-medium leading-tight mt-0.5`
- Positioned inside the same flex container as the badge, on its own line — the score badge plus percentile form a tight vertical stack aligned to the right of the card.
- Admin only, guarded by the existing `mounted && persona === "admin"` pattern used by `showCheckbox`.
- For Applied-stage candidates the helper returns `null` so nothing renders.

## Data Flow

Both components already receive the `Candidate` object as a prop. They add a static module import:

```ts
import { candidates as allCandidates } from "@/lib/data/candidates";
```

and pass that into `scorePercentileLabel(candidate, allCandidates)`. No new state, no hooks.

## Tests

Extend `__tests__/utils.test.ts` with two tests for the new helper:

1. Returns `null` for an Applied-stage candidate.
2. Returns the expected `Top N%` label for an Assessed+ candidate.

The underlying `scorePercentile` already has its own coverage (5 tests).

## Non-Goals

- No changes to `scorePercentile` internals or the `FULL_COHORT_SIZE` constant.
- No persona toggle on the profile header. Scope stays minimal.
- No tooltip explaining "Top 7% of cohort" — the label is self-explanatory.
- No percentile on the comparison drawer header (could be considered later; out of scope here).

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/utils.ts` | Modify | Add `scorePercentileLabel` helper |
| `__tests__/utils.test.ts` | Modify | Add 2 tests for `scorePercentileLabel` |
| `components/profile/ProfileHeader.tsx` | Modify | Render percentile under `scoreLabel` |
| `components/pipeline/CandidateCard.tsx` | Modify | Render percentile sub-label under score badge (admin only, mounted guard) |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** Suppression rule is defined once (`scorePercentileLabel`) and applied everywhere via that helper. Class name patterns in both UI surfaces match existing neighbours.
- **Scope:** One small feature, four files, single implementation plan.
- **Ambiguity:** "Admin only" on pipeline cards is explicit (`persona === "admin"`). "No persona gating" on the profile header is explicit. Applied-suppression is explicit.
