# Feature Depth Backlog — Design Spec

**Date:** 2026-04-15
**Context:** All Tier 1–3 items from the original backlog are complete. This spec defines the next batch of enhancements, organised around three themes: decision intelligence, workflow completeness, and development phase depth.

---

## Tier 1 — Decision intelligence

### 1. Candidate comparison panel

**What it does:** A "Compare selected" button appears in the pipeline filter bar when 2–3 candidates are checked (any stage, admin persona only). Clicking opens a right-side drawer showing the candidates side by side.

**Drawer contents:**
- Name, avatarInitials, score, and stage badge per candidate (header row)
- Grouped bar chart of all five dimension scores (one group per dimension, one bar per candidate)
- AI screening summary bullet per candidate (1 sentence)
- Close button (× or ESC)

**Trigger:** Same checkbox mechanism used by bulk shortlisting. When 2–3 candidates are selected AND the admin is viewing, the "Compare selected (N)" button appears alongside "Shortlist selected" in the filter bar. Selecting only 1 or more than 3 disables/hides the compare button.

**Scope:** Pipeline only. No new routes. State lives in `PipelineBoard`. Drawer is a new component `components/pipeline/ComparisonDrawer.tsx`.

**Data:** Reads from the same `Candidate` objects already in scope. Dimension score chart uses recharts `BarChart` (already available or easily added).

---

### 2. AI cohort insights on dashboard

**What it does:** A "Cohort Intelligence" card on the dashboard showing 3 computed insight strings derived from the real candidate data in `lib/data/candidates.ts`.

**Insights (computed at render time, not hardcoded copy):**
1. **Strongest dimension** — compute average score per dimension across all assessed candidates; surface the highest. e.g. "Collaboration is this cohort's standout strength — averaging 87 across all assessed candidates."
2. **Weakest dimension** — same computation, lowest. e.g. "Drive is the development opportunity — cohort average of 71, 9 points below Collaboration."
3. **Track comparison** — compare average `potentialScore` across Finance, Technology, and People & Culture tracks. e.g. "Finance track candidates lead on overall potential score (84 avg) vs Technology (79) and People & Culture (76)."

**Placement:** New card below the metrics row on the dashboard, above the funnel/score distribution panels.

**Component:** `components/dashboard/CohortInsights.tsx`. Pure computation — no state, no hooks beyond reading from `candidates`.

---

### 3. Score percentile display

**What it does:** Alongside the raw `potentialScore`, show a percentile label: "Top 7% of cohort."

**Computation:** Rank the candidate's score against all candidates with a stage of Assessed or beyond (i.e. candidates who have a score). Use linear interpolation to map rank within 19 demo candidates onto the 142-candidate assessed cohort from the dashboard metrics — so the numbers feel real-world rather than "3rd of 19."

**Formula:**
```
rank = number of assessed+ candidates with score > candidate.score
percentile = Math.round((rank / 142) * 100)
label = percentile <= 10 ? `Top ${percentile}% of cohort` : `Top ${percentile}% of cohort`
```

**Where it appears:**
- Profile header (`ProfileHeader.tsx`) — below the score ring, replacing or supplementing the existing `scoreLabel`
- Pipeline cards (`CandidateCard.tsx`) — as a sub-label below the score badge (admin only, mounted guard)

**New utility:** `lib/utils.ts` gains a `scorePercentile(score: number, allCandidates: Candidate[]): string` export.

---

## Tier 2 — Workflow completeness

### 4. Interview scorecard

**What it does:** A collapsible "Interview Scorecard" section on the candidate profile, visible only when `candidate.stage === "Interview"` and persona is admin.

**Rating dimensions (1–5 stars each):**
- Communication
- Cultural Fit
- Problem Solving
- Overall Impression

**Below the ratings:**
- Freeform notes textarea ("Key observations…")
- Recommendation selector: `Advance to Offer` / `Hold` / `Decline`
- "Save Scorecard" button (client-side state, success toast)

**Component:** `components/profile/InterviewScorecard.tsx`. State is local (no persistence). Rendered in `app/candidates/[id]/page.tsx` below `AiScreeningSummary`, gated on stage + persona.

**Persona gating:** Admin only. Uses `usePersona` hook (client component wrapper needed since the profile page is a server component — follow the pattern used by `FeedbackReportButton`).

---

### 5. Bulk reject with email preview

**What it does:** Mirrors bulk shortlisting. Checkboxes on Applied and Assessed stage cards (admin only) with a "Reject selected (N)" button in the filter bar. Clicking opens a modal with a pre-written rejection email the admin can edit before "sending."

**Selection behaviour:** The existing checkbox + selectedIds mechanism in `PipelineBoard` supports this. A second action button "Reject selected (N)" appears alongside "Shortlist selected (N)" when applicable cards are selected. Both buttons can coexist.

**Reject modal contents:**
- Subject line (editable): "Your application to Meridian Group 2026 Graduate Program"
- Body (editable): warm, professional rejection copy with `{candidateName}` and `{programName}` tokens replaced
- "Send & Reject" button → moves all selected candidates to a new terminal stage `"Rejected"` via `stageOverrides`, shows success toast, clears selection
- Cancel button

**New stage:** `"Rejected"` added to `StageName` union and `stages` array. Rejected candidates do not appear in any column (filtered out of the board). A small "N rejected" count appears below the board or in a collapsed "Rejected" column.

**Component:** `components/pipeline/RejectModal.tsx`.

---

### 6. Candidate notes

**What it does:** A collapsible "Notes" section at the bottom of every candidate profile (admin only). Freeform annotations with a save action.

**UI:**
- Collapsed by default, "Add note +" toggle to expand
- Textarea placeholder: "Add an observation, flag, or reminder…"
- "Save Note" button — on save, the note renders above the textarea as a timestamped entry: `Sarah Chen · 15 Apr 2026 — [note text]`
- Multiple notes can be saved in a session (stored in component state as an array)

**Component:** `components/profile/CandidateNotes.tsx`. State is per-session (array of `{ text: string; timestamp: string }`). Rendered at the bottom of `app/candidates/[id]/page.tsx`, admin-only via client wrapper.

---

## Tier 3 — Development phase

### 7. AI-generated development plan

**What it does:** For Hired candidates, generate development goals dynamically from their dimension scores rather than using static seeded `developmentGoals`.

**Logic:** A lookup table in `lib/development.ts` maps each dimension × score band to a specific development activity:

| Dimension | Score < 75 | Score 75–84 | Score ≥ 85 |
|---|---|---|---|
| Adaptability | "Complete a cross-functional rotation in the first 90 days" | "Volunteer to lead one change initiative in Q1" | "Mentor a peer through an ambiguous project" |
| Cognitive Agility | "Work through structured case study program" | "Take ownership of a data-driven problem" | "Lead a complex analytical deliverable by end of Q1" |
| Emotional Intelligence | "Complete EQ foundations coaching module" | "Request 360 feedback from direct team" | "Facilitate first team retrospective" |
| Collaboration | "Join a cross-functional project team within first 60 days" | "Co-present with a peer on a team deliverable" | "Sponsor a collaborative initiative across teams" |
| Drive | "Set a personal 90-day stretch goal with manager" | "Identify one area to proactively go beyond the brief" | "Pitch an improvement initiative to senior leadership" |

Generates 4–5 goals per candidate (one per weakest dimension + one "leverage" goal from top dimension). Each goal gets a computed due date (30 / 60 / 90 / 180 days from a fixed start date).

**New file:** `lib/development.ts` exports `generateDevelopmentGoals(candidate: Candidate): DevelopmentGoal[]`.

**Integration:** `app/candidates/[id]/page.tsx` calls `generateDevelopmentGoals(candidate)` instead of using `candidate.developmentGoals` directly.

---

### 8. Program analytics page

**What it does:** A new `/analytics` route, linked from the sidebar, showing four data visualisation panels.

**Panels:**
1. **Pipeline funnel** — horizontal bar chart, candidate count at each stage, percentage retained step-to-step
2. **Score distribution by track** — grouped bar chart, average per dimension broken out by Finance / Technology / People & Culture tracks
3. **Time-in-stage** — horizontal bar chart, average `daysInStage` per stage (from candidate data + simulated historical comparison)
4. **Score band breakdown** — donut chart, High Potential (≥80) / Emerging (65–79) / Developing (<65) counts

**Charts:** `recharts` library (add if not present).

**Route:** `app/analytics/page.tsx`. Server component. No persona gate — admin-focused page but not restricted.

**Sidebar:** Add "Analytics" link to the existing sidebar navigation component.

---

### 9. Offer acceptance tracking

**What it does:** Offer-stage candidates gain a visible acceptance status and admin controls to record the outcome.

**Data:** Add `offerStatus?: "pending" | "accepted" | "declined"` and `offerDeclineReason?: string` to the `Candidate` type. Default is `"pending"` for all Offer-stage candidates.

**Profile UI:** On Offer-stage profiles (admin only), below the stage badge:
- Three buttons: **Mark Accepted** (emerald) / **Mark Declined** (rose) / **Awaiting Response** (default/disabled state)
- On "Mark Declined": a dropdown appears with reason options: Competing offer / Salary / Location / Role fit / No response
- State lives in its own `offerStatusOverrides: Record<string, "pending" | "accepted" | "declined">` in a client wrapper component — separate from `stageOverrides`

**Pipeline card:** Offer-stage cards show a small status chip: "Awaiting" (slate) / "Accepted ✓" (emerald) / "Declined ✗" (rose). Declined cards visually dim (opacity-50).

**Component:** `components/profile/OfferStatusControls.tsx` (client component). Pipeline card reads `candidate.offerStatus` directly.

---

## Non-goals

- No backend, no persistence — all state is client-side and resets on refresh
- No real email sending — rejection email is a preview only
- No authentication changes
- No new persona types
- Volume/pagination work is explicitly deferred to a future batch

---

## Implementation order

Build in backlog tier order. Each item is independently shippable. Tier 1 items have the highest demo impact and should be completed first.
