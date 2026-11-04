// Generated from assets/illustrations. Keep keys in sync with data/species/species-v3.json art_key.
/* eslint-disable @typescript-eslint/no-require-imports */

export const SPECIES_ART = {
  barracuda: require("../../assets/illustrations/species/barracuda.webp"),
  blacktip: require("../../assets/illustrations/species/blacktip.webp"),
  boxercrab: require("../../assets/illustrations/species/boxercrab.webp"),
  boxfish: require("../../assets/illustrations/species/boxfish.webp"),
  epaulette: require("../../assets/illustrations/species/epaulette.webp"),
  ghostpipe: require("../../assets/illustrations/species/ghostpipe.webp"),
  greatwhite: require("../../assets/illustrations/species/greatwhite.webp"),
  grouper: require("../../assets/illustrations/species/grouper.webp"),
  hammerhead: require("../../assets/illustrations/species/hammerhead.webp"),
  harlequin: require("../../assets/illustrations/species/harlequin.webp"),
  lionfish: require("../../assets/illustrations/species/lionfish.webp"),
  mandarin: require("../../assets/illustrations/species/mandarin.webp"),
  mantis: require("../../assets/illustrations/species/mantis.webp"),
  moray: require("../../assets/illustrations/species/moray.webp"),
  napoleon: require("../../assets/illustrations/species/napoleon.webp"),
  nurse: require("../../assets/illustrations/species/nurse.webp"),
  oceanic: require("../../assets/illustrations/species/oceanic.webp"),
  pikachu: require("../../assets/illustrations/species/pikachu.webp"),
  portjackson: require("../../assets/illustrations/species/portjackson.webp"),
  puffer: require("../../assets/illustrations/species/puffer.webp"),
  pygmy: require("../../assets/illustrations/species/pygmy.webp"),
  pyjama: require("../../assets/illustrations/species/pyjama.webp"),
  sandtiger: require("../../assets/illustrations/species/sandtiger.webp"),
  seabunny: require("../../assets/illustrations/species/seabunny.webp"),
  silvertip: require("../../assets/illustrations/species/silvertip.webp"),
  tawny: require("../../assets/illustrations/species/tawny.webp"),
  thresher: require("../../assets/illustrations/species/thresher.webp"),
  tiger: require("../../assets/illustrations/species/tiger.webp"),
  trevally: require("../../assets/illustrations/species/trevally.webp"),
  whale: require("../../assets/illustrations/species/whale.webp"),
  whitetip: require("../../assets/illustrations/species/whitetip.webp"),
  zebra: require("../../assets/illustrations/species/zebra.webp"),
} as const;

export type CritterKind = keyof typeof SPECIES_ART;

export const SITE_ART = {
  bluehole: require("../../assets/illustrations/sites/bluehole.webp"),
  cenote: require("../../assets/illustrations/sites/cenote.webp"),
  ferry: require("../../assets/illustrations/sites/ferry.webp"),
  landing: require("../../assets/illustrations/sites/landing.webp"),
  ruins: require("../../assets/illustrations/sites/ruins.webp"),
  shrine: require("../../assets/illustrations/sites/shrine.webp"),
  statue: require("../../assets/illustrations/sites/statue.webp"),
  tunnel: require("../../assets/illustrations/sites/tunnel.webp"),
} as const;

export type SiteArtKey = keyof typeof SITE_ART;

export const isCritterKind = (value: string | null | undefined): value is CritterKind =>
  !!value && Object.prototype.hasOwnProperty.call(SPECIES_ART, value);
