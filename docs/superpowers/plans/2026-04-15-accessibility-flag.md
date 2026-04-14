# Accessibility Flag Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface a visible accessibility flag on pipeline cards and candidate profiles for any candidate who requested accommodations during Registration.

**Architecture:** Add `accessibilityNeeds?: string` to the `Candidate` type and seed three candidates with it. `CandidateCard` already knows `candidate` and `persona` — add an admin-gated icon badge there. `ProfileHeader` is a server component that renders the stage badge row; add the flag in the same row (no persona guard needed — admins are the only ones who reach `/candidates/[id]`).

**Tech Stack:** TypeScript, React 19, Tailwind v4, lucide-react (`Accessibility` icon already imported in `RegistrationStep`), existing `usePersona` hook.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/data/candidates.ts` | Modify | Add `accessibilityNeeds?: string` to `Candidate` type; seed three candidates |
| `components/pipeline/CandidateCard.tsx` | Modify | Render `Accessibility` icon badge on card when admin + `accessibilityNeeds` set |
| `components/profile/ProfileHeader.tsx` | Modify | Render accessibility flag badge in the stage-badge row |

---

### Task 1: Add `accessibilityNeeds` to `Candidate` type and seed data

**Files:**
- Modify: `lib/data/candidates.ts:39-53` (type definition)
- Modify: `lib/data/candidates.ts:172-187` (c005 Sophie Williams — Assessed)
- Modify: `lib/data/candidates.ts:289-303` (c010 Tom Nguyen — Assessed)
- Modify: `lib/data/candidates.ts:218-233` (c007 Ella Fitzgerald — Applied)

- [ ] **Step 1: Add `accessibilityNeeds` to the `Candidate` type**

In `lib/data/candidates.ts`, update the `Candidate` type (currently ends at line 53) to add the optional field:

```ts
export type Candidate = {
  id: string;
  name: string;
  university: string;
  degree: string;
  graduationYear: number;
  stage: StageName;
  appliedDate: string;
  daysInStage: number;
  potentialScore: number;
  dimensions: PotentialDimensions;
  assessmentHistory: AssessmentEvent[];
  developmentGoals?: DevelopmentGoal[];
  avatarInitials: string;
  startDate?: string;
  accessibilityNeeds?: string;
};
```

- [ ] **Step 2: Seed c005 (Sophie Williams) with an accessibility need**

Find the `c005` object (Sophie Williams, stage `"Assessed"`) and add `accessibilityNeeds` after `avatarInitials`:

```ts
    avatarInitials: "SW",
    accessibilityNeeds: "Extended time required (dyslexia).",
```

- [ ] **Step 3: Seed c010 (Tom Nguyen) with an accessibility need**

Find the `c010` object (Tom Nguyen, stage `"Assessed"`) and add:

```ts
    avatarInitials: "TN",
    accessibilityNeeds: "Screen reader support required.",
```

- [ ] **Step 4: Seed c007 (Ella Fitzgerald) with an accessibility need**

Find the `c007` object (Ella Fitzgerald, stage `"Applied"`) and add:

```ts
    avatarInitials: "EF",
    accessibilityNeeds: "Neurodiversity accommodations requested.",
```

- [ ] **Step 5: Confirm build passes**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build
```

Expected: clean build — the new optional field is additive; all existing candidate objects satisfy the updated type.

- [ ] **Step 6: Commit**

```bash
git add lib/data/candidates.ts
git commit -m "feat: add accessibilityNeeds field to Candidate type; seed three candidates"
```

---

### Task 2: Accessibility badge on `CandidateCard`

**Files:**
- Modify: `components/pipeline/CandidateCard.tsx`

Show a small `Accessibility` icon inside the card header row when two conditions are both true: the admin persona is active AND `candidate.accessibilityNeeds` is a non-empty string. Wrap it in a `<span title={candidate.accessibilityNeeds}>` so hovering reveals the detail text. Show it only after mount (same `mounted` guard already used for other admin controls) to avoid hydration mismatch.

The icon sits to the left of the score badge, inside the `flex items-start justify-between` header row.

- [ ] **Step 1: Rewrite `components/pipeline/CandidateCard.tsx`**

Replace the entire file with the following (the only changes from the current file are: import `Accessibility` from lucide-react, add `showAccessibility` derived bool, and render the icon):

```tsx
// components/pipeline/CandidateCard.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreColor } from "@/lib/utils";
import { Clock, Send, CalendarPlus, ArrowRight, Accessibility } from "lucide-react";
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
  const showAccessibility = mounted && persona === "admin" && !!candidate.accessibilityNeeds;

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
              <div className="flex items-center gap-1 flex-shrink-0">
                {showAccessibility && (
                  <span
                    title={candidate.accessibilityNeeds}
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-600"
                    aria-label={`Accessibility note: ${candidate.accessibilityNeeds}`}
                  >
                    <Accessibility size={11} />
                  </span>
                )}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreColor(candidate.potentialScore)}`}>
                  {candidate.potentialScore}
                </span>
              </div>
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
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add components/pipeline/CandidateCard.tsx
git commit -m "feat: show accessibility flag badge on pipeline card (admin only)"
```

---

### Task 3: Accessibility flag on `ProfileHeader`

**Files:**
- Modify: `components/profile/ProfileHeader.tsx`

Add an `Accessibility` badge in the same `flex items-center gap-2 mt-2` row that currently shows the stage badge and applied date. No persona guard is needed — only admins navigate to `/candidates/[id]`. Show the badge only when `candidate.accessibilityNeeds` is a non-empty string. Use a `<span title={...}>` to expose the detail text on hover.

- [ ] **Step 1: Rewrite `components/profile/ProfileHeader.tsx`**

```tsx
import { Candidate } from "@/lib/data/candidates";
import { scoreLabel, stageColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, Accessibility } from "lucide-react";

export function ProfileHeader({ candidate }: { candidate: Candidate }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
            {candidate.avatarInitials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{candidate.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <GraduationCap size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">{candidate.university}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">{candidate.degree}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={stageColor(candidate.stage)}>{candidate.stage}</Badge>
              {candidate.accessibilityNeeds && (
                <span
                  title={candidate.accessibilityNeeds}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200"
                  aria-label={`Accessibility note: ${candidate.accessibilityNeeds}`}
                >
                  <Accessibility size={11} />
                  Accommodations requested
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} />
                Applied {new Date(candidate.appliedDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${
            candidate.potentialScore >= 80 ? "border-emerald-400 bg-emerald-50" :
            candidate.potentialScore >= 65 ? "border-amber-400 bg-amber-50" :
            "border-rose-400 bg-rose-50"
          }`}>
            <span className="text-2xl font-black text-slate-800">{candidate.potentialScore}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">AI Potential Score</p>
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

- [ ] **Step 2: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all existing tests pass (no new tests needed — no pure functions were added).

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Go to `http://localhost:3000`, choose **Admin**.
2. Navigate to **Pipeline**.
3. Confirm: Sophie Williams (Assessed), Tom Nguyen (Assessed), and Ella Fitzgerald (Applied) each show a small violet `Accessibility` icon in the top-right of their cards. Other candidates do not.
4. Hover the icon on Sophie Williams's card — confirm the tooltip reads "Extended time required (dyslexia)."
5. Switch to **Graduate** persona — confirm the accessibility icons disappear from all cards.
6. Switch back to **Admin**, click Sophie Williams's card to open her profile.
7. Confirm: a violet "Accommodations requested" badge appears next to the stage badge, with a tooltip on hover showing the full text.
8. Open Anika Sharma's profile (no accessibility need) — confirm no badge appears.

- [ ] **Step 5: Commit**

```bash
git add components/profile/ProfileHeader.tsx
git commit -m "feat: show accessibility flag on candidate profile header"
```

---

## Self-Review

**Spec coverage:**
- ✅ Candidates who ticked accommodation checkbox surface a visible flag on their pipeline card — Task 2 (`showAccessibility` guard in `CandidateCard`)
- ✅ Flag visible on their profile — Task 3 (`accessibilityNeeds &&` badge in `ProfileHeader`)
- ✅ Flag is admin-only on pipeline cards — Task 2 (`mounted && persona === "admin"` guard)
- ✅ Closes the loop — tooltip exposes the actual accommodation text to the admin — Tasks 2 & 3 (`title={candidate.accessibilityNeeds}`)
- ✅ Three seeded candidates demonstrate the feature across two stages (Applied + Assessed) — Task 1

**Placeholder scan:** None. All code is complete and all paths are explicit.

**Type consistency:**
- `candidate.accessibilityNeeds` is `string | undefined` in `Candidate` — both `CandidateCard` (`!!candidate.accessibilityNeeds`) and `ProfileHeader` (`candidate.accessibilityNeeds &&`) guard on truthiness, which correctly rejects `undefined` and `""`. ✅
- `Accessibility` icon is imported from `lucide-react` in both modified components. ✅
