# Bulk Reject with Email Preview Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Give admins a "Reject selected (N)" action on the pipeline board that opens a modal with an editable rejection email template, previews it for the first selected candidate, and — on confirm — moves all selected candidates to a hidden "Rejected" stage.

## New Stage

Extend `StageName` in `lib/data/program.ts` to include `"Rejected"`:

```ts
export type StageName = "Applied" | "Assessed" | "Shortlisted" | "Interview" | "Offer" | "Hired" | "Rejected";
```

Do NOT add a `Rejected` entry to the `stages[]` array. The board iterates that array to render columns, so rejected candidates will not match any column and will disappear from the board. The existing `getNextStage` helper remains correct because it only looks up entries in `stages[]`.

## Checkbox Expansion

Currently `CandidateCard.tsx:37` restricts the selection checkbox to Assessed-stage candidates. Update to show the checkbox for admin on every stage except `Offer` and `Hired` (both states represent commitments that should not be rejected or re-shortlisted via bulk tools):

```ts
const selectableStages: StageName[] = ["Applied", "Assessed", "Shortlisted", "Interview"];
const showCheckbox = mounted && persona === "admin" && selectableStages.includes(currentStage) && !!onSelect;
```

## Bulk Action Gating in `PipelineBoard`

- **`shortlistableCount`** = number of selected candidates whose effective stage is `"Assessed"`.
- **`rejectableCount`** = `selectedIds.size` (the full selection).
- **Shortlist selected (N)** button:
  - Badge `N` is `shortlistableCount` (not the full selection count).
  - `disabled` when `shortlistableCount === 0`, with `title="Only Assessed candidates can be shortlisted"`.
  - When disabled, style with `opacity-50 cursor-not-allowed` on top of the existing violet button classes.
- **Reject selected (N)** button:
  - New rose-coloured button placed alongside the other bulk buttons.
  - Uses the existing `XCircle` or `Ban` icon from lucide-react (choose `Ban` for consistency with "reject" semantics).
  - Visible when `showBulkAction` is true, always enabled while selection > 0.
  - Opens `RejectModal`.

## `RejectModal` Component

**File:** `components/pipeline/RejectModal.tsx` (client component).

**Props:**
```ts
type Props = {
  candidates: Candidate[];
  onCancel: () => void;
  onConfirm: () => void;
};
```

**Layout:**
- Backdrop: `fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4`.
- Card: `bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto`.
- Close on backdrop click and on `Escape` key (pattern already used in `FeedbackReportButton.tsx:18–25`).

**Sections:**
1. **Header** — "Send Rejection" title + × close button.
2. **Selected candidates list** — A compact row per candidate showing name and stage badge. Scrollable with `max-h-32 overflow-y-auto` when the list is long.
3. **Template editor** — `<textarea rows={10}>` prefilled with `DEFAULT_REJECTION_TEMPLATE`. Editing updates local state.
4. **Live preview** — Below the textarea, heading `Preview for {firstCandidateName}`. Renders `expandRejectionTemplate(template, firstCandidate, program.programName)` inside a read-only slate-50 card with pre-wrapped text.
5. **Footer** — Right-aligned "Cancel" (grey) and "Send rejections (N)" (rose) buttons.

**Local state:** `template: string` (initialised to `DEFAULT_REJECTION_TEMPLATE`). No save/load — the modal is ephemeral.

**Confirm behaviour:** The modal calls `onConfirm()`. The parent (`PipelineBoard`) handles the state transitions. The modal itself is not responsible for moving candidates.

## `lib/reject.ts`

```ts
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

`{name}` resolves to the full candidate name. `{program}` resolves to the program name passed in (e.g. `program.programName` from `lib/data/program.ts`). Unknown tokens (`{foo}`) are left verbatim — this is intentional; no validation error for typos.

## `PipelineBoard` Wiring

Add state:

```ts
const [rejectOpen, setRejectOpen] = useState(false);
```

Add handlers:

```ts
function handleBulkReject() {
  setStageOverrides((prev) => {
    const next = { ...prev };
    for (const id of selectedIds) next[id] = "Rejected";
    return next;
  });
  setSelectedIds(new Set());
  setRejectOpen(false);
}
```

Derived flags (computed near the existing `showBulkAction` line):

```ts
const shortlistableCount = [...selectedIds].filter(
  (id) => {
    const candidate = allCandidates.find((c) => c.id === id);
    return candidate && effectiveStage(candidate.id, candidate.stage) === "Assessed";
  }
).length;
const showReject = showBulkAction;
```

Render:
- The Shortlist button's label becomes `Shortlist selected ({shortlistableCount})`; when `shortlistableCount === 0`, the button is `disabled` and gets `opacity-50 cursor-not-allowed` added to its class list, plus a `title` attribute.
- A new Reject button (rose-600 background, `Ban` icon, label `Reject selected ({selectedIds.size})`) sits between Shortlist and the counter.
- `<RejectModal>` renders when `rejectOpen` is true, receiving `selectedCandidates`, `onCancel={() => setRejectOpen(false)}`, `onConfirm={handleBulkReject}`.

## Tests

**`__tests__/reject.test.ts`** covers `expandRejectionTemplate`:

- Substitutes `{name}` for the candidate's name.
- Substitutes `{program}` for the program name.
- Handles a template with both tokens in the same body.
- Returns a template with no tokens unchanged.
- Leaves unknown tokens (e.g. `{foo}`) untouched.

## Non-Goals

- No actual email send — the modal is UI theater; candidates move locally via `stageOverrides`.
- No undo. A rejected candidate stays rejected for the session.
- No rejection-reason taxonomy.
- No way to re-add `Rejected` candidates to the board (refreshing the page clears `stageOverrides`).
- No changes to `lib/pipeline.ts`. `filterCandidates` continues to receive all candidates; the board naturally hides `Rejected` because no column matches.

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/data/program.ts` | Modify | Add `"Rejected"` to `StageName` union |
| `lib/reject.ts` | Create | `DEFAULT_REJECTION_TEMPLATE`, `expandRejectionTemplate` |
| `__tests__/reject.test.ts` | Create | Unit tests for the expansion helper |
| `components/pipeline/RejectModal.tsx` | Create | Modal with template editor + preview |
| `components/pipeline/CandidateCard.tsx` | Modify | Broaden checkbox visibility to include Applied, Assessed, Shortlisted, Interview |
| `components/pipeline/PipelineBoard.tsx` | Modify | `rejectOpen` state, gated Shortlist button, new Reject button, mount the modal |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** The `Rejected` stage is added to the type union but not the `stages[]` array — this is stated explicitly so no reviewer wonders why there's no Rejected column. `shortlistableCount` and `selectedIds.size` usages are distinct and explicit.
- **Scope:** Six files, one new component, one new lib module. Well-bounded single plan.
- **Ambiguity:** The "email template" is explicitly a UI-only preview. `{name}` / `{program}` token behaviour is explicit, including the no-error-on-unknown-token rule.
