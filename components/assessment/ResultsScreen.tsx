// components/assessment/ResultsScreen.tsx
"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { scoreColor, scoreLabel } from "@/lib/utils";
import { type PotentialDimensions, dimensionLabels } from "@/lib/data/candidates";
import { usePersona } from "@/lib/persona";

type Props = {
  name: string;
  dimensions: PotentialDimensions;
  potentialScore: number;
  onNext: () => void;
};

export function ResultsScreen({ name, dimensions, potentialScore, onNext }: Props) {
  const { persona } = usePersona();
  const isGraduate = persona === "graduate" || persona === null;

  const radarData = (Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => ({
    subject: dimensionLabels[key],
    score: dimensions[key],
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <p className="text-sm text-slate-500">Assessment complete, {name.split(" ")[0]}.</p>
        {isGraduate ? (
          <p className="text-lg font-bold text-slate-800">Results submitted.</p>
        ) : (
          <>
            {/* Thresholds (80, 65) intentionally mirror scoreColor in lib/utils.ts */}
            <div className={`inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${
              potentialScore >= 80 ? "border-emerald-400 bg-emerald-50" :
              potentialScore >= 65 ? "border-amber-400 bg-amber-50" :
              "border-rose-400 bg-rose-50"
            }`}>
              <span className="text-3xl font-black text-slate-800">{potentialScore}</span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {scoreLabel(potentialScore)}
              </p>
              <p className="text-sm text-slate-400">AI Potential Score</p>
            </div>
          </>
        )}
      </div>

      {/* Radar chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Your Potential Profile</h3>
        <p className="text-xs text-slate-400 mb-4">How your results map across the five potential dimensions.</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {!isGraduate && (
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                formatter={(value) => [`${value}/100`, "Score"]}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension scores — hidden from graduate */}
      {!isGraduate && (
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => (
            <div key={key} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-4 py-2.5">
              <span className="text-sm text-slate-600">{dimensionLabels[key]}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(dimensions[key])}`}>
                {dimensions[key]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          Submit Results
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
