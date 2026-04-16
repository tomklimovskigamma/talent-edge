# Offer Acceptance Tracking Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Let admins mark an Offer-stage candidate's status as accepted or declined (with a reason), show a status chip on their pipeline card, dim declined cards, and render an inline status card on the candidate profile with mark-accepted/mark-declined controls.

## Type Extension

In `lib/data/candidates.ts` add two optional fields to `Candidate`:

```ts
offerStatus?: "pending" | "accepted" | "declined";
offerDeclineReason?: string;
```

These document the data shape. Neither field is seeded — all Offer-stage candidates default to `"pending"` at runtime via the storage helper. No changes to the 19 seed records.

## Storage — `lib/offer.ts`

Session-scoped module-level `Map<string, OfferState>`, mirroring the pattern from `lib/interview.ts` and `lib/notes.ts`:

```ts
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
  markedAt: string | null; // ISO-8601 timestamp of the last mark action, null for pending
};

export function getOfferState(candidateId: string): OfferState;
export function markAccepted(candidateId: string): void;
export function markDeclined(candidateId: string, reason: DeclineReason): void;
export function __resetOfferStore(): void; // test-only
```

### Behaviour

- `getOfferState` returns the stored state, or `{ status: "pending", declineReason: null, markedAt: null }` for any unstored id. Callers should only call this for Offer-stage candidates — other stages are not meaningful.
- `markAccepted` stores `{ status: "accepted", declineReason: null, markedAt: now }`. If the candidate was previously declined, `declineReason` is cleared.
- `markDeclined` stores `{ status: "declined", declineReason: reason, markedAt: now }`.
- `__resetOfferStore` is exported for test hygiene only.

Refreshing the page resets all offer state. Consistent with the rest of the demo's persistence model.

## Profile UI — `components/profile/OfferStatus.tsx`

Client component. Visibility gate: `mounted && persona === "admin" && candidate.stage === "Offer"`. Placement on `app/candidates/[id]/page.tsx`: inserted between `<ProfileHeader />` and `<AiScreeningSummary />`.

### States

- **Pending** — wrapper `bg-white border rounded-xl shadow-sm p-5`. Header "Offer Status". Body: two buttons:
  - `Mark Accepted` — emerald-600 / white text.
  - `Mark Declined` — rose-600 / white text.
- **Accepted** — same wrapper, header + body reading `Offer accepted on {formatted markedAt}`. Emerald check icon. No further controls (the spec's non-goal rule: no undo).
- **Declined** — same wrapper, rose styling, reading `Offer declined — {declineReason} ({formatted markedAt})`. Rose X icon.

### Decline flow

Clicking "Mark Declined" reveals an inline form replacing the two buttons:

- `<label>` "Reason" + `<select>` populated from `DECLINE_REASONS`. Default value: the first option.
- "Confirm" (rose) and "Cancel" (grey) buttons.
- Confirm: `markDeclined(candidate.id, reason)` → state transitions to Declined.
- Cancel: returns to the Pending two-button layout.

Local component state: `mode: "idle" | "declining"` and the selected reason. The `OfferState` is re-read from storage only on mount / candidate change via `useEffect` so the component stays in sync if the storage changes elsewhere during the session.

### Date formatting

Uses `en-AU`, matching the candidate notes pattern:
```
16 Apr 2026 · 10:42
```

## Pipeline Card Chip — modify `components/pipeline/CandidateCard.tsx`

Gate: `mounted && persona === "admin" && currentStage === "Offer"`.

Fetch `getOfferState(candidate.id)` inside the component render. Derive `offerStatus`. Render a chip next to the existing score badge (inside the same right-aligned column used for score + percentile):

- `pending` → `bg-amber-100 text-amber-800` chip with label `Pending`.
- `accepted` → `bg-emerald-100 text-emerald-800` chip with label `Accepted`.
- `declined` → `bg-rose-100 text-rose-800` chip with label `Declined`. Additionally, the card's main `<div>` gets `opacity-60` to visually dim it (applied alongside the existing selected/hover classes).

The chip text is `text-[10px] font-medium px-1.5 py-0.5 rounded-full`.

Because storage is read during render and navigation between Profile and Pipeline re-mounts the pipeline board (Next.js app router), the chip reflects the latest status without any pub/sub wiring. This is acceptable for a demo; a future real app would use a shared store with subscription.

## Page Wiring

`app/candidates/[id]/page.tsx`:
- Add `import { OfferStatus } from "@/components/profile/OfferStatus";`.
- Insert `<OfferStatus candidate={candidate} />` between the `<ProfileHeader />` line and the `<AiScreeningSummary />` line. The component self-gates — no stage check in the page.

## Tests — `__tests__/offer.test.ts`

- `getOfferState` returns the pending default for unseen ids.
- `markAccepted` sets `status: "accepted"`, clears `declineReason`, sets `markedAt` to a non-null ISO string.
- `markDeclined` sets `status: "declined"`, stores the reason, sets `markedAt`.
- `markAccepted` after `markDeclined` clears the decline reason back to `null`.
- Store isolates candidate ids: state stored under `c001` does not affect `c002`.

Component is not unit-tested.

## Non-Goals

- No durable persistence — session only.
- No undo after accepted or declined.
- No email or notification. The mark is a UI state change only.
- No offer expiry or countdown.
- No auto-advance from Offer → Hired on "Mark Accepted" (we keep the stage advancement as an independent admin action; conflating them would surprise users).
- No bulk mark-accepted / bulk mark-declined.

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/data/candidates.ts` | Modify | Add `offerStatus?` and `offerDeclineReason?` fields to `Candidate` |
| `lib/offer.ts` | Create | `OfferStatus`, `DECLINE_REASONS`, storage helpers |
| `__tests__/offer.test.ts` | Create | Unit tests for storage helpers |
| `components/profile/OfferStatus.tsx` | Create | Admin-only status card on Offer-stage profiles |
| `components/pipeline/CandidateCard.tsx` | Modify | Add status chip + dim-on-declined for Offer-stage cards |
| `app/candidates/[id]/page.tsx` | Modify | Mount `<OfferStatus candidate={candidate} />` below `<ProfileHeader />` |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** Storage defaults (`pending`, `null`, `null`) match component expectations. Visibility gate repeated in the component (not in the page) so there's a single owner.
- **Scope:** Six files, one new component, one small lib, one test file — single-plan feature.
- **Ambiguity:** "No undo" is explicit. "Mark Declined reveal form" flow is explicit. Reason options are enumerated. Dimming applies to declined only, not accepted or pending.
