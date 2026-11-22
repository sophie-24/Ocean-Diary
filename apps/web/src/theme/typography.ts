/**
 * 타이포 스케일 — v3 "조용한 바다" 통일.
 *
 * label에서 uppercase·넓은 tracking 제거.
 * 모든 계층은 weight·size·line-height 조합으로만 구분.
 *
 * v4: 굵기 상한 800 (900 사용 안 함). 최상위만 800, 나머지는 700/600/500/400.
 * 제목 안 핵심 단어만 oceanBlue(또는 어두운 배경에선 honey)로 강조한다.
 */

import type { CSSProperties } from "react";

type T = CSSProperties;

export const type = {
  // ── 거대 디스플레이 (히어로 워드마크) ────────────────────
  display: {
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    fontSize: "clamp(96px, 16vw, 220px)",
    lineHeight: 0.92,
    letterSpacing: "-0.045em",
  } satisfies T,

  // ── 섹션 타이틀 ──────────────────────────────────────────
  h1: {
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    fontSize: "clamp(40px, 6vw, 68px)",
    lineHeight: 1.18,
    letterSpacing: "-0.028em",
  } satisfies T,

  h2: {
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    fontSize: "clamp(32px, 4.6vw, 54px)",
    lineHeight: 1.22,
    letterSpacing: "-0.025em",
  } satisfies T,

  h3: {
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontSize: 26,
    lineHeight: 1.3,
    letterSpacing: "-0.018em",
  } satisfies T,

  h4: {
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1.35,
    letterSpacing: "-0.012em",
  } satisfies T,

  // ── 본문 ─────────────────────────────────────────────────
  lead: {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: 21,
    lineHeight: 1.6,
    letterSpacing: "-0.008em",
  } satisfies T,

  body: {
    fontFamily: "var(--font-body)",
    fontWeight: 400,
    fontSize: 17,
    lineHeight: 1.68,
    letterSpacing: "-0.003em",
  } satisfies T,

  bodyBold: {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 17,
    lineHeight: 1.68,
    letterSpacing: "-0.003em",
  } satisfies T,

  // ── 라벨 — uppercase 없이, 작은 크기 + 굵기로만 구분 ────
  label: {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.4,
    letterSpacing: "-0.005em",
  } satisfies T,

  caption: {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: 13,
    lineHeight: 1.5,
    letterSpacing: "0em",
  } satisfies T,

  // ── 그림일기 손글씨 ─────────────────────────────────────
  diary: {
    fontFamily: "var(--font-gaegu), cursive",
    fontWeight: 400,
    fontSize: 19,
    lineHeight: 1.45,
    letterSpacing: "0em",
  } satisfies T,

  diaryLarge: {
    fontFamily: "var(--font-gaegu), cursive",
    fontWeight: 700,
    fontSize: 24,
    lineHeight: 1.4,
    letterSpacing: "0em",
  } satisfies T,
} as const;
