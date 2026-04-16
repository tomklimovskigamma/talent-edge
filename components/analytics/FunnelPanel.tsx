// components/analytics/FunnelPanel.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelMetric } from "@/lib/analytics";

const colors = ["#94A3B8", "#818CF8", "#A78BFA", "#F59E0B", "#F97316", "#10B981"];

export function FunnelPanel({ data }: { data: FunnelMetric[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Pipeline Funnel</CardTitle>
        <p className="text-xs text-slate-400">% retained from Applied stage</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 20, right: 8, bottom: 4, left: -10 }}>
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
              formatter={(value, _name, item) => [`${value} (${item.payload.retainedPct}%)`, "Candidates"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidates">
              <LabelList
                dataKey="retainedPct"
                position="top"
                formatter={(v: unknown) => `${v}%`}
                style={{ fontSize: 11, fill: "#64748B" }}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
