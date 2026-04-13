// components/pipeline/ScheduleModal.tsx
"use client";
import { useState } from "react";
import { X, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  candidateName: string;
  onClose: () => void;
};

const slots = [
  { date: "Mon 14 Apr", time: "10:00 AM", spots: 2 },
  { date: "Mon 14 Apr", time: "2:30 PM",  spots: 1 },
  { date: "Tue 15 Apr", time: "9:00 AM",  spots: 3 },
  { date: "Tue 15 Apr", time: "11:30 AM", spots: 2 },
  { date: "Wed 16 Apr", time: "1:00 PM",  spots: 4 },
];

export function ScheduleModal({ candidateName, onClose }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);

  function handleBook() {
    if (selected !== null) setBooked(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1E1B4B] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Schedule Interview</p>
            <p className="text-xs text-indigo-300 mt-0.5">{candidateName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {booked ? (
          <div className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={28} />
              </div>
            </div>
            <p className="text-base font-semibold text-slate-800">Interview Scheduled</p>
            <p className="text-sm text-slate-500">
              {candidateName} has been sent a calendar invite for{" "}
              <strong>{slots[selected!].date} at {slots[selected!].time}</strong>.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full mt-2">
              Done
            </Button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={13} />
              <span>Select an available slot — candidate will self-confirm</span>
            </div>

            <div className="space-y-2">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                    selected === i
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                  }`}
                >
                  <span className="font-medium">{slot.date} · {slot.time}</span>
                  <span className={`text-xs ${selected === i ? "text-indigo-500" : "text-slate-400"}`}>
                    {slot.spots} spot{slot.spots !== 1 ? "s" : ""} left
                  </span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleBook}
              disabled={selected === null}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
            >
              Send Calendar Invite
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
