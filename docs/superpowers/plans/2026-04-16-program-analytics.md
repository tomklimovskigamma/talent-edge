# Program Analytics Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only `/analytics` route with four recharts panels — pipeline funnel with retention, score distribution by track, time-in-stage averages, and score-band donut — linked from the sidebar.

**Architecture:** Four pure computation helpers live in a new `lib/analytics.ts`. Four self-contained client chart components sit under `components/analytics/`. The page at `app/analytics/page.tsx` is a server component that composes helpers + charts. Sidebar gains a single `adminOnly: true` entry. Route-level persona gating is sidebar-discovery only, matching the existing Settings route.

**Tech Stack:** TypeScript, React 19, Tailwind v4, recharts (`BarChart`, `Bar`, `LabelList`, `PieChart`, `Pie`, `Cell`, `ResponsiveContainer`), lucide-react (`BarChart3`), vitest.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/analytics.ts` | Create | `computeFunnelMetrics`, `computeScoreDistByTrack`, `computeTimeInStage`, `computeScoreBandBreakdown` + types |
| `__tests__/analytics.test.ts` | Create | Unit tests for all four helpers |
| `components/analytics/FunnelPanel.tsx` | Create | Vertical bar chart with retention % label |
| `components/analytics/ScoreByTrackPanel.tsx` | Create | Grouped bar, one group per track |
| `components/analytics/TimeInStagePanel.tsx` | Create | Horizontal bar of avg days per stage |
| `components/analytics/ScoreBandPanel.tsx` | Create | Donut with three score-band slices |
| `app/analytics/page.tsx` | Create | Server page composing the four panels |
| `components/layout/Sidebar.tsx` | Modify | Add admin-only Analytics nav entry |

---

### Task 1: `lib/analytics.ts` — four pure helpers + tests

**Files:**
- Create: `lib/analytics.ts`
- Create: `__tests__/analytics.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/analytics.test.ts`:

```ts
// __tests__/analytics.test.ts
import { describe, it, expect } from "vitest";
import type { Candidate } from "@/lib/data/candidates";
import type { StageName } from "@/lib/data/program";
import {
  computeFunnelMetrics,
  computeScoreDistByTrack,
  computeTimeInStage,
  computeScoreBandBreakdown,
} from "@/lib/analytics";

const stub = (overrides: Partial<Candidate>): Candidate =>
  ({
    id: "x",
    name: "T",
    university: "U",
    degree: "B. Finance",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-01-01",
    daysInStage: 5,
    potentialScore: 75,
    dimensions: {
      adaptability: 75, cognitiveAgility: 75, emotionalIntelligence: 75, collaboration: 75, drive: 75,
    },
    assessmentHistory: [],
    avatarInitials: "T",
    ...overrides,
  } as Candidate);

describe("computeFunnelMetrics", () => {
  it("first stage has retainedPct === 100", () => {
    const counts: Record<StageName, number> = {
      Applied: 200, Assessed: 150, Shortlisted: 80, Interview: 40, Offer: 20, Hired: 10, Rejected: 0,
    };
    const result = computeFunnelMetrics(counts);
    expect(result[0].retainedPct).toBe(100);
  });

  it("percentages are integers and monotonically non-increasing", () => {
    const counts: Record<StageName, number> = {
      Applied: 200, Assessed: 150, Shortlisted: 80, Interview: 40, Offer: 20, Hired: 10, Rejected: 0,
    };
    const result = computeFunnelMetrics(counts);
    for (const r of result) expect(Number.isInteger(r.retainedPct)).toBe(true);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].retainedPct).toBeLessThanOrEqual(result[i - 1].retainedPct);
    }
  });

  it("excludes Rejected from output", () => {
    const counts: Record<StageName, number> = {
      Applied: 10, Assessed: 8, Shortlisted: 6, Interview: 4, Offer: 2, Hired: 1, Rejected: 99,
    };
    const result = computeFunnelMetrics(counts);
    expect(result.find((r) => r.stage === "Rejected")).toBeUndefined();
    expect(result).toHaveLength(6);
  });
});

describe("computeScoreDistByTrack", () => {
  it("excludes Applied candidates", () => {
    const cohort = [
      stub({ stage: "Applied", degree: "B. Finance", potentialScore: 90 }), // excluded
      stub({ stage: "Hired", degree: "B. Finance", potentialScore: 90 }),   // High
    ];
    const result = computeScoreDistByTrack(cohort);
    const finance = result.find((r) => r.track === "Finance")!;
    expect(finance.high).toBe(1);
    expect(finance.emerging).toBe(0);
    expect(finance.developing).toBe(0);
  });

  it("returns exactly three tracks, each with zero counts when empty", () => {
    const result = computeScoreDistByTrack([]);
    expect(result.map((r) => r.track).sort()).toEqual(
      ["Finance", "People & Culture", "Technology"]
    );
    for (const r of result) {
      expect(r.high + r.emerging + r.developing).toBe(0);
    }
  });

  it("partitions bands at 65 and 80", () => {
    const cohort = [
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 64 }), // Developing
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 65 }), // Emerging
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 79 }), // Emerging
      stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 80 }), // High
    ];
    const finance = computeScoreDistByTrack(cohort).find((r) => r.track === "Finance")!;
    expect(finance.developing).toBe(1);
    expect(finance.emerging).toBe(2);
    expect(finance.high).toBe(1);
  });

  it("excludes Other-track candidates", () => {
    const cohort = [
      stub({ stage: "Hired", degree: "B. Medicine", potentialScore: 95 }), // Other → excluded
      stub({ stage: "Hired", degree: "B. Finance", potentialScore: 95 }),  // Finance
    ];
    const result = computeScoreDistByTrack(cohort);
    const total = result.reduce((s, r) => s + r.high + r.emerging + r.developing, 0);
    expect(total).toBe(1);
  });
});

describe("computeTimeInStage", () => {
  it("averages daysInStage per current stage", () => {
    const cohort = [
      stub({ stage: "Assessed", daysInStage: 10 }),
      stub({ stage: "Assessed", daysInStage: 20 }),
      stub({ stage: "Interview", daysInStage: 5 }),
    ];
    const result = computeTimeInStage(cohort);
    const assessed = result.find((r) => r.stage === "Assessed")!;
    const interview = result.find((r) => r.stage === "Interview")!;
    expect(assessed.avgDays).toBe(15);
    expect(interview.avgDays).toBe(5);
  });

  it("omits stages with zero members", () => {
    const cohort = [stub({ stage: "Assessed", daysInStage: 4 })];
    const result = computeTimeInStage(cohort);
    expect(result.find((r) => r.stage === "Offer")).toBeUndefined();
    expect(result.find((r) => r.stage === "Hired")).toBeUndefined();
  });
});

describe("computeScoreBandBreakdown", () => {
  it("partitions at 65 and 80, excluding Applied candidates", () => {
    const cohort = [
      stub({ stage: "Applied",   potentialScore: 95 }), // excluded
      stub({ stage: "Assessed",  potentialScore: 64 }), // Developing
      stub({ stage: "Assessed",  potentialScore: 65 }), // Emerging
      stub({ stage: "Assessed",  potentialScore: 79 }), // Emerging
      stub({ stage: "Hired",     potentialScore: 80 }), // High
    ];
    const result = computeScoreBandBreakdown(cohort);
    const byBand = Object.fromEntries(result.map((r) => [r.band, r.count]));
    expect(byBand["Developing"]).toBe(1);
    expect(byBand["Emerging"]).toBe(2);
    expect(byBand["High Potential"]).toBe(1);
  });

  it("always returns exactly three bands", () => {
    expect(computeScoreBandBreakdown([])).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Confirm tests fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/analytics.test.ts 2>&1 | tail -15
```

Expected: module-not-found.

- [ ] **Step 3: Create `lib/analytics.ts`**

```ts
// lib/analytics.ts
import type { Candidate } from "@/lib/data/candidates";
import { stages, type StageName } from "@/lib/data/program";
import { ASSESSED_PLUS_STAGES, classifyTrack } from "@/lib/cohort";

export type Track = "Finance" | "Technology" | "People & Culture";

export type FunnelMetric = { stage: StageName; count: number; retainedPct: number };
export type TrackScoreDist = { track: Track; high: number; emerging: number; developing: number };
export type TimeInStage = { stage: StageName; avgDays: number };
export type ScoreBand = { band: "High Potential" | "Emerging" | "Developing"; count: number; color: string };

const BAND_COLORS = {
  high: "#10B981",       // emerald-500
  emerging: "#F59E0B",   // amber-500
  developing: "#F43F5E", // rose-500
};

function assessedPlus(candidates: Candidate[]): Candidate[] {
  return candidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
}

function bandFor(score: number): "high" | "emerging" | "developing" {
  if (score >= 80) return "high";
  if (score >= 65) return "emerging";
  return "developing";
}

export function computeFunnelMetrics(counts: Record<StageName, number>): FunnelMetric[] {
  const firstCount = counts[stages[0].label] || 1; // avoid /0
  return stages.map((s) => ({
    stage: s.label,
    count: counts[s.label],
    retainedPct: Math.round((counts[s.label] / firstCount) * 100),
  }));
}

export function computeScoreDistByTrack(candidates: Candidate[]): TrackScoreDist[] {
  const pool = assessedPlus(candidates);
  const tracks: Track[] = ["Finance", "Technology", "People & Culture"];
  return tracks.map((track) => {
    const members = pool.filter((c) => classifyTrack(c.degree) === track);
    let high = 0, emerging = 0, developing = 0;
    for (const c of members) {
      const b = bandFor(c.potentialScore);
      if (b === "high") high++;
      else if (b === "emerging") emerging++;
      else developing++;
    }
    return { track, high, emerging, developing };
  });
}

export function computeTimeInStage(candidates: Candidate[]): TimeInStage[] {
  const out: TimeInStage[] = [];
  for (const s of stages) {
    const members = candidates.filter((c) => c.stage === s.label);
    if (members.length === 0) continue;
    const sum = members.reduce((acc, c) => acc + c.daysInStage, 0);
    out.push({ stage: s.label, avgDays: Math.round(sum / members.length) });
  }
  return out;
}

export function computeScoreBandBreakdown(candidates: Candidate[]): ScoreBand[] {
  const pool = assessedPlus(candidates);
  let high = 0, emerging = 0, developing = 0;
  for (const c of pool) {
    const b = bandFor(c.potentialScore);
    if (b === "high") high++;
    else if (b === "emerging") emerging++;
    else developing++;
  }
  return [
    { band: "High Potential", count: high, color: BAND_COLORS.high },
    { band: "Emerging", count: emerging, color: BAND_COLORS.emerging },
    { band: "Developing", count: developing, color: BAND_COLORS.developing },
  ];
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test -- __tests__/analytics.test.ts 2>&1 | tail -15
```

Expected: all analytics tests pass.

- [ ] **Step 5: Full suite**

```bash
npm test 2>&1 | tail -10
```

Expected: 184/184 pass (171 existing + 13 new).

- [ ] **Step 6: Commit**

```bash
git add lib/analytics.ts __tests__/analytics.test.ts
git commit -m "feat: add program analytics computation helpers"
```

---

### Task 2: `FunnelPanel` chart component

**Files:**
- Create: `components/analytics/FunnelPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/analytics/FunnelPanel.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelMetric } from "@/lib/analytics";

const colors = ["#94A3B8", "#818CF8", "#A78BFA", "#F59E0B", "#F97316", "#10B981"];

export function FunnelPanel({ data }: { data: FunnelMetric[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Pipeline Funnel</CardTitle>
        <p className="text-xs text-slate-400">% retained from Applied stage</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 20, right: 8, bottom: 4, left: -10 }}>
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
              formatter={(value, _name, item) => [`${value} (${item.payload.retainedPct}%)`, "Candidates"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidates">
              <LabelList
                dataKey="retainedPct"
                position="top"
                formatter={(v: number) => `${v}%`}
                style={{ fontSize: 11, fill: "#64748B" }}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add components/analytics/FunnelPanel.tsx
git commit -m "feat: add FunnelPanel analytics component"
```

---

### Task 3: `ScoreByTrackPanel` chart component

**Files:**
- Create: `components/analytics/ScoreByTrackPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/analytics/ScoreByTrackPanel.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrackScoreDist } from "@/lib/analytics";

export function ScoreByTrackPanel({ data }: { data: TrackScoreDist[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Score Distribution by Track</CardTitle>
        <p className="text-xs text-slate-400">Assessed+ candidates, banded by potential score</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <XAxis
              dataKey="track"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="high" name="High Potential" fill="#10B981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="emerging" name="Emerging" fill="#F59E0B" radius={[3, 3, 0, 0]} />
            <Bar dataKey="developing" name="Developing" fill="#F43F5E" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add components/analytics/ScoreByTrackPanel.tsx
git commit -m "feat: add ScoreByTrackPanel analytics component"
```

---

### Task 4: `TimeInStagePanel` chart component

**Files:**
- Create: `components/analytics/TimeInStagePanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/analytics/TimeInStagePanel.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeInStage } from "@/lib/analytics";

export function TimeInStagePanel({ data }: { data: TimeInStage[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Average Time in Stage</CardTitle>
        <p className="text-xs text-slate-400">Days candidates currently in each stage</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 10 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
              formatter={(v: number) => [`${v}d`, "Avg days"]}
            />
            <Bar dataKey="avgDays" fill="#818CF8" radius={[0, 4, 4, 0]} name="Avg days" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add components/analytics/TimeInStagePanel.tsx
git commit -m "feat: add TimeInStagePanel analytics component"
```

---

### Task 5: `ScoreBandPanel` donut component

**Files:**
- Create: `components/analytics/ScoreBandPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/analytics/ScoreBandPanel.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreBand } from "@/lib/analytics";

export function ScoreBandPanel({ data }: { data: ScoreBand[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Score Band Breakdown</CardTitle>
        <p className="text-xs text-slate-400">Assessed+ cohort by AI potential band</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                formatter={(v: number, name: string) => [`${v} candidates`, name]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="band"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{total}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Assessed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add components/analytics/ScoreBandPanel.tsx
git commit -m "feat: add ScoreBandPanel donut component"
```

---

### Task 6: `app/analytics/page.tsx` — compose the page

**Files:**
- Create: `app/analytics/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/analytics/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { candidates } from "@/lib/data/candidates";
import { pipelineCounts } from "@/lib/data/program";
import { FunnelPanel } from "@/components/analytics/FunnelPanel";
import { ScoreByTrackPanel } from "@/components/analytics/ScoreByTrackPanel";
import { TimeInStagePanel } from "@/components/analytics/TimeInStagePanel";
import { ScoreBandPanel } from "@/components/analytics/ScoreBandPanel";
import {
  computeFunnelMetrics,
  computeScoreDistByTrack,
  computeTimeInStage,
  computeScoreBandBreakdown,
} from "@/lib/analytics";

export default function AnalyticsPage() {
  const funnel = computeFunnelMetrics(pipelineCounts);
  const trackDist = computeScoreDistByTrack(candidates);
  const timeInStage = computeTimeInStage(candidates);
  const bands = computeScoreBandBreakdown(candidates);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Program Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Meridian Group · 2026 Graduate Intake
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FunnelPanel data={funnel} />
          <ScoreByTrackPanel data={trackDist} />
          <TimeInStagePanel data={timeInStage} />
          <ScoreBandPanel data={bands} />
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: `/analytics` appears in the route list as a static page.

- [ ] **Step 3: Commit**

```bash
git add app/analytics/page.tsx
git commit -m "feat: add /analytics route composing all four panels"
```

---

### Task 7: Add Analytics nav entry to the sidebar

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Edit `components/layout/Sidebar.tsx`**

Change the `lucide-react` import to include `BarChart3`:

```ts
import { LayoutDashboard, GitBranch, ClipboardList, Settings, BarChart3 } from "lucide-react";
```

Insert a new entry between Pipeline and Settings in the `nav` array. The full array becomes:

```ts
const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, graduateOnly: false, adminOnly: false },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, graduateOnly: false, adminOnly: false },
  { href: "/analytics", label: "Analytics", icon: BarChart3, graduateOnly: false, adminOnly: true },
  { href: "/assessment", label: "Assessment", icon: ClipboardList, graduateOnly: true, adminOnly: false },
  { href: "/settings/assessment", label: "Settings", icon: Settings, graduateOnly: false, adminOnly: true },
];
```

- [ ] **Step 2: Full test suite + build**

```bash
npm test 2>&1 | tail -5
npm run build 2>&1 | tail -5
```

Expected: 184/184 tests pass, clean build.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000`, switch to **Admin**.
2. Confirm a new **Analytics** entry appears in the sidebar between Pipeline and Settings with a `BarChart3` icon.
3. Click **Analytics** — confirm the page loads with the heading "Program Analytics" and a 2×2 grid of panels:
   - **Pipeline Funnel** — bar per stage with `%` retention labels above each bar. First bar shows `100%`.
   - **Score Distribution by Track** — three groups (Finance / Technology / People & Culture) with three bars each (High / Emerging / Developing).
   - **Average Time in Stage** — horizontal bars per stage with days.
   - **Score Band Breakdown** — donut with three slices and a centre showing the total assessed count.
4. Switch to **Graduate** persona — confirm:
   - Analytics entry disappears from the sidebar.
   - Typing `/analytics` still loads the page (no server guard — expected behaviour per spec).
5. Switch back to **Admin**, resize the browser — confirm panels stack to a single column on narrow viewports.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: add Analytics sidebar entry (admin only)"
```

---

## Self-Review

**Spec coverage:**
- ✅ `/analytics` route composing four panels — Task 6
- ✅ `lib/analytics.ts` four pure helpers — Task 1
- ✅ Pipeline funnel with retention % label — Task 2
- ✅ Score distribution by track (grouped bar) — Task 3
- ✅ Time-in-stage (horizontal bar, omits empty stages) — Task 4
- ✅ Score band donut with centre total — Task 5
- ✅ Sidebar entry `adminOnly: true` — Task 7
- ✅ Tests cover funnel integer-retention + monotonic + Rejected exclusion — Task 1
- ✅ Tests cover track: Applied-exclusion, three-tracks, band partition, Other-exclusion — Task 1
- ✅ Tests cover time-in-stage average + omits empty — Task 1
- ✅ Tests cover score-band boundaries + always three bands — Task 1

**Placeholder scan:** None.

**Type consistency:**
- `FunnelMetric`, `TrackScoreDist`, `TimeInStage`, `ScoreBand` exported from `lib/analytics.ts` in Task 1 — imported by Tasks 2, 3, 4, 5 respectively. ✅
- Page in Task 6 imports helper functions and types from `@/lib/analytics` — matches Task 1 exports. ✅
- Sidebar entry in Task 7 uses the same `NavItem` shape as existing entries. ✅
