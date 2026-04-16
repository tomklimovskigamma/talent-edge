"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { videoPrompts } from "@/lib/data/video-prompts";
import { IntroStep } from "./IntroStep";
import { PromptStep } from "./PromptStep";
import { RecordingStep } from "./RecordingStep";
import { CompleteStep } from "./CompleteStep";
import type { Candidate } from "@/lib/data/candidates";

type PhaseState =
  | { phase: "intro" }
  | { phase: "prompt"; questionIndex: number }
  | { phase: "recording"; questionIndex: number }
  | { phase: "complete" };

export function VideoInterviewShell({ candidate }: { candidate: Candidate }) {
  const [state, setState] = useState<PhaseState>({ phase: "intro" });
  const totalQuestions = videoPrompts.length;

  const currentQuestionIndex =
    state.phase === "prompt" || state.phase === "recording" ? state.questionIndex : 0;

  const pct =
    state.phase === "complete"
      ? 100
      : state.phase === "intro"
      ? 0
      : Math.round(((currentQuestionIndex + (state.phase === "recording" ? 0.5 : 0)) / totalQuestions) * 100);

  const showProgress = state.phase !== "intro" && state.phase !== "complete";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#1E1B4B] px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Return to home">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
        </Link>
        {showProgress && (
          <span className="text-xs text-white/50">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        )}
      </header>

      {showProgress && (
        <div className="bg-white border-b px-6 py-3 space-y-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">Video Interview</span>
            <span className="text-xs text-slate-400">{pct}% complete</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {state.phase === "intro" && (
            <IntroStep
              candidate={candidate}
              onStart={() => setState({ phase: "prompt", questionIndex: 0 })}
            />
          )}
          {state.phase === "prompt" && (
            <PromptStep
              prompt={videoPrompts[state.questionIndex]}
              onReady={() => setState({ phase: "recording", questionIndex: state.questionIndex })}
            />
          )}
          {state.phase === "recording" && (
            <RecordingStep
              prompt={videoPrompts[state.questionIndex]}
              candidateId={candidate.id}
              onComplete={() => {
                const nextIndex = state.questionIndex + 1;
                if (nextIndex >= totalQuestions) {
                  setState({ phase: "complete" });
                } else {
                  setState({ phase: "prompt", questionIndex: nextIndex });
                }
              }}
            />
          )}
          {state.phase === "complete" && <CompleteStep />}
        </div>
      </main>
    </div>
  );
}
