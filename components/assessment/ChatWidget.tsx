// components/assessment/ChatWidget.tsx
"use client";
import { useState } from "react";
import { MessageCircle, X, ChevronDown, ChevronUp } from "lucide-react";

type FAQ = { q: string; a: string };

const faqs: FAQ[] = [
  {
    q: "How long does this take?",
    a: "The assessment takes approximately 15–20 minutes. You can complete it in one sitting — there is no time limit per question.",
  },
  {
    q: "What does this measure?",
    a: "We assess your potential across five dimensions: Adaptability, Cognitive Agility, Emotional Intelligence, Collaboration, and Drive. We do not assess grades, background, or work experience.",
  },
  {
    q: "Will I receive feedback?",
    a: "A personalised feedback report will be sent to you within 5 business days of the program team reviewing your results.",
  },
  {
    q: "I need accessibility adjustments.",
    a: "Please indicate your needs in the registration step at the start of the assessment. Our team will contact you within 1 business day to discuss how we can support you.",
  },
  {
    q: "Who sees my results?",
    a: "Your results are shared only with the Meridian Group graduate recruitment team. They will not be shared with third parties.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E1B4B] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Got questions?</p>
              <p className="text-xs text-indigo-300">Tap a question for an instant answer</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          {/* FAQ list */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {faqs.map((faq, i) => (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm text-slate-700 font-medium">{faq.q}</span>
                  {expanded === i ? (
                    <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {expanded === i && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">Powered by Talent Edge AI · Meridian Group 2026</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open candidate assistant"}
        className="w-13 h-13 rounded-full bg-[#1E1B4B] hover:bg-indigo-800 text-white shadow-lg flex items-center justify-center transition-colors"
        style={{ width: 52, height: 52 }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
