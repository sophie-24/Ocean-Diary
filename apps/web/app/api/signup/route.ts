import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/signup
 *
 * 베타 론치 이메일 수집. 지금은 콘솔에 기록하고 OK만 반환.
 * 다음 단계: Supabase `pre_launch_signups` 테이블에 insert (feature-spec의
 * Supabase OTP 섹션과 같은 인프라 사용).
 *
 * 이메일만 저장. IP·UA는 받지 않는다 — 수집 최소화가 Mola 개인정보 약속의
 * 핵심(docs/privacy-policy-draft.md).
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

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (email.length > 254) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }

  // TODO: Supabase insert
  //   await supabase.from('pre_launch_signups')
  //     .insert({ email, source: 'today.mola.app', signed_up_at: new Date().toISOString() })
  //     .onConflict('email').ignore();
  // 지금은 서버 로그만 남겨서 Vercel Logs에서 확인 가능하도록.
  console.log(JSON.stringify({ event: "pre_launch_signup", email }));

  return NextResponse.json({ ok: true });
}
