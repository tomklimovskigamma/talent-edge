"use client";
import { useState } from "react";
import { trackLabels, dimensionConfigs, type Track } from "@/lib/data/assessment";
import { Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const trackKeys = Object.keys(trackLabels) as Track[];

function questionCountByType(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const dim of dimensionConfigs) {
    for (const q of dim.questions) {
      if (q.type === "sjt" && typeof q.scenario === "object") {
        counts["sjt (track-specific)"] = (counts["sjt (track-specific)"] ?? 0) + 1;
      } else {
        counts[q.type] = (counts[q.type] ?? 0) + 1;
      }
    }
  }
  return counts;
}

export function TrackConfig() {
  const [trackNames, setTrackNames] = useState<Record<Track, string>>(
    Object.fromEntries(trackKeys.map((k) => [k, trackLabels[k]])) as Record<Track, string>
  );
  const [savedTrack, setSavedTrack] = useState<Track | null>(null);

  function handleSave(track: Track) {
    setSavedTrack(track);
    setTimeout(() => setSavedTrack(null), 2000);
  }

  const typeCounts = questionCountByType();
  const totalQuestions = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Layers size={15} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Track Configuration</h2>
        <span className="ml-auto text-xs text-slate-400">{totalQuestions} questions · {dimensionConfigs.length} dimensions</span>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Each track receives the same question bank with track-specific scenario text for situational judgement questions.
      </p>

      <div className="space-y-4 mb-6">
        {trackKeys.map((track) => (
          <div key={track} className="border border-slate-100 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wide w-28 flex-shrink-0">{track}</span>
                <input
                  type="text"
                  value={trackNames[track]}
                  onChange={(e) =>
                    setTrackNames((prev) => ({ ...prev, [track]: e.target.value }))
                  }
                  aria-label={`Display name for ${track} track`}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1"
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {savedTrack === track && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Saved
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={() => handleSave(track)}
                  className="text-xs h-7 px-2.5">
                  Save
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <span key={type} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {count}× {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
        Question bank editing and custom competency weights are available in the Enterprise plan.
      </p>
    </section>
  );
}
