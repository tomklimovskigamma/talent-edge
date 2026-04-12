import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentEvent } from "@/lib/data/candidates";
import { stageColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AssessmentTimeline({ history }: { history: AssessmentEvent[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {(() => {
          const events = [...history].reverse();
          return (
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    {i < events.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className={`text-xs ${stageColor(event.stage)}`}>{event.stage}</Badge>
                      <span className="text-xs text-slate-400">{new Date(event.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-xs text-slate-600">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
