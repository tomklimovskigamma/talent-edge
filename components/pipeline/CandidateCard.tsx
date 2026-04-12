// components/pipeline/CandidateCard.tsx
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import { Clock, Send } from "lucide-react";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
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
      <Link
        href="/assessment"
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-1"
      >
        <Send size={10} />
        Send assessment
      </Link>
    </div>
  );
}
