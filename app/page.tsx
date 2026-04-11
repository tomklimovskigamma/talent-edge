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
