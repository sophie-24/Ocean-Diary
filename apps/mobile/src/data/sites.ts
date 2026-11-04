import data from "../../../../data/sites/sites-v1.json";
import { SITE_ART, type SiteArtKey } from "./illustrations";

export type SiteEntry = {
  no: string;
  category: string;
  nameKo: string;
  nameEn: string;
  country: string;
  region: string;
  note: string;
  depth: string;
  level: string;
  art: SiteArtKey;
  /** Placeholder until stamps come from the API (phase 4). */
  collectedOn: string | null;
};

const isSiteArt = (v: string): v is SiteArtKey => Object.prototype.hasOwnProperty.call(SITE_ART, v);

export const SITES: SiteEntry[] = data.sites.map((s) => ({
  no: s.no,
  category: s.category,
  nameKo: s.name_ko,
  nameEn: s.name_en,
  country: s.country,
  region: s.region,
  note: s.note,
  depth: s.depth_m,
  level: s.level,
  art: isSiteArt(s.art_key) ? s.art_key : "ferry",
  collectedOn: s.collected === "Y" ? s.collected_date : null,
}));

export const SITE_CATEGORIES: string[] = Array.from(new Set(SITES.map((s) => s.category)));
