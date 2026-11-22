import type { Config } from "tailwindcss";

/**
 * v3 "조용한 바다" — apps/mobile/src/theme/tokens.ts 와 동일.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
        blue: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#0E2A5C",
        },
        honey: "#FBD157",
        mint: "#7FD1B0",
        coralSoft: "#F0654A",
      },
      borderRadius: {
        btn: "16px",
        card: "24px",
        sheet: "28px",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        diary: ["var(--font-gaegu)", "cursive"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
