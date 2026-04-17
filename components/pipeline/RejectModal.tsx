// components/pipeline/RejectModal.tsx
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { Badge } from "@/components/ui/badge";
import { stageColor } from "@/lib/utils";
import { program } from "@/lib/data/program";
import { DEFAULT_REJECTION_TEMPLATE, expandRejectionTemplate } from "@/lib/reject";

type Props = {
  candidates: Candidate[];
  onCancel: () => void;
  onConfirm: () => void;
};

export function RejectModal({ candidates, onCancel, onConfirm }: Props) {
  const [template, setTemplate] = useState(DEFAULT_REJECTION_TEMPLATE);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const first = candidates[0];
  const preview = first
    ? expandRejectionTemplate(template, first, program.programName)
    : "";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 id="reject-modal-title" className="text-base font-bold text-slate-800">
            Send Rejection
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close rejection modal"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Rejecting {candidates.length} candidate{candidates.length === 1 ? "" : "s"}
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1.5">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{c.name}</span>
                <Badge className={`text-xs ${stageColor(c.stage)}`}>{c.stage}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 space-y-1.5">
          <label
            htmlFor="reject-template"
            className="block text-xs font-semibold text-slate-500 uppercase tracking-wide"
          >
            Email Template
          </label>
          <p className="text-xs text-slate-400">
            Tokens <code className="bg-slate-100 px-1 rounded">{"{name}"}</code> and{" "}
            <code className="bg-slate-100 px-1 rounded">{"{program}"}</code> are replaced per candidate.
          </p>
          <textarea
            id="reject-template"
            rows={10}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white resize-y font-mono"
          />
        </div>

        {first && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Preview for {first.name}
            </p>
            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-lg p-3">
              {preview}
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Send rejections ({candidates.length})
          </button>
        </div>
      </div>
    </div>
  );
}
