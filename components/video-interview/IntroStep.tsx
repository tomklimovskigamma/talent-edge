"use client";

import { Button } from "@/components/ui/button";
import { Video, Clock, AlertCircle } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";

export function IntroStep({ candidate, onStart }: { candidate: Candidate; onStart: () => void }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
          Video Interview
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">Welcome, {candidate.name.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500 mt-2">
          You&apos;ve been shortlisted for the next stage: a short video interview.
        </p>
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex items-start gap-3">
          <Video size={16} className="text-indigo-500 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-700">3 questions, 60 seconds each.</span> You&apos;ll see
            each question, have 30 seconds to think, then record your answer.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-indigo-500 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-700">One attempt per question.</span> Take your time to
            prepare — there&apos;s no going back once you start recording.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-slate-400 mt-0.5" aria-hidden="true" />
          <div className="text-slate-500">
            We analyse what you say, not how your face looks on camera. Candidates with accessibility
            accommodations will be offered an alternative format — please contact your program
            coordinator.
          </div>
        </div>
      </div>

      <Button onClick={onStart} className="w-full bg-indigo-600 hover:bg-indigo-700">
        Start video interview
      </Button>
    </div>
  );
}
