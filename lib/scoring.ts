// lib/scoring.ts

import type { Question, Dimension } from "./data/assessment";
import type { PotentialDimensions } from "./data/candidates";

/**
 * Compute raw score (1–5) for a single question given the candidate's answer.
 * answer is either a string (option id) or number (likert value).
 */
export function scoreQuestion(question: Question, answer: string | number): number {
  switch (question.type) {
    case "likert": {
      const val = answer as number;
      return question.reversed ? 6 - val : val;
    }
    case "sjt": {
      const opt = question.options.find((o) => o.id === answer);
      return opt?.score ?? 3;
    }
    case "forced-choice": {
      return answer === "A" ? question.optionA.score : question.optionB.score;
    }
    case "sequence-puzzle": {
      // "A" is always the correct answer
      return answer === "A" ? question.correctScore : 1;
    }
    case "emotion-face": {
      const opt = question.options.find((o) => o.id === answer);
      return opt?.score ?? 1;
    }
  }
}

/**
 * Compute a 0–100 dimension score from raw question answers.
 * Returns null if any answer is missing.
 */
export function scoreDimension(
  questions: Question[],
  answers: (string | number | null)[]
): number {
  const scores = questions.map((q, i) => {
    const a = answers[i];
    if (a === null) return 3; // treat unanswered as neutral
    return scoreQuestion(q, a);
  });
  const sum = scores.reduce((acc, s) => acc + s, 0);
  const max = questions.length * 5;
  return Math.round((sum / max) * 100);
}

/**
 * Compute all 5 dimension scores and overall potentialScore from the full answer set.
 */
export function scoreAll(
  configs: { dimension: Dimension; questions: Question[] }[],
  allAnswers: Record<Dimension, (string | number | null)[]>
): { dimensions: PotentialDimensions; potentialScore: number } {
  const dimensions: PotentialDimensions = {
    adaptability: scoreDimension(
      configs.find((c) => c.dimension === "adaptability")!.questions,
      allAnswers.adaptability
    ),
    cognitiveAgility: scoreDimension(
      configs.find((c) => c.dimension === "cognitiveAgility")!.questions,
      allAnswers.cognitiveAgility
    ),
    emotionalIntelligence: scoreDimension(
      configs.find((c) => c.dimension === "emotionalIntelligence")!.questions,
      allAnswers.emotionalIntelligence
    ),
    collaboration: scoreDimension(
      configs.find((c) => c.dimension === "collaboration")!.questions,
      allAnswers.collaboration
    ),
    drive: scoreDimension(
      configs.find((c) => c.dimension === "drive")!.questions,
      allAnswers.drive
    ),
  };

  const potentialScore = Math.round(
    (dimensions.adaptability +
      dimensions.cognitiveAgility +
      dimensions.emotionalIntelligence +
      dimensions.collaboration +
      dimensions.drive) /
      5
  );

  return { dimensions, potentialScore };
}

/**
 * Build the default answers map for all dimensions from the question configs.
 * Used to pre-populate the assessment for demo click-through.
 */
export function buildDefaultAnswers(
  configs: { dimension: Dimension; questions: Question[] }[]
): Record<Dimension, (string | number | null)[]> {
  const result = {} as Record<Dimension, (string | number | null)[]>;
  for (const config of configs) {
    result[config.dimension] = config.questions.map((q) => {
      switch (q.type) {
        case "likert": return q.defaultValue;
        case "sjt": return q.defaultOptionId;
        case "forced-choice": return q.defaultChoice;
        case "sequence-puzzle": return q.defaultOptionId;
        case "emotion-face": return q.defaultOptionId;
      }
    });
  }
  return result;
}
