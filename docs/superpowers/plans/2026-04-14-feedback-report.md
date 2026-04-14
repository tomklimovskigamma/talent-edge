# Feedback Report Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-triggered "Generate Report" button to the candidate profile that opens a structured PDF-style modal report covering strengths, a development area, and recommended next steps.

**Architecture:** Pure report-generation logic lives in `lib/report.ts` (testable, no React). A single client component `FeedbackReportButton` owns the open/close state, renders the button, and renders the modal inline — admin-only via `usePersona`. The candidate profile page adds the component to the top action bar alongside the existing Send Assessment button.

**Tech Stack:** TypeScript, vitest (already configured), React 19 client component, lucide-react, Tailwind v4, existing `usePersona` hook, existing `scoreColor`/`scoreLabel` from `lib/utils.ts`, existing `dimensionLabels` from `lib/data/candidates.ts`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/report.ts` | Create | Pure `generateFeedbackReport(candidate)` → `FeedbackReport` |
| `__tests__/report.test.ts` | Create | Unit tests for report generation logic |
| `components/profile/FeedbackReportButton.tsx` | Create | Client component — admin-only button + full modal report |
| `app/candidates/[id]/page.tsx` | Modify | Add `<FeedbackReportButton>` to the top action bar |

---

### Task 1: Pure report logic in `lib/report.ts`

**Files:**
- Create: `__tests__/report.test.ts`
- Create: `lib/report.ts`

The function identifies the top 2 scoring dimensions (strengths), the lowest scoring dimension (development area), and selects next-step copy based on stage + potentialScore. All text is static — no AI API call.

- [ ] **Step 1: Write the failing tests in `__tests__/report.test.ts`**

```ts
// __tests__/report.test.ts
import { describe, it, expect } from "vitest";
import { generateFeedbackReport } from "@/lib/report";
import type { Candidate } from "@/lib/data/candidates";

const candidate: Candidate = {
  id: "test-1",
  name: "Jordan Lee",
  university: "University of Melbourne",
  degree: "B. Commerce (Finance)",
  graduationYear: 2026,
  stage: "Assessed",
  appliedDate: "2026-01-01",
  daysInStage: 1,
  potentialScore: 89,
  avatarInitials: "JL",
  assessmentHistory: [
    { date: "2026-01-01", stage: "Applied", note: "Applied." },
    { date: "2026-01-10", stage: "Assessed", note: "Assessed." },
  ],
  dimensions: {
    adaptability: 70,        // bottom
    cognitiveAgility: 90,    // top 2
    emotionalIntelligence: 75,
    collaboration: 95,       // top 1
    drive: 80,
  },
};

describe("generateFeedbackReport", () => {
  it("includes the candidate name and potential score", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.candidateName).toBe("Jordan Lee");
    expect(report.potentialScore).toBe(89);
  });

  it("uses the most recent assessment history date as assessmentDate", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.assessmentDate).toBe("2026-01-10");
  });

  it("falls back to appliedDate when assessmentHistory is empty", () => {
    const report = generateFeedbackReport({ ...candidate, assessmentHistory: [] });
    expect(report.assessmentDate).toBe("2026-01-01");
  });

  it("strengths contains the top two dimensions", () => {
    const report = generateFeedbackReport(candidate);
    const strengthKeys = report.strengths.map((s) => s.key);
    expect(strengthKeys).toContain("collaboration");
    expect(strengthKeys).toContain("cognitiveAgility");
  });

  it("developmentArea is the lowest scoring dimension", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.developmentArea.key).toBe("adaptability");
  });

  it("developmentArea includes a development suggestion", () => {
    const report = generateFeedbackReport(candidate);
    expect(report.developmentArea.developmentSuggestion).toBeTruthy();
    expect(typeof report.developmentArea.developmentSuggestion).toBe("string");
  });

  it("returns shortlisting next steps for high-scoring Assessed candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Assessed", potentialScore: 85 });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/shortlist/i);
  });

  it("returns review next steps for emerging Assessed candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Assessed", potentialScore: 72 });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/review/i);
  });

  it("returns not-recommended next steps for developing Assessed candidates", () => {
    const report = generateFeedbackReport({ ...candidate, stage: "Assessed", potentialScore: 60 });
    const steps = report.nextSteps.join(" ");
    expect(steps).toMatch(/not recommended/i);
  });

  it("each strength has a label, score, and non-empty interpretation", () => {
    const report = generateFeedbackReport(candidate);
    for (const strength of report.strengths) {
      expect(strength.label).toBeTruthy();
      expect(typeof strength.score).toBe("number");
      expect(strength.interpretation.length).toBeGreaterThan(20);
    }
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test
```

Expected: 10 tests fail with `Cannot find module '@/lib/report'`.

- [ ] **Step 3: Create `lib/report.ts`**

```ts
// lib/report.ts
import { dimensionLabels, type Candidate, type PotentialDimensions } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreLabel } from "@/lib/utils";

const highInterpretations: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Demonstrates strong adaptability — recalibrates quickly when circumstances change and moves through uncertainty without losing momentum.",
  cognitiveAgility:
    "Shows high cognitive agility — learns quickly, reasons well under uncertainty, and holds competing ideas without defaulting prematurely to a conclusion.",
  emotionalIntelligence:
    "Displays strong emotional intelligence — reads emotional signals accurately, manages reactions under pressure, and navigates interpersonal dynamics with skill.",
  collaboration:
    "Excels at collaboration — contributes generously to team outcomes, shares credit accurately, and elevates those around them.",
  drive:
    "Demonstrates strong drive — pursues growth beyond what is expected, sets high personal standards, and persists through difficulty.",
};

const emergingInterpretations: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Shows emerging adaptability — handles change reasonably well, with room to build greater comfort in fast-moving environments.",
  cognitiveAgility:
    "Demonstrates emerging cognitive agility — approaches problems thoughtfully, with opportunity to build tolerance for ambiguity and novel challenges.",
  emotionalIntelligence:
    "Shows developing emotional intelligence — demonstrates self-awareness and reasonable interpersonal skill, with room to deepen.",
  collaboration:
    "Demonstrates emerging collaboration — contributes to team settings and is developing the instinct to elevate others proactively.",
  drive:
    "Shows emerging drive — motivated and engaged, with room to stretch further into self-directed ambition and persistence.",
};

const developingInterpretations: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Adaptability is an area for development — deliberate exposure to environments requiring frequent change and uncertainty would support growth.",
  cognitiveAgility:
    "Cognitive agility is a development area — structured practice with novel problem types and ambiguous challenges would be beneficial.",
  emotionalIntelligence:
    "Emotional intelligence is a development area — active listening practice and reflection on interpersonal dynamics would support growth.",
  collaboration:
    "Collaboration is a development area — proactive information sharing and intentional credit-giving would strengthen team contribution.",
  drive:
    "Drive is a development area — setting specific stretch goals and identifying intrinsic motivators would help build sustained ambition.",
};

const developmentSuggestions: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Seek assignments that require frequent context-switching. Practice reframing setbacks as data rather than judgements.",
  cognitiveAgility:
    "Engage regularly with problems outside your domain. Build the habit of sitting with ambiguity before reaching for a conclusion.",
  emotionalIntelligence:
    "Focus on active listening and pausing before reacting in high-stakes conversations. Seek feedback on how you land in team settings.",
  collaboration:
    "Look for opportunities to share information before being asked and to give specific, public credit to team members.",
  drive:
    "Set stretch goals that sit slightly beyond your current comfort zone. Use structured reflection to identify what motivates you beyond external rewards.",
};

function getDimensionInterpretation(key: keyof PotentialDimensions, score: number): string {
  if (score >= 80) return highInterpretations[key];
  if (score >= 65) return emergingInterpretations[key];
  return developingInterpretations[key];
}

function getNextSteps(stage: StageName, potentialScore: number): string[] {
  if (stage === "Applied") {
    return [
      "Send the AI potential assessment link to the candidate to progress.",
      "Assessment takes approximately 15–20 minutes to complete.",
      "Results will be available for review immediately on completion.",
    ];
  }
  if (stage === "Assessed") {
    if (potentialScore >= 80) {
      return [
        "Candidate is recommended for shortlisting based on their potential score.",
        "Review dimension breakdown alongside CV before confirming shortlist decision.",
        "Target: shortlist decision within 5 business days of assessment completion.",
      ];
    }
    if (potentialScore >= 65) {
      return [
        "Candidate shows emerging potential — review dimension breakdown carefully before progressing.",
        "Consider a structured phone screen to probe specific development areas.",
        "Shortlisting decision at program manager discretion.",
      ];
    }
    return [
      "Based on current scores, candidate is not recommended for progression at this stage.",
      "Program manager review required before any decision is communicated to the candidate.",
      "Consider whether a retest or alternative assessment pathway is appropriate.",
    ];
  }
  if (stage === "Shortlisted") {
    return [
      "Schedule panel interview — candidate has been shortlisted.",
      "Share dimension breakdown with interviewers to guide structured probe questions.",
      "Use the development area as a targeted interview probe.",
    ];
  }
  if (stage === "Interview") {
    return [
      "Interview in progress — debrief to follow.",
      "Use this report as a reference during the post-interview debrief.",
      "Compare interview observations against the dimension breakdown.",
    ];
  }
  return [
    "Candidate has progressed to the offer / hire stage.",
    "Share this feedback report with the candidate as part of the offer communication.",
    "Use the development area to inform the first-year development plan.",
  ];
}

export type DimensionReport = {
  key: keyof PotentialDimensions;
  label: string;
  score: number;
  interpretation: string;
  developmentSuggestion?: string;
};

export type FeedbackReport = {
  candidateName: string;
  programName: string;
  assessmentDate: string;
  potentialScore: number;
  potentialLabel: string;
  strengths: [DimensionReport, DimensionReport];
  developmentArea: DimensionReport;
  nextSteps: string[];
};

export function generateFeedbackReport(candidate: Candidate): FeedbackReport {
  const { dimensions, potentialScore, name, stage, assessmentHistory, appliedDate } = candidate;

  const assessmentDate =
    assessmentHistory.length > 0
      ? assessmentHistory[assessmentHistory.length - 1].date
      : appliedDate;

  const sorted = (Object.entries(dimensions) as [keyof PotentialDimensions, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  const [top1Key, top1Score] = sorted[0];
  const [top2Key, top2Score] = sorted[1];
  const [bottomKey, bottomScore] = sorted[sorted.length - 1];

  const strengths: [DimensionReport, DimensionReport] = [
    {
      key: top1Key,
      label: dimensionLabels[top1Key],
      score: top1Score,
      interpretation: getDimensionInterpretation(top1Key, top1Score),
    },
    {
      key: top2Key,
      label: dimensionLabels[top2Key],
      score: top2Score,
      interpretation: getDimensionInterpretation(top2Key, top2Score),
    },
  ];

  const developmentArea: DimensionReport = {
    key: bottomKey,
    label: dimensionLabels[bottomKey],
    score: bottomScore,
    interpretation: getDimensionInterpretation(bottomKey, bottomScore),
    developmentSuggestion: developmentSuggestions[bottomKey],
  };

  return {
    candidateName: name,
    programName: "Meridian Group · 2026 Graduate Intake",
    assessmentDate,
    potentialScore,
    potentialLabel: scoreLabel(potentialScore),
    strengths,
    developmentArea,
    nextSteps: getNextSteps(stage, potentialScore),
  };
}
```

- [ ] **Step 4: Run tests to confirm they all pass**

```bash
npm test
```

Expected: `10 tests passed` (in `__tests__/report.test.ts`) plus the 10 existing screening tests — 20 total.

- [ ] **Step 5: Commit**

```bash
git add lib/report.ts __tests__/report.test.ts
git commit -m "feat: add generateFeedbackReport pure function with tests"
```

---

### Task 2: `FeedbackReportButton` client component

**Files:**
- Create: `components/profile/FeedbackReportButton.tsx`

This component owns everything about the report: the button trigger, the open/close state, and the full modal overlay. It is admin-only and hydration-safe (same `mounted` pattern as `AiScreeningSummary`).

- [ ] **Step 1: Create `components/profile/FeedbackReportButton.tsx`**

```tsx
// components/profile/FeedbackReportButton.tsx
"use client";
import { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";
import { usePersona } from "@/lib/persona";
import { generateFeedbackReport } from "@/lib/report";
import { scoreColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/lib/data/candidates";

export function FeedbackReportButton({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || persona !== "admin") return null;

  const report = generateFeedbackReport(candidate);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
      >
        <FileText size={13} />
        Generate Report
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Report header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Talent Edge AI</p>
                <h2 className="text-lg font-bold text-slate-800 mt-0.5">Potential Assessment Report</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close report"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Candidate details */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{report.candidateName}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{candidate.university} · {candidate.degree}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Assessed:{" "}
                    {new Date(report.assessmentDate).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 ${
                  report.potentialScore >= 80
                    ? "border-emerald-400 bg-emerald-50"
                    : report.potentialScore >= 65
                    ? "border-amber-400 bg-amber-50"
                    : "border-rose-400 bg-rose-50"
                }`}>
                  <span className="text-xl font-black text-slate-800">{report.potentialScore}</span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${scoreColor(report.potentialScore)}`}>
                  {report.potentialLabel}
                </span>
                <span className="text-xs text-slate-400">{report.programName}</span>
              </div>
            </div>

            {/* Strengths */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Strengths</h4>
              <div className="space-y-3">
                {report.strengths.map((dim) => (
                  <div key={dim.key} className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{dim.label}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {dim.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{dim.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Development area */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Development Area</h4>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{report.developmentArea.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(report.developmentArea.score)}`}>
                    {report.developmentArea.score}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{report.developmentArea.interpretation}</p>
                {report.developmentArea.developmentSuggestion && (
                  <p className="text-xs text-amber-700 font-medium border-t border-amber-200 pt-2 mt-3">
                    Suggested focus: {report.developmentArea.developmentSuggestion}
                  </p>
                )}
              </div>
            </div>

            {/* Next steps */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recommended Next Steps</h4>
              <ol className="space-y-2">
                {report.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl">
              <p className="text-[10px] text-slate-400 text-center">
                Generated by Talent Edge AI · {report.programName} · Confidential
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Confirm TypeScript build passes**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/profile/FeedbackReportButton.tsx
git commit -m "feat: add FeedbackReportButton component with modal report"
```

---

### Task 3: Wire into the candidate profile page

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

The current top action bar has a back link on the left and a conditional "Send Assessment" button on the right. "Generate Report" goes alongside it, in a flex group on the right side.

The current file header section (lines 1–11):
```tsx
import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { AiScreeningSummary } from "@/components/profile/AiScreeningSummary";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
```

The current top action bar JSX:
```tsx
<div className="flex items-center justify-between">
  <Link href="/pipeline" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
    <ChevronLeft size={14} />
    Pipeline
  </Link>
  {candidate.stage === "Applied" && (
    <Link href="/assessment">
      <Button size="sm" variant="outline" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
        <Send size={13} />
        Send Assessment
      </Button>
    </Link>
  )}
</div>
```

- [ ] **Step 1: Update `app/candidates/[id]/page.tsx`**

Write the complete updated file:

```tsx
import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { AiScreeningSummary } from "@/components/profile/AiScreeningSummary";
import { FeedbackReportButton } from "@/components/profile/FeedbackReportButton";
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
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) and choose **Admin**.
2. Go to Pipeline → click any candidate card.
3. Confirm: "Generate Report" button appears top-right next to "Send Assessment" (for Applied candidates) or alone (for all others).
4. Click "Generate Report" — confirm modal opens with report content.
5. Confirm: candidate name, score circle, strengths (2 cards), development area (with suggestion), next steps (3 bullets).
6. Click outside the modal — confirm it closes.
7. Click the ✕ button — confirm it closes.
8. Switch to Graduate persona — confirm "Generate Report" button is absent.

- [ ] **Step 4: Commit**

```bash
git add "app/candidates/[id]/page.tsx"
git commit -m "feat: add Generate Report button to candidate profile action bar"
```

---

## Self-Review

**Spec coverage:**
- ✅ "Generate Report" button on candidate profile — Task 3
- ✅ Opens a modal — Task 2 (`open` state + overlay)
- ✅ PDF-style structured report — Task 2 (header, candidate details, score, strengths, dev area, next steps, footer)
- ✅ Dimension scores with interpretations — Task 1 (`getDimensionInterpretation` per score band)
- ✅ Strengths (top 2 dimensions) — Task 1
- ✅ Development suggestions — Task 1 (`developmentSuggestions` map)
- ✅ Next steps — Task 1 (`getNextSteps` by stage + score)
- ✅ Admin-only — Task 2 (`persona !== "admin"` guard)
- ✅ Closes the ChatWidget loop ("report within 5 business days") — next steps for Assessed candidates reference this

**Placeholder scan:** None. All interpretation text, development suggestions, and next-step copy is written out in full in Task 1.

**Type consistency:**
- `DimensionReport` and `FeedbackReport` are defined in `lib/report.ts` and used only in `FeedbackReportButton.tsx` via `generateFeedbackReport` — no direct type import needed in the component.
- `report.strengths` is typed as `[DimensionReport, DimensionReport]` (tuple) — the `.map()` call in Task 2 component handles this correctly since tuples are iterable.
- `generateFeedbackReport` signature: `(candidate: Candidate): FeedbackReport` — matches all call sites.
