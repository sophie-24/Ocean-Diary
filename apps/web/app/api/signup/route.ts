import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

/**
 * POST /api/signup
 *
 * 사전 등록 이메일 수집 → Supabase `pre_launch_signups` 테이블에 저장.
 * 이메일만 저장. IP·UA는 받지 않는다 — 수집 최소화가 Mola 개인정보 약속의 핵심.
 *
 * 중복 이메일은 무시 (upsert로 처리, 에러 없이 성공 반환).
 */

type Body = { email?: unknown };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (email.length > 254) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("pre_launch_signups")
      .upsert(
        { email, source: "mola.app", signed_up_at: new Date().toISOString() },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
