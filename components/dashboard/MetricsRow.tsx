import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Award, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Total Applicants", value: "187", sub: "+12 this week", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "AI Assessed", value: "142", sub: "75.9% completion", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Shortlisted", value: "43", sub: "30.3% pass rate", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Offers Made", value: "9", sub: "6 accepted", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
];

export function MetricsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className="border shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{m.value}</p>
                <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
              </div>
              <div className={`${m.bg} ${m.color} p-2 rounded-lg`}>
                <m.icon size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
