"use client";

import { useState, useEffect } from "react";
import { Video, Play, Sparkles, FileText, X, Download } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate, VideoInterviewData, PotentialDimensions } from "@/lib/data/candidates";
import { dimensionLabels } from "@/lib/data/candidates";
import { getPromptById } from "@/lib/data/video-prompts";
import { getSessionVideoInterview } from "@/lib/video/storage";

export function VideoInterviewPanel({ candidate }: { candidate: Candidate }) {
  const seededData = candidate.videoInterview;
  const sessionData = typeof window !== "undefined" ? getSessionVideoInterview(candidate.id) : undefined;
  const data = sessionData ?? seededData;
  if (!data) return null;

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
      </CardHeader>
      <CardContent className="space-y-5">
        <ResponsesRow data={data} />
        {data.analysis && <AnalysisBlock analysis={data.analysis} />}
      </CardContent>
    </Card>
  );
}

function ResponsesRow({ data }: { data: VideoInterviewData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Responses</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.responses.map((response, i) => {
          const prompt = getPromptById(response.questionId);
          const isActive = activeIndex === i;
          return (
            <div key={response.questionId} className="border rounded-lg overflow-hidden">
              {isActive ? (
                <video
                  src={response.videoUrl}
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
}: {
  analysis: NonNullable<VideoInterviewData["analysis"]>;
}) {
  const [showTranscript, setShowTranscript] = useState(false);

  const chartData = (Object.keys(analysis.competencyScores) as Array<keyof PotentialDimensions>).map(
    (key) => ({
      subject: dimensionLabels[key],
      score: analysis.competencyScores[key],
      fullMark: 100,
    })
  );

  function downloadTranscript() {
    if (!analysis.transcript) return;
    const blob = new Blob([analysis.transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

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

        {analysis.transcript && (
          <div className="pt-1 border-t border-slate-200">
            <button
              onClick={() => setShowTranscript(true)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <FileText size={12} aria-hidden="true" />
              View transcript
            </button>
          </div>
        )}
      </div>

      {showTranscript && analysis.transcript && (
        <TranscriptModal
          transcript={analysis.transcript}
          onClose={() => setShowTranscript(false)}
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
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-indigo-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-700">Interview Transcript</h2>
          </div>
          <button
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
