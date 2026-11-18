/**
 * Mola web design tokens — mirror of apps/mobile/src/theme/tokens.ts.
 * Font weights kept for Txt compatibility; actual typography styles are in
 * src/theme/typography.ts (role-based).
 */

export const colors = {
  navy: "#16285A",
  ink2: "#4A5B7E",
  ink3: "#5E6D8A",
  inkSoft: "#3D5A9C",
  oceanBlue: "#2F6FDB",
  sky: "#DCEBFC",
  pillLine: "#A8CBF2",
  line: "#DCE8F5",
  lineStrong: "#C9DBF0",
  track: "#E3ECF7",
  mist: "#F4F8FC",
  ghostBg: "#EEF4FB",
  ghostLine: "#BCD2EC",
  ghostInk: "#A9C3E3",
  white: "#FFFFFF",
  coral: "#C8432F",
  sunny: "#F7C948",
  deepSea: "#0E2A5C",
  success: "#1F7A4D",
} as const;

export const radii = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 } as const;
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
