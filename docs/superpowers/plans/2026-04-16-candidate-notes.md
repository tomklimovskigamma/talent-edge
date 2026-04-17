# Candidate Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible admin-only "Notes" section to the bottom of every candidate profile, with timestamped entries and an in-memory store keyed by candidate id.

**Architecture:** Storage lives in `lib/notes.ts` (a module-level `Map<candidateId, Note[]>` with `getNotes` / `addNote` helpers). The UI lives in `components/profile/CandidateNotes.tsx` — a client component that mirrors the interview-scorecard visibility pattern (mounted + admin + collapse) and renders list + textarea + save button. The page wires it at the bottom of the profile.

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, lucide-react (`ChevronDown`, `ChevronUp`), vitest. Uses the browser `crypto.randomUUID()` which is available in vitest's default environment.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/notes.ts` | Create | `Note` type, `getNotes`, `addNote`, `__resetNotesStore` |
| `__tests__/notes.test.ts` | Create | Unit tests for storage helpers |
| `components/profile/CandidateNotes.tsx` | Create | Collapsible admin-only notes UI |
| `app/candidates/[id]/page.tsx` | Modify | Mount `<CandidateNotes candidate={candidate} />` at the bottom |

---

### Task 1: `lib/notes.ts` — storage helpers + tests

**Files:**
- Create: `lib/notes.ts`
- Create: `__tests__/notes.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/notes.test.ts`:

```ts
// __tests__/notes.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getNotes, addNote, __resetNotesStore } from "@/lib/notes";

beforeEach(() => {
  __resetNotesStore();
});

describe("getNotes", () => {
  it("returns an empty array for unseen candidate ids", () => {
    expect(getNotes("unknown")).toEqual([]);
  });

  it("returns a clone — mutating the returned array does not affect storage", () => {
    addNote("c001", "first");
    const notes = getNotes("c001");
    notes.pop();
    expect(getNotes("c001")).toHaveLength(1);
  });
});

describe("addNote", () => {
  it("returns a Note with non-empty id and createdAt", () => {
    const note = addNote("c001", "text");
    expect(note.id).toBeTruthy();
    expect(note.createdAt).toBeTruthy();
    expect(note.text).toBe("text");
  });

  it("stores the note and is retrievable via getNotes", () => {
    const saved = addNote("c001", "first note");
    const notes = getNotes("c001");
    expect(notes).toHaveLength(1);
    expect(notes[0]).toEqual(saved);
  });

  it("isolates notes per candidate id", () => {
    addNote("c001", "for c001");
    addNote("c002", "for c002");
    expect(getNotes("c001").map((n) => n.text)).toEqual(["for c001"]);
    expect(getNotes("c002").map((n) => n.text)).toEqual(["for c002"]);
  });

  it("orders notes newest-first", () => {
    addNote("c001", "first");
    addNote("c001", "second");
    addNote("c001", "third");
    expect(getNotes("c001").map((n) => n.text)).toEqual(["third", "second", "first"]);
  });

  it("generates distinct ids for successive notes", () => {
    const a = addNote("c001", "a");
    const b = addNote("c001", "b");
    expect(a.id).not.toBe(b.id);
  });
});
```

- [ ] **Step 2: Confirm tests fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/notes.test.ts 2>&1 | tail -15
```

Expected: module-not-found on `@/lib/notes`.

- [ ] **Step 3: Create `lib/notes.ts`**

```ts
// lib/notes.ts
export type Note = {
  id: string;
  text: string;
  createdAt: string; // ISO-8601
};

const store = new Map<string, Note[]>();

export function getNotes(candidateId: string): Note[] {
  const list = store.get(candidateId);
  return list ? [...list] : [];
}

export function addNote(candidateId: string, text: string): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
  const existing = store.get(candidateId) ?? [];
  store.set(candidateId, [note, ...existing]);
  return note;
}

// Test-only: reset the in-memory store between tests.
export function __resetNotesStore(): void {
  store.clear();
}
```

- [ ] **Step 4: Confirm tests pass**

```bash
npm test -- __tests__/notes.test.ts 2>&1 | tail -15
```

Expected: 7/7 pass.

- [ ] **Step 5: Full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 163/163 pass (156 existing + 7 new).

- [ ] **Step 6: Commit**

```bash
git add lib/notes.ts __tests__/notes.test.ts
git commit -m "feat: add candidate notes storage helpers with tests"
```

---

### Task 2: `CandidateNotes` component

**Files:**
- Create: `components/profile/CandidateNotes.tsx`

Client component. Handles visibility, collapse, list rendering, input, and save. Mirrors the interview-scorecard pattern.

- [ ] **Step 1: Create `components/profile/CandidateNotes.tsx`**

```tsx
// components/profile/CandidateNotes.tsx
"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { usePersona } from "@/lib/persona";
import { addNote, getNotes, type Note } from "@/lib/notes";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

export function CandidateNotes({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setNotes(getNotes(candidate.id));
  }, [candidate.id]);

  if (!mounted || persona !== "admin") {
    return null;
  }

  const canSave = draft.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    const saved = addNote(candidate.id, draft.trim());
    setNotes((prev) => [saved, ...prev]);
    setDraft("");
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-700">Notes</h2>
          {notes.length > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
              {notes.length}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {/* List */}
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400">No notes yet.</p>
          ) : (
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.text}</p>
                  <p className="text-xs text-slate-400 mt-1.5">{formatTimestamp(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div>
            <label
              htmlFor="note-draft"
              className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
            >
              New Note
            </label>
            <textarea
              id="note-draft"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a note…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-y"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  canSave
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

Notes:
- Visibility guard at the top matches `InterviewScorecard.tsx` pattern.
- `useEffect([candidate.id])` re-hydrates notes when navigating between profiles.
- `formatTimestamp` produces e.g. `"16 Apr 2026 · 10:42"` — `en-AU` locale, 24-hour time.
- `canSave` toggles disabled styling; whitespace-only drafts cannot be saved.
- Appending to local state after `addNote` avoids re-reading from storage.

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add components/profile/CandidateNotes.tsx
git commit -m "feat: add CandidateNotes client component"
```

---

### Task 3: Wire `CandidateNotes` into the candidate profile

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

- [ ] **Step 1: Edit `app/candidates/[id]/page.tsx`**

Add the import after the existing `KeepWarmFeed` import:

```tsx
import { CandidateNotes } from "@/components/profile/CandidateNotes";
```

Insert `<CandidateNotes candidate={candidate} />` as the last element of the profile container, immediately after `<KeepWarmFeed candidate={candidate} />`. The tail of the page becomes:

```tsx
        <KeepWarmFeed candidate={candidate} />

        <CandidateNotes candidate={candidate} />

      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 163/163 pass.

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
2. Navigate to **Pipeline**, open any candidate profile.
3. Confirm a **"Notes"** collapsible section appears at the bottom of the profile.
4. Click the header — section expands.
5. Confirm empty state: "No notes yet." is visible.
6. Type a note in the textarea and click **Save Note** — confirm:
   - The note appears at the top of the list with a slate-50 card and a timestamp caption below.
   - The textarea clears.
   - The count badge next to "Notes" shows `1`.
7. Add a second note — confirm it appears above the first one (newest-first).
8. Try clicking Save Note with an empty or whitespace-only textarea — confirm the button is disabled and nothing saves.
9. Navigate to a different candidate — confirm that candidate has its own independent notes list (initially empty).
10. Navigate back to the first candidate — confirm notes are still there (session-scoped storage).
11. Switch to **Graduate** persona on a profile that had notes — confirm the Notes section is completely absent.

- [ ] **Step 5: Commit**

```bash
git add app/candidates/[id]/page.tsx
git commit -m "feat: wire CandidateNotes into candidate profile"
```

---

## Self-Review

**Spec coverage:**
- ✅ Collapsible "Notes" section with chevron — Task 2 (`open` state + `ChevronDown/Up`)
- ✅ Admin-only + mounted guard — Task 2
- ✅ Visible on every candidate stage — Task 2 (no stage gate)
- ✅ Placed at the bottom of the profile — Task 3
- ✅ Newest-first list with slate-50 cards and timestamps — Task 2
- ✅ Empty-state text — Task 2
- ✅ Textarea + Save Note button with disabled empty/whitespace guard — Task 2
- ✅ Save appends note, clears draft, renders immediately — Task 2 (`handleSave`)
- ✅ Count badge in section header — Task 2
- ✅ `Note` type with `id`, `text`, `createdAt` — Task 1
- ✅ `getNotes` / `addNote` helpers with per-candidate isolation — Task 1
- ✅ Newest-first ordering in storage — Task 1 (`[note, ...existing]`)
- ✅ `getNotes` clone semantics — Task 1 (`[...list]`)
- ✅ Tests cover empty, round-trip, isolation, newest-first, distinct ids, clone — Task 1

**Placeholder scan:** None.

**Type consistency:**
- `Note` type imported from `@/lib/notes` in Task 2 — matches Task 1 definition. ✅
- `getNotes(candidateId): Note[]` and `addNote(candidateId, text): Note` signatures match between Task 1 definition and Task 2 call sites. ✅
- Component prop `{ candidate: Candidate }` matches Task 3 usage. ✅
