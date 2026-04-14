// components/settings/BrandingConfig.tsx
"use client";
import { useState } from "react";
import { program } from "@/lib/data/program";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BrandingFields = {
  clientName: string;
  programName: string;
  intakeYear: string;
  managerName: string;
  accentColour: string;
};

export function BrandingConfig() {
  const [fields, setFields] = useState<BrandingFields>({
    clientName: program.clientName,
    programName: program.programName,
    intakeYear: String(program.intakeYear),
    managerName: program.manager,
    accentColour: "#4F46E5",
  });
  const [saved, setSaved] = useState(false);

  function handleChange(key: keyof BrandingFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Building2 size={15} className="text-indigo-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">Program Branding</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="clientName">Client name</label>
          <input
            id="clientName"
            type="text"
            value={fields.clientName}
            onChange={(e) => handleChange("clientName", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="programName">Program name</label>
          <input
            id="programName"
            type="text"
            value={fields.programName}
            onChange={(e) => handleChange("programName", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="intakeYear">Intake year</label>
          <input
            id="intakeYear"
            type="text"
            value={fields.intakeYear}
            onChange={(e) => handleChange("intakeYear", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="managerName">Program manager</label>
          <input
            id="managerName"
            type="text"
            value={fields.managerName}
            onChange={(e) => handleChange("managerName", e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="accentColour">Accent colour</label>
          <div className="flex items-center gap-2">
            <input
              id="accentColour"
              type="color"
              value={fields.accentColour}
              onChange={(e) => handleChange("accentColour", e.target.value)}
              className="h-9 w-14 border border-slate-200 rounded-lg cursor-pointer p-0.5"
            />
            <span className="text-xs text-slate-500 font-mono">{fields.accentColour}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </section>
  );
}
