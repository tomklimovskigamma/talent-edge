# Documentation Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write 8 markdown docs (2 internal, 6 sales) plus a Confluence sync update, sequenced across three drops so Paula can start her homework and Dave can rehearse before his demo in ~4 weeks.

**Architecture:** Pure markdown content — no code, no components. Each task creates one file. Content is derived from existing docs (`docs/philosophy.md`, `docs/market-research.md`, `docs/demo-guide.md`), the backlog (`docs/superpowers/backlog.md`), git commit history, and Paula's domain insights from memory. The Confluence sync pipeline update is a one-line YAML change.

**Tech Stack:** Markdown, GitHub Actions YAML

**Spec:** `docs/superpowers/specs/2026-04-16-documentation-pack-design.md`

---

## File Structure

```
docs/
  internal/
    paula-briefing.md        # Task 1 — context for Paula before she writes her 6 items
    capabilities.md          # Task 2 — living "what's in the demo" page for Paula + Dave
  sales/
    pitch.md                 # Task 3 — 30-sec / 2-min / 10-min pitch scripts for Dave
    icp.md                   # Task 4 — ideal customer profile + buyer personas
    discovery.md             # Task 5 — qualifying questions for first meetings
    objections.md            # Task 6 — objection handling playbook
    battle-card-amberjack.md # Task 7 — head-to-head competitive card
    demo-script.md           # Task 8 — what to say while demoing (depends on all above)

.github/workflows/sync-docs.yml  # Task 9 — add internal/ and sales/ paths to Confluence sync
```

**Dependency chain:** Tasks 1–2 are Drop 1 (unblock Paula and Dave). Tasks 3–8 are Drop 2 (sales enablement). Task 8 (demo-script) should be written last because it references content from pitch, objections, and battle card. Task 9 (sync update) can happen at any point.

---

## Drop 1 — Unblock Paula and Dave

### Task 1: Paula Briefing Doc

**Files:**
- Create: `docs/internal/paula-briefing.md`

**Source material to read before writing:**
- `docs/philosophy.md` — the 5-dimension model and assessment philosophy
- `docs/market-research.md` — ATS landscape, Amberjack analysis
- `docs/demo-guide.md` — what the demo shows today
- Paula's domain insights from memory (5 pain points, lifecycle model, Amberjack gaps, Grad-Engage)

- [ ] **Step 1: Create `docs/internal/` directory**

```bash
mkdir -p docs/internal
```

- [ ] **Step 2: Write `docs/internal/paula-briefing.md`**

Write the full document with these sections:

**Section 1 — "What Talent Edge is today"** (3–4 sentences):
- Working demo on Vercel, not a concept deck. Link: https://talent-edge-ten.vercel.app
- Two personas: Graduate (candidate assessment flow) and Admin (recruiter dashboard + pipeline)
- Full psychometric assessment across 5 dimensions, pipeline management, candidate profiles, AI screening, report generation
- Built in Next.js but Paula doesn't need to know or care about that

**Section 2 — "What we've already captured from you":**

Summarise these documented insights and tell Paula not to re-cover them unless correcting:
- Top 5 pain points: (1) applicant screening still largely manual, (2) disability/neurodiversity management is manual, (3) system setup across multiple platforms, (4) applicant engagement/experience, (5) scheduling
- Amberjack gaps: assessment inflexibility, not self-service, bespoke costs for simple changes
- ATS landscape: PageUp, Springboard (govt), Workday, Success Factors, Oracle as top 5; plus 10 more documented
- Lifecycle model: Attract → Assess → Select → Offer → Keep Warm → Onboard → Develop → Track Talent. Recruitment = first half, Development = second half
- Grad-Engage: focused on Keep Warm phase exclusively, opportunity to stamp them out
- Assessment philosophy: assess for potential not privilege; 5-dimension model (Adaptability, Cognitive Agility, EI, Collaboration, Drive)

**Section 3 — "Your 6 items — where they land":**

A table with columns: Item | What we already have | Focus your effort on | What it unlocks

Row 1 — End-to-end process map:
- Already have: Lifecycle model (8 stages) documented in philosophy.md
- Focus on: The detail within each stage — handoffs, decision points, who does what, employer vs candidate side
- Unlocks: Validates our capabilities page; gaps become roadmap items

Row 2 — Tools & systems:
- Already have: ATS landscape (15 platforms) documented in market-research.md
- Focus on: The non-ATS tools — scheduling tools, spreadsheets, email templates, reporting, video platforms
- Unlocks: Strengthens integration story and competitive positioning

Row 3 — Assessment types:
- Already have: 5-dimension model and question types (SJT, Likert, forced choice, sequence puzzles, emotion recognition) documented
- Focus on: Methods beyond psychometric — video interview, group exercises, case studies, Assessment Centres. What each measures, how scored, what data it produces
- Unlocks: Product IP for future features; deepens the demo script

Row 4 — Pain points:
- Already have: Top 5 pain points from first conversation
- Focus on: Expand to 10+. Split two ways: what clients complained about vs what was painful on ops/delivery side. Manual, slow, error-prone stuff.
- Unlocks: Directly feeds objection handling and discovery questions for Dave

Row 5 — Real program examples:
- Already have: One demo scenario (Meridian Group, 20 hires, Finance track)
- Focus on: 3–5 anonymised real examples at different scales — small single-stream vs large multi-stream with different assessment paths
- Unlocks: Builds realistic demo scenarios; gives Dave concrete stories to tell

Row 6 — Amberjack tech review:
- Already have: Gaps documented (inflexibility, bespoke costs, not self-service)
- Focus on: Go deeper — what did their platform actually do well? Where did it fall short technically? What would you build differently starting from scratch?
- Unlocks: Single biggest input to the competitive battle card

**Section 4 — "The demo today":**
- Link to `capabilities.md` (the companion doc)
- One line: "Read this to see what the platform already does. Your homework should fill in what's around and beyond it."

**Tone rules:**
- No technical language (no "component", "route", "Next.js", "API")
- Direct and respectful of her time
- Dot points over prose where possible

- [ ] **Step 3: Review the doc against source material**

Read through `paula-briefing.md` and check:
- Every claim about "what we already have" is accurate against the source docs
- No technical jargon leaked in
- The 6-item table clearly tells Paula what NOT to repeat

- [ ] **Step 4: Commit**

```bash
git add docs/internal/paula-briefing.md
git commit -m "docs: add Paula briefing doc with existing knowledge summary and homework mapping"
```

---

### Task 2: Capabilities Page

**Files:**
- Create: `docs/internal/capabilities.md`

**Source material to read before writing:**
- `docs/demo-guide.md` — the most detailed source for what's live in the demo
- `docs/superpowers/backlog.md` — the 🔜 and 📋 items
- Git log (`git log --oneline -40`) — confirms what's shipped
- The capabilities tables in the design spec (`docs/superpowers/specs/2026-04-16-documentation-pack-design.md` lines 97–155)

- [ ] **Step 1: Write `docs/internal/capabilities.md`**

Write the full document with these sections:

**Header:**
```markdown
# What's in Talent Edge

**Last updated:** 2026-04-16
**Live demo:** [talent-edge-ten.vercel.app](https://talent-edge-ten.vercel.app)

> ✅ Live — in the demo today | 🔜 Next — specced and planned | 📋 Planned — on the roadmap
```

**One table per lifecycle stage.** Columns: Capability | What it does | Status.

Use the exact capabilities and descriptions from the design spec (lines 97–155). They've already been validated against the git history and backlog. The full list:

**Attract** (2 items): Program landing page ✅, Persona selection ✅

**Assess** (7 items): 5-dimension psychometric assessment ✅, Multiple question types ✅, Track-specific scenarios ✅, AI candidate chat assistant ✅, Accessibility accommodations ✅, Self-service assessment config ✅, Score percentile display 🔜

**Select** (12 items): Pipeline kanban board ✅, Candidate search and filter ✅, AI screening summaries ✅, Feedback report generation ✅, Bulk shortlisting ✅, Candidate comparison panel ✅, Cohort intelligence insights ✅, Accessibility flag visibility ✅, Pipeline stage advancement ✅, Self-booking interview scheduling ✅, Interview scorecard 📋, Bulk reject with email preview 📋, Candidate notes 📋

**Offer** (1 item): Offer acceptance tracking 📋

**Keep Warm** (1 item): Automated touchpoint feed ✅

**Onboard / Develop / Track Talent** (3 items): Development goals ✅, AI-generated development plan 📋, Program analytics 📋

**Platform-wide** (4 items): ATS integrations ✅, Dashboard command centre ✅, Full lifecycle journey view ✅, Candidate profiles ✅

**"What's next" section:**

Pull the 🔜 and 📋 items into a short prioritised list:
1. Score percentile display (🔜 — specced)
2. Interview scorecard (📋)
3. Bulk reject with email preview (📋)
4. Candidate notes (📋)
5. Offer acceptance tracking (📋)
6. AI-generated development plans (📋)
7. Program analytics page (📋)

**Footer:**
```markdown
---
*This page is updated each time a feature ships. If something is missing, check with Tom.*
```

**Tone rules:**
- Zero technical language. "Recruiters edit question language" not "Admin configures assessment via /settings/assessment route"
- One sentence per capability, plain English
- Scannable — someone should get the full picture in 60 seconds

- [ ] **Step 2: Cross-check against demo-guide.md**

Read `docs/demo-guide.md` and confirm every feature described in the demo guide appears in capabilities.md. Flag any that are missing and add them.

- [ ] **Step 3: Cross-check against backlog.md**

Read `docs/superpowers/backlog.md` and confirm every 📋 Planned item in capabilities.md has a matching backlog entry. The status should be consistent — nothing marked ✅ Live that isn't actually shipped, nothing marked 📋 Planned that's already built.

- [ ] **Step 4: Commit**

```bash
git add docs/internal/capabilities.md
git commit -m "docs: add capabilities page — living feature inventory for Paula and Dave"
```

---

## Drop 2 — Sales Enablement Pack

### Task 3: Pitch Script

**Files:**
- Create: `docs/sales/pitch.md`

**Source material to read before writing:**
- `docs/philosophy.md` — the "why" narrative and equity argument
- `docs/internal/capabilities.md` (written in Task 2) — what the product does
- Paula's domain insights from memory — the pain points and lifecycle model

- [ ] **Step 1: Create `docs/sales/` directory**

```bash
mkdir -p docs/sales
```

- [ ] **Step 2: Write `docs/sales/pitch.md`**

Write the full document with these sections:

**Section 1 — "The 30-second pitch":**

Write this as the words Dave would say if someone at a networking event asked "so what does your company do?" One problem statement, one positioning statement, one differentiator. Structure:

- Problem: "Most graduate recruitment tools cover selection and stop. The assessment data disappears the moment the offer is accepted. Meanwhile, program managers are stitching together 4–5 disconnected systems just to run an intake."
- Position: "Talent Edge is a graduate recruitment and development platform that covers the entire journey — from the first application through to the first-year talent review — in one connected product."
- Differentiator: "And we assess candidates for their potential, not their polish. The student who worked 30 hours a week through uni shouldn't lose to the one with a gap year in Europe."

This must sound like natural speech, not marketing copy. Dave rehearses this out loud.

**Section 2 — "The 2-minute pitch":**

Expands the 30-second version with three paragraphs:

1. **The problem** (expand): Fragmented tools (ATS, psychometric platform, video interview platform, spreadsheets for scheduling, separate onboarding system). Manual screening takes a full day. Assessment insight doesn't carry into development. The industry focuses on Attract → Select and ignores everything after.

2. **What Talent Edge does** (expand): Full lifecycle coverage across 8 stages. AI-powered psychometric assessment across 5 validated dimensions. Self-service configuration — recruiters change question wording, branding, and scoring without paying for a bespoke engagement. Automated candidate engagement from assessment through to onboarding.

3. **Why it's different** (expand): vs Amberjack — self-service vs bespoke, full lifecycle vs selection-only, equity-centred assessment. vs Grad-Engage — we do Keep Warm AND everything else, they only do Keep Warm. vs building it yourself — 5 disconnected tools vs one platform.

**Section 3 — "The 10-minute pitch":**

The full first-meeting narrative. Structure it as a walk through the lifecycle stages:

- Open with the "assess for potential, not privilege" philosophy — this is the emotional hook
- Walk through each lifecycle stage: name the pain point Paula identified, then show how Talent Edge addresses it
  - Attract: "Right now your employer brand lives in one system, your application form in another..."
  - Assess: "Your assessment is probably run by a third-party platform that charges you for every change..."
  - Select: "Your program manager spends a full day on initial screening with an Excel spreadsheet..."
  - Offer: "You make the offers, then..."
  - Keep Warm: "...nothing. The candidate doesn't hear from you for 3 months. That's where you lose them. That's where Grad-Engage is eating the market."
  - Develop: "And here's the thing nobody talks about — the insight you built during assessment should inform how you develop them. But it disappears."
- Close with: "Want to see it? I can show you what this looks like in 15 minutes."

Mark these enrichment points in the text:
- `[ENRICH: Paula item #4 — replace generic pain statements with real client complaints]`
- `[ENRICH: Paula item #5 — add concrete program examples to illustrate scale]`

**Tone rules:**
- Written as spoken language throughout. Short sentences. No jargon.
- Dave should be able to read any version directly to a prospect

- [ ] **Step 3: Read the pitch aloud mentally — check for corporate-speak**

Scan every sentence. If it sounds like a brochure ("leverage our integrated platform to optimise your graduate pipeline"), rewrite it as something a human would say ("one system instead of five").

- [ ] **Step 4: Commit**

```bash
git add docs/sales/pitch.md
git commit -m "docs: add pitch script — 30-sec, 2-min, and 10-min versions for Dave"
```

---

### Task 4: Ideal Customer Profile

**Files:**
- Create: `docs/sales/icp.md`

**Source material to read before writing:**
- `docs/market-research.md` — the Australian grad market landscape
- Paula's domain insights — ATS landscape, program structures

- [ ] **Step 1: Write `docs/sales/icp.md`**

Write the full document with these sections:

**Section 1 — "Who we sell to":**

The ideal customer profile in plain language:
- Mid-to-large Australian employers running structured annual graduate intake programs
- Typically hiring 10–100 graduates per year
- Already using an ATS (PageUp, Workday, Success Factors, or similar)
- Running a separate psychometric assessment platform (likely Amberjack or similar)
- Frustrated by at least one of: assessment inflexibility, tool fragmentation, manual screening overhead, or disconnect between recruitment and development
- Sectors with the strongest fit: financial services, professional services (Big 4, law), government (state and federal), resources/mining, large retailers with structured programs

**Section 2 — "Who's in the room":**

A table with columns: Persona | Typical title | What they care about | What resonates

Row 1 — The Program Manager:
- Title: Graduate Program Manager / Early Careers Lead / Graduate Recruitment Coordinator
- Cares about: Day-to-day operational pain — screening time, scheduling chaos, manual handoffs between systems, candidate experience complaints
- Resonates: "Bulk shortlisting replaces a full day of Excel screening." "Self-booking scheduling." "One system instead of five." Show them the pipeline board.

Row 2 — The HR Director:
- Title: Head of Talent / Director of Early Careers / HR Director
- Cares about: Equity and DEI reporting, program ROI, graduate retention rates, board-level metrics
- Resonates: "Assess for potential, not privilege." Lifecycle tracking from assessment to development. Cohort insights. This persona buys the philosophy.

Row 3 — The Procurement Buyer:
- Title: Head of Procurement / IT / Vendor Management
- Cares about: Cost vs incumbent, integration risk, data security, contract terms
- Resonates: ATS integrations (we sit on top, not replace). Self-service means no ongoing bespoke costs. They're comparing line items.

Row 4 — The Grad (influencer, not buyer):
- Title: Recent graduate, program alumni, campus ambassador
- Cares about: Was the process fair? Was it accessible? Did they get feedback?
- Resonates: AI chat during assessment, accessibility accommodations, score transparency. They influence the Program Manager's view of candidate experience.

**Section 3 — "Who we don't pursue":**

Disqualifiers — so Dave doesn't waste time:
- Fewer than 10 graduate hires per year — the program is too small to justify a platform investment. Be polite, park them.
- Mid-contract with Amberjack on a multi-year deal with no trigger event — timing is wrong. Note the renewal date and follow up later.
- No structured graduate program — they hire grads ad hoc through the same process as experienced hires. This is an education sale ("you should have a program") before it's a product sale. Not our job right now.
- Companies that want fully outsourced managed service — they want someone to run the program for them, not a tool. Amberjack's strength, not ours.

- [ ] **Step 2: Commit**

```bash
git add docs/sales/icp.md
git commit -m "docs: add ideal customer profile and buyer personas for Dave"
```

---

### Task 5: Discovery Questions

**Files:**
- Create: `docs/sales/discovery.md`

**Source material to read before writing:**
- `docs/sales/icp.md` (written in Task 4) — the personas and disqualifiers inform what questions to ask
- Paula's domain insights — the pain points Dave should be probing for

- [ ] **Step 1: Write `docs/sales/discovery.md`**

Write the full document. Header explains the purpose: "These are the questions you ask in a first meeting. They do two things: qualify whether this prospect is a real opportunity, and shape which parts of the demo to emphasise."

**Group 1 — "Understand their program":**

| Question | Why you're asking | Good answer | Bad answer |
|---|---|---|---|
| How many graduates do you hire each year? | Sizes the opportunity | 10–100+ | Under 10 (disqualifier) |
| Single stream or multiple tracks? | Determines demo complexity to show | "We have 3 tracks with different assessments" | "Just one generic intake" (still fine, but simpler pitch) |
| How many applicants do you typically receive? | Gauges screening pain | "800 applicants for 20 spots" (high ratio = screening pain) | "About 30" (low volume, less pain) |
| What does your intake cycle look like — annual, rolling, or ad hoc? | Qualifies program maturity | "Annual intake, starts February" | "We just hire grads when we need them" (no structured program — disqualifier) |

**Group 2 — "Understand their tools":**

| Question | Why you're asking | Good answer | Bad answer |
|---|---|---|---|
| What ATS are you on? | Integration story | PageUp, Workday, Success Factors (we integrate) | "We don't use an ATS" (too early-stage for us) |
| What do you use for psychometric assessment? | Identifies incumbent to displace | Amberjack, Revelian, SHL, Aon (we replace these) | "We don't do psychometrics" (education sale) |
| How many separate systems are involved from application to day one? | Quantifies fragmentation pain | "At least 4 or 5" (strong pain signal) | "Just our ATS" (less fragmentation pain) |
| Who manages the tech — your team or a vendor? | Gauges self-service appetite | "We rely on Amberjack to configure everything" (self-service resonates) | "Our IT team handles it" (different buyer) |

**Group 3 — "Find the pain":**

| Question | Why you're asking | Good answer | Bad answer |
|---|---|---|---|
| What's the most manual part of your current process? | Opens the door to specific features | Screening, scheduling, anything manual (map to our features) | "It runs pretty smoothly" (no pain, no sale) |
| How long does initial screening take your team? | Quantifies screening pain specifically | "A full day" or "two people for a week" (strong signal) | "A couple of hours" (low pain) |
| What happens between offer acceptance and start date? | Probes Keep Warm gap | "Not much, honestly" or "we lose a few" (Grad-Engage territory, we win here) | "We have a structured onboarding program" (less differentiation) |
| Does your assessment data inform how you develop graduates once they're hired? | Probes lifecycle disconnect | "No, that's a different team" or "we'd love it to but it doesn't" (strongest possible signal) | "Yes, we have that covered" (rare, and reduces our value) |

**Group 4 — "Qualify the deal":**

| Question | Why you're asking | Good answer | Bad answer |
|---|---|---|---|
| When does your next intake cycle start? | Timing — is there urgency? | "In 6 months, we're planning now" (active buying window) | "We just finished this year's" (12-month cycle, park it) |
| Who else would be involved in a decision like this? | Maps the buying committee | Names 1–2 people (manageable) | "Our global procurement team in London" (long, complex sale) |
| Are you mid-contract with your current assessment provider? | Identifies switching barriers | "It's up for renewal in 3 months" (trigger event!) | "We just signed a 3-year deal" (timing, park and note renewal date) |

`[ENRICH: Paula item #4 — her expanded pain points may suggest additional discovery questions, particularly around ops/delivery pain that clients don't mention unprompted]`

- [ ] **Step 2: Commit**

```bash
git add docs/sales/discovery.md
git commit -m "docs: add discovery questions with qualification signals for Dave"
```

---

### Task 6: Objection Handling

**Files:**
- Create: `docs/sales/objections.md`

**Source material to read before writing:**
- `docs/market-research.md` — Amberjack analysis for objections #1 and #8
- `docs/philosophy.md` — equity argument for objection #3
- Paula's domain insights — pain points and Amberjack gaps
- `docs/sales/icp.md` (written in Task 4) — disqualifiers inform objection #6

- [ ] **Step 1: Write `docs/sales/objections.md`**

Write the full document. Header: "When prospects push back, use this. The goal isn't to 'win' the objection — it's to understand the concern behind it and address that."

Format for each objection:
```
## [Number]. "[The objection]"

**What's really going on:** [The underlying concern]

**You say:** [The response — written as Dave's spoken words]
```

**Objection 1 — "We already use Amberjack"**
- Underlying: Switching risk. They know Amberjack works (mostly). Why change?
- Response: Don't trash Amberjack. "Amberjack is solid for assessment delivery — they've got a good model. Where we're different is two things. First, self-service: your team configures assessment language, branding, and scoring directly, without a change request. Second, lifecycle: Amberjack covers Attract through Select. We cover Attract through Track Talent — so the assessment insight you build about a candidate actually informs how you develop them once they're hired. That's the gap no one else fills."
- `[ENRICH: Paula item #6 — her insider view of Amberjack's actual weaknesses will sharpen this significantly]`

**Objection 2 — "We just renewed our ATS"**
- Underlying: They think you're an ATS replacement.
- Response: "We're not replacing your ATS — we integrate with it. If you're on PageUp or Workday, we sit on top. We're the assessment, selection intelligence, and development layer that your ATS doesn't do. Think of it like this: your ATS tracks where candidates are. We help you decide which ones to move forward and what to do with them after they're hired."

**Objection 3 — "Psychometrics don't predict performance"**
- Underlying: They've seen bad psychometric tools or don't trust the methodology.
- Response: "You're right that traditional behavioural assessments often don't — they tend to reward candidates who've had the most opportunities to practice, not the ones with the most potential. That's exactly why we don't do that. We assess five dimensions of potential: adaptability, cognitive agility, emotional intelligence, collaboration, and drive. These predict how someone will learn and grow, not how polished they are today. For graduates with limited work history, that's the right question."

**Objection 4 — "This looks early-stage / it's just a demo"**
- Underlying: Risk aversion. They don't want to bet on something unproven.
- Response: Be honest. "You're right that we're early. What you're seeing is a working product, not a slide deck — but we're not pretending to be a 10-year-old enterprise platform. What we can show you is: the product works, the assessment model is sound, and we're building fast. The question for you is whether the vision — full lifecycle, self-service, equity-centred — is worth being an early partner. Early partners shape the product."

**Objection 5 — "We don't have budget for another tool"**
- Underlying: Cost concern, or they haven't quantified the cost of the current approach.
- Response: "How much does your team spend on manual screening today? If it takes two people a full day to shortlist 200 applicants, that's real cost. How much are you paying per-engagement for assessment changes with your current provider? We're not adding a cost — we're displacing the cost you're already carrying across spreadsheets, manual processes, and bespoke vendor fees."

**Objection 6 — "Our grad program is too small"**
- Underlying: They think the investment doesn't make sense for their volume.
- Response: Depends on the number. If genuinely under 10 hires, they're right — park it, be honest. If 10–30: "That's actually where the pain is sharpest. You don't have a dedicated team of five running this — it's probably one person managing the whole thing across multiple systems. That's exactly who benefits most from having it all in one place."

**Objection 7 — "How is the data secured?"**
- Underlying: Legitimate concern, especially for government and financial services prospects.
- Response: [PLACEHOLDER — This objection cannot be fully addressed until hosting and security architecture decisions are made. Tom to fill in before Dave's first demo. At minimum, Dave needs to know: where data is hosted, encryption approach, and any compliance certifications in progress.]

**Objection 8 — "Can we customise the assessment to our competency framework?"**
- Underlying: This is a buying signal, not a real objection. They're already imagining using it.
- Response: "Yes — and you do it yourself. Open the Assessment Config page — you change the competency labels, the question language for each track, the scoring weights. No change request, no waiting, no extra cost. That's one of the biggest differences between us and Amberjack: what costs them a bespoke engagement is a settings page for us." Then show them the Assessment Config screen in the demo.

- [ ] **Step 2: Commit**

```bash
git add docs/sales/objections.md
git commit -m "docs: add objection handling playbook — 8 common pushbacks with responses"
```

---

### Task 7: Amberjack Battle Card

**Files:**
- Create: `docs/sales/battle-card-amberjack.md`

**Source material to read before writing:**
- `docs/market-research.md` lines 44–132 — the Amberjack analysis
- Paula's domain insights — Amberjack gaps, assessment model, competitive positioning
- `docs/sales/objections.md` (written in Task 6) — objection #1 uses similar content but the battle card goes deeper

- [ ] **Step 1: Write `docs/sales/battle-card-amberjack.md`**

Write the full document:

**Section 1 — "Positioning":**

One sentence: "Amberjack is a managed assessment service. Talent Edge is a self-service recruitment and development platform. They run your assessment for you. We give you the tools to run it yourself — and then connect it to everything that happens after."

**Section 2 — "Side by side":**

A comparison table with columns: Dimension | Amberjack | Talent Edge

| Dimension | Amberjack | Talent Edge |
|---|---|---|
| What they are | Managed assessment service + outsourced recruitment | Self-service assessment and development platform |
| Assessment customisation | Bespoke engagement — costs extra, slow turnaround for any changes | Self-service config — recruiters edit question language, branding, scoring weights directly |
| Assessment model | Digital Mindset, Applied Intellect, Creative Force, Grit (4 dimensions) | Adaptability, Cognitive Agility, Emotional Intelligence, Collaboration, Drive (5 dimensions) |
| Lifecycle coverage | Attract → Select (recruitment only) | Attract → Track Talent (recruitment + development) |
| Keep Warm (offer → start date) | Not covered — Grad-Engage fills this gap for their clients | Built in — automated touchpoint feed |
| ATS | Push Apply (proprietary, not available standalone) | Integrates with PageUp, Workday, Success Factors, Oracle, Springboard, and more |
| Candidate experience | Standard | AI chat assistant during assessment, accessibility-first design, self-service accommodations |
| Screening intelligence | Manual / consultant-led | AI screening summaries, cohort insights, candidate comparison, bulk shortlisting |
| Pricing | Per-engagement bespoke (opaque) | [TBD — to be defined] |
| Service model | High-touch managed service — they do it for you | Self-service platform — your team does it, with the tools to do it well |

**Section 3 — "When we win":**

Bullet list of scenarios where we have the advantage:
- The Program Manager is frustrated by assessment inflexibility — they can't change wording without a change request and a bill
- The company cares about equity and DEI positioning — "assess for potential, not privilege" is a stronger story than Amberjack's model
- There's a Keep Warm gap — they're losing candidates between offer and start date, or they've bolted on Grad-Engage as a separate tool
- They want to connect assessment data to development — Amberjack's data stops at selection
- They value self-service and speed over white-glove service
- Their Amberjack contract is up for renewal (trigger event)

**Section 4 — "When we lose":**

Be honest — these are deals to deprioritise:
- The company wants a fully outsourced managed service — they want someone to run the program for them, not a tool to run it themselves. This is Amberjack's core strength.
- They're mid-contract with Amberjack and there's no trigger event — no pain, no urgency, no budget cycle
- They value "established brand" and enterprise credentials over capability — risk-averse procurement in large corporates
- They need Assessment Centre design and delivery (group exercises, role plays) — we don't cover this yet; Amberjack does

**Section 5 — "Landmines":**

Questions Dave plants early in the conversation that make Amberjack's limitations visible. These work best in discovery, before Amberjack comes up:

1. "Can your current provider let you change assessment wording without a change request?" — If the answer is no, you've established inflexibility before they even think about defending Amberjack.

2. "What happens to your assessment data once someone is hired — does it inform their development plan?" — The answer is almost always "no" or "different team handles that." This frames the lifecycle gap.

3. "How does your current platform handle the period between offer and start date?" — Surfaces the Keep Warm gap. If they say "it doesn't" or "we use Grad-Engage," you've identified a concrete gap.

4. "How much of your assessment configuration can your team do themselves, versus what requires your vendor?" — Forces them to think about self-service vs dependency.

5. "If you wanted to change the competency labels to match your own framework, how would that work today?" — Specific and practical. The answer reveals the bespoke cost and timeline.

`[ENRICH: Paula item #6 — her insider Amberjack review will be the single biggest improvement to this doc. Expect to significantly expand "when we win" and "landmines" sections.]`

- [ ] **Step 2: Commit**

```bash
git add docs/sales/battle-card-amberjack.md
git commit -m "docs: add Amberjack battle card — competitive comparison for Dave"
```

---

### Task 8: Demo Script

**Files:**
- Create: `docs/sales/demo-script.md`

**Source material to read before writing:**
- `docs/demo-guide.md` — the screen-by-screen navigation guide (this tells you WHAT is on each screen)
- `docs/sales/pitch.md` (written in Task 3) — the narrative thread
- `docs/sales/objections.md` (written in Task 6) — likely questions during demo
- `docs/internal/capabilities.md` (written in Task 2) — what's live vs coming
- `docs/sales/battle-card-amberjack.md` (written in Task 7) — competitive points to weave in

**Important:** This is the most complex doc and depends on all others. Write it last in Drop 2.

- [ ] **Step 1: Write `docs/sales/demo-script.md`**

Write the full document. Header explains: "This is what you SAY while you click. The Demo Guide (docs/demo-guide.md) tells you where to click. This doc tells you what story to tell while you're clicking."

**Structure for each screen:**

```markdown
### [Screen Name]

**You're showing:** [One line — what's on screen]

**You say:** [The narrative — 3–5 sentences, conversational]

**The point:** [What pain point this solves or what differentiator this demonstrates]

**If they ask:** [1–2 likely questions with short answers]
```

**Path 1 — Admin (primary demo path):**

Suggested flow and narrative beats. Write 3–5 sentences of Dave-voice narrative for each:

**Screen: Dashboard**
- Showing: The command centre — metrics, funnel, top candidates, cohort insights, lifecycle journey
- Say: This is where Sarah, the program manager, starts her day. One screen — 187 applicants, 142 assessed, 43 shortlisted, 9 offers. Point out the lifecycle banner — 8 stages from Attract to Track Talent. "Most tools show you the first four. We show you all eight." Then highlight the Cohort Intelligence card — "This tells Sarah that Cognitive Agility is the strongest dimension across her cohort, Collaboration is the weakest, and her Finance track is outscoring Technology. That's not a report someone built — it's computed from the live assessment data."
- Point: Single pane of glass, full lifecycle visibility, data-driven cohort insights
- If they ask: "Are those numbers real?" → "This is demo data, but the metrics and insights are computed from the candidate records — same as production."

**Screen: Pipeline kanban**
- Showing: All candidates by stage, search bar, filter buttons
- Say: Walk through the search and filter. "Sarah has 187 applicants. She needs to get to 20 hires. Watch this — filter to High Potential..." Then show bulk shortlisting. "This replaces a full day of Excel screening."
- Point: Screening efficiency, quantifiable time saving
- If they ask: "How are the scores calculated?" → "Five-dimension psychometric assessment — I'll show you the candidate view in a minute."

**Screen: Candidate comparison**
- Showing: Two candidates side-by-side in the comparison drawer
- Say: "Sarah's shortlisted three candidates for the final Finance spot. She selects two, clicks Compare..." Show the grouped bar chart and AI summaries.
- Point: Data-driven decision-making, not gut feel
- If they ask: "Can we compare more than 2?" → "Up to 3 at a time."

**Screen: Candidate profile**
- Showing: Full profile — header, AI summary, radar, timeline, report generation
- Say: "Every candidate has a profile built from their assessment data. The AI screening summary gives Sarah a recommendation in plain English. She can generate a full feedback report with one click — this is the report your candidates are expecting after every assessment."
- Point: AI-assisted screening, automated reporting
- If they ask: "Do candidates see their scores?" → "They see their profile shape — the radar — but not the numbers. Scores are for recruiters."

**Screen: Accessibility flag**
- Showing: The violet badge on a candidate's profile
- Say: "This candidate declared accessibility needs during registration. That flag flows through to every screen — pipeline card, profile. No more digging through registration forms to find out who needs adjustments."
- Point: Accessibility-first design, compliance
- If they ask: "What accommodations do you support?" → "The candidate describes their needs in free text. The system surfaces it — your team decides the adjustment."

**Screen: Assessment config**
- Showing: The settings page — question language, branding, scoring weights
- Say: "This is the screen that would cost you a bespoke engagement with Amberjack. Your team changes it themselves — competency labels, question wording, scoring weights per track, even the branding. No change request. No invoice."
- Point: Self-service differentiator. This is the Amberjack killer slide.
- If they ask: "Can we use our own competency framework?" → "Yes — you type your labels right here."

**Path 2 — Graduate (bonus, show if time allows):**

Shorter — Dave summarises while clicking:

**Screen: Registration**
- Say: "Here's what your candidates see. Registration, career track selection, and importantly — accessibility accommodations. Self-service, not a phone call."

**Screen: Assessment**
- Say: "Five sections, 20 questions. Situational judgement, Likert scales, pattern recognition, emotion recognition. Validated against the five dimensions of potential."
- Point: Rigorous but accessible. No trick questions, no cultural bias.

**Screen: AI Chat**
- Say: "If a candidate has a question during the assessment — 'how long is this?' or 'who sees my results?' — they ask the AI assistant instead of emailing your team."

**Screen: Results**
- Say: "They see their profile shape but not the scores. Clean, respectful, fair."

**Closing line:** "That's the product today. And here's what's coming next —" then refer to the "What's next" section of capabilities.md for the roadmap conversation.

Mark enrichment points:
- `[ENRICH: Paula item #5 — weave in anonymised program examples so Dave can say "imagine you're running a 3-track program with 800 applicants" instead of always using Meridian Group]`
- `[ENRICH: Paula item #3 — deeper assessment type knowledge lets Dave explain the psychometric model with more authority]`

- [ ] **Step 2: Cross-check against demo-guide.md**

Read `docs/demo-guide.md` and confirm every screen Dave might navigate to has a narrative in the demo script. If the demo guide mentions a screen that the script doesn't cover, either add it or explicitly note it as "skip in demo — not a selling point."

- [ ] **Step 3: Commit**

```bash
git add docs/sales/demo-script.md
git commit -m "docs: add demo script — narrative guide for Dave's prospect demos"
```

---

## Confluence Sync Update

### Task 9: Update Sync Pipeline

**Files:**
- Modify: `.github/workflows/sync-docs.yml:6`

- [ ] **Step 1: Update path filter**

Change line 6 from:
```yaml
    paths: [ 'docs/*.md', 'README.md' ]
```
to:
```yaml
    paths: [ 'docs/*.md', 'docs/sales/*.md', 'docs/internal/*.md', 'README.md' ]
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/sync-docs.yml'))" && echo "VALID"
```

Expected: `VALID`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/sync-docs.yml
git commit -m "ci: add docs/sales/ and docs/internal/ to Confluence sync paths"
```

---

## Post-Implementation

After all 9 tasks are complete:

1. Verify all files exist:
```bash
ls docs/internal/paula-briefing.md docs/internal/capabilities.md docs/sales/pitch.md docs/sales/icp.md docs/sales/discovery.md docs/sales/objections.md docs/sales/battle-card-amberjack.md docs/sales/demo-script.md
```

2. Verify no technical jargon leaked into any doc:
```bash
grep -r -i -l "component\|route\|Next\.js\|recharts\|shadcn\|tailwind\|vercel\|tsx\|useState\|localStorage" docs/internal/ docs/sales/ || echo "CLEAN"
```
Note: "Vercel" is allowed only in the demo link URL, not in prose descriptions.

3. Push to main to trigger Confluence sync.
