import type { NextRequest } from "next/server";

// Server-side endpoint for real video analysis.
// Accepts multipart/form-data with a video Blob; transcribes with Whisper;
// runs competency analysis with Claude; returns structured JSON.
// Only called when NEXT_PUBLIC_VIDEO_ANALYSIS_MODE=real and keys are set.

export async function POST(req: NextRequest) {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  if (!OPENAI_KEY || !ANTHROPIC_KEY) {
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

  // Step A: Whisper transcription
  const whisperBody = new FormData();
  whisperBody.append("file", videoFile);
  whisperBody.append("model", "whisper-1");
  whisperBody.append("response_format", "text");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: whisperBody,
  });
  if (!whisperRes.ok) {
    return Response.json({ error: "Whisper transcription failed." }, { status: 502 });
  }
  const transcript = await whisperRes.text();

  // Step B: Claude analysis
  const prompt =
    `You are analysing a graduate candidate's video interview responses. ` +
    `Score the candidate 1-100 on each of: adaptability, cognitiveAgility, emotionalIntelligence, collaboration, drive. ` +
    `Then write a 2-3 sentence summary, identify the strongestArea (one of the 5 competencies, human-readable), ` +
    `and write one sentence probeInF2F for the interviewer. Return strict JSON with fields: ` +
    `competencyScores (object with 5 number fields), summary, strongestArea, probeInF2F. ` +
    `Do NOT analyse visual/facial features — only the transcribed words.\n\n` +
    `Transcript:\n${transcript}`;

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!claudeRes.ok) {
    return Response.json({ error: "Claude analysis failed." }, { status: 502 });
  }
  const claudeData = (await claudeRes.json()) as { content: Array<{ text: string }> };
  const text = claudeData.content[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Could not parse Claude response." }, { status: 502 });
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return Response.json({
    ...parsed,
    analysedAt: new Date().toISOString(),
    transcript,
  });
}
