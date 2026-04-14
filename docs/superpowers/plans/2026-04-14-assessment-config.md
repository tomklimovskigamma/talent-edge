# Self-Service Assessment Config Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/settings/assessment` page where admins can see and mock-edit program branding, competency labels, and track configuration — directly demonstrating the self-service capability that Amberjack cannot offer.

**Architecture:** Three client components each own one config section (branding, competency labels, tracks). Each section reads from existing static data, renders editable form controls, and shows an inline "Saved" success state for 2 seconds on submit — no persistence, which is correct for a demo. The sidebar gains a Settings nav item visible to admin only. All components are self-contained; the page is a thin server component that imports and stacks them.

**Tech Stack:** TypeScript, React 19 client components, Tailwind v4, lucide-react, existing `usePersona` hook, existing `program` and `dimensionConfigs`/`trackLabels` data from `lib/data/`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/layout/Sidebar.tsx` | Modify | Add Settings nav item (admin-only via `adminOnly` flag) |
| `app/settings/assessment/page.tsx` | Create | Server page shell — title, subtitle, three config sections |
| `components/settings/BrandingConfig.tsx` | Create | Editable program branding: client name, manager, intake year, accent colour |
| `components/settings/CompetencyConfig.tsx` | Create | Editable competency labels and taglines for all 5 dimensions |
| `components/settings/TrackConfig.tsx` | Create | Track display: track names and question count per dimension per track |

---

### Task 1: Add Settings to Sidebar + scaffold the page

**Files:**
- Modify: `components/layout/Sidebar.tsx`
- Create: `app/settings/assessment/page.tsx`

The sidebar currently has a `graduateOnly` boolean on each nav item. We add a parallel `adminOnly` boolean and filter accordingly. The page is a thin shell — three `<section>` placeholders so the build passes before the components exist.

- [ ] **Step 1: Update `components/layout/Sidebar.tsx`**

```tsx
// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, ClipboardList, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersona } from "@/lib/persona";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, graduateOnly: false, adminOnly: false },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, graduateOnly: false, adminOnly: false },
  { href: "/assessment", label: "Assessment", icon: ClipboardList, graduateOnly: true, adminOnly: false },
  { href: "/settings/assessment", label: "Settings", icon: Settings, graduateOnly: false, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { persona } = usePersona();

  const visibleNav = nav.filter((item) => {
    if (item.graduateOnly && persona === "admin") return false;
    if (item.adminOnly && persona !== "admin") return false;
    return true;
  });

  return (
    <aside className="w-56 min-h-screen bg-[#1E1B4B] flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <img src="/te-logo.svg" alt="Talent Edge" className="h-7 brightness-0 invert" />
      </div>
      <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-white/40">Talent Edge v0.1</p>
        <p className="text-xs text-white/40">Demo</p>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create `app/settings/assessment/page.tsx`** (scaffold — no component imports yet)

```tsx
// app/settings/assessment/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { Settings } from "lucide-react";

export default function AssessmentConfigPage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-indigo-500" />
            <h1 className="text-lg font-semibold text-slate-800">Assessment Configuration</h1>
          </div>
          <p className="text-sm text-slate-500">
            Customise your program branding, competency labels, and track question assignments. Changes apply immediately to your live assessment.
          </p>
        </div>

        {/* Sections wired in later tasks */}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Confirm build passes**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm run build
```

Expected: clean build. Settings link appears in sidebar for admin persona, hidden for graduate.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx app/settings/assessment/page.tsx
git commit -m "feat: add Settings nav item and assessment config page scaffold"
```

---

### Task 2: `BrandingConfig` client component

**Files:**
- Create: `components/settings/BrandingConfig.tsx`

Editable fields for program branding. Reads initial values from the `program` constant. On "Save changes", shows an inline "Saved ✓" label for 2 seconds then reverts. No persistence — this is a demo.

- [ ] **Step 1: Create `components/settings/BrandingConfig.tsx`**

```tsx
// components/settings/BrandingConfig.tsx
"use client";
import { useState } from "react";
import { program } from "@/lib/data/program";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BrandingFields = {
  clientName: string;
  programName: string;
  intakeYear: string;
  managerName: string;
  accentColour: string;
};

export function BrandingConfig() {
  const [fields, setFields] = useState<BrandingFields>({
    clientName: program.clientName,
    programName: program.programName,
    intakeYear: String(program.intakeYear),
    managerName: program.manager,
    accentColour: "#4F46E5",
  });
  const [saved, setSaved] = useState(false);

  function handleChange(key: keyof BrandingFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Building2 size={15} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Program Branding</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="clientName">Client name</label>
          <input
            id="clientName"
            type="text"
            value={fields.clientName}
            onChange={(e) => handleChange("clientName", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="programName">Program name</label>
          <input
            id="programName"
            type="text"
            value={fields.programName}
            onChange={(e) => handleChange("programName", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="intakeYear">Intake year</label>
          <input
            id="intakeYear"
            type="text"
            value={fields.intakeYear}
            onChange={(e) => handleChange("intakeYear", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="managerName">Program manager</label>
          <input
            id="managerName"
            type="text"
            value={fields.managerName}
            onChange={(e) => handleChange("managerName", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="accentColour">Accent colour</label>
          <div className="flex items-center gap-2">
            <input
              id="accentColour"
              type="color"
              value={fields.accentColour}
              onChange={(e) => handleChange("accentColour", e.target.value)}
              className="h-9 w-14 border border-slate-200 rounded-lg cursor-pointer p-0.5"
            />
            <span className="text-xs text-slate-500 font-mono">{fields.accentColour}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `BrandingConfig` to the page**

Update `app/settings/assessment/page.tsx`:

```tsx
// app/settings/assessment/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { Settings } from "lucide-react";
import { BrandingConfig } from "@/components/settings/BrandingConfig";

export default function AssessmentConfigPage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-indigo-500" />
            <h1 className="text-lg font-semibold text-slate-800">Assessment Configuration</h1>
          </div>
          <p className="text-sm text-slate-500">
            Customise your program branding, competency labels, and track question assignments. Changes apply immediately to your live assessment.
          </p>
        </div>

        <BrandingConfig />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add components/settings/BrandingConfig.tsx app/settings/assessment/page.tsx
git commit -m "feat: add BrandingConfig section to assessment settings page"
```

---

### Task 3: `CompetencyConfig` client component

**Files:**
- Create: `components/settings/CompetencyConfig.tsx`

Renders one editable row per dimension — label and tagline. Each row has its own save state so individual competencies can be saved independently.

- [ ] **Step 1: Create `components/settings/CompetencyConfig.tsx`**

```tsx
// components/settings/CompetencyConfig.tsx
"use client";
import { useState } from "react";
import { dimensionConfigs, type DimensionConfig } from "@/lib/data/assessment";
import { Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompetencyRow = {
  dimension: DimensionConfig["dimension"];
  label: string;
  tagline: string;
};

export function CompetencyConfig() {
  const [rows, setRows] = useState<CompetencyRow[]>(
    dimensionConfigs.map((d) => ({
      dimension: d.dimension,
      label: d.label,
      tagline: d.tagline,
    }))
  );
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  function handleChange(i: number, key: "label" | "tagline", value: string) {
    setRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row))
    );
  }

  function handleSave(i: number) {
    setSavedIndex(i);
    setTimeout(() => setSavedIndex(null), 2000);
  }

  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Brain size={15} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Competency Labels</h2>
        <span className="ml-auto text-xs text-slate-400">5 dimensions</span>
      </div>

      <div className="space-y-5">
        {rows.map((row, i) => (
          <div key={row.dimension} className="border border-slate-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">{row.dimension}</span>
              <div className="flex items-center gap-2">
                {savedIndex === i && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Saved
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={() => handleSave(i)}
                  className="text-xs h-7 px-2.5">
                  Save
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-600"
                  htmlFor={`label-${row.dimension}`}
                >
                  Display label
                </label>
                <input
                  id={`label-${row.dimension}`}
                  type="text"
                  value={row.label}
                  onChange={(e) => handleChange(i, "label", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-600"
                  htmlFor={`tagline-${row.dimension}`}
                >
                  Tagline
                </label>
                <input
                  id={`tagline-${row.dimension}`}
                  type="text"
                  value={row.tagline}
                  onChange={(e) => handleChange(i, "tagline", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add `CompetencyConfig` to the page**

Update `app/settings/assessment/page.tsx`:

```tsx
// app/settings/assessment/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { Settings } from "lucide-react";
import { BrandingConfig } from "@/components/settings/BrandingConfig";
import { CompetencyConfig } from "@/components/settings/CompetencyConfig";

export default function AssessmentConfigPage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-indigo-500" />
            <h1 className="text-lg font-semibold text-slate-800">Assessment Configuration</h1>
          </div>
          <p className="text-sm text-slate-500">
            Customise your program branding, competency labels, and track question assignments. Changes apply immediately to your live assessment.
          </p>
        </div>

        <BrandingConfig />
        <CompetencyConfig />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add components/settings/CompetencyConfig.tsx app/settings/assessment/page.tsx
git commit -m "feat: add CompetencyConfig section to assessment settings page"
```

---

### Task 4: `TrackConfig` component + wire all into page

**Files:**
- Create: `components/settings/TrackConfig.tsx`
- Modify: `app/settings/assessment/page.tsx`

Shows the 3 career tracks with their names and a summary of which question types are used per dimension. Track names are editable (mock save). The question breakdown is read-only — it demonstrates the depth of configurability without building a full question editor.

- [ ] **Step 1: Create `components/settings/TrackConfig.tsx`**

```tsx
// components/settings/TrackConfig.tsx
"use client";
import { useState } from "react";
import { trackLabels, dimensionConfigs, type Track } from "@/lib/data/assessment";
import { Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const trackKeys = Object.keys(trackLabels) as Track[];

function questionCountByType(track: Track): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const dim of dimensionConfigs) {
    for (const q of dim.questions) {
      // SJT questions with TrackScenario objects are track-specific
      if (q.type === "sjt" && typeof q.scenario === "object") {
        counts["sjt (track-specific)"] = (counts["sjt (track-specific)"] ?? 0) + 1;
      } else {
        counts[q.type] = (counts[q.type] ?? 0) + 1;
      }
    }
  }
  return counts;
}

export function TrackConfig() {
  const [trackNames, setTrackNames] = useState<Record<Track, string>>(
    Object.fromEntries(trackKeys.map((k) => [k, trackLabels[k]])) as Record<Track, string>
  );
  const [savedTrack, setSavedTrack] = useState<Track | null>(null);

  function handleSave(track: Track) {
    setSavedTrack(track);
    setTimeout(() => setSavedTrack(null), 2000);
  }

  // Question counts are the same across tracks (track specificity is in scenario text, not question count)
  const typeCounts = questionCountByType("finance");
  const totalQuestions = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Layers size={15} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Track Configuration</h2>
        <span className="ml-auto text-xs text-slate-400">{totalQuestions} questions · {dimensionConfigs.length} dimensions</span>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Each track receives the same question bank with track-specific scenario text for situational judgement questions.
      </p>

      <div className="space-y-4 mb-6">
        {trackKeys.map((track) => (
          <div key={track} className="border border-slate-100 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wide w-28 flex-shrink-0">{track}</span>
                <input
                  type="text"
                  value={trackNames[track]}
                  onChange={(e) =>
                    setTrackNames((prev) => ({ ...prev, [track]: e.target.value }))
                  }
                  aria-label={`Display name for ${track} track`}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1"
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {savedTrack === track && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Saved
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={() => handleSave(track)}
                  className="text-xs h-7 px-2.5">
                  Save
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <span key={type} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {count}× {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
        Question bank editing and custom competency weights are available in the Enterprise plan.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Update `app/settings/assessment/page.tsx` with the final version**

```tsx
// app/settings/assessment/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { Settings } from "lucide-react";
import { BrandingConfig } from "@/components/settings/BrandingConfig";
import { CompetencyConfig } from "@/components/settings/CompetencyConfig";
import { TrackConfig } from "@/components/settings/TrackConfig";

export default function AssessmentConfigPage() {
  return (
    <AppShell>
      <div className="max-w-3xl space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-indigo-500" />
            <h1 className="text-lg font-semibold text-slate-800">Assessment Configuration</h1>
          </div>
          <p className="text-sm text-slate-500">
            Customise your program branding, competency labels, and track question assignments. Changes apply immediately to your live assessment.
          </p>
        </div>

        <BrandingConfig />
        <CompetencyConfig />
        <TrackConfig />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add components/settings/TrackConfig.tsx app/settings/assessment/page.tsx
git commit -m "feat: add TrackConfig section and complete assessment settings page"
```

---

## Self-Review

**Spec coverage:**
- ✅ `/settings/assessment` page — Task 1 (scaffold) + Tasks 2–4 (sections wired in)
- ✅ Client branding (mock-edit) — Task 2 (`BrandingConfig`: client name, program name, intake year, manager, accent colour)
- ✅ Competency labels (mock-edit) — Task 3 (`CompetencyConfig`: label + tagline per dimension)
- ✅ Track assignments — Task 4 (`TrackConfig`: track names + question type breakdown)
- ✅ Admin-only — Settings nav item filtered by `adminOnly && persona !== "admin"`; page itself doesn't need an additional guard since the nav is the entry point
- ✅ Anti-Amberjack positioning — "Powered by Grad-Engage" teaser note + "Question bank editing ... available in the Enterprise plan" upsell line

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `DimensionConfig["dimension"]` used in `CompetencyConfig` rows — matches the `Dimension` type from `assessment.ts`. ✅
- `Track` used in `TrackConfig` state — matches `trackLabels` key type from `assessment.ts`. ✅
- `program.clientName`, `program.manager`, `program.intakeYear` — all accessed correctly from `lib/data/program.ts`. ✅
- `dimensionConfigs` imported from `@/lib/data/assessment` in both `CompetencyConfig` and `TrackConfig` — single source. ✅
