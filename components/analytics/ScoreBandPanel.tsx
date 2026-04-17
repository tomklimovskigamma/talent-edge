// components/analytics/ScoreBandPanel.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreBand } from "@/lib/analytics";

export function ScoreBandPanel({ data }: { data: ScoreBand[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Score Band Breakdown</CardTitle>
        <p className="text-xs text-slate-400">Assessed+ cohort by AI potential band</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                formatter={(v: unknown) => `${v} candidates`}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="band"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{total}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Assessed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
