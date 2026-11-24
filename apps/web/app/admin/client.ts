import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE } from "./api-base";

/** 관리자 API 호출 (서버 전용). 세션이 없거나 만료되면 /admin 로그인으로 보낸다. */
export async function adminFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<{ status: number; data: T | null }> {
  const secret = (await cookies()).get("mola_admin")?.value;
  if (!secret) redirect("/admin");

  let res: Response | null = null;
  try {
    res = await fetch(`${API_BASE()}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
        ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return { status: 0, data: null };
  }
  if (res.status === 401) redirect("/admin");
  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    /* 본문 없음 */
  }
  return { status: res.status, data };
}
