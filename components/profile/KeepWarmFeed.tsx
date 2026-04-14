// components/profile/KeepWarmFeed.tsx
"use client";
import { useState, useEffect } from "react";
import { Mail, Video, Users, Clock, List, CalendarClock } from "lucide-react";
import { usePersona } from "@/lib/persona";
import { generateKeepWarmFeed } from "@/lib/keepwarm";
import type { KeepWarmEvent, KeepWarmEventStatus } from "@/lib/keepwarm";
import type { Candidate } from "@/lib/data/candidates";

const iconMap: Record<KeepWarmEvent["iconType"], React.ElementType> = {
  mail: Mail,
  video: Video,
  users: Users,
  clock: Clock,
  list: List,
};

const statusConfig: Record<
  KeepWarmEventStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  sent: {
    label: "Sent",
    badgeClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-400",
  },
  scheduled: {
    label: "Scheduled",
    badgeClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-400",
  },
  upcoming: {
    label: "Upcoming",
    badgeClass: "bg-slate-100 text-slate-500",
    dotClass: "bg-slate-300",
  },
};

export function KeepWarmFeed({ candidate }: { candidate: Candidate }) {
  const [mounted, setMounted] = useState(false);
  const { persona } = usePersona();

  useEffect(() => setMounted(true), []);

  if (!mounted || persona !== "admin" || candidate.stage !== "Hired") return null;

  const events = generateKeepWarmFeed(candidate);

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock size={14} className="text-violet-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-700">Keep Warm Feed</h3>
        <span className="text-xs text-slate-400 ml-auto">Powered by Grad-Engage</span>
      </div>
      <div className="space-y-4">
        {events.map((event, i) => {
          const Icon = iconMap[event.iconType];
          const config = statusConfig[event.status];
          return (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dotClass}`} />
                {i < events.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 my-1" />
                )}
              </div>
              <div className="pb-1 flex-1">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-xs font-semibold text-slate-700">{event.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">
                      {new Date(event.date).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 ml-[18px]">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
