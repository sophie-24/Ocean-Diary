"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * 스크롤 진입 시 아래에서 살짝 떠오르며 나타나는 래퍼.
 * - 서버/JS 꺼짐: 그대로 보임 (콘텐츠 숨김 없음)
 * - 화면 아래쪽에 있는 요소만 마운트 후 숨겼다가 보이는 순간 reveal
 * - prefers-reduced-motion: 아무것도 하지 않음
 */
export function Reveal({
  children,
  delay = 0,
  style,
  className,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"" | "hidden" | "in">("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${className ? ` ${className}` : ""}`}
      data-state={state}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
