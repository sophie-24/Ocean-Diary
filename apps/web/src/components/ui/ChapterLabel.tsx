import type { CSSProperties } from "react";
import { colors } from "@/theme/tokens";

/**
 * Small eyebrow label used above each section title.
 * Pattern borrowed from product-landing case studies (Swimie et al.) where a
 * short English chapter name anchors the long-scroll narrative so the reader
 * always knows which part of the story they're in.
 *
 * Always uppercase, generous letter-spacing, oceanBlue to keep brand presence
 * even on dark sections (contrast adjusted by passing `tone`).
 */
export function ChapterLabel({
  children,
  tone = "light",
  style,
}: {
  children: string;
  tone?: "light" | "dark";
  style?: CSSProperties;
}) {
  const color = tone === "dark" ? colors.sky : colors.oceanBlue;
  return (
    <p
      style={{
        fontFamily: "var(--font-noto), system-ui, sans-serif",
        fontWeight: 900,
        fontSize: 15,
        lineHeight: "22px",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
