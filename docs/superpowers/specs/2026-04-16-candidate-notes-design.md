# Candidate Notes Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Add a collapsible "Notes" section to the bottom of every candidate profile (admin only) where recruiters can append freeform, timestamped notes across a session. Saved notes render as a chronological list above the input.

## Visibility

Rendered only when `mounted && persona === "admin"`. Visible on every candidate stage — notes aren't gated by lifecycle state the way the interview scorecard is. Default collapsed.

## Placement

In `app/candidates/[id]/page.tsx`, inserted as the **last** element inside the profile container, after `<KeepWarmFeed />`. This matches the backlog's "at the bottom of every candidate profile" placement.

## Component Structure

**`components/profile/CandidateNotes.tsx`** — client component. Reads existing notes via `getNotes(candidate.id)` on mount / candidate change, renders the list, and appends via `addNote(candidate.id, text)`.

Local state: `open`, `notes: Note[]`, `draft: string`.

### Header

Clickable row (full-width button) with:
- Text `Notes` plus a small count badge (`"3"` in slate-100 pill) when there are any.
- Chevron icon: `ChevronDown` (collapsed) / `ChevronUp` (expanded).

### List (when expanded)

Newest-first list of notes, each rendered as a slate-50 card:

```
┌────────────────────────────────────────┐
│ Strong communicator; follow up on the  │
│ problem-solving gap.                   │
│                                        │
│ 16 Apr 2026 · 10:42                    │
└────────────────────────────────────────┘
```

- Body: `text-sm text-slate-700 whitespace-pre-wrap`.
- Timestamp caption: `text-xs text-slate-400` formatted with `toLocaleDateString` + `toLocaleTimeString` in `en-AU` locale.
- Empty state: single line `text-xs text-slate-400` saying `"No notes yet."`.

### Input row

Below the list:
- Textarea: `rows={4}`, `placeholder="Add a note…"`, value bound to `draft`.
- Right-aligned "Save Note" button (indigo when enabled).
- Button `disabled` when `draft.trim() === ""`. Styled with `opacity-50 cursor-not-allowed` when disabled.

### Save behaviour

Clicking Save Note:
1. `addNote(candidate.id, draft.trim())` — the storage helper generates an `id` and `createdAt`, inserts the new note at the **front** of the stored list, and returns the new note.
2. Local state: prepend the returned note to the `notes` array (for immediate render without re-reading storage).
3. `setDraft("")` — clear the textarea.

No toast; the note appearing in the list is the confirmation.

## Persistence Layer

**`lib/notes.ts`** owns the in-memory store:

```ts
export type Note = {
  id: string;
  text: string;
  createdAt: string; // ISO-8601
};

export function getNotes(candidateId: string): Note[];
export function addNote(candidateId: string, text: string): Note;
```

Internally: `Map<string, Note[]>`. `getNotes` returns a clone of the stored array (outer array copy is sufficient; `Note` values are primitives). `addNote` generates `id = crypto.randomUUID()` and `createdAt = new Date().toISOString()`, prepends to the stored array, and returns the new note.

A test-only `__resetNotesStore()` is exported to keep tests order-independent (same pattern used in `lib/interview.ts`).

Session-scoped: refreshing the page clears the map. Acceptable for a demo.

## Tests

**`__tests__/notes.test.ts`**:
- `getNotes` returns an empty array for unseen ids.
- `addNote` returns a `Note` with non-empty `id` and `createdAt`.
- Round-trip: after `addNote`, `getNotes` returns the new note.
- Per-candidate isolation: notes added to one id do not appear under another.
- Newest-first ordering: successive `addNote` calls put the latest note at index 0.
- `getNotes` returns a clone (mutating the returned array does not affect future reads).

The component itself is not unit-tested; its behaviour is verified manually.

## Non-Goals

- No edit.
- No delete.
- No durable persistence.
- No markdown, rich text, or attachments.
- No search or filtering across candidates.
- No pinned notes or tagging.
- No note author/user identity — all notes are implicitly "the current admin".

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/notes.ts` | Create | `Note` type, `getNotes`, `addNote`, `__resetNotesStore` |
| `__tests__/notes.test.ts` | Create | Unit tests for storage helpers |
| `components/profile/CandidateNotes.tsx` | Create | Collapsible admin-only notes UI |
| `app/candidates/[id]/page.tsx` | Modify | Insert `<CandidateNotes candidate={candidate} />` at the bottom of the profile |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** The "newest-first" rule is stated once and used by both storage (`addNote` prepends) and UI ordering. `addNote` return contract (returns the new `Note`) is referenced by the save flow.
- **Scope:** One small lib module, one component, one integration point, one test file — single-plan feature.
- **Ambiguity:** Save-button enabled state is explicit (`draft.trim() !== ""`). Empty-state text is explicit. Timestamp locale is explicit (`en-AU`).
