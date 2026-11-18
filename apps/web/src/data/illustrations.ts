/**
 * Mirrors apps/mobile/src/data/illustrations.ts.
 *
 * Native uses `require(".../assets/illustrations/species/*.webp")` so Metro
 * bundles them. On web we load from /public — the actual .webp files are
 * copied in from the mobile assets folder (see scripts/sync-illustrations.sh
 * if we ever automate that). Keep this type aligned with the native file so
 * the shared `destinations.ts` species keys stay valid on both platforms.
 */

export const SPECIES_ART = {
  barracuda: "/illustrations/species/barracuda.webp",
  blacktip: "/illustrations/species/blacktip.webp",
  boxercrab: "/illustrations/species/boxercrab.webp",
  boxfish: "/illustrations/species/boxfish.webp",
  epaulette: "/illustrations/species/epaulette.webp",
  ghostpipe: "/illustrations/species/ghostpipe.webp",
  greatwhite: "/illustrations/species/greatwhite.webp",
  grouper: "/illustrations/species/grouper.webp",
  hammerhead: "/illustrations/species/hammerhead.webp",
  harlequin: "/illustrations/species/harlequin.webp",
  lionfish: "/illustrations/species/lionfish.webp",
  mandarin: "/illustrations/species/mandarin.webp",
  mantis: "/illustrations/species/mantis.webp",
  moray: "/illustrations/species/moray.webp",
  napoleon: "/illustrations/species/napoleon.webp",
  nurse: "/illustrations/species/nurse.webp",
  oceanic: "/illustrations/species/oceanic.webp",
  pikachu: "/illustrations/species/pikachu.webp",
  portjackson: "/illustrations/species/portjackson.webp",
  puffer: "/illustrations/species/puffer.webp",
  pygmy: "/illustrations/species/pygmy.webp",
  pyjama: "/illustrations/species/pyjama.webp",
  sandtiger: "/illustrations/species/sandtiger.webp",
  seabunny: "/illustrations/species/seabunny.webp",
  silvertip: "/illustrations/species/silvertip.webp",
  tawny: "/illustrations/species/tawny.webp",
  thresher: "/illustrations/species/thresher.webp",
  tiger: "/illustrations/species/tiger.webp",
  trevally: "/illustrations/species/trevally.webp",
  whale: "/illustrations/species/whale.webp",
  whitetip: "/illustrations/species/whitetip.webp",
  zebra: "/illustrations/species/zebra.webp",
} as const;

export type CritterKind = keyof typeof SPECIES_ART;

export const SITE_ART = {
  bluehole: "/illustrations/sites/bluehole.webp",
  cenote: "/illustrations/sites/cenote.webp",
  ferry: "/illustrations/sites/ferry.webp",
  landing: "/illustrations/sites/landing.webp",
  ruins: "/illustrations/sites/ruins.webp",
  shrine: "/illustrations/sites/shrine.webp",
  statue: "/illustrations/sites/statue.webp",
  tunnel: "/illustrations/sites/tunnel.webp",
} as const;

export type SiteArtKey = keyof typeof SITE_ART;

/** Nicely formatted Korean name for each species. Used in captions. */
export const SPECIES_LABEL: Record<CritterKind, string> = {
  barracuda: "바라쿠다",
  blacktip: "블랙팁 리프 샤크",
  boxercrab: "복서 크랩",
  boxfish: "박스피쉬",
  epaulette: "에폴렛 샤크",
  ghostpipe: "고스트 파이프피쉬",
  greatwhite: "백상아리",
  grouper: "그루퍼",
  hammerhead: "귀상어",
  harlequin: "할리퀸 쉬림프",
  lionfish: "라이온피쉬",
  mandarin: "만다린 피쉬",
  mantis: "맨티스 쉬림프",
  moray: "모레이 일",
  napoleon: "나폴레옹 라스",
  nurse: "너스 샤크",
  oceanic: "오셔닉 화이트팁",
  pikachu: "피카츄 갯민숭달팽이",
  portjackson: "포트 잭슨 샤크",
  puffer: "복어",
  pygmy: "피그미 해마",
  pyjama: "파자마 샤크",
  sandtiger: "샌드 타이거 샤크",
  seabunny: "씨바니",
  silvertip: "실버팁 샤크",
  tawny: "토니 너스 샤크",
  thresher: "환도상어",
  tiger: "타이거 샤크",
  trevally: "자이언트 트레발리",
  whale: "고래상어",
  whitetip: "화이트팁 리프 샤크",
  zebra: "제브라 샤크",
};
