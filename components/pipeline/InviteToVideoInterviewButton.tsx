"use client";

import { useState } from "react";
import { Video, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InviteToVideoInterviewButton({ candidateId }: { candidateId: string }) {
  const [sent, setSent] = useState(false);
  const link = `/video-interview/${candidateId}`;
  const fullLink = typeof window !== "undefined" ? `${window.location.origin}${link}` : link;

  function handleSend() {
    setSent(true);
    // In production this would trigger an email + DB write.
    // For demo, copy the link to clipboard so the presenter can open it in a new tab.
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(fullLink);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        size="sm"
        onClick={handleSend}
        disabled={sent}
        className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
      >
        <Video size={13} />
        {sent ? "Link copied — open in new tab" : "Invite to video interview"}
      </Button>
      {sent && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Copy size={10} />
          <code className="truncate">{link}</code>
        </div>
      )}
    </div>
  );
}
