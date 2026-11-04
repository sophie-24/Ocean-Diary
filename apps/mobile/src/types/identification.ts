import type { Species } from "./species";

export type IdentificationCandidate = {
  rank: number;
  confidence_band: "high" | "medium" | "low";
  species: Species;
};

export type IdentificationStatus = "idle" | "queued" | "running" | "succeeded" | "failed" | "timed_out";

export type SelectionSource = "ai_confirmed" | "user_selected" | "unidentified";
