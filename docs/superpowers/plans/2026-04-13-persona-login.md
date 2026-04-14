# Persona Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the landing page into two demo personas (Graduate / Admin) and conditionally show/hide navigation elements so each persona only sees what's relevant to their flow.

**Architecture:** A lightweight React context (`lib/persona.tsx`) stores `"graduate" | "admin" | null` in localStorage. The landing page sets persona on click and navigates. Sidebar filters nav items by persona. ThankYouScreen shows persona-appropriate exit CTAs. No server-side auth — this is a pure demo persona switch.

**Tech Stack:** Next.js 16 App Router, React context + localStorage, Tailwind v4, lucide-react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/persona.tsx` | Create | PersonaContext, PersonaProvider, usePersona hook |
| `app/layout.tsx` | Modify | Wrap `<body>` with `<PersonaProvider>` |
| `app/page.tsx` | Modify | Replace single CTA with two persona login buttons |
| `components/layout/Sidebar.tsx` | Modify | Hide Assessment nav item for admin persona |
| `components/assessment/AssessmentShell.tsx` | Modify | Logo links to `/` (home) not `/dashboard` |
| `components/assessment/ThankYouScreen.tsx` | Modify | Show persona-appropriate exit CTAs |

---

### Task 1: Persona context

**Files:**
- Create: `lib/persona.tsx`

No tests for this context — it wraps localStorage which can't be tested in the Jest/Next environment without mocking. Verify manually via Task 3.

- [ ] **Step 1: Create `lib/persona.tsx`**

```tsx
// lib/persona.tsx
"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Persona = "graduate" | "admin" | null;

const PersonaContext = createContext<{
  persona: Persona;
  setPersona: (p: Persona) => void;
}>({ persona: null, setPersona: () => {} });

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(null);

  useEffect(() => {
    const stored = localStorage.getItem("te-persona") as Persona | null;
    if (stored === "graduate" || stored === "admin") {
      setPersonaState(stored);
    }
  }, []);

  function setPersona(p: Persona) {
    if (p) {
      localStorage.setItem("te-persona", p);
    } else {
      localStorage.removeItem("te-persona");
    }
    setPersonaState(p);
  }

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tomklimovski/Github/talent-edge && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing errors unrelated to `lib/persona.tsx`)

- [ ] **Step 3: Commit**

```bash
git add lib/persona.tsx
git commit -m "feat: add persona context with localStorage persistence"
```

---

### Task 2: Wrap root layout with PersonaProvider

**Files:**
- Modify: `app/layout.tsx` (lines 1–22)

Current content of `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 1: Add PersonaProvider to layout**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PersonaProvider } from "@/lib/persona";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
      <body className={inter.variable}>
        <PersonaProvider>{children}</PersonaProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap root layout with PersonaProvider"
```

---

### Task 3: Landing page — two persona login buttons

**Files:**
- Modify: `app/page.tsx` (full rewrite)

Current `app/page.tsx` is a server component with a single "View Meridian Group Demo" button linking to `/dashboard`. We need it to be a client component so it can call `setPersona` on click and use `useRouter` to navigate.

The two personas:
- **Graduate** — sets persona `"graduate"`, navigates to `/assessment`
- **Admin** — sets persona `"admin"`, navigates to `/dashboard`

Design: keep the existing indigo gradient layout. Replace the single amber button with two side-by-side cards/buttons. Keep the feature pills unchanged.

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, TrendingUp, GraduationCap, LayoutDashboard } from "lucide-react";
import { usePersona, type Persona } from "@/lib/persona";

export default function SplashPage() {
  const { setPersona } = usePersona();
  const router = useRouter();

  function enter(persona: Persona, dest: string) {
    setPersona(persona);
    router.push(dest);
  }

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

        {/* Persona CTAs */}
        <div className="pt-2 space-y-3">
          <p className="text-indigo-300/70 text-xs font-medium uppercase tracking-widest">Choose your demo view</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => enter("graduate", "/assessment")}
              className="group flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl px-4 py-5 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center group-hover:bg-emerald-400/30 transition-colors">
                <GraduationCap size={20} className="text-emerald-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Graduate</p>
                <p className="text-xs text-indigo-300/70 mt-0.5">Take the assessment</p>
              </div>
              <ArrowRight size={14} className="text-indigo-300/50 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => enter("admin", "/dashboard")}
              className="group flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl px-4 py-5 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/30 transition-colors">
                <LayoutDashboard size={20} className="text-amber-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Admin</p>
                <p className="text-xs text-indigo-300/70 mt-0.5">View the dashboard</p>
              </div>
              <ArrowRight size={14} className="text-indigo-300/50 group-hover:text-white transition-colors" />
            </button>
          </div>
          <p className="text-indigo-300/40 text-xs">Demo environment · No login required</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Start dev server and manually verify landing page renders two cards**

```bash
npm run dev
```

Open http://localhost:3000. You should see two side-by-side cards: "Graduate / Take the assessment" and "Admin / View the dashboard". Clicking each should navigate to `/assessment` or `/dashboard` respectively.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: replace single CTA with two persona login buttons on landing page"
```

---

### Task 4: Sidebar — hide Assessment for admin persona

**Files:**
- Modify: `components/layout/Sidebar.tsx` (full file)

Current sidebar (`components/layout/Sidebar.tsx`) has three nav items: Dashboard, Pipeline, Assessment. The Assessment item was added as a navigation shortcut, but an admin recruiter should only see Dashboard and Pipeline — the Assessment route is for graduates to complete, not for admin to navigate to.

Rule: hide Assessment nav item when `persona === "admin"`. Show all items when persona is null (fallback for direct URL access).

Current file content:
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/assessment", label: "Assessment", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-[#1E1B4B] flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <img src="/te-logo.svg" alt="Talent Edge" className="h-7 brightness-0 invert" />
      </div>
      <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
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

- [ ] **Step 1: Update `components/layout/Sidebar.tsx`**

Replace the entire file with:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersona } from "@/lib/persona";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, adminOnly: false },
  { href: "/assessment", label: "Assessment", icon: ClipboardList, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { persona } = usePersona();

  const visibleNav = nav.filter((item) => {
    // Hide Assessment from admin persona — admin triggers assessments for candidates,
    // they don't complete them. Show all items when persona is unset (direct URL access).
    if (item.adminOnly && persona === "admin") return false;
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Manual test**

With dev server running:
1. Go to http://localhost:3000, click "Admin" — navigate to `/dashboard`
2. Sidebar should show Dashboard and Pipeline only (no Assessment)
3. Go back to http://localhost:3000, click "Graduate" — navigate to `/assessment`
4. Assessment uses AssessmentShell (no sidebar visible — this is expected and correct)

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: hide Assessment sidebar item for admin persona"
```

---

### Task 5: AssessmentShell logo — link to home not dashboard

**Files:**
- Modify: `components/assessment/AssessmentShell.tsx` (line 20–22)

Current: `<Link href="/dashboard">`. A graduate completing the assessment should not be dropped into the admin dashboard if they click the logo. `/` (home) is the right exit for both personas.

Current relevant section (lines 19–23):
```tsx
      <header className="bg-[#1E1B4B] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
        </Link>
```

- [ ] **Step 1: Change logo link to `/`**

In `components/assessment/AssessmentShell.tsx`, replace:
```tsx
        <Link href="/dashboard">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
        </Link>
```

With:
```tsx
        <Link href="/" aria-label="Return to home">
          <img src="/te-logo.svg" alt="Talent Edge" className="h-6 brightness-0 invert" />
        </Link>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Manual test**

With dev server running, navigate to `/assessment`. Click the Talent Edge logo in the header. Should return to `/` (the landing page with two persona buttons).

- [ ] **Step 4: Commit**

```bash
git add components/assessment/AssessmentShell.tsx
git commit -m "fix: assessment shell logo links to home instead of dashboard"
```

---

### Task 6: ThankYouScreen — persona-conditional exit CTAs

**Files:**
- Modify: `components/assessment/ThankYouScreen.tsx` (full file)

Currently a server component with two static links: "Back to Pipeline" and "View Jordan's profile". A graduate should not see these — they don't have access to the pipeline or candidate profiles. A graduate should see "Back to Home". An admin previewing the assessment should still see the pipeline and profile links.

Make this a `"use client"` component and use `usePersona()` to conditionally render exit buttons.

- [ ] **Step 1: Rewrite `components/assessment/ThankYouScreen.tsx`**

```tsx
// components/assessment/ThankYouScreen.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { usePersona } from "@/lib/persona";

type Props = { name: string };

export function ThankYouScreen({ name }: Props) {
  const { persona } = usePersona();
  const isGraduate = persona === "graduate" || persona === null;

  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">You&apos;re all done, {name.split(" ")[0]}.</h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Your results have been sent to Meridian Group. Their graduate team will be in touch soon.
        </p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What happens next</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">1.</span>
            Your results are reviewed by the Meridian Group graduate team.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">2.</span>
            Shortlisted candidates will be contacted within 5 business days.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">3.</span>
            Next stage: a 30-minute virtual conversation.
          </li>
        </ul>
      </div>

      {isGraduate ? (
        <Link href="/">
          <Button variant="outline" className="gap-2 text-slate-600">
            ← Back to Home
          </Button>
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/pipeline">
            <Button variant="ghost" className="gap-2 text-slate-500">
              ← Back to Pipeline
            </Button>
          </Link>
          <Link href="/candidates/c019">
            <Button variant="outline" className="gap-2 text-slate-600">
              View Jordan&apos;s profile →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
```

Note: `isGraduate` defaults to `true` when persona is null (covers direct URL access — safer to show the simpler graduate view than the admin view in that case).

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Manual test — graduate flow**

1. Go to http://localhost:3000, click "Graduate"
2. Complete the assessment (or click through using default values)
3. On ThankYou screen: should show only "← Back to Home" button, NOT "Back to Pipeline" or "View Jordan's profile"
4. Click "← Back to Home" — should return to `/`

- [ ] **Step 4: Manual test — admin flow**

1. Go to http://localhost:3000, click "Admin"
2. Navigate to `/assessment` manually (e.g. via URL bar)
3. Complete the assessment
4. On ThankYou screen: should show "← Back to Pipeline" and "View Jordan's profile →"

- [ ] **Step 5: Commit**

```bash
git add components/assessment/ThankYouScreen.tsx
git commit -m "feat: show persona-appropriate exit CTAs on ThankYou screen"
```

---

### Task 7: Push and verify on Vercel

- [ ] **Step 1: Final TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: no errors introduced by this feature

- [ ] **Step 2: Push to main**

```bash
git push origin main
```

- [ ] **Step 3: Verify Vercel deploy**

Watch the Vercel dashboard for a new deployment triggered by the push. Once deployed:

1. Open the production URL
2. Confirm landing page shows two persona cards (Graduate / Admin)
3. Click Graduate → lands on `/assessment`, completes flow, ThankYou shows "← Back to Home" only
4. Return to home, click Admin → lands on `/dashboard`, sidebar shows Dashboard + Pipeline (no Assessment)
5. Navigate to any Applied candidate profile — "Send Assessment" button still visible (this is an admin action)

---

## Self-Review

**Spec coverage:**
- ✅ Two login buttons on landing page (Graduate / Admin) — Task 3
- ✅ Graduate doesn't see Dashboard/Pipeline — Tasks 4 + 5 (graduate uses AssessmentShell which has no sidebar; logo now goes home)
- ✅ Admin doesn't see Assessment in sidebar — Task 4
- ✅ Graduate ThankYou has no pipeline/profile links — Task 6
- ✅ Admin ThankYou retains pipeline/profile links — Task 6
- ✅ Persona persisted across navigation (localStorage) — Task 1

**Placeholder scan:** None found — all steps have complete code.

**Type consistency:**
- `Persona = "graduate" | "admin" | null` defined in Task 1 and imported consistently in Tasks 3, 4, 6
- `usePersona()` returns `{ persona: Persona; setPersona: (p: Persona) => void }` — used correctly in all consumers
