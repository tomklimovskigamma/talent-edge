// components/dashboard/CohortInsights.tsx
import { Sparkles } from "lucide-react";
import { candidates } from "@/lib/data/candidates";
import {
  computeDimensionAverages,
  strongestDimension,
  weakestDimension,
  computeTrackAverages,
} from "@/lib/cohort";

export function CohortInsights() {
  const dimAvgs = computeDimensionAverages(candidates);
  const strong = strongestDimension(dimAvgs);
  const weak = weakestDimension(dimAvgs);
  const tracks = computeTrackAverages(candidates);

  const strongestText = `${strong.label} is this cohort's standout strength — averaging ${strong.average} across all assessed candidates.`;

  const weakestText = `${weak.label} is the development opportunity — cohort average of ${weak.average}, ${weak.gap} points below ${strong.label}.`;

  const trackEntries = (["Finance", "Technology", "People & Culture"] as const)
    .map((t) => ({ track: t, avg: tracks[t] }))
    .sort((a, b) => b.avg - a.avg);
  const [leader, second, third] = trackEntries;
  const trackText = `${leader.track} track candidates lead on overall potential score (${leader.avg} avg) vs ${second.track} (${second.avg}) and ${third.track} (${third.avg}).`;

  const bullets: { dotClass: string; text: string }[] = [
    { dotClass: "bg-indigo-500", text: strongestText },
    { dotClass: "bg-violet-500", text: weakestText },
    { dotClass: "bg-amber-500", text: trackText },
  ];

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={14} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Cohort Intelligence</h2>
      </div>
      <div className="space-y-2.5">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${b.dotClass}`} />
            <p className="text-sm text-slate-600 leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
