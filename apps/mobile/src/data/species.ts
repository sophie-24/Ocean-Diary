import catalog from "../../../../data/species/species-v3.json";
import { isCritterKind, type CritterKind } from "./illustrations";

type RawSpecies = (typeof catalog.species)[number];

export type SpeciesEntry = {
  /** Catalog number, zero-padded ("001") */
  no: string;
  group: string;
  subgroup: string;
  nameKo: string;
  nameEn: string;
  sciName: string;
  /** Illustration key when artwork is ready, otherwise null */
  art: CritterKind | null;
};

const toEntry = (s: RawSpecies): SpeciesEntry => ({
  no: s.no,
  group: s.group,
  subgroup: s.subgroup,
  nameKo: s.name_ko,
  nameEn: s.name_en,
  sciName: s.sci_name,
  art: s.art === "Y" && isCritterKind(s.art_key) ? s.art_key : null,
});

export const SPECIES: SpeciesEntry[] = catalog.species.map(toEntry);

export const SPECIES_BY_NO: Record<string, SpeciesEntry> = Object.fromEntries(SPECIES.map((s) => [s.no, s]));

/** Group order follows the catalog (상어 → 가오리 → 물고기 …). */
export const SPECIES_GROUPS: string[] = Array.from(new Set(SPECIES.map((s) => s.group)));

export const TOTAL_SPECIES = SPECIES.length;
