import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DevelopmentGoal } from "@/lib/data/candidates";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock } from "lucide-react";

const statusConfig = {
  "not-started": { label: "Not Started", icon: Circle, color: "text-slate-400" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-amber-500" },
  "complete": { label: "Complete", icon: CheckCircle, color: "text-emerald-500" },
};

export function DevelopmentTracker({ goals }: { goals: DevelopmentGoal[] }) {
  const complete = goals.filter((g) => g.status === "complete").length;
  const pct = Math.round((complete / goals.length) * 100);

  return (
    <Card className="border shadow-sm border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700">Post-Hire Development</CardTitle>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">On-Program</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-slate-500">{complete}/{goals.length} goals</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.map((goal, i) => {
            const cfg = statusConfig[goal.status];
            return (
              <div key={i} className="flex items-start gap-3">
                <cfg.icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{goal.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{cfg.label}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">Due {new Date(goal.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-dashed">
          Development tracking activates on candidate start date. Goals are set during onboarding.
        </p>
      </CardContent>
    </Card>
  );
}
