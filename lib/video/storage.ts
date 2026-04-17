// IndexedDB-backed storage for live-recorded video interviews.
// Blobs survive tab navigation (unlike object URLs), so the recording tab can
// write and the dashboard tab can read back from the same origin.

import type { VideoInterviewData } from "@/lib/data/candidates";

const DB_NAME = "talent-edge-video";
const DB_VERSION = 1;
const RECORDINGS_STORE = "recordings";
const INTERVIEWS_STORE = "interviews";

export type StoredRecording = {
  candidateId: string;
  questionId: string;
  blob: Blob;
  durationSeconds: number;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        db.createObjectStore(RECORDINGS_STORE);
      }
      if (!db.objectStoreNames.contains(INTERVIEWS_STORE)) {
        db.createObjectStore(INTERVIEWS_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const req = run(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function storeRecording(id: string, recording: StoredRecording): Promise<void> {
  return tx<IDBValidKey>(RECORDINGS_STORE, "readwrite", (s) => s.put(recording, id)).then(
    () => undefined,
  );
}

export function getRecording(id: string): Promise<StoredRecording | undefined> {
  return tx<StoredRecording | undefined>(RECORDINGS_STORE, "readonly", (s) => s.get(id));
}

export function markVideoInterviewComplete(
  candidateId: string,
  data: VideoInterviewData,
): Promise<void> {
  return tx<IDBValidKey>(INTERVIEWS_STORE, "readwrite", (s) => s.put(data, candidateId)).then(
    () => undefined,
  );
}

export function getSessionVideoInterview(
  candidateId: string,
): Promise<VideoInterviewData | undefined> {
  return tx<VideoInterviewData | undefined>(INTERVIEWS_STORE, "readonly", (s) =>
    s.get(candidateId),
  );
}
