import type { CSSProperties, ReactNode } from "react";

/** 흰 카드(기본) · 연한 파랑 카드(tint) · 어두운 패널(dark). 반경 24, 약한 그림자. */
export function Card({
  children,
  tone = "light",
  padding = 28,
  style,
}: {
  children: ReactNode;
  tone?: "light" | "tint" | "dark";
  padding?: number | string;
  style?: CSSProperties;
}) {
  return (
    <div className="mola-card" data-tone={tone} style={{ padding, ...style }}>
      {children}
    </div>
  );
}
