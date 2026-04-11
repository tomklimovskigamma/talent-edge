# Talent Edge Demo Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished demo web app for Talent Edge — an AI-powered early careers recruitment platform — compelling enough to show a potential client (Paula) what the full lifecycle looks like in one product.

**Architecture:** Next.js App Router SPA with no backend — all data is seeded in TypeScript files and rendered client-side. Simulated AI scores and assessments are pre-computed in seed data. No auth, no database; the "login" screen is a demo entry point only.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, Vercel (free hosting)

**Note on TDD:** This is a demo prototype with 100% simulated data. Unit tests add no value here — each task focuses on building and visually verifying the screen instead of a test/implement cycle.

---

## File Map

```
talent-edge/
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                          # shadcn config
├── public/
│   └── te-logo.svg                          # Talent Edge SVG logo
├── app/
│   ├── globals.css
│   ├── layout.tsx                           # Root layout, fonts, metadata
│   ├── page.tsx                             # Splash / demo login screen
│   ├── dashboard/
│   │   └── page.tsx                         # Program dashboard
│   ├── pipeline/
│   │   └── page.tsx                         # Candidate pipeline (Kanban)
│   └── candidates/
│       └── [id]/
│           └── page.tsx                     # Candidate profile
├── components/
│   ├── ui/                                  # shadcn auto-generated
│   ├── layout/
│   │   ├── AppShell.tsx                     # Sidebar + main content wrapper
│   │   ├── Sidebar.tsx                      # Left nav with Talent Edge branding
│   │   └── TopBar.tsx                       # Top bar with program context
│   ├── dashboard/
│   │   ├── MetricsRow.tsx                   # 4 KPI cards
│   │   ├── PipelineFunnel.tsx               # Recharts bar/funnel chart
│   │   └── ScoreDistribution.tsx            # AI score histogram
│   ├── pipeline/
│   │   ├── PipelineBoard.tsx                # Full Kanban board
│   │   ├── StageColumn.tsx                  # One Kanban column
│   │   └── CandidateCard.tsx                # Card with name, uni, score badge
│   └── profile/
│       ├── ProfileHeader.tsx                # Name, university, score hero
│       ├── PotentialRadar.tsx               # Recharts RadarChart (5 dimensions)
│       ├── AssessmentTimeline.tsx           # Stage-by-stage history
│       └── DevelopmentTracker.tsx           # Post-hire goals stub
└── lib/
    ├── data/
    │   ├── candidates.ts                    # 18 seeded candidates with AI scores
    │   └── program.ts                       # Program metadata, stage definitions
    └── utils.ts                             # Score colour helpers, formatters
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Initialise Next.js project**

```bash
cd /Users/tomklimovski/Github/talent-edge
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When prompted, accept all defaults. This scaffolds the full Next.js 14 App Router project.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install recharts lucide-react class-variance-authority clsx tailwind-merge
npm install -D @types/node
```

- [ ] **Step 3: Initialise shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base colour: **Slate**
- CSS variables: **Yes**

- [ ] **Step 4: Add shadcn components we'll use**

```bash
npx shadcn@latest add badge button card progress separator avatar
```

- [ ] **Step 5: Replace `app/globals.css` with brand tokens**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 243 75% 59%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 38 92% 50%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 243 75% 59%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 6: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talent Edge",
  description: "AI-Powered Early Careers Recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Verify scaffold runs**

```bash
npm run dev
```

Expected: Next.js default page loads at http://localhost:3000 with no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind and shadcn"
```

---

## Task 2: Brand Assets — Talent Edge Logo

**Files:**
- Create: `public/te-logo.svg`

- [ ] **Step 1: Create the SVG logo**

The logo is a geometric mark: two overlapping angular "edge" shapes forming a stylised upward arrow, coloured indigo, beside the wordmark "Talent Edge".

Create `public/te-logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 40" fill="none">
  <!-- Mark: stacked edge chevrons -->
  <polygon points="4,32 16,8 22,8 10,32" fill="#4F46E5"/>
  <polygon points="14,32 26,8 32,8 20,32" fill="#4F46E5" opacity="0.5"/>
  <!-- Wordmark -->
  <text x="40" y="28" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#1E1B4B" letter-spacing="-0.5">Talent Edge</text>
</svg>
```

- [ ] **Step 2: Create `lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
```

- [ ] **Step 3: Commit**

```bash
git add public/te-logo.svg lib/utils.ts
git commit -m "feat: add Talent Edge logo SVG and utility helpers"
```

---

## Task 3: Seed Data

**Files:**
- Create: `lib/data/program.ts`
- Create: `lib/data/candidates.ts`

- [ ] **Step 1: Create `lib/data/program.ts`**

```typescript
export const program = {
  clientName: "Meridian Group",
  programName: "2026 Graduate Program",
  intakeYear: 2026,
  targetHires: 20,
  openDate: "2025-03-01",
  closeDate: "2025-05-31",
  manager: "Sarah Chen",
  managerTitle: "Graduate Program Manager",
};

export type Stage = {
  id: string;
  label: string;
  order: number;
};

export const stages: Stage[] = [
  { id: "applied", label: "Applied", order: 1 },
  { id: "assessed", label: "Assessed", order: 2 },
  { id: "shortlisted", label: "Shortlisted", order: 3 },
  { id: "interview", label: "Interview", order: 4 },
  { id: "offer", label: "Offer", order: 5 },
  { id: "hired", label: "Hired", order: 6 },
];

export const pipelineCounts = {
  Applied: 187,
  Assessed: 142,
  Shortlisted: 43,
  Interview: 21,
  Offer: 9,
  Hired: 6,
};
```

- [ ] **Step 2: Create `lib/data/candidates.ts`**

These 18 candidates span all pipeline stages with varied AI potential scores, universities, and degrees. The profile view will use the first high-scoring candidate as the default deep-dive.

```typescript
export type PotentialDimensions = {
  adaptability: number;
  cognitiveAgility: number;
  emotionalIntelligence: number;
  collaboration: number;
  drive: number;
};

export type AssessmentEvent = {
  date: string;
  stage: string;
  note: string;
};

export type DevelopmentGoal = {
  title: string;
  status: "not-started" | "in-progress" | "complete";
  dueDate: string;
};

export type Candidate = {
  id: string;
  name: string;
  university: string;
  degree: string;
  graduationYear: number;
  stage: string;
  appliedDate: string;
  daysInStage: number;
  potentialScore: number;
  dimensions: PotentialDimensions;
  assessmentHistory: AssessmentEvent[];
  developmentGoals?: DevelopmentGoal[];
  avatarInitials: string;
};

export const candidates: Candidate[] = [
  {
    id: "c001",
    name: "Anika Sharma",
    university: "University of Melbourne",
    degree: "B. Commerce (Finance)",
    graduationYear: 2025,
    stage: "Shortlisted",
    appliedDate: "2025-03-12",
    daysInStage: 4,
    potentialScore: 92,
    avatarInitials: "AS",
    dimensions: {
      adaptability: 94,
      cognitiveAgility: 91,
      emotionalIntelligence: 88,
      collaboration: 95,
      drive: 93,
    },
    assessmentHistory: [
      { date: "2025-03-12", stage: "Applied", note: "Application submitted via PageUp." },
      { date: "2025-03-20", stage: "Assessed", note: "AI potential assessment completed. Score: 92. Flagged as high potential." },
      { date: "2025-03-28", stage: "Shortlisted", note: "Progressed to shortlist by program manager." },
    ],
  },
  {
    id: "c002",
    name: "James Thornton",
    university: "UNSW Sydney",
    degree: "B. Engineering (Software)",
    graduationYear: 2025,
    stage: "Interview",
    appliedDate: "2025-03-08",
    daysInStage: 2,
    potentialScore: 88,
    avatarInitials: "JT",
    dimensions: {
      adaptability: 85,
      cognitiveAgility: 93,
      emotionalIntelligence: 80,
      collaboration: 88,
      drive: 91,
    },
    assessmentHistory: [
      { date: "2025-03-08", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-17", stage: "Assessed", note: "Assessment complete. Score: 88." },
      { date: "2025-03-25", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-04-01", stage: "Interview", note: "Interview scheduled for 7 April." },
    ],
  },
  {
    id: "c003",
    name: "Priya Nair",
    university: "Monash University",
    degree: "B. Business (Marketing)",
    graduationYear: 2025,
    stage: "Offer",
    appliedDate: "2025-03-05",
    daysInStage: 1,
    potentialScore: 85,
    avatarInitials: "PN",
    dimensions: {
      adaptability: 88,
      cognitiveAgility: 82,
      emotionalIntelligence: 90,
      collaboration: 86,
      drive: 84,
    },
    assessmentHistory: [
      { date: "2025-03-05", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-14", stage: "Assessed", note: "Score: 85." },
      { date: "2025-03-22", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-29", stage: "Interview", note: "Panel interview completed. Strong performance." },
      { date: "2025-04-08", stage: "Offer", note: "Verbal offer extended. Awaiting response." },
    ],
  },
  {
    id: "c004",
    name: "Liam O'Brien",
    university: "University of Queensland",
    degree: "B. Science (Data Science)",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-02-28",
    daysInStage: 10,
    potentialScore: 90,
    avatarInitials: "LO",
    dimensions: {
      adaptability: 91,
      cognitiveAgility: 94,
      emotionalIntelligence: 85,
      collaboration: 89,
      drive: 92,
    },
    assessmentHistory: [
      { date: "2025-02-28", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-10", stage: "Assessed", note: "Score: 90. Top 5% of cohort." },
      { date: "2025-03-18", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-25", stage: "Interview", note: "Excellent panel interview." },
      { date: "2025-04-01", stage: "Offer", note: "Offer made." },
      { date: "2025-04-09", stage: "Hired", note: "Offer accepted. Start date: 23 Feb 2026." },
    ],
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Shadow senior analyst for 4 weeks", status: "not-started", dueDate: "2026-04-30" },
      { title: "First solo client deliverable", status: "not-started", dueDate: "2026-06-30" },
    ],
  },
  {
    id: "c005",
    name: "Sophie Williams",
    university: "Australian National University",
    degree: "B. Politics & Economics",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-03-18",
    daysInStage: 8,
    potentialScore: 78,
    avatarInitials: "SW",
    dimensions: {
      adaptability: 80,
      cognitiveAgility: 75,
      emotionalIntelligence: 82,
      collaboration: 79,
      drive: 76,
    },
    assessmentHistory: [
      { date: "2025-03-18", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-27", stage: "Assessed", note: "Score: 78. Emerging potential." },
    ],
  },
  {
    id: "c006",
    name: "Marcus Chen",
    university: "University of Sydney",
    degree: "B. Commerce (Accounting)",
    graduationYear: 2025,
    stage: "Shortlisted",
    appliedDate: "2025-03-10",
    daysInStage: 6,
    potentialScore: 83,
    avatarInitials: "MC",
    dimensions: {
      adaptability: 82,
      cognitiveAgility: 86,
      emotionalIntelligence: 79,
      collaboration: 84,
      drive: 85,
    },
    assessmentHistory: [
      { date: "2025-03-10", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-19", stage: "Assessed", note: "Score: 83." },
      { date: "2025-03-26", stage: "Shortlisted", note: "Shortlisted." },
    ],
  },
  {
    id: "c007",
    name: "Ella Fitzgerald",
    university: "RMIT University",
    degree: "B. Design (Communication)",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-02",
    daysInStage: 9,
    potentialScore: 71,
    avatarInitials: "EF",
    dimensions: {
      adaptability: 74,
      cognitiveAgility: 68,
      emotionalIntelligence: 76,
      collaboration: 72,
      drive: 70,
    },
    assessmentHistory: [
      { date: "2025-04-02", stage: "Applied", note: "Application submitted. Awaiting assessment." },
    ],
  },
  {
    id: "c008",
    name: "Daniel Park",
    university: "Griffith University",
    degree: "B. Business (Management)",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-05",
    daysInStage: 6,
    potentialScore: 66,
    avatarInitials: "DP",
    dimensions: {
      adaptability: 65,
      cognitiveAgility: 68,
      emotionalIntelligence: 70,
      collaboration: 63,
      drive: 67,
    },
    assessmentHistory: [
      { date: "2025-04-05", stage: "Applied", note: "Application submitted." },
    ],
  },
  {
    id: "c009",
    name: "Isabelle Moreau",
    university: "University of Adelaide",
    degree: "B. Laws / B. Commerce",
    graduationYear: 2025,
    stage: "Interview",
    appliedDate: "2025-03-07",
    daysInStage: 3,
    potentialScore: 87,
    avatarInitials: "IM",
    dimensions: {
      adaptability: 89,
      cognitiveAgility: 88,
      emotionalIntelligence: 84,
      collaboration: 87,
      drive: 90,
    },
    assessmentHistory: [
      { date: "2025-03-07", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-16", stage: "Assessed", note: "Score: 87." },
      { date: "2025-03-24", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-04-02", stage: "Interview", note: "Interview in progress." },
    ],
  },
  {
    id: "c010",
    name: "Tom Nguyen",
    university: "Deakin University",
    degree: "B. IT (Cybersecurity)",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-03-22",
    daysInStage: 5,
    potentialScore: 74,
    avatarInitials: "TN",
    dimensions: {
      adaptability: 72,
      cognitiveAgility: 79,
      emotionalIntelligence: 68,
      collaboration: 74,
      drive: 78,
    },
    assessmentHistory: [
      { date: "2025-03-22", stage: "Applied", note: "Application submitted." },
      { date: "2025-04-01", stage: "Assessed", note: "Score: 74." },
    ],
  },
  {
    id: "c011",
    name: "Grace Halliday",
    university: "University of Melbourne",
    degree: "B. Science (Psychology)",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-03-01",
    daysInStage: 12,
    potentialScore: 91,
    avatarInitials: "GH",
    dimensions: {
      adaptability: 93,
      cognitiveAgility: 90,
      emotionalIntelligence: 95,
      collaboration: 92,
      drive: 88,
    },
    assessmentHistory: [
      { date: "2025-03-01", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-09", stage: "Assessed", note: "Score: 91. Exceptional EQ." },
      { date: "2025-03-17", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-24", stage: "Interview", note: "Outstanding interview." },
      { date: "2025-03-31", stage: "Offer", note: "Offer made." },
      { date: "2025-04-08", stage: "Hired", note: "Accepted. Start date: 23 Feb 2026." },
    ],
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Lead first team project", status: "not-started", dueDate: "2026-05-31" },
    ],
  },
  {
    id: "c012",
    name: "Ryan Kowalski",
    university: "UNSW Sydney",
    degree: "B. Commerce (Economics)",
    graduationYear: 2025,
    stage: "Shortlisted",
    appliedDate: "2025-03-14",
    daysInStage: 7,
    potentialScore: 80,
    avatarInitials: "RK",
    dimensions: {
      adaptability: 79,
      cognitiveAgility: 83,
      emotionalIntelligence: 78,
      collaboration: 80,
      drive: 82,
    },
    assessmentHistory: [
      { date: "2025-03-14", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-23", stage: "Assessed", note: "Score: 80." },
      { date: "2025-03-30", stage: "Shortlisted", note: "Shortlisted." },
    ],
  },
  {
    id: "c013",
    name: "Mia Zhang",
    university: "Monash University",
    degree: "B. Accounting",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-07",
    daysInStage: 4,
    potentialScore: 69,
    avatarInitials: "MZ",
    dimensions: {
      adaptability: 67,
      cognitiveAgility: 72,
      emotionalIntelligence: 71,
      collaboration: 68,
      drive: 65,
    },
    assessmentHistory: [
      { date: "2025-04-07", stage: "Applied", note: "Application submitted." },
    ],
  },
  {
    id: "c014",
    name: "Oliver Patel",
    university: "University of Western Australia",
    degree: "B. Engineering (Civil)",
    graduationYear: 2025,
    stage: "Offer",
    appliedDate: "2025-03-03",
    daysInStage: 2,
    potentialScore: 86,
    avatarInitials: "OP",
    dimensions: {
      adaptability: 87,
      cognitiveAgility: 85,
      emotionalIntelligence: 83,
      collaboration: 88,
      drive: 89,
    },
    assessmentHistory: [
      { date: "2025-03-03", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-12", stage: "Assessed", note: "Score: 86." },
      { date: "2025-03-20", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-27", stage: "Interview", note: "Strong technical interview." },
      { date: "2025-04-07", stage: "Offer", note: "Offer made. Decision expected 14 April." },
    ],
  },
  {
    id: "c015",
    name: "Zara Ahmed",
    university: "Curtin University",
    degree: "B. Commerce (HR)",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-03-25",
    daysInStage: 3,
    potentialScore: 77,
    avatarInitials: "ZA",
    dimensions: {
      adaptability: 76,
      cognitiveAgility: 74,
      emotionalIntelligence: 82,
      collaboration: 79,
      drive: 75,
    },
    assessmentHistory: [
      { date: "2025-03-25", stage: "Applied", note: "Application submitted." },
      { date: "2025-04-03", stage: "Assessed", note: "Score: 77." },
    ],
  },
  {
    id: "c016",
    name: "Noah Campbell",
    university: "University of Newcastle",
    degree: "B. Business (Finance)",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-01",
    daysInStage: 10,
    potentialScore: 62,
    avatarInitials: "NC",
    dimensions: {
      adaptability: 60,
      cognitiveAgility: 65,
      emotionalIntelligence: 63,
      collaboration: 61,
      drive: 64,
    },
    assessmentHistory: [
      { date: "2025-04-01", stage: "Applied", note: "Application submitted." },
    ],
  },
  {
    id: "c017",
    name: "Chloe Stevenson",
    university: "University of Tasmania",
    degree: "B. Science (Environmental)",
    graduationYear: 2025,
    stage: "Interview",
    appliedDate: "2025-03-06",
    daysInStage: 1,
    potentialScore: 82,
    avatarInitials: "CS",
    dimensions: {
      adaptability: 84,
      cognitiveAgility: 80,
      emotionalIntelligence: 83,
      collaboration: 82,
      drive: 81,
    },
    assessmentHistory: [
      { date: "2025-03-06", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-15", stage: "Assessed", note: "Score: 82." },
      { date: "2025-03-23", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-04-04", stage: "Interview", note: "Interview today." },
    ],
  },
  {
    id: "c018",
    name: "Ethan Brooks",
    university: "Bond University",
    degree: "B. Laws",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-02-25",
    daysInStage: 14,
    potentialScore: 89,
    avatarInitials: "EB",
    dimensions: {
      adaptability: 90,
      cognitiveAgility: 88,
      emotionalIntelligence: 87,
      collaboration: 91,
      drive: 90,
    },
    assessmentHistory: [
      { date: "2025-02-25", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-05", stage: "Assessed", note: "Score: 89. Top 10% of cohort." },
      { date: "2025-03-13", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-20", stage: "Interview", note: "Excellent panel interview." },
      { date: "2025-03-28", stage: "Offer", note: "Offer made." },
      { date: "2025-04-05", stage: "Hired", note: "Accepted. Start date: 23 Feb 2026." },
    ],
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Assigned mentor", status: "not-started", dueDate: "2026-03-20" },
      { title: "First client-facing role", status: "not-started", dueDate: "2026-07-31" },
    ],
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add seed data for candidates and program"
```

---

## Task 4: App Shell — Sidebar + Layout

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/TopBar.tsx`
- Create: `components/layout/AppShell.tsx`

- [ ] **Step 1: Create `components/layout/Sidebar.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitBranch, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/candidates/c001", label: "Candidates", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-[#1E1B4B] flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <img src="/te-logo.svg" alt="Talent Edge" className="h-7 brightness-0 invert" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href.replace("/c001", ""))
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-white/40">Talent Edge v0.1</p>
        <p className="text-xs text-white/40">Demo</p>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create `components/layout/TopBar.tsx`**

```tsx
import { program } from "@/lib/data/program";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <div>
        <span className="text-sm font-semibold text-slate-800">{program.clientName}</span>
        <span className="text-slate-400 mx-2">·</span>
        <span className="text-sm text-slate-500">{program.programName}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{program.manager}</p>
          <p className="text-xs text-slate-400">{program.managerTitle}</p>
        </div>
        <Avatar className="h-8 w-8 bg-indigo-100">
          <AvatarFallback className="text-indigo-700 text-xs font-semibold">SC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `components/layout/AppShell.tsx`**

```tsx
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Update `app/dashboard/page.tsx` temporarily:

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <p className="text-slate-500">Dashboard coming soon.</p>
    </AppShell>
  );
}
```

Run `npm run dev`. Navigate to http://localhost:3000/dashboard.
Expected: Dark indigo sidebar with Talent Edge logo, top bar showing "Meridian Group · 2026 Graduate Program", and "Dashboard coming soon." in the main area.

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/dashboard/page.tsx
git commit -m "feat: add app shell with sidebar and top bar"
```

---

## Task 5: Splash / Login Screen

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, TrendingUp } from "lucide-react";

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-10 brightness-0 invert" />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Early careers recruitment,<br />
            <span className="text-amber-400">fully connected.</span>
          </h1>
          <p className="text-indigo-200 text-lg">
            From first application to first-year milestone — one platform, zero spreadsheets.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: Zap, label: "AI Potential Assessment" },
            { icon: Users, label: "Cohort Management" },
            { icon: TrendingUp, label: "Development Tracking" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20"
            >
              <Icon size={12} />
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-8 gap-2"
            >
              View Meridian Group Demo
              <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="text-indigo-300/60 text-xs mt-3">Demo environment · No login required</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to http://localhost:3000.
Expected: Deep indigo gradient background, Talent Edge logo (white), headline with amber accent, three feature pills, and an amber "View Meridian Group Demo" button that navigates to /dashboard.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add splash screen with demo entry point"
```

---

## Task 6: Dashboard

**Files:**
- Create: `components/dashboard/MetricsRow.tsx`
- Create: `components/dashboard/PipelineFunnel.tsx`
- Create: `components/dashboard/ScoreDistribution.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Create `components/dashboard/MetricsRow.tsx`**

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Award, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Total Applicants", value: "187", sub: "+12 this week", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "AI Assessed", value: "142", sub: "75.9% completion", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Shortlisted", value: "43", sub: "30.3% pass rate", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Offers Made", value: "9", sub: "6 accepted", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
];

export function MetricsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className="border shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{m.value}</p>
                <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
              </div>
              <div className={`${m.bg} ${m.color} p-2 rounded-lg`}>
                <m.icon size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/dashboard/PipelineFunnel.tsx`**

```tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pipelineCounts } from "@/lib/data/program";

const data = Object.entries(pipelineCounts).map(([stage, count]) => ({ stage, count }));
const colors = ["#94A3B8", "#818CF8", "#A78BFA", "#F59E0B", "#F97316", "#10B981"];

export function PipelineFunnel() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidates">
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create `components/dashboard/ScoreDistribution.tsx`**

```tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const buckets = [
  { range: "60–64", count: 4 },
  { range: "65–69", count: 7 },
  { range: "70–74", count: 11 },
  { range: "75–79", count: 18 },
  { range: "80–84", count: 24 },
  { range: "85–89", count: 19 },
  { range: "90–94", count: 12 },
  { range: "95–100", count: 5 },
];

export function ScoreDistribution() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">
          AI Potential Score Distribution
        </CardTitle>
        <p className="text-xs text-slate-400">142 assessed candidates</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={buckets} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              cursor={{ fill: "#F8FAFC" }}
            />
            <ReferenceLine x="80–84" stroke="#4F46E5" strokeDasharray="4 2" label={{ value: "Shortlist threshold", fontSize: 10, fill: "#4F46E5", position: "insideTopRight" }} />
            <Bar dataKey="count" fill="#818CF8" radius={[4, 4, 0, 0]} name="Candidates" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Replace `app/dashboard/page.tsx`**

```tsx
import { AppShell } from "@/components/layout/AppShell";
import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { PipelineFunnel } from "@/components/dashboard/PipelineFunnel";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";
import { candidates } from "@/lib/data/candidates";
import { scoreColor, scoreLabel } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const recentActivity = [
  { text: "Priya Nair received a verbal offer", time: "2 hours ago", type: "offer" },
  { text: "James Thornton's interview confirmed for 7 April", time: "4 hours ago", type: "interview" },
  { text: "12 new applications received overnight", time: "8 hours ago", type: "applications" },
  { text: "Liam O'Brien accepted offer — start date confirmed", time: "Yesterday", type: "hired" },
  { text: "AI assessment batch completed — 23 candidates scored", time: "Yesterday", type: "assessment" },
];

export default function DashboardPage() {
  const topCandidates = [...candidates]
    .filter((c) => c.potentialScore >= 85)
    .sort((a, b) => b.potentialScore - a.potentialScore)
    .slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Program Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Meridian Group · 2026 Graduate Intake · Last updated just now</p>
        </div>

        <MetricsRow />

        <div className="grid grid-cols-2 gap-4">
          <PipelineFunnel />
          <ScoreDistribution />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 5: Verify in browser**

Navigate to http://localhost:3000/dashboard.
Expected: 4 metric cards, pipeline bar chart, score distribution histogram with reference line, top candidates list linking to profiles, activity feed.

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ app/dashboard/page.tsx
git commit -m "feat: build program dashboard with metrics, charts and activity feed"
```

---

## Task 7: Candidate Pipeline (Kanban)

**Files:**
- Create: `components/pipeline/CandidateCard.tsx`
- Create: `components/pipeline/StageColumn.tsx`
- Create: `components/pipeline/PipelineBoard.tsx`
- Create: `app/pipeline/page.tsx`

- [ ] **Step 1: Create `components/pipeline/CandidateCard.tsx`**

```tsx
import Link from "next/link";
import { Candidate } from "@/lib/data/candidates";
import { scoreColor } from "@/lib/utils";
import { Clock } from "lucide-react";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
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
  );
}
```

- [ ] **Step 2: Create `components/pipeline/StageColumn.tsx`**

```tsx
import { Candidate } from "@/lib/data/candidates";
import { CandidateCard } from "./CandidateCard";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  candidates: Candidate[];
  accentClass: string;
};

export function StageColumn({ label, candidates, accentClass }: Props) {
  return (
    <div className="flex flex-col min-w-[180px] max-w-[200px] flex-shrink-0">
      <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${accentClass}`}>
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</span>
        <Badge variant="secondary" className="text-xs">{candidates.length}</Badge>
      </div>
      <div className="space-y-2 flex-1">
        {candidates.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-4">No candidates</p>
        ) : (
          candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/pipeline/PipelineBoard.tsx`**

```tsx
"use client";
import { useState } from "react";
import { candidates as allCandidates } from "@/lib/data/candidates";
import { stages } from "@/lib/data/program";
import { StageColumn } from "./StageColumn";

const accentClasses = [
  "border-slate-300",
  "border-blue-400",
  "border-violet-400",
  "border-amber-400",
  "border-orange-400",
  "border-emerald-400",
];

export function PipelineBoard() {
  const [filter, setFilter] = useState<"all" | "high" | "emerging">("all");

  const filtered = allCandidates.filter((c) => {
    if (filter === "high") return c.potentialScore >= 80;
    if (filter === "emerging") return c.potentialScore >= 65 && c.potentialScore < 80;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">Filter:</span>
        {(["all", "high", "emerging"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? "All Candidates" : f === "high" ? "High Potential (80+)" : "Emerging (65–79)"}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} candidates shown</span>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <StageColumn
            key={stage.id}
            label={stage.label}
            candidates={filtered.filter((c) => c.stage === stage.label)}
            accentClass={accentClasses[i]}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/pipeline/page.tsx`**

```tsx
import { AppShell } from "@/components/layout/AppShell";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Candidate Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">Meridian Group · 2026 Graduate Intake · 18 demo candidates displayed</p>
        </div>
        <PipelineBoard />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 5: Verify in browser**

Navigate to http://localhost:3000/pipeline.
Expected: Kanban board with 6 columns (Applied → Hired), candidate cards showing name, university, AI score badge, days in stage, filter buttons working. Clicking a card navigates to the candidate profile (404 for now — that's fine).

- [ ] **Step 6: Commit**

```bash
git add components/pipeline/ app/pipeline/page.tsx
git commit -m "feat: build Kanban pipeline board with filter and candidate cards"
```

---

## Task 8: Candidate Profile — The Wow Screen

**Files:**
- Create: `components/profile/ProfileHeader.tsx`
- Create: `components/profile/PotentialRadar.tsx`
- Create: `components/profile/AssessmentTimeline.tsx`
- Create: `components/profile/DevelopmentTracker.tsx`
- Create: `app/candidates/[id]/page.tsx`

- [ ] **Step 1: Create `components/profile/ProfileHeader.tsx`**

```tsx
import { Candidate } from "@/lib/data/candidates";
import { scoreColor, scoreLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { stageColor } from "@/lib/utils";
import { GraduationCap, Calendar } from "lucide-react";

export function ProfileHeader({ candidate }: { candidate: Candidate }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
            {candidate.avatarInitials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{candidate.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <GraduationCap size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">{candidate.university}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">{candidate.degree}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={stageColor(candidate.stage)}>{candidate.stage}</Badge>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} />
                Applied {new Date(candidate.appliedDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* AI Score hero */}
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${
            candidate.potentialScore >= 80 ? "border-emerald-400 bg-emerald-50" :
            candidate.potentialScore >= 65 ? "border-amber-400 bg-amber-50" :
            "border-rose-400 bg-rose-50"
          }`}>
            <span className="text-2xl font-black text-slate-800">{candidate.potentialScore}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">AI Potential Score</p>
          <p className={`text-xs font-medium mt-0.5 ${
            candidate.potentialScore >= 80 ? "text-emerald-600" :
            candidate.potentialScore >= 65 ? "text-amber-600" : "text-rose-600"
          }`}>{scoreLabel(candidate.potentialScore)}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/profile/PotentialRadar.tsx`**

```tsx
"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PotentialDimensions } from "@/lib/data/candidates";

type Props = { dimensions: PotentialDimensions };

const dimensionLabels: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};

export function PotentialRadar({ dimensions }: Props) {
  const data = (Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => ({
    subject: dimensionLabels[key],
    score: dimensions[key],
    fullMark: 100,
  }));

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Potential Dimensions</CardTitle>
        <p className="text-xs text-slate-400">AI-assessed behavioural profile · Inspired by neuroscience assessment methodology</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              formatter={(value) => [`${value}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(Object.keys(dimensions) as Array<keyof PotentialDimensions>).map((key) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{dimensionLabels[key]}</span>
              <span className="font-semibold text-slate-700">{dimensions[key]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create `components/profile/AssessmentTimeline.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentEvent } from "@/lib/data/candidates";
import { stageColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AssessmentTimeline({ history }: { history: AssessmentEvent[] }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...history].reverse().map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                {i < history.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge className={`text-xs ${stageColor(event.stage)}`}>{event.stage}</Badge>
                  <span className="text-xs text-slate-400">{new Date(event.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                </div>
                <p className="text-xs text-slate-600">{event.note}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create `components/profile/DevelopmentTracker.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DevelopmentGoal } from "@/lib/data/candidates";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock } from "lucide-react";

const statusConfig = {
  "not-started": { label: "Not Started", icon: Circle, color: "text-slate-400" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-amber-500" },
  "complete": { label: "Complete", icon: CheckCircle, color: "text-emerald-500" },
};

export function DevelopmentTracker({ goals }: { goals: DevelopmentGoal[] }) {
  const complete = goals.filter((g) => g.status === "complete").length;
  const pct = Math.round((complete / goals.length) * 100);

  return (
    <Card className="border shadow-sm border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700">Post-Hire Development</CardTitle>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full">On-Program</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-slate-500">{complete}/{goals.length} goals</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.map((goal, i) => {
            const cfg = statusConfig[goal.status];
            return (
              <div key={i} className="flex items-start gap-3">
                <cfg.icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{goal.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{cfg.label}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">Due {new Date(goal.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-dashed">
          Development tracking activates on candidate start date. Goals are set during onboarding.
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create `app/candidates/[id]/page.tsx`**

```tsx
import { candidates } from "@/lib/data/candidates";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PotentialRadar } from "@/components/profile/PotentialRadar";
import { AssessmentTimeline } from "@/components/profile/AssessmentTimeline";
import { DevelopmentTracker } from "@/components/profile/DevelopmentTracker";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  const candidate = candidates.find((c) => c.id === params.id);
  if (!candidate) notFound();

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center gap-2">
          <Link href="/pipeline" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={14} />
            Pipeline
          </Link>
        </div>

        <ProfileHeader candidate={candidate} />

        <div className="grid grid-cols-2 gap-4">
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

- [ ] **Step 6: Verify in browser**

Navigate to http://localhost:3000/candidates/c001 (Anika Sharma, score 92).
Expected: Profile header with large circular AI score (92, emerald border), radar chart showing 5 dimensions, assessment timeline showing progression through stages, no development tracker (she's not yet hired).

Navigate to http://localhost:3000/candidates/c004 (Liam O'Brien, score 90, Hired).
Expected: Same layout, plus Development Tracker showing 3 goals in "not-started" state.

- [ ] **Step 7: Commit**

```bash
git add components/profile/ app/candidates/
git commit -m "feat: build candidate profile with AI potential radar and development tracker"
```

---

## Task 9: Wire Up Navigation & Final Polish

**Files:**
- Modify: `app/page.tsx` (already done)
- Modify: `components/layout/Sidebar.tsx` (minor nav fix)

- [ ] **Step 1: Ensure sidebar "Candidates" links to pipeline, not a fixed ID**

Update `components/layout/Sidebar.tsx` — change the Candidates nav item:

```tsx
const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/pipeline", label: "Candidates", icon: Users },
];
```

- [ ] **Step 2: Add a 404 page for unknown candidate IDs**

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 text-sm">Candidate not found.</p>
      <Link href="/pipeline">
        <Button variant="outline" size="sm">Back to Pipeline</Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Full walkthrough in browser**

Run through the full demo path:
1. http://localhost:3000 — splash screen, click "View Meridian Group Demo"
2. /dashboard — metrics, charts, top candidates list, activity feed
3. Click a candidate from the top candidates list → profile
4. /pipeline — Kanban board, try "High Potential" filter
5. Click a hired candidate card (Liam O'Brien or Grace Halliday) → profile with Development Tracker

Verify no console errors and all links resolve.

- [ ] **Step 4: Commit**

```bash
git add app/not-found.tsx components/layout/Sidebar.tsx
git commit -m "feat: wire navigation, add 404 page, full demo path verified"
```

---

## Task 10: Deploy to Vercel

**Files:** None — deployment only.

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/talent-edge.git
git push -u origin main
```

Replace `<your-username>` with your GitHub username.

- [ ] **Step 2: Deploy to Vercel**

1. Go to https://vercel.com and sign in with GitHub.
2. Click "Add New Project".
3. Select the `talent-edge` repository.
4. Framework: **Next.js** (auto-detected).
5. Click "Deploy" — no environment variables needed.

- [ ] **Step 3: Verify live URL**

Vercel will provide a URL in the format `talent-edge-<hash>.vercel.app`.
Run through the full demo path on the live URL to confirm it matches local.

- [ ] **Step 4: Note the URL**

Record the Vercel URL to share with Paula before the meeting.

---

## Self-Review

**Spec coverage:**
- Splash / demo entry ✔
- Program Dashboard (metrics, funnel, score distribution, top candidates, activity) ✔
- Candidate Pipeline (Kanban, filter by potential score) ✔
- Candidate Profile (AI score hero, potential radar, timeline) ✔
- Post-hire Development Tracker (hired candidates only) ✔
- Full navigation loop: splash → dashboard → pipeline → profile → back ✔
- Talent Edge branding (logo, name, colour scheme) ✔
- Meridian Group as demo client ✔
- Vercel deployment ✔

**Placeholder scan:** None found. All steps contain real code, real data, real commands.

**Type consistency:** `Candidate`, `PotentialDimensions`, `AssessmentEvent`, `DevelopmentGoal` defined once in `lib/data/candidates.ts` and imported everywhere. `Stage` defined in `lib/data/program.ts`. No naming conflicts.
