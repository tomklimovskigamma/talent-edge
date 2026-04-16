# Video Interview MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a demo-credibility async video interview feature: browser recording, audio-only AI analysis via Whisper + Claude, admin playback on candidate profile, new pipeline stage, seeded demo candidates.

**Architecture:** New pipeline stage "Video Interview" between Shortlisted and Interview. Candidate-facing route at `/video-interview/[id]` uses browser `MediaRecorder` to capture video+audio, stores blobs locally for demo, runs a mock-or-real AI pipeline to produce 5-dimension competency scores + summary. Admin-facing `VideoInterviewPanel` on the profile plays back video and displays scores on a radar chart (mirroring `PotentialRadar`). Feature-flagged demo-safe mode short-circuits the AI pipeline with seeded responses.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, recharts, vitest, `MediaRecorder` Web API, OpenAI Whisper API, Anthropic Claude API (or mocked equivalents for demo)

**Spec:** `docs/superpowers/specs/2026-04-16-video-interview-mvp-design.md`

---

## File Structure

```
lib/data/
  program.ts                                  # MODIFY: add "Video Interview" stage
  candidates.ts                               # MODIFY: extend Candidate type with videoInterview field
  video-prompts.ts                            # CREATE: the 3 demo questions
lib/
  pipeline.ts                                 # MODIFY: add "Video Interview" to stageOrder
  video-analysis.ts                           # CREATE: runVideoAnalysis() pipeline (mock + real paths)

lib/video/
  recorder.ts                                 # CREATE: MediaRecorder wrapper
  storage.ts                                  # CREATE: in-memory + /public-path store for demo

app/video-interview/[candidateId]/
  page.tsx                                    # CREATE: entry point

components/video-interview/
  VideoInterviewShell.tsx                     # CREATE: step orchestration
  IntroStep.tsx                               # CREATE: permission prompt + instructions
  PromptStep.tsx                              # CREATE: question + prep countdown
  RecordingStep.tsx                           # CREATE: live recording + countdown + stop
  CompleteStep.tsx                            # CREATE: thank-you screen

components/profile/
  VideoInterviewPanel.tsx                     # CREATE: admin playback + analysis display

components/pipeline/
  InviteToVideoInterviewButton.tsx            # CREATE: admin-only invite action
  CandidateCard.tsx                           # MODIFY: route to invite button at Shortlisted stage

app/candidates/[id]/page.tsx                  # MODIFY: render VideoInterviewPanel

public/demo-videos/
  c005-q1.webm, c005-q2.webm, c005-q3.webm   # CREATE: seeded sample videos
  c007-q1.webm, c007-q2.webm, c007-q3.webm
  c010-q1.webm, c010-q2.webm, c010-q3.webm

__tests__/
  video-analysis.test.ts                      # CREATE: analysis pipeline tests
  pipeline.test.ts                            # MODIFY: update stage transitions
  video-storage.test.ts                       # CREATE: storage helper tests

docs/internal/capabilities.md                 # MODIFY: flip Video interview capture from 📋 to ✅
docs/sales/objections.md                      # MODIFY: update objection #10 (video shipping → video live)
docs/superpowers/backlog.md                   # MODIFY: mark Tier 0 video item complete
```

---

## Dependency order

1. **Tasks 1–3:** Pipeline stage plumbing (pure data + types, unblocks everything)
2. **Tasks 4–6:** Candidate recording flow (independent of admin side)
3. **Tasks 7–9:** AI analysis pipeline (mocked + real, can run parallel to 4–6)
4. **Tasks 10–12:** Admin profile panel + invite button (depends on 1–3 and 7–9)
5. **Tasks 13–14:** Seed data + demo polish (depends on everything)
6. **Task 15:** Docs updates (last — mark things live only after they are)

---

## Task 1: Add Video Interview pipeline stage

**Files:**
- Modify: `lib/data/program.ts`
- Test: `__tests__/pipeline.test.ts`

- [ ] **Step 1: Read the current `lib/data/program.ts`**

Understand: `StageName` is a string union; `stages` is an ordered array; `pipelineCounts` maps stage name to demo counts.

- [ ] **Step 2: Write failing tests in `__tests__/pipeline.test.ts`**

Add inside the existing `describe("getNextStage", ...)` block:

```typescript
it("Shortlisted → Video Interview", () => {
  expect(getNextStage("Shortlisted")).toBe("Video Interview");
});

it("Video Interview → Interview", () => {
  expect(getNextStage("Video Interview")).toBe("Interview");
});
```

Delete the existing `it("Shortlisted → Interview", ...)` test — the transition is now two steps.

- [ ] **Step 3: Run tests to confirm failure**

Run: `npx vitest run __tests__/pipeline.test.ts`
Expected: 2 new tests fail with "Expected 'Video Interview' but received 'Interview'"

- [ ] **Step 4: Update `lib/data/program.ts`**

```typescript
export type StageName =
  | "Applied"
  | "Assessed"
  | "Shortlisted"
  | "Video Interview"
  | "Interview"
  | "Offer"
  | "Hired";

export const stages: Stage[] = [
  { id: "applied", label: "Applied", order: 1 },
  { id: "assessed", label: "Assessed", order: 2 },
  { id: "shortlisted", label: "Shortlisted", order: 3 },
  { id: "video-interview", label: "Video Interview", order: 4 },
  { id: "interview", label: "Interview", order: 5 },
  { id: "offer", label: "Offer", order: 6 },
  { id: "hired", label: "Hired", order: 7 },
];

export const pipelineCounts: Record<StageName, number> = {
  Applied: 187,
  Assessed: 142,
  Shortlisted: 43,
  "Video Interview": 28,
  Interview: 21,
  Offer: 9,
  Hired: 6,
};
```

- [ ] **Step 5: Update `lib/pipeline.ts` stageOrder**

Replace the existing `stageOrder` const with:

```typescript
const stageOrder = [
  "Applied",
  "Assessed",
  "Shortlisted",
  "Video Interview",
  "Interview",
  "Offer",
  "Hired",
] as const satisfies readonly StageName[];
```

- [ ] **Step 6: Run tests to verify**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 7: Run `npx tsc --noEmit` to check types**

Expected: No type errors. If any files use `StageName` in an exhaustive `switch` or `Record`, TypeScript will flag them — address each.

- [ ] **Step 8: Commit**

```bash
git add lib/data/program.ts lib/pipeline.ts __tests__/pipeline.test.ts
git commit -m "feat: add Video Interview pipeline stage between Shortlisted and Interview"
```

---

## Task 2: Extend Candidate type with videoInterview field

**Files:**
- Modify: `lib/data/candidates.ts`

- [ ] **Step 1: Add new types to the top of `lib/data/candidates.ts`** (after `DevelopmentGoal` type, before `Candidate` type)

```typescript
export type VideoInterviewResponse = {
  questionId: string;
  videoUrl: string;
  transcript?: string;
  durationSeconds: number;
};

export type VideoInterviewAnalysis = {
  competencyScores: PotentialDimensions;
  summary: string;
  strongestArea: string;
  probeInF2F: string;
  analysedAt: string;
};

export type VideoInterviewData = {
  invitedAt?: string;
  completedAt?: string;
  responses: VideoInterviewResponse[];
  analysis?: VideoInterviewAnalysis;
};
```

- [ ] **Step 2: Add the field to the `Candidate` type**

In the `Candidate` type definition, after `accessibilityNeeds?: string;`, add:

```typescript
  videoInterview?: VideoInterviewData;
```

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: Pass — field is optional, no existing candidates need updating yet.

- [ ] **Step 4: Commit**

```bash
git add lib/data/candidates.ts
git commit -m "feat: add videoInterview field to Candidate type"
```

---

## Task 3: Define demo video questions

**Files:**
- Create: `lib/data/video-prompts.ts`

- [ ] **Step 1: Create `lib/data/video-prompts.ts`**

```typescript
export type VideoPrompt = {
  id: string;
  order: number;
  question: string;
  prepSeconds: number;
  recordSeconds: number;
  primaryDimension: "adaptability" | "cognitiveAgility" | "emotionalIntelligence" | "collaboration" | "drive";
};

export const videoPrompts: VideoPrompt[] = [
  {
    id: "vq1",
    order: 1,
    question: "Tell us about a time you had to change approach mid-way through something important. What made you change, and what happened next?",
    prepSeconds: 30,
    recordSeconds: 60,
    primaryDimension: "adaptability",
  },
  {
    id: "vq2",
    order: 2,
    question: "Walk us through how you'd diagnose an unfamiliar problem you didn't know the answer to. What's your first move, and how do you know when you're done?",
    prepSeconds: 30,
    recordSeconds: 60,
    primaryDimension: "cognitiveAgility",
  },
  {
    id: "vq3",
    order: 3,
    question: "Tell us about something you've worked hard at that nobody asked you to. Why did you do it, and what did you learn?",
    prepSeconds: 30,
    recordSeconds: 60,
    primaryDimension: "drive",
  },
];

export function getPromptById(id: string): VideoPrompt | undefined {
  return videoPrompts.find((p) => p.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/data/video-prompts.ts
git commit -m "feat: define 3 demo video interview prompts targeting 5-dim competencies"
```

---

## Task 4: MediaRecorder wrapper

**Files:**
- Create: `lib/video/recorder.ts`

- [ ] **Step 1: Create `lib/video/recorder.ts`**

```typescript
// Thin wrapper over the browser MediaRecorder API for the video interview flow.
// Responsibilities: request permission, start/stop, emit the final Blob.
// No UI concerns. No storage concerns.

export type RecorderState = "idle" | "requesting-permission" | "ready" | "recording" | "stopped" | "error";

export type RecorderHandle = {
  stream: MediaStream;
  mediaRecorder: MediaRecorder;
  stop: () => Promise<Blob>;
  destroy: () => void;
};

export async function acquireCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support video recording.");
  }
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
    audio: true,
  });
}

export function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "video/webm";
}

export function startRecording(stream: MediaStream): RecorderHandle {
  const mimeType = pickMimeType();
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  mediaRecorder.start();

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      if (mediaRecorder.state === "inactive") {
        resolve(new Blob(chunks, { type: mimeType }));
        return;
      }
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };
      mediaRecorder.stop();
    });

  const destroy = () => {
    if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  };

  return { stream, mediaRecorder, stop, destroy };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/video/recorder.ts
git commit -m "feat: add MediaRecorder wrapper for browser video capture"
```

---

## Task 5: In-memory storage helper

**Files:**
- Create: `lib/video/storage.ts`
- Test: `__tests__/video-storage.test.ts`

- [ ] **Step 1: Write failing tests in `__tests__/video-storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { storeRecording, getRecording, clearRecordings, type StoredRecording } from "@/lib/video/storage";

describe("storage", () => {
  beforeEach(() => clearRecordings());

  it("returns undefined for an unknown id", () => {
    expect(getRecording("nope")).toBeUndefined();
  });

  it("stores and retrieves a recording by id", () => {
    const blob = new Blob(["dummy"], { type: "video/webm" });
    const stored: StoredRecording = {
      candidateId: "c001",
      questionId: "vq1",
      blob,
      durationSeconds: 42,
    };
    storeRecording("rec1", stored);
    expect(getRecording("rec1")).toBe(stored);
  });

  it("clearRecordings empties the store", () => {
    const blob = new Blob(["dummy"]);
    storeRecording("rec1", { candidateId: "c001", questionId: "vq1", blob, durationSeconds: 10 });
    clearRecordings();
    expect(getRecording("rec1")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run __tests__/video-storage.test.ts`
Expected: All tests fail — module does not exist.

- [ ] **Step 3: Create `lib/video/storage.ts`**

```typescript
// In-memory store for video recordings during a demo session.
// Not persisted; lost on page reload. Production would use Vercel Blob + signed URLs.

export type StoredRecording = {
  candidateId: string;
  questionId: string;
  blob: Blob;
  durationSeconds: number;
};

const store = new Map<string, StoredRecording>();

export function storeRecording(id: string, recording: StoredRecording): void {
  store.set(id, recording);
}

export function getRecording(id: string): StoredRecording | undefined {
  return store.get(id);
}

export function clearRecordings(): void {
  store.clear();
}

export function recordingUrlFor(id: string): string | undefined {
  const rec = store.get(id);
  if (!rec) return undefined;
  return URL.createObjectURL(rec.blob);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/video-storage.test.ts`
Expected: All 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/video/storage.ts __tests__/video-storage.test.ts
git commit -m "feat: add in-memory video recording storage with tests"
```

---

## Task 6: Candidate recording flow (shell + steps)

**Files:**
- Create: `app/video-interview/[candidateId]/page.tsx`
- Create: `components/video-interview/VideoInterviewShell.tsx`
- Create: `components/video-interview/IntroStep.tsx`
- Create: `components/video-interview/PromptStep.tsx`
- Create: `components/video-interview/RecordingStep.tsx`
- Create: `components/video-interview/CompleteStep.tsx`

This is the largest single task. We'll TDD the shell state machine first, then build each step.

- [ ] **Step 1: Create the entry page `app/video-interview/[candidateId]/page.tsx`**

```typescript
import { candidates } from "@/lib/data/candidates";
import { VideoInterviewShell } from "@/components/video-interview/VideoInterviewShell";
import { notFound } from "next/navigation";

export default async function VideoInterviewPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) notFound();

  return <VideoInterviewShell candidate={candidate} />;
}
```

- [ ] **Step 2: Create `components/video-interview/VideoInterviewShell.tsx`**

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { videoPrompts } from "@/lib/data/video-prompts";
import { IntroStep } from "./IntroStep";
import { PromptStep } from "./PromptStep";
import { RecordingStep } from "./RecordingStep";
import { CompleteStep } from "./CompleteStep";
import type { Candidate } from "@/lib/data/candidates";

type PhaseState =
  | { phase: "intro" }
  | { phase: "prompt"; questionIndex: number }
  | { phase: "recording"; questionIndex: number }
  | { phase: "complete" };

export function VideoInterviewShell({ candidate }: { candidate: Candidate }) {
  const [state, setState] = useState<PhaseState>({ phase: "intro" });
  const totalQuestions = videoPrompts.length;

  const currentQuestionIndex =
    state.phase === "prompt" || state.phase === "recording" ? state.questionIndex : 0;

  const pct =
    state.phase === "complete"
      ? 100
      : state.phase === "intro"
      ? 0
      : Math.round(((currentQuestionIndex + (state.phase === "recording" ? 0.5 : 0)) / totalQuestions) * 100);

  const showProgress = state.phase !== "intro" && state.phase !== "complete";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#1E1B4B] px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Return to home">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
        </Link>
        {showProgress && (
          <span className="text-xs text-white/50">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        )}
      </header>

      {showProgress && (
        <div className="bg-white border-b px-6 py-3 space-y-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">Video Interview</span>
            <span className="text-xs text-slate-400">{pct}% complete</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {state.phase === "intro" && (
            <IntroStep
              candidate={candidate}
              onStart={() => setState({ phase: "prompt", questionIndex: 0 })}
            />
          )}
          {state.phase === "prompt" && (
            <PromptStep
              prompt={videoPrompts[state.questionIndex]}
              onReady={() => setState({ phase: "recording", questionIndex: state.questionIndex })}
            />
          )}
          {state.phase === "recording" && (
            <RecordingStep
              prompt={videoPrompts[state.questionIndex]}
              candidateId={candidate.id}
              onComplete={() => {
                const nextIndex = state.questionIndex + 1;
                if (nextIndex >= totalQuestions) {
                  setState({ phase: "complete" });
                } else {
                  setState({ phase: "prompt", questionIndex: nextIndex });
                }
              }}
            />
          )}
          {state.phase === "complete" && <CompleteStep />}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/video-interview/IntroStep.tsx`**

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Video, Clock, AlertCircle } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";

export function IntroStep({ candidate, onStart }: { candidate: Candidate; onStart: () => void }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
          Video Interview
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">Welcome, {candidate.name.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500 mt-2">
          You&apos;ve been shortlisted for the next stage: a short video interview.
        </p>
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex items-start gap-3">
          <Video size={16} className="text-indigo-500 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-700">3 questions, 60 seconds each.</span> You&apos;ll see
            each question, have 30 seconds to think, then record your answer.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-indigo-500 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-medium text-slate-700">One attempt per question.</span> Take your time to
            prepare — there&apos;s no going back once you start recording.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-slate-400 mt-0.5" aria-hidden="true" />
          <div className="text-slate-500">
            We analyse what you say, not how your face looks on camera. Candidates with accessibility
            accommodations will be offered an alternative format — please contact your program
            coordinator.
          </div>
        </div>
      </div>

      <Button onClick={onStart} className="w-full bg-indigo-600 hover:bg-indigo-700">
        Start video interview
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Create `components/video-interview/PromptStep.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { VideoPrompt } from "@/lib/data/video-prompts";

export function PromptStep({ prompt, onReady }: { prompt: VideoPrompt; onReady: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(prompt.prepSeconds);

  useEffect(() => {
    setSecondsLeft(prompt.prepSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onReady();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [prompt.id, prompt.prepSeconds, onReady]);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          Question {prompt.order}
        </p>
        <p className="text-xl font-medium text-slate-800 mt-2 leading-relaxed">{prompt.question}</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
        <p className="text-xs text-indigo-700 uppercase tracking-wide">Prepare your answer</p>
        <p className="text-3xl font-bold text-indigo-700 tabular-nums mt-1">{secondsLeft}s</p>
        <p className="text-xs text-slate-500 mt-2">
          Recording will start automatically when the timer ends.
        </p>
      </div>

      <Button variant="outline" onClick={onReady} className="w-full">
        I&apos;m ready — start recording now
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Create `components/video-interview/RecordingStep.tsx`**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { acquireCamera, startRecording, type RecorderHandle } from "@/lib/video/recorder";
import { storeRecording } from "@/lib/video/storage";
import type { VideoPrompt } from "@/lib/data/video-prompts";

export function RecordingStep({
  prompt,
  candidateId,
  onComplete,
}: {
  prompt: VideoPrompt;
  candidateId: string;
  onComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<RecorderHandle | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(prompt.recordSeconds);
  const [error, setError] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let tickInterval: ReturnType<typeof setInterval> | null = null;

    async function begin() {
      try {
        const stream = await acquireCamera();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        handleRef.current = startRecording(stream);

        tickInterval = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              if (tickInterval) clearInterval(tickInterval);
              void stopAndAdvance();
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not access camera.");
      }
    }

    async function stopAndAdvance() {
      if (!handleRef.current || isStopping) return;
      setIsStopping(true);
      const handle = handleRef.current;
      handleRef.current = null;
      const blob = await handle.stop();
      storeRecording(`${candidateId}-${prompt.id}`, {
        candidateId,
        questionId: prompt.id,
        blob,
        durationSeconds: prompt.recordSeconds - secondsLeft,
      });
      handle.destroy();
      onComplete();
    }

    void begin();

    return () => {
      cancelled = true;
      if (tickInterval) clearInterval(tickInterval);
      if (handleRef.current) handleRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt.id]);

  async function handleStopClick() {
    if (!handleRef.current || isStopping) return;
    setIsStopping(true);
    const handle = handleRef.current;
    handleRef.current = null;
    const blob = await handle.stop();
    storeRecording(`${candidateId}-${prompt.id}`, {
      candidateId,
      questionId: prompt.id,
      blob,
      durationSeconds: prompt.recordSeconds - secondsLeft,
    });
    handle.destroy();
    onComplete();
  }

  if (error) {
    return (
      <div className="bg-white border rounded-xl shadow-sm p-8 space-y-3">
        <p className="text-sm font-semibold text-rose-700">Recording unavailable</p>
        <p className="text-sm text-slate-600">{error}</p>
        <p className="text-xs text-slate-400">
          For the demo, allow camera and microphone access in your browser and reload.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          Question {prompt.order}
        </p>
        <p className="text-base text-slate-700 mt-1 leading-relaxed">{prompt.question}</p>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          <Circle size={8} className="fill-rose-500 text-rose-500" aria-hidden="true" />
          <span>Recording</span>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-sm font-semibold tabular-nums px-3 py-1 rounded-full">
          {secondsLeft}s
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleStopClick}
        disabled={isStopping}
        className="w-full"
      >
        {isStopping ? "Saving..." : "Stop and continue"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 6: Create `components/video-interview/CompleteStep.tsx`**

```typescript
"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteStep() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 text-center space-y-5">
      <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle2 size={28} className="text-emerald-600" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Thanks — all done</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Your responses are now with the hiring team. You&apos;ll hear back shortly with the next steps.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 7: Verify builds**

Run: `npx tsc --noEmit`
Expected: No errors.

Run: `npm run build` (optional — slower). Expected: build succeeds.

- [ ] **Step 8: Manual smoke test (optional — the engineer can check by running dev)**

Run: `npm run dev`
Visit: `http://localhost:3000/video-interview/c001`
Expected: intro → grant permission → see countdown → record → question 2 → question 3 → complete screen.

- [ ] **Step 9: Commit**

```bash
git add app/video-interview components/video-interview
git commit -m "feat: add candidate-facing video interview flow with MediaRecorder capture"
```

---

## Task 7: Mock AI analysis

**Files:**
- Create: `lib/video-analysis.ts`
- Test: `__tests__/video-analysis.test.ts`

This task covers mock-only analysis. Real API calls come in Task 8.

- [ ] **Step 1: Write failing tests in `__tests__/video-analysis.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { runMockAnalysis } from "@/lib/video-analysis";

describe("runMockAnalysis", () => {
  it("returns a complete VideoInterviewAnalysis shape", () => {
    const result = runMockAnalysis("c001");

    expect(result.competencyScores).toBeDefined();
    expect(result.competencyScores.adaptability).toBeGreaterThan(0);
    expect(result.competencyScores.cognitiveAgility).toBeGreaterThan(0);
    expect(result.competencyScores.emotionalIntelligence).toBeGreaterThan(0);
    expect(result.competencyScores.collaboration).toBeGreaterThan(0);
    expect(result.competencyScores.drive).toBeGreaterThan(0);

    expect(result.summary.length).toBeGreaterThan(20);
    expect(result.strongestArea.length).toBeGreaterThan(0);
    expect(result.probeInF2F.length).toBeGreaterThan(0);
    expect(result.analysedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it("varies output by candidate id deterministically", () => {
    const a = runMockAnalysis("c001");
    const b = runMockAnalysis("c001");
    const c = runMockAnalysis("c002");
    expect(a.competencyScores.adaptability).toBe(b.competencyScores.adaptability);
    expect(a.summary).toBe(b.summary);
    // c may or may not match a — no assertion on that.
    expect(c.analysedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

Run: `npx vitest run __tests__/video-analysis.test.ts`
Expected: Tests fail — module not found.

- [ ] **Step 3: Create `lib/video-analysis.ts`**

```typescript
import type { VideoInterviewAnalysis, PotentialDimensions } from "@/lib/data/candidates";

// Demo-safe mock analyser. Deterministic per candidate id so repeat demos look identical.
// Real Whisper + Claude pipeline lives behind a feature flag in Task 8.

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function scoreIn(min: number, max: number, seed: number): number {
  return min + (seed % (max - min + 1));
}

export function runMockAnalysis(candidateId: string): VideoInterviewAnalysis {
  const seed = hashString(candidateId);

  const scores: PotentialDimensions = {
    adaptability: scoreIn(72, 94, seed),
    cognitiveAgility: scoreIn(70, 96, seed + 1),
    emotionalIntelligence: scoreIn(68, 92, seed + 2),
    collaboration: scoreIn(74, 93, seed + 3),
    drive: scoreIn(75, 95, seed + 4),
  };

  const sorted = (Object.entries(scores) as [keyof PotentialDimensions, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const strongestKey = sorted[0][0];
  const weakestKey = sorted[4][0];

  const strongestLabels: Record<keyof PotentialDimensions, string> = {
    adaptability: "Adaptability",
    cognitiveAgility: "Cognitive Agility",
    emotionalIntelligence: "Emotional Intelligence",
    collaboration: "Collaboration",
    drive: "Drive",
  };

  const summary =
    `Across the three responses, the candidate demonstrated clear reasoning and structured thinking. ` +
    `Their answers showed specific examples rather than generalities, and they navigated ambiguity ` +
    `in the second question with confidence. Strongest signal came through in ${strongestLabels[strongestKey]}.`;

  const probeMap: Record<keyof PotentialDimensions, string> = {
    adaptability: "Ask about a time they had to abandon a plan entirely — not just adjust it.",
    cognitiveAgility: "Probe how they know when they have enough information to decide.",
    emotionalIntelligence: "Explore how they handle feedback they disagree with.",
    collaboration: "Ask when they've chosen not to share something with their team, and why.",
    drive: "Probe what they do when motivation runs out — the discipline question.",
  };

  return {
    competencyScores: scores,
    summary,
    strongestArea: strongestLabels[strongestKey],
    probeInF2F: probeMap[weakestKey],
    analysedAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/video-analysis.test.ts`
Expected: Both tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/video-analysis.ts __tests__/video-analysis.test.ts
git commit -m "feat: add mock video analysis with deterministic per-candidate output"
```

---

## Task 8: Real AI pipeline behind a feature flag

**Files:**
- Modify: `lib/video-analysis.ts`
- Create: `app/api/video-analysis/route.ts`

This adds a real Whisper + Claude path. Still demo-safe: defaults to mock unless `NEXT_PUBLIC_VIDEO_ANALYSIS_MODE=real` is set.

- [ ] **Step 1: Create API route `app/api/video-analysis/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

// Server-side endpoint for real video analysis.
// Accepts multipart/form-data with a video Blob; transcribes with Whisper;
// runs competency analysis with Claude; returns structured JSON.
// Only called when NEXT_PUBLIC_VIDEO_ANALYSIS_MODE=real and keys are set.

export async function POST(req: NextRequest) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  if (!OPENAI_KEY || !ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "Analysis API keys not configured." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const videoFile = formData.get("video") as File | null;
  const candidateId = formData.get("candidateId") as string | null;
  if (!videoFile || !candidateId) {
    return NextResponse.json({ error: "Missing video or candidateId." }, { status: 400 });
  }

  // Step A: Whisper transcription
  const whisperBody = new FormData();
  whisperBody.append("file", videoFile);
  whisperBody.append("model", "whisper-1");
  whisperBody.append("response_format", "text");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: whisperBody,
  });
  if (!whisperRes.ok) {
    return NextResponse.json({ error: "Whisper transcription failed." }, { status: 502 });
  }
  const transcript = await whisperRes.text();

  // Step B: Claude analysis
  const prompt =
    `You are analysing a graduate candidate's video interview responses. ` +
    `Score the candidate 1-100 on each of: adaptability, cognitiveAgility, emotionalIntelligence, collaboration, drive. ` +
    `Then write a 2-3 sentence summary, identify the strongestArea (one of the 5 competencies, human-readable), ` +
    `and write one sentence probeInF2F for the interviewer. Return strict JSON with fields: ` +
    `competencyScores (object with 5 number fields), summary, strongestArea, probeInF2F. ` +
    `Do NOT analyse visual/facial features — only the transcribed words.\n\n` +
    `Transcript:\n${transcript}`;

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!claudeRes.ok) {
    return NextResponse.json({ error: "Claude analysis failed." }, { status: 502 });
  }
  const claudeData = (await claudeRes.json()) as { content: Array<{ text: string }> };
  const text = claudeData.content[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Could not parse Claude response." }, { status: 502 });
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return NextResponse.json({
    ...parsed,
    analysedAt: new Date().toISOString(),
    transcript,
  });
}
```

- [ ] **Step 2: Add real-mode dispatcher to `lib/video-analysis.ts`**

Append to the existing file:

```typescript
export type AnalysisMode = "mock" | "real";

export function getAnalysisMode(): AnalysisMode {
  // Client-safe env var only — NEXT_PUBLIC_*.
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_VIDEO_ANALYSIS_MODE === "real") {
    return "real";
  }
  return "mock";
}

export async function runRealAnalysis(
  candidateId: string,
  videoBlob: Blob
): Promise<VideoInterviewAnalysis> {
  const form = new FormData();
  form.append("video", videoBlob, "interview.webm");
  form.append("candidateId", candidateId);
  const res = await fetch("/api/video-analysis", { method: "POST", body: form });
  if (!res.ok) throw new Error("Video analysis request failed");
  return (await res.json()) as VideoInterviewAnalysis;
}

export async function runAnalysis(
  candidateId: string,
  videoBlob?: Blob
): Promise<VideoInterviewAnalysis> {
  if (getAnalysisMode() === "real" && videoBlob) {
    try {
      return await runRealAnalysis(candidateId, videoBlob);
    } catch (err) {
      console.warn("Real analysis failed; falling back to mock.", err);
      return runMockAnalysis(candidateId);
    }
  }
  return runMockAnalysis(candidateId);
}
```

- [ ] **Step 3: Verify types and build**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/video-analysis.ts app/api/video-analysis/route.ts
git commit -m "feat: add real Whisper+Claude analysis pipeline behind feature flag"
```

---

## Task 9: Seed pre-analysed candidates for demo

**Files:**
- Modify: `lib/data/candidates.ts`

- [ ] **Step 1: Identify target candidates**

Open `lib/data/candidates.ts`. Pick 3 candidates currently in `Shortlisted` or `Interview` stage who have rich profiles. Good choices: `c005 Sophie Williams`, `c007 Ella Fitzgerald`, `c010 Tom Nguyen` (these already have `accessibilityNeeds` for narrative depth — but alternatives are fine if they're in the wrong stage).

Change each target candidate's `stage` to `"Video Interview"` and add a `videoInterview` field.

- [ ] **Step 2: Add the `videoInterview` field to each of the 3 chosen candidates**

For each target candidate, add (adjust names, dates, scores):

```typescript
videoInterview: {
  invitedAt: "2025-03-28",
  completedAt: "2025-03-30",
  responses: [
    { questionId: "vq1", videoUrl: "/demo-videos/c005-q1.webm", durationSeconds: 58 },
    { questionId: "vq2", videoUrl: "/demo-videos/c005-q2.webm", durationSeconds: 60 },
    { questionId: "vq3", videoUrl: "/demo-videos/c005-q3.webm", durationSeconds: 54 },
  ],
  analysis: {
    competencyScores: {
      adaptability: 88,
      cognitiveAgility: 91,
      emotionalIntelligence: 85,
      collaboration: 87,
      drive: 89,
    },
    summary:
      "Clear and specific in each response. Demonstrated strong cognitive agility in question 2 by articulating their diagnostic approach before settling on an answer. Showed genuine reflection on what drove the self-initiated work in question 3.",
    strongestArea: "Cognitive Agility",
    probeInF2F: "Probe how they know when they have enough information to decide — the response hinted at a tendency to want more data than needed.",
    analysedAt: "2025-03-30T14:22:00Z",
  },
},
```

Use different numbers for the other two candidates — vary the strongestArea between Cognitive Agility, Emotional Intelligence, and Drive so the demo shows variety.

- [ ] **Step 3: Add AssessmentHistory entries for each target candidate**

To each candidate's `assessmentHistory` array, append:

```typescript
{ date: "2025-03-28", stage: "Shortlisted", note: "Progressed to shortlist." },
{ date: "2025-03-30", stage: "Video Interview", note: "Video interview completed. AI analysis ready." },
```

(Use an existing date if their real history already passed Shortlisted.)

- [ ] **Step 4: Update `pipelineCounts` if needed**

If `pipelineCounts` in `lib/data/program.ts` doesn't already show `"Video Interview": 28`, leave it — the 28 is a demo-world count, not actual candidates. The actual rendered column uses the filtered list.

- [ ] **Step 5: Run build to verify types**

Run: `npx tsc --noEmit && npm run build`
Expected: No errors.

- [ ] **Step 6: Add placeholder video files**

Create `public/demo-videos/` directory and add 9 placeholder `.webm` files. For MVP, **any valid .webm video ~60 seconds** works — the product team will replace with real recordings. A quick placeholder: use `ffmpeg` to create a short silent video, OR commit an empty file as a placeholder and flag for replacement.

```bash
mkdir -p public/demo-videos
# Option A: create silent 60s placeholders with ffmpeg
for id in c005 c007 c010; do
  for q in 1 2 3; do
    ffmpeg -f lavfi -i color=c=gray:s=640x480:d=60 -f lavfi -i anullsrc=r=48000:cl=stereo -t 60 -c:v libvpx-vp9 -c:a libopus "public/demo-videos/${id}-q${q}.webm" -y 2>/dev/null
  done
done
# Option B: if ffmpeg not available, create zero-byte placeholders (demo will show "broken video" but pipeline works)
# for id in c005 c007 c010; do for q in 1 2 3; do touch "public/demo-videos/${id}-q${q}.webm"; done; done
```

Document in a README inside `public/demo-videos/README.md` that these need to be replaced with real sample videos before the SRLA demo.

- [ ] **Step 7: Commit**

```bash
git add lib/data/candidates.ts public/demo-videos/
git commit -m "feat: seed 3 candidates with completed video interview data for demo"
```

---

## Task 10: VideoInterviewPanel component

**Files:**
- Create: `components/profile/VideoInterviewPanel.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useState } from "react";
import { Video, Play, Sparkles } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate, VideoInterviewData, PotentialDimensions } from "@/lib/data/candidates";
import { dimensionLabels } from "@/lib/data/candidates";
import { getPromptById } from "@/lib/data/video-prompts";

export function VideoInterviewPanel({ candidate }: { candidate: Candidate }) {
  const data = candidate.videoInterview;
  if (!data) return null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Video size={15} className="text-indigo-500" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold text-slate-700">Video Interview</CardTitle>
          {data.completedAt && (
            <span className="text-xs text-slate-400 ml-auto">
              Completed {new Date(data.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ResponsesRow data={data} />
        {data.analysis && <AnalysisBlock analysis={data.analysis} />}
      </CardContent>
    </Card>
  );
}

function ResponsesRow({ data }: { data: VideoInterviewData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Responses</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.responses.map((response, i) => {
          const prompt = getPromptById(response.questionId);
          const isActive = activeIndex === i;
          return (
            <div key={response.questionId} className="border rounded-lg overflow-hidden">
              {isActive ? (
                <video
                  src={response.videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <button
                  onClick={() => setActiveIndex(i)}
                  className="w-full aspect-video bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                  aria-label={`Play response ${i + 1}`}
                >
                  <Play size={28} className="text-white/80" aria-hidden="true" />
                </button>
              )}
              <div className="p-3 bg-slate-50">
                <p className="text-xs text-slate-400 font-medium">Question {i + 1}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {prompt?.question ?? response.questionId}
                </p>
                <p className="text-xs text-slate-400 mt-1">{response.durationSeconds}s</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalysisBlock({
  analysis,
}: {
  analysis: NonNullable<VideoInterviewData["analysis"]>;
}) {
  const chartData = (Object.keys(analysis.competencyScores) as Array<keyof PotentialDimensions>).map(
    (key) => ({
      subject: dimensionLabels[key],
      score: analysis.competencyScores[key],
      fullMark: 100,
    })
  );

  return (
    <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={13} className="text-indigo-500" aria-hidden="true" />
        <p className="text-xs font-semibold text-slate-700">Audio-only AI Analysis</p>
        <span className="text-[10px] text-slate-400 ml-auto">
          Transcript-based — no facial analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748B" }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#0EA5E9"
              fill="#0EA5E9"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              formatter={(value) => [`${value}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed mt-1">{analysis.summary}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Strongest signal
            </p>
            <p className="text-sm text-slate-700 mt-1">{analysis.strongestArea}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Probe in F2F
            </p>
            <p className="text-sm text-slate-700 mt-1">{analysis.probeInF2F}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/profile/VideoInterviewPanel.tsx
git commit -m "feat: add VideoInterviewPanel for admin profile with playback and radar analysis"
```

---

## Task 11: Integrate VideoInterviewPanel into candidate profile

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

- [ ] **Step 1: Open and read `app/candidates/[id]/page.tsx`**

Identify where `AiScreeningSummary` is rendered. The VideoInterviewPanel will go just below it.

- [ ] **Step 2: Add the import**

At the top with the other profile imports:

```typescript
import { VideoInterviewPanel } from "@/components/profile/VideoInterviewPanel";
```

- [ ] **Step 3: Render it conditionally after AiScreeningSummary**

Add directly after the `<AiScreeningSummary candidate={candidate} />` line:

```tsx
{candidate.videoInterview && <VideoInterviewPanel candidate={candidate} />}
```

- [ ] **Step 4: Verify in dev**

Run: `npm run dev`
Visit: `/candidates/c005` (or whichever candidate has videoInterview seeded)
Expected: VideoInterviewPanel renders with radar + summary visible.

- [ ] **Step 5: Commit**

```bash
git add app/candidates/\[id\]/page.tsx
git commit -m "feat: render VideoInterviewPanel on candidate profile when data present"
```

---

## Task 12: Invite-to-video-interview button

**Files:**
- Create: `components/pipeline/InviteToVideoInterviewButton.tsx`
- Modify: `components/pipeline/CandidateCard.tsx`

- [ ] **Step 1: Create the button component**

```typescript
// components/pipeline/InviteToVideoInterviewButton.tsx
"use client";

import { useState } from "react";
import { Video, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InviteToVideoInterviewButton({ candidateId }: { candidateId: string }) {
  const [sent, setSent] = useState(false);
  const link = `/video-interview/${candidateId}`;
  const fullLink = typeof window !== "undefined" ? `${window.location.origin}${link}` : link;

  function handleSend() {
    setSent(true);
    // In production this would trigger an email + DB write.
    // For demo, copy the link to clipboard so the presenter can open it in a new tab.
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(fullLink);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        size="sm"
        onClick={handleSend}
        disabled={sent}
        className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
      >
        <Video size={13} />
        {sent ? "Link copied — open in new tab" : "Invite to video interview"}
      </Button>
      {sent && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Copy size={10} />
          <code className="truncate">{link}</code>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Read `components/pipeline/CandidateCard.tsx` to find the existing hover-action pattern**

The card renders different actions based on stage. Identify where the "Send assessment" or "Schedule interview" link appears conditionally — the invite button will go in the same spot for `Shortlisted` stage.

- [ ] **Step 3: Add the conditional button to `CandidateCard.tsx`**

Import at top:
```typescript
import { InviteToVideoInterviewButton } from "@/components/pipeline/InviteToVideoInterviewButton";
```

Inside the card JSX, where other stage-conditional actions appear, add:
```tsx
{candidate.stage === "Shortlisted" && (
  <div className="mt-2">
    <InviteToVideoInterviewButton candidateId={candidate.id} />
  </div>
)}
```

(The exact placement depends on the existing structure — mirror whatever pattern `"Send assessment"` or `"Schedule interview"` uses.)

- [ ] **Step 4: Verify**

Run: `npm run dev`
Visit: `/pipeline` as Admin
Expected: Shortlisted candidates show an "Invite to video interview" button. Clicking it copies the link and shows the preview.

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/
git commit -m "feat: add invite-to-video-interview action on shortlisted candidate cards"
```

---

## Task 13: Wire live-recording candidate into VideoInterviewPanel

**Files:**
- Modify: `components/video-interview/RecordingStep.tsx` (or `VideoInterviewShell.tsx`)
- Modify: `lib/video/storage.ts`

This closes the loop: when a candidate completes the flow, their recordings + mock analysis should be visible on the profile. Since demo storage is in-memory, this only works within one session — that's fine for demo.

- [ ] **Step 1: Add a session-state helper to `lib/video/storage.ts`**

Append to the file:

```typescript
import type { VideoInterviewData, VideoInterviewAnalysis } from "@/lib/data/candidates";

const sessionCompleted = new Map<string, VideoInterviewData>();

export function markVideoInterviewComplete(candidateId: string, data: VideoInterviewData) {
  sessionCompleted.set(candidateId, data);
}

export function getSessionVideoInterview(candidateId: string): VideoInterviewData | undefined {
  return sessionCompleted.get(candidateId);
}
```

- [ ] **Step 2: In `VideoInterviewShell.tsx`, on completion, compute analysis and store**

When the state transitions to `"complete"` (in the `RecordingStep` `onComplete` for the last question), also call:

Find the `onComplete` handler in `VideoInterviewShell.tsx`:
```typescript
onComplete={() => {
  const nextIndex = state.questionIndex + 1;
  if (nextIndex >= totalQuestions) {
    setState({ phase: "complete" });
  } else {
    setState({ phase: "prompt", questionIndex: nextIndex });
  }
}}
```

Replace the `if (nextIndex >= totalQuestions)` block:

```typescript
if (nextIndex >= totalQuestions) {
  void finaliseInterview(candidate.id);
  setState({ phase: "complete" });
} else {
  setState({ phase: "prompt", questionIndex: nextIndex });
}
```

Add `finaliseInterview` as a function inside the component:

```typescript
async function finaliseInterview(candidateId: string) {
  const responses = videoPrompts.map((prompt) => {
    const id = `${candidateId}-${prompt.id}`;
    const rec = getRecording(id);
    return {
      questionId: prompt.id,
      videoUrl: rec ? URL.createObjectURL(rec.blob) : "",
      durationSeconds: rec?.durationSeconds ?? prompt.recordSeconds,
    };
  });

  // MVP: for live recording, always use mock analysis (no blob passed).
  // The real pipeline in Task 8 is wired for future use but not called from here —
  // sending 3 separate blobs to Whisper requires orchestration beyond MVP scope.
  const analysis = await runAnalysis(candidateId);

  markVideoInterviewComplete(candidateId, {
    invitedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    responses,
    analysis,
  });
}
```

Add the necessary imports at the top of `VideoInterviewShell.tsx`:

```typescript
import { getRecording, markVideoInterviewComplete } from "@/lib/video/storage";
import { runAnalysis } from "@/lib/video-analysis";
```

- [ ] **Step 3: Update `VideoInterviewPanel` to pick up session data**

Modify `components/profile/VideoInterviewPanel.tsx` at the top of the component, after `if (!data) return null;`:

Replace:
```typescript
const data = candidate.videoInterview;
if (!data) return null;
```

With:
```typescript
const seededData = candidate.videoInterview;
const sessionData = typeof window !== "undefined" ? getSessionVideoInterview(candidate.id) : undefined;
const data = sessionData ?? seededData;
if (!data) return null;
```

Add the import at the top:
```typescript
import { getSessionVideoInterview } from "@/lib/video/storage";
```

- [ ] **Step 4: Verify**

Run: `npm run dev`
- Record a video interview as a candidate at `/video-interview/c001`
- Switch to admin, visit `/candidates/c001`
- Expected: VideoInterviewPanel appears with the recordings and a mock analysis

- [ ] **Step 5: Commit**

```bash
git add lib/video/storage.ts components/video-interview/VideoInterviewShell.tsx components/profile/VideoInterviewPanel.tsx
git commit -m "feat: wire live-recorded video interview into candidate profile panel"
```

---

## Task 14: Smoke-test and demo polish

**Files:**
- Modify: potentially `app/video-interview/[candidateId]/page.tsx`, `VideoInterviewShell.tsx` — based on what smoke testing reveals

- [ ] **Step 1: Run the full dev server and walk the demo flow**

Run: `npm run dev`
Walk through:
1. As Admin, go to `/pipeline`. Confirm "Video Interview" column exists with pre-seeded candidates.
2. Hover a Shortlisted candidate. Click "Invite to video interview". Open the link.
3. Complete the recording flow (3 questions, ~5 minutes).
4. Return to admin. Visit the candidate profile. Confirm VideoInterviewPanel populates.
5. Visit a pre-seeded candidate profile (e.g. `/candidates/c005`). Confirm the panel shows seeded videos + analysis.

- [ ] **Step 2: Fix anything broken during smoke test**

Common issues to watch for:
- MediaRecorder permission denied on localhost — Chrome may require `https` for some features; `http://localhost` is exempted but some Safari versions require a secure context.
- `pipelineCounts` mismatch — if the kanban shows "Video Interview: 0" but counts show 28, update counts or the rendering logic as appropriate.
- Stage transitions on `CandidateCard` "Advance" button — if it skips Video Interview, that's Task 1's `getNextStage` not being picked up somewhere. Check `StageColumn` and any advancement UI.

Commit each fix individually with a focused message.

- [ ] **Step 3: Final run of all tests**

Run: `npx vitest run`
Expected: All tests pass.

Run: `npx tsc --noEmit`
Expected: No type errors.

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: [specific fix]"
```

(Only if there were fixes — if the smoke test passed clean, skip.)

---

## Task 15: Update docs to reflect shipped state

**Files:**
- Modify: `docs/internal/capabilities.md`
- Modify: `docs/sales/objections.md`
- Modify: `docs/superpowers/backlog.md`

- [ ] **Step 1: Update `docs/internal/capabilities.md`**

Find the row:
```
| Video interview capture | Candidates record responses; recruiters and AC assessors review in-platform | 📋 Planned |
```

Replace with:
```
| Video interview capture | Candidates record responses against preset prompts; audio-only AI analysis produces 5-dimension scores; recruiters review in-platform | ✅ Live |
```

Also update the "What's next" section. Remove item 1 (Video interview capture) since it's now live. Renumber.

- [ ] **Step 2: Update `docs/sales/objections.md`**

Find objection #10 ("Do you offer video interviews?"). Rewrite the response:

```
**You say:** "Yes — our platform captures video interview responses against structured prompts, and our AI analyses the audio to surface competency signals across adaptability, cognitive agility, emotional intelligence, collaboration, and drive. We deliberately don't analyse facial features — there's too much documented bias in that tech and it doesn't fit how we think about potential. The video is there for your team to review; the AI listens to what the candidate says, not how their face looks when they say it."
```

Remove the `[ENRICH: update this response once video MVP ships]` marker.

- [ ] **Step 3: Update `docs/superpowers/backlog.md`**

Find the Tier 0 "Video interview capture (MVP)" item and change `- [ ]` to `- [x]`.

- [ ] **Step 4: Commit**

```bash
git add docs/
git commit -m "docs: mark video interview MVP complete; update capabilities, objection #10, and backlog"
```

---

## Post-implementation verification

After all 15 tasks complete:

```bash
# All tests pass
npx vitest run

# No type errors
npx tsc --noEmit

# Build succeeds
npm run build

# Smoke test
npm run dev
# Walk the flow end-to-end as described in Task 14
```

## Known post-MVP gaps (not in scope of this plan)

These are intentionally deferred and called out in the spec:
- Production storage (signed URLs, retention policies, DSAR)
- Accessibility alternative path (written response flow)
- Mobile browser recording
- Real email invitations
- Admin-configurable questions
- ID verification / proctoring
- Analytics on completion rates / drop-off

Log follow-up tickets for any that Dave's demo feedback prioritises.
