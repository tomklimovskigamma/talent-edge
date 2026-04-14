// lib/keepwarm.ts
import type { Candidate } from "@/lib/data/candidates";

export type KeepWarmEventStatus = "sent" | "scheduled" | "upcoming";

export type KeepWarmEvent = {
  id: string;
  label: string;
  description: string;
  date: string; // ISO date YYYY-MM-DD
  status: KeepWarmEventStatus;
  iconType: "mail" | "video" | "users" | "clock" | "list";
};

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function deriveStatus(eventDate: string, today: string): KeepWarmEventStatus {
  if (eventDate <= today) return "sent";
  if (eventDate <= addDays(today, 14)) return "scheduled";
  return "upcoming";
}

export function generateKeepWarmFeed(
  candidate: Candidate,
  today: string = new Date().toISOString().split("T")[0]
): KeepWarmEvent[] {
  const hireEntry = candidate.assessmentHistory.find((e) => e.stage === "Hired");
  const hireDate = hireEntry?.date ?? candidate.appliedDate;
  const startDate = candidate.startDate ?? addDays(hireDate, 300);
  const firstName = candidate.name.split(" ")[0];

  const definitions: Omit<KeepWarmEvent, "status">[] = [
    {
      id: "offer-sent",
      label: "Offer letter sent",
      description: "Official offer letter emailed via DocuSign. Acceptance deadline: 7 days.",
      date: hireDate,
      iconType: "mail",
    },
    {
      id: "welcome-video",
      label: "Welcome video shared",
      description: `Personalised welcome video from Sarah Chen, Graduate Program Manager, sent to ${firstName}.`,
      date: addDays(hireDate, 2),
      iconType: "video",
    },
    {
      id: "team-intro",
      label: "Meet your team call scheduled",
      description: "30-minute intro call with the graduate cohort booked via calendar invite.",
      date: addDays(hireDate, 7),
      iconType: "users",
    },
    {
      id: "countdown-30",
      label: "30-day countdown check-in",
      description: "Automated check-in email sent: start date confirmed, IT setup instructions, building access info.",
      date: addDays(startDate, -30),
      iconType: "clock",
    },
    {
      id: "onboarding-checklist",
      label: "Onboarding checklist sent",
      description: "Pre-start checklist emailed: tax forms, ID verification, parking registration.",
      date: addDays(startDate, -14),
      iconType: "list",
    },
  ];

  return definitions.map((def) => ({
    ...def,
    status: deriveStatus(def.date, today),
  }));
}
