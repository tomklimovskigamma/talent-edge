# Bulk Reject with Email Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Reject selected (N)" pipeline action that opens a modal with an editable rejection email, previews it for the first selected candidate, and on confirm moves all selected candidates to a hidden `"Rejected"` stage.

**Architecture:** A pure `expandRejectionTemplate` helper + template constant live in a new `lib/reject.ts`. A new `RejectModal` client component owns the template editing state. `PipelineBoard` gains `rejectOpen` state, a new bulk action, and gating for the existing Shortlist action. Rejected candidates are hidden because the board's column loop doesn't include a `"Rejected"` entry in `stages[]`.

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, lucide-react (`Ban`, `X`), vitest.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/data/program.ts` | Modify | Add `"Rejected"` to `StageName` union |
| `lib/reject.ts` | Create | `DEFAULT_REJECTION_TEMPLATE`, `expandRejectionTemplate` |
| `__tests__/reject.test.ts` | Create | Unit tests for the expansion helper |
| `components/pipeline/RejectModal.tsx` | Create | Modal with template editor + live preview |
| `components/pipeline/CandidateCard.tsx` | Modify | Broaden checkbox visibility to include Applied, Assessed, Shortlisted, Interview |
| `components/pipeline/PipelineBoard.tsx` | Modify | `rejectOpen` state, gated Shortlist button, new Reject button, mount the modal |

---

### Task 1: Extend `StageName` to include `"Rejected"`

**Files:**
- Modify: `lib/data/program.ts`

Adding `"Rejected"` to the union is safe: `stages[]` is unchanged, so no column renders for it. All existing `StageName` exhaustive switches would fail if any exist — they don't in this codebase, but we confirm by running `tsc` via `npm run build`.

- [ ] **Step 1: Edit `lib/data/program.ts`**

Change line 18 from:

```ts
export type StageName = "Applied" | "Assessed" | "Shortlisted" | "Interview" | "Offer" | "Hired";
```

to:

```ts
export type StageName = "Applied" | "Assessed" | "Shortlisted" | "Interview" | "Offer" | "Hired" | "Rejected";
```

Leave `stages[]` and `pipelineCounts` unchanged. `pipelineCounts` is typed `Record<StageName, number>` — adding `"Rejected"` to the union requires adding it here too:

Change lines 29-36 from:

```ts
export const pipelineCounts: Record<StageName, number> = {
  Applied: 187,
  Assessed: 142,
  Shortlisted: 43,
  Interview: 21,
  Offer: 9,
  Hired: 6,
};
```

to:

```ts
export const pipelineCounts: Record<StageName, number> = {
  Applied: 187,
  Assessed: 142,
  Shortlisted: 43,
  Interview: 21,
  Offer: 9,
  Hired: 6,
  Rejected: 0,
};
```

- [ ] **Step 2: Confirm build passes**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build 2>&1 | tail -10
```

Expected: clean build.

- [ ] **Step 3: Run tests**

```bash
npm test 2>&1 | tail -10
```

Expected: 150/150 pass.

- [ ] **Step 4: Commit**

```bash
git add lib/data/program.ts
git commit -m "feat: add Rejected to StageName union"
```

---

### Task 2: `lib/reject.ts` — template constant + expansion helper + tests

**Files:**
- Create: `lib/reject.ts`
- Create: `__tests__/reject.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/reject.test.ts`:

```ts
// __tests__/reject.test.ts
import { describe, it, expect } from "vitest";
import { DEFAULT_REJECTION_TEMPLATE, expandRejectionTemplate } from "@/lib/reject";

describe("expandRejectionTemplate", () => {
  it("substitutes {name} with the candidate's name", () => {
    const result = expandRejectionTemplate("Hi {name},", { name: "Jane Doe" }, "Program X");
    expect(result).toBe("Hi Jane Doe,");
  });

  it("substitutes {program} with the program name", () => {
    const result = expandRejectionTemplate(
      "interest in the {program}.",
      { name: "Jane" },
      "2026 Graduate Program"
    );
    expect(result).toBe("interest in the 2026 Graduate Program.");
  });

  it("replaces all occurrences of each token", () => {
    const result = expandRejectionTemplate(
      "{name} … {program} … {name} again",
      { name: "Jane" },
      "Prog"
    );
    expect(result).toBe("Jane … Prog … Jane again");
  });

  it("returns a template with no tokens unchanged", () => {
    const result = expandRejectionTemplate("No tokens here.", { name: "J" }, "P");
    expect(result).toBe("No tokens here.");
  });

  it("leaves unknown tokens untouched", () => {
    const result = expandRejectionTemplate("Hi {foo}", { name: "Jane" }, "P");
    expect(result).toBe("Hi {foo}");
  });

  it("exports a sensible default template containing both tokens", () => {
    expect(DEFAULT_REJECTION_TEMPLATE).toContain("{name}");
    expect(DEFAULT_REJECTION_TEMPLATE).toContain("{program}");
  });
});
```

- [ ] **Step 2: Confirm tests fail**

```bash
npm test -- __tests__/reject.test.ts 2>&1 | tail -15
```

Expected: module-not-found on `@/lib/reject`.

- [ ] **Step 3: Create `lib/reject.ts`**

```ts
// lib/reject.ts
export const DEFAULT_REJECTION_TEMPLATE = `Hi {name},

Thank you for your interest in the {program}. After careful consideration, we will not be progressing with your application at this time.

We wish you the best in your continued career journey.

Kind regards,
The Meridian Group Talent Team`;

export function expandRejectionTemplate(
  template: string,
  candidate: { name: string },
  programName: string
): string {
  return template
    .replaceAll("{name}", candidate.name)
    .replaceAll("{program}", programName);
}
```

- [ ] **Step 4: Confirm tests pass**

```bash
npm test -- __tests__/reject.test.ts 2>&1 | tail -15
```

Expected: 6/6 pass.

- [ ] **Step 5: Full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 156/156 pass (150 existing + 6 new).

- [ ] **Step 6: Commit**

```bash
git add lib/reject.ts __tests__/reject.test.ts
git commit -m "feat: add rejection template helper with tests"
```

---

### Task 3: `RejectModal` component

**Files:**
- Create: `components/pipeline/RejectModal.tsx`

Self-contained modal: receives `candidates[]`, `onCancel`, `onConfirm`. Owns local `template` state. Renders the candidate list, editable textarea, live preview for the first candidate, and two footer buttons.

- [ ] **Step 1: Create `components/pipeline/RejectModal.tsx`**

```tsx
// components/pipeline/RejectModal.tsx
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { Badge } from "@/components/ui/badge";
import { stageColor } from "@/lib/utils";
import { program } from "@/lib/data/program";
import { DEFAULT_REJECTION_TEMPLATE, expandRejectionTemplate } from "@/lib/reject";

type Props = {
  candidates: Candidate[];
  onCancel: () => void;
  onConfirm: () => void;
};

export function RejectModal({ candidates, onCancel, onConfirm }: Props) {
  const [template, setTemplate] = useState(DEFAULT_REJECTION_TEMPLATE);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const first = candidates[0];
  const preview = first
    ? expandRejectionTemplate(template, first, program.programName)
    : "";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 id="reject-modal-title" className="text-base font-bold text-slate-800">
            Send Rejection
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close rejection modal"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected candidates */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Rejecting {candidates.length} candidate{candidates.length === 1 ? "" : "s"}
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1.5">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{c.name}</span>
                <Badge className={`text-xs ${stageColor(c.stage)}`}>{c.stage}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Template editor */}
        <div className="px-6 py-4 space-y-1.5">
          <label
            htmlFor="reject-template"
            className="block text-xs font-semibold text-slate-500 uppercase tracking-wide"
          >
            Email Template
          </label>
          <p className="text-xs text-slate-400">
            Tokens <code className="bg-slate-100 px-1 rounded">{"{name}"}</code> and{" "}
            <code className="bg-slate-100 px-1 rounded">{"{program}"}</code> are replaced per candidate.
          </p>
          <textarea
            id="reject-template"
            rows={10}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white resize-y font-mono"
          />
        </div>

        {/* Live preview */}
        {first && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Preview for {first.name}
            </p>
            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-lg p-3">
              {preview}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Send rejections ({candidates.length})
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/RejectModal.tsx
git commit -m "feat: add RejectModal with editable template and preview"
```

---

### Task 4: Broaden `CandidateCard` checkbox visibility

**Files:**
- Modify: `components/pipeline/CandidateCard.tsx`

Checkboxes must be visible on Applied, Assessed, Shortlisted, and Interview stages (not Offer or Hired). The current code restricts to Assessed only at line 37.

- [ ] **Step 1: Edit `components/pipeline/CandidateCard.tsx`**

Locate line 37:

```tsx
  const showCheckbox = mounted && persona === "admin" && currentStage === "Assessed" && !!onSelect;
```

Replace with:

```tsx
  const SELECTABLE_STAGES: StageName[] = ["Applied", "Assessed", "Shortlisted", "Interview"];
  const showCheckbox = mounted && persona === "admin" && SELECTABLE_STAGES.includes(currentStage) && !!onSelect;
```

`StageName` is already imported at the top of the file (see current line 6: `import { type StageName } from "@/lib/data/program";`). No new imports required.

- [ ] **Step 2: Run tests**

```bash
npm test 2>&1 | tail -10
```

Expected: 156/156 pass.

- [ ] **Step 3: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add components/pipeline/CandidateCard.tsx
git commit -m "feat: broaden pipeline checkbox visibility to Applied/Shortlisted/Interview"
```

---

### Task 5: Wire `RejectModal` into `PipelineBoard` with gated Shortlist

**Files:**
- Modify: `components/pipeline/PipelineBoard.tsx`

Add `rejectOpen` state, a `handleBulkReject` handler, a `shortlistableCount` derived value for gating the Shortlist button, and a new Reject button alongside the existing actions. Render the modal conditionally.

- [ ] **Step 1: Rewrite `components/pipeline/PipelineBoard.tsx`**

Replace the full file with:

```tsx
"use client";
import { useState, useEffect } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { getNextStage, filterCandidates, type ScoreBand } from "@/lib/pipeline";
import { ComparisonDrawer } from "./ComparisonDrawer";
import { StageColumn } from "./StageColumn";
import { RejectModal } from "./RejectModal";
import { usePersona } from "@/lib/persona";
import { Ban, CheckSquare, Layers, Search, X } from "lucide-react";

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
  const [compareOpen, setCompareOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  // Auto-close the comparison drawer if selection drops below 2
  useEffect(() => {
    if (selectedIds.size < 2) setCompareOpen(false);
  }, [selectedIds]);

  const filtered = filterCandidates(allCandidates, search, filter);

  const effectiveStage = (candidateId: string, originalStage: StageName): StageName =>
    stageOverrides[candidateId] ?? originalStage;

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
        const candidate = allCandidates.find((c) => c.id === id);
        if (!candidate) continue;
        if (effectiveStage(candidate.id, candidate.stage) === "Assessed") {
          next[id] = "Shortlisted";
        }
      }
      return next;
    });
    setSelectedIds(new Set());
  }

  function handleBulkReject() {
    setStageOverrides((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) next[id] = "Rejected";
      return next;
    });
    setSelectedIds(new Set());
    setRejectOpen(false);
  }

  const showBulkAction = mounted && persona === "admin" && selectedIds.size > 0;
  const showCompare = showBulkAction && selectedIds.size >= 2 && selectedIds.size <= 3;
  const selectedCandidates = allCandidates.filter((c) => selectedIds.has(c.id));
  const shortlistableCount = selectedCandidates.filter(
    (c) => effectiveStage(c.id, c.stage) === "Assessed"
  ).length;

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
            <>
              <button
                type="button"
                onClick={handleBulkShortlist}
                disabled={shortlistableCount === 0}
                title={shortlistableCount === 0 ? "Only Assessed candidates can be shortlisted" : undefined}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-violet-600 text-white transition-colors ${
                  shortlistableCount === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-violet-700"
                }`}
              >
                <CheckSquare size={12} aria-hidden="true" />
                Shortlist selected ({shortlistableCount})
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                <Ban size={12} aria-hidden="true" />
                Reject selected ({selectedIds.size})
              </button>
            </>
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

      {/* Reject modal */}
      {rejectOpen && (
        <RejectModal
          candidates={selectedCandidates}
          onCancel={() => setRejectOpen(false)}
          onConfirm={handleBulkReject}
        />
      )}
    </div>
  );
}
```

Notes on the changes:
- `handleBulkShortlist` now only moves candidates that are currently in Assessed (guards against noop moves if the selection spans stages).
- `shortlistableCount` drives both the badge count and the disabled state.
- The Reject button sits after Shortlist inside the same `showBulkAction` wrapper.
- `Ban` icon is imported from lucide-react.
- `effectiveStage` was moved above `handleAdvance` so it's visible to `handleBulkShortlist`.

- [ ] **Step 2: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 156/156 pass.

- [ ] **Step 3: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000`, switch to **Admin**.
2. Navigate to **Pipeline**.
3. Tick one Applied-stage card — confirm:
   - Checkbox now works on Applied (previously only Assessed).
   - "Shortlist selected (0)" appears, disabled, with tooltip "Only Assessed candidates can be shortlisted".
   - "Reject selected (1)" appears, rose-coloured, enabled.
4. Tick a second card in Assessed — confirm:
   - "Shortlist selected (1)" — the 1 is the assessed count, not total.
   - "Reject selected (2)" — full selection count.
5. Tick a third card in Interview — "Reject selected (3)".
6. Click **Reject selected (3)** — modal appears showing:
   - Header "Send Rejection" with × close button
   - "Rejecting 3 candidates" with the names and stage badges listed
   - Editable textarea with the default template (containing `{name}` and `{program}`)
   - "Preview for {firstName}" card below showing the template expanded for the first candidate (name + program substituted)
   - Footer "Cancel" + "Send rejections (3)"
7. Edit the textarea — confirm the preview updates live.
8. Press **Escape** — modal closes, selections intact.
9. Reopen the modal, click **Send rejections (3)** — confirm:
   - Modal closes
   - All three selected candidates disappear from the board (moved to `"Rejected"`, which has no column)
   - Selection clears
10. Tick candidates in Offer and Hired stages — confirm checkboxes do NOT appear for those stages.
11. Switch to **Graduate** persona — confirm no checkboxes and no bulk buttons appear anywhere.

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/PipelineBoard.tsx
git commit -m "feat: wire RejectModal into pipeline with Shortlist gating"
```

---

## Self-Review

**Spec coverage:**
- ✅ `"Rejected"` added to `StageName`, not to `stages[]` — Task 1
- ✅ `pipelineCounts` extended with `Rejected: 0` — Task 1 (required by the `Record<StageName, number>` type constraint)
- ✅ Checkbox expanded to Applied/Assessed/Shortlisted/Interview — Task 4
- ✅ Shortlist badge shows `shortlistableCount` — Task 5
- ✅ Shortlist disabled when `shortlistableCount === 0` with tooltip — Task 5
- ✅ Shortlist no longer moves non-Assessed candidates — Task 5 (`handleBulkShortlist` gated)
- ✅ Reject button (rose, `Ban` icon) alongside Shortlist, always enabled while selection > 0 — Task 5
- ✅ RejectModal: backdrop, close-on-escape, close-on-backdrop-click, × button — Task 3
- ✅ Selected candidates list with name + stage badge — Task 3
- ✅ Editable template textarea prefilled with `DEFAULT_REJECTION_TEMPLATE` — Task 3
- ✅ Live preview for first candidate using `expandRejectionTemplate` — Task 3
- ✅ Footer Cancel + Send rejections (N) — Task 3
- ✅ Confirm moves all selected to `"Rejected"` and clears selection — Task 5 (`handleBulkReject`)
- ✅ Tests for expansion helper — Task 2

**Placeholder scan:** None.

**Type consistency:**
- `expandRejectionTemplate(template, { name }, programName)` signature matches between Task 2 definition and Task 3 call site. ✅
- `RejectModal` props `{ candidates, onCancel, onConfirm }` match Task 3 signature and Task 5 usage. ✅
- `StageName` import unchanged in `CandidateCard.tsx`; `SELECTABLE_STAGES: StageName[]` uses the existing type. ✅
- `pipelineCounts` keys are `StageName`-checked by TypeScript; adding `Rejected: 0` satisfies the `Record<StageName, number>` constraint. ✅
