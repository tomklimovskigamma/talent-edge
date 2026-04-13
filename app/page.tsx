"use client";
import { useRouter } from "next/navigation";
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
