// components/pipeline/ComparisonDrawer.tsx
"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";
import { scoreColor, stageColor } from "@/lib/utils";
import { generateScreeningSummary } from "@/lib/screening";

const CANDIDATE_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b"] as const;

const DIM_KEYS: (keyof PotentialDimensions)[] = [
  "adaptability",
  "cognitiveAgility",
  "emotionalIntelligence",
  "collaboration",
  "drive",
];

const DIM_SHORT: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adapt.",
  cognitiveAgility: "Cognitive",
  emotionalIntelligence: "EQ",
  collaboration: "Collab.",
  drive: "Drive",
};

type Props = {
  candidates: Candidate[];
  onClose: () => void;
};

export function ComparisonDrawer({ candidates, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drawerRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const chartData = DIM_KEYS.map((dim) => {
    const row: Record<string, string | number> = { dim: DIM_SHORT[dim] };
    candidates.forEach((c) => {
      row[c.id] = c.dimensions[dim];
    });
    return row;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Candidate comparison"
        className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">
            Comparing {candidates.length} candidates
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Candidate header row */}
          <div
            className={`grid gap-3 px-5 py-4 border-b border-slate-100 ${
              candidates.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {candidates.map((c, i) => (
              <div key={c.id} className="text-center space-y-1">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto"
                  style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                >
                  {c.avatarInitials}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{c.name}</p>
                <span
                  className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded-full ${scoreColor(c.potentialScore)}`}
                >
                  {c.potentialScore}
                </span>
                <div>
                  <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full ${stageColor(c.stage)}`}>
                    {c.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dimension bar chart */}
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Dimension Scores
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 4, left: -10 }}
                barCategoryGap="25%"
                barGap={2}
              >
                <XAxis
                  dataKey="dim"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                {candidates.map((c, i) => (
                  <Bar
                    key={c.id}
                    dataKey={c.id}
                    name={c.name.split(" ")[0]}
                    fill={CANDIDATE_COLORS[i]}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI summary bullets */}
          <div className="px-5 pb-6 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              AI Screening Summary
            </h3>
            {candidates.map((c, i) => {
              const { text } = generateScreeningSummary(c);
              const firstSentence = text.match(/^[^.]+\./)?.[0] ?? text;
              return (
                <div key={c.id} className="flex gap-2.5">
                  <div
                    className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: CANDIDATE_COLORS[i] }}
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{c.name.split(" ")[0]}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{firstSentence}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
