"use client";

import { useEffect, useState } from "react";
import { Video, Play, Sparkles } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate, VideoInterviewData, PotentialDimensions } from "@/lib/data/candidates";
import { dimensionLabels } from "@/lib/data/candidates";
import { getPromptById } from "@/lib/data/video-prompts";
import { getSessionVideoInterview, getRecording } from "@/lib/video/storage";

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
        <ResponsesRow data={data} liveUrls={liveUrls} />
        {data.analysis && <AnalysisBlock analysis={data.analysis} />}
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
}: {
  analysis: NonNullable<VideoInterviewData["analysis"]>;
}) {
  const chartData = (Object.keys(analysis.competencyScores) as Array<keyof PotentialDimensions>).map(
    (key) => ({
      subject: dimensionLabels[key],
      score: analysis.competencyScores[key],
      fullMark: 100,
    })
  );

  return (
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
    </div>
  );
}
