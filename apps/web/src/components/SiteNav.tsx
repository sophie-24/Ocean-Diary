"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * 상단 고정 내비게이션. 히어로(파랑) 위에선 투명 + 흰 글씨,
 * 스크롤하면 흰 반투명 + 블러로 바뀐다 (스타일은 globals.css 의 .site-nav).
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-nav" data-scrolled={scrolled}>
      <div className="site-nav-inner">
        <a className="brand" href="#top" aria-label="Mola 처음으로">
          <img src="/brand/mola-icon.png" alt="" width={34} height={34} />
          Mola
        </a>
        <nav className="nav-right" aria-label="주요 메뉴">
          <Button
            href="#signup"
            size="md"
            tone={scrolled ? "light" : "dark"}
            style={{ marginLeft: 6 }}
          >
            출시 연락받기
          </Button>
        </nav>
      </div>
    </header>
  );
}
