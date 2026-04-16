import type { NextRequest } from "next/server";
import { runMockAnalysis } from "@/lib/video-analysis";

// Server-side endpoint for real video analysis.
// Accepts multipart/form-data with a video Blob; transcribes with Groq Whisper (free tier);
// returns mock competency scores + real transcript (Claude step removed — no Anthropic key needed).
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
  const videoFile = formData.get("video") as File | null;
  const candidateId = formData.get("candidateId") as string | null;
  if (!videoFile || !candidateId) {
    return Response.json({ error: "Missing video or candidateId." }, { status: 400 });
  }

  // Step A: Groq Whisper transcription (whisper-large-v3, free tier)
  const whisperBody = new FormData();
  whisperBody.append("file", videoFile);
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
  const transcript = await whisperRes.text();

  // Step B: mock competency scores (deterministic per candidateId) + real transcript
  const mockAnalysis = runMockAnalysis(candidateId);
  return Response.json({
    ...mockAnalysis,
    transcript,
  });
}
