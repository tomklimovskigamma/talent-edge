import type { StageName } from "./program";

export type PotentialDimensions = {
  adaptability: number;
  cognitiveAgility: number;
  emotionalIntelligence: number;
  collaboration: number;
  drive: number;
};

export const dimensionLabels: Record<keyof PotentialDimensions, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};

export type AssessmentEvent = {
  date: string;
  stage: StageName;
  note: string;
};

export type DevelopmentGoal = {
  title: string;
  status: "not-started" | "in-progress" | "complete";
  dueDate: string;
};

export type Candidate = {
  id: string;
  name: string;
  university: string;
  degree: string;
  graduationYear: number;
  stage: StageName;
  appliedDate: string;
  daysInStage: number;
  potentialScore: number;
  dimensions: PotentialDimensions;
  assessmentHistory: AssessmentEvent[];
  developmentGoals?: DevelopmentGoal[];
  avatarInitials: string;
};

export const candidates: Candidate[] = [
  {
    id: "c001",
    name: "Anika Sharma",
    university: "University of Melbourne",
    degree: "B. Commerce (Finance)",
    graduationYear: 2025,
    stage: "Shortlisted",
    appliedDate: "2025-03-12",
    daysInStage: 4,
    potentialScore: 92,
    avatarInitials: "AS",
    dimensions: {
      adaptability: 94,
      cognitiveAgility: 91,
      emotionalIntelligence: 88,
      collaboration: 95,
      drive: 93,
    },
    assessmentHistory: [
      { date: "2025-03-12", stage: "Applied", note: "Application submitted via PageUp." },
      { date: "2025-03-20", stage: "Assessed", note: "AI potential assessment completed. Score: 92. Flagged as high potential." },
      { date: "2025-03-28", stage: "Shortlisted", note: "Progressed to shortlist by program manager." },
    ],
  },
  {
    id: "c002",
    name: "James Thornton",
    university: "UNSW Sydney",
    degree: "B. Engineering (Software)",
    graduationYear: 2025,
    stage: "Interview",
    appliedDate: "2025-03-08",
    daysInStage: 2,
    potentialScore: 88,
    avatarInitials: "JT",
    dimensions: {
      adaptability: 85,
      cognitiveAgility: 93,
      emotionalIntelligence: 80,
      collaboration: 88,
      drive: 91,
    },
    assessmentHistory: [
      { date: "2025-03-08", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-17", stage: "Assessed", note: "Assessment complete. Score: 88." },
      { date: "2025-03-25", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-04-01", stage: "Interview", note: "Interview scheduled for 7 April." },
    ],
  },
  {
    id: "c003",
    name: "Priya Nair",
    university: "Monash University",
    degree: "B. Business (Marketing)",
    graduationYear: 2025,
    stage: "Offer",
    appliedDate: "2025-03-05",
    daysInStage: 1,
    potentialScore: 85,
    avatarInitials: "PN",
    dimensions: {
      adaptability: 88,
      cognitiveAgility: 82,
      emotionalIntelligence: 90,
      collaboration: 86,
      drive: 84,
    },
    assessmentHistory: [
      { date: "2025-03-05", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-14", stage: "Assessed", note: "Score: 85." },
      { date: "2025-03-22", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-29", stage: "Interview", note: "Panel interview completed. Strong performance." },
      { date: "2025-04-08", stage: "Offer", note: "Verbal offer extended. Awaiting response." },
    ],
  },
  {
    id: "c004",
    name: "Liam O'Brien",
    university: "University of Queensland",
    degree: "B. Science (Data Science)",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-02-28",
    daysInStage: 10,
    potentialScore: 90,
    avatarInitials: "LO",
    dimensions: {
      adaptability: 91,
      cognitiveAgility: 94,
      emotionalIntelligence: 85,
      collaboration: 89,
      drive: 92,
    },
    assessmentHistory: [
      { date: "2025-02-28", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-10", stage: "Assessed", note: "Score: 90. Top 5% of cohort." },
      { date: "2025-03-18", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-25", stage: "Interview", note: "Excellent panel interview." },
      { date: "2025-04-01", stage: "Offer", note: "Offer made." },
      { date: "2025-04-09", stage: "Hired", note: "Offer accepted. Start date: 23 Feb 2026." },
    ],
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Shadow senior analyst for 4 weeks", status: "not-started", dueDate: "2026-04-30" },
      { title: "First solo client deliverable", status: "not-started", dueDate: "2026-06-30" },
    ],
  },
  {
    id: "c005",
    name: "Sophie Williams",
    university: "Australian National University",
    degree: "B. Politics & Economics",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-03-18",
    daysInStage: 8,
    potentialScore: 78,
    avatarInitials: "SW",
    dimensions: {
      adaptability: 80,
      cognitiveAgility: 75,
      emotionalIntelligence: 82,
      collaboration: 79,
      drive: 76,
    },
    assessmentHistory: [
      { date: "2025-03-18", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-27", stage: "Assessed", note: "Score: 78. Emerging potential." },
    ],
  },
  {
    id: "c006",
    name: "Marcus Chen",
    university: "University of Sydney",
    degree: "B. Commerce (Accounting)",
    graduationYear: 2025,
    stage: "Shortlisted",
    appliedDate: "2025-03-10",
    daysInStage: 6,
    potentialScore: 83,
    avatarInitials: "MC",
    dimensions: {
      adaptability: 82,
      cognitiveAgility: 86,
      emotionalIntelligence: 79,
      collaboration: 84,
      drive: 85,
    },
    assessmentHistory: [
      { date: "2025-03-10", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-19", stage: "Assessed", note: "Score: 83." },
      { date: "2025-03-26", stage: "Shortlisted", note: "Shortlisted." },
    ],
  },
  {
    id: "c007",
    name: "Ella Fitzgerald",
    university: "RMIT University",
    degree: "B. Design (Communication)",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-02",
    daysInStage: 9,
    potentialScore: 71,
    avatarInitials: "EF",
    dimensions: {
      adaptability: 74,
      cognitiveAgility: 68,
      emotionalIntelligence: 76,
      collaboration: 72,
      drive: 70,
    },
    assessmentHistory: [
      { date: "2025-04-02", stage: "Applied", note: "Application submitted. Awaiting assessment." },
    ],
  },
  {
    id: "c008",
    name: "Daniel Park",
    university: "Griffith University",
    degree: "B. Business (Management)",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-05",
    daysInStage: 6,
    potentialScore: 66,
    avatarInitials: "DP",
    dimensions: {
      adaptability: 65,
      cognitiveAgility: 68,
      emotionalIntelligence: 70,
      collaboration: 63,
      drive: 67,
    },
    assessmentHistory: [
      { date: "2025-04-05", stage: "Applied", note: "Application submitted." },
    ],
  },
  {
    id: "c009",
    name: "Isabelle Moreau",
    university: "University of Adelaide",
    degree: "B. Laws / B. Commerce",
    graduationYear: 2025,
    stage: "Interview",
    appliedDate: "2025-03-07",
    daysInStage: 3,
    potentialScore: 87,
    avatarInitials: "IM",
    dimensions: {
      adaptability: 89,
      cognitiveAgility: 88,
      emotionalIntelligence: 84,
      collaboration: 87,
      drive: 90,
    },
    assessmentHistory: [
      { date: "2025-03-07", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-16", stage: "Assessed", note: "Score: 87." },
      { date: "2025-03-24", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-04-02", stage: "Interview", note: "Interview in progress." },
    ],
  },
  {
    id: "c010",
    name: "Tom Nguyen",
    university: "Deakin University",
    degree: "B. IT (Cybersecurity)",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-03-22",
    daysInStage: 5,
    potentialScore: 74,
    avatarInitials: "TN",
    dimensions: {
      adaptability: 72,
      cognitiveAgility: 79,
      emotionalIntelligence: 68,
      collaboration: 74,
      drive: 78,
    },
    assessmentHistory: [
      { date: "2025-03-22", stage: "Applied", note: "Application submitted." },
      { date: "2025-04-01", stage: "Assessed", note: "Score: 74." },
    ],
  },
  {
    id: "c011",
    name: "Grace Halliday",
    university: "University of Melbourne",
    degree: "B. Science (Psychology)",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-03-01",
    daysInStage: 12,
    potentialScore: 91,
    avatarInitials: "GH",
    dimensions: {
      adaptability: 93,
      cognitiveAgility: 90,
      emotionalIntelligence: 95,
      collaboration: 92,
      drive: 88,
    },
    assessmentHistory: [
      { date: "2025-03-01", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-09", stage: "Assessed", note: "Score: 91. Exceptional EQ." },
      { date: "2025-03-17", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-24", stage: "Interview", note: "Outstanding interview." },
      { date: "2025-03-31", stage: "Offer", note: "Offer made." },
      { date: "2025-04-08", stage: "Hired", note: "Accepted. Start date: 23 Feb 2026." },
    ],
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Lead first team project", status: "not-started", dueDate: "2026-05-31" },
    ],
  },
  {
    id: "c012",
    name: "Ryan Kowalski",
    university: "UNSW Sydney",
    degree: "B. Commerce (Economics)",
    graduationYear: 2025,
    stage: "Shortlisted",
    appliedDate: "2025-03-14",
    daysInStage: 7,
    potentialScore: 80,
    avatarInitials: "RK",
    dimensions: {
      adaptability: 79,
      cognitiveAgility: 83,
      emotionalIntelligence: 78,
      collaboration: 80,
      drive: 82,
    },
    assessmentHistory: [
      { date: "2025-03-14", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-23", stage: "Assessed", note: "Score: 80." },
      { date: "2025-03-30", stage: "Shortlisted", note: "Shortlisted." },
    ],
  },
  {
    id: "c013",
    name: "Mia Zhang",
    university: "Monash University",
    degree: "B. Accounting",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-07",
    daysInStage: 4,
    potentialScore: 69,
    avatarInitials: "MZ",
    dimensions: {
      adaptability: 67,
      cognitiveAgility: 72,
      emotionalIntelligence: 71,
      collaboration: 68,
      drive: 65,
    },
    assessmentHistory: [
      { date: "2025-04-07", stage: "Applied", note: "Application submitted." },
    ],
  },
  {
    id: "c014",
    name: "Oliver Patel",
    university: "University of Western Australia",
    degree: "B. Engineering (Civil)",
    graduationYear: 2025,
    stage: "Offer",
    appliedDate: "2025-03-03",
    daysInStage: 2,
    potentialScore: 86,
    avatarInitials: "OP",
    dimensions: {
      adaptability: 87,
      cognitiveAgility: 85,
      emotionalIntelligence: 83,
      collaboration: 88,
      drive: 89,
    },
    assessmentHistory: [
      { date: "2025-03-03", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-12", stage: "Assessed", note: "Score: 86." },
      { date: "2025-03-20", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-27", stage: "Interview", note: "Strong technical interview." },
      { date: "2025-04-07", stage: "Offer", note: "Offer made. Decision expected 14 April." },
    ],
  },
  {
    id: "c015",
    name: "Zara Ahmed",
    university: "Curtin University",
    degree: "B. Commerce (HR)",
    graduationYear: 2025,
    stage: "Assessed",
    appliedDate: "2025-03-25",
    daysInStage: 3,
    potentialScore: 77,
    avatarInitials: "ZA",
    dimensions: {
      adaptability: 76,
      cognitiveAgility: 74,
      emotionalIntelligence: 82,
      collaboration: 79,
      drive: 75,
    },
    assessmentHistory: [
      { date: "2025-03-25", stage: "Applied", note: "Application submitted." },
      { date: "2025-04-03", stage: "Assessed", note: "Score: 77." },
    ],
  },
  {
    id: "c016",
    name: "Noah Campbell",
    university: "University of Newcastle",
    degree: "B. Business (Finance)",
    graduationYear: 2025,
    stage: "Applied",
    appliedDate: "2025-04-01",
    daysInStage: 10,
    potentialScore: 62,
    avatarInitials: "NC",
    dimensions: {
      adaptability: 60,
      cognitiveAgility: 65,
      emotionalIntelligence: 63,
      collaboration: 61,
      drive: 64,
    },
    assessmentHistory: [
      { date: "2025-04-01", stage: "Applied", note: "Application submitted." },
    ],
  },
  {
    id: "c017",
    name: "Chloe Stevenson",
    university: "University of Tasmania",
    degree: "B. Science (Environmental)",
    graduationYear: 2025,
    stage: "Interview",
    appliedDate: "2025-03-06",
    daysInStage: 1,
    potentialScore: 82,
    avatarInitials: "CS",
    dimensions: {
      adaptability: 84,
      cognitiveAgility: 80,
      emotionalIntelligence: 83,
      collaboration: 82,
      drive: 81,
    },
    assessmentHistory: [
      { date: "2025-03-06", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-15", stage: "Assessed", note: "Score: 82." },
      { date: "2025-03-23", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-04-04", stage: "Interview", note: "Interview today." },
    ],
  },
  {
    id: "c018",
    name: "Ethan Brooks",
    university: "Bond University",
    degree: "B. Laws",
    graduationYear: 2025,
    stage: "Hired",
    appliedDate: "2025-02-25",
    daysInStage: 14,
    potentialScore: 89,
    avatarInitials: "EB",
    dimensions: {
      adaptability: 90,
      cognitiveAgility: 88,
      emotionalIntelligence: 87,
      collaboration: 91,
      drive: 90,
    },
    assessmentHistory: [
      { date: "2025-02-25", stage: "Applied", note: "Application submitted." },
      { date: "2025-03-05", stage: "Assessed", note: "Score: 89. Top 10% of cohort." },
      { date: "2025-03-13", stage: "Shortlisted", note: "Shortlisted." },
      { date: "2025-03-20", stage: "Interview", note: "Excellent panel interview." },
      { date: "2025-03-28", stage: "Offer", note: "Offer made." },
      { date: "2025-04-05", stage: "Hired", note: "Accepted. Start date: 23 Feb 2026." },
    ],
    developmentGoals: [
      { title: "Complete induction program", status: "not-started", dueDate: "2026-03-15" },
      { title: "Assigned mentor", status: "not-started", dueDate: "2026-03-20" },
      { title: "First client-facing role", status: "not-started", dueDate: "2026-07-31" },
    ],
  },
];
