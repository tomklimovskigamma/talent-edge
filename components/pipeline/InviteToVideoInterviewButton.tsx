"use client";

import { Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InviteToVideoInterviewButton({ candidateId }: { candidateId: string }) {
  const link = `/video-interview/${candidateId}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ size: "sm" }),
        "gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700",
      )}
    >
      <Video size={13} />
      Invite to video interview
    </a>
  );
}
