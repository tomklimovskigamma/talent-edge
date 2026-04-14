import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { AiScreeningSummary } from "@/components/profile/AiScreeningSummary";
import { FeedbackReportButton } from "@/components/profile/FeedbackReportButton";
import { KeepWarmFeed } from "@/components/profile/KeepWarmFeed";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) notFound();

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/pipeline" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={14} />
            Pipeline
          </Link>
          <div className="flex items-center gap-2">
            <FeedbackReportButton candidate={candidate} />
            {candidate.stage === "Applied" && (
              <Link href="/assessment">
                <Button size="sm" variant="outline" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  <Send size={13} />
                  Send Assessment
                </Button>
              </Link>
            )}
          </div>
        </div>

        <ProfileHeader candidate={candidate} />

        <AiScreeningSummary candidate={candidate} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PotentialRadar dimensions={candidate.dimensions} />
          <div className="space-y-4">
            <AssessmentTimeline history={candidate.assessmentHistory} />
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
          </div>
        </div>

        <KeepWarmFeed candidate={candidate} />

      </div>
    </AppShell>
  );
}
