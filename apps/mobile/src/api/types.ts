// Server response shapes (docs/api-contract-v1.md, docs/api-contract-v2.md).

export type ApiSpecies = {
  id: string;
  slug: string;
  common_name_ko: string;
  scientific_name: string;
  description_ko: string;
  catalog_no: string | null;
  group_ko: string | null;
  subgroup_ko: string | null;
  common_name_en: string | null;
  art_key: string | null;
};

export type ApiCollection = {
  items: { species: ApiSpecies; discovery_count: number; first_seen_at: string; latest_seen_at: string }[];
  unidentified_count: number;
  total_species: number;
};

export type ApiLogKind = "scuba" | "free" | "snorkel";

export type ApiSite = {
  id: string;
  catalog_no: string;
  category_ko: string;
  name_ko: string;
  name_en: string;
  country_ko: string;
  region_ko: string;
  note_ko: string;
  depth_label: string | null;
  level_label: string | null;
  art_key: string;
};

export type ApiLoggedSpecies = { species_id: string; catalog_no: string | null; common_name_ko: string; art_key: string | null };

export type ApiStickerItem = {
  id: string;
  type: "sticker" | "critter";
  kind: string;
  x: number;
  y: number;
  scale: number;
  rot: number;
  flip?: boolean;
};

export type ApiDiveLog = {
  id: string;
  kind: ApiLogKind;
  seq: number;
  label: string;
  dive_date: string;
  region_label: string;
  point_label: string;
  title: string | null;
  details: Record<string, unknown>;
  diary_text: string | null;
  sticker_layout: ApiStickerItem[] | null;
  is_draft: boolean;
  site: ApiSite | null;
  species: ApiLoggedSpecies[];
  created_at: string;
  updated_at: string;
};

export type ApiDiveLogList = { items: ApiDiveLog[]; next_cursor: string | null; counts: Record<ApiLogKind, number> };

export type ApiSiteStamp = { site: ApiSite; stamped_on: string; dive_log_id: string | null };

export type ApiPlace = {
  region_label: string;
  first_date: string;
  last_date: string;
  log_count: number;
  point_labels: string[];
  species: ApiLoggedSpecies[];
  stamp_count: number;
};

export type ApiSummary = {
  collected_species: number;
  total_species: number;
  encounter_count: number;
  log_counts: Record<ApiLogKind, number>;
  stamp_count: number;
  total_sites: number;
  visited_regions: number;
};

export type ApiDiveLogCreate = {
  kind: ApiLogKind;
  dive_date: string;
  region_label: string;
  point_label: string;
  title?: string | null;
  details?: Record<string, unknown>;
  site_id?: string | null;
  is_draft?: boolean;
};

export type ApiDiveLogPatch = Partial<Omit<ApiDiveLogCreate, "kind">> & {
  diary_text?: string | null;
  sticker_layout?: ApiStickerItem[] | null;
};
