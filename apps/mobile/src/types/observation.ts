import type { Species } from "./species";

export type ObservationCard = {
  id: string;
  species_id: string | null;
  identified_by: "ai_confirmed" | "user_selected" | "unidentified";
  observed_at: string;
  region_label: string | null;
  photo_url: string;
  species: Species | null;
};

export type ObservationFilter = "all" | "unidentified";

export type ObservationSummary = {
  discovery_count: number;
  is_new_species_for_user: boolean;
};
