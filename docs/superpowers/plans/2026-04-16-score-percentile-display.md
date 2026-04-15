# Score Percentile Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a "Top N% of cohort" label alongside the raw `potentialScore` on the profile header and on pipeline cards (admin only), suppressed for Applied-stage candidates.

**Architecture:** Add a thin wrapper helper `scorePercentileLabel(candidate, allCandidates): string | null` in `lib/utils.ts` that returns null for Applied-stage candidates. Both UI surfaces call this single helper so the suppression rule has one owner. No changes to the existing `scorePercentile` function.

**Tech Stack:** TypeScript, React 19, Tailwind v4, vitest. All files already exist.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/utils.ts` | Modify | Add `scorePercentileLabel` helper |
| `__tests__/utils.test.ts` | Modify | Add 2 tests for `scorePercentileLabel` |
| `components/profile/ProfileHeader.tsx` | Modify | Render percentile under `scoreLabel` |
| `components/pipeline/CandidateCard.tsx` | Modify | Render percentile under score badge (admin only, mounted guard) |

---

### Task 1: `scorePercentileLabel` helper + tests

**Files:**
- Modify: `lib/utils.ts`
- Modify: `__tests__/utils.test.ts`

- [ ] **Step 1: Add failing tests to `__tests__/utils.test.ts`**

Append the following to the file (after the existing `describe("scorePercentile", …)` block, before the final `});` of the last describe — actually append as a separate top-level describe at the end of the file):

```ts
import { scorePercentileLabel } from "@/lib/utils";

describe("scorePercentileLabel", () => {
  it("returns null for Applied-stage candidates", () => {
    const applied = stub("Applied", 90);
    expect(scorePercentileLabel(applied, cohort)).toBeNull();
  });

  it("returns a Top N% label for Assessed+ candidates", () => {
    const assessed = stub("Assessed", 85);
    // Same computation as scorePercentile(85, cohort) → "Top 2% of cohort"
    expect(scorePercentileLabel(assessed, cohort)).toBe("Top 2% of cohort");
  });
});
```

Note: `scorePercentileLabel` must be added to the existing top-level import from `@/lib/utils`. Merge the imports — the final import line in the file should read:

```ts
import { scorePercentile, scorePercentileLabel } from "@/lib/utils";
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/utils.test.ts 2>&1 | tail -15
```

Expected: the two new tests fail with `scorePercentileLabel is not a function` (or an import error). The existing 5 `scorePercentile` tests should still pass.

- [ ] **Step 3: Implement `scorePercentileLabel` in `lib/utils.ts`**

Append to `lib/utils.ts` (after the existing `scorePercentile` function at line 42):

```ts
export function scorePercentileLabel(
  candidate: Candidate,
  allCandidates: Candidate[]
): string | null {
  if (candidate.stage === "Applied") return null;
  return scorePercentile(candidate.potentialScore, allCandidates);
}
```

The `Candidate` type is already imported at the top of `lib/utils.ts` (line 3). No new imports needed.

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test -- __tests__/utils.test.ts 2>&1 | tail -15
```

Expected: all 7 utils tests pass (5 existing + 2 new).

- [ ] **Step 5: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all 144 tests pass (142 existing + 2 new).

- [ ] **Step 6: Commit**

```bash
git add lib/utils.ts __tests__/utils.test.ts
git commit -m "feat: add scorePercentileLabel helper with Applied suppression"
```

---

### Task 2: Wire percentile into `ProfileHeader`

**Files:**
- Modify: `components/profile/ProfileHeader.tsx`

Render the percentile label under the existing `scoreLabel` in the score card, styled as a quiet caption.

- [ ] **Step 1: Edit `components/profile/ProfileHeader.tsx`**

Apply two changes:

1. Update the imports at the top of the file from:

```tsx
import { Candidate } from "@/lib/data/candidates";
import { scoreLabel, stageColor } from "@/lib/utils";
```

to:

```tsx
import { Candidate, candidates as allCandidates } from "@/lib/data/candidates";
import { scoreLabel, scorePercentileLabel, stageColor } from "@/lib/utils";
```

2. Inside the component body, replace the block:

```tsx
          <p className={`text-xs font-medium mt-0.5 ${
            candidate.potentialScore >= 80 ? "text-emerald-600" :
            candidate.potentialScore >= 65 ? "text-amber-600" : "text-rose-600"
          }`}>{scoreLabel(candidate.potentialScore)}</p>
        </div>
      </div>
    </div>
  );
}
```

with:

```tsx
          <p className={`text-xs font-medium mt-0.5 ${
            candidate.potentialScore >= 80 ? "text-emerald-600" :
            candidate.potentialScore >= 65 ? "text-amber-600" : "text-rose-600"
          }`}>{scoreLabel(candidate.potentialScore)}</p>
          {(() => {
            const percentile = scorePercentileLabel(candidate, allCandidates);
            return percentile ? (
              <p className="text-xs text-slate-500 mt-0.5">{percentile}</p>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}
```

The IIFE keeps the derivation local to the render spot without introducing a top-of-function `const`. If a plainer form is preferred, hoist it — but the behaviour is identical.

- [ ] **Step 2: Run tests — confirm no regressions**

```bash
npm test 2>&1 | tail -10
```

Expected: all 144 tests pass.

- [ ] **Step 3: Build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add components/profile/ProfileHeader.tsx
git commit -m "feat: show score percentile on profile header"
```

---

### Task 3: Wire percentile into `CandidateCard` (admin only)

**Files:**
- Modify: `components/pipeline/CandidateCard.tsx`

Render a percentile sub-label directly below the existing score badge. Gated by the same `mounted && persona === "admin"` pattern used by `showCheckbox`. For Applied-stage candidates the helper returns null so nothing renders (redundant with the stage-check, but safe and explicit).

- [ ] **Step 1: Edit `components/pipeline/CandidateCard.tsx`**

Apply two changes:

1. Update the imports:

```tsx
import { Candidate } from "@/lib/data/candidates";
```

becomes:

```tsx
import { Candidate, candidates as allCandidates } from "@/lib/data/candidates";
```

and:

```tsx
import { scoreColor } from "@/lib/utils";
```

becomes:

```tsx
import { scoreColor, scorePercentileLabel } from "@/lib/utils";
```

2. Add a derived flag alongside the existing guard flags. After the line:

```tsx
  const showAccessibility = mounted && persona === "admin" && !!candidate.accessibilityNeeds;
```

add:

```tsx
  const percentileLabel = scorePercentileLabel(candidate, allCandidates);
  const showPercentile = mounted && persona === "admin" && percentileLabel !== null;
```

3. Replace the score badge JSX. Change:

```tsx
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreColor(candidate.potentialScore)}`}>
                  {candidate.potentialScore}
                </span>
```

to:

```tsx
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreColor(candidate.potentialScore)}`}>
                    {candidate.potentialScore}
                  </span>
                  {showPercentile && (
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">
                      {percentileLabel}
                    </span>
                  )}
                </div>
```

The score badge now sits inside a small right-aligned column so the percentile sub-label can stack directly beneath it without disturbing the accessibility icon that lives to its left.

- [ ] **Step 2: Run tests — confirm no regressions**

```bash
npm test 2>&1 | tail -10
```

Expected: all 144 tests pass.

- [ ] **Step 3: Build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000` and switch to **Admin** persona.
2. Navigate to **Pipeline**. Confirm:
   - Cards in the **Applied** column show the score badge only — no percentile sub-label.
   - Cards in **Assessed**, **Shortlisted**, **Interview**, **Offer**, **Hired** columns show a small grey "Top N% of cohort" sub-label beneath the score badge.
   - Card layout is not visually broken — accessibility icon remains on the left of the score.
3. Click any Assessed+ candidate to open their profile. Confirm the score ring on the right of the header shows:
   - The big number
   - "AI Potential Score" label
   - The existing coloured `scoreLabel` ("High Potential" / "Emerging" / "Developing")
   - A new small grey "Top N% of cohort" line below that
4. Click an Applied-stage candidate's profile. Confirm the percentile line is absent (only the existing three lines show).
5. Switch to **Graduate** persona. Navigate to Pipeline. Confirm no percentile appears on any card (admin guard).
6. Switch back to **Admin** and spot-check a profile to make sure the percentile still appears.

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/CandidateCard.tsx
git commit -m "feat: show score percentile on pipeline cards for admin"
```

---

## Self-Review

**Spec coverage:**
- ✅ `scorePercentileLabel` helper with Applied suppression — Task 1
- ✅ Tests for Applied-null and Assessed+-label — Task 1
- ✅ Render percentile on `ProfileHeader` under `scoreLabel` with `text-xs text-slate-500 mt-0.5` — Task 2
- ✅ No persona gating on profile header — Task 2 (component unconditionally reads `scorePercentileLabel`)
- ✅ Render percentile on `CandidateCard` under score badge with `text-[10px] text-slate-400 font-medium` — Task 3
- ✅ Admin-only + mounted guard on pipeline cards — Task 3 (`showPercentile` flag)
- ✅ Applied candidates suppressed on both surfaces — Task 1 helper returns null
- ✅ No changes to `scorePercentile` internals — Task 1 only adds a wrapper

**Placeholder scan:** None. All code complete, no TBD/TODO.

**Type consistency:**
- `scorePercentileLabel(candidate: Candidate, allCandidates: Candidate[]): string | null` — signature consistent across Task 1 definition and Task 2/3 call sites. ✅
- `candidates as allCandidates` rename used in both Task 2 and Task 3 — consistent. ✅
- Existing `scorePercentile` signature untouched. ✅
