import type { CSSProperties, ReactNode } from "react";
import { colors } from "@/theme/tokens";

/**
 * Landing-page CTA button. Two variants matching the native app's button
 * language (solid navy primary vs. ghost outline secondary), but sized up
 * for a desktop hero where the button needs to compete with a 160px
 * wordmark and still read as the obvious next action.
 */
export function CTAButton({
  children,
  href,
  variant = "primary",
  tone = "light",
  size = "lg",
  style,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  /** light = sits on cream/white; dark = sits on blue/dark panel. */
  tone?: "light" | "dark";
  size?: "md" | "lg";
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const padY = size === "lg" ? 18 : 14;
  const padX = size === "lg" ? 32 : 24;
  const font = size === "lg" ? 17 : 15;

  // Colour combinations by variant × tone. Kept explicit instead of computed
  // so each state can be eyeballed in code review.
  let bg: string = colors.navy;
  let fg: string = colors.white;
  let border: string = "transparent";
  if (variant === "primary" && tone === "dark") {
    bg = colors.white;
    fg = colors.navy;
  } else if (variant === "ghost" && tone === "light") {
    bg = "transparent";
    fg = colors.navy;
    border = colors.navy;
  } else if (variant === "ghost" && tone === "dark") {
    bg = "transparent";
    fg = colors.white;
    border = colors.white;
  }

  const common: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: `${padY}px ${padX}px`,
    borderRadius: 999,
    fontFamily: "var(--font-noto), system-ui, sans-serif",
    fontWeight: 900,
    fontSize: font,
    letterSpacing: "0.01em",
    backgroundColor: bg,
    color: fg,
    border: `2px solid ${border === "transparent" ? bg : border}`,
    textDecoration: "none",
    cursor: "pointer",
    transition: "transform 120ms ease, opacity 120ms ease",
    ...style,
  };

  if (href) return <a href={href} style={common}>{children}</a>;
  return (
    <button type="button" onClick={onClick} style={common}>
      {children}
    </button>
  );
}
