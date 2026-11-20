// Mola v3 "조용한 바다" design tokens — quiet, confident, designer-crafted.
// Mirrors the v3 style board in the design canvas.

export const colors = {
  // ── Primary ink ──
  navy: "#1C1C1E",          // was #16285A → neutral near-black
  ink2: "#6B6B6F",           // was #4A5B7E → neutral mid-gray
  ink3: "#AEAEB2",           // was #5E6D8A → neutral light-gray
  inkSoft: "#6B6B6F",       // was #3D5A9C → neutral mid-gray

  // ── Brand accent (single) ──
  oceanBlue: "#2563EB",     // was #2F6FDB → cleaner blue

  // ── Surfaces & lines ──
  sky: "#EFF6FF",            // was #DCEBFC → lighter blue tint
  pillLine: "#BFDBFE",      // was #A8CBF2 → softer blue pill border
  line: "#E5E5EA",           // was #DCE8F5 → neutral system line
  lineStrong: "#E5E5EA",    // was #C9DBF0 → same neutral
  track: "#F0F0F2",          // was #E3ECF7 → neutral track bg
  mist: "#F4F8FC",           // KEPT — user preference: light blue page bg
  ghostBg: "#F0F4FA",       // was #EEF4FB → blue-tinted cell bg
  ghostLine: "#D1D5DB",     // was #BCD2EC → neutral ghost border
  ghostInk: "#9CA3AF",      // was #A9C3E3 → neutral ghost text
  white: "#FFFFFF",

  // ── Semantic ──
  coral: "#DC2626",          // was #C8432F → standard red alert
  sunny: "#D97706",          // was #F7C948 → focus/warning amber
  deepSea: "#0E2A5C",       // KEPT — dark aquarium bg (art color)
  success: "#16A34A",        // was #1F7A4D → brighter green

  // ── Dark (aquarium) surfaces — art colors intentionally KEPT ──
  glass: "rgba(8,24,58,0.5)",
  glassLine: "rgba(169,210,255,0.25)",
  darkInkSoft: "#CFE0F7",
  darkTabInactive: "#B9CCEA",
} as const;

export const radii = {
  sm: 4,     // was 10 → tags, small badges
  md: 10,    // was 14 → buttons, inputs
  lg: 12,    // was 18 → cards, containers
  xl: 12,    // was 22 → large containers (same as lg, no over-rounding)
  pill: 999, // pills stay round
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

/**
 * React Native needs one font family per weight. Names match the keys passed to useFonts().
 * v3: dropped 800/900 weights. extraBold & black now map to 700Bold.
 */
export const fonts = {
  regular: "NotoSansKR_400Regular",
  medium: "NotoSansKR_500Medium",
  bold: "NotoSansKR_700Bold",
  extraBold: "NotoSansKR_700Bold",   // was 800 → 700
  black: "NotoSansKR_700Bold",       // was 900 → 700
  // Picture diary (crayon) faces
  diary: "Gaegu_400Regular",
  diaryBold: "Gaegu_700Bold",
  diaryHand: "GamjaFlower_400Regular",
} as const;

export type FontWeightKey = "regular" | "medium" | "bold" | "extraBold" | "black";

// v3: card shadows REMOVED. Only keep raised for TabBar / modals.
export const shadow = {
  card: {
    // Intentionally zeroed — v3 uses spacing & bg contrast, not shadows
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  raised: {
    shadowColor: "#1C1C1E",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
} as const;
