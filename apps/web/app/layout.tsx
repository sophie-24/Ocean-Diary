import type { Metadata } from "next";
import localFont from "next/font/local";
import { Gaegu } from "next/font/google";
import "./globals.css";

/**
 * Font system (2026-11-18 revised):
 *   • Pretendard variable — **모든** 텍스트의 기본 (한+영 통일).
 *   • Gaegu — 그림일기 손글씨 톤에만.
 *
 * 이전 Fraunces (serif italic) 제거 — Behance Swimie 레퍼런스처럼 영문도
 * 한국어와 동일한 산세리프로 톤 통일하기로 결정.
 */

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gaegu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mola · 다이빙 그림일기",
  description:
    "다이빙에서 만난 바다 친구들을 수채화 그림일기와 도감으로 남기는 앱. 출시 전 지금 체험해보세요.",
  openGraph: {
    title: "Mola · 다이빙 그림일기",
    description:
      "사진 한 장이면 돼요. Mola가 바다 친구를 알아보고 수채 카드로 그려서 도감에 담아요.",
    url: "https://today.mola.app",
    siteName: "Mola",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mola · 다이빙 그림일기",
    description: "사진 한 장 → 바다 친구 식별 → 수채 도감.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${gaegu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
