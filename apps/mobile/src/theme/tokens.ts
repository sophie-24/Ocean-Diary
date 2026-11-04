// Ocean Diary design tokens — mirrors the "필드 가이드" style board in the design canvas.

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
  // Dark (aquarium) surfaces
  glass: "rgba(8,24,58,0.5)",
  glassLine: "rgba(169,210,255,0.25)",
  darkInkSoft: "#CFE0F7",
  darkTabInactive: "#B9CCEA",
} as const;

export const radii = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

/**
 * React Native needs one font family per weight. Names match the keys passed to useFonts().
 */
export const fonts = {
  regular: "NotoSansKR_400Regular",
  medium: "NotoSansKR_500Medium",
  bold: "NotoSansKR_700Bold",
  extraBold: "NotoSansKR_800ExtraBold",
  black: "NotoSansKR_900Black",
  // Picture diary (crayon) faces
  diary: "Gaegu_400Regular",
  diaryBold: "Gaegu_700Bold",
  diaryHand: "GamjaFlower_400Regular",
} as const;

export type FontWeightKey = "regular" | "medium" | "bold" | "extraBold" | "black";

export const shadow = {
  card: {
    shadowColor: "#1E468C",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: "#1E468C",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
  },
} as const;
