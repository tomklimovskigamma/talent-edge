export const program = {
  clientName: "Meridian Group",
  programName: "2026 Graduate Program",
  intakeYear: 2026,
  targetHires: 20,
  openDate: "2025-03-01",
  closeDate: "2025-05-31",
  manager: "Sarah Chen",
  managerTitle: "Graduate Program Manager",
};

export type Stage = {
  id: string;
  label: StageName;
  order: number;
};

export type StageName = "Applied" | "Assessed" | "Shortlisted" | "Interview" | "Offer" | "Hired" | "Rejected";

export const stages: Stage[] = [
  { id: "applied", label: "Applied", order: 1 },
  { id: "assessed", label: "Assessed", order: 2 },
  { id: "shortlisted", label: "Shortlisted", order: 3 },
  { id: "interview", label: "Interview", order: 4 },
  { id: "offer", label: "Offer", order: 5 },
  { id: "hired", label: "Hired", order: 6 },
];

export const pipelineCounts: Record<StageName, number> = {
  Applied: 187,
  Assessed: 142,
  Shortlisted: 43,
  Interview: 21,
  Offer: 9,
  Hired: 6,
  Rejected: 0,
};
