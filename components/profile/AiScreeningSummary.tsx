// components/profile/AiScreeningSummary.tsx
"use client";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { usePersona } from "@/lib/persona";
import { generateScreeningSummary } from "@/lib/screening";
import type { Candidate } from "@/lib/data/candidates";

export function AiScreeningSummary({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (persona !== "admin") return null;

  const { text, recommendation } = generateScreeningSummary(candidate);

  const badgeClass =
    recommendation.variant === "advance"
      ? "bg-emerald-100 text-emerald-800"
      : recommendation.variant === "review"
      ? "bg-amber-100 text-amber-800"
      : "bg-rose-100 text-rose-800";

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-700">AI Screening Summary</h3>
        <span className="text-xs text-slate-400 ml-auto">Powered by Talent Edge AI</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{text}</p>
      <span role="status" className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${badgeClass}`}>
        {recommendation.text}
      </span>
    </div>
  );
}
