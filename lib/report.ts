import { dimensionLabels, type Candidate, type PotentialDimensions } from "@/lib/data/candidates";
import { type StageName } from "@/lib/data/program";
import { scoreLabel } from "@/lib/utils";

const highInterpretations: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Demonstrates strong adaptability — recalibrates quickly when circumstances change and moves through uncertainty without losing momentum.",
  cognitiveAgility:
    "Shows high cognitive agility — learns quickly, reasons well under uncertainty, and holds competing ideas without defaulting prematurely to a conclusion.",
  emotionalIntelligence:
    "Displays strong emotional intelligence — reads emotional signals accurately, manages reactions under pressure, and navigates interpersonal dynamics with skill.",
  collaboration:
    "Excels at collaboration — contributes generously to team outcomes, shares credit accurately, and elevates those around them.",
  drive:
    "Demonstrates strong drive — pursues growth beyond what is expected, sets high personal standards, and persists through difficulty.",
};

const emergingInterpretations: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Shows emerging adaptability — handles change reasonably well, with room to build greater comfort in fast-moving environments.",
  cognitiveAgility:
    "Demonstrates emerging cognitive agility — approaches problems thoughtfully, with opportunity to build tolerance for ambiguity and novel challenges.",
  emotionalIntelligence:
    "Shows developing emotional intelligence — demonstrates self-awareness and reasonable interpersonal skill, with room to deepen.",
  collaboration:
    "Demonstrates emerging collaboration — contributes to team settings and is developing the instinct to elevate others proactively.",
  drive:
    "Shows emerging drive — motivated and engaged, with room to stretch further into self-directed ambition and persistence.",
};

const developingInterpretations: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Adaptability is an area for development — deliberate exposure to environments requiring frequent change and uncertainty would support growth.",
  cognitiveAgility:
    "Cognitive agility is a development area — structured practice with novel problem types and ambiguous challenges would be beneficial.",
  emotionalIntelligence:
    "Emotional intelligence is a development area — active listening practice and reflection on interpersonal dynamics would support growth.",
  collaboration:
    "Collaboration is a development area — proactive information sharing and intentional credit-giving would strengthen team contribution.",
  drive:
    "Drive is a development area — setting specific stretch goals and identifying intrinsic motivators would help build sustained ambition.",
};

const developmentSuggestions: Record<keyof PotentialDimensions, string> = {
  adaptability:
    "Seek assignments that require frequent context-switching. Practice reframing setbacks as data rather than judgements.",
  cognitiveAgility:
    "Engage regularly with problems outside your domain. Build the habit of sitting with ambiguity before reaching for a conclusion.",
  emotionalIntelligence:
    "Focus on active listening and pausing before reacting in high-stakes conversations. Seek feedback on how you land in team settings.",
  collaboration:
    "Look for opportunities to share information before being asked and to give specific, public credit to team members.",
  drive:
    "Set stretch goals that sit slightly beyond your current comfort zone. Use structured reflection to identify what motivates you beyond external rewards.",
};

function getDimensionInterpretation(key: keyof PotentialDimensions, score: number): string {
  if (score >= 80) return highInterpretations[key];
  if (score >= 65) return emergingInterpretations[key];
  return developingInterpretations[key];
}

function getNextSteps(stage: StageName, potentialScore: number): string[] {
  if (stage === "Applied") {
    return [
      "Send the AI potential assessment link to the candidate to progress.",
      "Assessment takes approximately 15–20 minutes to complete.",
      "Results will be available for review immediately on completion.",
    ];
  }
  if (stage === "Assessed") {
    if (potentialScore >= 80) {
      return [
        "Candidate is recommended for shortlisting based on their potential score.",
        "Review dimension breakdown alongside CV before confirming shortlist decision.",
        "Target: shortlist decision within 5 business days of assessment completion.",
      ];
    }
    if (potentialScore >= 65) {
      return [
        "Candidate shows emerging potential — review dimension breakdown carefully before progressing.",
        "Consider a structured phone screen to probe specific development areas.",
        "Shortlisting decision at program manager discretion.",
      ];
    }
    return [
      "Based on current scores, candidate is not recommended for progression at this stage.",
      "Program manager review required before any decision is communicated to the candidate.",
      "Consider whether a retest or alternative assessment pathway is appropriate.",
    ];
  }
  if (stage === "Shortlisted") {
    return [
      "Schedule panel interview — candidate has been shortlisted.",
      "Share dimension breakdown with interviewers to guide structured probe questions.",
      "Use the development area as a targeted interview probe.",
    ];
  }
  if (stage === "Interview") {
    return [
      "Interview in progress — debrief to follow.",
      "Use this report as a reference during the post-interview debrief.",
      "Compare interview observations against the dimension breakdown.",
    ];
  }
  return [
    "Candidate has progressed to the offer / hire stage.",
    "Share this feedback report with the candidate as part of the offer communication.",
    "Use the development area to inform the first-year development plan.",
  ];
}

export type DimensionReport = {
  key: keyof PotentialDimensions;
  label: string;
  score: number;
  interpretation: string;
  developmentSuggestion?: string;
};

export type FeedbackReport = {
  candidateName: string;
  programName: string;
  assessmentDate: string;
  potentialScore: number;
  potentialLabel: string;
  strengths: [DimensionReport, DimensionReport];
  developmentArea: DimensionReport;
  nextSteps: string[];
};

export function generateFeedbackReport(candidate: Candidate): FeedbackReport {
  const { dimensions, potentialScore, name, stage, assessmentHistory, appliedDate } = candidate;

  const assessmentDate =
    assessmentHistory.length > 0
      ? assessmentHistory[assessmentHistory.length - 1].date
      : appliedDate;

  const sorted = (Object.entries(dimensions) as [keyof PotentialDimensions, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  const [top1Key, top1Score] = sorted[0];
  const [top2Key, top2Score] = sorted[1];
  const [bottomKey, bottomScore] = sorted[sorted.length - 1];

  const strengths: [DimensionReport, DimensionReport] = [
    {
      key: top1Key,
      label: dimensionLabels[top1Key],
      score: top1Score,
      interpretation: getDimensionInterpretation(top1Key, top1Score),
    },
    {
      key: top2Key,
      label: dimensionLabels[top2Key],
      score: top2Score,
      interpretation: getDimensionInterpretation(top2Key, top2Score),
    },
  ];

  const developmentArea: DimensionReport = {
    key: bottomKey,
    label: dimensionLabels[bottomKey],
    score: bottomScore,
    interpretation: getDimensionInterpretation(bottomKey, bottomScore),
    developmentSuggestion: developmentSuggestions[bottomKey],
  };

  return {
    candidateName: name,
    programName: "Meridian Group · 2026 Graduate Intake",
    assessmentDate,
    potentialScore,
    potentialLabel: scoreLabel(potentialScore),
    strengths,
    developmentArea,
    nextSteps: getNextSteps(stage, potentialScore),
  };
}
