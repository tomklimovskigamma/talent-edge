// components/profile/OfferStatus.tsx
"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Candidate } from "@/lib/data/candidates";
import { usePersona } from "@/lib/persona";
import {
  DECLINE_REASONS,
  getOfferState,
  markAccepted,
  markDeclined,
  type DeclineReason,
  type OfferState,
} from "@/lib/offer";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

export function OfferStatus({ candidate }: { candidate: Candidate }) {
  const { persona } = usePersona();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<OfferState>({ status: "pending", declineReason: null, markedAt: null });
  const [mode, setMode] = useState<"idle" | "declining">("idle");
  const [reason, setReason] = useState<DeclineReason>(DECLINE_REASONS[0]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setState(getOfferState(candidate.id));
  }, [candidate.id]);

  if (!mounted || persona !== "admin" || candidate.stage !== "Offer") {
    return null;
  }

  function handleAccept() {
    markAccepted(candidate.id);
    setState(getOfferState(candidate.id));
    setMode("idle");
  }

  function handleConfirmDecline() {
    markDeclined(candidate.id, reason);
    setState(getOfferState(candidate.id));
    setMode("idle");
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Offer Status</h2>

      {state.status === "accepted" && state.markedAt && (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" />
          <span>Offer accepted on {formatTimestamp(state.markedAt)}</span>
        </div>
      )}

      {state.status === "declined" && state.markedAt && (
        <div className="flex items-center gap-2 text-sm text-rose-700">
          <XCircle size={16} className="text-rose-500" aria-hidden="true" />
          <span>
            Offer declined — {state.declineReason} ({formatTimestamp(state.markedAt)})
          </span>
        </div>
      )}

      {state.status === "pending" && mode === "idle" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Mark Accepted
          </button>
          <button
            type="button"
            onClick={() => setMode("declining")}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Mark Declined
          </button>
        </div>
      )}

      {state.status === "pending" && mode === "declining" && (
        <div className="space-y-2">
          <label htmlFor="decline-reason" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Reason
          </label>
          <select
            id="decline-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as DeclineReason)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
          >
            {DECLINE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmDecline}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
