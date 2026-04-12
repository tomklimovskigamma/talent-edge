"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PotentialDimensions, dimensionLabels } from "@/lib/data/candidates";

type Props = { dimensions: PotentialDimensions };

export function PotentialRadar({ dimensions }: Props) {
  const data = (Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => ({
    subject: dimensionLabels[key],
    score: dimensions[key],
    fullMark: 100,
  }));

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Potential Dimensions</CardTitle>
        <p className="text-xs text-slate-400">AI-assessed behavioural profile · Inspired by neuroscience assessment methodology</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data}>
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
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              formatter={(value) => [`${value}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {(Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{dimensionLabels[key]}</span>
              <span className="font-semibold text-slate-700">{dimensions[key]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
