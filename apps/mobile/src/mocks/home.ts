// Mock data for the 홈 tab until the API provides it (phase 4).
import type { CritterKind } from "../data/illustrations";

export const MOCK_PROFILE = { nickname: "규리", initial: "규", unreadNotifications: 1, totalEncounters: 64 };

export const MOCK_PENDING_UPLOAD = {
  place: "말라파스쿠아",
  photoCount: 37,
  dateLabel: "11월 1–2일",
  diveCount: 4,
  coverKind: "mandarin" as CritterKind,
};

/** "오늘의 바다 친구" — a species the diver has not met yet. */
export const MOCK_TODAY_FRIEND = {
  no: "001",
  dateLabel: "11월 3일",
  status: "아직 못 만났어요",
  iucn: "IUCN 위기(EN)",
  blurb: "세상에서 가장 큰 물고기예요. 커다란 입을 벌리고 헤엄치며 플랑크톤과 작은 물고기를 걸러 먹어요.",
  bestPlace: "필리핀 남레이테 · 소고드만",
  season: "11월 – 5월",
};

export type RecentEncounter = { no: string; kind: CritterKind; meta: string; firstTime: boolean; round?: number };

export const MOCK_RECENT: RecentEncounter[] = [
  { no: "007", kind: "thresher", meta: "어제 · 모나드 숄", firstTime: true },
  { no: "026", kind: "mandarin", meta: "2일 전 · 라이트하우스", firstTime: true },
  { no: "006", kind: "whitetip", meta: "2일 전 · 가토 섬", firstTime: false, round: 3 },
  { no: "027", kind: "lionfish", meta: "2일 전 · 라이트하우스", firstTime: false, round: 2 },
];

export const MOCK_QUESTS = {
  badgeCount: 5,
  region: { title: "아시아 탐험가", badge: "ASIA", body: "필리핀 해역에서", remaining: 3, current: 17, goal: 20 },
  regular: { no: "006", kind: "whitetip" as CritterKind, title: "백기흉상어 단골 친구", body: "같은 종을 5번 만나면 받아요", current: 3, goal: 5 },
};

export const MOCK_COMMUNITY = {
  user: "seaotter_min",
  initial: "민",
  place: "갈라파고스 다윈 아치",
  speciesName: "귀상어",
  kind: "hammerhead" as CritterKind,
  timeAgo: "2시간 전",
  inMyBook: false,
};
