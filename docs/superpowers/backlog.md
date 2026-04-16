# Talent Edge Enhancement Backlog

Items are ordered by priority within each tier. Pick the top unchecked item when starting a new build session.

---

## Tier 1 — Decision intelligence

- [x] **Candidate comparison panel**
  "Compare selected (N)" button in the pipeline filter bar when 2–3 candidates are checked. Opens a right-side drawer showing candidates side by side: name/score header, grouped bar chart of all five dimension scores, AI summary bullet. Admin only. No new routes — state lives in PipelineBoard. See spec: `docs/superpowers/specs/2026-04-15-feature-depth-backlog-design.md`.

- [x] **AI cohort insights on dashboard**
  A "Cohort Intelligence" card on the dashboard showing 3 computed insight strings: strongest dimension across assessed candidates, weakest dimension, and a track comparison (Finance vs Technology vs People & Culture average potential score). Computed from real candidate data — not copy. New `CohortInsights` component below the metrics row.

- [x] **Score percentile display**
  Show "Top 7% of cohort" alongside the raw score on pipeline cards (admin only) and the profile header. Computed by ranking the candidate's score against all assessed+ candidates and mapping onto the 142-candidate cohort from dashboard metrics. New `scorePercentile()` utility in `lib/utils.ts`.

---

## Tier 2 — Workflow completeness

- [x] **Interview scorecard**
  A collapsible "Interview Scorecard" section on candidate profiles for Interview-stage candidates (admin only). Four 1–5 star ratings (Communication, Cultural Fit, Problem Solving, Overall Impression), freeform notes, and a recommendation selector (Advance to Offer / Hold / Decline). Client-side state, success toast on save.

- [x] **Bulk reject with email preview**
  Mirrors bulk shortlisting. "Reject selected (N)" button alongside "Shortlist selected" in the pipeline filter bar. Opens a modal with an editable rejection email (tokens replaced with candidate name/program). On confirm, moves selected candidates to a new `"Rejected"` stage (filtered off the board). New `RejectModal` component.

- [x] **Candidate notes**
  Collapsible "Notes" section at the bottom of every candidate profile (admin only). Textarea + "Save Note" button. Saved notes render as timestamped entries above the input. Multiple notes per session. New `CandidateNotes` component.

---

## Tier 3 — Development phase

- [ ] **AI-generated development plan**
  For Hired candidates, generate development goals dynamically from dimension scores via a lookup table in `lib/development.ts`. Each dimension × score band maps to a specific activity. Generates 4–5 goals per candidate (weakest dimensions + one leverage goal). Replaces static seeded `developmentGoals`.

- [ ] **Program analytics page**
  New `/analytics` route with four recharts panels: pipeline funnel (count + % retained per stage), score distribution by track (grouped bar), time-in-stage averages, and score band breakdown (donut). Linked from sidebar.

- [ ] **Offer acceptance tracking**
  `offerStatus?: "pending" | "accepted" | "declined"` and `offerDeclineReason?` added to `Candidate` type. Offer-stage profiles show Mark Accepted / Mark Declined controls (admin only). Declined triggers a reason dropdown. Pipeline cards show a status chip; declined cards dim.

---

## Completed — original backlog

- [x] AI screening summary on candidate profiles
- [x] Feedback report generation (admin-triggered)
- [x] Pipeline stage advancement
- [x] Keep Warm communication feed
- [x] Self-service assessment config page
- [x] Bulk shortlisting on pipeline
- [x] Accessibility flag visibility for admin
- [x] Candidate search and filter on pipeline
- [x] Lifecycle Journey banner on Dashboard
- [x] ATS Integrations panel on Dashboard
- [x] AI candidate chat FAQ widget on Assessment
- [x] Self-booking schedule interview modal on Pipeline
- [x] Accessibility accommodation section on Registration
- [x] Score hiding from Graduate persona on Results screen
- [x] Persona-conditional exit CTAs on Thank You screen
- [x] README rewrite + docs/philosophy.md, docs/market-research.md, docs/demo-guide.md
