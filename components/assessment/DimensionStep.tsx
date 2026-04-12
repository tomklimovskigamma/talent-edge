// components/assessment/DimensionStep.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LikertQuestion } from "./LikertQuestion";
import { SJTQuestion } from "./SJTQuestion";
import { ForcedChoiceQuestion } from "./ForcedChoiceQuestion";
import { SequencePuzzle } from "./SequencePuzzle";
import { EmotionFace } from "./EmotionFace";
import type { DimensionConfig, Track, Question } from "@/lib/data/assessment";

type Props = {
  config: DimensionConfig;
  track: Track;
  /** Must be produced by buildDefaultAnswers — slot types must align with config.questions types */
  initialAnswers: (string | number | null)[];
  onNext: (answers: (string | number | null)[]) => void;
};

export function DimensionStep({ config, track, initialAnswers, onNext }: Props) {
  const [answers, setAnswers] = useState<(string | number | null)[]>(initialAnswers);

  function setAnswer(index: number, value: string | number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const allAnswered = answers.every((a) => a !== null);

  function renderQuestion(q: Question, i: number) {
    switch (q.type) {
      case "likert":
        return (
          <LikertQuestion
            key={q.id}
            question={q}
            value={answers[i] as number | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "sjt":
        return (
          <SJTQuestion
            key={q.id}
            question={q}
            track={track}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "forced-choice":
        return (
          <ForcedChoiceQuestion
            key={q.id}
            question={q}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "sequence-puzzle":
        return (
          <SequencePuzzle
            key={q.id}
            question={q}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "emotion-face":
        return (
          <EmotionFace
            key={q.id}
            question={q}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="text-center space-y-1 pb-2 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">{config.label}</h2>
        <p className="text-sm text-slate-400">{config.tagline}</p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {config.questions.map((q, i) => (
          <div key={q.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            {renderQuestion(q, i)}
          </div>
        ))}
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => onNext(answers)}
          disabled={!allAnswered}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 disabled:opacity-40"
        >
          Continue
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
