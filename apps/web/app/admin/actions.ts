"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE } from "./api-base";

const COOKIE = "mola_admin";

/** 입력한 관리자 비밀번호를 API 로 확인하고, 맞으면 httpOnly 쿠키에 보관. */
export async function adminLogin(_prev: { error?: string } | null, form: FormData) {
  const secret = String(form.get("secret") ?? "").trim();
  if (!secret || secret.length > 256) return { error: "비밀번호를 입력해주세요." };

  let status = 0;
  try {
    const res = await fetch(`${API_BASE()}/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    status = res.status;
  } catch {
    return { error: "API 서버에 연결할 수 없어요." };
  }
  if (status === 429) return { error: "시도 횟수를 초과했어요. 잠시 후 다시 해주세요." };
  if (status === 503) return { error: "서버에 ADMIN_SECRET이 설정되지 않았어요." };
  if (status !== 200) return { error: "비밀번호가 맞지 않아요." };

  (await cookies()).set(COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin");
}
