"use client";
import { useState, useEffect } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { getNextStage, filterCandidates, type ScoreBand } from "@/lib/pipeline";
import { ComparisonDrawer } from "./ComparisonDrawer";
import { StageColumn } from "./StageColumn";
import { usePersona } from "@/lib/persona";
import { CheckSquare, Layers, Search, X } from "lucide-react";

const accentClasses = [
  "border-slate-300",
  "border-blue-400",
  "border-violet-400",
  "border-amber-400",
  "border-orange-400",
  "border-emerald-400",
];

export function PipelineBoard() {
  const [filter, setFilter] = useState<ScoreBand>("all");
  const [search, setSearch] = useState("");
  const [stageOverrides, setStageOverrides] = useState<Record<string, StageName>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  // Auto-close the comparison drawer if selection drops below 2
  // (e.g., after bulk shortlist clears selection, or manual deselection).
  useEffect(() => {
    if (selectedIds.size < 2) setCompareOpen(false);
  }, [selectedIds]);

  const filtered = filterCandidates(allCandidates, search, filter);

  function handleAdvance(candidateId: string, currentStage: StageName) {
    const next = getNextStage(currentStage);
    if (!next) return;
    setStageOverrides((prev) => ({ ...prev, [candidateId]: next }));
  }

  function handleSelect(candidateId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(candidateId);
      else next.delete(candidateId);
      return next;
    });
  }

  function handleBulkShortlist() {
    setStageOverrides((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        next[id] = "Shortlisted";
      }
      return next;
    });
    setSelectedIds(new Set());
  }

  const effectiveStage = (candidateId: string, originalStage: StageName): StageName =>
    stageOverrides[candidateId] ?? originalStage;

  const showBulkAction = mounted && persona === "admin" && selectedIds.size > 0;
  const showCompare = showBulkAction && selectedIds.size >= 2 && selectedIds.size <= 3;
  const selectedCandidates = allCandidates.filter((c) => selectedIds.has(c.id));

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, university, or degree…"
          className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">Filter:</span>
        {(["all", "high", "emerging"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? "All Candidates" : f === "high" ? "High Potential (80+)" : "Emerging (65–79)"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          {showCompare && (
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Layers size={12} aria-hidden="true" />
              Compare ({selectedIds.size})
            </button>
          )}
          {showBulkAction && (
            <button
              type="button"
              onClick={handleBulkShortlist}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <CheckSquare size={12} aria-hidden="true" />
              Shortlist selected ({selectedIds.size})
            </button>
          )}
          <span className="text-xs text-slate-400">{filtered.length} candidates shown</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <StageColumn
            key={stage.id}
            label={stage.label}
            candidates={filtered.filter(
              (c) => effectiveStage(c.id, c.stage) === stage.label
            )}
            accentClass={accentClasses[i]}
            onAdvance={handleAdvance}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Comparison drawer */}
      {compareOpen && (
        <ComparisonDrawer
          candidates={selectedCandidates}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
