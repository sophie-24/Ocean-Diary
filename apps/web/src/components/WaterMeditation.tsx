"use client";

import { useEffect, useRef, useState } from "react";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";
import { Txt, DiaryTxt } from "@/components/ui/Txt";
import { colors } from "@/theme/tokens";

/**
 * 섹션 2 — 물멍 (Water Meditation).
 *
 * 수조 애니메이션을 CSS만으로 구현 (no canvas, no reanimated). 클라이언트
 * 컴포넌트지만 자바스크립트는 사운드 토글 외에는 쓰지 않음 — 저전력 모드
 * 사용자에게도 부드럽게 재생.
 *
 * 설계서 기준(product-overview 2절 "나만의 바다 꾸미기")의 축약판:
 * 수조에서 수집한 친구들이 떠다니는 모습을 미리 체험.
 */

const CRITTERS: { kind: CritterKind; y: number; duration: number; delay: number; reverse: boolean }[] = [
  { kind: "whale", y: 30, duration: 60, delay: 0, reverse: false },
  { kind: "mandarin", y: 55, duration: 45, delay: 8, reverse: true },
  { kind: "pygmy", y: 70, duration: 35, delay: 3, reverse: false },
  { kind: "hammerhead", y: 20, duration: 55, delay: 15, reverse: true },
  { kind: "trevally", y: 45, duration: 40, delay: 22, reverse: false },
  { kind: "moray", y: 80, duration: 50, delay: 10, reverse: true },
];

export function WaterMeditation() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!playing) {
      audioRef.current?.pause();
      return;
    }
    audioRef.current?.play().catch(() => {
      // iOS·Safari autoplay 정책에 걸릴 수 있다. 사용자 탭이 trusted 이벤트라
      // 보통 첫 토글은 성공하지만, 실패하면 조용히 상태 되돌림.
      setPlaying(false);
    });
  }, [playing]);

  return (
    <article
      style={{
        position: "relative",
        backgroundColor: colors.navy,
        borderRadius: 28,
        overflow: "hidden",
        color: colors.white,
        minHeight: 480,
      }}
    >
      {/* 배경 — 수조 그라디언트 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #16285A 0%, #0E2A5C 50%, #0A1F4B 100%)",
        }}
      />
      {/* 광원 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "20%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,235,252,0.18), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* 생물 트랙 — 각 Critter는 수평으로 왕복, opacity 0.5 */}
      {CRITTERS.map((c, i) => (
        <div
          key={`${c.kind}-${i}`}
          style={{
            position: "absolute",
            top: `${c.y}%`,
            left: c.reverse ? "auto" : 0,
            right: c.reverse ? 0 : "auto",
            animation: `wm-drift ${c.duration}s linear ${c.delay}s infinite`,
            animationDirection: c.reverse ? "reverse" : "normal",
            opacity: 0.55,
          }}
        >
          <Critter kind={c.kind} size={72} />
        </div>
      ))}

      {/* 내용 */}
      <div
        style={{
          position: "relative",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 480,
        }}
      >
        <div style={{ flex: 1 }} />

        <div
          style={{
            backgroundColor: "rgba(14,42,92,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(169,210,255,0.2)",
            borderRadius: 20,
            padding: "22px 24px",
            alignSelf: "stretch",
          }}
        >
          <DiaryTxt size={20} color={colors.sky} as="p" style={{ display: "block", margin: 0 }}>
            {playing
              ? "숨소리 들려요 — 잠깐 쉬어가요."
              : "소리를 켜면 스쿠버 숨소리와 함께 물멍 모드가 시작돼요."}
          </DiaryTxt>
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            style={{
              marginTop: 16,
              padding: "14px 22px",
              backgroundColor: playing ? "rgba(255,255,255,0.14)" : colors.white,
              color: playing ? colors.white : colors.navy,
              border: "2px solid " + (playing ? colors.white : colors.white),
              borderRadius: 999,
              fontFamily: "var(--font-noto), system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 15,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {playing ? "🔊 소리 끄기" : "🎧 스쿠버 소리 켜기"}
          </button>
        </div>
      </div>

      {/* 재생용 오디오 — 네이티브 앱과 동일한 scuba.m4a 재사용 */}
      <audio ref={audioRef} src="/sounds/scuba.m4a" loop preload="auto" />

      {/* 애니메이션 */}
      <style>{`
        @keyframes wm-drift {
          0%   { transform: translateX(0) translateY(0); }
          50%  { transform: translateX(80vw) translateY(-6px); }
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </article>
  );
}
