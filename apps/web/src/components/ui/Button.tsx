import type { CSSProperties, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/**
 * Mola 웹 버튼. 모양·색·상태(hover/active/focus)는 app/globals.css 의 .mola-btn 이 담당.
 *   primary   — 파랑 채움 (밝은 배경) / 흰 채움 (tone="dark": 파랑·어두운 패널 위)
 *   secondary — 연한 파랑 바탕
 *   ghost     — 테두리만
 *   danger    — 삭제 등 위험 동작
 * 모서리 반경 16 = 모바일 앱 버튼과 동일.
 */
export function Button({
  children,
  href,
  variant = "primary",
  tone = "light",
  size = "lg",
  style,
  onClick,
  type = "button",
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  /** light = 흰/연한 배경 위, dark = 파랑·어두운 패널 위. */
  tone?: "light" | "dark";
  size?: "md" | "lg";
  style?: CSSProperties;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const common = {
    className: "mola-btn",
    "data-variant": variant,
    "data-tone": tone,
    "data-size": size,
    style,
    "aria-label": ariaLabel,
  };
  if (href) {
    return (
      <a href={href} {...common}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...common}
      style={{ ...style, ...(disabled ? { opacity: 0.7, cursor: "wait" } : null) }}
    >
      {children}
    </button>
  );
}
