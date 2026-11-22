import type { CSSProperties } from "react";

/**
 * 섹션 제목 위의 작은 챕터 라벨 (점 + 한 줄).
 * 긴 스크롤에서 지금이 어느 장인지 알려주는 앵커. 스타일은 globals.css 의 .eyebrow.
 * tone="dark" 는 어두운/파랑 배경 위용.
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
  return (
    <p className="eyebrow" data-tone={tone} style={style}>
      <i aria-hidden />
      {children}
    </p>
  );
}
