import { Platform } from "react-native";

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8765").replace(/\/$/, "");
export const DEV_AUTH_TOKEN = process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN ?? "";

const REQUEST_TIMEOUT_MS = 30_000;

/** Error carrying the server's stable error code (see docs/api-contract-v1.md / v2.md). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public retryAfterSeconds: number | null = null,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

type TokenSource = () => string | null;
let tokenSource: TokenSource = () => null;
let onAccountDeleted: () => void = () => undefined;

/** Wired once by AuthProvider so every request carries the current access token. */
export function configureApiAuth(source: TokenSource, accountDeleted: () => void) {
  tokenSource = source;
  onAccountDeleted = accountDeleted;
}

export function currentToken(): string | null {
  return tokenSource();
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function api<T>(path: string, { method = "GET", body, idempotencyKey, auth = true, signal }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  if (auth) {
    const token = tokenSource();
    if (!token) throw new ApiError(401, "AUTH_REQUIRED");
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = signal ? null : new AbortController();
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? controller?.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new ApiError(0, "TIMEOUT");
    throw new ApiError(0, "NETWORK_UNAVAILABLE");
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code = payload?.error?.code ?? payload?.detail?.code ?? `HTTP_${response.status}`;
    const retry = Number(response.headers.get("Retry-After"));
    if (response.status === 410 && code === "ACCOUNT_DELETED") onAccountDeleted();
    throw new ApiError(response.status, code, Number.isFinite(retry) && retry > 0 ? retry : null);
  }
  return payload as T;
}

/** Unique key for one user action; reuse the same key when retrying that action. */
export function newIdempotencyKey(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}-${Platform.OS}`;
}

/** Friendly Korean message for common error codes. */
export function errorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : "UNKNOWN";
  switch (code) {
    case "NETWORK_UNAVAILABLE":
      return "서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.";
    case "TIMEOUT":
      return "서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.";
    case "AUTH_REQUIRED":
    case "INVALID_TOKEN":
      return "다시 로그인해 주세요.";
    case "RATE_LIMITED":
      return "요청이 잠시 많아요. 조금 뒤에 다시 시도해 주세요.";
    case "DIVE_LOG_NOT_FOUND":
      return "기록을 찾을 수 없어요.";
    default:
      return "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
  }
}
