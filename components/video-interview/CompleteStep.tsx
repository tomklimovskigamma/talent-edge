"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteStep() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 text-center space-y-5">
      <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle2 size={28} className="text-emerald-600" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Thanks — all done</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Your responses are now with the hiring team. You&apos;ll hear back shortly with the next steps.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
