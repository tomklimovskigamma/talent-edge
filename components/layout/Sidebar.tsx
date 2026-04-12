"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-[#1E1B4B] flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <img src="/te-logo.svg" alt="Talent Edge" className="h-7 brightness-0 invert" />
      </div>
      <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-white/40">Talent Edge v0.1</p>
        <p className="text-xs text-white/40">Demo</p>
      </div>
    </aside>
  );
}
