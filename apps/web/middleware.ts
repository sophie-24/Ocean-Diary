import { NextRequest, NextResponse } from "next/server";

/**
 * Admin route guard.
 *
 * /admin 및 하위 경로를 보호합니다.
 *
 * 접근 방법:
 *   1) ?access=<ADMIN_ACCESS_TOKEN> 파라미터로 접속 → 쿠키가 심어지고 통과
 *   2) 이미 쿠키가 있으면 그냥 통과
 *   3) 둘 다 없으면 404 반환 (경로가 존재하지 않는 것처럼 보임)
 *
 * 환경변수:
 *   ADMIN_ACCESS_TOKEN — Vercel에 등록할 비밀 토큰
 */

const COOKIE_NAME = "mola_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // /admin 경로가 아니면 그냥 통과
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_ACCESS_TOKEN;

  // 토큰이 설정 안 되어 있으면 (로컬 개발 등) 그냥 통과
  if (!token) {
    return NextResponse.next();
  }

  // 1) URL에 ?access=토큰 이 있으면 → 쿠키 심고 쿼리 파라미터 제거 후 리다이렉트
  const accessParam = searchParams.get("access");
  if (accessParam === token) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("access");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  // 2) 쿠키가 있고 값이 맞으면 통과
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === token) {
    return NextResponse.next();
  }

  // 3) 인증 없음 → 404처럼 보이게
  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
