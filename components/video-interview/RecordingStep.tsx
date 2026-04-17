"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { acquireCamera, startRecording, type RecorderHandle } from "@/lib/video/recorder";
import { storeRecording } from "@/lib/video/storage";
import type { VideoPrompt } from "@/lib/data/video-prompts";

export function RecordingStep({
  prompt,
  candidateId,
  onComplete,
}: {
  prompt: VideoPrompt;
  candidateId: string;
  onComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<RecorderHandle | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(prompt.recordSeconds);
  const [error, setError] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let tickInterval: ReturnType<typeof setInterval> | null = null;

    async function begin() {
      try {
        const stream = await acquireCamera();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        handleRef.current = startRecording(stream);

        tickInterval = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              if (tickInterval) clearInterval(tickInterval);
              void stopAndAdvance();
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not access camera.");
      }
    }

    async function stopAndAdvance() {
      if (!handleRef.current || isStopping) return;
      setIsStopping(true);
      const handle = handleRef.current;
      handleRef.current = null;
      const blob = await handle.stop();
      await storeRecording(`${candidateId}-${prompt.id}`, {
        candidateId,
        questionId: prompt.id,
        blob,
        durationSeconds: prompt.recordSeconds - secondsLeft,
      });
      handle.destroy();
      onComplete();
    }

    void begin();

    return () => {
      cancelled = true;
      if (tickInterval) clearInterval(tickInterval);
      if (handleRef.current) handleRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt.id]);

  async function handleStopClick() {
    if (!handleRef.current || isStopping) return;
    setIsStopping(true);
    const handle = handleRef.current;
    handleRef.current = null;
    const blob = await handle.stop();
    await storeRecording(`${candidateId}-${prompt.id}`, {
      candidateId,
      questionId: prompt.id,
      blob,
      durationSeconds: prompt.recordSeconds - secondsLeft,
    });
    handle.destroy();
    onComplete();
  }

  if (error) {
    return (
      <div className="bg-white border rounded-xl shadow-sm p-8 space-y-3">
        <p className="text-sm font-semibold text-rose-700">Recording unavailable</p>
        <p className="text-sm text-slate-600">{error}</p>
        <p className="text-xs text-slate-400">
          For the demo, allow camera and microphone access in your browser and reload.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-8 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          Question {prompt.order}
        </p>
        <p className="text-base text-slate-700 mt-1 leading-relaxed">{prompt.question}</p>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          <Circle size={8} className="fill-rose-500 text-rose-500" aria-hidden="true" />
          <span>Recording</span>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-sm font-semibold tabular-nums px-3 py-1 rounded-full">
          {secondsLeft}s
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleStopClick}
        disabled={isStopping}
        className="w-full"
      >
        {isStopping ? "Saving..." : "Stop and continue"}
      </Button>
    </div>
  );
}
