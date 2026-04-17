import type { NextRequest } from "next/server";

// Transcribes a single video with Groq Whisper (free tier) and returns just the text.
// The caller POSTs one video per request to stay under Vercel's 4.5MB serverless body cap;
// mock competency scoring happens client-side after all transcripts are collected.

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
  if (!videoFile) {
    return Response.json({ error: "Missing video." }, { status: 400 });
  }

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

  const transcript = (await whisperRes.text()).trim();
  return Response.json({ transcript });
}
