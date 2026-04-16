export type VideoPrompt = {
  id: string;
  order: number;
  question: string;
  prepSeconds: number;
  recordSeconds: number;
  primaryDimension: "adaptability" | "cognitiveAgility" | "emotionalIntelligence" | "collaboration" | "drive";
};

export const videoPrompts: VideoPrompt[] = [
  {
    id: "vq1",
    order: 1,
    question: "Tell us about a time you had to change approach mid-way through something important. What made you change, and what happened next?",
    prepSeconds: 30,
    recordSeconds: 60,
    primaryDimension: "adaptability",
  },
  {
    id: "vq2",
    order: 2,
    question: "Walk us through how you'd diagnose an unfamiliar problem you didn't know the answer to. What's your first move, and how do you know when you're done?",
    prepSeconds: 30,
    recordSeconds: 60,
    primaryDimension: "cognitiveAgility",
  },
  {
    id: "vq3",
    order: 3,
    question: "Tell us about something you've worked hard at that nobody asked you to. Why did you do it, and what did you learn?",
    prepSeconds: 30,
    recordSeconds: 60,
    primaryDimension: "drive",
  },
];

export function getPromptById(id: string): VideoPrompt | undefined {
  return videoPrompts.find((p) => p.id === id);
}
