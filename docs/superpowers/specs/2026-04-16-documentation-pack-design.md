# Documentation Pack — Design Spec

**Date:** 2026-04-16
**Context:** Talent Edge has a working demo with ~20 shipped features but no sales enablement material. Dave demos in ~4 weeks. Paula has been tasked with 6 domain-knowledge homework items but needs context on what already exists before she writes. This spec defines the full documentation pack across three sequenced drops.

---

## Audiences

**Paula (domain expert, former Amberjack):** Needs to see what the platform does today so she can write her 6 homework items without duplicating existing material. Non-technical. Reads in Confluence.

**Dave (sales):** Needs to demo confidently and handle objections. Needs a script, not a feature list. Non-technical. Reads in Confluence.

Neither audience reads GitHub, commit logs, or anything with technical language.

---

## File structure

```
docs/
  internal/
    paula-briefing.md        # Drop 1
    capabilities.md          # Drop 1
  sales/
    pitch.md                 # Drop 2
    demo-script.md           # Drop 2
    icp.md                   # Drop 2
    discovery.md             # Drop 2
    objections.md            # Drop 2
    battle-card-amberjack.md # Drop 2
```

Existing docs (`docs/philosophy.md`, `docs/market-research.md`, `docs/demo-guide.md`) are unchanged — they are product/technical docs. `internal/` is for people building or advising on the product. `sales/` is for people selling it.

---

## Drop 1 — Unblock Paula and Dave (this week)

### 1. `docs/internal/paula-briefing.md`

**Purpose:** Give Paula context on what already exists so she doesn't duplicate work, and map each of her 6 homework items to what we already know and what gaps remain.

**Sections:**

1. **What Talent Edge is today** — 3–4 sentences. Working demo on Vercel, not a concept. Two personas (candidate + admin). Full assessment flow, pipeline, candidate profiles. Link to live demo.

2. **What we've already captured from you** — Summary of documented insights from earlier conversations:
   - The 5 pain points (screening, disability management, system setup, engagement, scheduling)
   - Amberjack gaps (assessment inflexibility, not self-service, bespoke costs)
   - ATS landscape (PageUp, Springboard, Workday, Success Factors, Oracle + 10 more)
   - Lifecycle model (Attract → Track Talent, recruitment vs development halves)
   - Grad-Engage as the Keep Warm competitor to stamp out
   - Assessment philosophy (potential not privilege, 5-dimension model)
   - Explicit note: "You don't need to re-cover these unless you want to correct or expand them."

3. **Your 6 items — where they land** — Table mapping each homework item to:
   - What we already have that's relevant (with specific references)
   - What format works (dot points fine, no polish needed)
   - What it unlocks downstream

   | Item | What we already have | Focus your effort on | What it unlocks |
   |---|---|---|---|
   | 1. End-to-end process map | Lifecycle model (8 stages) documented | The detail within each stage — handoffs, decision points, who does what, employer vs candidate side | Validates our capabilities page; gaps become roadmap items |
   | 2. Tools & systems | ATS landscape documented (15 platforms) | The non-ATS tools: scheduling tools, spreadsheets, email templates, reporting, video platforms | Strengthens integration story and competitive positioning |
   | 3. Assessment types | 5-dimension model documented; question types mapped | The methods beyond psychometric — video interview, group exercises, case studies, Assessment Centres. What each measures, how scored, what data it produces | Product IP for future features; deepens the demo script |
   | 4. Pain points | Top 5 pain points captured | Expand to 10+. Split: what clients complained about vs what was painful on the delivery/ops side. The manual, slow, error-prone stuff | Directly feeds objection handling and discovery questions |
   | 5. Real program examples | One demo scenario (Meridian Group, 20 hires, Finance) | 3–5 anonymised real examples at different scales — small single-stream vs large multi-stream with different assessment paths | Builds realistic demo scenarios; gives Dave concrete stories |
   | 6. Amberjack tech review | Gaps documented (inflexibility, bespoke costs, not self-service) | Go deeper — what did their platform actually do well? Where did it fall short technically? What would you build differently? | This is the single biggest input to the Amberjack battle card |

4. **The demo today** — Link to `capabilities.md`. "Read this to see what the platform already does. Your homework should fill in what's around and beyond it."

**Tone:** Direct, respectful of her time, no jargon.
**Length:** ~1.5 pages.

---

### 2. `docs/internal/capabilities.md`

**Purpose:** The single page both Paula and Dave read to understand what the platform does today and what's coming. Updated as features ship.

**Sections:**

1. **Header** — "What's in Talent Edge" + date last updated + link to live demo.

2. **Capabilities by lifecycle stage** — One table per stage. Three columns: capability name, plain-English description (one sentence), status.

   Status key:
   - ✅ Live — in the Vercel demo today
   - 🔜 Next — has a spec or implementation plan
   - 📋 Planned — in the backlog, not yet specced

   Stages follow Paula's lifecycle model: Attract, Assess, Select, Offer, Keep Warm, Onboard, Develop, Track Talent.

   **Capabilities to include** (derived from git history, backlog, and demo guide):

   **Attract:**
   | Capability | What it does | Status |
   |---|---|---|
   | Program landing page | Candidates see program info and choose a career track (Finance, Technology, People & Culture) | ✅ Live |
   | Persona selection | Demo switches between candidate and recruiter views | ✅ Live |

   **Assess:**
   | Capability | What it does | Status |
   |---|---|---|
   | 5-dimension psychometric assessment | 20 scenario-based questions measuring Adaptability, Cognitive Agility, Emotional Intelligence, Collaboration, and Drive | ✅ Live |
   | Multiple question types | Situational judgement, Likert scales, forced choice, sequence puzzles, emotion recognition | ✅ Live |
   | Track-specific scenarios | Questions adapt wording based on the candidate's chosen career track | ✅ Live |
   | AI candidate chat assistant | Answers candidate FAQs during the assessment — duration, what's measured, accessibility, data privacy | ✅ Live |
   | Accessibility accommodations | Candidate self-declares adjustment needs at registration; surfaces to recruiters automatically | ✅ Live |
   | Self-service assessment config | Recruiters edit question language, client branding, and scoring weights without developer involvement | ✅ Live |
   | Score percentile display | Shows "Top X% of cohort" on pipeline cards and candidate profiles | 🔜 Next |

   **Select:**
   | Capability | What it does | Status |
   |---|---|---|
   | Pipeline kanban board | All candidates shown by stage: Applied → Assessed → Shortlisted → Interview → Offer → Hired | ✅ Live |
   | Candidate search and filter | Search by name/university/degree; filter by score band (High Potential 80+, Emerging 65–79) | ✅ Live |
   | AI screening summaries | Auto-generated recommendation on each candidate profile based on dimension scores | ✅ Live |
   | Feedback report generation | One-click structured feedback report covering scores, strengths, development areas, next steps | ✅ Live |
   | Bulk shortlisting | Select multiple assessed candidates and shortlist them in one action | ✅ Live |
   | Candidate comparison panel | Compare 2–3 candidates side-by-side: dimension scores, AI summaries | ✅ Live |
   | Cohort intelligence insights | Dashboard card showing strongest/weakest dimensions across the cohort and track comparisons | ✅ Live |
   | Accessibility flag visibility | Candidates who requested accommodations show a badge on their pipeline card and profile | ✅ Live |
   | Pipeline stage advancement | Move any candidate to the next stage with one click | ✅ Live |
   | Interview scorecard | Rate interview candidates on Communication, Cultural Fit, Problem Solving, Overall Impression with notes | 📋 Planned |
   | Bulk reject with email preview | Select and reject multiple candidates with an editable email template | 📋 Planned |
   | Candidate notes | Add timestamped notes to any candidate profile | 📋 Planned |

   **Select** (continued):
   | Capability | What it does | Status |
   |---|---|---|
   | Self-booking interview scheduling | Candidates pick from available time slots; confirmation sent automatically | ✅ Live |

   **Offer:**
   | Capability | What it does | Status |
   |---|---|---|
   | Offer acceptance tracking | Track pending/accepted/declined offers with decline reasons | 📋 Planned |

   **Keep Warm:**
   | Capability | What it does | Status |
   |---|---|---|
   | Automated touchpoint feed | Timeline of communications between offer acceptance and start date — welcome video, countdown, onboarding checklist | ✅ Live |

   **Onboard / Develop / Track Talent:**
   | Capability | What it does | Status |
   |---|---|---|
   | Development goals | Active goals with status and due dates for hired candidates | ✅ Live |
   | AI-generated development plan | Auto-generate development goals from assessment scores — weakest dimensions get targeted activities | 📋 Planned |
   | Program analytics | Pipeline funnel, score distributions, time-in-stage averages, score band breakdowns | 📋 Planned |

   **Platform-wide:**
   | Capability | What it does | Status |
   |---|---|---|
   | ATS integrations | PageUp and Workday shown as connected; Success Factors, Oracle, Springboard, Grad-Engage listed as available | ✅ Live |
   | Dashboard command centre | Metrics, funnel visualisation, top candidates, recent activity, integrations — all in one view | ✅ Live |
   | Full lifecycle journey view | Visual banner showing all 8 stages with live counts for recruitment stages | ✅ Live |
   | Candidate profiles | Name, university, degree, scores, radar chart, assessment timeline, AI summary, reports | ✅ Live |

3. **What's next** — The 🔜 and 📋 items in a short prioritised list. Sourced from `backlog.md`. Plain English, no technical detail.

4. **Maintenance note** (bottom of file) — "This page is updated each time a feature ships. If something is missing, check with Tom."

**Tone:** Factual, scannable. No technical language. No component names, route paths, or library references.
**Length:** ~2 pages.

---

## Drop 2 — Sales enablement pack (week 2)

### 3. `docs/sales/pitch.md`

**Purpose:** The words Dave says. Three versions for different contexts.

**Sections:**

1. **30-second pitch** — One problem statement, one positioning statement, one differentiator. The version for "so what does your company do?" at a networking event.

2. **2-minute pitch** — Expands: the problem (fragmented tools, manual screening, assessment-to-development disconnect), what Talent Edge does (full lifecycle, AI-powered psychometrics, self-service config), why it's different (self-service vs bespoke, connected lifecycle vs selection-only, equity-centred).

3. **10-minute pitch** — Full first-meeting narrative. Walks through the lifecycle model stage by stage, names pain points at each stage, shows how Talent Edge addresses each one. Ends with "want to see it?" to transition into demo.

**Enrichment markers:** `[ENRICH: Paula item #4 pain points]` in the 10-minute pitch where real client complaints will replace generic statements.

**Tone:** Spoken language. Dave reads this and rehearses out loud.
**Length:** ~2 pages.

---

### 4. `docs/sales/demo-script.md`

**Purpose:** What to say while clicking through the demo. Story, not navigation.

**Sections:**

For each screen: what you're showing (one line), what you say (the narrative), the point you're making (pain point solved or differentiator demonstrated).

Two paths:
1. **Admin path (primary)** — Dave demos as the recruiter. This is the selling path. Covers: Dashboard → Pipeline (search, filter, bulk shortlist, compare, advance) → Candidate profile (AI summary, report, radar, accessibility) → Assessment config.
2. **Graduate path (bonus)** — Show candidate experience if time allows. Covers: Registration → Assessment → Results → Thank You.

Each screen includes an "if they ask..." sidebar with likely questions and short answers.

**Enrichment markers:** `[ENRICH: Paula item #5 real program examples]` where anonymised examples can add variety beyond the Meridian Group demo scenario.

**Tone:** Conversational. "Here's where Sarah starts her day..." not "Navigate to /dashboard."
**Length:** ~3 pages.

---

### 5. `docs/sales/icp.md`

**Purpose:** Who Dave should be calling and what each buyer cares about.

**Sections:**

1. **Ideal customer profile** — Mid-to-large Australian employers with structured annual grad programs (10–100 hires). Already using an ATS. Frustrated by assessment inflexibility or tool fragmentation. Financial services, professional services, government, resources sectors.

2. **Buyer personas table:**

   | Persona | Typical title | What they care about | What resonates |
   |---|---|---|---|
   | The Program Manager | Graduate Program Manager / Early Careers Lead | Day-to-day pain — screening time, scheduling, manual handoffs | "Bulk shortlisting replaces a full day of Excel screening" |
   | The HR Director | Head of Talent / HR Director | Equity, DEI reporting, program ROI, retention | "Assess for potential, not privilege" + lifecycle tracking |
   | The Procurement Buyer | Head of Procurement / IT | Cost vs incumbent, integration risk, data security | ATS integrations, self-service (no bespoke costs) |
   | The Grad (influencer) | Recent graduate / program alumni | Candidate experience, fairness, accessibility | AI chat, accommodations, transparent process |

3. **Disqualifiers** — Who not to pursue: fewer than 10 grad hires (too small), mid-contract with Amberjack on a multi-year deal (timing), no structured program (education sale, not product sale).

**Tone:** Practical. This is a targeting guide, not a strategy document.
**Length:** ~1.5 pages.

---

### 6. `docs/sales/discovery.md`

**Purpose:** The questions Dave asks in a first meeting to qualify and shape the demo.

**Sections:**

Questions grouped by what they qualify:

**Program shape:**
- How many graduates do you hire annually?
- Single stream or multiple tracks with different assessment paths?
- How many applicants do you typically receive?
- *Why:* Sizes the opportunity. Under 10 hires = disqualifier. Multiple tracks = show track-specific scenarios in demo.

**Current stack:**
- What ATS are you on?
- What do you use for psychometric assessment today?
- How many separate systems are involved from application to day-one?
- *Why:* Identifies integration opportunity and the "too many systems" pain point.

**Pain:**
- What's the most manual part of your current process?
- How long does initial screening take your team?
- What happens between offer acceptance and start date?
- *Why:* Surfaces the pain that maps to our features. "Manual screening" → bulk shortlisting. "Nothing happens post-offer" → Keep Warm.

**Decision:**
- When does your next intake cycle start?
- Who else is involved in this decision?
- Are you mid-contract with your current assessment provider?
- *Why:* Qualifies timing and buying process. Mid-contract with years remaining = park it.

Each question includes a one-line note on what a good answer vs bad answer sounds like.

**Enrichment markers:** `[ENRICH: Paula item #4]` — her real pain points will suggest additional discovery questions.

**Tone:** Practical. Dave prints this and has it next to him in meetings.
**Length:** ~1 page.

---

### 7. `docs/sales/objections.md`

**Purpose:** When they push back, here's what Dave says.

**Format per objection:**
- **They say:** [the objection]
- **What's really going on:** [the underlying concern]
- **You say:** [the response]

**Objections in v1:**

1. **"We already use Amberjack"** — They think switching is risky. Response: acknowledge Amberjack's strengths, position on self-service config and lifecycle coverage as gaps Amberjack doesn't fill.

2. **"We just renewed our ATS"** — They think you're an ATS replacement. Response: "We integrate with your ATS — PageUp, Workday, and others. We're the assessment and development layer on top."

3. **"Psychometrics don't predict performance"** — Scepticism about assessment validity. Response: "Traditional behavioural assessments don't. Potential-based assessment does — it measures the qualities that predict long-term performance regardless of background."

4. **"This looks early-stage / it's just a demo"** — Risk aversion. Response: acknowledge honestly, position the demo as proof of speed and vision, point to the roadmap.

5. **"We don't have budget for another tool"** — Cost concern. Response: "How much does your team spend on manual screening today? How many hours per intake cycle?" Reframe as cost displacement.

6. **"Our grad program is too small"** — They think it's not worth the investment. Response: depends on size. Under 10 = genuinely too small, park it. 10–30 = "that's exactly where the pain is sharpest — you don't have a dedicated team, so the tools need to do more."

7. **"How is the data secured?"** — Legitimate concern. Response: [PLACEHOLDER — cannot be written until hosting and security architecture decisions are made. Flag for Tom to fill in before Dave's first demo.]

8. **"Can we customise the assessment to our competency framework?"** — This is a buying signal. Response: "Yes — self-service. You configure question language, competency labels, and scoring weights yourself. Show them the Assessment Config screen."

**Enrichment markers:** `[ENRICH: Paula item #4]` on pain-based objections, `[ENRICH: Paula item #6]` on Amberjack-specific objections.

**Tone:** Dave's voice, not corporate.
**Length:** ~2 pages.

---

### 8. `docs/sales/battle-card-amberjack.md`

**Purpose:** Head-to-head comparison for deals where Amberjack is the incumbent or competitor.

**Sections:**

1. **Positioning** — One sentence: what we are that they aren't.

2. **Comparison table:**

   | Dimension | Amberjack | Talent Edge |
   |---|---|---|
   | Assessment customisation | Bespoke — costs extra, slow turnaround | Self-service — recruiters configure directly |
   | Lifecycle coverage | Selection only (Attract → Select) | Full lifecycle (Attract → Track Talent) |
   | Keep Warm phase | Not covered (Grad-Engage wins here) | Built in — automated touchpoints post-offer |
   | ATS integration | Push Apply (proprietary, not standalone) | PageUp, Workday + 4 more |
   | Candidate experience | Standard | AI chat assistant, accessibility-first design |
   | Assessment model | Digital Mindset, Applied Intellect, Creative Force, Grit | Adaptability, Cognitive Agility, EI, Collaboration, Drive |
   | Pricing model | Per-engagement bespoke | [TBD] |

3. **When we win** — Program managers frustrated by inflexibility; companies wanting self-service; companies that care about equity/DEI; companies where Grad-Engage is filling a gap Amberjack should own.

4. **When we lose** — Companies wanting fully outsourced managed service (Amberjack's strength); companies mid-contract with no trigger event; companies that value "established brand" over capability.

5. **Landmines to plant** — Questions Dave asks early that expose Amberjack's weaknesses:
   - "Can your current provider let you change assessment wording without a change request?"
   - "What happens to your assessment data once someone is hired — does it inform their development plan?"
   - "How does your current platform handle the period between offer and start date?"

**Enrichment markers:** `[ENRICH: Paula item #6]` throughout — this is the doc that benefits most from her insider review.

**Tone:** Competitive but honest. Don't trash Amberjack — acknowledge their strengths and position where we're different.
**Length:** ~2 pages.

---

## Drop 3 — Enrichment pass (weeks 3–4)

Not new docs. A targeted editing pass as Paula's homework items arrive.

| Paula's item | Primary destination | What changes |
|---|---|---|
| 1. End-to-end process map | `capabilities.md` | Validates stage coverage; gaps become 📋 Planned items |
| 2. Tools & systems | `battle-card-amberjack.md` + `objections.md` | Real tool names strengthen the integration and replacement narratives |
| 3. Assessment types | `pitch.md` (10-min) + `demo-script.md` | Deeper assessment knowledge lets Dave explain the model with authority |
| 4. Pain points | `objections.md` + `discovery.md` | Real client complaints become objection responses; real ops pain becomes discovery questions. Biggest single upgrade. |
| 5. Real program examples | `demo-script.md` + `pitch.md` | Anonymised examples replace generic "a typical program" language. Dave can reference concrete scenarios. |
| 6. Amberjack tech review | `battle-card-amberjack.md` | Landmines, win/lose scenarios, and comparison table all get insider detail. Highest-value single input. |

Process: as each item arrives, one editing pass per doc it touches. No structural changes — v1 docs are designed with enrichment markers already placed.

---

## Confluence sync update

Update `.github/workflows/sync-docs.yml` path filter to include all doc folders:

```yaml
paths: [ 'docs/*.md', 'docs/sales/*.md', 'docs/internal/*.md', 'README.md' ]
```

Paula and Dave read everything in Confluence, never in GitHub.

---

## Out of scope

- Pricing strategy or packaging — business decision, not a documentation task
- Public-facing marketing site or Docusaurus — revisit in 6–12 months when there's public content or partner integration docs
- Revisions to existing docs (philosophy.md, market-research.md, demo-guide.md) — they stay as-is
- Security/hosting documentation — needs real infrastructure decisions first

---

## Success criteria

- Paula receives her briefing and capabilities page this week and can start writing without asking "what do you already have?"
- Dave has a complete (if v1) sales pack 2 weeks before his first demo
- Every doc syncs to Confluence automatically on merge to main
- No technical language in any doc that Paula or Dave will read
