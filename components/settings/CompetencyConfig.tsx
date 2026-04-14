// components/settings/CompetencyConfig.tsx
"use client";
import { useState } from "react";
import { dimensionConfigs, type DimensionConfig } from "@/lib/data/assessment";
import { Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompetencyRow = {
  dimension: DimensionConfig["dimension"];
  label: string;
  tagline: string;
};

export function CompetencyConfig() {
  const [rows, setRows] = useState<CompetencyRow[]>(
    dimensionConfigs.map((d) => ({
      dimension: d.dimension,
      label: d.label,
      tagline: d.tagline,
    }))
  );
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  function handleChange(i: number, key: "label" | "tagline", value: string) {
    setRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row))
    );
  }

  function handleSave(i: number) {
    setSavedIndex(i);
    setTimeout(() => setSavedIndex(null), 2000);
  }

  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Brain size={15} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Competency Labels</h2>
        <span className="ml-auto text-xs text-slate-400">5 dimensions</span>
      </div>

      <div className="space-y-5">
        {rows.map((row, i) => (
          <div key={row.dimension} className="border border-slate-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">{row.dimension}</span>
              <div className="flex items-center gap-2">
                {savedIndex === i && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Saved
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={() => handleSave(i)}
                  className="text-xs h-7 px-2.5">
                  Save
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-600"
                  htmlFor={`label-${row.dimension}`}
                >
                  Display label
                </label>
                <input
                  id={`label-${row.dimension}`}
                  type="text"
                  value={row.label}
                  onChange={(e) => handleChange(i, "label", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-600"
                  htmlFor={`tagline-${row.dimension}`}
                >
                  Tagline
                </label>
                <input
                  id={`tagline-${row.dimension}`}
                  type="text"
                  value={row.tagline}
                  onChange={(e) => handleChange(i, "tagline", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
