# Pipeline Stage Advancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "Advance to [next stage]" hover action to every candidate card on the pipeline board so admins can move candidates forward through the pipeline without leaving the kanban view.

**Architecture:** A pure `getNextStage` function lives in `lib/pipeline.ts`. Stage override state lives in `PipelineBoard` (the existing client component that owns the board) as a `Record<candidateId, StageName>` map — no persistence, resets on page refresh which is correct for a demo. Props are threaded leaf-first: `CandidateCard` gains optional `currentStage`/`onAdvance` props first, then `StageColumn` passes them through, then `PipelineBoard` wires up state and the callback. Each task produces a passing build.

**Tech Stack:** TypeScript, vitest (already configured), React 19 client components, lucide-react, existing `usePersona` hook, existing `StageName` type from `lib/data/program.ts`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/pipeline.ts` | Create | Pure `getNextStage(stage: StageName): StageName \| null` |
| `__tests__/pipeline.test.ts` | Create | Unit tests for stage progression |
| `components/pipeline/CandidateCard.tsx` | Modify | Add `currentStage?`, `onAdvance?` props + advance button (admin-only) |
| `components/pipeline/StageColumn.tsx` | Modify | Accept + pass `onAdvance` and `currentStage` to cards |
| `components/pipeline/PipelineBoard.tsx` | Modify | Add `stageOverrides` state, `handleAdvance`, pass to columns |

---

### Task 1: Pure stage progression logic

**Files:**
- Create: `lib/pipeline.ts`
- Create: `__tests__/pipeline.test.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/pipeline.test.ts`**

```ts
// __tests__/pipeline.test.ts
import { describe, it, expect } from "vitest";
import { getNextStage } from "@/lib/pipeline";

describe("getNextStage", () => {
  it("Applied → Assessed", () => {
    expect(getNextStage("Applied")).toBe("Assessed");
  });

  it("Assessed → Shortlisted", () => {
    expect(getNextStage("Assessed")).toBe("Shortlisted");
  });

  it("Shortlisted → Interview", () => {
    expect(getNextStage("Shortlisted")).toBe("Interview");
  });

  it("Interview → Offer", () => {
    expect(getNextStage("Interview")).toBe("Offer");
  });

  it("Offer → Hired", () => {
    expect(getNextStage("Offer")).toBe("Hired");
  });

  it("Hired → null (no next stage)", () => {
    expect(getNextStage("Hired")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- --reporter=verbose 2>&1 | grep -E "FAIL|Cannot find"
```

Expected: 6 tests fail with `Cannot find module '@/lib/pipeline'`.

- [ ] **Step 3: Create `lib/pipeline.ts`**

```ts
// lib/pipeline.ts
import { type StageName } from "@/lib/data/program";

const stageOrder: StageName[] = [
  "Applied",
  "Assessed",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
];

export function getNextStage(current: StageName): StageName | null {
  const idx = stageOrder.indexOf(current);
  if (idx === -1 || idx === stageOrder.length - 1) return null;
  return stageOrder[idx + 1];
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

```bash
npm test
```

Expected: `33 tests passed` (27 existing + 6 new).

- [ ] **Step 5: Commit**

```bash
git add lib/pipeline.ts __tests__/pipeline.test.ts
git commit -m "feat: add getNextStage pure function with tests"
```

---

### Task 2: Update `CandidateCard` with advance button

**Files:**
- Modify: `components/pipeline/CandidateCard.tsx`

The card gains two optional props so this task builds cleanly before `StageColumn`/`PipelineBoard` are updated. `currentStage` defaults to `candidate.stage` so existing callers are unaffected. The advance button is hidden until `onAdvance` is provided and persona is admin.

The current file at `components/pipeline/CandidateCard.tsx`:

```tsx
// components/pipeline/CandidateCard.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import { Clock, Send, CalendarPlus } from "lucide-react";
import { ScheduleModal } from "@/components/pipeline/ScheduleModal";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const [showSchedule, setShowSchedule] = useState(false);
  // ... rest of component
```

- [ ] **Step 1: Rewrite `components/pipeline/CandidateCard.tsx`**

```tsx
// components/pipeline/CandidateCard.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreColor } from "@/lib/utils";
import { usePersona } from "@/lib/persona";
import { getNextStage } from "@/lib/pipeline";
import { Clock, Send, CalendarPlus, ArrowRight } from "lucide-react";
import { ScheduleModal } from "@/components/pipeline/ScheduleModal";

type Props = {
  candidate: Candidate;
  currentStage?: StageName;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
};

export function CandidateCard({ candidate, currentStage = candidate.stage as StageName, onAdvance }: Props) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  const nextStage = getNextStage(currentStage);
  const showAdvance = mounted && persona === "admin" && !!onAdvance && !!nextStage;

  return (
    <>
      <div className="group relative">
        <Link href={`/candidates/${candidate.id}`}>
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
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
            onClick={() => onAdvance!(candidate.id, currentStage)}
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
npm run build
```

Expected: clean build — `CandidateCard` now accepts optional props; `StageColumn` still calls it without them so nothing breaks.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/CandidateCard.tsx
git commit -m "feat: add advance button to CandidateCard (admin-only, wired via optional props)"
```

---

### Task 3: Thread `onAdvance` through `StageColumn`

**Files:**
- Modify: `components/pipeline/StageColumn.tsx`

Add `onAdvance` as an optional prop. Pass it and `currentStage` (the column's label cast to `StageName`) to each `CandidateCard`.

The current file at `components/pipeline/StageColumn.tsx`:

```tsx
import { Candidate } from "@/lib/data/candidates";
import { CandidateCard } from "./CandidateCard";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  candidates: Candidate[];
  accentClass: string;
};

export function StageColumn({ label, candidates, accentClass }: Props) {
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
          candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `components/pipeline/StageColumn.tsx`**

```tsx
// components/pipeline/StageColumn.tsx
import { Candidate } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { CandidateCard } from "./CandidateCard";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: StageName;
  candidates: Candidate[];
  accentClass: string;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
};

export function StageColumn({ label, candidates, accentClass, onAdvance }: Props) {
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

Expected: clean build — `StageColumn` now accepts and forwards the optional `onAdvance` prop; `PipelineBoard` still calls it without it so nothing breaks.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/StageColumn.tsx
git commit -m "feat: thread onAdvance and currentStage through StageColumn"
```

---

### Task 4: Wire state into `PipelineBoard`

**Files:**
- Modify: `components/pipeline/PipelineBoard.tsx`

Add `stageOverrides` state (a `Record<candidateId, StageName>` map). Implement `handleAdvance`. Use the effective stage when filtering candidates into columns. Pass `onAdvance` to each `StageColumn`.

The current file at `components/pipeline/PipelineBoard.tsx`:

```tsx
"use client";
import { useState } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages } from "@/lib/data/program";
import { StageColumn } from "./StageColumn";

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

  const filtered = allCandidates.filter((c) => {
    if (filter === "high") return c.potentialScore >= 80;
    if (filter === "emerging") return c.potentialScore >= 65 && c.potentialScore < 80;
    return true;
  });

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
        <span className="ml-auto text-xs text-slate-400">{filtered.length} candidates shown</span>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <StageColumn
            key={stage.id}
            label={stage.label}
            candidates={filtered.filter((c) => c.stage === stage.label)}
            accentClass={accentClasses[i]}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `components/pipeline/PipelineBoard.tsx`**

```tsx
// components/pipeline/PipelineBoard.tsx
"use client";
import { useState } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { getNextStage } from "@/lib/pipeline";
import { StageColumn } from "./StageColumn";

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

  function handleAdvance(candidateId: string, currentStage: StageName) {
    const next = getNextStage(currentStage);
    if (!next) return;
    setStageOverrides((prev) => ({ ...prev, [candidateId]: next }));
  }

  const effectiveStage = (candidateId: string, originalStage: StageName): StageName =>
    stageOverrides[candidateId] ?? originalStage;

  const filtered = allCandidates.filter((c) => {
    if (filter === "high") return c.potentialScore >= 80;
    if (filter === "emerging") return c.potentialScore >= 65 && c.potentialScore < 80;
    return true;
  });

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
        <span className="ml-auto text-xs text-slate-400">{filtered.length} candidates shown</span>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <StageColumn
            key={stage.id}
            label={stage.label as StageName}
            candidates={filtered.filter(
              (c) => effectiveStage(c.id, c.stage as StageName) === stage.label
            )}
            accentClass={accentClasses[i]}
            onAdvance={handleAdvance}
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

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

1. Go to [http://localhost:3000](http://localhost:3000) and choose **Admin**.
2. Navigate to **Pipeline**.
3. Hover any candidate card — confirm "Advance to [Next Stage]" button appears in green below the card.
4. Click "Advance to Shortlisted" on an Assessed candidate — confirm the card disappears from Assessed and immediately appears in Shortlisted. Column counts update.
5. Hover an Applied card — confirm both "Send assessment" and "Advance to Assessed" appear.
6. Hover an Interview card — confirm both "Schedule interview" and "Advance to Offer" appear.
7. Hover a Hired card — confirm NO advance button (Hired is the final stage).
8. Switch to Graduate persona at `/` — navigate back to Pipeline. Confirm no advance buttons are visible on hover.

- [ ] **Step 4: Commit**

```bash
git add components/pipeline/PipelineBoard.tsx
git commit -m "feat: wire stage override state into PipelineBoard for live advancement"
```

---

## Self-Review

**Spec coverage:**
- ✅ "Advance to [next stage]" action on candidate cards — Task 2 (button) + Task 4 (state)
- ✅ Admin-only — Task 2 (`mounted && persona === "admin"`)
- ✅ Card moves to next column immediately on click — Task 4 (`stageOverrides` state update)
- ✅ No advance button on Hired (final stage) — Task 1 (`getNextStage` returns null)
- ✅ Existing CTAs (Send assessment, Schedule interview) preserved — Task 2 (still present, now keyed to `currentStage`)
- ✅ Column counts update — automatic (derived from `stageOverrides` in `effectiveStage`)
- ✅ No persistence required (demo) — state resets on page refresh as intended

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `StageName` is imported from `@/lib/data/program` in all four modified files — consistent.
- `onAdvance: (candidateId: string, currentStage: StageName) => void` — signature matches in CandidateCard (definition), StageColumn (passthrough), and PipelineBoard (implementation). ✅
- `getNextStage` imported from `@/lib/pipeline` in both `CandidateCard` and `PipelineBoard` — consistent. ✅
- `currentStage` in CandidateCard defaults to `candidate.stage as StageName` — safe cast since `Candidate.stage` is typed as `StageName`. ✅
