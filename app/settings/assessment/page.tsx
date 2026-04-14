import { AppShell } from "@/components/layout/AppShell";
import { Settings } from "lucide-react";
import { BrandingConfig } from "@/components/settings/BrandingConfig";
import { CompetencyConfig } from "@/components/settings/CompetencyConfig";
import { TrackConfig } from "@/components/settings/TrackConfig";

export default function AssessmentConfigPage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-indigo-500" />
            <h1 className="text-lg font-semibold text-slate-800">Assessment Configuration</h1>
          </div>
          <p className="text-sm text-slate-500">
            Customise your program branding, competency labels, and track question assignments. Changes apply immediately to your live assessment.
          </p>
        </div>

        <BrandingConfig />
        <CompetencyConfig />
        <TrackConfig />
      </div>
    </AppShell>
  );
}
