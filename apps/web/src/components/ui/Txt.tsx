import type { CSSProperties, ElementType, ReactNode } from "react";
import { colors, fontWeight, type FontWeightKey } from "@/theme/tokens";

/**
 * Legacy Txt — 모바일 Txt를 미러하되, 폰트 패밀리는 Pretendard로 변경.
 * 새 코드는 `src/theme/typography.ts`의 role-based `type.xxx`을 우선 사용.
 * 이 컴포넌트는 TodaySpot 등 기존 카드의 내부 세부 텍스트 호환용.
 */

type Props = {
  children: ReactNode;
  size?: number;
  weight?: FontWeightKey;
  color?: string;
  /** letter-spacing in em. */
  tracking?: number;
  align?: CSSProperties["textAlign"];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
  "aria-label"?: string;
};

export function Txt({
  children,
  size = 14,
  weight = "regular",
  color = colors.navy,
  tracking,
  align,
  as: Tag = "span",
  className,
  style,
  ...rest
}: Props) {
  // 1.5 획일 금지 — 라벨/캡션은 더 타이트하게, 본문은 숨 쉬게.
  const lh =
    size <= 12 ? size * 1.35 : size <= 14 ? size * 1.5 : size * 1.62;

  return (
    <Tag
      {...rest}
      className={className}
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: fontWeight[weight],
        fontSize: size,
        lineHeight: `${Math.round(lh)}px`,
        color,
        letterSpacing:
          tracking !== undefined ? `${tracking * size}px` : "-0.005em",
        textAlign: align,
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function DiaryTxt({
  children,
  size = 18,
  color = colors.navy,
  align,
  as: Tag = "span",
  className,
  style,
}: Omit<Props, "weight" | "tracking">) {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: "var(--font-gaegu), cursive",
        fontSize: size,
        lineHeight: `${Math.round(size * 1.45)}px`,
        color,
        textAlign: align,
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
