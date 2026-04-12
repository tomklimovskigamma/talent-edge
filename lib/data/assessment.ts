// lib/data/assessment.ts

export type Track = "finance" | "technology" | "people-culture";
export type Dimension = "adaptability" | "cognitiveAgility" | "emotionalIntelligence" | "collaboration" | "drive";

export type TrackScenario = { finance: string; technology: string; "people-culture": string };

// ── Question variant types ──────────────────────────────────────────────

export type LikertQuestion = {
  type: "likert";
  id: string;
  text: string;
  reversed: boolean;     // if true, score = 6 - value
  defaultValue: number;  // 1–5
};

export type SJTOption = { id: string; text: string; score: number };

export type SJTQuestion = {
  type: "sjt";
  id: string;
  scenario: string | TrackScenario;
  options: SJTOption[];
  defaultOptionId: string;
};

export type ForcedChoiceQuestion = {
  type: "forced-choice";
  id: string;
  prompt: string;
  optionA: { text: string; score: number };
  optionB: { text: string; score: number };
  defaultChoice: "A" | "B";
};

export type SequencePuzzleQuestion = {
  type: "sequence-puzzle";
  id: string;
  prompt: string;
  defaultOptionId: "A"; // A is always the correct answer
};

export type EmotionFaceQuestion = {
  type: "emotion-face";
  id: string;
  prompt: string;
  // Face shown is always the "Anxious" face (defined in EmotionFace.tsx)
  options: { id: string; label: string; score: number }[];
  defaultOptionId: string; // "B" = Anxious = correct
};

export type Question =
  | LikertQuestion
  | SJTQuestion
  | ForcedChoiceQuestion
  | SequencePuzzleQuestion
  | EmotionFaceQuestion;

export type DimensionConfig = {
  dimension: Dimension;
  label: string;
  tagline: string;   // shown below label on section header
  questions: Question[];
};

// ── Registration ────────────────────────────────────────────────────────

export type RegistrationData = {
  name: string;
  email: string;
  university: string;
  degree: string;
  track: Track;
};

export const defaultRegistration: RegistrationData = {
  name: "Jordan Lee",
  email: "jordan.lee@student.unimelb.edu.au",
  university: "University of Melbourne",
  degree: "B. Commerce (Finance & Economics)",
  track: "finance",
};

export const trackLabels: Record<Track, string> = {
  finance: "Finance",
  technology: "Technology",
  "people-culture": "People & Culture",
};

// ── Dimension question data ──────────────────────────────────────────────

export const dimensionConfigs: DimensionConfig[] = [
  // ── 1. ADAPTABILITY ───────────────────────────────────────────────────
  {
    dimension: "adaptability",
    label: "Adaptability",
    tagline: "How you respond when circumstances change.",
    questions: [
      {
        type: "sjt",
        id: "ada-1",
        scenario: {
          finance:
            "You've spent a week building a detailed financial model for a client pitch. The morning of the presentation, your manager tells you the client's strategy has shifted entirely — a completely different analysis is needed by end of day.",
          technology:
            "You've spent a week architecting a technical solution for a client project. The morning of your design review, your manager tells you the client has changed their requirements entirely — a different approach is needed by end of day.",
          "people-culture":
            "You've spent a week designing an onboarding program for a new team. The day before launch, leadership restructures the team entirely — a completely different program is needed by end of day.",
        },
        options: [
          { id: "A", text: "Ask your manager to clarify the new direction before changing anything.", score: 5 },
          { id: "B", text: "Start rebuilding immediately — the sooner you start, the better.", score: 4 },
          { id: "C", text: "Deliver the original work and flag the change for next time.", score: 2 },
          { id: "D", text: "Ask if the deadline can be extended given the scale of change.", score: 3 },
        ],
        defaultOptionId: "A",
      },
      {
        type: "likert",
        id: "ada-2",
        text: "When plans change at short notice, I adjust quickly without losing momentum.",
        reversed: false,
        defaultValue: 3,
      },
      {
        type: "likert",
        id: "ada-3",
        text: "I find it hard to abandon an approach I've already invested significant time developing.",
        reversed: true,
        defaultValue: 2,
      },
      {
        type: "sjt",
        id: "ada-4",
        scenario: {
          finance:
            "Your team is switching from Excel to a new financial planning platform — in one week. Several teammates are resistant to the change.",
          technology:
            "Your team is switching from your current tech stack to a new framework — in one sprint. Several teammates are resistant to the change.",
          "people-culture":
            "Your HR team is switching to a new HRIS platform — in two weeks. Several teammates are resistant to the change.",
        },
        options: [
          { id: "A", text: "Embrace it — start learning the new tool immediately.", score: 5 },
          { id: "B", text: "Learn it and proactively help teammates who are struggling.", score: 5 },
          { id: "C", text: "Suggest a longer transition period to minimise disruption.", score: 3 },
          { id: "D", text: "Raise concerns about the timing with your manager.", score: 2 },
        ],
        defaultOptionId: "A",
      },
    ],
  },

  // ── 2. COGNITIVE AGILITY ──────────────────────────────────────────────
  {
    dimension: "cognitiveAgility",
    label: "Cognitive Agility",
    tagline: "How quickly you learn, reason, and solve new problems.",
    questions: [
      {
        type: "sequence-puzzle",
        id: "cog-1",
        prompt:
          "Each row and column contains one of each colour (blue, amber, indigo) and one of each shape (circle, square, triangle). Which tile completes the grid?",
        defaultOptionId: "A",
      },
      {
        type: "sjt",
        id: "cog-2",
        scenario: {
          finance:
            "You receive two reports about a client's financial health. Your analyst shows healthy cash flow; an external advisor flags significant debt concerns. You have a client call in 20 minutes.",
          technology:
            "Two monitoring dashboards show conflicting data about your system. One shows healthy metrics; another shows error spikes. A client demo is in 20 minutes.",
          "people-culture":
            "Two exit interview summaries give conflicting signals about team morale. One shows high satisfaction; another reveals serious concerns. A board briefing is in 20 minutes.",
        },
        options: [
          { id: "A", text: "Raise the discrepancy transparently at the meeting and commit to resolving it.", score: 5 },
          { id: "B", text: "Go with the more optimistic data — don't alarm the client unnecessarily.", score: 2 },
          { id: "C", text: "Quickly contact both sources to determine which is accurate before the call.", score: 4 },
          { id: "D", text: "Postpone the meeting until you can reconcile the data.", score: 3 },
        ],
        defaultOptionId: "C",
      },
      {
        type: "likert",
        id: "cog-3",
        text: "I enjoy tackling complex problems that require thinking in genuinely new ways.",
        reversed: false,
        defaultValue: 4,
      },
      {
        type: "forced-choice",
        id: "cog-4",
        prompt: "Which feels more like you?",
        optionA: {
          text: "I like to fully understand a problem before I act on it.",
          score: 4,
        },
        optionB: {
          text: "I prefer to act, then adjust my approach based on what I learn.",
          score: 5,
        },
        defaultChoice: "B",
      },
    ],
  },

  // ── 3. EMOTIONAL INTELLIGENCE ─────────────────────────────────────────
  {
    dimension: "emotionalIntelligence",
    label: "Emotional Intelligence",
    tagline: "How you read, manage, and respond to emotions.",
    questions: [
      {
        type: "emotion-face",
        id: "ei-1",
        prompt: "Look at this person's expression. What are they most likely feeling?",
        options: [
          { id: "A", label: "Happy", score: 1 },
          { id: "B", label: "Anxious", score: 5 },   // ← correct
          { id: "C", label: "Surprised", score: 3 },
          { id: "D", label: "Confident", score: 1 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "sjt",
        id: "ei-2",
        scenario: {
          finance:
            "During a client presentation, a senior partner interrupts to challenge your financial analysis in front of the room. You believe your numbers are correct.",
          technology:
            "During a code review, a senior engineer publicly challenges your architecture choice in front of the team. You believe your approach is sound.",
          "people-culture":
            "During a leadership meeting, a senior manager publicly questions your candidate recommendations. You believe your assessment is correct.",
        },
        options: [
          { id: "A", text: "Defend your position clearly and immediately.", score: 2 },
          { id: "B", text: "Thank them and offer to discuss the detail after the meeting.", score: 5 },
          { id: "C", text: "Concede to avoid prolonging the tension.", score: 2 },
          { id: "D", text: "Ask them to elaborate on their concern so you fully understand it.", score: 4 },
        ],
        defaultOptionId: "D",
      },
      {
        type: "likert",
        id: "ei-3",
        text: "I notice when someone around me is upset even before they say anything.",
        reversed: false,
        defaultValue: 3,
      },
      {
        type: "sjt",
        id: "ei-4",
        scenario: {
          finance:
            "A colleague on your finance team is noticeably disengaged and falling behind on their deliverables. The quarter-end deadline is two weeks away.",
          technology:
            "A teammate is noticeably disengaged and falling behind on their sprint tasks. The release date is two weeks away.",
          "people-culture":
            "A colleague in your HR team is noticeably disengaged and falling behind on their work. A key hiring cycle closes in two weeks.",
        },
        options: [
          { id: "A", text: "Report the issue to your manager so they can handle it.", score: 2 },
          { id: "B", text: "Check in with them privately — ask if they're okay and offer to help.", score: 5 },
          { id: "C", text: "Pick up their tasks quietly so the deadline isn't affected.", score: 3 },
          { id: "D", text: "Leave them to sort it out — it's not your responsibility.", score: 1 },
        ],
        defaultOptionId: "B",
      },
    ],
  },

  // ── 4. COLLABORATION ─────────────────────────────────────────────────
  {
    dimension: "collaboration",
    label: "Collaboration",
    tagline: "How you contribute to and elevate those around you.",
    questions: [
      {
        type: "sjt",
        id: "col-1",
        scenario: {
          finance:
            "Two colleagues disagree on the right financial model approach — a senior analyst and a junior analyst. You're their peer. The client deliverable is due tomorrow.",
          technology:
            "Two engineers disagree on a technical implementation approach — one senior, one junior. You're their peer. The sprint closes tomorrow.",
          "people-culture":
            "Two HR colleagues disagree on a hiring recommendation — one senior, one junior. You're their peer. The panel meets tomorrow.",
        },
        options: [
          { id: "A", text: "Side with the senior person — their experience should carry the decision.", score: 2 },
          { id: "B", text: "Facilitate a quick discussion to hear both perspectives before deciding.", score: 5 },
          { id: "C", text: "Suggest escalating it to your manager to avoid the conflict.", score: 3 },
          { id: "D", text: "Make your own recommendation based on what you've heard from both.", score: 4 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "forced-choice",
        id: "col-2",
        prompt: "Which is more true of you at work?",
        optionA: {
          text: "I focus on delivering my own work to the highest possible standard.",
          score: 3,
        },
        optionB: {
          text: "I check in on teammates and offer help even when it's not my responsibility.",
          score: 5,
        },
        defaultChoice: "B",
      },
      {
        type: "likert",
        id: "col-3",
        text: "I naturally share information or knowledge that might help others, even when no one asks.",
        reversed: false,
        defaultValue: 4,
      },
      {
        type: "sjt",
        id: "col-4",
        scenario: {
          finance:
            "Your team delivers a high-profile financial project that receives significant recognition from leadership. You contributed more than anyone else. When asked to speak about it, what do you do?",
          technology:
            "Your team ships a high-profile feature that receives significant recognition from leadership. You contributed more than anyone else. When asked to speak about it, what do you do?",
          "people-culture":
            "Your team completes a major talent initiative that receives significant recognition from leadership. You contributed more than anyone else. When asked to speak about it, what do you do?",
        },
        options: [
          { id: "A", text: "Explain your specific contributions clearly — it's important others know.", score: 3 },
          { id: "B", text: "Share the credit with the whole team equally.", score: 4 },
          { id: "C", text: "Acknowledge the team effort and highlight a few key individual contributions, including yours.", score: 5 },
          { id: "D", text: "Deflect entirely and give all credit to the team.", score: 3 },
        ],
        defaultOptionId: "C",
      },
    ],
  },

  // ── 5. DRIVE ─────────────────────────────────────────────────────────
  {
    dimension: "drive",
    label: "Drive",
    tagline: "Your motivation, ambition, and persistence.",
    questions: [
      {
        type: "sjt",
        id: "drv-1",
        scenario: {
          finance:
            "You're assigned two projects. Task A is a routine reconciliation with a guaranteed clean outcome. Task B is a complex financial model for a new product — more difficult, higher impact, 65% chance of success.",
          technology:
            "You're assigned two tasks. Task A is a well-scoped bug fix with guaranteed completion. Task B is a greenfield feature — more ambiguous, higher impact, 65% chance of shipping on time.",
          "people-culture":
            "You're given two initiatives. Task A is an established onboarding process update — predictable outcome. Task B is a new culture program — more complex, higher impact, 65% chance of success.",
        },
        options: [
          { id: "A", text: "Task A — I'd rather deliver something reliably.", score: 2 },
          { id: "B", text: "Task B — I want the challenge and the impact.", score: 5 },
          { id: "C", text: "Try to take on both in parallel.", score: 3 },
          { id: "D", text: "Ask my manager which is more important.", score: 3 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "likert",
        id: "drv-2",
        text: "I set ambitious goals for myself, even when there's no external pressure to do so.",
        reversed: false,
        defaultValue: 4,
      },
      {
        type: "sjt",
        id: "drv-3",
        scenario: {
          finance:
            "You've tried three approaches to resolve a complex accounts discrepancy. None have worked. It's 5pm Friday and the report is due Monday morning.",
          technology:
            "You've tried three approaches to fix a critical production bug. None have worked. It's 5pm Friday and the fix is needed for Monday's deployment.",
          "people-culture":
            "You've tried three approaches to improve your team's engagement scores. Nothing has moved the needle after six months.",
        },
        options: [
          { id: "A", text: "Step away and come back fresh — sometimes distance is what you need.", score: 3 },
          { id: "B", text: "Ask a trusted colleague for a fresh perspective before giving up.", score: 5 },
          { id: "C", text: "Keep working — I'll solve it through sheer effort.", score: 3 },
          { id: "D", text: "Escalate immediately to your manager.", score: 2 },
        ],
        defaultOptionId: "B",
      },
      {
        type: "likert",
        id: "drv-4",
        text: "I'm satisfied once I meet the expected standard — going beyond it isn't always necessary.",
        reversed: true,
        defaultValue: 2,
      },
    ],
  },
];

// Helper: resolve scenario text for a given track
export function resolveScenario(scenario: string | TrackScenario, track: Track): string {
  if (typeof scenario === "string") return scenario;
  return scenario[track];
}

// Helper: get dimension config by key
export function getDimensionConfig(dimension: Dimension): DimensionConfig {
  return dimensionConfigs.find((d) => d.dimension === dimension)!;
}

// Ordered list of dimensions for step progression
export const dimensionOrder: Dimension[] = [
  "adaptability",
  "cognitiveAgility",
  "emotionalIntelligence",
  "collaboration",
  "drive",
];

export const dimensionLabels: Record<Dimension, string> = {
  adaptability: "Adaptability",
  cognitiveAgility: "Cognitive Agility",
  emotionalIntelligence: "Emotional Intelligence",
  collaboration: "Collaboration",
  drive: "Drive",
};
