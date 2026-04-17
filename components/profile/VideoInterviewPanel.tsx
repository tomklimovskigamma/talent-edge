"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Video, Play, Sparkles, FileText, X, Download, RefreshCw } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate, VideoInterviewData, VideoInterviewAnalysis, PotentialDimensions } from "@/lib/data/candidates";
import { dimensionLabels } from "@/lib/data/candidates";
import { getPromptById } from "@/lib/data/video-prompts";
import { getSessionVideoInterview, getRecording } from "@/lib/video/storage";
import { getAnalysisMode, runMockAnalysis } from "@/lib/video-analysis";

export function VideoInterviewPanel({ candidate }: { candidate: Candidate }) {
  const seededData = candidate.videoInterview;
  const [sessionData, setSessionData] = useState<VideoInterviewData | undefined>();
  const [liveUrls, setLiveUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let revoked = false;
    const created: string[] = [];

    (async () => {
      const session = await getSessionVideoInterview(candidate.id);
      if (!session || revoked) return;
      setSessionData(session);

      const entries = await Promise.all(
        session.responses.map(async (r) => {
          const rec = await getRecording(`${candidate.id}-${r.questionId}`);
          if (!rec) return [r.questionId, ""] as const;
          const url = URL.createObjectURL(rec.blob);
          created.push(url);
          return [r.questionId, url] as const;
        }),
      );
      if (revoked) {
        created.forEach((u) => URL.revokeObjectURL(u));
        return;
      }
      setLiveUrls(Object.fromEntries(entries));
    })();

    return () => {
      revoked = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [candidate.id]);

  const data = sessionData ?? seededData;

  const [liveAnalysis, setLiveAnalysis] = useState<VideoInterviewAnalysis | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analyseError, setAnalyseError] = useState<string | null>(null);

  const isRealMode = getAnalysisMode() === "real";

  const runLiveAnalysis = useCallback(async () => {
    if (!data) return;
    setAnalysing(true);
    setAnalyseError(null);
    try {
      const sections: string[] = [];

      for (let i = 0; i < data.responses.length; i++) {
        const response = data.responses[i];
        const src = liveUrls[response.questionId] || response.videoUrl;
        if (!src) continue;

        const videoRes = await fetch(src);
        const blob = await videoRes.blob();

        const form = new FormData();
        form.append("video", blob, `interview-q${i + 1}.webm`);

        const res = await fetch("/api/video-analysis", { method: "POST", body: form });
        if (!res.ok) throw new Error(await res.text());
        const { transcript } = (await res.json()) as { transcript: string };

        const prompt = getPromptById(response.questionId);
        const header = prompt ? `Question ${i + 1}: ${prompt.question}` : `Question ${i + 1}`;
        sections.push(`${header}\n\n${transcript}`);
      }

      const combined = sections.join("\n\n---\n\n");
      const analysis = runMockAnalysis(candidate.id);
      setLiveAnalysis({ ...analysis, transcript: combined });
    } catch (err) {
      setAnalyseError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalysing(false);
    }
  }, [candidate.id, data, liveUrls]);

  if (!data) return null;

  const displayAnalysis = liveAnalysis ?? data.analysis;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Video size={15} className="text-indigo-500" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold text-slate-700">Video Interview</CardTitle>
          {data.completedAt && (
            <span className="text-xs text-slate-400 ml-auto">
              Completed {new Date(data.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        {analyseError && (
          <p className="text-xs text-rose-500 mt-1">{analyseError}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <ResponsesRow data={data} liveUrls={liveUrls} />
        {displayAnalysis && (
          <AnalysisBlock
            analysis={displayAnalysis}
            showAnalyseButton={isRealMode}
            analysing={analysing}
            hasRun={liveAnalysis !== null}
            onAnalyse={runLiveAnalysis}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ResponsesRow({
  data,
  liveUrls,
}: {
  data: VideoInterviewData;
  liveUrls: Record<string, string>;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Responses</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.responses.map((response, i) => {
          const prompt = getPromptById(response.questionId);
          const isActive = activeIndex === i;
          const src = liveUrls[response.questionId] || response.videoUrl;
          return (
            <div key={response.questionId} className="border rounded-lg overflow-hidden">
              {isActive && src ? (
                <video
                  src={src}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <button
                  onClick={() => setActiveIndex(i)}
                  className="w-full aspect-video bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                  aria-label={`Play response ${i + 1}`}
                >
                  <Play size={28} className="text-white/80" aria-hidden="true" />
                </button>
              )}
              <div className="p-3 bg-slate-50">
                <p className="text-xs text-slate-400 font-medium">Question {i + 1}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {prompt?.question ?? response.questionId}
                </p>
                <p className="text-xs text-slate-400 mt-1">{response.durationSeconds}s</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalysisBlock({
  analysis,
  showAnalyseButton,
  analysing,
  hasRun,
  onAnalyse,
}: {
  analysis: NonNullable<VideoInterviewData["analysis"]>;
  showAnalyseButton: boolean;
  analysing: boolean;
  hasRun: boolean;
  onAnalyse: () => void;
}) {
  const [showTranscript, setShowTranscript] = useState(false);

  const chartData = (Object.keys(analysis.competencyScores) as Array<keyof PotentialDimensions>).map(
    (key) => ({
      subject: dimensionLabels[key],
      score: analysis.competencyScores[key],
      fullMark: 100,
    })
  );

  const downloadTranscript = useCallback(() => {
    if (!analysis.transcript) return;
    const blob = new Blob([analysis.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-transcript.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [analysis.transcript]);

  const handleClose = useCallback(() => setShowTranscript(false), []);

  return (
    <>
      <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-indigo-500" aria-hidden="true" />
          <p className="text-xs font-semibold text-slate-700">Audio-only AI Analysis</p>
          <span className="text-[10px] text-slate-400 ml-auto">
            Transcript-based — no facial analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748B" }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#0EA5E9"
                fill="#0EA5E9"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                formatter={(value) => [`${value}/100`, "Score"]}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed mt-1">{analysis.summary}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Strongest signal
              </p>
              <p className="text-sm text-slate-700 mt-1">{analysis.strongestArea}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Probe in F2F
              </p>
              <p className="text-sm text-slate-700 mt-1">{analysis.probeInF2F}</p>
            </div>
          </div>
        </div>

        {(analysis.transcript || showAnalyseButton) && (
          <div className="pt-1 border-t border-slate-200 flex items-center gap-4">
            {analysis.transcript && (
              <button
                onClick={() => setShowTranscript(true)}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <FileText size={12} aria-hidden="true" />
                View transcript
              </button>
            )}
            {showAnalyseButton && (
              <button
                onClick={onAnalyse}
                disabled={analysing}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={analysing ? "animate-spin" : ""} aria-hidden="true" />
                {analysing ? "Analysing…" : hasRun ? "Re-analyse" : "Analyse with AI"}
              </button>
            )}
          </div>
        )}
      </div>

      {showTranscript && analysis.transcript && (
        <TranscriptModal
          transcript={analysis.transcript}
          onClose={handleClose}
          onDownload={downloadTranscript}
        />
      )}
    </>
  );
}

function TranscriptModal({
  transcript,
  onClose,
  onDownload,
}: {
  transcript: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transcript-modal-title"
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-indigo-500" aria-hidden="true" />
            <h2 id="transcript-modal-title" className="text-sm font-semibold text-slate-700">Interview Transcript</h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close transcript"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-400">
            {transcript.split(/\s+/).filter(Boolean).length} words
          </p>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
          >
            <Download size={12} aria-hidden="true" />
            Download .txt
          </button>
        </div>
      </div>
    </div>
  );
}
