// app/analytics/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { candidates } from "@/lib/data/candidates";
import { pipelineCounts } from "@/lib/data/program";
import { FunnelPanel } from "@/components/analytics/FunnelPanel";
import { ScoreByTrackPanel } from "@/components/analytics/ScoreByTrackPanel";
import { TimeInStagePanel } from "@/components/analytics/TimeInStagePanel";
import { ScoreBandPanel } from "@/components/analytics/ScoreBandPanel";
import {
  computeFunnelMetrics,
  computeScoreDistByTrack,
  computeTimeInStage,
  computeScoreBandBreakdown,
} from "@/lib/analytics";

export default function AnalyticsPage() {
  const funnel = computeFunnelMetrics(pipelineCounts);
  const trackDist = computeScoreDistByTrack(candidates);
  const timeInStage = computeTimeInStage(candidates);
  const bands = computeScoreBandBreakdown(candidates);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Program Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Meridian Group · 2026 Graduate Intake
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FunnelPanel data={funnel} />
          <ScoreByTrackPanel data={trackDist} />
          <TimeInStagePanel data={timeInStage} />
          <ScoreBandPanel data={bands} />
        </div>
      </div>
    </AppShell>
  );
}
