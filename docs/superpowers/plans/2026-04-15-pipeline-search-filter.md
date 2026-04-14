# Pipeline Search & Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a name/university/degree search bar to the pipeline board so admins can instantly find candidates without scrolling all columns.

**Architecture:** Extract candidate filtering into a pure `filterCandidates(candidates, search, scoreBand)` function in `lib/pipeline.ts` so it can be unit-tested in isolation. `PipelineBoard` gains a `search` state string, calls `filterCandidates` to produce the `filtered` array (replacing the inline filter logic), and renders a search input row above the existing score-band buttons. The score-band buttons already serve as the score-range filter — no new controls needed there.

**Tech Stack:** TypeScript, Vitest, React 19 client components, Tailwind v4, lucide-react (`Search`, `X` icons).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/pipeline.ts` | Modify | Add `ScoreBand` type + `filterCandidates` pure function |
| `__tests__/pipeline.test.ts` | Modify | Add tests for `filterCandidates` |
| `components/pipeline/PipelineBoard.tsx` | Modify | Add `search` state, search input row, wire `filterCandidates` |

---

### Task 1: `filterCandidates` pure function + tests

**Files:**
- Modify: `lib/pipeline.ts`
- Modify: `__tests__/pipeline.test.ts`

Extract the filtering logic from `PipelineBoard` into a testable pure function. The function takes a candidate array, a search string, and a score band; returns the filtered subset. Case-insensitive substring match against `name`, `university`, and `degree`.

- [ ] **Step 1: Write the failing tests**

Open `__tests__/pipeline.test.ts`. Append the following test suite after the existing `getNextStage` suite:

```ts
import { describe, it, expect } from "vitest";
import { getNextStage, filterCandidates } from "@/lib/pipeline";
import type { Candidate } from "@/lib/data/candidates";

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

const alice  = stub({ id: "a", name: "Alice Brown",   university: "UNSW",              degree: "B. Commerce",           potentialScore: 85 });
const bob    = stub({ id: "b", name: "Bob Zhang",     university: "University of Melb", degree: "B. Engineering",       potentialScore: 72 });
const carla  = stub({ id: "c", name: "Carla Nguyen",  university: "Monash University",  degree: "B. Science (Psychology)", potentialScore: 60 });
const all    = [alice, bob, carla];

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
    // bob matches "engineering" and is in emerging band
    expect(filterCandidates(all, "engineering", "emerging")).toEqual([bob]);
    // alice matches "alice" but is NOT in emerging band
    expect(filterCandidates(all, "alice", "emerging")).toEqual([]);
  });

  it("trims whitespace from search string", () => {
    expect(filterCandidates(all, "  alice  ", "all")).toEqual([alice]);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- --reporter=verbose 2>&1 | grep -E "(FAIL|filterCandidates|✓|×)"
```

Expected: all `filterCandidates` tests fail with "filterCandidates is not a function" (or similar import error). The existing `getNextStage` tests should still pass.

- [ ] **Step 3: Implement `filterCandidates` in `lib/pipeline.ts`**

Replace `lib/pipeline.ts` with:

```ts
// lib/pipeline.ts
import { type StageName } from "@/lib/data/program";
import type { Candidate } from "@/lib/data/candidates";

const stageOrder = [
  "Applied",
  "Assessed",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
] as const satisfies readonly StageName[];

export function getNextStage(current: StageName): StageName | null {
  const idx = stageOrder.indexOf(current);
  if (idx === -1 || idx === stageOrder.length - 1) return null;
  return stageOrder[idx + 1];
}

export type ScoreBand = "all" | "high" | "emerging";

export function filterCandidates(
  candidates: Candidate[],
  search: string,
  scoreBand: ScoreBand
): Candidate[] {
  const q = search.trim().toLowerCase();
  return candidates.filter((c) => {
    if (scoreBand === "high" && c.potentialScore < 80) return false;
    if (scoreBand === "emerging" && (c.potentialScore < 65 || c.potentialScore >= 80)) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.university.toLowerCase().includes(q) ||
      c.degree.toLowerCase().includes(q)
    );
  });
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|filterCandidates|✓|×)"
```

Expected: all 9 new `filterCandidates` tests pass. All existing `getNextStage` tests pass. Total: 52 tests passing.

- [ ] **Step 5: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git add lib/pipeline.ts __tests__/pipeline.test.ts
git commit -m "feat: add filterCandidates pure function with tests"
```

---

### Task 2: Search bar UI in `PipelineBoard`

**Files:**
- Modify: `components/pipeline/PipelineBoard.tsx`

Add `search` state (string, default `""`). Replace the inline `filtered` derivation with a call to `filterCandidates`. Add a search input row above the score-band filter bar. The input has a `Search` icon on the left. When `search` is non-empty a clear (`X`) button appears on the right. The count label updates to reflect both search and band filters.

- [ ] **Step 1: Rewrite `components/pipeline/PipelineBoard.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { getNextStage, filterCandidates, type ScoreBand } from "@/lib/pipeline";
import { StageColumn } from "./StageColumn";
import { usePersona } from "@/lib/persona";
import { CheckSquare, Search, X } from "lucide-react";

const accentClasses = [
  "border-slate-300",
  "border-blue-400",
  "border-violet-400",
  "border-amber-400",
  "border-orange-400",
  "border-emerald-400",
];

export function PipelineBoard() {
  const [filter, setFilter] = useState<ScoreBand>("all");
  const [search, setSearch] = useState("");
  const [stageOverrides, setStageOverrides] = useState<Record<string, StageName>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  const filtered = filterCandidates(allCandidates, search, filter);

  function handleAdvance(candidateId: string, currentStage: StageName) {
    const next = getNextStage(currentStage);
    if (!next) return;
    setStageOverrides((prev) => ({ ...prev, [candidateId]: next }));
  }

  function handleSelect(candidateId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(candidateId);
      else next.delete(candidateId);
      return next;
    });
  }

  function handleBulkShortlist() {
    setStageOverrides((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        next[id] = "Shortlisted";
      }
      return next;
    });
    setSelectedIds(new Set());
  }

  const effectiveStage = (candidateId: string, originalStage: StageName): StageName =>
    stageOverrides[candidateId] ?? originalStage;

  const showBulkAction = mounted && persona === "admin" && selectedIds.size > 0;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, university, or degree…"
          className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">Filter:</span>
        {(["all", "high", "emerging"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? "All Candidates" : f === "high" ? "High Potential (80+)" : "Emerging (65–79)"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          {showBulkAction && (
            <button
              type="button"
              onClick={handleBulkShortlist}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <CheckSquare size={12} aria-hidden="true" />
              Shortlist selected ({selectedIds.size})
            </button>
          )}
          <span className="text-xs text-slate-400">{filtered.length} candidates shown</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <StageColumn
            key={stage.id}
            label={stage.label}
            candidates={filtered.filter(
              (c) => effectiveStage(c.id, c.stage) === stage.label
            )}
            accentClass={accentClasses[i]}
            onAdvance={handleAdvance}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        ))}
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

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all 52 tests pass.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Go to `http://localhost:3000`, choose **Admin**.
2. Navigate to **Pipeline**.
3. Confirm a search bar appears above the filter buttons with a magnifying glass icon.
4. Type `"sophie"` — confirm only Sophie Williams's card appears (Assessed column). Other columns show "No candidates".
5. Type `"melbourne"` — confirm all candidates from University of Melbourne appear across their respective columns.
6. Type `"engineering"` — confirm only engineering-degree candidates appear.
7. Clear the search (X button) — confirm all candidates return.
8. Type `"alice"` (no match) — confirm all columns show "No candidates" and the count reads "0 candidates shown".
9. With search empty, click "High Potential (80+)" — confirm only high-scoring candidates show.
10. With "High Potential" active, type `"anika"` — confirm only Anika Sharma appears.
11. Switch to **Graduate** persona — confirm search bar is still visible (it's not persona-gated).

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/PipelineBoard.tsx
git commit -m "feat: add candidate search bar to pipeline board"
```

---

## Self-Review

**Spec coverage:**
- ✅ Search bar on pipeline board — Task 2 (text input in `PipelineBoard`, above filter bar)
- ✅ Score-range filter on pipeline board — the existing score-band buttons are retained and now wired through `filterCandidates`. The backlog says "score-range filter" — the existing All/High/Emerging buttons cover this; a duplicate min/max numeric input would add no demo value.
- ✅ Searches name, university, degree — Task 1 (`filterCandidates` checks all three fields)
- ✅ Case-insensitive — Task 1 (`toLowerCase()` on both query and field values)
- ✅ Clear button when search is non-empty — Task 2 (`{search && <button onClick={() => setSearch("")}>}`)
- ✅ Count label reflects combined filtering — Task 2 (`filtered.length` comes from `filterCandidates` which applies both search and band)
- ✅ Pure function is unit-tested — Task 1 (9 new tests in `__tests__/pipeline.test.ts`)

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `ScoreBand` exported from `lib/pipeline.ts` — used as the type of `filter` state in `PipelineBoard` (replaces inline `"all" | "high" | "emerging"` union). ✅
- `filterCandidates(candidates, search, filter)` — signature matches the call site exactly. ✅
- `setFilter` typed as `Dispatch<SetStateAction<ScoreBand>>` — the `(["all", "high", "emerging"] as const).map(...)` loop satisfies this. ✅
