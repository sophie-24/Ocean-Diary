/**
 * 타이포 스케일 — Pretendard 통일 버전 (2026-11-18 revised).
 *
 * 이전 Fraunces 영문 디스플레이 제거. 모든 role이 Pretendard 안에서
 * weight·size·tracking·line-height 조합으로만 계층 표현.
 *
 * 1.5 획일 줄간격 금지 — 각 role마다 다른 line-height·letter-spacing.
 */

import type { CSSProperties } from "react";

type T = CSSProperties;

export const type = {
  // ── 거대 디스플레이 (히어로 워드마크) ────────────────────
  display: {
    fontFamily: "var(--font-body)",
    fontWeight: 900,
    fontSize: "clamp(96px, 16vw, 220px)",
    lineHeight: 0.92,
    letterSpacing: "-0.045em",
  } satisfies T,

  // ── 섹션 타이틀 ──────────────────────────────────────────
  h1: {
    fontFamily: "var(--font-body)",
    fontWeight: 900,
    fontSize: "clamp(40px, 6vw, 68px)",
    lineHeight: 1.18,
    letterSpacing: "-0.028em",
  } satisfies T,

  h2: {
    fontFamily: "var(--font-body)",
    fontWeight: 900,
    fontSize: "clamp(32px, 4.6vw, 54px)",
    lineHeight: 1.22,
    letterSpacing: "-0.025em",
  } satisfies T,

  h3: {
    fontFamily: "var(--font-body)",
    fontWeight: 800,
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

  // ── 라벨·메타 ────────────────────────────────────────────
  label: {
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    fontSize: 13,
    lineHeight: 1.3,
    letterSpacing: "0.28em",
    textTransform: "uppercase" as const,
  } satisfies T,

  caption: {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: 14,
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
