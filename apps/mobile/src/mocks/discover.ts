// Mock media + AI results for the 발견 flow. Phase 5 replaces this with the device photo library,
// the existing upload pipeline and identification-jobs API.
import type { CritterKind } from "../data/illustrations";

export type MockMedia = {
  id: string;
  bg: string;
  kind: CritterKind;
  w: number;
  h: number;
  x: number;
  y: number;
  /** Video duration label; undefined for photos */
  dur?: string;
};

export type MediaGroup = { id: string; title: string; diveLabel: string; items: MockMedia[] };

export const MOCK_MEDIA_GROUPS: MediaGroup[] = [
  {
    id: "d38",
    title: "11월 2일 (월) · 말라파스쿠아 모나드 숄",
    diveLabel: "다이빙 #38",
    items: [
      { id: "a1", bg: "#1B4F86", kind: "thresher", w: 120, h: 60, x: 4, y: 34, dur: "0:32" },
      { id: "a2", bg: "#16467A", kind: "thresher", w: 124, h: 62, x: 2, y: 30 },
      { id: "a3", bg: "#20578F", kind: "trevally", w: 100, h: 50, x: 14, y: 40 },
      { id: "a4", bg: "#123C6B", kind: "thresher", w: 110, h: 55, x: 8, y: 38, dur: "0:18" },
      { id: "a5", bg: "#1D5089", kind: "barracuda", w: 120, h: 40, x: 4, y: 46 },
      { id: "a6", bg: "#174878", kind: "puffer", w: 80, h: 48, x: 24, y: 40 },
    ],
  },
  {
    id: "d37",
    title: "11월 1일 (일) · 말라파스쿠아 라이트하우스",
    diveLabel: "다이빙 #37",
    items: [
      { id: "b1", bg: "#0F2F57", kind: "mandarin", w: 96, h: 60, x: 16, y: 36 },
      { id: "b2", bg: "#143A66", kind: "lionfish", w: 96, h: 64, x: 16, y: 32, dur: "0:12" },
      { id: "b3", bg: "#11335C", kind: "moray", w: 108, h: 48, x: 10, y: 42 },
    ],
  },
];

export type MockCandidate = { no: string; kind: CritterKind; pct: number; note: string; isNewForMe: boolean };

export const MOCK_RESULT = {
  context: "11월 2일 06:12 · 말라파스쿠아 모나드 숄 · 수심 24m",
  appearance: { from: "0:14", to: "0:26", total: "0:32", startPct: 44, widthPct: 37 },
  candidates: [
    { no: "007", kind: "thresher", pct: 96, note: "도감에 없는 친구예요 · 첫 만남이 돼요", isNewForMe: true },
    { no: "006", kind: "whitetip", pct: 21, note: "꼬리 윗부분이 몸통만큼 길다면 환도상어예요", isNewForMe: false },
  ] as MockCandidate[],
  saved: { date: "2026.11.02", point: "모나드 숄", depth: "24m" },
};

export const ANALYSIS_STEPS = ["장면 나누기 · 프레임 48장", "생물 찾기 · 꼬리가 아주 긴 상어를 발견했어요!", "도감 후보와 비교하기"];
