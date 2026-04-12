// components/assessment/ThankYouScreen.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

type Props = { name: string };

export function ThankYouScreen({ name }: Props) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">You&apos;re all done, {name.split(" ")[0]}.</h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Your results have been sent to Meridian Group. Their graduate team will be in touch soon.
        </p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What happens next</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">1.</span>
            Your results are reviewed by the Meridian Group graduate team.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">2.</span>
            Shortlisted candidates will be contacted within 5 business days.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">3.</span>
            Next stage: a 30-minute virtual conversation.
          </li>
        </ul>
      </div>
      <Link href="/candidates/c019">
        <Button variant="outline" className="gap-2 text-slate-600">
          View Jordan&apos;s profile →
        </Button>
      </Link>
    </div>
  );
}
