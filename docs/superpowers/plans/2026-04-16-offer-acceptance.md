# Offer Acceptance Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins mark Offer-stage candidates as accepted or declined (with reason), show a status chip on their pipeline card, dim declined cards, and render an inline status card on the profile with the controls.

**Architecture:** Session-scoped storage in a new `lib/offer.ts` (module-level `Map` + helpers, matching `lib/interview.ts` / `lib/notes.ts` patterns). A new `OfferStatus` client component handles the profile UI — pending shows mark-accepted / mark-declined buttons; declined opens an inline reason form. `CandidateCard` reads the store during render to produce a status chip and apply a dim class to declined cards. Navigation-based refresh is sufficient for demo; no shared reactive store.

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, lucide-react (`Check`, `X`, `XCircle`, `CheckCircle2`), vitest.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/data/candidates.ts` | Modify | Add `offerStatus?` and `offerDeclineReason?` fields to `Candidate` |
| `lib/offer.ts` | Create | `OfferState` type, `DECLINE_REASONS`, `getOfferState`, `markAccepted`, `markDeclined`, `__resetOfferStore` |
| `__tests__/offer.test.ts` | Create | Unit tests for storage helpers |
| `components/profile/OfferStatus.tsx` | Create | Admin-only status card for Offer-stage profiles |
| `components/pipeline/CandidateCard.tsx` | Modify | Show chip + dim class for Offer-stage cards |
| `app/candidates/[id]/page.tsx` | Modify | Mount `<OfferStatus candidate={candidate} />` below `<ProfileHeader />` |

---

### Task 1: Extend `Candidate` type

**Files:**
- Modify: `lib/data/candidates.ts`

Documenting the two fields on the type. No seed changes.

- [ ] **Step 1: Edit `lib/data/candidates.ts`**

Find the `Candidate` type block (around line 39):

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

Add the two new optional fields at the end (before the closing `};`):

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
  offerStatus?: "pending" | "accepted" | "declined";
  offerDeclineReason?: string;
};
```

- [ ] **Step 2: Confirm build passes**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build 2>&1 | tail -5
```

Expected: clean build — both fields are optional so no existing candidate literal needs to change.

- [ ] **Step 3: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 182/182 pass.

- [ ] **Step 4: Commit**

```bash
git add lib/data/candidates.ts
git commit -m "feat: add offerStatus and offerDeclineReason to Candidate"
```

---

### Task 2: `lib/offer.ts` — storage helpers + tests

**Files:**
- Create: `lib/offer.ts`
- Create: `__tests__/offer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/offer.test.ts`:

```ts
// __tests__/offer.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  DECLINE_REASONS,
  getOfferState,
  markAccepted,
  markDeclined,
  __resetOfferStore,
} from "@/lib/offer";

beforeEach(() => {
  __resetOfferStore();
});

describe("getOfferState", () => {
  it("returns pending default for an unseen candidate", () => {
    expect(getOfferState("unknown")).toEqual({
      status: "pending",
      declineReason: null,
      markedAt: null,
    });
  });
});

describe("markAccepted", () => {
  it("sets status to accepted with a markedAt timestamp and no decline reason", () => {
    markAccepted("c001");
    const state = getOfferState("c001");
    expect(state.status).toBe("accepted");
    expect(state.declineReason).toBeNull();
    expect(state.markedAt).toBeTruthy();
  });

  it("clears a prior declineReason when accepting after declining", () => {
    markDeclined("c001", DECLINE_REASONS[0]);
    markAccepted("c001");
    const state = getOfferState("c001");
    expect(state.status).toBe("accepted");
    expect(state.declineReason).toBeNull();
  });
});

describe("markDeclined", () => {
  it("sets status to declined with the reason and a markedAt timestamp", () => {
    markDeclined("c001", "Compensation");
    const state = getOfferState("c001");
    expect(state.status).toBe("declined");
    expect(state.declineReason).toBe("Compensation");
    expect(state.markedAt).toBeTruthy();
  });
});

describe("store isolation", () => {
  it("isolates state per candidate id", () => {
    markAccepted("c001");
    markDeclined("c002", "Other");
    expect(getOfferState("c001").status).toBe("accepted");
    expect(getOfferState("c002").status).toBe("declined");
    expect(getOfferState("c002").declineReason).toBe("Other");
  });
});
```

- [ ] **Step 2: Confirm tests fail**

```bash
npm test -- __tests__/offer.test.ts 2>&1 | tail -10
```

Expected: module-not-found on `@/lib/offer`.

- [ ] **Step 3: Create `lib/offer.ts`**

```ts
// lib/offer.ts
export type OfferStatus = "pending" | "accepted" | "declined";

export const DECLINE_REASONS = [
  "Accepted another offer",
  "Compensation",
  "Role or scope mismatch",
  "Personal circumstances",
  "Other",
] as const;
export type DeclineReason = typeof DECLINE_REASONS[number];

export type OfferState = {
  status: OfferStatus;
  declineReason: DeclineReason | null;
  markedAt: string | null;
};

const BLANK: OfferState = {
  status: "pending",
  declineReason: null,
  markedAt: null,
};

const store = new Map<string, OfferState>();

export function getOfferState(candidateId: string): OfferState {
  const stored = store.get(candidateId);
  return stored ? { ...stored } : { ...BLANK };
}

export function markAccepted(candidateId: string): void {
  store.set(candidateId, {
    status: "accepted",
    declineReason: null,
    markedAt: new Date().toISOString(),
  });
}

export function markDeclined(candidateId: string, reason: DeclineReason): void {
  store.set(candidateId, {
    status: "declined",
    declineReason: reason,
    markedAt: new Date().toISOString(),
  });
}

// Test-only: reset the in-memory store between tests.
export function __resetOfferStore(): void {
  store.clear();
}
```

- [ ] **Step 4: Confirm tests pass**

```bash
npm test -- __tests__/offer.test.ts 2>&1 | tail -10
```

Expected: 5 tests pass.

- [ ] **Step 5: Full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 187/187 pass (182 existing + 5 new).

- [ ] **Step 6: Commit**

```bash
git add lib/offer.ts __tests__/offer.test.ts
git commit -m "feat: add offer acceptance storage helpers with tests"
```

---

### Task 3: `OfferStatus` component

**Files:**
- Create: `components/profile/OfferStatus.tsx`

Client component with three visual states (pending / accepted / declined) and an inline reason form when declining.

- [ ] **Step 1: Create `components/profile/OfferStatus.tsx`**

```tsx
// components/profile/OfferStatus.tsx
"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { usePersona } from "@/lib/persona";
import {
  DECLINE_REASONS,
  getOfferState,
  markAccepted,
  markDeclined,
  type DeclineReason,
  type OfferState,
} from "@/lib/offer";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

export function OfferStatus({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<OfferState>({ status: "pending", declineReason: null, markedAt: null });
  const [mode, setMode] = useState<"idle" | "declining">("idle");
  const [reason, setReason] = useState<DeclineReason>(DECLINE_REASONS[0]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setState(getOfferState(candidate.id));
  }, [candidate.id]);

  if (!mounted || persona !== "admin" || candidate.stage !== "Offer") {
    return null;
  }

  function handleAccept() {
    markAccepted(candidate.id);
    setState(getOfferState(candidate.id));
    setMode("idle");
  }

  function handleConfirmDecline() {
    markDeclined(candidate.id, reason);
    setState(getOfferState(candidate.id));
    setMode("idle");
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Offer Status</h2>

      {state.status === "accepted" && state.markedAt && (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" />
          <span>Offer accepted on {formatTimestamp(state.markedAt)}</span>
        </div>
      )}

      {state.status === "declined" && state.markedAt && (
        <div className="flex items-center gap-2 text-sm text-rose-700">
          <XCircle size={16} className="text-rose-500" aria-hidden="true" />
          <span>
            Offer declined — {state.declineReason} ({formatTimestamp(state.markedAt)})
          </span>
        </div>
      )}

      {state.status === "pending" && mode === "idle" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Mark Accepted
          </button>
          <button
            type="button"
            onClick={() => setMode("declining")}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Mark Declined
          </button>
        </div>
      )}

      {state.status === "pending" && mode === "declining" && (
        <div className="space-y-2">
          <label htmlFor="decline-reason" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Reason
          </label>
          <select
            id="decline-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as DeclineReason)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
          >
            {DECLINE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmDecline}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
git add components/profile/OfferStatus.tsx
git commit -m "feat: add OfferStatus profile component"
```

---

### Task 4: Wire `OfferStatus` into the profile page

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

- [ ] **Step 1: Edit `app/candidates/[id]/page.tsx`**

Add the import after the `ProfileHeader` import:

```tsx
import { OfferStatus } from "@/components/profile/OfferStatus";
```

Insert `<OfferStatus candidate={candidate} />` immediately after `<ProfileHeader />`. The relevant block becomes:

```tsx
        <ProfileHeader candidate={candidate} />

        <OfferStatus candidate={candidate} />

        <AiScreeningSummary candidate={candidate} />
```

The component self-gates so no page-level conditional is needed.

- [ ] **Step 2: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 187/187 pass.

- [ ] **Step 3: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add app/candidates/[id]/page.tsx
git commit -m "feat: wire OfferStatus into candidate profile"
```

---

### Task 5: Pipeline card chip + dim-on-declined

**Files:**
- Modify: `components/pipeline/CandidateCard.tsx`

Read the offer state during render for Offer-stage candidates. Render a small chip in the same right-aligned column as the score badge and percentile. When declined, add `opacity-60` to the main card div.

- [ ] **Step 1: Update imports in `components/pipeline/CandidateCard.tsx`**

Change:

```tsx
import { scoreColor, scorePercentileLabel } from "@/lib/utils";
```

to:

```tsx
import { scoreColor, scorePercentileLabel } from "@/lib/utils";
import { getOfferState, type OfferStatus } from "@/lib/offer";
```

- [ ] **Step 2: Derive the chip + dim flags**

After the existing `const showPercentile = mounted && persona === "admin" && percentileLabel !== null;` line, add:

```tsx
  const offerState = currentStage === "Offer" ? getOfferState(candidate.id) : null;
  const showOfferChip = mounted && persona === "admin" && offerState !== null;
  const offerDimmed = mounted && persona === "admin" && offerState?.status === "declined";
```

- [ ] **Step 3: Apply the dim class to the card's main `<div>`**

Find the block:

```tsx
        <Link href={`/candidates/${candidate.id}`}>
          <div className={`bg-white border rounded-lg p-3 space-y-2 hover:shadow-md transition-all cursor-pointer ${
            selected
              ? "border-indigo-400 bg-indigo-50/30"
              : "border-slate-200 hover:border-indigo-200"
          }`}>
```

Replace with:

```tsx
        <Link href={`/candidates/${candidate.id}`}>
          <div className={`bg-white border rounded-lg p-3 space-y-2 hover:shadow-md transition-all cursor-pointer ${
            selected
              ? "border-indigo-400 bg-indigo-50/30"
              : "border-slate-200 hover:border-indigo-200"
          } ${offerDimmed ? "opacity-60" : ""}`}>
```

- [ ] **Step 4: Add the chip inside the right-aligned score column**

Find the block:

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

Replace with:

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
                  {showOfferChip && offerState && (
                    <OfferChip status={offerState.status} />
                  )}
                </div>
```

- [ ] **Step 5: Add the `OfferChip` helper component at the bottom of the file (below the main export)**

After the closing `}` of the `CandidateCard` component, append:

```tsx
function OfferChip({ status }: { status: OfferStatus }) {
  const config: Record<OfferStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800" },
    accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-800" },
    declined: { label: "Declined", className: "bg-rose-100 text-rose-800" },
  };
  const { label, className } = config[status];
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 6: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 187/187 pass.

- [ ] **Step 7: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 8: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000`, switch to **Admin**.
2. Navigate to **Pipeline**. Confirm Offer-stage cards show a small amber "Pending" chip below the score (alongside the percentile sub-label).
3. Click an Offer-stage candidate. Confirm the profile shows an "Offer Status" card between the header and the AI summary, with "Mark Accepted" (emerald) and "Mark Declined" (rose) buttons.
4. Click **Mark Accepted**. Confirm the card swaps to a green state reading "Offer accepted on {now}". Navigate back to Pipeline. Confirm the chip changed to emerald "Accepted".
5. Open a different Offer-stage candidate. Click **Mark Declined**. A dropdown appears with five reason options. Pick "Compensation", click **Confirm**. The card swaps to a rose state reading "Offer declined — Compensation ({now})". Navigate back. Confirm the pipeline card is visually dimmed (`opacity-60`) and the chip is rose "Declined".
6. Click **Mark Declined** → **Cancel**: confirm the pending buttons return.
7. Open a non-Offer candidate (Applied / Assessed / Interview / Hired). Confirm no Offer Status card appears.
8. Switch to **Graduate** persona. Confirm no chips on pipeline cards and no Offer Status card on profiles.

- [ ] **Step 9: Commit**

```bash
git add components/pipeline/CandidateCard.tsx
git commit -m "feat: show offer status chip and dim declined pipeline cards"
```

---

## Self-Review

**Spec coverage:**
- ✅ Type fields `offerStatus`, `offerDeclineReason` on `Candidate` — Task 1
- ✅ `OfferStatus` / `DeclineReason` / `OfferState` / `DECLINE_REASONS` in `lib/offer.ts` — Task 2
- ✅ `getOfferState`, `markAccepted`, `markDeclined`, `__resetOfferStore` — Task 2
- ✅ Pending default for unseen ids — Task 2 (`BLANK` constant)
- ✅ `markAccepted` clears prior decline reason — Task 2 (test covers the transition)
- ✅ Admin-only + mounted + Offer-stage visibility gate — Task 3
- ✅ Pending state with Mark Accepted + Mark Declined buttons — Task 3
- ✅ Accepted / Declined read-only display with timestamp — Task 3
- ✅ Inline decline form with reason dropdown + Confirm/Cancel — Task 3
- ✅ Placement between ProfileHeader and AiScreeningSummary — Task 4
- ✅ Pipeline chip: pending/accepted/declined with correct colours — Task 5 (`OfferChip`)
- ✅ Declined cards dimmed via `opacity-60` — Task 5
- ✅ en-AU date formatting — Task 3 (`formatTimestamp`)

**Placeholder scan:** None.

**Type consistency:**
- `OfferState` shape (`status`, `declineReason`, `markedAt`) matches between Task 2 definition, Task 3 consumer, and Task 5 consumer. ✅
- `DeclineReason` = `typeof DECLINE_REASONS[number]` used consistently (select default, props). ✅
- `OfferStatus` type imported in Task 5 matches Task 2 export. ✅
- `markAccepted(id)` / `markDeclined(id, reason)` signatures match call sites. ✅
