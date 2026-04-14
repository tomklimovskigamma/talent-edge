// components/profile/FeedbackReportButton.tsx
"use client";
import { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";
import { usePersona } from "@/lib/persona";
import { generateFeedbackReport } from "@/lib/report";
import { scoreColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/lib/data/candidates";

export function FeedbackReportButton({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!mounted || persona !== "admin") return null;

  const report = generateFeedbackReport(candidate);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
      >
        <FileText size={13} />
        Generate Report
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >

            {/* Report header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Talent Edge AI</p>
                <h2 id="report-modal-title" className="text-lg font-bold text-slate-800 mt-0.5">Potential Assessment Report</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close report"
                autoFocus
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Candidate details */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{report.candidateName}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{candidate.university} · {candidate.degree}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Assessed:{" "}
                    {new Date(report.assessmentDate).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 ${
                  report.potentialScore >= 80
                    ? "border-emerald-400 bg-emerald-50"
                    : report.potentialScore >= 65
                    ? "border-amber-400 bg-amber-50"
                    : "border-rose-400 bg-rose-50"
                }`}>
                  <span className="text-xl font-black text-slate-800">{report.potentialScore}</span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${scoreColor(report.potentialScore)}`}>
                  {report.potentialLabel}
                </span>
                <span className="text-xs text-slate-400">{report.programName}</span>
              </div>
            </div>

            {/* Strengths */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Strengths</h4>
              <div className="space-y-3">
                {report.strengths.map((dim) => (
                  <div key={dim.key} className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{dim.label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {dim.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{dim.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Development area */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Development Area</h4>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{report.developmentArea.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(report.developmentArea.score)}`}>
                    {report.developmentArea.score}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{report.developmentArea.interpretation}</p>
                {report.developmentArea.developmentSuggestion && (
                  <p className="text-xs text-amber-700 font-medium border-t border-amber-200 pt-2 mt-3">
                    Suggested focus: {report.developmentArea.developmentSuggestion}
                  </p>
                )}
              </div>
            </div>

            {/* Next steps */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recommended Next Steps</h4>
              <ol className="space-y-2">
                {report.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl">
              <p className="text-[10px] text-slate-400 text-center">
                Generated by Talent Edge AI · {report.programName} · Confidential
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
