// components/pipeline/CandidateCard.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreColor } from "@/lib/utils";
import { Clock, Send, CalendarPlus, ArrowRight } from "lucide-react";
import { ScheduleModal } from "@/components/pipeline/ScheduleModal";
import { usePersona } from "@/lib/persona";
import { getNextStage } from "@/lib/pipeline";

interface CandidateCardProps {
  candidate: Candidate;
  currentStage?: StageName;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
}

export function CandidateCard({ candidate, currentStage: currentStageProp, onAdvance }: CandidateCardProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  const currentStage: StageName = currentStageProp ?? (candidate.stage as StageName);
  const nextStage = getNextStage(currentStage);
  const showAdvance = mounted && persona === "admin" && !!onAdvance && !!nextStage;

  return (
    <>
      <div className="group relative">
        <Link href={`/candidates/${candidate.id}`}>
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                  {candidate.avatarInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{candidate.name}</p>
                  <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{candidate.university}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${scoreColor(candidate.potentialScore)}`}>
                {candidate.potentialScore}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{candidate.degree}</p>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              <span className="text-xs">{candidate.daysInStage}d in stage</span>
            </div>
          </div>
        </Link>

        {currentStage === "Applied" && (
          <Link
            href="/assessment"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-1"
          >
            <Send size={10} />
            Send assessment
          </Link>
        )}

        {currentStage === "Interview" && (
          <button
            type="button"
            onClick={() => setShowSchedule(true)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 px-1"
          >
            <CalendarPlus size={10} />
            Schedule interview
          </button>
        )}

        {showAdvance && (
          <button
            type="button"
            onClick={() => onAdvance?.(candidate.id, currentStage)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 px-1"
          >
            <ArrowRight size={10} />
            Advance to {nextStage}
          </button>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          candidateName={candidate.name}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </>
  );
}
