// components/profile/InterviewScorecard.tsx
"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { usePersona } from "@/lib/persona";
import {
  BLANK_SCORECARD,
  getScorecard,
  saveScorecard,
  type Recommendation,
  type Scorecard,
} from "@/lib/interview";

const RATING_FIELDS: {
  key: "communication" | "culturalFit" | "problemSolving" | "overallImpression";
  label: string;
}[] = [
  { key: "communication", label: "Communication" },
  { key: "culturalFit", label: "Cultural Fit" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "overallImpression", label: "Overall Impression" },
];

const RECOMMENDATION_OPTIONS: {
  value: Recommendation;
  label: string;
  selectedClass: string;
}[] = [
  {
    value: "advance",
    label: "Advance to Offer",
    selectedClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    value: "hold",
    label: "Hold",
    selectedClass: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    value: "decline",
    label: "Decline",
    selectedClass: "bg-rose-100 text-rose-800 border-rose-300",
  },
];

function StarRow({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={ariaLabel}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
          >
            <Star
              size={18}
              className={filled ? "fill-amber-400 text-amber-400" : "text-slate-300"}
            />
          </button>
        );
      })}
    </div>
  );
}

export function InterviewScorecard({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [card, setCard] = useState<Scorecard>(BLANK_SCORECARD);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setCard(getScorecard(candidate.id));
  }, [candidate.id]);

  if (!mounted || persona !== "admin" || candidate.stage !== "Interview") {
    return null;
  }

  function updateRating(key: typeof RATING_FIELDS[number]["key"], v: number) {
    setCard((prev) => ({ ...prev, [key]: v }));
  }

  function handleSave() {
    saveScorecard(candidate.id, card);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="text-sm font-semibold text-slate-700">Interview Scorecard</h2>
        {open ? (
          <ChevronUp size={16} className="text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-4">
          <div className="space-y-3">
            {RATING_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <StarRow
                  value={card[key]}
                  onChange={(v) => updateRating(key, v)}
                  ariaLabel={label}
                />
              </div>
            ))}
          </div>

          <div>
            <label
              htmlFor="scorecard-notes"
              className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="scorecard-notes"
              rows={4}
              value={card.notes}
              onChange={(e) => setCard((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Interview notes…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-y"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Recommendation
            </span>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Recommendation">
              {RECOMMENDATION_OPTIONS.map((opt) => {
                const selected = card.recommendation === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() =>
                      setCard((prev) => ({ ...prev, recommendation: opt.value }))
                    }
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      selected
                        ? opt.selectedClass
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={justSaved}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                justSaved
                  ? "bg-emerald-100 text-emerald-800 cursor-default"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {justSaved ? "Saved ✓" : "Save Scorecard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
