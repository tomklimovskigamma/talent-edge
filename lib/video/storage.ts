// In-memory store for video recordings during a demo session.
// Not persisted; lost on page reload. Production would use Vercel Blob + signed URLs.

export type StoredRecording = {
  candidateId: string;
  questionId: string;
  blob: Blob;
  durationSeconds: number;
};

const store = new Map<string, StoredRecording>();

export function storeRecording(id: string, recording: StoredRecording): void {
  store.set(id, recording);
}

export function getRecording(id: string): StoredRecording | undefined {
  return store.get(id);
}

export function clearRecordings(): void {
  store.clear();
}

export function recordingUrlFor(id: string): string | undefined {
  const rec = store.get(id);
  if (!rec) return undefined;
  return URL.createObjectURL(rec.blob);
}
