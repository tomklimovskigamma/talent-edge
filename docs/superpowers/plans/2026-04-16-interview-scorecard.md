# Interview Scorecard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible admin-only Interview Scorecard section to candidate profiles for Interview-stage candidates, with four 1–5 star ratings, notes, a recommendation selector, and inline save confirmation.

**Architecture:** Storage lives in `lib/interview.ts` (a module-level `Map<candidateId, Scorecard>` with get/save helpers). The UI lives in `components/profile/InterviewScorecard.tsx` — a client component that reads/writes via the storage helpers and holds local form state. Mounted + admin + Interview-stage gating follow existing patterns (see `FeedbackReportButton.tsx`).

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, lucide-react (`Star`, `ChevronDown`, `ChevronUp`), vitest.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/interview.ts` | Create | `Scorecard` / `Recommendation` types, `BLANK_SCORECARD`, `getScorecard`, `saveScorecard` |
| `__tests__/interview.test.ts` | Create | Unit tests for storage helpers (round-trip, isolation, clone-on-save) |
| `components/profile/InterviewScorecard.tsx` | Create | Collapsible admin-only scorecard UI |
| `app/candidates/[id]/page.tsx` | Modify | Insert `<InterviewScorecard candidate={candidate} />` after `<AiScreeningSummary />` |

---

### Task 1: `lib/interview.ts` — storage helpers + tests

**Files:**
- Create: `lib/interview.ts`
- Create: `__tests__/interview.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/interview.test.ts`:

```ts
// __tests__/interview.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  BLANK_SCORECARD,
  getScorecard,
  saveScorecard,
  __resetScorecardStore,
  type Scorecard,
} from "@/lib/interview";

beforeEach(() => {
  __resetScorecardStore();
});

describe("getScorecard", () => {
  it("returns a blank scorecard for unseen candidate ids", () => {
    expect(getScorecard("unknown")).toEqual(BLANK_SCORECARD);
  });

  it("returns a fresh copy (not the shared BLANK_SCORECARD reference)", () => {
    const card = getScorecard("unknown");
    card.notes = "mutated";
    expect(BLANK_SCORECARD.notes).toBe("");
  });
});

describe("saveScorecard", () => {
  it("round-trips a stored scorecard", () => {
    const card: Scorecard = {
      communication: 4,
      culturalFit: 5,
      problemSolving: 3,
      overallImpression: 4,
      notes: "Strong communicator, thoughtful answers.",
      recommendation: "advance",
    };
    saveScorecard("c001", card);
    expect(getScorecard("c001")).toEqual(card);
  });

  it("isolates stores by candidate id", () => {
    saveScorecard("c001", { ...BLANK_SCORECARD, communication: 5 });
    saveScorecard("c002", { ...BLANK_SCORECARD, communication: 1 });
    expect(getScorecard("c001").communication).toBe(5);
    expect(getScorecard("c002").communication).toBe(1);
  });

  it("clones input so later mutations do not leak into the store", () => {
    const card: Scorecard = { ...BLANK_SCORECARD, notes: "original" };
    saveScorecard("c001", card);
    card.notes = "mutated";
    expect(getScorecard("c001").notes).toBe("original");
  });

  it("clones output so consumer mutations do not leak into the store", () => {
    saveScorecard("c001", { ...BLANK_SCORECARD, notes: "kept" });
    const fetched = getScorecard("c001");
    fetched.notes = "leaked";
    expect(getScorecard("c001").notes).toBe("kept");
  });
});
```

- [ ] **Step 2: Confirm tests fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/interview.test.ts 2>&1 | tail -15
```

Expected: all fail with `Cannot find package '@/lib/interview'`.

- [ ] **Step 3: Implement `lib/interview.ts`**

Create `lib/interview.ts`:

```ts
// lib/interview.ts
export type Recommendation = "advance" | "hold" | "decline";

export type Scorecard = {
  communication: number; // 0–5; 0 means unset
  culturalFit: number;
  problemSolving: number;
  overallImpression: number;
  notes: string;
  recommendation: Recommendation | null;
};

export const BLANK_SCORECARD: Scorecard = {
  communication: 0,
  culturalFit: 0,
  problemSolving: 0,
  overallImpression: 0,
  notes: "",
  recommendation: null,
};

const store = new Map<string, Scorecard>();

function clone(card: Scorecard): Scorecard {
  return { ...card };
}

export function getScorecard(candidateId: string): Scorecard {
  const stored = store.get(candidateId);
  return stored ? clone(stored) : clone(BLANK_SCORECARD);
}

export function saveScorecard(candidateId: string, card: Scorecard): void {
  store.set(candidateId, clone(card));
}

// Test-only: reset the in-memory store between tests.
export function __resetScorecardStore(): void {
  store.clear();
}
```

Notes:
- `clone` does a shallow copy. `Scorecard` fields are primitives, so shallow clone is sufficient to isolate mutations.
- `__resetScorecardStore` is exported for test hygiene only. It's a reasonable trade-off given the module-level state and keeps tests order-independent.

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test -- __tests__/interview.test.ts 2>&1 | tail -15
```

Expected: 5 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 149/149 pass (144 existing + 5 new).

- [ ] **Step 6: Commit**

```bash
git add lib/interview.ts __tests__/interview.test.ts
git commit -m "feat: add interview scorecard storage helpers with tests"
```

---

### Task 2: `InterviewScorecard` component

**Files:**
- Create: `components/profile/InterviewScorecard.tsx`

A single focused client component that handles visibility, collapse, form state, stars, recommendation, and save-with-confirmation. No props beyond the candidate.

- [ ] **Step 1: Create `components/profile/InterviewScorecard.tsx`**

```tsx
// components/profile/InterviewScorecard.tsx
"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { usePersona } from "@/lib/persona";
import {
  BLANK_SCORECARD,
  getScorecard,
  saveScorecard,
  type Recommendation,
  type Scorecard,
} from "@/lib/interview";

const RATING_FIELDS: {
  key: "communication" | "culturalFit" | "problemSolving" | "overallImpression";
  label: string;
}[] = [
  { key: "communication", label: "Communication" },
  { key: "culturalFit", label: "Cultural Fit" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "overallImpression", label: "Overall Impression" },
];

const RECOMMENDATION_OPTIONS: {
  value: Recommendation;
  label: string;
  selectedClass: string;
}[] = [
  {
    value: "advance",
    label: "Advance to Offer",
    selectedClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    value: "hold",
    label: "Hold",
    selectedClass: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    value: "decline",
    label: "Decline",
    selectedClass: "bg-rose-100 text-rose-800 border-rose-300",
  },
];

function StarRow({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={ariaLabel}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
          >
            <Star
              size={18}
              className={filled ? "fill-amber-400 text-amber-400" : "text-slate-300"}
            />
          </button>
        );
      })}
    </div>
  );
}

export function InterviewScorecard({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [card, setCard] = useState<Scorecard>(BLANK_SCORECARD);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => setMounted(true), []);

  // Hydrate form state from storage when we know which candidate we're editing.
  useEffect(() => {
    setCard(getScorecard(candidate.id));
  }, [candidate.id]);

  if (!mounted || persona !== "admin" || candidate.stage !== "Interview") {
    return null;
  }

  function updateRating(key: typeof RATING_FIELDS[number]["key"], v: number) {
    setCard((prev) => ({ ...prev, [key]: v }));
  }

  function handleSave() {
    saveScorecard(candidate.id, card);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="text-sm font-semibold text-slate-700">Interview Scorecard</h2>
        {open ? (
          <ChevronUp size={16} className="text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-4">
          {/* Ratings */}
          <div className="space-y-3">
            {RATING_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <StarRow
                  value={card[key]}
                  onChange={(v) => updateRating(key, v)}
                  ariaLabel={label}
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="scorecard-notes"
              className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="scorecard-notes"
              rows={4}
              value={card.notes}
              onChange={(e) => setCard((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Interview notes…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-y"
            />
          </div>

          {/* Recommendation */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Recommendation
            </span>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Recommendation">
              {RECOMMENDATION_OPTIONS.map((opt) => {
                const selected = card.recommendation === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      setCard((prev) => ({ ...prev, recommendation: opt.value }))
                    }
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      selected
                        ? opt.selectedClass
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={justSaved}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                justSaved
                  ? "bg-emerald-100 text-emerald-800 cursor-default"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {justSaved ? "Saved ✓" : "Save Scorecard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

Notes:
- The top-level `if (!mounted || persona !== "admin" || candidate.stage !== "Interview") return null;` short-circuits visibility in one place.
- `useEffect([candidate.id])` re-hydrates the form state when navigating between candidate profiles.
- Stars use `button role="radio"` inside a `role="radiogroup"` for accessibility. `aria-checked` tracks the selected value. Clicking the current value clears it (spec requirement).
- Save is disabled for 2s to prevent rapid-fire double-saves and to let the confirmation register visually.

- [ ] **Step 2: Build passes**

```bash
npm run build
```

Expected: clean build. The component is not yet mounted, but TypeScript validates it.

- [ ] **Step 3: Commit**

```bash
git add components/profile/InterviewScorecard.tsx
git commit -m "feat: add InterviewScorecard client component"
```

---

### Task 3: Wire `InterviewScorecard` into the candidate profile

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

- [ ] **Step 1: Edit `app/candidates/[id]/page.tsx`**

Add the import near the top, after the existing `AiScreeningSummary` import:

```tsx
import { InterviewScorecard } from "@/components/profile/InterviewScorecard";
```

Insert `<InterviewScorecard candidate={candidate} />` between `<AiScreeningSummary />` and the two-column grid. The relevant block becomes:

```tsx
        <AiScreeningSummary candidate={candidate} />

        <InterviewScorecard candidate={candidate} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PotentialRadar dimensions={candidate.dimensions} />
          <div className="space-y-4">
            <AssessmentTimeline history={candidate.assessmentHistory} />
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
          </div>
        </div>
```

Because `InterviewScorecard` returns `null` for all non-Interview candidates and non-admin personas, there's no visual impact outside its intended scope.

- [ ] **Step 2: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 149/149 pass.

- [ ] **Step 3: Build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000`, switch to **Admin**.
2. Navigate to **Pipeline** and open a candidate in the **Interview** column.
3. Confirm an **"Interview Scorecard"** collapsible section appears between the AI screening summary and the radar/timeline grid.
4. Click the header — section expands, showing four star-rating rows, a notes textarea, a recommendation row, and a "Save Scorecard" button.
5. Click stars: confirm they fill amber up to the clicked star. Click the currently-selected star — confirm it clears the rating.
6. Type in the notes field — confirm text appears as expected.
7. Select "Advance to Offer" — confirm it turns emerald. Select "Hold" — confirm only Hold is highlighted (amber) now.
8. Click **Save Scorecard** — confirm the button swaps to "Saved ✓" in emerald and is disabled. After ~2 seconds, it reverts to "Save Scorecard".
9. Collapse the section, re-expand — confirm all values persist. Navigate to a different Interview candidate, back, and confirm each card has its own state.
10. Navigate to an **Applied** candidate — confirm no scorecard section appears.
11. Switch to **Graduate** persona — confirm no scorecard section appears on any candidate.

- [ ] **Step 5: Commit**

```bash
git add app/candidates/[id]/page.tsx
git commit -m "feat: wire InterviewScorecard into candidate profile"
```

---

## Self-Review

**Spec coverage:**
- ✅ Visibility: admin + Interview-stage + mounted — Task 2 (top-level return-null guard)
- ✅ Collapsible with chevron — Task 2 (`open` state + `ChevronDown/Up`)
- ✅ Placement between AiScreeningSummary and radar/timeline grid — Task 3
- ✅ Four 1–5 star ratings with click-to-clear — Task 2 (`StarRow` + `value === n ? 0 : n`)
- ✅ Notes textarea — Task 2
- ✅ Recommendation radio-row with emerald/amber/rose selected styling — Task 2 (`RECOMMENDATION_OPTIONS`)
- ✅ Inline "Saved ✓" confirmation, 2s window, disabled during window — Task 2 (`justSaved` + `setTimeout`)
- ✅ Per-candidate in-memory persistence, clone on save/load — Task 1
- ✅ Storage tests (blank-fresh, round-trip, isolation, clone-on-save, clone-on-load) — Task 1

**Placeholder scan:** None.

**Type consistency:**
- `Recommendation` and `Scorecard` imported from `@/lib/interview` in Task 2 — matches Task 1 exports. ✅
- `getScorecard` / `saveScorecard` signatures match between Task 1 definition and Task 2 call sites. ✅
- `BLANK_SCORECARD` imported as initial state in Task 2 — matches Task 1 export. ✅
- `RATING_FIELDS[number]["key"]` is a type-safe reference to the four rating keys — matches the keys in `Scorecard`. ✅
