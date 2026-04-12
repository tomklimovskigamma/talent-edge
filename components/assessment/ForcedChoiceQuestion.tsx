// components/assessment/ForcedChoiceQuestion.tsx
"use client";
import { cn } from "@/lib/utils";
import type { ForcedChoiceQuestion as FCQ } from "@/lib/data/assessment";

type Props = {
  question: FCQ;
  value: string | null;
  onChange: (choice: "A" | "B") => void;
  index: number;
};

export function ForcedChoiceQuestion({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.prompt}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((choice) => {
          const opt = choice === "A" ? question.optionA : question.optionB;
          return (
            <button
              type="button"
              key={choice}
              onClick={() => onChange(choice)}
              className={cn(
                "px-4 py-4 rounded-xl border-2 text-sm font-medium text-left transition-all",
                value === choice
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
              )}
            >
              <span className="block text-xs font-semibold text-indigo-400 mb-1">{choice}</span>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
