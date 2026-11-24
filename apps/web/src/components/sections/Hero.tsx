import type { ReactNode } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ScreenImage } from "@/components/ScreenImage";
import { Critter } from "@/components/Critter";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

/**
 * 히어로 v4 — 제품 중심.
 *   왼쪽: 라벨 칩 · 제목(핵심 단어 honey 강조) · 설명 · CTA
 *   오른쪽: 실제 앱 화면 두 개를 겹쳐 기울인 대표 비주얼 + 아래에서 빼꼼 나오는 Critter
 *   배경: 아주 옅은 거대 워드마크 (브랜드 흔적만 남김)
 * 스타일/반응형은 app/globals.css 의 .hero-* 클래스.
 */
export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-inner">
        <div>
          <Chip tone="glass">2026년 겨울 출시 예정</Chip>
          <h1 className="hero-title">
            다이빙에서 만난
            <br />
            바다 친구들을
            <br />
            <span className="hero-hl">그림일기</span>로 남겨요.
          </h1>
          <p className="hero-lead">
            사진 한 장이면 돼요. Mola가 바다 친구를 알아보고,
            <br />
            수채 카드로 그려서 나만의 도감에 담아줘요.
          </p>
          <div className="hero-cta">
            <Button href="#signup" tone="dark">
              출시 연락받기 →
            </Button>
          </div>
        </div>

        <div className="hero-phones">
          <ScaledPhone className="hero-phone-back" ariaHidden>
            <ScreenImage src="/screens/dogam-grid.png" alt="도감 화면" />
          </ScaledPhone>
          <ScaledPhone className="hero-phone-front">
            <ScreenImage src="/screens/log-list.png" alt="로그북 목록 화면" />
          </ScaledPhone>

          <div className="hero-chip-b float-slow">
            <Chip tone="glass">사진 한 장 → 도감 등록</Chip>
          </div>
          <div className="hero-chip-a float-slower">
            <Chip tone="honey">오늘 새 친구를 만났어요</Chip>
          </div>
          <div className="hero-critter float-slow">
            <Critter kind="mandarin" size={150} />
          </div>
        </div>
      </div>

      <div className="hero-watermark" aria-hidden>
        Mola
      </div>
    </section>
  );
}

/** 390×844 PhoneFrame 을 CSS 변수 --s 비율로 축소해 보여준다 (크기는 .hero-phone 이 계산). */
function ScaledPhone({
  children,
  className,
  ariaHidden,
}: {
  children: ReactNode;
  className: string;
  ariaHidden?: boolean;
}) {
  return (
    <div className={`hero-phone ${className}`} aria-hidden={ariaHidden}>
      <div>
        <PhoneFrame>{children}</PhoneFrame>
      </div>
    </div>
  );
}
