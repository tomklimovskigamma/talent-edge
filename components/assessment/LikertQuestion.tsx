// components/assessment/LikertQuestion.tsx
"use client";
import { cn } from "@/lib/utils";
import type { LikertQuestion as LikertQ } from "@/lib/data/assessment";

type Props = {
  question: LikertQ;
  value: number | null;
  onChange: (value: number) => void;
  index: number;
};

const scaleLabels = ["Strongly\nDisagree", "", "Neutral", "", "Strongly\nAgree"];

export function LikertQuestion({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.text}
      </p>
      <div className="flex items-center gap-2 justify-between">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all",
                value === v
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"
              )}
            >
              {v}
            </div>
            <span className="text-xs text-slate-400 text-center leading-tight whitespace-pre-line">
              {scaleLabels[v - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
