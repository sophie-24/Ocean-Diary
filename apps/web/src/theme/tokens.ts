/**
 * Mola web design tokens — v3 "조용한 바다" 통일.
 * apps/mobile/src/theme/tokens.ts 와 동일한 팔레트.
 */

export const colors = {
  navy: "#1C1C1E",
  ink2: "#6B6B6F",
  ink3: "#AEAEB2",
  inkSoft: "#6B6B6F",
  oceanBlue: "#2563EB",
  sky: "#EFF6FF",
  pillLine: "#BFDBFE",
  line: "#E5E5EA",
  lineStrong: "#E5E5EA",
  track: "#F0F0F2",
  mist: "#F4F8FC",
  ghostBg: "#F0F4FA",
  ghostLine: "#D1D5DB",
  ghostInk: "#9CA3AF",
  white: "#FFFFFF",
  coral: "#DC2626",
  sunny: "#D97706",
  deepSea: "#0E2A5C",
  success: "#16A34A",

  // ── v4 파랑 스케일 (메인 oceanBlue = blue600) ─────────────
  blue100: "#DBEAFE",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  blue700: "#1D4ED8",

  // ── v4 친근한 보조색 (수채 일러스트 톤. 전체의 5% 이내로만) ──
  honey: "#FBD157",
  mint: "#7FD1B0",
  coralSoft: "#F0654A",
} as const;

/** 웹 radius 규칙: 버튼 16(앱과 동일) · 카드 24 · 바텀시트/큰 패널 28. */
export const radii = {
  sm: 4,
  md: 10,
  lg: 12,
  xl: 12,
  btn: 16,
  card: 24,
  sheet: 28,
  pill: 999,
} as const;

export const shadow = {
  card: "0 4px 12px rgba(0, 0, 0, 0.04)",
  float: "0 24px 60px rgba(14, 42, 92, 0.28)",
} as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export type FontWeightKey =
  | "regular"
  | "medium"
  | "bold"
  | "extraBold"
  | "black";

export const fontWeight: Record<FontWeightKey, number> = {
  regular: 400,
  medium: 500,
  bold: 700,
  extraBold: 800,
  black: 900,
};
