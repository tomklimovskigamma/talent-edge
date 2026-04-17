# Program Analytics Page Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Add an admin-only `/analytics` route with four recharts panels — pipeline funnel with retention, score distribution by track, time-in-stage averages, and score-band breakdown — linked from the sidebar.

## Route

New `app/analytics/page.tsx`. No server-side persona guard; discovery is via the sidebar, which hides the entry for graduates. This matches the existing `/settings/assessment` route convention.

## Sidebar

Add a nav item between Pipeline and Settings in `components/layout/Sidebar.tsx`:

```ts
{ href: "/analytics", label: "Analytics", icon: BarChart3, graduateOnly: false, adminOnly: true },
```

`BarChart3` imported from `lucide-react`.

## Data Sources

- **Pipeline funnel** uses `pipelineCounts` from `lib/data/program.ts` — the simulated 142-cohort already rendered on the dashboard. Reusing it keeps the funnel visually consistent with the dashboard's `PipelineFunnel`.
- **Score distribution by track, time-in-stage, score band** compute from the 19 seeded candidates in `lib/data/candidates.ts`. Track grouping reuses `classifyTrack` from `lib/cohort.ts`.

## Helpers

New file `lib/analytics.ts` exposing four pure functions:

```ts
export type FunnelMetric = { stage: StageName; count: number; retainedPct: number };
export type TrackScoreDist = { track: Track; high: number; emerging: number; developing: number };
export type TimeInStage = { stage: StageName; avgDays: number };
export type ScoreBand = { band: "High Potential" | "Emerging" | "Developing"; count: number; color: string };

export function computeFunnelMetrics(counts: Record<StageName, number>): FunnelMetric[];
export function computeScoreDistByTrack(candidates: Candidate[]): TrackScoreDist[];
export function computeTimeInStage(candidates: Candidate[]): TimeInStage[];
export function computeScoreBandBreakdown(candidates: Candidate[]): ScoreBand[];
```

### Behaviour

- `computeFunnelMetrics`: iterates `stages` (from `lib/data/program.ts`) so `"Rejected"` is excluded. `retainedPct = Math.round((count / firstStageCount) * 100)`. The first stage is always `100`.
- `computeScoreDistByTrack`: filters to `ASSESSED_PLUS_STAGES` (reuse `lib/cohort.ts` export), partitions by `classifyTrack`. Excludes `"Other"`. Always returns exactly three entries, one per track, even when a track has zero members (zero counts).
- `computeTimeInStage`: iterates `stages`, averages `daysInStage` for candidates whose effective stage (use raw `candidate.stage` — no overrides context here) equals the iteration stage. Stages with zero members are **omitted** from the returned array.
- `computeScoreBandBreakdown`: filters to `ASSESSED_PLUS_STAGES`. Thresholds: `>= 80` High, `65–79` Emerging, `< 65` Developing. Colours match the existing `scoreColor` palette — emerald-500, amber-500, rose-500 (hex values so recharts doesn't need Tailwind resolution).

## Chart Components

All four live under `components/analytics/` and are client components with recharts.

### `FunnelPanel.tsx`
Vertical bar chart (one bar per stage) reading `FunnelMetric[]`. Uses `LabelList` on the bar to overlay the retention `%` above each bar. Colours match the existing PipelineFunnel palette for continuity.

### `ScoreByTrackPanel.tsx`
Grouped bar chart. X-axis: the three tracks. Three bars per group keyed `high` (emerald-500), `emerging` (amber-500), `developing` (rose-500). Legend at bottom.

### `TimeInStagePanel.tsx`
Horizontal bar chart (recharts `BarChart` with `layout="vertical"`). One bar per stage. `avgDays` as value, number-formatted with `"d"` suffix in the tooltip.

### `ScoreBandPanel.tsx`
Donut via recharts `PieChart` with `innerRadius=50, outerRadius=75`. Three slices (High / Emerging / Developing). Centre label shows total assessed+ count (computed as the sum of slice counts).

All panels wrap in the existing `<Card>` primitive for consistency with dashboard panels. Each card has a `<CardHeader>` title; no subtitle.

## Page Layout

```tsx
// app/analytics/page.tsx (server component)
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

The helpers compute at render time (build-time for static prerender). No state, no fetching.

## Tests

`__tests__/analytics.test.ts`:

- **`computeFunnelMetrics`**
  - First stage has `retainedPct === 100`.
  - Retention percentages are integers.
  - Retention is monotonically non-increasing down the funnel.
  - Excludes `Rejected` from output.
- **`computeScoreDistByTrack`**
  - Excludes Applied candidates.
  - Returns exactly 3 entries (Finance, Technology, People & Culture), even for inputs where one track has no assessed members.
  - Band partitioning honours the 65/80 thresholds.
  - `"Other"` track candidates are excluded.
- **`computeTimeInStage`**
  - Averages `daysInStage` correctly for a single stage.
  - Omits stages with zero members.
- **`computeScoreBandBreakdown`**
  - Boundary behaviour: score of 65 → Emerging; score of 80 → High Potential.
  - Excludes Applied candidates.
  - Returns exactly three bands.

Chart components are not unit-tested — they're thin recharts wrappers with no branching logic.

## Non-Goals

- No drill-down links from chart elements to candidate lists.
- No date-range filtering; the page is always "full cohort".
- No export (PDF, CSV).
- No server-side persona guard — graduates who guess the URL see the page. Acceptable for a demo.
- No "empty-state" UI — seed data guarantees meaningful values.
- No Rejected-stage slice or track — out of scope for this feature.

## Files

| File | Action | Responsibility |
|---|---|---|
| `lib/analytics.ts` | Create | Four pure computation helpers |
| `__tests__/analytics.test.ts` | Create | Unit tests for the helpers |
| `components/analytics/FunnelPanel.tsx` | Create | Pipeline funnel chart with retention % |
| `components/analytics/ScoreByTrackPanel.tsx` | Create | Grouped bar by track |
| `components/analytics/TimeInStagePanel.tsx` | Create | Horizontal bar of avg days per stage |
| `components/analytics/ScoreBandPanel.tsx` | Create | Donut of score-band distribution |
| `app/analytics/page.tsx` | Create | Server page composing the four panels |
| `components/layout/Sidebar.tsx` | Modify | Add admin-only Analytics nav entry |

## Spec Self-Review

- **Placeholders:** None.
- **Internal consistency:** All four helpers filter their inputs via the same `ASSESSED_PLUS_STAGES` rule where stated; `Rejected` is excluded consistently. Chart colours are specified as hex so there's no Tailwind-resolution ambiguity.
- **Scope:** Eight files, one new route. Sizeable but cohesive — one feature, one plan.
- **Ambiguity:** Score-band boundaries are explicit (65 → Emerging, 80 → High). Zero-member stage behaviour is explicit (funnel: included; track-dist: included with zero counts; time-in-stage: omitted; score-band: always three). Persona gating is explicitly sidebar-only, not server-enforced.
