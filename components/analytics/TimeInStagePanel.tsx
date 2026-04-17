// components/analytics/TimeInStagePanel.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeInStage } from "@/lib/analytics";

export function TimeInStagePanel({ data }: { data: TimeInStage[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Average Time in Stage</CardTitle>
        <p className="text-xs text-slate-400">Days candidates currently in each stage</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 10 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
              formatter={(v: unknown) => [`${v}d`, "Avg days"]}
            />
            <Bar dataKey="avgDays" fill="#818CF8" radius={[0, 4, 4, 0]} name="Avg days" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
