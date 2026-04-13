// components/dashboard/LifecycleJourney.tsx
import { pipelineCounts } from "@/lib/data/program";

type LifecycleStage = {
  label: string;
  phase: "recruitment" | "development";
  stat: string;
  live: boolean;
};

const stages: LifecycleStage[] = [
  { label: "Attract",      phase: "recruitment", stat: "232 reached",                               live: true  },
  { label: "Assess",       phase: "recruitment", stat: `${pipelineCounts.Assessed} scored`,         live: true  },
  { label: "Select",       phase: "recruitment", stat: `${pipelineCounts.Shortlisted} shortlisted`, live: true  },
  { label: "Offer",        phase: "recruitment", stat: `${pipelineCounts.Offer} made`,              live: true  },
  { label: "Keep Warm",    phase: "development", stat: `${pipelineCounts.Hired} active`,            live: true  },
  { label: "Onboard",      phase: "development", stat: "Coming soon",                               live: false },
  { label: "Develop",      phase: "development", stat: "Coming soon",                               live: false },
  { label: "Track Talent", phase: "development", stat: "Coming soon",                               live: false },
];

export function LifecycleJourney() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Graduate Journey</h2>
          <p className="text-xs text-slate-400 mt-0.5">End-to-end lifecycle — from attraction to talent tracking</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Recruitment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            Development
          </span>
        </div>
      </div>

      <div className="flex items-stretch gap-0">
        {stages.map((stage, i) => {
          const isRecruitment = stage.phase === "recruitment";
          const isLast = i === stages.length - 1;

          const activeBg   = isRecruitment ? "bg-indigo-600" : "bg-violet-600";
          const activeText = "text-white";
          const activeStat = isRecruitment ? "text-indigo-200" : "text-violet-200";
          const inactiveBg = "bg-slate-50";
          const inactiveText = "text-slate-400";
          const inactiveStat = "text-slate-300";

          return (
            <div key={stage.label} className="flex items-stretch flex-1 min-w-0">
              <div
                className={`flex-1 rounded-lg px-2 py-3 flex flex-col items-center justify-center text-center space-y-1 ${
                  stage.live ? `${activeBg} ${activeText}` : `${inactiveBg} ${inactiveText}`
                }`}
              >
                <span className="text-xs font-semibold leading-tight">{stage.label}</span>
                <span className={`text-[10px] leading-tight ${stage.live ? activeStat : inactiveStat}`}>
                  {stage.stat}
                </span>
              </div>
              {!isLast && (
                <div className="flex items-center px-0.5">
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" className="text-slate-300">
                    <path d="M1 1l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
