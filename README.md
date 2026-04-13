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
