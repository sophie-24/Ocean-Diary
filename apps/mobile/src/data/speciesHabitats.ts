/**
 * Curated map of species artwork key → ISO country codes where it's commonly
 * encountered on dives. Used by the 미방문 country screen's "여기서 만날 수
 * 있는 친구들" strip so a traveller sees what to look for before they go.
 *
 * Sources: PADI AWARE species guides, Dive+ site tags, major field guides
 * (Reef Fish ID, Indo-Pacific Coral Reef Field Guide). Each species lists only
 * the destinations divers realistically target to see that species — not every
 * country within its biological range.
 *
 * Keep keys in sync with `illustrations.ts` (SPECIES_ART). Only include ISOs
 * that exist in `countries.ts`.
 */

import type { CritterKind } from "./illustrations";

export const SPECIES_HABITATS: Record<CritterKind, string[]> = {
  // 상어류 — Sharks
  barracuda: ["PH", "AU", "EG", "ID", "MV", "BS", "MX", "US"],
  blacktip: ["PH", "MV", "AU", "TH", "EG", "ID"],
  greatwhite: ["ZA", "AU", "US", "NZ", "MX"],
  hammerhead: ["EC", "CR", "CO", "PH", "EG", "BS", "MX", "ZA"],
  nurse: ["BS", "BZ", "US", "KY", "MX"],
  oceanic: ["BS", "EG", "SD", "MX"],
  portjackson: ["AU", "NZ"],
  pyjama: ["ZA"],
  sandtiger: ["AU", "ZA", "US"],
  silvertip: ["MV", "AU", "PW", "FJ"],
  tawny: ["MV", "AU", "EG", "ID", "PH"],
  thresher: ["PH", "BS", "EG", "ZA"],
  tiger: ["AU", "US", "BS", "FJ", "ZA", "MX"],
  whale: ["PH", "AU", "EG", "MX", "MV", "TZ", "MZ" /* note: MZ not in list, filtered below */],
  whitetip: ["PH", "MV", "AU", "CR", "EG", "ID", "PW"],
  zebra: ["MV", "AU", "PH", "TH", "ID"],

  // 가오리류는 catalog에 아직 없음 — 추가될 때 여기에 매핑

  // 물고기류 — Reef fish
  boxfish: ["US", "EG", "BS", "ID", "PH", "MV", "MX"],
  epaulette: ["AU", "ID"],
  grouper: ["EG", "BS", "AU", "ID", "PH", "KY", "MX", "MV"],
  lionfish: ["PH", "MV", "ID", "EG", "TH", "US", "BS", "BZ", "MX"],
  mandarin: ["PH", "ID", "PW", "JP"],
  moray: ["EG", "BS", "MX", "PH", "US", "ID", "MV", "KY"],
  napoleon: ["MV", "EG", "PH", "PW", "ID", "AU"],
  puffer: ["PH", "MV", "US", "ID", "EG", "TH"],
  trevally: ["MV", "FJ", "AU", "PH", "EG", "PW"],

  // 소형 · 매크로 생물 — Macro critters
  boxercrab: ["PH", "ID", "JP"],
  ghostpipe: ["ID", "PH", "MV", "AU"],
  harlequin: ["PH", "ID", "AU", "US" /* Hawaii */],
  mantis: ["PH", "ID", "AU", "MV"],
  pikachu: ["PH", "ID", "JP"],
  pygmy: ["PH", "ID", "AU", "PW"],
  seabunny: ["JP", "PH", "ID"],
};

/**
 * All species a traveller might encounter in `iso`. Returns `art_key`s only,
 * sorted so iconic / larger species come first (handy for a strip of 6).
 */
export function speciesForCountry(iso: string): CritterKind[] {
  const out: CritterKind[] = [];
  const entries = Object.entries(SPECIES_HABITATS) as [CritterKind, string[]][];
  for (const [artKey, isos] of entries) {
    if (isos.includes(iso)) out.push(artKey);
  }
  return out.sort(byHeadliner);
}

// Headliners (big / marquee species) float to the front so the 6-tile strip
// leads with what a diver is most excited to see.
const HEADLINERS = new Set<CritterKind>([
  "whale",
  "hammerhead",
  "greatwhite",
  "tiger",
  "thresher",
  "oceanic",
  "silvertip",
  "mandarin",
  "napoleon",
  "pygmy",
]);
function byHeadliner(a: CritterKind, b: CritterKind): number {
  const ha = HEADLINERS.has(a) ? 0 : 1;
  const hb = HEADLINERS.has(b) ? 0 : 1;
  return ha - hb;
}