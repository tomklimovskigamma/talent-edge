import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="text-center space-y-2">
        <p className="text-5xl font-black text-slate-200">404</p>
        <p className="text-slate-500 text-sm">Page not found.</p>
      </div>
      <Link href="/pipeline">
        <Button variant="outline" size="sm">Back to Pipeline</Button>
      </Link>
    </div>
  );
}
