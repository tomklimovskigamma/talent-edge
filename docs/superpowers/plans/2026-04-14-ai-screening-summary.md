# AI Screening Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI Screening Summary block to every candidate profile that surfaces the two strongest dimensions, the development area, a cohort percentile, and a recommendation badge — visible to admins only.

**Architecture:** Pure summary logic lives in `lib/screening.ts` (no React, fully testable). A client component `AiScreeningSummary` reads persona and returns null for graduates. The candidate profile page (already a server component) imports the component and passes the candidate prop — no structural changes needed.

**Tech Stack:** TypeScript, vitest (new), React 19 client component, lucide-react, Tailwind v4, existing `usePersona` hook from `lib/persona.tsx`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `vitest.config.ts` | Create | Vitest configuration with `@/` path alias |
| `lib/screening.ts` | Create | Pure `generateScreeningSummary(candidate)` function |
| `__tests__/screening.test.ts` | Create | Unit tests for the screening logic |
| `components/profile/AiScreeningSummary.tsx` | Create | Client component that renders the summary block |
| `app/candidates/[id]/page.tsx` | Modify | Add `<AiScreeningSummary>` into the profile grid |

---

### Task 1: Install vitest and configure path aliases

No test runner exists in this project. Vitest integrates with the existing Vite/TypeScript setup and handles the `@/` alias via `vite-tsconfig-paths`.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Install vitest and vite-tsconfig-paths**

```bash
cd /Users/tomklimovski/Github/talent-edge
npm install --save-dev vitest vite-tsconfig-paths
```

Expected: packages added to `devDependencies`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 3: Add test script to `package.json`**

In `package.json`, change the `"scripts"` block to:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
},
```

- [ ] **Step 4: Verify vitest runs (no tests yet)**

```bash
npm test
```

Expected output: `No test files found` or similar — vitest exits cleanly with no errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest with tsconfig path alias support"
```

---

### Task 2: Pure screening logic in `lib/screening.ts`

This is the brain of the feature. It takes a `Candidate` and returns a structured `ScreeningSummary` — no React, no side effects, fully deterministic.

**Files:**
- Create: `__tests__/screening.test.ts`
- Create: `lib/screening.ts`

- [ ] **Step 1: Write the failing tests in `__tests__/screening.test.ts`**

```ts
// __tests__/screening.test.ts
import { describe, it, expect } from "vitest";
import { generateScreeningSummary } from "@/lib/screening";
import type { Candidate } from "@/lib/data/candidates";

// Candidate with clear non-tied scores for deterministic assertions
const candidate: Candidate = {
  id: "test-1",
  name: "Jordan Lee",
  university: "Test University",
  degree: "B. Commerce",
  graduationYear: 2026,
  stage: "Assessed",
  appliedDate: "2026-01-01",
  daysInStage: 1,
  potentialScore: 89,
  avatarInitials: "JL",
  assessmentHistory: [],
  dimensions: {
    adaptability: 70,           // bottom
    cognitiveAgility: 90,       // top 2
    emotionalIntelligence: 75,
    collaboration: 95,          // top 1
    drive: 80,
  },
};

describe("generateScreeningSummary", () => {
  it("uses the candidate's first name only", () => {
    const result = generateScreeningSummary(candidate);
    expect(result.text).toContain("Jordan");
    expect(result.text).not.toContain("Lee");
  });

  it("mentions the top two dimensions in the summary text", () => {
    const result = generateScreeningSummary(candidate);
    // collaboration (95) and cognitiveAgility (90) are top 2
    expect(result.text).toContain("collaborative instinct and team elevation");
    expect(result.text).toContain("speed of learning and reasoning under uncertainty");
  });

  it("names the weakest dimension as a development area", () => {
    const result = generateScreeningSummary(candidate);
    // adaptability (70) is the bottom
    expect(result.text).toContain("Adaptability");
    expect(result.text).toContain("development");
  });

  it("returns advance recommendation for score >= 80", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 80 });
    expect(result.recommendation.variant).toBe("advance");
    expect(result.recommendation.text).toBe("Recommended for progression");
  });

  it("returns review recommendation for score 65–79", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 72 });
    expect(result.recommendation.variant).toBe("review");
    expect(result.recommendation.text).toBe("Review before progressing");
  });

  it("returns hold recommendation for score < 65", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 60 });
    expect(result.recommendation.variant).toBe("hold");
    expect(result.recommendation.text).toBe("Not recommended for progression");
  });

  it("includes a cohort percentile phrase for high scorers", () => {
    const result = generateScreeningSummary({ ...candidate, potentialScore: 89 });
    expect(result.text).toContain("top 15%");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 7 tests fail with `Cannot find module '@/lib/screening'`.

- [ ] **Step 3: Create `lib/screening.ts`**

```ts
// lib/screening.ts
import type { Candidate, PotentialDimensions } from "@/lib/data/candidates";

const strengthDescriptions: Record<keyof PotentialDimensions, string> = {
  adaptability: "capacity to adapt through change",
  cognitiveAgility: "speed of learning and reasoning under uncertainty",
  emotionalIntelligence: "emotional intelligence and interpersonal awareness",
  collaboration: "collaborative instinct and team elevation",
  drive: "drive and self-imposed ambition",
};

const dimensionNames: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};

function percentileText(score: number): string {
  if (score >= 90) return "top 5%";
  if (score >= 85) return "top 15%";
  if (score >= 80) return "top 30%";
  if (score >= 75) return "top 45%";
  if (score >= 65) return "above average";
  return "below the cohort average";
}

export type Recommendation = {
  text: string;
  variant: "advance" | "review" | "hold";
};

export type ScreeningSummary = {
  text: string;
  recommendation: Recommendation;
};

export function generateScreeningSummary(candidate: Candidate): ScreeningSummary {
  const { dimensions, potentialScore, name } = candidate;
  const firstName = name.split(" ")[0];

  const sorted = (Object.entries(dimensions) as [keyof PotentialDimensions, number][])
    .sort((a, b) => b[1] - a[1]);

  const top1 = sorted[0][0];
  const top2 = sorted[1][0];
  const bottom = sorted[sorted.length - 1][0];

  const percentile = percentileText(potentialScore);
  const cohortPhrase =
    potentialScore >= 65
      ? `place them in the ${percentile} of assessed candidates`
      : `place them ${percentile}`;

  const text =
    `${firstName}'s ${strengthDescriptions[top1]} and ${strengthDescriptions[top2]} ` +
    `${cohortPhrase}. ${dimensionNames[bottom]} is an area for development.`;

  const recommendation: Recommendation =
    potentialScore >= 80
      ? { text: "Recommended for progression", variant: "advance" }
      : potentialScore >= 65
      ? { text: "Review before progressing", variant: "review" }
      : { text: "Not recommended for progression", variant: "hold" };

  return { text, recommendation };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: `7 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/screening.ts __tests__/screening.test.ts
git commit -m "feat: add generateScreeningSummary pure function with tests"
```

---

### Task 3: `AiScreeningSummary` client component

Renders the summary block. Returns null for graduate/null personas so the same component can be dropped into any admin view without conditional wrapping at the call site.

**Files:**
- Create: `components/profile/AiScreeningSummary.tsx`

- [ ] **Step 1: Create `components/profile/AiScreeningSummary.tsx`**

```tsx
// components/profile/AiScreeningSummary.tsx
"use client";
import { Sparkles } from "lucide-react";
import { usePersona } from "@/lib/persona";
import { generateScreeningSummary } from "@/lib/screening";
import type { Candidate } from "@/lib/data/candidates";

export function AiScreeningSummary({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  if (persona !== "admin") return null;

  const { text, recommendation } = generateScreeningSummary(candidate);

  const badgeClass =
    recommendation.variant === "advance"
      ? "bg-emerald-100 text-emerald-800"
      : recommendation.variant === "review"
      ? "bg-amber-100 text-amber-800"
      : "bg-rose-100 text-rose-800";

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-700">AI Screening Summary</h3>
        <span className="text-xs text-slate-400 ml-auto">Powered by Talent Edge AI</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{text}</p>
      <span className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${badgeClass}`}>
        {recommendation.text}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/profile/AiScreeningSummary.tsx
git commit -m "feat: add AiScreeningSummary client component"
```

---

### Task 4: Wire into the candidate profile page

Add the summary block above the radar/timeline grid so it's the first thing an admin sees below the profile header.

**Files:**
- Modify: `app/candidates/[id]/page.tsx`

The current file at `app/candidates/[id]/page.tsx` has this structure:

```tsx
<AppShell>
  <div className="space-y-5 max-w-5xl">
    <div className="flex items-center justify-between">
      {/* back link + Send Assessment button */}
    </div>
    <ProfileHeader candidate={candidate} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PotentialRadar ... />
      <div className="space-y-4">
        <AssessmentTimeline ... />
        {candidate.developmentGoals && <DevelopmentTracker ... />}
      </div>
    </div>
  </div>
</AppShell>
```

- [ ] **Step 1: Add the import and component to `app/candidates/[id]/page.tsx`**

Add `AiScreeningSummary` to the imports at the top of the file:

```tsx
import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { AiScreeningSummary } from "@/components/profile/AiScreeningSummary";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
```

Then add `<AiScreeningSummary candidate={candidate} />` between `<ProfileHeader>` and the grid:

```tsx
<ProfileHeader candidate={candidate} />

<AiScreeningSummary candidate={candidate} />

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

The full updated file:

```tsx
import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { AiScreeningSummary } from "@/components/profile/AiScreeningSummary";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) notFound();

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/pipeline" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={14} />
            Pipeline
          </Link>
          {candidate.stage === "Applied" && (
            <Link href="/assessment">
              <Button size="sm" variant="outline" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <Send size={13} />
                Send Assessment
              </Button>
            </Link>
          )}
        </div>

        <ProfileHeader candidate={candidate} />

        <AiScreeningSummary candidate={candidate} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PotentialRadar dimensions={candidate.dimensions} />
          <div className="space-y-4">
            <AssessmentTimeline history={candidate.assessmentHistory} />
            {candidate.developmentGoals && (
              <DevelopmentTracker goals={candidate.developmentGoals} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) and choose **Admin** persona.
2. Navigate to Pipeline → click any assessed/shortlisted candidate.
3. Confirm: AI Screening Summary block appears between the profile header and radar chart.
4. Confirm: summary text names two strengths, one development dimension, a percentile phrase.
5. Confirm: recommendation badge colour matches score (green/amber/red).
6. Switch persona to Graduate at `/` and navigate back to any candidate profile (via direct URL).
7. Confirm: AI Screening Summary block is absent for Graduate persona.

- [ ] **Step 3: Commit**

```bash
git add app/candidates/\[id\]/page.tsx
git commit -m "feat: add AI screening summary to candidate profile (admin only)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Two strongest dimensions named in summary text
- ✅ Weakest dimension named as development area
- ✅ Cohort percentile phrase included
- ✅ Recommendation badge with advance/review/hold variants
- ✅ Admin-only (Graduate persona sees nothing)
- ✅ Placed between profile header and radar chart

**Placeholder scan:** None. All code is complete.

**Type consistency:**
- `ScreeningSummary.recommendation` is typed as `Recommendation` in both `lib/screening.ts` and used in `AiScreeningSummary.tsx` — consistent.
- `Candidate` is imported from `@/lib/data/candidates` in both `lib/screening.ts` and `AiScreeningSummary.tsx` — consistent.
- `generateScreeningSummary` signature is `(candidate: Candidate): ScreeningSummary` — matches all call sites.
