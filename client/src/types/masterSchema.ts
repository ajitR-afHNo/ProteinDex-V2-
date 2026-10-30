export * from "./products";

export interface ComparisonSnapshot {
  id: string;
  variantIds: string[];
  createdAt: string;
  expiresAt: string;
}

export interface OutboundTokenPayload {
  offerId: string;
  expiresAt: number;
}
