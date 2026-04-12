import { Candidate } from "@/lib/data/candidates";
import { CandidateCard } from "./CandidateCard";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  candidates: Candidate[];
  accentClass: string;
};

export function StageColumn({ label, candidates, accentClass }: Props) {
  return (
    <div className="flex flex-col min-w-[160px] max-w-[180px] flex-shrink-0">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${accentClass}`}>
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</span>
        <Badge variant="secondary" className="text-xs">{candidates.length}</Badge>
      </div>
      <div className="space-y-2 flex-1">
        {candidates.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-4">No candidates</p>
        ) : (
          candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)
        )}
      </div>
    </div>
  );
}
