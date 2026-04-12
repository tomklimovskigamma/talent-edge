// components/assessment/EmotionFace.tsx
import { cn } from "@/lib/utils";
import type { EmotionFaceQuestion as EFQ } from "@/lib/data/assessment";

type Props = {
  question: EFQ;
  value: string | null;
  onChange: (optionId: string) => void;
  index: number;
};

// Inline SVG face components — each ~60px circle with eyes, brows, mouth
function HappyFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="22" cy="24" r="3" fill="#1E1B4B" />
      <circle cx="38" cy="24" r="3" fill="#1E1B4B" />
      {/* Brows — relaxed, slightly arched */}
      <path d="M18 18 Q22 15 26 18" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 18 Q38 15 42 18" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M20 38 Q30 46 40 38" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AnxiousFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      {/* Eyes — wide */}
      <circle cx="22" cy="25" r="3.5" fill="#1E1B4B" />
      <circle cx="38" cy="25" r="3.5" fill="#1E1B4B" />
      {/* Brows — inner corners raised (worried) */}
      <path d="M18 17 Q21 13 25 17" stroke="#3730A3" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M35 17 Q39 13 42 17" stroke="#3730A3" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Slightly downturned mouth */}
      <path d="M22 40 Q30 36 38 40" stroke="#3730A3" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SurprisedFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" />
      {/* Eyes — wide */}
      <circle cx="22" cy="22" r="4" fill="#1E1B4B" />
      <circle cx="38" cy="22" r="4" fill="#1E1B4B" />
      {/* Brows — high and raised */}
      <path d="M17 14 Q22 10 27 14" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M33 14 Q38 10 43 14" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* O-shaped mouth */}
      <ellipse cx="30" cy="40" rx="6" ry="7" fill="#065F46" />
      <ellipse cx="30" cy="40" rx="4" ry="5" fill="#F0FDF4" />
    </svg>
  );
}

function ConfidentFace() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
      {/* Eyes — steady */}
      <circle cx="22" cy="24" r="3" fill="#1E1B4B" />
      <circle cx="38" cy="24" r="3" fill="#1E1B4B" />
      {/* Brows — level, slightly lowered */}
      <path d="M18 20 Q22 18 26 20" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 20 Q38 18 42 20" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Slight confident smile, closed */}
      <path d="M22 37 Q30 42 38 37" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const faceMap: Record<string, React.FC> = {
  A: HappyFace,
  B: AnxiousFace,
  C: SurprisedFace,
  D: ConfidentFace,
};

export function EmotionFace({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.prompt}
      </p>

      {/* The face being assessed */}
      <div className="flex justify-center">
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 inline-flex flex-col items-center gap-2">
          <AnxiousFace />
          <p className="text-xs text-slate-400">How is this person feeling?</p>
        </div>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-4 gap-3">
        {question.options.map((opt) => {
          const FaceComp = faceMap[opt.id];
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={value === opt.id}
              aria-label={opt.label}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                value === opt.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              )}
            >
              <FaceComp />
              <span className={cn(
                "text-xs font-medium",
                value === opt.id ? "text-indigo-700" : "text-slate-500"
              )}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
