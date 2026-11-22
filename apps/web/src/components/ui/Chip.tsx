import type { CSSProperties, ReactNode } from "react";

export type ChipTone = "blue" | "glass" | "honey" | "mint" | "coral" | "dark";

/** 작은 알약 라벨. 점(dot)은 상태/강조용. 보조색 칩(honey·mint·coral)은 포인트로만. */
export function Chip({
  children,
  tone = "blue",
  dot = true,
  style,
}: {
  children: ReactNode;
  tone?: ChipTone;
  dot?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span className="mola-chip" data-tone={tone} style={style}>
      {dot ? <i aria-hidden /> : null}
      {children}
    </span>
  );
}
