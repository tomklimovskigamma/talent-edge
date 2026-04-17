// components/analytics/ScoreByTrackPanel.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrackScoreDist } from "@/lib/analytics";

export function ScoreByTrackPanel({ data }: { data: TrackScoreDist[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Score Distribution by Track</CardTitle>
        <p className="text-xs text-slate-400">Assessed+ candidates, banded by potential score</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <XAxis
              dataKey="track"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="high" name="High Potential" fill="#10B981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="emerging" name="Emerging" fill="#F59E0B" radius={[3, 3, 0, 0]} />
            <Bar dataKey="developing" name="Developing" fill="#F43F5E" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
