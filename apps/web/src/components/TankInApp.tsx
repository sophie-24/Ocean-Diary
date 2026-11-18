"use client";

import { useEffect, useRef, useState } from "react";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";
import { colors } from "@/theme/tokens";

/**
 * 폰 스크린 안의 Mola 네이티브 "나의 바다 · 수조" 화면.
 *
 * 변경점 (2026-11-18): 생물 18마리로 늘림 + 깊이별로 3개 레이어
 * (전경/중경/배경)에 분산해서 "수조에 꽉 찬" 느낌. 각 레이어마다 다른
 * 속도·크기·투명도로 패럴랙스. 네이티브 앱의 OceanScene/ReefScene을
 * 웹에서 재현하기 위한 축약판.
 *
 * 수조에 올릴 생물 라인업은 Mola 네이티브 앱의 수채 Critter 32종 중
 * 크기 변주와 톤 밸런스를 보고 큐레이션.
 */

type TankCritter = {
  kind: CritterKind;
  // 0~100 세로 위치 (%)
  y: number;
  // 초단위 왕복 시간
  duration: number;
  // 초단위 시작 지연
  delay: number;
  // 역방향 (오른쪽→왼쪽)
  reverse: boolean;
  size: number;
  // 전경/중경/배경 (opacity 조절)
  layer: "front" | "mid" | "back";
};

const CRITTERS: TankCritter[] = [
  // ─── 배경 레이어 (크고 느리고 어두운 실루엣) ─────────────
  { kind: "whale",       y: 15, duration: 90, delay: 0,  reverse: false, size: 88, layer: "back" },
  { kind: "greatwhite",  y: 60, duration: 85, delay: 25, reverse: true,  size: 80, layer: "back" },
  { kind: "hammerhead",  y: 38, duration: 95, delay: 12, reverse: false, size: 72, layer: "back" },

  // ─── 중경 레이어 ────────────────────────────────────────
  { kind: "thresher",    y: 25, duration: 55, delay: 8,  reverse: false, size: 60, layer: "mid" },
  { kind: "tiger",       y: 70, duration: 62, delay: 18, reverse: true,  size: 56, layer: "mid" },
  { kind: "trevally",    y: 45, duration: 48, delay: 3,  reverse: false, size: 54, layer: "mid" },
  { kind: "nurse",       y: 80, duration: 70, delay: 30, reverse: true,  size: 52, layer: "mid" },
  { kind: "zebra",       y: 32, duration: 58, delay: 22, reverse: true,  size: 48, layer: "mid" },
  { kind: "silvertip",   y: 55, duration: 65, delay: 14, reverse: false, size: 50, layer: "mid" },
  { kind: "barracuda",   y: 72, duration: 52, delay: 6,  reverse: false, size: 50, layer: "mid" },

  // ─── 전경 레이어 (작고 빠르고 선명) ─────────────────────
  { kind: "mandarin",    y: 50, duration: 32, delay: 1,  reverse: false, size: 36, layer: "front" },
  { kind: "pygmy",       y: 85, duration: 28, delay: 15, reverse: true,  size: 28, layer: "front" },
  { kind: "lionfish",    y: 20, duration: 38, delay: 20, reverse: true,  size: 42, layer: "front" },
  { kind: "boxfish",     y: 65, duration: 30, delay: 5,  reverse: false, size: 34, layer: "front" },
  { kind: "moray",       y: 90, duration: 44, delay: 9,  reverse: true,  size: 38, layer: "front" },
  { kind: "pikachu",     y: 42, duration: 26, delay: 24, reverse: false, size: 30, layer: "front" },
  { kind: "seabunny",    y: 78, duration: 34, delay: 17, reverse: false, size: 28, layer: "front" },
  { kind: "harlequin",   y: 10, duration: 36, delay: 11, reverse: true,  size: 32, layer: "front" },
];

const LAYER_OPACITY = { back: 0.35, mid: 0.6, front: 0.9 } as const;

export function TankInApp() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!playing) {
      audioRef.current?.pause();
      return;
    }
    audioRef.current?.play().catch(() => setPlaying(false));
  }, [playing]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-body)",
        backgroundColor: colors.deepSea,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 수조 배경 그라디언트 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 25%, rgba(220,235,252,0.22), transparent 55%), " +
            "linear-gradient(180deg, #16285A 0%, #0E2A5C 50%, #0A1F4B 100%)",
        }}
      />

      {/* 상단 바 */}
      <div
        style={{
          position: "relative",
          padding: "66px 20px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 12, letterSpacing: "0.22em", color: colors.sky, opacity: 0.85 }}>
          나의 바다 · 대양 수조
        </span>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: colors.sky,
            opacity: 0.7,
            border: "1px solid rgba(220,235,252,0.25)",
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          18 · 수집한 친구들
        </div>
      </div>

      {/* 수조 본체 — 떠다니는 생물 */}
      <div style={{ flex: 1, position: "relative" }}>
        {CRITTERS.map((c, i) => (
          <div
            key={`${c.kind}-${i}`}
            style={{
              position: "absolute",
              top: `${c.y}%`,
              left: 0,
              right: 0,
              opacity: LAYER_OPACITY[c.layer],
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                animation: `tank-drift-${c.reverse ? "r" : "l"} ${c.duration}s linear ${c.delay}s infinite`,
                display: "inline-block",
              }}
            >
              <Critter kind={c.kind} size={c.size} />
            </div>
          </div>
        ))}
      </div>

      {/* 하단 수조 switcher + 소리 토글 */}
      <div style={{ position: "relative", padding: "8px 20px 28px" }}>
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid rgba(220,235,252,0.3)",
            backgroundColor: playing ? "rgba(255,255,255,0.14)" : "rgba(220,235,252,0.08)",
            color: colors.sky,
            fontFamily: "var(--font-body)",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 12,
            letterSpacing: "-0.01em",
          }}
        >
          {playing ? "🔊 스쿠버 소리 켜짐" : "🎧 스쿠버 소리 켜기"}
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "대양", active: true },
            { label: "산호초", active: false },
            { label: "마크로", active: false },
          ].map((t) => (
            <div
              key={t.label}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 6px",
                borderRadius: 12,
                backgroundColor: t.active ? colors.white : "rgba(8,24,58,0.45)",
                border: t.active ? "none" : "1px solid rgba(169,210,255,0.22)",
                color: t.active ? colors.navy : colors.white,
                fontWeight: t.active ? 900 : 700,
                fontSize: 12,
                letterSpacing: "-0.01em",
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>

      <audio ref={audioRef} src="/sounds/scuba.m4a" loop preload="auto" />

      <style>{`
        @keyframes tank-drift-l {
          0%   { transform: translateX(-20%) translateY(0); }
          50%  { transform: translateX(110%) translateY(-8px); }
          100% { transform: translateX(-20%) translateY(0); }
        }
        @keyframes tank-drift-r {
          0%   { transform: translateX(110%) translateY(0); }
          50%  { transform: translateX(-20%) translateY(6px); }
          100% { transform: translateX(110%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
