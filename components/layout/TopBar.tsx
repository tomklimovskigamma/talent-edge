import { program } from "@/lib/data/program";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <div>
        <span className="text-sm font-semibold text-slate-800">{program.clientName}</span>
        <span className="text-slate-400 mx-2">·</span>
        <span className="text-sm text-slate-500">{program.programName}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{program.manager}</p>
          <p className="text-xs text-slate-400">{program.managerTitle}</p>
        </div>
        <Avatar className="h-8 w-8 bg-indigo-100">
          <AvatarFallback className="text-indigo-700 text-xs font-semibold">SC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
