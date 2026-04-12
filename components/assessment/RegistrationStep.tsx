// components/assessment/RegistrationStep.tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { defaultRegistration, trackLabels, type RegistrationData, type Track } from "@/lib/data/assessment";
import { GraduationCap, ArrowRight } from "lucide-react";

type Props = {
  defaultData: RegistrationData;
  onNext: (data: RegistrationData) => void;
};

const tracks: Track[] = ["finance", "technology", "people-culture"];

export function RegistrationStep({ defaultData, onNext }: Props) {
  const [data, setData] = useState<RegistrationData>(defaultData);

  function set(field: keyof RegistrationData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-2">
          <GraduationCap className="text-indigo-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome to your Talent Edge Assessment</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          This 15-minute assessment measures your potential across five dimensions — not your grades or experience.
          There are no right answers. Just be yourself.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Full name</label>
              <input
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Email address</label>
              <input
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">University</label>
            <input
              value={data.university}
              onChange={(e) => set("university", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Degree</label>
            <input
              value={data.degree}
              onChange={(e) => set("degree", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Track selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Career track</label>
            <div className="grid grid-cols-3 gap-2">
              {tracks.map((track) => (
                <button
                  key={track}
                  onClick={() => set("track", track)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors text-center ${
                    data.track === track
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {trackLabels[track]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => onNext(data)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          Begin Assessment
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
