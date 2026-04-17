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
