import type { NextRequest } from "next/server";
import { runMockAnalysis } from "@/lib/video-analysis";
import { getPromptById } from "@/lib/data/video-prompts";

// Server-side endpoint for real video analysis.
// Accepts multipart/form-data with one or more video Blobs under the "videos" field
// (plus matching "questionIds"); transcribes each with Groq Whisper (free tier);
// returns mock competency scores + combined transcript with per-question headers.
// Only called when NEXT_PUBLIC_VIDEO_ANALYSIS_MODE=real and GROQ_API_KEY is set.

export async function POST(req: NextRequest) {
  const GROQ_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_KEY) {
    return Response.json(
      { error: "Analysis API keys not configured." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const candidateId = formData.get("candidateId") as string | null;
  const videoFiles = formData.getAll("videos") as File[];
  const questionIds = formData.getAll("questionIds") as string[];

  if (!candidateId || videoFiles.length === 0) {
    return Response.json({ error: "Missing videos or candidateId." }, { status: 400 });
  }

  const sections: string[] = [];
  for (let i = 0; i < videoFiles.length; i++) {
    const file = videoFiles[i];
    const whisperBody = new FormData();
    whisperBody.append("file", file);
    whisperBody.append("model", "whisper-large-v3");
    whisperBody.append("response_format", "text");

    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_KEY}` },
      body: whisperBody,
    });
    if (!whisperRes.ok) {
      const errBody = await whisperRes.text();
      console.error("Groq Whisper error", whisperRes.status, errBody);
      return Response.json({ error: "Groq Whisper transcription failed." }, { status: 502 });
    }
    const text = (await whisperRes.text()).trim();

    const qid = questionIds[i];
    const prompt = qid ? getPromptById(qid) : undefined;
    const header = prompt
      ? `Question ${i + 1}: ${prompt.question}`
      : `Question ${i + 1}`;
    sections.push(`${header}\n\n${text}`);
  }

  const transcript = sections.join("\n\n---\n\n");

  const mockAnalysis = runMockAnalysis(candidateId);
  return Response.json({
    ...mockAnalysis,
    transcript,
  });
}
