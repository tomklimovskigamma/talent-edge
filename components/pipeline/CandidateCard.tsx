// components/pipeline/CandidateCard.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Candidate, candidates as allCandidates } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreColor, scorePercentileLabel } from "@/lib/utils";
import { Clock, Send, CalendarPlus, ArrowRight, Accessibility } from "lucide-react";
import { ScheduleModal } from "@/components/pipeline/ScheduleModal";
import { usePersona } from "@/lib/persona";
import { getNextStage } from "@/lib/pipeline";

interface CandidateCardProps {
  candidate: Candidate;
  currentStage?: StageName;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
  selected?: boolean;
  onSelect?: (candidateId: string, checked: boolean) => void;
}

export function CandidateCard({
  candidate,
  currentStage: currentStageProp,
  onAdvance,
  selected = false,
  onSelect,
}: CandidateCardProps) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  const currentStage: StageName = currentStageProp ?? (candidate.stage as StageName);
  const nextStage = getNextStage(currentStage);
  const showAdvance = mounted && persona === "admin" && !!onAdvance && !!nextStage;
  const SELECTABLE_STAGES: StageName[] = ["Applied", "Assessed", "Shortlisted", "Interview"];
  const showCheckbox = mounted && persona === "admin" && SELECTABLE_STAGES.includes(currentStage) && !!onSelect;
  const showAccessibility = mounted && persona === "admin" && !!candidate.accessibilityNeeds;

  const percentileLabel = scorePercentileLabel(candidate, allCandidates);
  const showPercentile = mounted && persona === "admin" && percentileLabel !== null;

  return (
    <>
      <div className="group relative">
        {showCheckbox && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(candidate.id, e.target.checked)}
              aria-label={`Select ${candidate.name}`}
              className="h-3.5 w-3.5 accent-indigo-600 cursor-pointer"
            />
          </div>
        )}

        <Link href={`/candidates/${candidate.id}`}>
          <div className={`bg-white border rounded-lg p-3 space-y-2 hover:shadow-md transition-all cursor-pointer ${
            selected
              ? "border-indigo-400 bg-indigo-50/30"
              : "border-slate-200 hover:border-indigo-200"
          }`}>
            <div className="flex items-start justify-between">
              <div className={`flex items-center gap-2 ${showCheckbox ? "pl-5" : ""}`}>
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                  {candidate.avatarInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{candidate.name}</p>
                  <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{candidate.university}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {showAccessibility && (
                  <span
                    className="group/acc relative flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-600"
                    aria-label={`Accessibility note: ${candidate.accessibilityNeeds}`}
                  >
                    <Accessibility size={11} />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[160px] rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover/acc:opacity-100 transition-opacity whitespace-normal z-20">
                      {candidate.accessibilityNeeds}
                    </span>
                  </span>
                )}
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreColor(candidate.potentialScore)}`}>
                    {candidate.potentialScore}
                  </span>
                  {showPercentile && (
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">
                      {percentileLabel}
                    </span>
                  )}
                </div>
              </div>
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
