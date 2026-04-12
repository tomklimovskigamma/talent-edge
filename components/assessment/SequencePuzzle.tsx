// components/assessment/SequencePuzzle.tsx
import { cn } from "@/lib/utils";
import type { SequencePuzzleQuestion as SPQ } from "@/lib/data/assessment";

type Props = {
  question: SPQ;
  value: string | null;
  onChange: (optionId: string) => void;
  index: number;
};

type TileProps = { color: string; shape: "circle" | "square" | "triangle"; size?: number };

function Tile({ color, shape, size = 36 }: TileProps) {
  const fill = { blue: "#3B82F6", amber: "#F59E0B", indigo: "#6366F1" }[color];
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      {shape === "circle" && <circle cx="18" cy="18" r="14" fill={fill} />}
      {shape === "square" && <rect x="4" y="4" width="28" height="28" rx="3" fill={fill} />}
      {shape === "triangle" && <polygon points="18,4 32,32 4,32" fill={fill} />}
    </svg>
  );
}

function GridCell({ color, shape }: { color: string; shape: "circle" | "square" | "triangle" }) {
  return (
    <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
      <Tile color={color} shape={shape} />
    </div>
  );
}

function MissingCell() {
  return (
    <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-indigo-300 rounded-lg flex items-center justify-center">
      <span className="text-indigo-400 text-xl font-bold">?</span>
    </div>
  );
}

const grid = [
  [{ color: "blue", shape: "circle" as const }, { color: "amber", shape: "square" as const }, { color: "indigo", shape: "triangle" as const }],
  [{ color: "amber", shape: "triangle" as const }, { color: "indigo", shape: "circle" as const }, { color: "blue", shape: "square" as const }],
  [{ color: "indigo", shape: "square" as const }, { color: "blue", shape: "triangle" as const }, null], // null = missing
];

const answerOptions: { id: string; color: string; shape: "circle" | "square" | "triangle" }[] = [
  { id: "A", color: "amber", shape: "circle" },     // ← correct
  { id: "B", color: "blue", shape: "circle" },
  { id: "C", color: "amber", shape: "triangle" },
  { id: "D", color: "indigo", shape: "square" },
];

export function SequencePuzzle({ question, value, onChange, index }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
        {question.prompt}
      </p>

      {/* Grid */}
      <div className="flex justify-center">
        <div className="space-y-2">
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-2">
              {row.map((cell, ci) =>
                cell ? (
                  <GridCell key={ci} color={cell.color} shape={cell.shape} />
                ) : (
                  <MissingCell key={ci} />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Answer options */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-3 text-center">Which tile completes the pattern?</p>
        <div className="flex justify-center gap-3">
          {answerOptions.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={value === opt.id}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-20",
                value === opt.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              )}
            >
              <Tile color={opt.color} shape={opt.shape} size={32} />
              <span className={cn("text-xs font-semibold", value === opt.id ? "text-indigo-700" : "text-slate-400")}>
                {opt.id}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
