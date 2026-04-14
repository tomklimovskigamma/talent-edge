# Candidate Assessment Journey — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a candidate-facing multi-step potential assessment at `/assessment` — 20 questions across 5 dimensions with career-track-specific scenarios, a visual sequence puzzle, SVG emotion-recognition, end-reveal radar chart, and pipeline integration showing the completed candidate (Jordan Lee, c019) in the program manager's view.

**Architecture:** All state is client-side only (no backend). A single `"use client"` page at `app/assessment/page.tsx` owns an 8-step state machine (registration → 5 dimension sections → results → thank-you). Questions are pre-populated with default answers so the demo can be clicked through without typing. Scoring is pure functions in `lib/scoring.ts`. Jordan Lee (c019) is pre-seeded in `candidates.ts` with computed scores from the default answers; the assessment flow is the narrative of how those scores were generated. A "Send Assessment" button on pipeline cards links to `/assessment`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui (Card, Button, Badge, Progress, RadioGroup), Recharts RadarChart (reused from profile), lucide-react, inline SVG for puzzle tiles and emotion faces.

---

## File Map

```
lib/
  data/
    assessment.ts          — All question types, question content, 3-track scenario variants, default answers
    candidates.ts          — Add c019 Jordan Lee with pre-computed scores
  scoring.ts               — Pure functions: scoreQuestion, scoreDimension, scoreAll

app/
  assessment/
    page.tsx               — "use client" state machine: step, answers, track, registration data

components/
  assessment/
    AssessmentShell.tsx    — Outer wrapper: Talent Edge header, progress bar, step label
    RegistrationStep.tsx   — Step 0: name, email, university, degree, track selector (pre-filled)
    DimensionStep.tsx      — Generic section: renders 4 questions for one dimension, Next button
    LikertQuestion.tsx     — 1–5 radio scale with labels
    SJTQuestion.tsx        — Scenario text (track-resolved) + 4 radio options
    ForcedChoiceQuestion.tsx — Two-option card choice (A vs B)
    SequencePuzzle.tsx     — SVG 3×3 grid pattern puzzle with 4 answer tiles
    EmotionFace.tsx        — SVG illustrated face + 4 emotion option buttons
    ResultsScreen.tsx      — End-reveal: scores per dimension + RadarChart
    ThankYouScreen.tsx     — Confirmation + link to Jordan's profile

components/
  pipeline/
    CandidateCard.tsx      — Add "Send Assessment" secondary link (modify existing)
```

---

## Score Design (read before implementing)

Each question produces a raw score 1–5. Dimension score = `Math.round((sum / (questions.length * 5)) * 100)`.

Jordan Lee's **default answers** are designed to produce:

| Dimension | Q1 | Q2 | Q3 | Q4 | Sum | Score |
|---|---|---|---|---|---|---|
| Adaptability | 5 | 3 | 4* | 5 | 17 | **85** |
| Cognitive Agility | 5 | 4 | 4 | 5 | 18 | **90** |
| Emotional Intelligence | 5 | 4 | 3 | 5 | 17 | **85** |
| Collaboration | 5 | 5 | 4 | 5 | 19 | **95** |
| Drive | 5 | 4 | 5 | 4* | 18 | **90** |

`*` = reverse-scored Likert (stored value 2 → effective score 4).

Overall `potentialScore` = `Math.round((85+90+85+95+90)/5)` = **89**.

---

## Task 1: Assessment Data Types + Question Content

**Files:**
- Create: `lib/data/assessment.ts`

- [ ] **Step 1: Create `lib/data/assessment.ts` with all types and question content**

```typescript
// lib/data/assessment.ts

export type Track = "finance" | "technology" | "people-culture";
export type Dimension = "adaptability" | "cognitiveAgility" | "emotionalIntelligence" | "collaboration" | "drive";

export type TrackScenario = { finance: string; technology: string; "people-culture": string };

// ── Question variant types ──────────────────────────────────────────────

export type LikertQuestion = {
  type: "likert";
  id: string;
  text: string;
  reversed: boolean;     // if true, score = 6 - value
  defaultValue: number;  // 1–5
};

export type SJTOption = { id: string; text: string; score: number };

export type SJTQuestion = {
  type: "sjt";
  id: string;
  scenario: string | TrackScenario;
  options: SJTOption[];
  defaultOptionId: string;
};

export type ForcedChoiceQuestion = {
  type: "forced-choice";
  id: string;
  prompt: string;
  optionA: { text: string; score: number };
  optionB: { text: string; score: number };
  defaultChoice: "A" | "B";
};

export type SequencePuzzleQuestion = {
  type: "sequence-puzzle";
  id: string;
  prompt: string;
  defaultOptionId: "A"; // A is always the correct answer
};

export type EmotionFaceQuestion = {
  type: "emotion-face";
  id: string;
  prompt: string;
  // Face shown is always the "Anxious" face (defined in EmotionFace.tsx)
  options: { id: string; label: string; score: number }[];
  defaultOptionId: string; // "B" = Anxious = correct
};

export type Question =
  | LikertQuestion
  | SJTQuestion
  | ForcedChoiceQuestion
  | SequencePuzzleQuestion
  | EmotionFaceQuestion;

export type DimensionConfig = {
  dimension: Dimension;
  label: string;
  tagline: string;   // shown below label on section header
  questions: Question[];
};

// ── Registration ────────────────────────────────────────────────────────

export type RegistrationData = {
  name: string;
  email: string;
  university: string;
  degree: string;
  track: Track;
};

export const defaultRegistration: RegistrationData = {
  name: "Jordan Lee",
  email: "jordan.lee@student.unimelb.edu.au",
  university: "University of Melbourne",
  degree: "B. Commerce (Finance & Economics)",
  track: "finance",
};

export const trackLabels: Record<Track, string> = {
  finance: "Finance",
  technology: "Technology",
  "people-culture": "People & Culture",
};

// ── Dimension question data ──────────────────────────────────────────────

export const dimensionConfigs: DimensionConfig[] = [
  // ── 1. ADAPTABILITY ───────────────────────────────────────────────────
  {
    dimension: "adaptability",
    label: "Adaptability",
    tagline: "How you respond when circumstances change.",
    questions: [
      {
        type: "sjt",
        id: "ada-1",
        scenario: {
          finance:
            "You've spent a week building a detailed financial model for a client pitch. The morning of the presentation, your manager tells you the client's strategy has shifted entirely — a completely different analysis is needed by end of day.",
          technology:
            "You've spent a week architecting a technical solution for a client project. The morning of your design review, your manager tells you the client has changed their requirements entirely — a different approach is needed by end of day.",
          "people-culture":
            "You've spent a week designing an onboarding program for a new team. The day before launch, leadership restructures the team entirely — a completely different program is needed by end of day.",
        },
        options: [
          { id: "A", text: "Ask your manager to clarify the new direction before changing anything.", score: 5 },
          { id: "B", text: "Start rebuilding immediately — the sooner you start, the better.", score: 4 },
          { id: "C", text: "Deliver the original work and flag the change for next time.", score: 2 },
          { id: "D", text: "Ask if the deadline can be extended given the scale of change.", score: 3 },
        ],
        defaultOptionId: "A",
      },
      {
        type: "likert",
        id: "ada-2",
        text: "When plans change at short notice, I adjust quickly without losing momentum.",
        reversed: false,
        defaultValue: 3,
      },
      {
        type: "likert",
        id: "ada-3",
        text: "I find it hard to abandon an approach I've already invested significant time developing.",
        reversed: true,
        defaultValue: 2,
      },
      {
        type: "sjt",
        id: "ada-4",
        scenario: {
          finance:
            "Your team is switching from Excel to a new financial planning platform — in one week. Several teammates are resistant to the change.",
          technology:
            "Your team is switching from your current tech stack to a new framework — in one sprint. Several teammates are resistant to the change.",
          "people-culture":
            "Your HR team is switching to a new HRIS platform — in two weeks. Several teammates are resistant to the change.",
        },
        options: [
          { id: "A", text: "Embrace it — start learning the new tool immediately.", score: 5 },
          { id: "B", text: "Learn it and proactively help teammates who are struggling.", score: 5 },
          { id: "C", text: "Suggest a longer transition period to minimise disruption.", score: 3 },
          { id: "D", text: "Raise concerns about the timing with your manager.", score: 2 },
        ],
        defaultOptionId: "A",
      },
    ],
  },

  // ── 2. COGNITIVE AGILITY ──────────────────────────────────────────────
  {
    dimension: "cognitiveAgility",
    label: "Cognitive Agility",
    tagline: "How quickly you learn, reason, and solve new problems.",
    questions: [
      {
        type: "sequence-puzzle",
        id: "cog-1",
        prompt:
          "Each row and column contains one of each colour (blue, amber, indigo) and one of each shape (circle, square, triangle). Which tile completes the grid?",
        defaultOptionId: "A",
      },
      {
        type: "sjt",
        id: "cog-2",
        scenario: {
          finance:
            "You receive two reports about a client's financial health. Your analyst shows healthy cash flow; an external advisor flags significant debt concerns. You have a client call in 20 minutes.",
          technology:
            "Two monitoring dashboards show conflicting data about your system. One shows healthy metrics; another shows error spikes. A client demo is in 20 minutes.",
          "people-culture":
            "Two exit interview summaries give conflicting signals about team morale. One shows high satisfaction; another reveals serious concerns. A board briefing is in 20 minutes.",
        },
        options: [
          { id: "A", text: "Raise the discrepancy transparently at the meeting and commit to resolving it.", score: 5 },
          { id: "B", text: "Go with the more optimistic data — don't alarm the client unnecessarily.", score: 2 },
          { id: "C", text: "Quickly contact both sources to determine which is accurate before the call.", score: 4 },
          { id: "D", text: "Postpone the meeting until you can reconcile the data.", score: 3 },
        ],
        defaultOptionId: "C",
      },
      {
        type: "likert",
        id: "cog-3",
        text: "I enjoy tackling complex problems that require thinking in genuinely new ways.",
        reversed: false,
        defaultValue: 4,
      },
      {
        type: "forced-choice",
        id: "cog-4",
        prompt: "Which feels more like you?",
        optionA: {
          text: "I like to fully understand a problem before I act on it.",
          score: 4,
        },
        optionB: {
          text: "I prefer to act, then adjust my approach based on what I learn.",
          score: 5,
        },
        defaultChoice: "B",
      },
    ],
  },

  // ── 3. EMOTIONAL INTELLIGENCE ─────────────────────────────────────────
  {
    dimension: "emotionalIntelligence",
    label: "Emotional Intelligence",
    tagline: "How you read, manage, and respond to emotions.",
    questions: [
      {
        type: "emotion-face",
        id: "ei-1",
        prompt: "Look at this person's expression. What are they most likely feeling?",
        options: [
          { id: "A", label: "Happy", score: 1 },
          { id: "B", label: "Anxious", score: 5 },   // ← correct
          { id: "C", label: "Surprised", score: 3 },
          { id: "D", label: "Confident", score: 1 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "sjt",
        id: "ei-2",
        scenario: {
          finance:
            "During a client presentation, a senior partner interrupts to challenge your financial analysis in front of the room. You believe your numbers are correct.",
          technology:
            "During a code review, a senior engineer publicly challenges your architecture choice in front of the team. You believe your approach is sound.",
          "people-culture":
            "During a leadership meeting, a senior manager publicly questions your candidate recommendations. You believe your assessment is correct.",
        },
        options: [
          { id: "A", text: "Defend your position clearly and immediately.", score: 2 },
          { id: "B", text: "Thank them and offer to discuss the detail after the meeting.", score: 5 },
          { id: "C", text: "Concede to avoid prolonging the tension.", score: 2 },
          { id: "D", text: "Ask them to elaborate on their concern so you fully understand it.", score: 4 },
        ],
        defaultOptionId: "D",
      },
      {
        type: "likert",
        id: "ei-3",
        text: "I notice when someone around me is upset even before they say anything.",
        reversed: false,
        defaultValue: 3,
      },
      {
        type: "sjt",
        id: "ei-4",
        scenario: {
          finance:
            "A colleague on your finance team is noticeably disengaged and falling behind on their deliverables. The quarter-end deadline is two weeks away.",
          technology:
            "A teammate is noticeably disengaged and falling behind on their sprint tasks. The release date is two weeks away.",
          "people-culture":
            "A colleague in your HR team is noticeably disengaged and falling behind on their work. A key hiring cycle closes in two weeks.",
        },
        options: [
          { id: "A", text: "Report the issue to your manager so they can handle it.", score: 2 },
          { id: "B", text: "Check in with them privately — ask if they're okay and offer to help.", score: 5 },
          { id: "C", text: "Pick up their tasks quietly so the deadline isn't affected.", score: 3 },
          { id: "D", text: "Leave them to sort it out — it's not your responsibility.", score: 1 },
        ],
        defaultOptionId: "B",
      },
    ],
  },

  // ── 4. COLLABORATION ─────────────────────────────────────────────────
  {
    dimension: "collaboration",
    label: "Collaboration",
    tagline: "How you contribute to and elevate those around you.",
    questions: [
      {
        type: "sjt",
        id: "col-1",
        scenario: {
          finance:
            "Two colleagues disagree on the right financial model approach — a senior analyst and a junior analyst. You're their peer. The client deliverable is due tomorrow.",
          technology:
            "Two engineers disagree on a technical implementation approach — one senior, one junior. You're their peer. The sprint closes tomorrow.",
          "people-culture":
            "Two HR colleagues disagree on a hiring recommendation — one senior, one junior. You're their peer. The panel meets tomorrow.",
        },
        options: [
          { id: "A", text: "Side with the senior person — their experience should carry the decision.", score: 2 },
          { id: "B", text: "Facilitate a quick discussion to hear both perspectives before deciding.", score: 5 },
          { id: "C", text: "Suggest escalating it to your manager to avoid the conflict.", score: 3 },
          { id: "D", text: "Make your own recommendation based on what you've heard from both.", score: 4 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "forced-choice",
        id: "col-2",
        prompt: "Which is more true of you at work?",
        optionA: {
          text: "I focus on delivering my own work to the highest possible standard.",
          score: 3,
        },
        optionB: {
          text: "I check in on teammates and offer help even when it's not my responsibility.",
          score: 5,
        },
        defaultChoice: "B",
      },
      {
        type: "likert",
        id: "col-3",
        text: "I naturally share information or knowledge that might help others, even when no one asks.",
        reversed: false,
        defaultValue: 4,
      },
      {
        type: "sjt",
        id: "col-4",
        scenario: {
          finance:
            "Your team delivers a high-profile financial project that receives significant recognition from leadership. You contributed more than anyone else. When asked to speak about it, what do you do?",
          technology:
            "Your team ships a high-profile feature that receives significant recognition from leadership. You contributed more than anyone else. When asked to speak about it, what do you do?",
          "people-culture":
            "Your team completes a major talent initiative that receives significant recognition from leadership. You contributed more than anyone else. When asked to speak about it, what do you do?",
        },
        options: [
          { id: "A", text: "Explain your specific contributions clearly — it's important others know.", score: 3 },
          { id: "B", text: "Share the credit with the whole team equally.", score: 4 },
          { id: "C", text: "Acknowledge the team effort and highlight a few key individual contributions, including yours.", score: 5 },
          { id: "D", text: "Deflect entirely and give all credit to the team.", score: 3 },
        ],
        defaultOptionId: "C",
      },
    ],
  },

  // ── 5. DRIVE ─────────────────────────────────────────────────────────
  {
    dimension: "drive",
    label: "Drive",
    tagline: "Your motivation, ambition, and persistence.",
    questions: [
      {
        type: "sjt",
        id: "drv-1",
        scenario: {
          finance:
            "You're assigned two projects. Task A is a routine reconciliation with a guaranteed clean outcome. Task B is a complex financial model for a new product — more difficult, higher impact, 65% chance of success.",
          technology:
            "You're assigned two tasks. Task A is a well-scoped bug fix with guaranteed completion. Task B is a greenfield feature — more ambiguous, higher impact, 65% chance of shipping on time.",
          "people-culture":
            "You're given two initiatives. Task A is an established onboarding process update — predictable outcome. Task B is a new culture program — more complex, higher impact, 65% chance of success.",
        },
        options: [
          { id: "A", text: "Task A — I'd rather deliver something reliably.", score: 2 },
          { id: "B", text: "Task B — I want the challenge and the impact.", score: 5 },
          { id: "C", text: "Try to take on both in parallel.", score: 3 },
          { id: "D", text: "Ask my manager which is more important.", score: 3 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "likert",
        id: "drv-2",
        text: "I set ambitious goals for myself, even when there's no external pressure to do so.",
        reversed: false,
        defaultValue: 4,
      },
      {
        type: "sjt",
        id: "drv-3",
        scenario: {
          finance:
            "You've tried three approaches to resolve a complex accounts discrepancy. None have worked. It's 5pm Friday and the report is due Monday morning.",
          technology:
            "You've tried three approaches to fix a critical production bug. None have worked. It's 5pm Friday and the fix is needed for Monday's deployment.",
          "people-culture":
            "You've tried three approaches to improve your team's engagement scores. Nothing has moved the needle after six months.",
        },
        options: [
          { id: "A", text: "Step away and come back fresh — sometimes distance is what you need.", score: 3 },
          { id: "B", text: "Ask a trusted colleague for a fresh perspective before giving up.", score: 5 },
          { id: "C", text: "Keep working — I'll solve it through sheer effort.", score: 3 },
          { id: "D", text: "Escalate immediately to your manager.", score: 2 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "likert",
        id: "drv-4",
        text: "I'm satisfied once I meet the expected standard — going beyond it isn't always necessary.",
        reversed: true,
        defaultValue: 2,
      },
    ],
  },
];

// Helper: resolve scenario text for a given track
export function resolveScenario(scenario: string | TrackScenario, track: Track): string {
  if (typeof scenario === "string") return scenario;
  return scenario[track];
}

// Helper: get dimension config by key
export function getDimensionConfig(dimension: Dimension): DimensionConfig {
  return dimensionConfigs.find((d) => d.dimension === dimension)!;
}

// Ordered list of dimensions for step progression
export const dimensionOrder: Dimension[] = [
  "adaptability",
  "cognitiveAgility",
  "emotionalIntelligence",
  "collaboration",
  "drive",
];

export const dimensionLabels: Record<Dimension, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build
```

Expected: Clean compile. No unused variable warnings (the data file is consumed in later tasks so expect zero imports warnings at this stage — acceptable).

- [ ] **Step 3: Commit**

```bash
git add lib/data/assessment.ts
git commit -m "feat: add assessment data types and question content"
```

---

## Task 2: Scoring Functions

**Files:**
- Create: `lib/scoring.ts`

- [ ] **Step 1: Create `lib/scoring.ts`**

```typescript
// lib/scoring.ts

import type { Question, Dimension } from "./data/assessment";
import type { PotentialDimensions } from "./data/candidates";

/**
 * Compute raw score (1–5) for a single question given the candidate's answer.
 * answer is either a string (option id) or number (likert value).
 */
export function scoreQuestion(question: Question, answer: string | number): number {
  switch (question.type) {
    case "likert": {
      const val = answer as number;
      return question.reversed ? 6 - val : val;
    }
    case "sjt": {
      const opt = question.options.find((o) => o.id === answer);
      return opt?.score ?? 3;
    }
    case "forced-choice": {
      return answer === "A" ? question.optionA.score : question.optionB.score;
    }
    case "sequence-puzzle": {
      // "A" is always the correct answer
      return answer === "A" ? 5 : 1;
    }
    case "emotion-face": {
      const opt = question.options.find((o) => o.id === answer);
      return opt?.score ?? 1;
    }
  }
}

/**
 * Compute a 0–100 dimension score from raw question answers.
 * Returns null if any answer is missing.
 */
export function scoreDimension(
  questions: Question[],
  answers: (string | number | null)[]
): number {
  const scores = questions.map((q, i) => {
    const a = answers[i];
    if (a === null) return 3; // treat unanswered as neutral
    return scoreQuestion(q, a);
  });
  const sum = scores.reduce((acc, s) => acc + s, 0);
  const max = questions.length * 5;
  return Math.round((sum / max) * 100);
}

/**
 * Compute all 5 dimension scores and overall potentialScore from the full answer set.
 */
export function scoreAll(
  configs: { dimension: Dimension; questions: Question[] }[],
  allAnswers: Record<Dimension, (string | number | null)[]>
): { dimensions: PotentialDimensions; potentialScore: number } {
  const dimensions: PotentialDimensions = {
    adaptability: scoreDimension(
      configs.find((c) => c.dimension === "adaptability")!.questions,
      allAnswers.adaptability
    ),
    cognitiveAgility: scoreDimension(
      configs.find((c) => c.dimension === "cognitiveAgility")!.questions,
      allAnswers.cognitiveAgility
    ),
    emotionalIntelligence: scoreDimension(
      configs.find((c) => c.dimension === "emotionalIntelligence")!.questions,
      allAnswers.emotionalIntelligence
    ),
    collaboration: scoreDimension(
      configs.find((c) => c.dimension === "collaboration")!.questions,
      allAnswers.collaboration
    ),
    drive: scoreDimension(
      configs.find((c) => c.dimension === "drive")!.questions,
      allAnswers.drive
    ),
  };

  const potentialScore = Math.round(
    (dimensions.adaptability +
      dimensions.cognitiveAgility +
      dimensions.emotionalIntelligence +
      dimensions.collaboration +
      dimensions.drive) /
      5
  );

  return { dimensions, potentialScore };
}

/**
 * Build the default answers map for all dimensions from the question configs.
 * Used to pre-populate the assessment for demo click-through.
 */
export function buildDefaultAnswers(
  configs: { dimension: Dimension; questions: Question[] }[]
): Record<Dimension, (string | number | null)[]> {
  const result = {} as Record<Dimension, (string | number | null)[]>;
  for (const config of configs) {
    result[config.dimension] = config.questions.map((q) => {
      switch (q.type) {
        case "likert": return q.defaultValue;
        case "sjt": return q.defaultOptionId;
        case "forced-choice": return q.defaultChoice;
        case "sequence-puzzle": return q.defaultOptionId;
        case "emotion-face": return q.defaultOptionId;
      }
    });
  }
  return result;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat: add assessment scoring functions"
```

---

## Task 3: Assessment Shell + Page Route

**Files:**
- Create: `components/assessment/AssessmentShell.tsx`
- Create: `app/assessment/page.tsx`

- [ ] **Step 1: Create `components/assessment/AssessmentShell.tsx`**

```tsx
// components/assessment/AssessmentShell.tsx
import { Progress } from "@/components/ui/progress";

type Props = {
  currentStep: number;   // 0 = registration, 1–5 = dimensions, 6 = results, 7 = thankyou
  totalSteps: number;    // 7 (excludes thankyou from progress)
  stepLabel: string;
  children: React.ReactNode;
};

export function AssessmentShell({ currentStep, totalSteps, stepLabel, children }: Props) {
  const pct = currentStep === 0 ? 0 : Math.round((currentStep / totalSteps) * 100);
  const showProgress = currentStep > 0 && currentStep <= totalSteps;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1E1B4B] px-6 py-4 flex items-center justify-between">
        <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
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
    </div>
  );
}
```

- [ ] **Step 2: Create `app/assessment/page.tsx`**

```tsx
// app/assessment/page.tsx
"use client";

import { useState } from "react";
import {
  dimensionConfigs,
  dimensionOrder,
  dimensionLabels,
  defaultRegistration,
  type RegistrationData,
  type Dimension,
} from "@/lib/data/assessment";
import { buildDefaultAnswers, scoreAll } from "@/lib/scoring";
import { AssessmentShell } from "@/components/assessment/AssessmentShell";
import { RegistrationStep } from "@/components/assessment/RegistrationStep";
import { DimensionStep } from "@/components/assessment/DimensionStep";
import { ResultsScreen } from "@/components/assessment/ResultsScreen";
import { ThankYouScreen } from "@/components/assessment/ThankYouScreen";
import type { PotentialDimensions } from "@/lib/data/candidates";

type Step =
  | { kind: "registration" }
  | { kind: "dimension"; index: number }   // index 0–4
  | { kind: "results" }
  | { kind: "thankyou" };

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>({ kind: "registration" });
  const [registration, setRegistration] = useState<RegistrationData>(defaultRegistration);
  const [answers, setAnswers] = useState<Record<Dimension, (string | number | null)[]>>(
    () => buildDefaultAnswers(dimensionConfigs)
  );
  const [results, setResults] = useState<{
    dimensions: PotentialDimensions;
    potentialScore: number;
  } | null>(null);

  function handleRegistrationNext(data: RegistrationData) {
    setRegistration(data);
    setStep({ kind: "dimension", index: 0 });
  }

  function handleDimensionNext(dimension: Dimension, sectionAnswers: (string | number | null)[]) {
    setAnswers((prev) => ({ ...prev, [dimension]: sectionAnswers }));
    const currentIndex = dimensionOrder.indexOf(dimension);
    if (currentIndex < dimensionOrder.length - 1) {
      setStep({ kind: "dimension", index: currentIndex + 1 });
    } else {
      // All dimensions done — compute scores
      const updatedAnswers = { ...answers, [dimension]: sectionAnswers };
      const scored = scoreAll(dimensionConfigs, updatedAnswers);
      setResults(scored);
      setStep({ kind: "results" });
    }
  }

  function handleResultsNext() {
    setStep({ kind: "thankyou" });
  }

  // Determine shell props
  const totalSteps = 5; // 5 dimension sections
  let currentStep = 0;
  let stepLabel = "About You";

  if (step.kind === "dimension") {
    currentStep = step.index + 1;
    stepLabel = dimensionLabels[dimensionOrder[step.index]];
  } else if (step.kind === "results") {
    currentStep = 6;
    stepLabel = "Your Results";
  } else if (step.kind === "thankyou") {
    currentStep = 7;
    stepLabel = "";
  }

  return (
    <AssessmentShell currentStep={currentStep} totalSteps={totalSteps} stepLabel={stepLabel}>
      {step.kind === "registration" && (
        <RegistrationStep
          defaultData={defaultRegistration}
          onNext={handleRegistrationNext}
        />
      )}
      {step.kind === "dimension" && (
        <DimensionStep
          config={dimensionConfigs[step.index]}
          track={registration.track}
          initialAnswers={answers[dimensionOrder[step.index]]}
          onNext={(sectionAnswers) =>
            handleDimensionNext(dimensionOrder[step.index], sectionAnswers)
          }
        />
      )}
      {step.kind === "results" && results && (
        <ResultsScreen
          name={registration.name}
          dimensions={results.dimensions}
          potentialScore={results.potentialScore}
          onNext={handleResultsNext}
        />
      )}
      {step.kind === "thankyou" && (
        <ThankYouScreen name={registration.name} />
      )}
    </AssessmentShell>
  );
}
```

- [ ] **Step 3: Verify build (stubs needed)**

Create empty stub files so the build doesn't fail — these will be replaced in later tasks:

```bash
mkdir -p /Users/tomklimovski/Github/talent-edge/components/assessment
```

Create `components/assessment/RegistrationStep.tsx`:
```tsx
export function RegistrationStep({ defaultData, onNext }: any) {
  return <button onClick={() => onNext(defaultData)}>Next</button>;
}
```

Create `components/assessment/DimensionStep.tsx`:
```tsx
export function DimensionStep({ config, track, initialAnswers, onNext }: any) {
  return <button onClick={() => onNext(initialAnswers)}>Next</button>;
}
```

Create `components/assessment/ResultsScreen.tsx`:
```tsx
export function ResultsScreen({ name, dimensions, potentialScore, onNext }: any) {
  return <button onClick={onNext}>See results</button>;
}
```

Create `components/assessment/ThankYouScreen.tsx`:
```tsx
export function ThankYouScreen({ name }: any) {
  return <p>Thank you, {name}</p>;
}
```

```bash
npm run build
```

Expected: Clean compile with stubs in place.

- [ ] **Step 4: Commit**

```bash
git add components/assessment/ app/assessment/
git commit -m "feat: add assessment page state machine and shell"
```

---

## Task 4: Registration Step

**Files:**
- Replace: `components/assessment/RegistrationStep.tsx`

- [ ] **Step 1: Replace `components/assessment/RegistrationStep.tsx`**

```tsx
// components/assessment/RegistrationStep.tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { defaultRegistration, trackLabels, type RegistrationData, type Track } from "@/lib/data/assessment";
import { GraduationCap, ArrowRight } from "lucide-react";

type Props = {
  defaultData: RegistrationData;
  onNext: (data: RegistrationData) => void;
};

const tracks: Track[] = ["finance", "technology", "people-culture"];

export function RegistrationStep({ defaultData, onNext }: Props) {
  const [data, setData] = useState<RegistrationData>(defaultData);

  function set(field: keyof RegistrationData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
          <GraduationCap className="text-indigo-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome to your Talent Edge Assessment</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          This 15-minute assessment measures your potential across five dimensions — not your grades or experience.
          There are no right answers. Just be yourself.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Full name</label>
              <input
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Email address</label>
              <input
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">University</label>
            <input
              value={data.university}
              onChange={(e) => set("university", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Degree</label>
            <input
              value={data.degree}
              onChange={(e) => set("degree", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Track selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Career track</label>
            <div className="grid grid-cols-3 gap-2">
              {tracks.map((track) => (
                <button
                  key={track}
                  onClick={() => set("track", track)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors text-center ${
                    data.track === track
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {trackLabels[track]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => onNext(data)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          Begin Assessment
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/RegistrationStep.tsx
git commit -m "feat: add assessment registration step with track selector"
```

---

## Task 5: Standard Question Components

**Files:**
- Create: `components/assessment/LikertQuestion.tsx`
- Create: `components/assessment/SJTQuestion.tsx`
- Create: `components/assessment/ForcedChoiceQuestion.tsx`

- [ ] **Step 1: Create `components/assessment/LikertQuestion.tsx`**

```tsx
// components/assessment/LikertQuestion.tsx
"use client";
import { cn } from "@/lib/utils";
import type { LikertQuestion as LikertQ } from "@/lib/data/assessment";

type Props = {
  question: LikertQ;
  value: number | null;
  onChange: (value: number) => void;
  index: number;
};

const scaleLabels = ["Strongly\nDisagree", "", "Neutral", "", "Strongly\nAgree"];

export function LikertQuestion({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.text}
      </p>
      <div className="flex items-center gap-2 justify-between">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all",
                value === v
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"
              )}
            >
              {v}
            </div>
            <span className="text-xs text-slate-400 text-center leading-tight whitespace-pre-line">
              {scaleLabels[v - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/assessment/SJTQuestion.tsx`**

```tsx
// components/assessment/SJTQuestion.tsx
"use client";
import { cn } from "@/lib/utils";
import { resolveScenario } from "@/lib/data/assessment";
import type { SJTQuestion as SJTQ, Track } from "@/lib/data/assessment";

type Props = {
  question: SJTQ;
  track: Track;
  value: string | null;
  onChange: (optionId: string) => void;
  index: number;
};

export function SJTQuestion({ question, track, value, onChange, index }: Props) {
  const scenario = resolveScenario(question.scenario, track);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">
          <span className="text-slate-700 font-bold mr-2">{index + 1}.</span>Scenario
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 leading-relaxed">{scenario}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">What would you do?</p>
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
              value === opt.id
                ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-medium"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
            )}
          >
            <span className="font-semibold mr-2 text-indigo-400">{opt.id})</span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/assessment/ForcedChoiceQuestion.tsx`**

```tsx
// components/assessment/ForcedChoiceQuestion.tsx
"use client";
import { cn } from "@/lib/utils";
import type { ForcedChoiceQuestion as FCQ } from "@/lib/data/assessment";

type Props = {
  question: FCQ;
  value: string | null;
  onChange: (choice: "A" | "B") => void;
  index: number;
};

export function ForcedChoiceQuestion({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.prompt}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((choice) => {
          const opt = choice === "A" ? question.optionA : question.optionB;
          return (
            <button
              key={choice}
              onClick={() => onChange(choice)}
              className={cn(
                "px-4 py-4 rounded-xl border-2 text-sm font-medium text-left transition-all",
                value === choice
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
              )}
            >
              <span className="block text-xs font-semibold text-indigo-400 mb-1">{choice}</span>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Clean compile.

- [ ] **Step 5: Commit**

```bash
git add components/assessment/LikertQuestion.tsx components/assessment/SJTQuestion.tsx components/assessment/ForcedChoiceQuestion.tsx
git commit -m "feat: add Likert, SJT, and forced-choice question components"
```

---

## Task 6: Special Question Components — Sequence Puzzle + Emotion Face

**Files:**
- Create: `components/assessment/SequencePuzzle.tsx`
- Create: `components/assessment/EmotionFace.tsx`

- [ ] **Step 1: Create `components/assessment/SequencePuzzle.tsx`**

The grid layout:
- Row 1: Blue Circle | Amber Square | Indigo Triangle
- Row 2: Amber Triangle | Indigo Circle | Blue Square
- Row 3: Indigo Square | Blue Triangle | ??? (missing)

Rule: Each row and column contains one of each colour AND one of each shape.
Missing tile = Amber Circle (option A = correct).

```tsx
// components/assessment/SequencePuzzle.tsx
"use client";
import { cn } from "@/lib/utils";
import type { SequencePuzzleQuestion as SPQ } from "@/lib/data/assessment";

type Props = {
  question: SPQ;
  value: string | null;
  onChange: (optionId: string) => void;
  index: number;
};

type TileProps = { color: string; shape: "circle" | "square" | "triangle"; size?: number };

function Tile({ color, shape, size = 36 }: TileProps) {
  const fill = { blue: "#3B82F6", amber: "#F59E0B", indigo: "#6366F1" }[color];
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      {shape === "circle" && <circle cx="18" cy="18" r="14" fill={fill} />}
      {shape === "square" && <rect x="4" y="4" width="28" height="28" rx="3" fill={fill} />}
      {shape === "triangle" && <polygon points="18,4 32,32 4,32" fill={fill} />}
    </svg>
  );
}

function GridCell({ color, shape }: { color: string; shape: "circle" | "square" | "triangle" }) {
  return (
    <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
      <Tile color={color} shape={shape} />
    </div>
  );
}

function MissingCell() {
  return (
    <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-indigo-300 rounded-lg flex items-center justify-center">
      <span className="text-indigo-400 text-xl font-bold">?</span>
    </div>
  );
}

const grid = [
  [{ color: "blue", shape: "circle" as const }, { color: "amber", shape: "square" as const }, { color: "indigo", shape: "triangle" as const }],
  [{ color: "amber", shape: "triangle" as const }, { color: "indigo", shape: "circle" as const }, { color: "blue", shape: "square" as const }],
  [{ color: "indigo", shape: "square" as const }, { color: "blue", shape: "triangle" as const }, null], // null = missing
];

const answerOptions: { id: string; color: string; shape: "circle" | "square" | "triangle" }[] = [
  { id: "A", color: "amber", shape: "circle" },     // ← correct
  { id: "B", color: "blue", shape: "circle" },
  { id: "C", color: "amber", shape: "triangle" },
  { id: "D", color: "indigo", shape: "square" },
];

export function SequencePuzzle({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.prompt}
      </p>

      {/* Grid */}
      <div className="flex justify-center">
        <div className="space-y-2">
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-2">
              {row.map((cell, ci) =>
                cell ? (
                  <GridCell key={ci} color={cell.color} shape={cell.shape} />
                ) : (
                  <MissingCell key={ci} />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Answer options */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-3 text-center">Which tile completes the pattern?</p>
        <div className="flex justify-center gap-3">
          {answerOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-20",
                value === opt.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              )}
            >
              <Tile color={opt.color} shape={opt.shape} size={32} />
              <span className={cn("text-xs font-semibold", value === opt.id ? "text-indigo-700" : "text-slate-400")}>
                {opt.id}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/assessment/EmotionFace.tsx`**

The face shown expresses anxiety/concern: slightly downturned mouth, raised inner brows, wide eyes. Four SVG faces as answer options.

```tsx
// components/assessment/EmotionFace.tsx
"use client";
import { cn } from "@/lib/utils";
import type { EmotionFaceQuestion as EFQ } from "@/lib/data/assessment";

type Props = {
  question: EFQ;
  value: string | null;
  onChange: (optionId: string) => void;
  index: number;
};

// Inline SVG face components — each ~60px circle with eyes, brows, mouth
function HappyFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="22" cy="24" r="3" fill="#1E1B4B" />
      <circle cx="38" cy="24" r="3" fill="#1E1B4B" />
      {/* Brows — relaxed, slightly arched */}
      <path d="M18 18 Q22 15 26 18" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 18 Q38 15 42 18" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M20 38 Q30 46 40 38" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AnxiousFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      {/* Eyes — wide */}
      <circle cx="22" cy="25" r="3.5" fill="#1E1B4B" />
      <circle cx="38" cy="25" r="3.5" fill="#1E1B4B" />
      {/* Brows — inner corners raised (worried) */}
      <path d="M18 17 Q21 13 25 17" stroke="#3730A3" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M35 17 Q39 13 42 17" stroke="#3730A3" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Slightly downturned mouth */}
      <path d="M22 40 Q30 36 38 40" stroke="#3730A3" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SurprisedFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" />
      {/* Eyes — wide */}
      <circle cx="22" cy="22" r="4" fill="#1E1B4B" />
      <circle cx="38" cy="22" r="4" fill="#1E1B4B" />
      {/* Brows — high and raised */}
      <path d="M17 14 Q22 10 27 14" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M33 14 Q38 10 43 14" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* O-shaped mouth */}
      <ellipse cx="30" cy="40" rx="6" ry="7" fill="#065F46" />
      <ellipse cx="30" cy="40" rx="4" ry="5" fill="#F0FDF4" />
    </svg>
  );
}

function ConfidentFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
      {/* Eyes — steady */}
      <circle cx="22" cy="24" r="3" fill="#1E1B4B" />
      <circle cx="38" cy="24" r="3" fill="#1E1B4B" />
      {/* Brows — level, slightly lowered */}
      <path d="M18 20 Q22 18 26 20" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 20 Q38 18 42 20" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Slight confident smile, closed */}
      <path d="M22 37 Q30 42 38 37" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const faceMap: Record<string, React.FC> = {
  A: HappyFace,
  B: AnxiousFace,
  C: SurprisedFace,
  D: ConfidentFace,
};

export function EmotionFace({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.prompt}
      </p>

      {/* The face being assessed */}
      <div className="flex justify-center">
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 inline-flex flex-col items-center gap-2">
          <AnxiousFace />
          <p className="text-xs text-slate-400">How is this person feeling?</p>
        </div>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-4 gap-3">
        {question.options.map((opt) => {
          const FaceComp = faceMap[opt.id];
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                value === opt.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              )}
            >
              <FaceComp />
              <span className={cn(
                "text-xs font-medium",
                value === opt.id ? "text-indigo-700" : "text-slate-500"
              )}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Clean compile.

- [ ] **Step 4: Commit**

```bash
git add components/assessment/SequencePuzzle.tsx components/assessment/EmotionFace.tsx
git commit -m "feat: add SVG sequence puzzle and emotion face recognition components"
```

---

## Task 7: Dimension Step

**Files:**
- Replace: `components/assessment/DimensionStep.tsx`

- [ ] **Step 1: Replace `components/assessment/DimensionStep.tsx`**

```tsx
// components/assessment/DimensionStep.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LikertQuestion } from "./LikertQuestion";
import { SJTQuestion } from "./SJTQuestion";
import { ForcedChoiceQuestion } from "./ForcedChoiceQuestion";
import { SequencePuzzle } from "./SequencePuzzle";
import { EmotionFace } from "./EmotionFace";
import type { DimensionConfig, Track, Question } from "@/lib/data/assessment";

type Props = {
  config: DimensionConfig;
  track: Track;
  initialAnswers: (string | number | null)[];
  onNext: (answers: (string | number | null)[]) => void;
};

export function DimensionStep({ config, track, initialAnswers, onNext }: Props) {
  const [answers, setAnswers] = useState<(string | number | null)[]>(initialAnswers);

  function setAnswer(index: number, value: string | number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const allAnswered = answers.every((a) => a !== null);

  function renderQuestion(q: Question, i: number) {
    switch (q.type) {
      case "likert":
        return (
          <LikertQuestion
            key={q.id}
            question={q}
            value={answers[i] as number | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "sjt":
        return (
          <SJTQuestion
            key={q.id}
            question={q}
            track={track}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "forced-choice":
        return (
          <ForcedChoiceQuestion
            key={q.id}
            question={q}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "sequence-puzzle":
        return (
          <SequencePuzzle
            key={q.id}
            question={q}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
      case "emotion-face":
        return (
          <EmotionFace
            key={q.id}
            question={q}
            value={answers[i] as string | null}
            onChange={(v) => setAnswer(i, v)}
            index={i}
          />
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="text-center space-y-1 pb-2 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">{config.label}</h2>
        <p className="text-sm text-slate-400">{config.tagline}</p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {config.questions.map((q, i) => (
          <div key={q.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            {renderQuestion(q, i)}
          </div>
        ))}
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => onNext(answers)}
          disabled={!allAnswered}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 disabled:opacity-40"
        >
          Continue
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add components/assessment/DimensionStep.tsx
git commit -m "feat: add dimension step with question renderer"
```

---

## Task 8: Results Screen + Thank You Screen

**Files:**
- Replace: `components/assessment/ResultsScreen.tsx`
- Replace: `components/assessment/ThankYouScreen.tsx`

- [ ] **Step 1: Replace `components/assessment/ResultsScreen.tsx`**

```tsx
// components/assessment/ResultsScreen.tsx
"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { scoreColor, scoreLabel } from "@/lib/utils";
import type { PotentialDimensions } from "@/lib/data/candidates";

type Props = {
  name: string;
  dimensions: PotentialDimensions;
  potentialScore: number;
  onNext: () => void;
};

const dimensionDisplayLabels: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};

export function ResultsScreen({ name, dimensions, potentialScore, onNext }: Props) {
  const radarData = (Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => ({
    subject: dimensionDisplayLabels[key],
    score: dimensions[key],
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <p className="text-sm text-slate-500">Assessment complete, {name.split(" ")[0]}.</p>
        <div className={`inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${
          potentialScore >= 80 ? "border-emerald-400 bg-emerald-50" :
          potentialScore >= 65 ? "border-amber-400 bg-amber-50" :
          "border-rose-400 bg-rose-50"
        }`}>
          <span className="text-3xl font-black text-slate-800">{potentialScore}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">
            {scoreLabel(potentialScore)}
          </p>
          <p className="text-sm text-slate-400">AI Potential Score</p>
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Your Potential Profile</h3>
        <p className="text-xs text-slate-400 mb-4">How your results map across the five potential dimensions.</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              formatter={(value) => [`${value}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension scores */}
      <div className="grid grid-cols-1 gap-2">
        {(Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => (
          <div key={key} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-4 py-2.5">
            <span className="text-sm text-slate-600">{dimensionDisplayLabels[key]}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(dimensions[key])}`}>
              {dimensions[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          Submit Results
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/assessment/ThankYouScreen.tsx`**

```tsx
// components/assessment/ThankYouScreen.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

type Props = { name: string };

export function ThankYouScreen({ name }: Props) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">You're all done, {name.split(" ")[0]}.</h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Your results have been sent to Meridian Group. Their graduate team will be in touch soon.
        </p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What happens next</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">1.</span>
            Your results are reviewed by the Meridian Group graduate team.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">2.</span>
            Shortlisted candidates will be contacted within 5 business days.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">3.</span>
            Next stage: a 30-minute virtual conversation.
          </li>
        </ul>
      </div>
      <Link href="/candidates/c019">
        <Button variant="outline" className="gap-2 text-slate-600">
          View Jordan's profile →
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Clean compile.

- [ ] **Step 4: Commit**

```bash
git add components/assessment/ResultsScreen.tsx components/assessment/ThankYouScreen.tsx
git commit -m "feat: add results screen with radar chart and thank-you screen"
```

---

## Task 9: Pipeline Integration — Add c019 + Send Assessment Button

**Files:**
- Modify: `lib/data/candidates.ts` — add c019 Jordan Lee
- Modify: `components/pipeline/CandidateCard.tsx` — add "Send Assessment" link

- [ ] **Step 1: Add c019 Jordan Lee to `lib/data/candidates.ts`**

Read the file first, then append to the `candidates` array (after c018):

```typescript
  {
    id: "c019",
    name: "Jordan Lee",
    university: "University of Melbourne",
    degree: "B. Commerce (Finance & Economics)",
    graduationYear: 2026,
    stage: "Assessed",
    appliedDate: "2026-04-11",
    daysInStage: 0,
    potentialScore: 89,
    avatarInitials: "JL",
    dimensions: {
      adaptability: 85,
      cognitiveAgility: 90,
      emotionalIntelligence: 85,
      collaboration: 95,
      drive: 90,
    },
    assessmentHistory: [
      { date: "2026-04-11", stage: "Applied", note: "Application submitted via Talent Edge." },
      { date: "2026-04-11", stage: "Assessed", note: "AI potential assessment completed via Talent Edge. Score: 89. High potential." },
    ],
  },
```

- [ ] **Step 2: Add "Send Assessment" link to `components/pipeline/CandidateCard.tsx`**

Read the file first. Add a small "Send assessment →" link below the existing card content, visible only on hover, linking to `/assessment`:

Find the closing `</div>` of the outer card div inside the `<Link>` and add, just before the outer closing `</Link>` tag, a sibling element:

Replace the current return with this structure — the outer `<div>` becomes a wrapper, and the `<Link>` wraps only the card body, while "Send Assessment" sits outside it:

```tsx
// components/pipeline/CandidateCard.tsx
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import { Clock, Send } from "lucide-react";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="group relative">
      <Link href={`/candidates/${candidate.id}`}>
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                {candidate.avatarInitials}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{candidate.name}</p>
                <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{candidate.university}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${scoreColor(candidate.potentialScore)}`}>
              {candidate.potentialScore}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">{candidate.degree}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={10} />
            <span className="text-xs">{candidate.daysInStage}d in stage</span>
          </div>
        </div>
      </Link>
      <Link
        href="/assessment"
        className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-1"
      >
        <Send size={10} />
        Send assessment
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Verify build and check c019 appears**

```bash
npm run build
```

Expected: Clean compile. c019 Jordan Lee will appear in the pipeline's "Assessed" column and in the dashboard's "Top Potential Candidates" list (score 89 ≥ 85).

- [ ] **Step 4: Commit**

```bash
git add lib/data/candidates.ts components/pipeline/CandidateCard.tsx
git commit -m "feat: add Jordan Lee (c019) to pipeline and send assessment button"
```

---

## Self-Review

**Spec coverage:**
- Candidate registration with pre-filled defaults and track selection ✔
- 5 dimension sections, 4 questions each ✔
- Likert 1–5 scale questions ✔
- SJT scenario questions with track-specific content (Finance / Technology / People & Culture) ✔
- Forced-choice questions ✔
- Visual SVG sequence puzzle (Cognitive Agility Q1) ✔
- SVG emotion face recognition (Emotional Intelligence Q1) ✔
- End-reveal results screen with radar chart ✔
- Thank you screen ("results sent to Meridian Group") ✔
- Jordan Lee (c019) appears in pipeline after assessment ✔
- "Send Assessment" button on pipeline cards ✔
- All defaults produce Jordan Lee's target scores (85/90/85/95/90 → overall 89) ✔

**Placeholder scan:** None. All question content, SVG faces, grid layout, and scoring values are fully specified.

**Type consistency:**
- `Question` union type used consistently across `assessment.ts`, `DimensionStep.tsx`, `scoring.ts`
- `Dimension` key used in `scoreAll`, `buildDefaultAnswers`, and page state — all match the 5 keys in `PotentialDimensions`
- `Track` type flows from `RegistrationStep` → `page.tsx` state → `DimensionStep` → `SJTQuestion` → `resolveScenario`
- `c019` uses `StageName` "Assessed" — valid per `program.ts`
