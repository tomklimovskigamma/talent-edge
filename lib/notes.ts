// lib/notes.ts
export type Note = {
  id: string;
  text: string;
  createdAt: string; // ISO-8601
};

const store = new Map<string, Note[]>();

export function getNotes(candidateId: string): Note[] {
  const list = store.get(candidateId);
  return list ? [...list] : [];
}

export function addNote(candidateId: string, text: string): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
  const existing = store.get(candidateId) ?? [];
  store.set(candidateId, [note, ...existing]);
  return note;
}

export function __resetNotesStore(): void {
  store.clear();
}
