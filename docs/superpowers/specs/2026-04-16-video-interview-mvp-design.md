# Video Interview MVP — Design Spec

**Date:** 2026-04-16
**Context:** Dave demos to SRLA directors in the week of 11 May 2026 (~4 weeks out). He's promising prospects that the platform covers "application, psych testing, video." The demo today has no video capability. This spec defines a demo-credibility MVP: working video interview flow for one live-recording candidate, pre-seeded video + AI analysis for a handful of shortlisted candidates on the pipeline board.

---

## Product shape (Dave's spec, validated)

**Flow:** A shortlisted candidate is invited to a video interview stage. They click a link and are taken through:

1. Prompt appears on screen (one question at a time)
2. Short preparation window (~30 seconds)
3. Video recording activates for a pre-defined time limit (recording captures face + voice)
4. Questions keep moving forward — one attempt per question, no re-records, no going back
5. Candidate finishes and submits

**Scope:** 3 questions, 60 seconds each. Matches industry standard (Hirevue, Modern Hire) without being tedious in a demo.

**AI analysis:** Audio-only transcription (via Whisper) + LLM analysis of the transcript against our 5 competency dimensions. Face is never fed into any model. Video is captured for human review only.

**Admin review:** On the candidate profile, a new "Video Interview" section shows the recorded videos (one per question), the AI competency scores, and an AI-generated summary. Matches the visual language of the existing 5-dimension radar.

---

## Why this product shape matters

**Ethical differentiation:** Hirevue, Sova, and similar products analyse facial expression as part of their scoring. This has documented accuracy issues across ethnicity and neurodiversity and is being regulated (NYC Local Law 144, EU AI Act high-risk categorisation). By analysing audio only, we get the analytical value without the bias landmines.

**Positioning:** Fits our "assess for potential, not privilege" philosophy. Candidates with flat affect under stress, ESL candidates, and neurodivergent candidates shouldn't be penalised for how their face moves.

**Sales narrative:** "We believe candidates shouldn't be scored on how their face moves. We analyse what they say, not what they look like when they say it." This is our core talk track against Hirevue-style competitors.

---

## Pipeline integration

**Decision: add a new pipeline stage between Shortlisted and Interview.**

New stage order:
```
Applied → Assessed → Shortlisted → Video Interview → Interview → Offer → Hired
```

Rationale:
- Matches how grad programs actually use AVIs — as a gate between initial shortlist and F2F interview
- Demo clarity — Dave can say "you've shortlisted 43 of 142 assessed; video interview goes to these 43, narrows to 15 F2F invites"
- Visually appears in the existing kanban, funnel, and lifecycle banner without code surgery (just adds a column and updates counts)

**Impact on existing features (all tolerable):**
- `lib/data/program.ts`: add `"Video Interview"` to `StageName` union, update `stages` array, update `pipelineCounts`
- `lib/pipeline.ts`: add `"Video Interview"` to `stageOrder`
- Seeded candidate data: redistribute ~5-8 candidates from Shortlisted/Interview into Video Interview for the demo
- Pipeline kanban: automatically renders the new column (reads stages from `program.ts`)
- Lifecycle banner: automatically includes the new stage count
- Funnel visualisation: automatically includes the new stage

---

## Candidate flow (new route)

**Route:** `/video-interview/[candidateId]`

**Component structure:**
```
app/video-interview/[candidateId]/
  page.tsx                    # Entry point; reads candidate, renders shell
components/video-interview/
  VideoInterviewShell.tsx     # Step orchestration (intro → question loop → complete)
  IntroStep.tsx               # "You're about to record 3 video responses..."
  PromptStep.tsx              # Shows the question + prep timer + record button
  RecordingStep.tsx           # Active recording; countdown timer; stop button
  CompleteStep.tsx            # "Thanks! Your responses are with the hiring team."
lib/video/
  recorder.ts                 # MediaRecorder wrapper (start, stop, blob)
  prompts.ts                  # The 3 demo questions (hard-coded)
```

**Key behaviours:**
- Browser must prompt for camera + mic permission up-front (before any question is shown)
- Recording uses `MediaRecorder` with `video/webm;codecs=vp9,opus` (cross-browser, efficient)
- Timer visible during recording; recording auto-stops at limit
- No back button, no skip, no re-record — one attempt per question by design
- After final question, blob is uploaded to Vercel Blob (or for pure demo mode, stored in-memory and never persists)

**Demo-safe toggle:** `lib/video/recorder.ts` exposes a flag that short-circuits the actual upload and returns a mocked "analysis complete" state. Dave can demo without relying on API calls in the meeting. Default off in dev, on for the deployed demo build.

---

## AI analysis pipeline

**Pipeline (runs after recording is submitted):**

1. Extract audio from video blob (either server-side with ffmpeg-wasm, or client-side with Web Audio API — we'll use client-side for the MVP to keep server infra minimal)
2. Send audio to OpenAI Whisper API → transcript
3. Send transcript + prompt metadata to Claude API with a structured prompt template → returns competency scores and summary
4. Persist to candidate record

**Prompt template shape (for LLM analysis):**
```
Given these three video interview responses from a graduate candidate,
score the candidate on each of the following 5 competencies from 1-100:
- Adaptability
- Cognitive Agility
- Emotional Intelligence
- Collaboration
- Drive

Then provide a 2-3 sentence summary of what the responses demonstrate,
what the candidate's strongest area is, and one observation for interviewers
to probe in the F2F round.

Return structured JSON.
```

**For demo-seeded candidates:** Analysis output is hardcoded in seed data. No API call at demo time. We only call real AI when someone records live.

**For live recording in demo:** We have two choices to decide in plan phase:
- **(a) Real API call** — more impressive ("this is actually working"), requires reliable wifi and API keys
- **(b) Mocked response with "processing..." delay** — safe on bad wifi, always works, slightly less impressive if someone probes

Recommendation: build both, feature-flag the switch. Dave chooses per-demo based on conditions.

---

## Admin profile integration

**New section on candidate profile** (for candidates in Video Interview stage or later):

```
Video Interview
───────────────
  [Video 1]  Q: Tell us about a time you had to change approach mid-project.
  [Video 2]  Q: Walk us through how you'd diagnose an unfamiliar problem.
  [Video 3]  Q: What's something you've worked hard at that nobody asked you to?

  Competency signal from responses
  ────────────────────────────────
  [Small radar chart or bar chart, same 5 dimensions]

  Summary
  ───────
  [2-3 sentence AI-generated summary]
  [Strongest area: X]
  [Probe in F2F: Y]
```

**Component:** `components/profile/VideoInterviewPanel.tsx`

**Visual consistency:** Reuse the existing recharts RadarChart component for the competency display — same shape as `PotentialRadar` but sourced from video analysis scores rather than psychometric scores. Optional overlay mode later to show both on one chart ("psych radar vs video radar").

**Playback:** HTML5 `<video>` element with native controls. No custom player. Videos played from Vercel Blob signed URL (for demo-seeded candidates, from a local `/public/demo-videos/` path).

---

## Invite flow (admin-initiated)

On any Shortlisted candidate's card or profile, a new **"Invite to video interview"** button (admin only):
- Advances candidate to Video Interview stage
- Shows a confirmation toast with a copy-able link: `http://localhost:3000/video-interview/c007` (for demo this is fine; production needs signed tokens)
- No real email is sent — demo candidate experience is "click the link in the toast to try it"

**Component:** `components/pipeline/InviteToVideoInterviewButton.tsx`

---

## Seeded demo data

**Live-record candidate:** Jordan Lee (c019) — already the demo candidate for the assessment flow. Reuse.

**Pre-seeded candidates with videos + analysis** (all in Video Interview or Interview stage by default):
- 2-3 candidates with full video responses + AI analysis already computed
- Videos stored in `/public/demo-videos/c00X-qY.webm`
- Analysis stored in the seeded candidate data structure

**Sample videos:** For MVP, use publicly-available stock footage OR ask Tom/team to record 2-3 sample responses themselves. Videos should be diverse (gender, ethnicity, accent) to visually reinforce the equity positioning. Each video ~60 seconds of a person answering the prompt.

**Analysis seeds:** Hardcoded competency scores (one candidate slightly stronger on Cognitive Agility, another stronger on EI + Collaboration, etc.) and hand-written summaries. Makes the demo feel real.

---

## Candidate type extensions

**New types in `lib/data/candidates.ts`:**

```typescript
export type VideoInterviewResponse = {
  questionId: string;
  videoUrl: string;           // Path to video file
  transcript?: string;        // Optional — filled by Whisper
  durationSeconds: number;
};

export type VideoInterviewAnalysis = {
  competencyScores: Record<"adaptability" | "cognitiveAgility" | "emotionalIntelligence" | "collaboration" | "drive", number>;
  summary: string;
  strongestArea: string;
  probeInF2F: string;
  analysedAt: string;
};

// Added to Candidate:
videoInterview?: {
  invitedAt?: string;
  completedAt?: string;
  responses: VideoInterviewResponse[];
  analysis?: VideoInterviewAnalysis;
};
```

---

## Accessibility — explicitly out of scope for MVP

The timed no-retry format will be difficult for some candidates (anxiety, neurodiversity, ESL). In production we need an alternative pathway for candidates with declared accommodations — likely a written-response equivalent with similar AI analysis.

**For the demo:** add a single line to the intro screen: "Candidates with accessibility accommodations will be offered an alternative format. Contact your program coordinator." This is enough to handle the question "what about accessibility" in a demo meeting.

**Post-demo:** proper written-response alternative is a Tier 1 follow-up.

---

## What ships in 3 weeks (plan)

**Week 1 — Candidate recording flow**
- Pipeline stage added
- Candidate route + step components
- MediaRecorder wrapped and tested across Chrome/Safari/Firefox
- Mocked upload (stores blob in-memory)
- Demo-safe flag working

**Week 2 — Admin profile integration**
- VideoInterviewPanel component with HTML5 playback
- Seeded demo data + stock videos in repo
- Seeded AI analysis
- Invite button + toast + stage advancement
- Lifecycle banner / funnel / counts all reflect new stage

**Week 3 — AI pipeline + polish**
- Real Whisper transcription (for live recording)
- Claude analysis prompt + JSON parsing
- Error handling / timeouts
- Demo rehearsal on the deployed Vercel build
- Documentation update: capabilities.md status flips to ✅ Live

---

## What's explicitly out of scope for this MVP

- Production-grade storage (signed URLs, retention, deletion, DSAR flows)
- Accessibility alternative path (mentioned but not built)
- Mobile browser recording — desktop Chrome/Safari/Firefox only for demo
- Multi-question branching logic
- Re-record / review / retake flows
- Candidate-side transcript display
- Overlay radar (video analysis vs psych analysis on one chart)
- Real email invitations (demo uses in-app toast link)
- Admin-configurable video questions — questions are hardcoded for demo
- ID verification / proctoring
- Analytics on video completion rates, drop-off, etc.

All of these become candidates for a production hardening sprint after SRLA demo feedback.

---

## Success criteria

1. Dave can demo the full flow: show admin inviting a shortlisted candidate, switch to candidate view, record a live video response to one question, switch back to admin view, see the analysis panel populated.
2. Dave can click through to 2-3 other candidates in the Video Interview stage and show pre-seeded analysis — making the product feel lived-in, not just a demo stub.
3. The pipeline kanban, funnel, and lifecycle banner all visibly include the Video Interview stage.
4. Capabilities page flips Video interview capture from 📋 Planned to ✅ Live.
5. Objection #10 in `docs/sales/objections.md` gets updated to remove the "shipping next release" language — Dave can confidently say "yes, the platform does video."

---

## Open questions for the plan phase

1. Exactly which 3 questions go into the demo? Needs to be drafted — ideally each targeting 1-2 of our 5 dimensions so the analysis story is clean.
2. Stock vs self-recorded sample videos — which is faster to acquire and looks more credible on the demo?
3. For the live-recording AI pipeline: real Whisper + Claude, or mocked delay + canned response? Recommendation is build both and flag-switch.
4. Does the Invite button advance the stage immediately, or only on successful recording submission? The first is cleaner for the demo (admin can show the kanban update instantly); the second is more realistic.
