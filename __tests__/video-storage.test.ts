import { describe, it, expect, beforeEach } from "vitest";
import { storeRecording, getRecording, clearRecordings, type StoredRecording } from "@/lib/video/storage";

describe("storage", () => {
  beforeEach(() => clearRecordings());

  it("returns undefined for an unknown id", () => {
    expect(getRecording("nope")).toBeUndefined();
  });

  it("stores and retrieves a recording by id", () => {
    const blob = new Blob(["dummy"], { type: "video/webm" });
    const stored: StoredRecording = {
      candidateId: "c001",
      questionId: "vq1",
      blob,
      durationSeconds: 42,
    };
    storeRecording("rec1", stored);
    expect(getRecording("rec1")).toBe(stored);
  });

  it("clearRecordings empties the store", () => {
    const blob = new Blob(["dummy"]);
    storeRecording("rec1", { candidateId: "c001", questionId: "vq1", blob, durationSeconds: 10 });
    clearRecordings();
    expect(getRecording("rec1")).toBeUndefined();
  });
});
