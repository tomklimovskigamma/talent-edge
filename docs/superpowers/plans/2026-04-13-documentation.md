# Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the boilerplate README and create three linked documentation files covering product philosophy, market research, and a demo walkthrough guide.

**Architecture:** Four markdown files. README.md is the hub; three docs files are spokes. No code changes — pure content creation. Each doc is self-contained and can be read independently.

**Tech Stack:** Markdown (GitHub-flavoured), committed to main branch.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `README.md` | Rewrite | Hub: what it is, two-persona entry, links to all docs, local setup |
| `docs/philosophy.md` | Create | Product philosophy: potential vs privilege, 5 dimensions, lifecycle |
| `docs/market-research.md` | Create | Market landscape, ATS ecosystem, Amberjack gaps, Paula's insights |
| `docs/demo-guide.md` | Create | Step-by-step walkthrough for Graduate and Admin personas |

---

### Task 1: README.md — project hub

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README.md with this content**

Write the following to `/Users/tomklimovski/Github/talent-edge/README.md`:

```markdown
# Talent Edge

> Early careers recruitment, fully connected.

Talent Edge is a graduate recruitment and development platform built around one belief: **assess candidates for potential, not for privilege**.

Most graduate recruitment tools cover selection and stop. Talent Edge covers the entire graduate journey in a single connected product — from the moment a candidate first hears about a program, all the way through to their first-year talent review.

---

## The demo

This is a live demo environment built around a fictional client: **Meridian Group**, hiring 20 graduates into their 2026 program. No login or setup required.

**[→ View live demo on Vercel](https://talent-edge-ten.vercel.app)**

Two personas are available at the landing page — choose the one you want to explore:

| Persona | What you experience |
|---|---|
| **Graduate** | The candidate-facing assessment flow: registration, 5-dimension psychometric test, AI chat assistant, accessibility accommodations, results |
| **Admin** | The recruiter dashboard: pipeline kanban, candidate profiles, lifecycle journey view, ATS integrations, interview scheduling |

For a full step-by-step walkthrough of both paths, see the **[Demo Guide →](docs/demo-guide.md)**.

---

## Documentation

| Doc | What's in it |
|---|---|
| [Product Philosophy](docs/philosophy.md) | Why we assess for potential, the 5-dimension model, the full lifecycle view, the equity argument |
| [Market Research & Competitor Analysis](docs/market-research.md) | Australian grad recruitment landscape, ATS ecosystem, Amberjack analysis, domain expert insights from Paula |
| [Demo Guide](docs/demo-guide.md) | Step-by-step walkthrough of both the Graduate and Admin demo paths |

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables needed — all data is static demo data.

**Requirements:** Node 18+

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui |
| Charts | Recharts (RadarChart) |
| Icons | lucide-react |
| Deployment | Vercel (auto-deploy from `main`) |

---

## Project structure

```
app/                  # Next.js App Router pages
  page.tsx            # Landing page (persona selection)
  dashboard/          # Admin dashboard
  pipeline/           # Kanban pipeline board
  candidates/[id]/    # Candidate profile
  assessment/         # Graduate assessment flow

components/
  layout/             # AppShell, Sidebar
  dashboard/          # MetricsRow, PipelineFunnel, LifecycleJourney, IntegrationsPanel
  pipeline/           # PipelineBoard, CandidateCard, ScheduleModal
  assessment/         # AssessmentShell, RegistrationStep, DimensionStep, ResultsScreen, ChatWidget
  profile/            # ProfileHeader, PotentialRadar, AssessmentTimeline

lib/
  data/               # Static demo data (candidates, assessment questions, program config)
  scoring.ts          # Pure scoring functions for the psychometric assessment
  persona.tsx         # Persona context (graduate / admin) with localStorage persistence
```
```

- [ ] **Step 2: Commit**

```bash
cd /Users/tomklimovski/Github/talent-edge
git add README.md
git commit -m "docs: rewrite README as project hub with links to all documentation"
```

---

### Task 2: docs/philosophy.md — product philosophy

**Files:**
- Create: `docs/philosophy.md`

- [ ] **Step 1: Create `docs/philosophy.md`** with this content:

Write the following to `/Users/tomklimovski/Github/talent-edge/docs/philosophy.md`:

```markdown
# Product Philosophy

## Assess for potential, not for privilege

The graduate recruitment industry has a problem it rarely names out loud: traditional assessment processes systematically favour candidates who have already been advantaged.

Candidates who perform well in behavioural interviews tend to be those who have had access to a higher-quality education, completed prestigious internships, travelled, volunteered, and haven't had to work part-time to fund their own studies. The student who graduated with a 3.5 GPA while working 30 hours a week often loses to the student who graduated with a 3.8 GPA and a gap year in Europe — not because they have less potential, but because they've had fewer opportunities to demonstrate it in the ways traditional assessment rewards.

**We believe the right question isn't "what have you done?" It's "what are you capable of?"**

Assessing for potential levels the playing field. It doesn't reward polish. It doesn't reward access. It measures the raw qualities that predict whether a person will adapt, learn, and grow in whatever the future holds — regardless of where they started.

---

## The five dimensions of potential

Talent Edge assesses candidates across five dimensions. Each is measured through a combination of scenario-based questions (SJTs), self-report scales (Likert), forced-choice items, and cognitive tasks.

### 1. Adaptability
How a person responds when circumstances change. Do they lose momentum, or recalibrate? Do they resist change or move through it without friction? Early careers are defined by constant change — new managers, new tools, new expectations. Adaptability isn't optional.

### 2. Cognitive Agility
How quickly a person learns, reasons under uncertainty, and solves novel problems. This is distinct from academic intelligence. It's the capacity to hold conflicting information without defaulting prematurely to a conclusion, to see patterns in unfamiliar data, and to act effectively even when the picture isn't complete.

### 3. Emotional Intelligence
How a person reads, manages, and responds to emotions — their own and others'. This includes recognising emotional signals before they're verbalised, managing reactions under pressure, and navigating disagreement with skill rather than avoidance. Graduate roles are fundamentally social. EI predicts performance in ways IQ tests don't capture.

### 4. Collaboration
How a person contributes to — and elevates — the people around them. Not just "are they a team player?" but: do they share information generously, facilitate rather than compete, and give credit accurately? The highest performers in early careers programs are rarely the ones who focus only on their own output.

### 5. Drive
The motivation, ambition, and persistence that determines whether a person will go beyond what's expected of them. Drive isn't just effort — it's the willingness to choose the harder problem, to persist through failure, and to set standards for themselves that no one else would impose.

---

## The full lifecycle, not just selection

Historically, the graduate recruitment industry focused almost entirely on the Attraction and Selection phases. Find the best candidates. Score them. Move the top ones through. Done.

Over the last decade, that thinking has started to shift. The cost of a bad early-career hire isn't just a vacancy — it's the 12 months of onboarding investment that went with them. Retention and ROI tracking of graduate programs have become as strategically important as the intake itself.

Talent Edge is built around the complete graduate journey:

```
Attract → Assess → Select → Offer → Keep Warm → Onboard → Develop → Track Talent
```

The first four stages are Recruitment. The last four are Development. Most tools handle one half or the other. Talent Edge connects them — because the insight you build about a candidate during assessment should inform how you develop them once they're hired.

A candidate who scores high on Cognitive Agility but low on Collaboration needs a different development plan than one who's the inverse. That signal exists at assessment time. It shouldn't disappear the moment the offer is accepted.

---

## Why this matters for early careers specifically

Graduate candidates, by definition, have limited work history. They can't be assessed on past performance in the same way a senior hire can. They're being hired for what they'll become, not what they've already done.

This makes potential assessment not just an ethical choice, but the correct measurement methodology. You can't accurately predict 10-year career trajectory from a 3-month internship. You can make a much stronger prediction from a validated psychometric assessment designed to measure the underlying qualities that drive long-term performance.

The goal of Talent Edge is to make that assessment rigorous, equitable, and connected to the development journey that follows it.
```

- [ ] **Step 2: Commit**

```bash
git add docs/philosophy.md
git commit -m "docs: add product philosophy document"
```

---

### Task 3: docs/market-research.md — market context and competitor analysis

**Files:**
- Create: `docs/market-research.md`

This document synthesises: (1) the Australian grad recruitment market landscape, (2) a structured competitor analysis with Amberjack as the primary reference point, (3) direct domain expert input from Paula (former Amberjack, consulted as SME for the Talent Edge prototype).

- [ ] **Step 1: Create `docs/market-research.md`** with this content:

Write the following to `/Users/tomklimovski/Github/talent-edge/docs/market-research.md`:

```markdown
# Market Research & Competitor Analysis

## The Australian graduate recruitment market

The Australian graduate recruitment market is mature but fragmented. Most mid-to-large employers run structured annual intake programs — typically 10–100 hires — using a combination of:

- An **ATS** (Applicant Tracking System) to manage the candidate pipeline
- A **psychometric assessment** platform to score potential
- A **video interview** platform for early screening
- **Manual scheduling** tools (often just calendar invites)
- **Post-hire development** platforms (largely separate from the recruitment stack)

These systems rarely talk to each other. Program managers spend significant time on integration overhead, data reconciliation, and manual handoffs between tools.

---

## ATS landscape in Australia

The following platforms are most commonly used by Australian graduate employers (listed roughly by market prevalence):

| Platform | Notes |
|---|---|
| **PageUp** | Market leader for large enterprise graduate programs |
| **Springboard** | Historically entrenched in State and Federal Government |
| **Workday** | Strong in larger corporates with existing Workday HR infrastructure |
| **Success Factors (SAP)** | Common in multinationals |
| **Oracle HCM** | Enterprise-grade, typically larger organisations |
| Push Apply | Built by PG and DC, acquired into Amberjack ecosystem; not available as standalone |
| Eightfold | Actively selling to larger grad programs as of mid-2025; adoption unclear |
| LiveHire | |
| SmartRecruiters | |
| Taleo (Oracle) | Legacy, declining |
| Gradsift | Graduate-specialist ATS |
| Jobadder | SME-focused |
| Greenhouse | Growing presence, US-origin |
| Acendre | Government-focused |
| Elmo | Australian HR suite with ATS module |

*Source: Domain expert consultation, April 2026.*

---

## Primary competitor: Amberjack

Amberjack is the most established specialist graduate recruitment platform in the Australian market, offering end-to-end services including ATS (via Push Apply), psychometric assessment, video interviewing, and managed outsourcing.

### What they do well

- **Validated assessment model.** Amberjack developed a proprietary potential model with four components: Digital Mindset, Applied Intellect, Creative Force, and Grit. The methodology is sound and the marketing resonates strongly with the early careers audience.
- **End-to-end managed service.** For large programs that want to outsource the entire recruitment function, Amberjack offers a full-service model.
- **Market presence.** Strong brand recognition in Australian graduate recruitment circles.

### Where they fall short

These gaps were validated through direct consultation with a former Amberjack employee:

**1. Assessment inflexibility**
Everything bespoke comes at a cost. Simple requests — changing how a question is phrased, altering the competency language in a report to match a client's internal framework, swapping out specific questions — all require development effort and are priced as custom engagements. For small to medium-sized programs, this is prohibitive.

The most cost-effective Amberjack option for budget-conscious clients is an off-the-shelf assessment with a client logo applied. There is effectively no middle ground between "logo only" and "fully bespoke."

**2. Not self-service**
Clients cannot configure their own assessments, update branding, or adjust scoring without going through Amberjack's team. The platform doesn't feel agile or intuitive, and a more self-service model is a known roadmap gap.

**3. Disability and accommodation management is manual**
Adjustments for disability and neurodiversity — extended time, alternative formats, 1:1 phone screens — are handled manually by email and phone. There is no self-service accommodation request flow.

**4. Scheduling is still largely manual**
While some self-booking exists, reschedule and cancel workflows are predominantly manual. This is a significant time cost for program managers.

**5. Applicant engagement is underdeveloped**
Candidate questions are handled by email or phone. AI chatbot for general Q&A is not a standard part of the Amberjack platform.

**6. Development phase is disconnected**
The assessment data gathered during selection is not connected to a post-hire development and tracking platform. Once a candidate is hired, that potential data effectively disappears from the workflow.

---

## Secondary competitor: Grad-Engage

A newer entrant focused exclusively on the **Keep Warm** phase — the period between offer acceptance and start date. This is a real problem (candidates who accept offers and then disengage before their start date are a significant source of dropout), and Grad-Engage gets traction specifically because nothing else in the market addresses this phase well.

**Opportunity:** Talent Edge's lifecycle model explicitly includes Keep Warm as a tracked phase. Owning this phase as part of a connected platform — rather than a standalone tool — should be a competitive priority.

---

## Domain expert insights: Paula

*The following is a synthesis of direct feedback from Paula, a domain expert with first-hand experience of the Amberjack platform and the broader Australian graduate recruitment market, consulted in April 2026.*

### The five things program managers spend most time on

1. **Applicant screening** — Still largely manual. Even with ATS support, generating an initial shortlist takes at least a full day for most programs.

2. **Disability and neurodiversity management** — More time than necessary spent on manual acknowledgements, adjustment negotiations, and phone screens. No self-service solution exists in the mainstream market.

3. **System setup and configuration** — Multiple systems, each requiring configuration, branding uploads, and re-testing before each intake. Assessment Centre design is particularly laborious.

4. **Applicant engagement and feedback** — Program managers and outsource partners field large volumes of candidate questions. Clear FAQs reduce this, but an AI chatbot for general questions "should be standard and included in the platform." Feedback reports need to be auto-generated after assessment completion.

5. **Scheduling** — Self-booking has improved but reschedule and cancel workflows remain predominantly manual. "Any time spent manually managing scheduling is a waste."

### On potential vs performance

> "Assessing for Potential is the way to go. Often, the applicants that perform well at traditional behavioural assessments are those that have had access to a higher quality education, had internships at top firms, travelled and volunteered. So generally (but not always), the wealthier, more privileged have more opportunities to shine in a performance based process. A potential process levels the playing field."

### On the full lifecycle

> "Although we still see Recruitment and Development as two separate offerings, the platform should tie them together. Attract — Assess — Select — Offer — Keep warm — Onboard — Develop — Track Talent. And I think there are still some really cool things a decent development platform could provide."

> "The quality of the offer and keep warm process, the Induction and the training/development offered is now more widely considered to be as important as recruitment."

### On Grad-Engage

> "There is a new offering in the Australian market called Grad-Engage that focuses an entire offering on just the Keep Warm phase of the process. I see opportunity to stamp them out pretty quickly but they get traction because there are no other decent offerings to compete with them."

---

## The opportunity

The market gap Talent Edge is designed to fill:

| Gap | Talent Edge response |
|---|---|
| Assessment inflexibility | Self-service configuration (question language, branding, competency labels) without dev cost |
| No self-service | Fully configurable by program managers without vendor involvement |
| Disability management is manual | Self-declaration accommodation flow in assessment registration, automatic flagging |
| Scheduling is manual | Self-booking with automatic calendar invites; reschedule/cancel handled by candidates |
| No candidate chatbot | AI FAQ assistant embedded in the assessment flow |
| Development disconnected from selection | Single platform covering full Attract → Track Talent lifecycle; potential scores inform development plans |
| Keep Warm is unaddressed | Keep Warm phase is a first-class lifecycle stage in Talent Edge |
| Potential model not equity-focused | Explicitly designed to assess for potential, not privilege — track-specific scenarios reduce cultural bias |
```

- [ ] **Step 2: Commit**

```bash
git add docs/market-research.md
git commit -m "docs: add market research and competitor analysis document"
```

---

### Task 4: docs/demo-guide.md — how to use the demo

**Files:**
- Create: `docs/demo-guide.md`

- [ ] **Step 1: Create `docs/demo-guide.md`** with this content:

Write the following to `/Users/tomklimovski/Github/talent-edge/docs/demo-guide.md`:

```markdown
# Demo Guide

Talent Edge is a demo environment built around **Meridian Group**, a fictional financial services company hiring 20 graduates into their 2026 program.

There is no login, no account, and no data persistence beyond your current browser session. Everything resets on refresh.

---

## Choosing a persona

When you open the app at `/`, you'll see two cards:

| Card | Persona | Destination |
|---|---|---|
| **Graduate** — Take the assessment | Jordan Lee, University of Melbourne, Finance track | `/assessment` |
| **Admin** — View the dashboard | Sarah Chen, Graduate Program Manager, Meridian Group | `/dashboard` |

Your persona is saved to `localStorage` and persists as you navigate — so if you choose Admin, you'll see the Admin view throughout. To switch personas, return to `/` and choose the other card.

---

## Graduate path

This is the candidate-facing experience. You are Jordan Lee, a final-year Commerce student applying for Meridian Group's Finance graduate program.

### 1. Registration

The first screen collects your details (pre-filled as Jordan Lee) and lets you choose a career track. Three tracks are available — Finance, Technology, and People & Culture. Each track receives different scenario text in the situational judgement questions.

**Accessibility accommodations:** A second card on the registration screen lets you declare adjustment needs. Tick the checkbox — a textarea appears for details, and a confirmation note explains the process. This demonstrates the self-service accommodation flow that replaces manual email/phone handling.

Click **Begin Assessment** to proceed.

### 2. The assessment — five dimensions

The assessment has five sections, each measuring one dimension of potential:

| Section | Dimension | Question types |
|---|---|---|
| 1 | Adaptability | Situational judgement (SJT), Likert scale |
| 2 | Cognitive Agility | Sequence puzzle, SJT, Likert, forced choice |
| 3 | Emotional Intelligence | Emotion recognition (face), SJT, Likert |
| 4 | Collaboration | SJT, forced choice, Likert |
| 5 | Drive | SJT, Likert |

Each section has 4 questions. Answer each question and click **Next Section** to proceed.

**AI chat assistant:** At any point during the assessment, click the floating chat button (bottom-right corner). A panel opens with 5 pre-answered candidate questions covering duration, what's being measured, feedback timeline, accessibility, and data privacy.

### 3. Results screen

After completing all five sections, your results are scored and displayed as a radar chart showing your potential profile across the five dimensions.

**Note for demo:** As a Graduate persona, you see the shape of your profile but not the numerical scores. Scores are visible to the Admin persona only — this reflects real-world practice where assessment scores are reviewed by the recruitment team rather than disclosed to candidates during the process.

Click **Submit Results** to proceed.

### 4. Thank You screen

A confirmation screen shows the next steps in the process. As a Graduate, your exit option is **← Back to Home**, which returns you to the persona selection page.

---

## Admin path

This is the recruiter experience. You are reviewing the Meridian Group 2026 graduate intake.

### 1. Dashboard

The dashboard is the command centre for the program. It contains:

**Graduate Journey banner** — A full lifecycle view showing all eight stages from Attract through to Track Talent. Recruitment stages (indigo) show live counts from the demo data. Development stages (violet) are marked Coming Soon — this demonstrates the platform's ambition to own the full lifecycle, not just selection.

**Metrics row** — Total applicants (187), AI assessed (142), shortlisted (43), offers made (9).

**Pipeline funnel + Score distribution** — Visualisations of where candidates sit in the funnel and how their potential scores are distributed.

**Top Potential Candidates** — The five highest-scoring candidates in the cohort, each linking to their profile.

**Recent Activity** — A feed of recent program events.

**Platform Integrations** — Shows PageUp and Workday as connected ATS systems, with Success Factors, Oracle, Springboard, and Grad-Engage listed as available. A "Self-service Assessment Config — Coming Soon" teaser at the bottom signals the roadmap differentiator vs Amberjack.

### 2. Pipeline

Navigate to **Pipeline** via the sidebar. The kanban board shows all candidates arranged by stage: Applied → Assessed → Shortlisted → Interview → Offer → Hired.

**Hover interactions:**
- Hover a card in the **Applied** column → a **Send assessment** link appears (links to the assessment flow)
- Hover a card in the **Interview** column → a **Schedule interview** button appears

**Scheduling demo:** Click **Schedule interview** on any Interview-stage card. A modal opens showing five available time slots across three days. Select a slot — the button activates. Click **Send Calendar Invite** — a confirmation screen shows the candidate's name and the booked slot with a success state.

### 3. Candidate profile

Click any candidate card to open their profile. The profile shows:

- **Header:** Name, university, degree, stage, potential score, days in program
- **Potential Radar:** A radar chart showing their scores across all five dimensions
- **Assessment Timeline:** A log of their progression through the program stages
- **Development Goals:** (for candidates in later stages) active development goals with status and due dates

For candidates in the **Applied** stage, a **Send Assessment** button appears in the top-right of the profile header — this is the admin-side trigger to send the assessment link to a candidate.

**Jordan Lee's profile** (`/candidates/c019`) is the demo graduate who completed the assessment in the Graduate flow. Their potential score of 89 and dimension breakdown are pre-populated to reflect the default answers in the assessment demo.

### 4. Assessment preview (optional)

Admins can navigate directly to `/assessment` to preview the candidate experience. After completing the assessment as Admin, the **Thank You** screen shows both the **← Back to Pipeline** and **View Jordan's profile →** exit options — rather than the Graduate's simpler "Back to Home."

---

## Demo data

All candidate data is static and defined in `lib/data/candidates.ts`. The demo includes 18 candidates spread across all pipeline stages, plus Jordan Lee (c019) as the assessment demo candidate.

Program configuration (client name, intake year, target hires) is in `lib/data/program.ts`.

Assessment questions are in `lib/data/assessment.ts` — 20 questions across 5 dimensions, with track-specific scenario text for the three career tracks.
```

- [ ] **Step 2: Commit**

```bash
git add docs/demo-guide.md
git commit -m "docs: add comprehensive demo guide for Graduate and Admin personas"
```

---

### Task 5: Push all docs

- [ ] **Step 1: Push to main**

```bash
cd /Users/tomklimovski/Github/talent-edge && git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Philosophy doc — "assess for potential not privilege", 5 dimensions, lifecycle, equity argument
- ✅ Competitor analysis — Amberjack strengths/gaps, ATS landscape, Grad-Engage, Paula's verbatim insights
- ✅ Demo guide — both persona paths, every feature documented (chat widget, accessibility, scheduling, integrations, lifecycle banner)
- ✅ README — links to all three docs, local setup, tech stack, project structure
- ✅ Paula's comments addressed — her exact quotes used in market-research.md, all 5 pain points named and mapped to platform responses

**Placeholder scan:** None. All content is complete.

**Consistency:**
- Lifecycle stages are consistent across all docs: Attract → Assess → Select → Offer → Keep Warm → Onboard → Develop → Track Talent
- "Assess for potential, not for privilege" phrasing consistent
- Dimension names consistent: Adaptability, Cognitive Agility, Emotional Intelligence, Collaboration, Drive
- Candidate names consistent with `lib/data/candidates.ts` (Jordan Lee = c019)
