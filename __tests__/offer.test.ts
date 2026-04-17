// __tests__/offer.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  DECLINE_REASONS,
  getOfferState,
  markAccepted,
  markDeclined,
  __resetOfferStore,
} from "@/lib/offer";

beforeEach(() => {
  __resetOfferStore();
});

describe("getOfferState", () => {
  it("returns pending default for an unseen candidate", () => {
    expect(getOfferState("unknown")).toEqual({
      status: "pending",
      declineReason: null,
      markedAt: null,
    });
  });
});

describe("markAccepted", () => {
  it("sets status to accepted with a markedAt timestamp and no decline reason", () => {
    markAccepted("c001");
    const state = getOfferState("c001");
    expect(state.status).toBe("accepted");
    expect(state.declineReason).toBeNull();
    expect(state.markedAt).toBeTruthy();
  });

  it("clears a prior declineReason when accepting after declining", () => {
    markDeclined("c001", DECLINE_REASONS[0]);
    markAccepted("c001");
    const state = getOfferState("c001");
    expect(state.status).toBe("accepted");
    expect(state.declineReason).toBeNull();
  });
});

describe("markDeclined", () => {
  it("sets status to declined with the reason and a markedAt timestamp", () => {
    markDeclined("c001", "Compensation");
    const state = getOfferState("c001");
    expect(state.status).toBe("declined");
    expect(state.declineReason).toBe("Compensation");
    expect(state.markedAt).toBeTruthy();
  });
});

describe("store isolation", () => {
  it("isolates state per candidate id", () => {
    markAccepted("c001");
    markDeclined("c002", "Other");
    expect(getOfferState("c001").status).toBe("accepted");
    expect(getOfferState("c002").status).toBe("declined");
    expect(getOfferState("c002").declineReason).toBe("Other");
  });
});
