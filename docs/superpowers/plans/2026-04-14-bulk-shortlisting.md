# Bulk Shortlisting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add checkboxes to Assessed-stage candidate cards and a "Shortlist selected (N)" action button to the pipeline board so admins can shortlist multiple candidates in one click.

**Architecture:** Selection state (`Set<string>`) lives in `PipelineBoard`, which already owns `stageOverrides`. Props are threaded leaf-first: `CandidateCard` gains optional `selected`/`onSelect` props first (and renders the checkbox when stage is Assessed + admin), then `StageColumn` passes `selected={selectedIds.has(id)}` and `onSelect` through, then `PipelineBoard` wires up the `selectedIds` set, `handleSelect`, and `handleBulkShortlist`. No new pure functions are needed — selection is pure UI state. Each task produces a passing build.

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, lucide-react, existing `usePersona` hook.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/pipeline/CandidateCard.tsx` | Modify | Accept `selected?`/`onSelect?` props; render checkbox (admin + Assessed only); highlight selected card |
| `components/pipeline/StageColumn.tsx` | Modify | Accept `selectedIds?`/`onSelect?` props; pass `selected` and `onSelect` to each card |
| `components/pipeline/PipelineBoard.tsx` | Modify | Add `selectedIds` state, `handleSelect`, `handleBulkShortlist`; render bulk action button; pass selection props to columns |

---

### Task 1: Update `CandidateCard` with checkbox

**Files:**
- Modify: `components/pipeline/CandidateCard.tsx`

Add optional `selected?: boolean` and `onSelect?: (id: string, checked: boolean) => void` props. The checkbox is an absolutely-positioned element inside the `group relative` wrapper, outside the `<Link>`, so clicks on it do not navigate. Only visible when `mounted && persona === "admin" && currentStage === "Assessed" && !!onSelect`. When `selected` is true, the card gets an indigo border/tint.

The current file is at `components/pipeline/CandidateCard.tsx`.

- [ ] **Step 1: Rewrite `components/pipeline/CandidateCard.tsx`**

```tsx
// components/pipeline/CandidateCard.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreColor } from "@/lib/utils";
import { Clock, Send, CalendarPlus, ArrowRight } from "lucide-react";
import { ScheduleModal } from "@/components/pipeline/ScheduleModal";
import { usePersona } from "@/lib/persona";
import { getNextStage } from "@/lib/pipeline";

interface CandidateCardProps {
  candidate: Candidate;
  currentStage?: StageName;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
  selected?: boolean;
  onSelect?: (candidateId: string, checked: boolean) => void;
}

export function CandidateCard({
  candidate,
  currentStage: currentStageProp,
  onAdvance,
  selected = false,
  onSelect,
}: CandidateCardProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  const currentStage: StageName = currentStageProp ?? (candidate.stage as StageName);
  const nextStage = getNextStage(currentStage);
  const showAdvance = mounted && persona === "admin" && !!onAdvance && !!nextStage;
  const showCheckbox = mounted && persona === "admin" && currentStage === "Assessed" && !!onSelect;

  return (
    <>
      <div className="group relative">
        {showCheckbox && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(candidate.id, e.target.checked)}
              aria-label={`Select ${candidate.name}`}
              className="h-3.5 w-3.5 accent-indigo-600 cursor-pointer"
            />
          </div>
        )}

        <Link href={`/candidates/${candidate.id}`}>
          <div className={`bg-white border rounded-lg p-3 space-y-2 hover:shadow-md transition-all cursor-pointer ${
            selected
              ? "border-indigo-400 bg-indigo-50/30"
              : "border-slate-200 hover:border-indigo-200"
          }`}>
            <div className="flex items-start justify-between">
              <div className={`flex items-center gap-2 ${showCheckbox ? "pl-5" : ""}`}>
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                  {candidate.avatarInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{candidate.name}</p>
                  <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{candidate.university}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${scoreColor(candidate.potentialScore)}`}>
                {candidate.potentialScore}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{candidate.degree}</p>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              <span className="text-xs">{candidate.daysInStage}d in stage</span>
            </div>
          </div>
        </Link>

        {currentStage === "Applied" && (
          <Link
            href="/assessment"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-1"
          >
            <Send size={10} />
            Send assessment
          </Link>
        )}

        {currentStage === "Interview" && (
          <button
            type="button"
            onClick={() => setShowSchedule(true)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 px-1"
          >
            <CalendarPlus size={10} />
            Schedule interview
          </button>
        )}

        {showAdvance && (
          <button
            type="button"
            onClick={() => onAdvance?.(candidate.id, currentStage)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 px-1"
          >
            <ArrowRight size={10} />
            Advance to {nextStage}
          </button>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          candidateName={candidate.name}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build
```

Expected: clean build — `CandidateCard` now accepts optional selection props; `StageColumn` still calls it without them so nothing breaks.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/CandidateCard.tsx
git commit -m "feat: add selection checkbox to CandidateCard (Assessed + admin only)"
```

---

### Task 2: Thread selection through `StageColumn`

**Files:**
- Modify: `components/pipeline/StageColumn.tsx`

Add `selectedIds?: Set<string>` and `onSelect?: (candidateId: string, checked: boolean) => void` as optional props. Pass `selected={selectedIds?.has(c.id) ?? false}` and `onSelect` to each `CandidateCard`.

The current file is at `components/pipeline/StageColumn.tsx`.

- [ ] **Step 1: Rewrite `components/pipeline/StageColumn.tsx`**

```tsx
// components/pipeline/StageColumn.tsx
import { Candidate } from "@/lib/data/candidates";
import { StageName } from "@/lib/data/program";
import { CandidateCard } from "./CandidateCard";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: StageName;
  candidates: Candidate[];
  accentClass: string;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
  selectedIds?: Set<string>;
  onSelect?: (candidateId: string, checked: boolean) => void;
};

export function StageColumn({ label, candidates, accentClass, onAdvance, selectedIds, onSelect }: Props) {
  return (
    <div className="flex flex-col min-w-[160px] max-w-[180px] flex-shrink-0">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${accentClass}`}>
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</span>
        <Badge variant="secondary" className="text-xs">{candidates.length}</Badge>
      </div>
      <div className="space-y-2 flex-1">
        {candidates.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-4">No candidates</p>
        ) : (
          candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              currentStage={label}
              onAdvance={onAdvance}
              selected={selectedIds?.has(c.id) ?? false}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
npm run build
```

Expected: clean build — `PipelineBoard` still calls `StageColumn` without `selectedIds`/`onSelect` so nothing breaks.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/StageColumn.tsx
git commit -m "feat: thread selectedIds and onSelect through StageColumn"
```

---

### Task 3: Wire bulk shortlist state into `PipelineBoard`

**Files:**
- Modify: `components/pipeline/PipelineBoard.tsx`

Add `selectedIds: Set<string>` state. Add `handleSelect` (toggles a candidate in/out of the set). Add `handleBulkShortlist` (advances all selected IDs to Shortlisted via `stageOverrides`, then clears selection). Add a "Shortlist selected (N)" button in the filter bar (admin-only, visible when `selectedIds.size > 0`). Pass `selectedIds` and `onSelect` to every `StageColumn` — `CandidateCard` already gates checkbox rendering on `currentStage === "Assessed"`, so passing to all columns is safe.

The current file is at `components/pipeline/PipelineBoard.tsx`.

- [ ] **Step 1: Rewrite `components/pipeline/PipelineBoard.tsx`**

```tsx
// components/pipeline/PipelineBoard.tsx
"use client";
import { useState, useEffect } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { getNextStage } from "@/lib/pipeline";
import { StageColumn } from "./StageColumn";
import { usePersona } from "@/lib/persona";
import { CheckSquare } from "lucide-react";

const accentClasses = [
  "border-slate-300",
  "border-blue-400",
  "border-violet-400",
  "border-amber-400",
  "border-orange-400",
  "border-emerald-400",
];

export function PipelineBoard() {
  const [filter, setFilter] = useState<"all" | "high" | "emerging">("all");
  const [stageOverrides, setStageOverrides] = useState<Record<string, StageName>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  const filtered = allCandidates.filter((c) => {
    if (filter === "high") return c.potentialScore >= 80;
    if (filter === "emerging") return c.potentialScore >= 65 && c.potentialScore < 80;
    return true;
  });

  // currentStage comes from the column label, which equals effectiveStage(id) by construction.
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
    <div className="space-y-4">
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

Expected: all 43 tests pass (no new tests — this is pure UI state).

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Go to `http://localhost:3000`, choose **Admin**.
2. Navigate to **Pipeline**.
3. Confirm: Assessed-stage cards show a small checkbox in the top-left corner.
4. Check 2–3 Assessed candidates — confirm cards get an indigo border/tint and the "Shortlist selected (N)" button appears in the filter bar.
5. Click "Shortlist selected (N)" — confirm all checked cards disappear from Assessed and appear in Shortlisted. Counter updates. Selection clears.
6. Switch to Graduate persona — confirm no checkboxes are visible and no bulk action button appears.
7. Confirm: non-Assessed columns (Applied, Shortlisted, Interview, etc.) show no checkboxes.

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/PipelineBoard.tsx
git commit -m "feat: wire bulk shortlist state into PipelineBoard"
```

---

## Self-Review

**Spec coverage:**
- ✅ Checkboxes on Assessed-stage candidate cards — Task 1 (`showCheckbox` guard: `currentStage === "Assessed" && persona === "admin"`)
- ✅ "Shortlist selected (N)" action — Task 3 (`handleBulkShortlist` + bulk action button)
- ✅ Admin-only — `mounted && persona === "admin"` guard in both `CandidateCard` (checkbox) and `PipelineBoard` (button)
- ✅ Cards move from Assessed to Shortlisted on bulk action — Task 3 (`stageOverrides` updated to `"Shortlisted"` for all selected IDs)
- ✅ Selection clears after bulk action — Task 3 (`setSelectedIds(new Set())`)
- ✅ Selected cards visually distinguished — Task 1 (indigo border + `bg-indigo-50/30` tint)
- ✅ Count shown on button — Task 3 (`selectedIds.size` in button label)

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `onSelect: (candidateId: string, checked: boolean) => void` — defined in `CandidateCardProps`, matches `StageColumn.Props`, matches `handleSelect` signature in `PipelineBoard`. ✅
- `selectedIds: Set<string>` — typed consistently in `PipelineBoard` state and `StageColumn.Props`. ✅
- `selected?: boolean` in `CandidateCardProps` — consumed as `selected={selectedIds?.has(c.id) ?? false}` in `StageColumn`. ✅
