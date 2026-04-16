"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { VideoPrompt } from "@/lib/data/video-prompts";

export function PromptStep({ prompt, onReady }: { prompt: VideoPrompt; onReady: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(prompt.prepSeconds);

  useEffect(() => {
    setSecondsLeft(prompt.prepSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onReady();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [prompt.id, prompt.prepSeconds, onReady]);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          Question {prompt.order}
        </p>
        <p className="text-xl font-medium text-slate-800 mt-2 leading-relaxed">{prompt.question}</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
        <p className="text-xs text-indigo-700 uppercase tracking-wide">Prepare your answer</p>
        <p className="text-3xl font-bold text-indigo-700 tabular-nums mt-1">{secondsLeft}s</p>
        <p className="text-xs text-slate-500 mt-2">
          Recording will start automatically when the timer ends.
        </p>
      </div>

      <Button variant="outline" onClick={onReady} className="w-full">
        I&apos;m ready — start recording now
      </Button>
    </div>
  );
}
