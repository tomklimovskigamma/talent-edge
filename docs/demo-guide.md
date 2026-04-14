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

#### Search and filter

- **Search bar** (top of the board) — type any part of a candidate's name, university, or degree. Results update instantly. An **✕** button clears the search.
- **Score-band filters** — three toggle buttons: **All Candidates**, **High Potential (80+)**, and **Emerging (65–79)**. Search and band filter compose — e.g. "High Potential" + search "melbourne" shows only high-potential candidates from Melbourne universities.
- The **N candidates shown** counter in the filter bar always reflects the active filters.

#### Hover interactions

- Hover a card in the **Applied** column → a **Send assessment** link appears (links to the assessment flow)
- Hover a card in the **Interview** column → a **Schedule interview** button appears
- Hover any card → an **Advance to [next stage]** button appears, moving the candidate to the next pipeline stage instantly

#### Bulk shortlisting

When viewing the **Assessed** column as Admin:
1. Each Assessed card shows a small checkbox in the top-left corner.
2. Tick one or more checkboxes — selected cards get an indigo border/tint.
3. A **Shortlist selected (N)** button appears in the filter bar.
4. Click it — all selected candidates move to the Shortlisted column in one action and the selection clears.

This replaces the full-day manual screening process described as a key pain point by program managers.

#### Accessibility flags

Candidates who requested accommodations during registration display a small violet **⊕** badge in the top-right of their pipeline card (Admin persona only). Hovering the badge reveals the candidate's specific accommodation request. This surfaces the request that would otherwise be lost in a registration form.

#### Scheduling demo

Click **Schedule interview** on any Interview-stage card. A modal opens showing five available time slots across three days. Select a slot — the button activates. Click **Send Calendar Invite** — a confirmation screen shows the candidate's name and the booked slot with a success state.

### 3. Candidate profile

Click any candidate card to open their profile. The profile shows:

**Header** — Name, university, degree, stage badge, potential score ring, and applied date. Candidates with accessibility needs display a violet **Accommodations requested** badge next to the stage badge; hovering it reveals the full accommodation detail.

**AI Screening Summary** — A 2–3 sentence AI-generated recommendation block derived from the candidate's dimension scores. Text is keyed to score bands and identifies top strengths, development areas, and a shortlisting recommendation. Visible to Admin only.

**Generate Report** — A button in the top-right opens a structured feedback report covering dimension scores with interpretations, strengths, development suggestions, and next steps. This is the auto-generated feedback report that program managers are expected to send post-assessment.

**Potential Radar** — A radar chart showing scores across all five dimensions.

**Assessment Timeline** — A log of the candidate's progression through the program stages.

**Development Goals** — (for candidates in Hired stage) active development goals with status indicators and due dates.

**Keep Warm feed** — (for Hired candidates) a timeline of automated touchpoints sent between offer acceptance and start date: offer letter sent, welcome video, start-date countdown check-in, and onboarding checklist link. Demonstrates the lifecycle phase that competes directly with Grad-Engage.

**Jordan Lee's profile** (`/candidates/c019`) is the demo graduate who completed the assessment in the Graduate flow. Their potential score of 89 and dimension breakdown reflect the default answers in the assessment demo.

### 4. Assessment Config

Navigate to **Settings → Assessment Config** (or `/settings/assessment`). This page lets program managers view and mock-edit:

- **Question language** — competency label names and track assignments
- **Client branding** — logo, primary colour, header text
- **Scoring weights** — dimension weighting per track

This is the self-service configuration differentiator vs Amberjack, where equivalent customisation requires a paid bespoke engagement. Even cosmetically, showing it as a working interface makes the contrast concrete.

### 5. Assessment preview (optional)

Admins can navigate directly to `/assessment` to preview the candidate experience. After completing the assessment as Admin, the **Thank You** screen shows both the **← Back to Pipeline** and **View Jordan's profile →** exit options — rather than the Graduate's simpler "Back to Home."

---

## Demo data

All candidate data is static and defined in `lib/data/candidates.ts`. The demo includes 19 candidates:

- **c001–c018** — a spread across all pipeline stages (Applied through Hired)
- **c019 — Jordan Lee** — the assessment demo candidate; pre-populated with default answers

Three candidates have accessibility accommodation requests seeded:
- **c005 Sophie Williams** (Assessed) — Extended time required (dyslexia)
- **c007 Ella Fitzgerald** (Applied) — Neurodiversity accommodations requested
- **c010 Tom Nguyen** (Assessed) — Screen reader support required

Program configuration (client name, intake year, target hires) is in `lib/data/program.ts`.

Assessment questions are in `lib/data/assessment.ts` — 20 questions across 5 dimensions, with track-specific scenario text for the three career tracks.
