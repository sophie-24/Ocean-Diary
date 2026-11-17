import { api, ApiError, newIdempotencyKey } from "./client";
import type { ApiSpecies } from "./types";

/** A photo picked from the device library for the 발견 flow. */
export type PickedPhoto = {
  id: string;
  uri: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  /** ISO timestamp from EXIF DateTimeOriginal, if the camera wrote one. */
  takenAt: string | null;
};

export type ClientConfig = {
  external_ai_processing: boolean;
  external_ai_provider: string | null;
  external_ai_consent_version: string | null;
};

export type Candidate = { rank: number; confidence_band: "high" | "medium" | "low"; species: ApiSpecies };
export type IdentificationJob = {
  job_id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  candidates: Candidate[];
  fallback_available: boolean;
  error_code: string | null;
};

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png"]);
const POLL_MS = 1500;
const POLL_LIMIT_MS = 90_000;

/** "2026:11:02 06:12:33" (EXIF, local time) → ISO string, or null. */
export function exifToIso(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Local calendar date (YYYY-MM-DD) of an ISO timestamp. */
export function localDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function getClientConfig() {
  return api<ClientConfig>("/v1/client-config", { auth: false });
}

/** Upload one photo through a presigned URL and wait until the server marks it ready. */
export async function uploadPhoto(photo: PickedPhoto, config: ClientConfig, intentKey: string): Promise<string> {
  const mime = photo.mimeType.toLowerCase();
  if (!ALLOWED.has(mime)) throw new ApiError(415, "UNSUPPORTED_MEDIA");

  let blob: Blob;
  try {
    blob = await (await fetch(photo.uri)).blob();
  } catch {
    throw new ApiError(0, "LOCAL_PHOTO_UNAVAILABLE");
  }
  if (blob.size <= 0 || blob.size > MAX_PHOTO_BYTES) throw new ApiError(413, "MEDIA_TOO_LARGE");

  const intent = await api<{ media_id: string; status: string; upload_url: string; method: string; required_headers: Record<string, string> }>(
    "/v1/media/upload-intents",
    {
      method: "POST",
      idempotencyKey: intentKey,
      body: {
        mime_type: mime,
        byte_size: blob.size,
        external_ai_consent_provider: config.external_ai_processing ? config.external_ai_provider : null,
        external_ai_consent_version: config.external_ai_processing ? config.external_ai_consent_version : null,
      },
    },
  );
  if (intent.status === "ready") return intent.media_id;

  let put: Response;
  try {
    put = await fetch(intent.upload_url, { method: intent.method || "PUT", headers: intent.required_headers, body: blob });
  } catch {
    throw new ApiError(0, "NETWORK_UNAVAILABLE");
  }
  if (!put.ok) throw new ApiError(put.status, "UPLOAD_FAILED");

  const done = await api<{ media_id: string; status: string }>(`/v1/media/${intent.media_id}/complete`, { method: "POST" });
  if (done.status !== "ready") throw new ApiError(409, "MEDIA_NOT_READY");
  return done.media_id;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Start (idempotently) an identification job and poll until it finishes. */
export async function identify(mediaId: string, key: string, isCancelled: () => boolean): Promise<IdentificationJob> {
  let job = await api<IdentificationJob>("/v1/identification-jobs", { method: "POST", idempotencyKey: key, body: { media_id: mediaId } });
  const started = Date.now();
  while (job.status === "queued" || job.status === "running") {
    if (isCancelled()) throw new ApiError(0, "CANCELLED");
    if (Date.now() - started > POLL_LIMIT_MS) throw new ApiError(0, "IDENTIFY_TIMEOUT");
    await sleep(POLL_MS);
    job = await api<IdentificationJob>(`/v1/identification-jobs/${job.job_id}`);
  }
  return job;
}

export type SaveResult = {
  observation: { id: string; dive_log_id: string | null };
  species_summary: { discovery_count: number; is_new_species_for_user: boolean } | null;
};

export function saveObservation(
  body: {
    media_id: string;
    species_id: string | null;
    identification_job_id: string | null;
    identified_by: "ai_confirmed" | "user_selected" | "unidentified";
    observed_at: string;
    region_label: string | null;
    dive_log_id: string | null;
  },
  key: string,
) {
  return api<SaveResult>("/v1/observations", { method: "POST", idempotencyKey: key, body });
}

export function searchSpecies(query: string) {
  return api<{ items: ApiSpecies[] }>(`/v1/species?limit=20&query=${encodeURIComponent(query)}`, { auth: false });
}

export const keyFor = (prefix: string) => newIdempotencyKey(prefix);

/** Korean copy for the discover-specific error codes (falls back to the shared messages). */
export function discoverError(error: unknown): string | null {
  const code = error instanceof ApiError ? error.code : null;
  switch (code) {
    case "UNSUPPORTED_MEDIA":
      return "지금은 JPEG 또는 PNG 사진만 분석할 수 있어요.";
    case "MEDIA_TOO_LARGE":
      return "사진은 15MB 이하로 골라 주세요.";
    case "LOCAL_PHOTO_UNAVAILABLE":
      return "사진을 불러오지 못했어요. 다시 골라 주세요.";
    case "STORAGE_UNAVAILABLE":
    case "UPLOAD_FAILED":
      return "사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.";
    case "EXTERNAL_AI_CONSENT_REQUIRED":
      return "사진 분석 안내가 바뀌었어요. 안내를 다시 확인해 주세요.";
    case "IDENTIFY_TIMEOUT":
      return "분석이 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요.";
    default:
      return null;
  }
}
