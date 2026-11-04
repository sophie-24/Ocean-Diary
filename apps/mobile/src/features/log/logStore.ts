import type { CritterKind } from "../../data/illustrations";
import type { StickerKind } from "../../data/stickers";

/** A sticker placed on the picture-diary drawing area (coordinates in the 338×218 drawing space). */
export type PlacedSticker =
  | { id: string; type: "sticker"; kind: StickerKind; x: number; y: number; scale: number; rot: number }
  | { id: string; type: "critter"; kind: CritterKind; x: number; y: number; scale: number; rot: number; flip?: boolean };

export type LogKind = "scuba" | "free" | "snorkel";

/** UI shape of a dive log (adapted from the API by `toUiLog` in src/api/queries.ts). Matches the `dive_logs` table: three required fields + per-kind optional details. */
export type DiveLog = {
  id: string;
  kind: LogKind;
  /** Sequential label from the server: #39 for scuba, F13 for free, S7 for snorkel */
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
  layout?: PlacedSticker[];
  details: Record<string, string | number | boolean | string[]>;
};

export const KIND_LABEL: Record<LogKind, string> = { scuba: "스쿠버", free: "프리다이빙", snorkel: "스노클링" };

export const nextLabel = (kind: LogKind, counts?: Partial<Record<LogKind, number>>) => {
  const n = (counts?.[kind] ?? 0) + 1;
  return kind === "scuba" ? `#${n}` : kind === "free" ? `F${n}` : `S${n}`;
};

/** Totals for the logbook header, computed from loaded logs. */
export function logStats(logs: DiveLog[]) {
  const scuba = logs.filter((l) => l.kind === "scuba");
  const minutes = scuba.reduce((sum, l) => sum + (Number(l.details.bottom) || 0), 0);
  const depths = logs.map((l) => Number(l.details.maxDepth ?? l.details.bestDepth) || 0);
  const max = Math.max(0, ...depths);
  return {
    time: minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : "—",
    maxDepth: max ? `${max}m` : "—",
  };
}
