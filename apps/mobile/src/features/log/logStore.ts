import { useSyncExternalStore } from "react";
import type { CritterKind } from "../../data/illustrations";

export type LogKind = "scuba" | "free" | "snorkel";

/** Matches the planned `dive_logs` table: three required fields + per-kind optional details. */
export type DiveLog = {
  id: string;
  kind: LogKind;
  /** Sequential label: #39 for scuba, F13 for free, S7 for snorkel */
  label: string;
  date: string; // YYYY-MM-DD
  region: string;
  point: string;
  title: string;
  summary: string;
  coverKind: CritterKind;
  coverBg: string;
  stickers: CritterKind[];
  extraStickers: number;
  draft: boolean;
  diary?: string;
  details: Record<string, string | number | boolean | string[]>;
};

const SEED: DiveLog[] = [
  { id: "s6", kind: "snorkel", label: "S6", date: "2026-11-03", region: "말라파스쿠아", point: "바운티 비치", title: "보트 기다리며 둥둥", summary: "오후 · 시야 좋음 · 거북복 2", coverKind: "boxfish", coverBg: "#3C8AD0", stickers: [], extraStickers: 0, draft: false, details: {} },
  { id: "d38", kind: "scuba", label: "#38", date: "2026-11-02", region: "말라파스쿠아", point: "모나드 숄", title: "새벽 4시 반, 환도상어", summary: "최대 24.3m · 41분 · 26°C", coverKind: "thresher", coverBg: "#1B4F86", stickers: ["thresher", "trevally"], extraStickers: 0, draft: false, details: {} },
  { id: "f12", kind: "free", label: "F12", date: "2026-11-01", region: "말라파스쿠아", point: "바운티 비치", title: "바이핀으로 18m 찍은 날", summary: "최고 18.4m · 12회 · 최장 1:12", coverKind: "puffer", coverBg: "#2A6FB8", stickers: [], extraStickers: 0, draft: false, details: {} },
  { id: "d37", kind: "scuba", label: "#37", date: "2026-11-01", region: "말라파스쿠아", point: "라이트하우스", title: "만다린피쉬의 노을 춤", summary: "최대 7m · 48분 · 28°C", coverKind: "mandarin", coverBg: "#0F2F57", stickers: ["mandarin", "lionfish", "moray"], extraStickers: 0, draft: false, details: {} },
  { id: "d36", kind: "scuba", label: "#36", date: "2026-11-01", region: "말라파스쿠아", point: "가토 섬", title: "동굴 속 백기흉상어", summary: "최대 18m · 52분 · 28°C", coverKind: "whitetip", coverBg: "#1B4579", stickers: ["whitetip"], extraStickers: 2, draft: true, diary: "오늘은 가토 섬 동굴 다이빙! 입구가 생각보다 좁아서 살짝 긴장했는데 안에 들어가니까 백기흉상어 두 마리가 바닥에 누워서 쉬고 있었다.", details: { maxDepth: "18", bottom: "52", waterTemp: "28", buddy: "이하늘" } },
];

/** Totals for the canvas header (older logs are not in the mock list). */
export const MOCK_TOTALS = { scuba: 38, free: 12, snorkel: 6, scubaTime: "31h 20m", maxDepth: "29.4m" };

let logs: DiveLog[] = SEED;
let counts = { scuba: MOCK_TOTALS.scuba, free: MOCK_TOTALS.free, snorkel: MOCK_TOTALS.snorkel };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const nextLabel = (kind: LogKind) =>
  kind === "scuba" ? `#${counts.scuba + 1}` : kind === "free" ? `F${counts.free + 1}` : `S${counts.snorkel + 1}`;

export const logStore = {
  get: () => logs,
  counts: () => counts,
  find: (id: string) => logs.find((l) => l.id === id),
  add(log: Omit<DiveLog, "id" | "label">): DiveLog {
    const created: DiveLog = { ...log, id: `${log.kind}-${Date.now()}`, label: nextLabel(log.kind) };
    counts = { ...counts, [log.kind]: counts[log.kind] + 1 };
    logs = [created, ...logs];
    emit();
    return created;
  },
  update(id: string, patch: Partial<DiveLog>) {
    logs = logs.map((l) => (l.id === id ? { ...l, ...patch } : l));
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useLogs = () => useSyncExternalStore(logStore.subscribe, logStore.get, logStore.get);

export const KIND_LABEL: Record<LogKind, string> = { scuba: "스쿠버", free: "프리다이빙", snorkel: "스노클링" };
