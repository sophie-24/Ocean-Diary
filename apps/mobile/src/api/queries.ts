import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isCritterKind, type CritterKind } from "../data/illustrations";
import type { DiveLog, LogKind, PlacedSticker } from "../features/log/logStore";
import { api, newIdempotencyKey } from "./client";
import type {
  ApiCollection,
  ApiDiveLog,
  ApiDiveLogCreate,
  ApiDiveLogList,
  ApiDiveLogPatch,
  ApiPlace,
  ApiSite,
  ApiSiteStamp,
  ApiSummary,
} from "./types";

export const keys = {
  logs: ["dive-logs"] as const,
  log: (id: string) => ["dive-logs", id] as const,
  collection: ["collection"] as const,
  summary: ["summary"] as const,
  stamps: ["site-stamps"] as const,
  sites: ["dive-sites"] as const,
  places: ["places"] as const,
};

// ---------- adapters (server → UI) ----------

const COVER_BG: Record<LogKind, string> = { scuba: "#1B4F86", free: "#2A6FB8", snorkel: "#3C8AD0" };
const DEFAULT_COVER: Record<LogKind, CritterKind> = { scuba: "whitetip", free: "puffer", snorkel: "boxfish" };

const str = (v: unknown) => (v === undefined || v === null || v === "" ? null : String(v));

export function logSummary(kind: LogKind, d: Record<string, unknown>): string {
  const parts =
    kind === "scuba"
      ? [str(d.maxDepth) && `최대 ${d.maxDepth}m`, str(d.bottom) && `${d.bottom}분`, str(d.waterTemp) && `${d.waterTemp}°C`]
      : kind === "free"
        ? [str(d.bestDepth) && `최고 ${d.bestDepth}m`, str(d.dives) && `${d.dives}회`, str(d.longest) && `최장 ${d.longest}`]
        : [str(d.when), str(d.waterClarity) && `시야 ${d.waterClarity === "맑음" ? "좋음" : d.waterClarity}`];
  return parts.filter(Boolean).join(" · ") || "기록 저장됨";
}

export function toUiLog(log: ApiDiveLog): DiveLog {
  const layout = (log.sticker_layout ?? []).filter(
    (it) => it.type === "sticker" || isCritterKind(it.kind),
  ) as PlacedSticker[];
  const critters = Array.from(
    new Set([
      ...log.species.map((s) => s.art_key).filter((k): k is CritterKind => isCritterKind(k)),
      ...layout.filter((it) => it.type === "critter").map((it) => it.kind as CritterKind),
    ]),
  );
  return {
    id: log.id,
    kind: log.kind,
    label: log.label,
    date: log.dive_date,
    region: log.region_label,
    point: log.point_label,
    title: log.title ?? (log.diary_text?.trim().split("\n")[0].slice(0, 20) || `${log.point_label}에서`),
    summary: logSummary(log.kind, log.details),
    coverKind: critters[0] ?? DEFAULT_COVER[log.kind],
    coverBg: COVER_BG[log.kind],
    stickers: critters.slice(0, 3),
    extraStickers: Math.max(0, critters.length - 3),
    draft: log.is_draft,
    diary: log.diary_text ?? undefined,
    layout,
    details: log.details as DiveLog["details"],
  };
}

export type CollectionMark = { no: string; speciesId: string; count: number; firstSeen: string; latestSeen: string; isNew: boolean };

const NEW_WINDOW_MS = 3 * 24 * 3600 * 1000;

export function toCollection(c: ApiCollection): Map<string, CollectionMark> {
  const now = Date.now();
  const map = new Map<string, CollectionMark>();
  for (const item of c.items) {
    const no = item.species.catalog_no;
    if (!no) continue;
    map.set(no, {
      no,
      speciesId: item.species.id,
      count: item.discovery_count,
      firstSeen: item.first_seen_at.slice(0, 10),
      latestSeen: item.latest_seen_at.slice(0, 10),
      isNew: now - new Date(item.first_seen_at).getTime() < NEW_WINDOW_MS,
    });
  }
  return map;
}

// ---------- queries ----------

export function useDiveLogs() {
  return useQuery({
    queryKey: keys.logs,
    queryFn: () => api<ApiDiveLogList>("/v1/dive-logs?limit=50"),
    select: (data) => ({ logs: data.items.map(toUiLog), counts: data.counts, nextCursor: data.next_cursor }),
  });
}

export function useDiveLog(id: string) {
  return useQuery({
    queryKey: keys.log(id),
    queryFn: () => api<ApiDiveLog>(`/v1/dive-logs/${id}`),
    select: toUiLog,
    enabled: !!id,
  });
}

export type Encounter = { id: string; observedAt: string; region: string | null; diveLogId: string | null };

export function useSpeciesEncounters(speciesId: string | undefined) {
  return useQuery({
    queryKey: ["observations", "species", speciesId],
    queryFn: () =>
      api<{ items: { id: string; observed_at: string; region_label: string | null; dive_log_id: string | null }[] }>(
        `/v1/observations?limit=50&species_id=${speciesId}`,
      ),
    enabled: !!speciesId,
    select: (d): Encounter[] =>
      d.items
        .map((o) => ({ id: o.id, observedAt: o.observed_at, region: o.region_label, diveLogId: o.dive_log_id }))
        .sort((a, b) => a.observedAt.localeCompare(b.observedAt)),
  });
}

export function useCollection() {
  return useQuery({ queryKey: keys.collection, queryFn: () => api<ApiCollection>("/v1/collection"), select: toCollection });
}

export function useSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: () => api<ApiSummary>("/v1/me/summary") });
}

export function useSiteStamps() {
  return useQuery({
    queryKey: keys.stamps,
    queryFn: () => api<ApiSiteStamp[]>("/v1/site-stamps"),
    select: (rows) => new Map(rows.map((r) => [r.site.catalog_no, r.stamped_on])),
  });
}

export function useDiveSites() {
  return useQuery({ queryKey: keys.sites, queryFn: () => api<ApiSite[]>("/v1/dive-sites", { auth: false }), staleTime: 24 * 3600 * 1000 });
}

export function usePlaces() {
  return useQuery({ queryKey: keys.places, queryFn: () => api<ApiPlace[]>("/v1/places") });
}

// ---------- mutations ----------

function useInvalidateLogbook() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: keys.logs });
    void qc.invalidateQueries({ queryKey: keys.summary });
    void qc.invalidateQueries({ queryKey: keys.places });
    void qc.invalidateQueries({ queryKey: keys.stamps });
  };
}

export function useCreateDiveLog() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    // The key is generated once per form submission (see LogFormScreen) so retries reuse it.
    mutationFn: ({ body, key }: { body: ApiDiveLogCreate; key: string }) =>
      api<ApiDiveLog>("/v1/dive-logs", { method: "POST", body, idempotencyKey: key }),
    onSuccess: invalidate,
  });
}

export function useUpdateDiveLog() {
  const qc = useQueryClient();
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ApiDiveLogPatch }) =>
      api<ApiDiveLog>(`/v1/dive-logs/${id}`, { method: "PATCH", body: patch }),
    onSuccess: (log) => {
      qc.setQueryData(keys.log(log.id), log);
      invalidate();
    },
  });
}

export function useDeleteDiveLog() {
  const invalidate = useInvalidateLogbook();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/v1/dive-logs/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export { newIdempotencyKey };
