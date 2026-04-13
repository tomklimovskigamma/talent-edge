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
