# Candidate Comparison Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Compare selected (N)" button to the pipeline filter bar that opens a right-side drawer showing 2–3 selected candidates side by side with their dimension scores in a grouped bar chart and AI summary bullets.

**Architecture:** `scorePercentile` is a pure utility function (testable in isolation) added to `lib/utils.ts`. `ComparisonDrawer` is a self-contained client component that receives resolved `Candidate[]` and an `onClose` callback — it owns no state. `PipelineBoard` gains `compareOpen` boolean state and resolves `selectedIds` → `Candidate[]` before passing them down. The existing checkbox/selectedIds mechanism is reused with no changes to `CandidateCard` or `StageColumn`.

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, recharts (already installed: `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `ResponsiveContainer`), lucide-react, existing `generateScreeningSummary` from `lib/screening.ts`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/utils.ts` | Modify | Add `scorePercentile(score, allCandidates)` pure function |
| `__tests__/utils.test.ts` | Create | Unit tests for `scorePercentile` |
| `components/pipeline/ComparisonDrawer.tsx` | Create | Right-side drawer: candidate headers, grouped bar chart, AI bullets |
| `components/pipeline/PipelineBoard.tsx` | Modify | Add `compareOpen` state, "Compare (N)" button, render drawer |

---

### Task 1: `scorePercentile` utility + tests

**Files:**
- Modify: `lib/utils.ts`
- Create: `__tests__/utils.test.ts`

The function ranks a candidate's score against all assessed+ candidates (Assessed, Shortlisted, Interview, Offer, Hired) and maps onto the 142-candidate full cohort from dashboard metrics, so the label feels real-world rather than "3rd of 19."

- [ ] **Step 1: Write the failing tests**

Create `__tests__/utils.test.ts` with the following content:

```ts
// __tests__/utils.test.ts
import { describe, it, expect } from "vitest";
import { scorePercentile } from "@/lib/utils";
import type { Candidate } from "@/lib/data/candidates";

const stub = (stage: string, potentialScore: number): Candidate =>
  ({
    id: potentialScore.toString(),
    name: "Test",
    university: "Test",
    degree: "Test",
    graduationYear: 2025,
    stage: stage as Candidate["stage"],
    appliedDate: "2025-01-01",
    daysInStage: 1,
    potentialScore,
    dimensions: { adaptability: 75, cognitiveAgility: 75, emotionalIntelligence: 75, collaboration: 75, drive: 75 },
    assessmentHistory: [],
    avatarInitials: "T",
  } as Candidate);

// Cohort: 5 assessed+ candidates (92, 88, 85, 90, 80) + 1 Applied (70, excluded)
const cohort = [
  stub("Assessed",    92),
  stub("Shortlisted", 88),
  stub("Interview",   85),
  stub("Offer",       90),
  stub("Hired",       80),
  stub("Applied",     70), // must be excluded from ranking
];

describe("scorePercentile", () => {
  it("returns Top 1% for the highest scorer (no one above)", () => {
    // aboveCount=0 → Math.max(1, round(0/142*100)) = 1
    expect(scorePercentile(92, cohort)).toBe("Top 1% of cohort");
  });

  it("returns Top 1% for a score above everyone in the cohort", () => {
    expect(scorePercentile(99, cohort)).toBe("Top 1% of cohort");
  });

  it("excludes Applied-stage candidates from ranking", () => {
    // score 80: assessed+ above = [92, 88, 85, 90] = 4
    // Math.max(1, round(4/142*100)) = Math.max(1, round(2.82)) = 3
    expect(scorePercentile(80, cohort)).toBe("Top 3% of cohort");
  });

  it("counts correctly for a mid-range score", () => {
    // score 85: assessed+ above = [92, 88, 90] = 3
    // Math.max(1, round(3/142*100)) = Math.max(1, round(2.11)) = 2
    expect(scorePercentile(85, cohort)).toBe("Top 2% of cohort");
  });

  it("returns Top 1% minimum even for the lowest scorer", () => {
    const single = [stub("Assessed", 80)];
    expect(scorePercentile(80, single)).toBe("Top 1% of cohort");
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/utils.test.ts 2>&1 | tail -15
```

Expected: 5 tests fail with "scorePercentile is not a function" (or import error).

- [ ] **Step 3: Implement `scorePercentile` in `lib/utils.ts`**

Add the import and function to `lib/utils.ts`. The full updated file:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Candidate } from "@/lib/data/candidates";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-800";
  if (score >= 65) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "High Potential";
  if (score >= 65) return "Emerging";
  return "Developing";
}

export function stageColor(stage: string): string {
  const map: Record<string, string> = {
    Applied: "bg-slate-100 text-slate-700",
    Assessed: "bg-blue-100 text-blue-700",
    Shortlisted: "bg-violet-100 text-violet-700",
    Interview: "bg-amber-100 text-amber-700",
    Offer: "bg-orange-100 text-orange-700",
    Hired: "bg-emerald-100 text-emerald-700",
  };
  return map[stage] ?? "bg-slate-100 text-slate-700";
}

const ASSESSED_PLUS_STAGES = new Set(["Assessed", "Shortlisted", "Interview", "Offer", "Hired"]);
const FULL_COHORT_SIZE = 142;

export function scorePercentile(score: number, allCandidates: Candidate[]): string {
  const assessed = allCandidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
  const aboveCount = assessed.filter((c) => c.potentialScore > score).length;
  const percentile = Math.max(1, Math.round((aboveCount / FULL_COHORT_SIZE) * 100));
  return `Top ${percentile}% of cohort`;
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test -- __tests__/utils.test.ts 2>&1 | tail -15
```

Expected: 5/5 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all 60 tests pass (55 existing + 5 new).

- [ ] **Step 6: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 7: Commit**

```bash
git add lib/utils.ts __tests__/utils.test.ts
git commit -m "feat: add scorePercentile utility with tests"
```

---

### Task 2: `ComparisonDrawer` component

**Files:**
- Create: `components/pipeline/ComparisonDrawer.tsx`

A fixed right-side drawer with a semi-transparent backdrop. Receives 2–3 `Candidate` objects and an `onClose` callback. Renders a candidate header row, a grouped recharts bar chart (one group per dimension, one bar per candidate), and a one-sentence AI summary per candidate.

- [ ] **Step 1: Create `components/pipeline/ComparisonDrawer.tsx`**

```tsx
// components/pipeline/ComparisonDrawer.tsx
"use client";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";
import { scoreColor, stageColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateScreeningSummary } from "@/lib/screening";

const CANDIDATE_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b"] as const;

const DIM_KEYS: (keyof PotentialDimensions)[] = [
  "adaptability",
  "cognitiveAgility",
  "emotionalIntelligence",
  "collaboration",
  "drive",
];

const DIM_SHORT: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adapt.",
  cognitiveAgility: "Cognitive",
  emotionalIntelligence: "EQ",
  collaboration: "Collab.",
  drive: "Drive",
};

type Props = {
  candidates: Candidate[];
  onClose: () => void;
};

export function ComparisonDrawer({ candidates, onClose }: Props) {
  const chartData = DIM_KEYS.map((dim) => {
    const row: Record<string, string | number> = { dim: DIM_SHORT[dim] };
    candidates.forEach((c) => {
      row[c.id] = c.dimensions[dim];
    });
    return row;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">
            Comparing {candidates.length} candidates
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Candidate header row */}
          <div
            className={`grid gap-3 px-5 py-4 border-b border-slate-100 ${
              candidates.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {candidates.map((c, i) => (
              <div key={c.id} className="text-center space-y-1">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto"
                  style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                >
                  {c.avatarInitials}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{c.name}</p>
                <span
                  className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreColor(c.potentialScore)}`}
                >
                  {c.potentialScore}
                </span>
                <div>
                  <Badge className={`text-xs ${stageColor(c.stage)}`}>{c.stage}</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Dimension bar chart */}
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Dimension Scores
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 4, left: -10 }}
                barCategoryGap="25%"
                barGap={2}
              >
                <XAxis
                  dataKey="dim"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                {candidates.map((c, i) => (
                  <Bar
                    key={c.id}
                    dataKey={c.id}
                    name={c.name.split(" ")[0]}
                    fill={CANDIDATE_COLORS[i]}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI summary bullets */}
          <div className="px-5 pb-6 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              AI Screening Summary
            </h3>
            {candidates.map((c, i) => {
              const { text } = generateScreeningSummary(c);
              const firstSentence = text.split(".")[0] + ".";
              return (
                <div key={c.id} className="flex gap-2.5">
                  <div
                    className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{c.name.split(" ")[0]}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{firstSentence}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build
```

Expected: clean build. The component is not yet wired in anywhere so it's tree-shaken; TypeScript still validates it.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/ComparisonDrawer.tsx
git commit -m "feat: add ComparisonDrawer component"
```

---

### Task 3: Wire `ComparisonDrawer` into `PipelineBoard`

**Files:**
- Modify: `components/pipeline/PipelineBoard.tsx`

Add `compareOpen` state. Add a "Compare (N)" button in the filter bar (visible when admin has 2–3 selected candidates). Resolve `selectedIds` → `Candidate[]` for the drawer. Render `<ComparisonDrawer>` when open.

- [ ] **Step 1: Rewrite `components/pipeline/PipelineBoard.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { getNextStage, filterCandidates, type ScoreBand } from "@/lib/pipeline";
import { StageColumn } from "./StageColumn";
import { ComparisonDrawer } from "./ComparisonDrawer";
import { usePersona } from "@/lib/persona";
import { CheckSquare, Search, X, Layers } from "lucide-react";

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
  const [compareOpen, setCompareOpen] = useState(false);
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
  const showCompare = showBulkAction && selectedIds.size >= 2 && selectedIds.size <= 3;
  const selectedCandidates = allCandidates.filter((c) => selectedIds.has(c.id));

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
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
          {showCompare && (
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Layers size={12} aria-hidden="true" />
              Compare ({selectedIds.size})
            </button>
          )}
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

      {/* Comparison drawer */}
      {compareOpen && (
        <ComparisonDrawer
          candidates={selectedCandidates}
          onClose={() => setCompareOpen(false)}
        />
      )}
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
npm test 2>&1 | tail -10
```

Expected: all 60 tests pass.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Go to `http://localhost:3000`, choose **Admin**.
2. Navigate to **Pipeline**.
3. Tick 1 Assessed card — confirm "Shortlist selected (1)" appears but **no** Compare button (needs ≥ 2).
4. Tick a second card (any stage) — confirm an indigo **"Compare (2)"** button appears alongside the Shortlist button.
5. Click "Compare (2)" — confirm the right-side drawer slides in with:
   - Two candidate header cards with their initials, name, score badge, and stage badge
   - A grouped bar chart (5 dimension groups, 2 bars each in indigo and violet)
   - Two AI summary bullets below
6. Tick a third candidate — confirm "Compare (3)" updates the count; clicking it shows 3-column layout.
7. Tick a fourth candidate — confirm the Compare button disappears (selection > 3).
8. Click the backdrop or × button — confirm drawer closes.
9. Switch to **Graduate** persona — confirm no checkboxes and no Compare button are visible.

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/PipelineBoard.tsx
git commit -m "feat: wire ComparisonDrawer into PipelineBoard"
```

---

## Self-Review

**Spec coverage:**
- ✅ "Compare selected (N)" button in filter bar — Task 3 (`showCompare` guard, indigo button)
- ✅ Visible when 2–3 candidates selected, admin only — Task 3 (`showBulkAction && selectedIds.size >= 2 && selectedIds.size <= 3`)
- ✅ Right-side drawer — Task 2 (`fixed inset-y-0 right-0`)
- ✅ Candidate header row: name, avatarInitials, score, stage badge — Task 2
- ✅ Grouped bar chart, one group per dimension, one bar per candidate — Task 2 (recharts `BarChart` with `dataKey={c.id}`)
- ✅ AI screening summary bullet per candidate — Task 2 (`generateScreeningSummary`, first sentence)
- ✅ Close on backdrop click or × button — Task 2
- ✅ `scorePercentile` utility — Task 1 (in `lib/utils.ts`, 5 tests)
- ✅ No changes to `CandidateCard` or `StageColumn` — existing checkbox mechanism reused

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `ComparisonDrawer` props: `{ candidates: Candidate[]; onClose: () => void }` — matches usage in `PipelineBoard` exactly. ✅
- `chartData` keys use `c.id` (string) — matched by `<Bar dataKey={c.id}>`. ✅
- `CANDIDATE_COLORS` has 3 elements — safe for `candidates.length` of 2 or 3. ✅
- `scorePercentile(score, allCandidates)` — `lib/utils.ts` export matches `__tests__/utils.test.ts` import. ✅
