# Cohort Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Cohort Intelligence" card to the dashboard showing three insight strings computed from real candidate data — strongest dimension, weakest dimension, and top-performing track.

**Architecture:** Pure-function helpers live in a new `lib/cohort.ts` (track classification, dimension averages, track averages). `ASSESSED_PLUS_STAGES` moves from `lib/utils.ts` to `lib/cohort.ts` and is re-exported from `utils.ts` for backward compat. A server component `CohortInsights` renders three bullets on the dashboard between `<MetricsRow />` and the funnel/score-distribution grid.

**Tech Stack:** TypeScript, React 19 server component, Tailwind v4, lucide-react (Sparkles icon), vitest. Reuses the existing `dimensionLabels` export from `lib/data/candidates.ts`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/cohort.ts` | Create | `classifyTrack`, `computeDimensionAverages`, `strongestDimension`, `weakestDimension`, `computeTrackAverages`, owns `ASSESSED_PLUS_STAGES` |
| `lib/utils.ts` | Modify | Re-export `ASSESSED_PLUS_STAGES` from `cohort.ts`; remove local definition |
| `__tests__/cohort.test.ts` | Create | Unit tests for all `lib/cohort.ts` helpers |
| `components/dashboard/CohortInsights.tsx` | Create | Server component rendering the three-bullet card |
| `app/dashboard/page.tsx` | Modify | Insert `<CohortInsights />` between `<MetricsRow />` and the funnel grid |

---

### Task 1: `lib/cohort.ts` — pure computation helpers + tests

**Files:**
- Create: `lib/cohort.ts`
- Create: `__tests__/cohort.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/cohort.test.ts`:

```ts
// __tests__/cohort.test.ts
import { describe, it, expect } from "vitest";
import type { Candidate } from "@/lib/data/candidates";
import {
  classifyTrack,
  computeDimensionAverages,
  strongestDimension,
  weakestDimension,
  computeTrackAverages,
} from "@/lib/cohort";

const stub = (overrides: Partial<Candidate>): Candidate =>
  ({
    id: "x",
    name: "Test",
    university: "Test Uni",
    degree: "B. Commerce (Finance)",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-01-01",
    daysInStage: 1,
    potentialScore: 80,
    dimensions: {
      adaptability: 80,
      cognitiveAgility: 80,
      emotionalIntelligence: 80,
      collaboration: 80,
      drive: 80,
    },
    assessmentHistory: [],
    avatarInitials: "T",
    ...overrides,
  } as Candidate);

describe("classifyTrack", () => {
  it("classifies Finance degrees", () => {
    expect(classifyTrack("B. Commerce (Finance)")).toBe("Finance");
    expect(classifyTrack("Bachelor of Economics")).toBe("Finance");
    expect(classifyTrack("B. Business (Accounting)")).toBe("Finance");
  });

  it("classifies Technology degrees", () => {
    expect(classifyTrack("B. Software Engineering")).toBe("Technology");
    expect(classifyTrack("B. Computer Science")).toBe("Technology");
    expect(classifyTrack("B. Information Technology")).toBe("Technology");
  });

  it("classifies People & Culture degrees", () => {
    expect(classifyTrack("B. Psychology")).toBe("People & Culture");
    expect(classifyTrack("B. Arts (Sociology)")).toBe("People & Culture");
    expect(classifyTrack("B. Human Resources")).toBe("People & Culture");
  });

  it("prefers Finance when a degree matches both Finance and Technology keywords", () => {
    // "B. Commerce (Data Analytics)" contains both "commerce" and "data"
    expect(classifyTrack("B. Commerce (Data Analytics)")).toBe("Finance");
  });

  it("returns Other for unrecognised degrees", () => {
    expect(classifyTrack("B. Medicine")).toBe("Other");
  });

  it("is case-insensitive", () => {
    expect(classifyTrack("B. FINANCE")).toBe("Finance");
  });
});

describe("computeDimensionAverages", () => {
  it("averages dimensions across assessed+ candidates only", () => {
    const cohort = [
      stub({ stage: "Assessed", dimensions: { adaptability: 80, cognitiveAgility: 70, emotionalIntelligence: 60, collaboration: 90, drive: 50 } }),
      stub({ stage: "Hired", dimensions: { adaptability: 70, cognitiveAgility: 80, emotionalIntelligence: 60, collaboration: 70, drive: 50 } }),
      // Applied must be excluded
      stub({ stage: "Applied", dimensions: { adaptability: 10, cognitiveAgility: 10, emotionalIntelligence: 10, collaboration: 10, drive: 10 } }),
    ];
    const avgs = computeDimensionAverages(cohort);
    expect(avgs.adaptability).toBe(75);
    expect(avgs.cognitiveAgility).toBe(75);
    expect(avgs.emotionalIntelligence).toBe(60);
    expect(avgs.collaboration).toBe(80);
    expect(avgs.drive).toBe(50);
  });
});

describe("strongestDimension / weakestDimension", () => {
  const avgs = {
    adaptability: 75,
    cognitiveAgility: 75,
    emotionalIntelligence: 60,
    collaboration: 87,
    drive: 71,
  };

  it("strongestDimension returns the highest with label and gap to weakest", () => {
    const s = strongestDimension(avgs);
    expect(s.dim).toBe("collaboration");
    expect(s.label).toBe("Collaboration");
    expect(s.average).toBe(87);
    expect(s.gap).toBe(27); // 87 - 60
  });

  it("weakestDimension returns the lowest with label and gap to strongest", () => {
    const w = weakestDimension(avgs);
    expect(w.dim).toBe("emotionalIntelligence");
    expect(w.label).toBe("Emotional Intelligence");
    expect(w.average).toBe(60);
    expect(w.gap).toBe(27); // 87 - 60
  });
});

describe("computeTrackAverages", () => {
  it("averages potentialScore per track, excluding Applied and Other", () => {
    const cohort = [
      stub({ stage: "Assessed", degree: "B. Commerce (Finance)", potentialScore: 84 }),
      stub({ stage: "Hired", degree: "B. Economics", potentialScore: 84 }),
      stub({ stage: "Interview", degree: "B. Software Engineering", potentialScore: 79 }),
      stub({ stage: "Offer", degree: "B. Psychology", potentialScore: 76 }),
      // excluded — Applied
      stub({ stage: "Applied", degree: "B. Finance", potentialScore: 10 }),
      // excluded — Other
      stub({ stage: "Hired", degree: "B. Medicine", potentialScore: 99 }),
    ];
    const t = computeTrackAverages(cohort);
    expect(t.Finance).toBe(84);
    expect(t.Technology).toBe(79);
    expect(t["People & Culture"]).toBe(76);
  });

  it("returns 0 for a track with no matching candidates", () => {
    const cohort = [stub({ stage: "Assessed", degree: "B. Finance", potentialScore: 80 })];
    const t = computeTrackAverages(cohort);
    expect(t.Technology).toBe(0);
    expect(t["People & Culture"]).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests — confirm they fail**

```bash
cd /Users/tomklimovski/Github/talent-edge && npm test -- __tests__/cohort.test.ts 2>&1 | tail -20
```

Expected: all tests fail with module-not-found on `@/lib/cohort`.

- [ ] **Step 3: Implement `lib/cohort.ts`**

Create `lib/cohort.ts`:

```ts
// lib/cohort.ts
import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";
import { dimensionLabels } from "@/lib/data/candidates";
import type { StageName } from "@/lib/data/program";

export const ASSESSED_PLUS_STAGES: ReadonlySet<StageName> = new Set<StageName>([
  "Assessed",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
]);

export type Track = "Finance" | "Technology" | "People & Culture" | "Other";

const TRACK_KEYWORDS: { track: Exclude<Track, "Other">; patterns: string[] }[] = [
  { track: "Finance", patterns: ["finance", "commerce", "economics", "accounting", "business"] },
  { track: "Technology", patterns: ["engineering", "computer", "software", "data", "information technology", " it"] },
  { track: "People & Culture", patterns: ["psychology", "human resources", "hr", "arts", "sociology", "education"] },
];

export function classifyTrack(degree: string): Track {
  const lower = ` ${degree.toLowerCase()} `;
  for (const { track, patterns } of TRACK_KEYWORDS) {
    if (patterns.some((p) => lower.includes(p))) return track;
  }
  return "Other";
}

const DIM_KEYS: (keyof PotentialDimensions)[] = [
  "adaptability",
  "cognitiveAgility",
  "emotionalIntelligence",
  "collaboration",
  "drive",
];

function assessedPlus(candidates: Candidate[]): Candidate[] {
  return candidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
}

export function computeDimensionAverages(
  candidates: Candidate[]
): Record<keyof PotentialDimensions, number> {
  const pool = assessedPlus(candidates);
  const out = {} as Record<keyof PotentialDimensions, number>;
  for (const key of DIM_KEYS) {
    const sum = pool.reduce((acc, c) => acc + c.dimensions[key], 0);
    out[key] = pool.length === 0 ? 0 : Math.round(sum / pool.length);
  }
  return out;
}

type DimInsight = {
  dim: keyof PotentialDimensions;
  label: string;
  average: number;
  gap: number;
};

export function strongestDimension(
  averages: Record<keyof PotentialDimensions, number>
): DimInsight {
  const sorted = [...DIM_KEYS].sort((a, b) => averages[b] - averages[a]);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  return {
    dim: top,
    label: dimensionLabels[top],
    average: averages[top],
    gap: averages[top] - averages[bottom],
  };
}

export function weakestDimension(
  averages: Record<keyof PotentialDimensions, number>
): DimInsight {
  const sorted = [...DIM_KEYS].sort((a, b) => averages[a] - averages[b]);
  const bottom = sorted[0];
  const top = sorted[sorted.length - 1];
  return {
    dim: bottom,
    label: dimensionLabels[bottom],
    average: averages[bottom],
    gap: averages[top] - averages[bottom],
  };
}

export function computeTrackAverages(
  candidates: Candidate[]
): Record<Exclude<Track, "Other">, number> {
  const pool = assessedPlus(candidates);
  const out: Record<Exclude<Track, "Other">, number> = {
    Finance: 0,
    Technology: 0,
    "People & Culture": 0,
  };
  for (const track of ["Finance", "Technology", "People & Culture"] as const) {
    const members = pool.filter((c) => classifyTrack(c.degree) === track);
    if (members.length === 0) continue;
    const sum = members.reduce((acc, c) => acc + c.potentialScore, 0);
    out[track] = Math.round(sum / members.length);
  }
  return out;
}
```

Note on the `" it"` pattern in Technology: the degree string is wrapped with leading/trailing spaces before matching, so `" it"` matches "Information IT" but not "commerce" or "business". This avoids false-positives on words containing the letters "it" (e.g. "commercIT" would never match since we need a space before).

- [ ] **Step 4: Run the tests — confirm they pass**

```bash
npm test -- __tests__/cohort.test.ts 2>&1 | tail -20
```

Expected: all cohort tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/cohort.ts __tests__/cohort.test.ts
git commit -m "feat: add cohort computation helpers with tests"
```

---

### Task 2: Move `ASSESSED_PLUS_STAGES` from `lib/utils.ts` to `lib/cohort.ts`

**Files:**
- Modify: `lib/utils.ts`

`lib/cohort.ts` now exports `ASSESSED_PLUS_STAGES`. Update `lib/utils.ts` to import it instead of redefining it, preserving the existing `scorePercentile` behavior.

- [ ] **Step 1: Rewrite `lib/utils.ts`**

Replace the file with:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Candidate } from "@/lib/data/candidates";
import { ASSESSED_PLUS_STAGES } from "@/lib/cohort";

export { ASSESSED_PLUS_STAGES };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-800";
  if (score >= 65) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "High Potential";
  if (score >= 65) return "Emerging";
  return "Developing";
}

export function stageColor(stage: string): string {
  const map: Record<string, string> = {
    Applied: "bg-slate-100 text-slate-700",
    Assessed: "bg-blue-100 text-blue-700",
    Shortlisted: "bg-violet-100 text-violet-700",
    Interview: "bg-amber-100 text-amber-700",
    Offer: "bg-orange-100 text-orange-700",
    Hired: "bg-emerald-100 text-emerald-700",
  };
  return map[stage] ?? "bg-slate-100 text-slate-700";
}

const FULL_COHORT_SIZE = 142;

export function scorePercentile(score: number, allCandidates: Candidate[]): string {
  const assessed = allCandidates.filter((c) => ASSESSED_PLUS_STAGES.has(c.stage));
  const aboveCount = assessed.filter((c) => c.potentialScore > score).length;
  const percentile = Math.max(1, Math.round((aboveCount / FULL_COHORT_SIZE) * 100));
  return `Top ${percentile}% of cohort`;
}
```

- [ ] **Step 2: Run the full test suite — confirm no regressions**

```bash
npm test 2>&1 | tail -10
```

Expected: all tests pass (existing `scorePercentile` tests + new cohort tests).

- [ ] **Step 3: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add lib/utils.ts
git commit -m "refactor: move ASSESSED_PLUS_STAGES to lib/cohort"
```

---

### Task 3: `CohortInsights` component

**Files:**
- Create: `components/dashboard/CohortInsights.tsx`

A server component (no `"use client"` directive) that computes the three insights at render time and displays them in a card.

- [ ] **Step 1: Create `components/dashboard/CohortInsights.tsx`**

```tsx
// components/dashboard/CohortInsights.tsx
import { Sparkles } from "lucide-react";
import { candidates } from "@/lib/data/candidates";
import {
  computeDimensionAverages,
  strongestDimension,
  weakestDimension,
  computeTrackAverages,
} from "@/lib/cohort";

export function CohortInsights() {
  const dimAvgs = computeDimensionAverages(candidates);
  const strong = strongestDimension(dimAvgs);
  const weak = weakestDimension(dimAvgs);
  const tracks = computeTrackAverages(candidates);

  const strongestText = `${strong.label} is this cohort's standout strength — averaging ${strong.average} across all assessed candidates.`;

  const weakestText = `${weak.label} is the development opportunity — cohort average of ${weak.average}, ${weak.gap} points below ${strong.label}.`;

  const trackEntries = (["Finance", "Technology", "People & Culture"] as const)
    .map((t) => ({ track: t, avg: tracks[t] }))
    .sort((a, b) => b.avg - a.avg);
  const [leader, second, third] = trackEntries;
  const trackText = `${leader.track} track candidates lead on overall potential score (${leader.avg} avg) vs ${second.track} (${second.avg}) and ${third.track} (${third.avg}).`;

  const bullets: { dotClass: string; text: string }[] = [
    { dotClass: "bg-indigo-500", text: strongestText },
    { dotClass: "bg-violet-500", text: weakestText },
    { dotClass: "bg-amber-500", text: trackText },
  ];

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={14} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Cohort Intelligence</h2>
      </div>
      <div className="space-y-2.5">
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${b.dotClass}`} />
            <p className="text-sm text-slate-600 leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Confirm build passes**

```bash
npm run build
```

Expected: clean build. Component is not yet wired in, but TypeScript still validates it.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/CohortInsights.tsx
git commit -m "feat: add CohortInsights dashboard card"
```

---

### Task 4: Wire `CohortInsights` into the dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

Insert `<CohortInsights />` between `<MetricsRow />` and the funnel/score-distribution grid.

- [ ] **Step 1: Edit `app/dashboard/page.tsx`**

Add the import near the top:

```tsx
import { CohortInsights } from "@/components/dashboard/CohortInsights";
```

Replace the existing block:

```tsx
        <MetricsRow />

        <div className="grid grid-cols-2 gap-4">
          <PipelineFunnel />
          <ScoreDistribution />
        </div>
```

with:

```tsx
        <MetricsRow />

        <CohortInsights />

        <div className="grid grid-cols-2 gap-4">
          <PipelineFunnel />
          <ScoreDistribution />
        </div>
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 3: Confirm build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000/dashboard` (any persona — dashboard is admin-only by route).
2. Confirm a **"Cohort Intelligence"** card appears between the metrics row and the funnel row.
3. Confirm the card shows three bullets with a Sparkles icon in the header.
4. Confirm bullet text references real dimension and track names (not "TBD" or template tokens).
5. Confirm numbers are integers (no decimals).
6. Spot-check the track comparison: open `lib/data/candidates.ts` and confirm that degrees containing "Finance"/"Commerce"/"Economics" roll up under Finance, etc.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: wire CohortInsights into dashboard"
```

---

## Self-Review

**Spec coverage:**
- ✅ Insight 1 strongest dimension — Task 1 (`strongestDimension`), Task 3 (`strongestText`)
- ✅ Insight 2 weakest dimension with gap reference — Task 1 (`weakestDimension`), Task 3 (`weakestText`)
- ✅ Insight 3 track comparison — Task 1 (`computeTrackAverages`), Task 3 (`trackText` sorts and builds leader vs others)
- ✅ Track classification via keyword match on `degree`, Finance-first ordering — Task 1 (`TRACK_KEYWORDS` order)
- ✅ `ASSESSED_PLUS_STAGES` owned by `lib/cohort.ts`, re-exported from `lib/utils.ts` — Task 1 + Task 2
- ✅ Placement between MetricsRow and funnel grid — Task 4
- ✅ Sparkles icon, card styling, colored dots — Task 3
- ✅ Dimension labels reuse existing `dimensionLabels` from `lib/data/candidates.ts` — Task 1
- ✅ Tests cover classifyTrack, computeDimensionAverages (excludes Applied), strongestDimension/weakestDimension (pick + gap), computeTrackAverages — Task 1

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `classifyTrack` returns `Track` = union including `"Other"`; `computeTrackAverages` returns `Record<Exclude<Track, "Other">, number>` — Task 3 indexes only known tracks. ✅
- `strongestDimension` / `weakestDimension` both return `DimInsight` with matching fields — Task 3 destructures `.label`, `.average`, `.gap` consistently. ✅
- `dimensionLabels` imported in Task 1 matches the existing export in `lib/data/candidates.ts:11`. ✅
- `computeTrackAverages` result keyed by literal strings `Finance`, `Technology`, `People & Culture` — matches Task 3's sort and render. ✅
