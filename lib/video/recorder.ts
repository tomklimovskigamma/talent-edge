// Thin wrapper over the browser MediaRecorder API for the video interview flow.
// Responsibilities: request permission, start/stop, emit the final Blob.
// No UI concerns. No storage concerns.

export type RecorderState = "idle" | "requesting-permission" | "ready" | "recording" | "stopped" | "error";

export type RecorderHandle = {
  stream: MediaStream;
  mediaRecorder: MediaRecorder;
  stop: () => Promise<Blob>;
  destroy: () => void;
};

export async function acquireCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support video recording.");
  }
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
    audio: true,
  });
}

export function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "video/webm";
}

export function startRecording(stream: MediaStream): RecorderHandle {
  const mimeType = pickMimeType();
  // Bitrate cap keeps ~60s recordings well under Vercel's 4.5MB serverless body limit.
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 500_000,
    audioBitsPerSecond: 64_000,
  });
  const chunks: BlobPart[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  mediaRecorder.start();

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      if (mediaRecorder.state === "inactive") {
        resolve(new Blob(chunks, { type: mimeType }));
        return;
      }
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };
      mediaRecorder.stop();
    });

  const destroy = () => {
    if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  };

  return { stream, mediaRecorder, stop, destroy };
}
