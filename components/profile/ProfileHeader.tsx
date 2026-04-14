import { Candidate } from "@/lib/data/candidates";
import { scoreLabel, stageColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, Accessibility } from "lucide-react";

export function ProfileHeader({ candidate }: { candidate: Candidate }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
            {candidate.avatarInitials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{candidate.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <GraduationCap size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">{candidate.university}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">{candidate.degree}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={stageColor(candidate.stage)}>{candidate.stage}</Badge>
              {candidate.accessibilityNeeds && (
                <span
                  title={candidate.accessibilityNeeds}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200"
                  aria-label={`Accessibility note: ${candidate.accessibilityNeeds}`}
                >
                  <Accessibility size={11} />
                  Accommodations requested
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} />
                Applied {new Date(candidate.appliedDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${
            candidate.potentialScore >= 80 ? "border-emerald-400 bg-emerald-50" :
            candidate.potentialScore >= 65 ? "border-amber-400 bg-amber-50" :
            "border-rose-400 bg-rose-50"
          }`}>
            <span className="text-2xl font-black text-slate-800">{candidate.potentialScore}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">AI Potential Score</p>
          <p className={`text-xs font-medium mt-0.5 ${
            candidate.potentialScore >= 80 ? "text-emerald-600" :
            candidate.potentialScore >= 65 ? "text-amber-600" : "text-rose-600"
          }`}>{scoreLabel(candidate.potentialScore)}</p>
        </div>
      </div>
    </div>
  );
}
