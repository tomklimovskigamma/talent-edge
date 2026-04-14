import { Candidate } from "@/lib/data/candidates";
import { StageName } from "@/lib/data/program";
import { CandidateCard } from "./CandidateCard";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: StageName;
  candidates: Candidate[];
  accentClass: string;
  onAdvance?: (candidateId: string, currentStage: StageName) => void;
  selectedIds?: Set<string>;
  onSelect?: (candidateId: string, checked: boolean) => void;
};

export function StageColumn({ label, candidates, accentClass, onAdvance, selectedIds, onSelect }: Props) {
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
          candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              currentStage={label}
              onAdvance={onAdvance}
              selected={selectedIds?.has(c.id) ?? false}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
