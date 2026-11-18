import type { Config } from "tailwindcss";

/**
 * Mirrors apps/mobile/src/theme/tokens.ts.
 * Font families reference the CSS variables set in globals.css / layout.tsx.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
        diary: ["var(--font-gaegu)", "cursive"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(30, 70, 140, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
