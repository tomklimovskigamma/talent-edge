// components/assessment/SJTQuestion.tsx
"use client";
import { cn } from "@/lib/utils";
import { resolveScenario } from "@/lib/data/assessment";
import type { SJTQuestion as SJTQ, Track } from "@/lib/data/assessment";

type Props = {
  question: SJTQ;
  track: Track;
  value: string | null;
  onChange: (optionId: string) => void;
  index: number;
};

export function SJTQuestion({ question, track, value, onChange, index }: Props) {
  const scenario = resolveScenario(question.scenario, track);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">
          <span className="text-slate-700 font-bold mr-2">{index + 1}.</span>Scenario
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 leading-relaxed">{scenario}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">What would you do?</p>
        {question.options.map((opt) => (
          <button
            type="button"
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
              value === opt.id
                ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-medium"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
            )}
          >
            <span className="font-semibold mr-2 text-indigo-400">{opt.id})</span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
