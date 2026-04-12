import { AppShell } from "@/components/layout/AppShell";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Candidate Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">Meridian Group · 2026 Graduate Intake · 18 demo candidates displayed</p>
        </div>
        <PipelineBoard />
      </div>
    </AppShell>
  );
}
