# Paula Feedback Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address all five pain points and strategic insights raised by Paula (grad recruitment SME) by building five targeted demo features across the dashboard, pipeline, and assessment flows.

**Architecture:** Each feature is self-contained. No shared state across features. Dashboard additions are server components importing static data. Assessment additions are client components using existing persona context. Pipeline scheduling is a local client-component modal (no router dependency).

**Tech Stack:** Next.js 16 App Router, Tailwind v4, lucide-react, shadcn/ui (Card, Button, Badge already present), existing `lib/data/program.ts` + `lib/data/candidates.ts` for counts.

---

## Paula's comments → Features map

| Paula comment | Feature |
|---|---|
| Manual screening, pipeline visibility | Task 1: Lifecycle Journey banner on Dashboard |
| Disability/neurodiversity management | Task 3: Accessibility accommodation in Registration |
| AI chatbot "should be standard" | Task 2: Candidate chat widget on Assessment |
| Applicant engagement / feedback reports | Task 2 (FAQ covers this) |
| Scheduling still mostly manual | Task 4: Self-booking scheduling on Pipeline |
| ATS systems need configuration | Task 5: Integrations panel on Dashboard |
| Post-hire dev = as important as recruitment | Task 1 (lifecycle shows full journey) |
| "Assess for potential, not for privilege" | Task 3 (hero text update in Registration) |
| Amberjack not agile/self-service | Task 5 (config teaser) |

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/dashboard/LifecycleJourney.tsx` | Create | Full Attract→Track Talent banner with phase colouring |
| `components/dashboard/IntegrationsPanel.tsx` | Create | ATS connected systems + assessment config teaser |
| `components/assessment/ChatWidget.tsx` | Create | Floating FAQ chat button for candidates |
| `components/pipeline/ScheduleModal.tsx` | Create | Self-booking time slot modal |
| `app/dashboard/page.tsx` | Modify | Add LifecycleJourney + IntegrationsPanel |
| `components/assessment/AssessmentShell.tsx` | Modify | Add ChatWidget |
| `components/assessment/RegistrationStep.tsx` | Modify | Add accessibility section + potential-not-privilege hero text |
| `lib/data/assessment.ts` | Modify | Add `accessibilityNeeds?: string` to RegistrationData |
| `components/pipeline/CandidateCard.tsx` | Modify | Add Schedule Interview hover CTA for Interview-stage candidates |

---

### Task 1: Lifecycle Journey banner on Dashboard

**Files:**
- Create: `components/dashboard/LifecycleJourney.tsx`
- Modify: `app/dashboard/page.tsx` (add after the `<div>` heading block, before `<MetricsRow />`)

Paula explicitly described the full journey: *Attract → Assess → Select → Offer → Keep Warm → Onboard → Develop → Track Talent*, with Recruitment in one colour and Development in another. This banner makes it visible on the admin dashboard, showing Talent Edge covers the full arc — not just selection.

- [ ] **Step 1: Create `components/dashboard/LifecycleJourney.tsx`**

```tsx
// components/dashboard/LifecycleJourney.tsx
import { pipelineCounts } from "@/lib/data/program";

type LifecycleStage = {
  label: string;
  phase: "recruitment" | "development";
  stat: string;
  live: boolean;
};

const stages: LifecycleStage[] = [
  { label: "Attract",      phase: "recruitment", stat: "232 reached",                              live: true  },
  { label: "Assess",       phase: "recruitment", stat: `${pipelineCounts.Assessed} scored`,        live: true  },
  { label: "Select",       phase: "recruitment", stat: `${pipelineCounts.Shortlisted} shortlisted`,live: true  },
  { label: "Offer",        phase: "recruitment", stat: `${pipelineCounts.Offer} made`,             live: true  },
  { label: "Keep Warm",    phase: "development", stat: `${pipelineCounts.Hired} active`,           live: true  },
  { label: "Onboard",      phase: "development", stat: "Coming soon",                              live: false },
  { label: "Develop",      phase: "development", stat: "Coming soon",                              live: false },
  { label: "Track Talent", phase: "development", stat: "Coming soon",                              live: false },
];

export function LifecycleJourney() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Graduate Journey</h2>
          <p className="text-xs text-slate-400 mt-0.5">End-to-end lifecycle — from attraction to talent tracking</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Recruitment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            Development
          </span>
        </div>
      </div>

      <div className="flex items-stretch gap-0">
        {stages.map((stage, i) => {
          const isRecruitment = stage.phase === "recruitment";
          const isLast = i === stages.length - 1;

          const activeBg    = isRecruitment ? "bg-indigo-600"  : "bg-violet-600";
          const activeText  = "text-white";
          const activeStat  = isRecruitment ? "text-indigo-200" : "text-violet-200";
          const inactiveBg  = "bg-slate-50";
          const inactiveText= "text-slate-400";
          const inactiveStat= "text-slate-300";

          return (
            <div key={stage.label} className="flex items-stretch flex-1 min-w-0">
              <div
                className={`flex-1 rounded-lg px-2 py-3 flex flex-col items-center justify-center text-center space-y-1 ${
                  stage.live ? `${activeBg} ${activeText}` : `${inactiveBg} ${inactiveText}`
                }`}
              >
                <span className="text-xs font-semibold leading-tight">{stage.label}</span>
                <span className={`text-[10px] leading-tight ${stage.live ? activeStat : inactiveStat}`}>
                  {stage.stat}
                </span>
              </div>
              {!isLast && (
                <div className="flex items-center px-0.5">
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" className="text-slate-300">
                    <path d="M1 1l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add LifecycleJourney to dashboard**

In `app/dashboard/page.tsx`, add the import and insert the component. The current file starts:
```tsx
import { AppShell } from "@/components/layout/AppShell";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
```

Replace those two import lines with:
```tsx
import { AppShell } from "@/components/layout/AppShell";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { LifecycleJourney } from "@/components/dashboard/LifecycleJourney";
```

Then inside the `<div className="space-y-6">`, insert `<LifecycleJourney />` immediately after the heading `<div>` block and before `<MetricsRow />`. The heading block ends at `</div>` (the one containing the `<h1>` and `<p>` on lines 27–31). So the structure becomes:

```tsx
        <div>
          <h1 className="text-xl font-bold text-slate-800">Program Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Meridian Group · 2026 Graduate Intake · Last updated just now</p>
        </div>

        <LifecycleJourney />

        <MetricsRow />
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/tomklimovski/Github/talent-edge && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/LifecycleJourney.tsx app/dashboard/page.tsx
git commit -m "feat: add full lifecycle journey banner to dashboard"
```

---

### Task 2: AI candidate chat widget on Assessment

**Files:**
- Create: `components/assessment/ChatWidget.tsx`
- Modify: `components/assessment/AssessmentShell.tsx` (add ChatWidget at end of returned JSX)

Paula said an AI chatbot answering candidate questions "should be standard and included in the platform." This widget sits fixed in the bottom-right of the assessment pages, expanding to show pre-answered FAQs. It is a pure demo UI — no actual AI call needed.

The widget has two states: `closed` (shows a floating button) and `open` (shows a panel with FAQ items). Each FAQ can be expanded to reveal the answer.

- [ ] **Step 1: Create `components/assessment/ChatWidget.tsx`**

```tsx
// components/assessment/ChatWidget.tsx
"use client";
import { useState } from "react";
import { MessageCircle, X, ChevronDown, ChevronUp } from "lucide-react";

type FAQ = { q: string; a: string };

const faqs: FAQ[] = [
  {
    q: "How long does this take?",
    a: "The assessment takes approximately 15–20 minutes. You can complete it in one sitting — there is no time limit per question.",
  },
  {
    q: "What does this measure?",
    a: "We assess your potential across five dimensions: Adaptability, Cognitive Agility, Emotional Intelligence, Collaboration, and Drive. We do not assess grades, background, or work experience.",
  },
  {
    q: "Will I receive feedback?",
    a: "A personalised feedback report will be sent to you within 5 business days of the program team reviewing your results.",
  },
  {
    q: "I need accessibility adjustments.",
    a: "Please indicate your needs in the registration step at the start of the assessment. Our team will contact you within 1 business day to discuss how we can support you.",
  },
  {
    q: "Who sees my results?",
    a: "Your results are shared only with the Meridian Group graduate recruitment team. They will not be shared with third parties.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E1B4B] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Got questions?</p>
              <p className="text-xs text-indigo-300">Tap a question for an instant answer</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          {/* FAQ list */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm text-slate-700 font-medium">{faq.q}</span>
                  {expanded === i ? (
                    <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {expanded === i && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">Powered by Talent Edge AI · Meridian Group 2026</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open candidate assistant"}
        className="w-13 h-13 rounded-full bg-[#1E1B4B] hover:bg-indigo-800 text-white shadow-lg flex items-center justify-center transition-colors"
        style={{ width: 52, height: 52 }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Add ChatWidget to AssessmentShell**

Read `components/assessment/AssessmentShell.tsx`. It currently ends with:
```tsx
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
```

Add the import and place `<ChatWidget />` after `</main>` and before the closing `</div>`:

Add to imports at top of file:
```tsx
import { ChatWidget } from "@/components/assessment/ChatWidget";
```

Replace the end of the returned JSX:
```tsx
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </main>

      <ChatWidget />
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 4: Manual test**

Start dev server (`npm run dev`). Navigate to `http://localhost:3000`, click Graduate, complete registration. Confirm the floating chat button appears in bottom-right. Click it — the FAQ panel should open. Click a question — answer should expand. Click another — previous collapses.

- [ ] **Step 5: Commit**

```bash
git add components/assessment/ChatWidget.tsx components/assessment/AssessmentShell.tsx
git commit -m "feat: add AI candidate chat FAQ widget to assessment flow"
```

---

### Task 3: Accessibility accommodation + "potential not privilege" in Registration

**Files:**
- Modify: `lib/data/assessment.ts` (add `accessibilityNeeds?: string` to `RegistrationData`, add to `defaultRegistration`)
- Modify: `components/assessment/RegistrationStep.tsx` (add accessibility section + update hero text)

Paula spent significant time on disability/neurodiversity management — currently handled manually by email or phone. This task adds a self-service accommodation request step to the registration form, and updates the hero copy to reflect the "assess for potential, not for privilege" philosophy Paula validated.

- [ ] **Step 1: Update `RegistrationData` in `lib/data/assessment.ts`**

Find this block (lines 70–84):
```typescript
export type RegistrationData = {
  name: string;
  email: string;
  university: string;
  degree: string;
  track: Track;
};

export const defaultRegistration: RegistrationData = {
  name: "Jordan Lee",
  email: "jordan.lee@student.unimelb.edu.au",
  university: "University of Melbourne",
  degree: "B. Commerce (Finance & Economics)",
  track: "finance",
};
```

Replace with:
```typescript
export type RegistrationData = {
  name: string;
  email: string;
  university: string;
  degree: string;
  track: Track;
  accessibilityNeeds?: string;
};

export const defaultRegistration: RegistrationData = {
  name: "Jordan Lee",
  email: "jordan.lee@student.unimelb.edu.au",
  university: "University of Melbourne",
  degree: "B. Commerce (Finance & Economics)",
  track: "finance",
  accessibilityNeeds: "",
};
```

- [ ] **Step 2: Update `RegistrationStep.tsx`**

Replace the entire file content with:

```tsx
// components/assessment/RegistrationStep.tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackLabels, type RegistrationData, type Track } from "@/lib/data/assessment";
import { GraduationCap, ArrowRight, Accessibility } from "lucide-react";

type Props = {
  defaultData: RegistrationData;
  onNext: (data: RegistrationData) => void;
};

const tracks: Track[] = ["finance", "technology", "people-culture"];

const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

export function RegistrationStep({ defaultData, onNext }: Props) {
  const [data, setData] = useState<RegistrationData>(defaultData);
  const [needsAdjustments, setNeedsAdjustments] = useState(
    Boolean(defaultData.accessibilityNeeds)
  );

  function set(field: keyof RegistrationData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAdjustments(checked: boolean) {
    setNeedsAdjustments(checked);
    if (!checked) {
      setData((prev) => ({ ...prev, accessibilityNeeds: "" }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
          <GraduationCap className="text-indigo-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome to your Talent Edge Assessment</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          This 15-minute assessment measures your <strong className="text-slate-700">potential</strong> — not your grades, background, or connections.
          We assess for potential, not privilege. There are no right answers. Just be yourself.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="reg-name" className="text-xs font-medium text-slate-600">Full name</label>
              <input
                id="reg-name"
                autoComplete="name"
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-xs font-medium text-slate-600">Email address</label>
              <input
                id="reg-email"
                autoComplete="email"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-university" className="text-xs font-medium text-slate-600">University</label>
            <input
              id="reg-university"
              autoComplete="organization"
              value={data.university}
              onChange={(e) => set("university", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-degree" className="text-xs font-medium text-slate-600">Degree</label>
            <input
              id="reg-degree"
              value={data.degree}
              onChange={(e) => set("degree", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Track selector */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Career track</span>
            <div className="grid grid-cols-3 gap-2">
              {tracks.map((track) => (
                <button
                  type="button"
                  key={track}
                  onClick={() => set("track", track)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors text-center ${
                    data.track === track
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {trackLabels[track]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility accommodations */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <Accessibility size={16} className="text-indigo-500" />
            Accessibility &amp; Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="reg-accessibility"
              checked={needsAdjustments}
              onChange={(e) => toggleAdjustments(e.target.checked)}
              className="mt-0.5 accent-indigo-600"
            />
            <span className="text-sm text-slate-600">
              I require adjustments or accommodations to complete this assessment
              <span className="block text-xs text-slate-400 mt-0.5">
                e.g. extended time, screen reader support, neurodiversity accommodations
              </span>
            </span>
          </label>

          {needsAdjustments && (
            <div className="space-y-2">
              <label htmlFor="reg-accessibility-detail" className="text-xs font-medium text-slate-600">
                Please describe your requirements
              </label>
              <textarea
                id="reg-accessibility-detail"
                rows={3}
                value={data.accessibilityNeeds ?? ""}
                onChange={(e) => set("accessibilityNeeds", e.target.value)}
                placeholder="e.g. I have dyslexia and would benefit from extended time on reading-heavy questions."
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                Our team will review your request and contact you within 1 business day before the assessment begins.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => onNext(data)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          Begin Assessment
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors. `accessibilityNeeds` is optional so no consumer of `RegistrationData` needs updating.

- [ ] **Step 4: Manual test**

Navigate to `/assessment`. Registration page should:
- Show updated hero: "We assess for potential, not privilege."
- Show new "Accessibility & Adjustments" card below the main form
- Checking the checkbox should reveal the textarea and blue confirmation notice
- Unchecking should hide textarea and clear the value

- [ ] **Step 5: Commit**

```bash
git add lib/data/assessment.ts components/assessment/RegistrationStep.tsx
git commit -m "feat: add accessibility accommodation section and potential-not-privilege messaging to registration"
```

---

### Task 4: Self-booking scheduling on Pipeline

**Files:**
- Create: `components/pipeline/ScheduleModal.tsx`
- Modify: `components/pipeline/CandidateCard.tsx` (add hover CTA + modal for Interview-stage candidates)

Paula flagged scheduling as a major time sink. This task adds a self-booking UI to the pipeline — Interview-stage candidates get a "Schedule Interview" hover action, which opens a modal with available time slots. The modal is static demo UI (no actual booking backend). It shows the self-service booking concept.

- [ ] **Step 1: Create `components/pipeline/ScheduleModal.tsx`**

```tsx
// components/pipeline/ScheduleModal.tsx
"use client";
import { useState } from "react";
import { X, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  candidateName: string;
  onClose: () => void;
};

const slots = [
  { date: "Mon 14 Apr", time: "10:00 AM", spots: 2 },
  { date: "Mon 14 Apr", time: "2:30 PM",  spots: 1 },
  { date: "Tue 15 Apr", time: "9:00 AM",  spots: 3 },
  { date: "Tue 15 Apr", time: "11:30 AM", spots: 2 },
  { date: "Wed 16 Apr", time: "1:00 PM",  spots: 4 },
];

export function ScheduleModal({ candidateName, onClose }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);

  function handleBook() {
    if (selected !== null) setBooked(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1E1B4B] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Schedule Interview</p>
            <p className="text-xs text-indigo-300 mt-0.5">{candidateName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {booked ? (
          <div className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={28} />
              </div>
            </div>
            <p className="text-base font-semibold text-slate-800">Interview Scheduled</p>
            <p className="text-sm text-slate-500">
              {candidateName} has been sent a calendar invite for{" "}
              <strong>{slots[selected!].date} at {slots[selected!].time}</strong>.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full mt-2">
              Done
            </Button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={13} />
              <span>Select an available slot — candidate will self-confirm</span>
            </div>

            <div className="space-y-2">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                    selected === i
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                  }`}
                >
                  <span className="font-medium">{slot.date} · {slot.time}</span>
                  <span className={`text-xs ${selected === i ? "text-indigo-500" : "text-slate-400"}`}>
                    {slot.spots} spot{slot.spots !== 1 ? "s" : ""} left
                  </span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleBook}
              disabled={selected === null}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
            >
              Send Calendar Invite
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `components/pipeline/CandidateCard.tsx`**

Current file:
```tsx
// components/pipeline/CandidateCard.tsx
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import { Clock, Send } from "lucide-react";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="group relative">
      <Link href={`/candidates/${candidate.id}`}>
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                {candidate.avatarInitials}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{candidate.name}</p>
                <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{candidate.university}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${scoreColor(candidate.potentialScore)}`}>
              {candidate.potentialScore}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">{candidate.degree}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={10} />
            <span className="text-xs">{candidate.daysInStage}d in stage</span>
          </div>
        </div>
      </Link>
      {candidate.stage === "Applied" && (
        <Link
          href="/assessment"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-1"
        >
          <Send size={10} />
          Send assessment
        </Link>
      )}
    </div>
  );
}
```

Replace the entire file with:

```tsx
// components/pipeline/CandidateCard.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import { Clock, Send, CalendarPlus } from "lucide-react";
import { ScheduleModal } from "@/components/pipeline/ScheduleModal";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <>
      <div className="group relative">
        <Link href={`/candidates/${candidate.id}`}>
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                  {candidate.avatarInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{candidate.name}</p>
                  <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{candidate.university}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${scoreColor(candidate.potentialScore)}`}>
                {candidate.potentialScore}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{candidate.degree}</p>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              <span className="text-xs">{candidate.daysInStage}d in stage</span>
            </div>
          </div>
        </Link>

        {candidate.stage === "Applied" && (
          <Link
            href="/assessment"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 px-1"
          >
            <Send size={10} />
            Send assessment
          </Link>
        )}

        {candidate.stage === "Interview" && (
          <button
            type="button"
            onClick={() => setShowSchedule(true)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 px-1"
          >
            <CalendarPlus size={10} />
            Schedule interview
          </button>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          candidateName={candidate.name}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </>
  );
}
```

Note: `CandidateCard` gains `"use client"` because it now manages modal state. This is correct — it was already within a client boundary via `PipelineBoard`.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 4: Manual test**

Navigate to `/pipeline`. Find a candidate in the "Interview" column. Hover the card — "Schedule interview" text should appear. Click it — the scheduling modal opens. Select a slot and click "Send Calendar Invite" — the confirmation screen shows. Click "Done" — modal closes.

- [ ] **Step 5: Commit**

```bash
git add components/pipeline/ScheduleModal.tsx components/pipeline/CandidateCard.tsx
git commit -m "feat: add self-booking schedule interview modal on pipeline Interview cards"
```

---

### Task 5: ATS integrations + assessment config panel on Dashboard

**Files:**
- Create: `components/dashboard/IntegrationsPanel.tsx`
- Modify: `app/dashboard/page.tsx` (add IntegrationsPanel to the 2-column bottom grid)

Paula named the ATS landscape (PageUp, Workday, Success Factors, Oracle, Springboard) and said system setup across multiple platforms is a major pain point. This panel shows Talent Edge's connected integrations, signalling that it fits into existing recruiter tooling. It also teases self-service assessment configuration — Amberjack's biggest gap.

- [ ] **Step 1: Create `components/dashboard/IntegrationsPanel.tsx`**

```tsx
// components/dashboard/IntegrationsPanel.tsx
import { CheckCircle, Settings, Plug } from "lucide-react";

type Integration = {
  name: string;
  category: string;
  status: "connected" | "available";
};

const integrations: Integration[] = [
  { name: "PageUp",           category: "ATS",         status: "connected"  },
  { name: "Workday",          category: "ATS",         status: "connected"  },
  { name: "Success Factors",  category: "ATS",         status: "available"  },
  { name: "Oracle HCM",       category: "ATS",         status: "available"  },
  { name: "Springboard",      category: "ATS",         status: "available"  },
  { name: "Grad-Engage",      category: "Keep Warm",   status: "available"  },
];

export function IntegrationsPanel() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Platform Integrations</h2>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          <CheckCircle size={10} />
          2 active
        </span>
      </div>

      <div className="space-y-2">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                integration.status === "connected" ? "bg-emerald-500" : "bg-slate-300"
              }`} />
              <div>
                <p className="text-xs font-medium text-slate-700">{integration.name}</p>
                <p className="text-[10px] text-slate-400">{integration.category}</p>
              </div>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              integration.status === "connected"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-slate-100 text-slate-400"
            }`}>
              {integration.status === "connected" ? "Connected" : "Available"}
            </span>
          </div>
        ))}
      </div>

      {/* Assessment config teaser */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Settings size={14} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Self-service Assessment Config</p>
              <p className="text-[10px] text-slate-400">Customise questions, language &amp; branding</p>
            </div>
          </div>
          <span className="text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add IntegrationsPanel to dashboard**

In `app/dashboard/page.tsx`:

Add the import after the existing dashboard component imports:
```tsx
import { IntegrationsPanel } from "@/components/dashboard/IntegrationsPanel";
```

The current bottom grid is a `grid grid-cols-2 gap-4` containing "Top Potential Candidates" and "Recent Activity". Change it to a `grid grid-cols-3 gap-4` and add `<IntegrationsPanel />` as the third column:

Replace:
```tsx
        <div className="grid grid-cols-2 gap-4">
          {/* Top candidates */}
          ...
          {/* Recent activity */}
          ...
        </div>
```

With:
```tsx
        <div className="grid grid-cols-3 gap-4">
          {/* Top candidates */}
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Top Potential Candidates</h2>
            <div className="space-y-2">
              {topCandidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/candidates/${c.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                      {c.avatarInitials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.university}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor(c.potentialScore)}`}>
                      {c.potentialScore}
                    </span>
                    <Badge variant="outline" className="text-xs">{c.stage}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">{a.text}</p>
                    <p className="text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrations */}
          <IntegrationsPanel />
        </div>
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 4: Manual test**

Navigate to `/dashboard` (as Admin). Bottom row should now be 3 columns. The third column shows PageUp and Workday as connected, others as available. The "Self-service Assessment Config" teaser appears at the bottom of the panel with a "Coming soon" badge.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/IntegrationsPanel.tsx app/dashboard/page.tsx
git commit -m "feat: add ATS integrations panel and self-service config teaser to dashboard"
```

---

### Task 6: Push and verify

- [ ] **Step 1: Final TypeScript check**

```bash
cd /Users/tomklimovski/Github/talent-edge && npx tsc --noEmit 2>&1
```

Expected: no errors

- [ ] **Step 2: Push to main**

```bash
git push origin main
```

- [ ] **Step 3: Verify Vercel deploy and smoke test each feature**

Once deployed:
1. **Landing** → Click Admin → `/dashboard` — Lifecycle Journey banner visible at top; Integrations panel in 3-col bottom row
2. **Dashboard** → All 8 lifecycle stages visible; 2 connected integrations; config teaser shows
3. **Pipeline** → Hover an Interview-stage candidate card → "Schedule interview" appears → click → modal opens → select slot → confirm → success screen
4. **Assessment** (Graduate persona) → Registration shows accessibility card + "potential not privilege" text → Chat widget floating button visible → click → FAQ panel expands → click a question → answer shows

---

## Self-Review

**Spec coverage:**
- ✅ Applicant screening pain point → Lifecycle Journey shows screening stages with counts (Task 1)
- ✅ Disability/neurodiversity management → Accessibility accommodation in Registration (Task 3)
- ✅ AI chatbot "should be standard" → ChatWidget FAQ on assessment pages (Task 2)
- ✅ Auto-generated feedback reports → ChatWidget FAQ item 3 sets expectation ("within 5 business days")
- ✅ Scheduling manual pain point → Schedule Interview modal with self-booking UI (Task 4)
- ✅ ATS system setup / multiple systems → Integrations panel showing PageUp, Workday etc. (Task 5)
- ✅ Post-hire development tied to recruitment → Lifecycle Journey spans full arc (Task 1)
- ✅ "Assess for potential, not for privilege" → Registration hero text (Task 3)
- ✅ Amberjack self-service config gap → "Self-service Assessment Config — Coming soon" teaser (Task 5)
- ✅ Grad-Engage competitor (keep warm) → Listed in integrations as "Available / Keep Warm" — signals awareness and roadmap

**Placeholder scan:** None. All steps have complete code.

**Type consistency:**
- `RegistrationData.accessibilityNeeds?: string` — optional, defined in Task 3 step 1, used in step 2. No other consumers reference it so no cross-task type issues.
- `ScheduleModal` props `{ candidateName: string; onClose: () => void }` — defined and consumed in same task.
- `LifecycleStage` and `Integration` types are local to their files — no cross-task dependencies.
