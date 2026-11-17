// Crayon stickers rasterized from the design canvas (Sticker.dc.html). Generated file.
/* eslint-disable @typescript-eslint/no-require-imports */

export const STICKER_ART = {
  again: require("../../assets/stickers/again.webp"),
  anemone: require("../../assets/stickers/anemone.webp"),
  bcd: require("../../assets/stickers/bcd.webp"),
  best: require("../../assets/stickers/best.webp"),
  boat: require("../../assets/stickers/boat.webp"),
  brain: require("../../assets/stickers/brain.webp"),
  branch: require("../../assets/stickers/branch.webp"),
  bubbles: require("../../assets/stickers/bubbles.webp"),
  buoy: require("../../assets/stickers/buoy.webp"),
  cave: require("../../assets/stickers/cave.webp"),
  cloud: require("../../assets/stickers/cloud.webp"),
  computer: require("../../assets/stickers/computer.webp"),
  diver: require("../../assets/stickers/diver.webp"),
  fins: require("../../assets/stickers/fins.webp"),
  first: require("../../assets/stickers/first.webp"),
  flag: require("../../assets/stickers/flag.webp"),
  freediver: require("../../assets/stickers/freediver.webp"),
  heart: require("../../assets/stickers/heart.webp"),
  hearthands: require("../../assets/stickers/hearthands.webp"),
  island: require("../../assets/stickers/island.webp"),
  jelly: require("../../assets/stickers/jelly.webp"),
  logtape: require("../../assets/stickers/logtape.webp"),
  mask: require("../../assets/stickers/mask.webp"),
  moon: require("../../assets/stickers/moon.webp"),
  night: require("../../assets/stickers/night.webp"),
  ok: require("../../assets/stickers/ok.webp"),
  rain: require("../../assets/stickers/rain.webp"),
  rays: require("../../assets/stickers/rays.webp"),
  regulator: require("../../assets/stickers/regulator.webp"),
  rock: require("../../assets/stickers/rock.webp"),
  school: require("../../assets/stickers/school.webp"),
  seafan: require("../../assets/stickers/seafan.webp"),
  seaweed: require("../../assets/stickers/seaweed.webp"),
  shell: require("../../assets/stickers/shell.webp"),
  smb: require("../../assets/stickers/smb.webp"),
  snorkel: require("../../assets/stickers/snorkel.webp"),
  sparkle: require("../../assets/stickers/sparkle.webp"),
  starfish: require("../../assets/stickers/starfish.webp"),
  sun: require("../../assets/stickers/sun.webp"),
  table: require("../../assets/stickers/table.webp"),
  tank: require("../../assets/stickers/tank.webp"),
  up: require("../../assets/stickers/up.webp"),
  wow: require("../../assets/stickers/wow.webp"),
  wreck: require("../../assets/stickers/wreck.webp"),
} as const;

export type StickerKind = keyof typeof STICKER_ART;

export const STICKER_NAMES: Record<StickerKind, string> = {
  "again": "또 오자",
  "anemone": "말미잘",
  "bcd": "부력조절기",
  "best": "최고!",
  "boat": "다이빙 보트",
  "brain": "뇌 산호",
  "branch": "가지 산호",
  "bubbles": "공기방울",
  "buoy": "부이",
  "cave": "동굴",
  "cloud": "구름",
  "computer": "다이브 컴퓨터",
  "diver": "스쿠버 다이버",
  "fins": "오리발",
  "first": "첫 만남 도장",
  "flag": "다이브 깃발",
  "freediver": "프리다이버",
  "heart": "하트",
  "hearthands": "하트 손",
  "island": "섬",
  "jelly": "해파리",
  "logtape": "로그 번호 테이프",
  "mask": "마스크",
  "moon": "달과 별",
  "night": "나이트 다이빙",
  "ok": "OK 수신호",
  "rain": "비",
  "rays": "빛줄기",
  "regulator": "호흡기",
  "rock": "바위",
  "school": "물고기 떼",
  "seafan": "부채 산호",
  "seaweed": "해초",
  "shell": "조개",
  "smb": "SMB",
  "snorkel": "스노클",
  "sparkle": "반짝",
  "starfish": "불가사리",
  "sun": "해",
  "table": "테이블 산호",
  "tank": "공기탱크",
  "up": "상승 신호",
  "wow": "우와!",
  "wreck": "난파선"
};

export const STICKER_CATEGORIES: { key: string; label: string; items: StickerKind[] }[] = [
  {
    "key": "gear",
    "label": "다이빙 장비",
    "items": [
      "mask",
      "snorkel",
      "fins",
      "tank",
      "regulator",
      "bcd",
      "computer",
      "smb"
    ]
  },
  {
    "key": "diver",
    "label": "다이버 · 수신호",
    "items": [
      "diver",
      "freediver",
      "ok",
      "up",
      "hearthands",
      "bubbles"
    ]
  },
  {
    "key": "reef",
    "label": "산호 · 바다 친구",
    "items": [
      "branch",
      "table",
      "brain",
      "seafan",
      "anemone",
      "seaweed",
      "starfish",
      "shell"
    ]
  },
  {
    "key": "scene",
    "label": "바다 풍경",
    "items": [
      "cave",
      "wreck",
      "school",
      "jelly",
      "rays",
      "rock"
    ]
  },
  {
    "key": "surface",
    "label": "수면 · 날씨",
    "items": [
      "boat",
      "flag",
      "buoy",
      "island",
      "sun",
      "cloud",
      "rain",
      "moon"
    ]
  },
  {
    "key": "stamp",
    "label": "말풍선 · 도장",
    "items": [
      "wow",
      "best",
      "again",
      "heart",
      "sparkle",
      "first",
      "logtape",
      "night"
    ]
  }
];
