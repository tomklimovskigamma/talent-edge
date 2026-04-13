import { AppShell } from "@/components/layout/AppShell";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { LifecycleJourney } from "@/components/dashboard/LifecycleJourney";
import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";
import { candidates } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const recentActivity = [
  { text: "Priya Nair received a verbal offer", time: "2 hours ago" },
  { text: "James Thornton's interview confirmed for 7 April", time: "4 hours ago" },
  { text: "12 new applications received overnight", time: "8 hours ago" },
  { text: "Liam O'Brien accepted offer — start date confirmed", time: "Yesterday" },
  { text: "AI assessment batch completed — 23 candidates scored", time: "Yesterday" },
];

export default function DashboardPage() {
  const topCandidates = [...candidates]
    .filter((c) => c.potentialScore >= 85)
    .sort((a, b) => b.potentialScore - a.potentialScore)
    .slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Program Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Meridian Group · 2026 Graduate Intake · Last updated just now</p>
        </div>

        <LifecycleJourney />

        <MetricsRow />

        <div className="grid grid-cols-2 gap-4">
          <PipelineFunnel />
          <ScoreDistribution />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Top candidates */}
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Top Potential Candidates</h2>
            <div className="space-y-2">
              {topCandidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/candidates/${c.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                      {c.avatarInitials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.university}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor(c.potentialScore)}`}>
                      {c.potentialScore}
                    </span>
                    <Badge variant="outline" className="text-xs">{c.stage}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">{a.text}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
