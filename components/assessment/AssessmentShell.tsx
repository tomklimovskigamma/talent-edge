// components/assessment/AssessmentShell.tsx
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ChatWidget } from "@/components/assessment/ChatWidget";

type Props = {
  currentStep: number;   // 0 = registration, 1–5 = dimensions, 6 = results, 7 = thankyou
  totalSteps: number;    // 7: registration(0)+5 dimensions+results(6); thankyou(7) hides progress
  stepLabel: string;
  children: React.ReactNode;
};

export function AssessmentShell({ currentStep, totalSteps, stepLabel, children }: Props) {
  const pct = currentStep === 0 ? 0 : Math.round((currentStep / totalSteps) * 100);
  const showProgress = currentStep > 0 && currentStep < totalSteps;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1E1B4B] px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Return to home">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
        </Link>
        {showProgress && (
          <span className="text-xs text-white/50">
            Section {currentStep} of {totalSteps}
          </span>
        )}
      </header>

      {/* Progress bar */}
      {showProgress && (
        <div className="bg-white border-b px-6 py-3 space-y-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">{stepLabel}</span>
            <span className="text-xs text-slate-400">{pct}% complete</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      )}

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </main>

      <ChatWidget />
    </div>
  );
}
