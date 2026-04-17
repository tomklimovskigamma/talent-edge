// lib/offer.ts
export type OfferStatus = "pending" | "accepted" | "declined";

export const DECLINE_REASONS = [
  "Accepted another offer",
  "Compensation",
  "Role or scope mismatch",
  "Personal circumstances",
  "Other",
] as const;
export type DeclineReason = typeof DECLINE_REASONS[number];

export type OfferState = {
  status: OfferStatus;
  declineReason: DeclineReason | null;
  markedAt: string | null;
};

const BLANK: OfferState = {
  status: "pending",
  declineReason: null,
  markedAt: null,
};

const store = new Map<string, OfferState>();

export function getOfferState(candidateId: string): OfferState {
  const stored = store.get(candidateId);
  return stored ? { ...stored } : { ...BLANK };
}

export function markAccepted(candidateId: string): void {
  store.set(candidateId, {
    status: "accepted",
    declineReason: null,
    markedAt: new Date().toISOString(),
  });
}

export function markDeclined(candidateId: string, reason: DeclineReason): void {
  store.set(candidateId, {
    status: "declined",
    declineReason: reason,
    markedAt: new Date().toISOString(),
  });
}

export function __resetOfferStore(): void {
  store.clear();
}
