"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const buckets = [
  { range: "60–64", count: 4 },
  { range: "65–69", count: 7 },
  { range: "70–74", count: 11 },
  { range: "75–79", count: 18 },
  { range: "80–84", count: 24 },
  { range: "85–89", count: 19 },
  { range: "90–94", count: 12 },
  { range: "95–100", count: 5 },
];

export function ScoreDistribution() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">
          AI Potential Score Distribution
        </CardTitle>
        <p className="text-xs text-slate-400">142 assessed candidates</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={buckets} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
            />
            <ReferenceLine x="80–84" stroke="#4F46E5" strokeDasharray="4 2" label={{ value: "Shortlist threshold", fontSize: 10, fill: "#4F46E5", position: "insideTopRight" }} />
            <Bar dataKey="count" fill="#818CF8" radius={[4, 4, 0, 0]} name="Candidates" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
