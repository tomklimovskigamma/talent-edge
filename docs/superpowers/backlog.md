# Talent Edge Enhancement Backlog

Items are ordered by priority within each tier. Pick the top unchecked item when starting a new build session.

---

## Tier 1 — High impact, demo-critical

- [x] **AI screening summary on candidate profiles**
  Each profile gets a 2–3 sentence AI recommendation block generated from dimension scores (e.g. "Jordan's Cognitive Agility and Adaptability place them in the top 12% of assessed candidates. Collaboration is a development area. Recommended: advance to interview."). Static text keyed to score bands. Directly demonstrates the core value proposition of replacing manual shortlisting.

- [x] **Feedback report generation (admin-triggered)**
  "Generate Report" button on candidate profile opens a modal/drawer showing a structured PDF-style report: dimension scores with interpretations, strengths, development suggestions, next steps. Addresses Paula's explicit callout that auto-generated feedback reports are expected. Closes the loop on the ChatWidget promise ("report within 5 business days").

- [x] **Pipeline stage advancement**
  "Advance to [next stage]" action on candidate cards and/or profile. Even with no state persistence, showing the button and a success toast makes the pipeline interactive rather than a static board.

---

## Tier 2 — Strong differentiator, moderate effort

- [x] **Keep Warm communication feed**
  For Hired candidates: a timeline of automated touchpoints — offer letter sent, welcome video, start-date countdown check-in, onboarding checklist link. Directly targets Grad-Engage. Paula named them as the competitive target; a 5-event static timeline on hired profiles lands hard in a demo.

- [x] **Self-service assessment config page**
  A `/settings/assessment` page where program managers can see (and mock-edit) question language, competency labels, track assignments, and client branding. The anti-Amberjack feature. Paula described self-service config as a known Amberjack roadmap gap — showing it working (even cosmetically) directly addresses the "everything bespoke costs extra" pain.

---

## Tier 3 — Polish and realism

- [ ] **Bulk shortlisting on pipeline**
  Checkboxes on Assessed-stage candidate cards + "Shortlist selected (N)" action. Directly addresses the full-day manual screening pain Paula described.

- [ ] **Accessibility flag visibility for admin**
  Candidates who ticked the accommodation checkbox in Registration should surface a visible flag on their pipeline card and profile. Closes the loop — currently the accommodation request disappears into a form.

- [ ] **Candidate search and filter on pipeline**
  Search bar and score-range filter on the pipeline board. Makes the board feel like a real tool.

---

## Completed

- [x] Lifecycle Journey banner on Dashboard
- [x] ATS Integrations panel on Dashboard
- [x] AI candidate chat FAQ widget on Assessment
- [x] Self-booking schedule interview modal on Pipeline
- [x] Accessibility accommodation section on Registration
- [x] Score hiding from Graduate persona on Results screen
- [x] Persona-conditional exit CTAs on Thank You screen
- [x] README rewrite + docs/philosophy.md, docs/market-research.md, docs/demo-guide.md
