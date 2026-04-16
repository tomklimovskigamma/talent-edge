// __tests__/notes.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getNotes, addNote, __resetNotesStore } from "@/lib/notes";

beforeEach(() => {
  __resetNotesStore();
});

describe("getNotes", () => {
  it("returns an empty array for unseen candidate ids", () => {
    expect(getNotes("unknown")).toEqual([]);
  });

  it("returns a clone — mutating the returned array does not affect storage", () => {
    addNote("c001", "first");
    const notes = getNotes("c001");
    notes.pop();
    expect(getNotes("c001")).toHaveLength(1);
  });
});

describe("addNote", () => {
  it("returns a Note with non-empty id and createdAt", () => {
    const note = addNote("c001", "text");
    expect(note.id).toBeTruthy();
    expect(note.createdAt).toBeTruthy();
    expect(note.text).toBe("text");
  });

  it("stores the note and is retrievable via getNotes", () => {
    const saved = addNote("c001", "first note");
    const notes = getNotes("c001");
    expect(notes).toHaveLength(1);
    expect(notes[0]).toEqual(saved);
  });

  it("isolates notes per candidate id", () => {
    addNote("c001", "for c001");
    addNote("c002", "for c002");
    expect(getNotes("c001").map((n) => n.text)).toEqual(["for c001"]);
    expect(getNotes("c002").map((n) => n.text)).toEqual(["for c002"]);
  });

  it("orders notes newest-first", () => {
    addNote("c001", "first");
    addNote("c001", "second");
    addNote("c001", "third");
    expect(getNotes("c001").map((n) => n.text)).toEqual(["third", "second", "first"]);
  });

  it("generates distinct ids for successive notes", () => {
    const a = addNote("c001", "a");
    const b = addNote("c001", "b");
    expect(a.id).not.toBe(b.id);
  });
});
