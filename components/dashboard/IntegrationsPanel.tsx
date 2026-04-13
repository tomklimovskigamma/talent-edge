import { CheckCircle, Settings } from "lucide-react";

type Integration = {
  name: string;
  category: string;
  status: "connected" | "available";
};

const integrations: Integration[] = [
  { name: "PageUp",          category: "ATS",       status: "connected" },
  { name: "Workday",         category: "ATS",       status: "connected" },
  { name: "Success Factors", category: "ATS",       status: "available" },
  { name: "Oracle HCM",      category: "ATS",       status: "available" },
  { name: "Springboard",     category: "ATS",       status: "available" },
  { name: "Grad-Engage",     category: "Keep Warm", status: "available" },
];

export function IntegrationsPanel() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Platform Integrations</h2>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          <CheckCircle size={10} />
          2 active
        </span>
      </div>

      <div className="space-y-2">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                integration.status === "connected" ? "bg-emerald-500" : "bg-slate-300"
              }`} />
              <div>
                <p className="text-xs font-medium text-slate-700">{integration.name}</p>
                <p className="text-[10px] text-slate-400">{integration.category}</p>
              </div>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              integration.status === "connected"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-slate-100 text-slate-400"
            }`}>
              {integration.status === "connected" ? "Connected" : "Available"}
            </span>
          </div>
        ))}
      </div>

      {/* Assessment config teaser */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Settings size={14} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Self-service Assessment Config</p>
              <p className="text-[10px] text-slate-400">Customise questions, language &amp; branding</p>
            </div>
          </div>
          <span className="text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
