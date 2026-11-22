"use client";

import { useState } from "react";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";
import { colors } from "@/theme/tokens";

/**
 * 폰 스크린 안의 Mola 네이티브 "다이빙 그림일기" 화면.
 *
 * 실제 앱 기능을 그대로 미리체험하게:
 *   1. 유저가 "오늘 뭐 봤어요?" 한 줄 입력
 *   2. Mola가 수채 카드 + 손글씨 레이아웃으로 자동 조판
 *   3. 스티커 팔레트에서 골라서 일기장에 붙임
 *
 * 실제 서버 호출은 안 하고, 입력한 텍스트를 바로 렌더링해서
 * "이런 식으로 저장돼요"의 시뮬레이션. 스티커도 상태로만 관리.
 */

type Sticker = { id: string; emoji: string; label: string };

const STICKERS: Sticker[] = [
  { id: "wave", emoji: "🌊", label: "파도" },
  { id: "sparkle", emoji: "✨", label: "반짝임" },
  { id: "heart", emoji: "💙", label: "하트" },
  { id: "bubble", emoji: "🫧", label: "방울" },
  { id: "sun", emoji: "☀️", label: "햇살" },
  { id: "flower", emoji: "🪸", label: "산호" },
  { id: "moon", emoji: "🌙", label: "달" },
  { id: "camera", emoji: "📷", label: "카메라" },
];

type PlacedSticker = { stickerId: string; x: number; y: number; key: number };

const SAMPLE_DIARY = "환도상어가 꼬리를 리본처럼 흔들며 지나갔어요. 숨 쉬는 걸 잠깐 잊었어요.";

export function DiaryInApp() {
  const [input, setInput] = useState(SAMPLE_DIARY);
  const [critter, setCritter] = useState<CritterKind>("thresher");
  const [placed, setPlaced] = useState<PlacedSticker[]>([
    { stickerId: "wave", x: 12, y: 15, key: 1 },
    { stickerId: "sparkle", x: 78, y: 55, key: 2 },
  ]);

  const dropSticker = (sticker: Sticker) => {
    // 간단한 배치 — 랜덤이 아니라 순서대로 좌→우로 떨어뜨림
    const next: PlacedSticker = {
      stickerId: sticker.id,
      x: 18 + ((placed.length * 23) % 60),
      y: 20 + ((placed.length * 17) % 50),
      key: Date.now() + placed.length,
    };
    setPlaced((p) => [...p, next].slice(-5)); // 최대 5개
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: 60,
        backgroundColor: colors.mist,
        fontFamily: "var(--font-body)",
      }}
    >
      {/* 상단 바 */}
      <div style={{ padding: "18px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 900, fontSize: 12, letterSpacing: "-0.005em", color: colors.oceanBlue }}>
          그림일기
        </span>
        <span style={{ fontSize: 11, color: colors.ink3, fontWeight: 600 }}>
          2026. 11. 18
        </span>
      </div>

      {/* 일기 카드 (스티커 올라가는 캔버스) */}
      <div style={{ padding: "4px 16px 10px" }}>
        <div
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.line}`,
            borderRadius: 20,
            padding: "18px 18px",
            position: "relative",
            minHeight: 280,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(30,70,140,0.06)",
          }}
        >
          {/* 수채 Critter 우상단 */}
          <div style={{ position: "absolute", top: 8, right: 8, opacity: 0.85 }}>
            <Critter kind={critter} size={72} />
          </div>

          {/* 장소·시간 */}
          <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: "-0.005em", color: colors.oceanBlue }}>
            말라파스쿠아 · 모나드 숄
          </div>

          {/* 본문 (유저 입력 → 손글씨) */}
          <p
            style={{
              fontFamily: "var(--font-gaegu), cursive",
              fontSize: 17,
              lineHeight: 1.55,
              color: colors.ink2,
              margin: "12px 60px 10px 0",
              whiteSpace: "pre-wrap",
              wordBreak: "keep-all",
            }}
          >
            {input || "오늘 뭐 봤어요?"}
          </p>

          {/* 메타 */}
          <div style={{ fontSize: 11, color: colors.ink3, marginTop: 10, fontWeight: 500 }}>
            수온 28°C · 시야 20m · 심도 24m
          </div>

          {/* 배치된 스티커들 */}
          {placed.map((p) => {
            const s = STICKERS.find((st) => st.id === p.stickerId)!;
            return (
              <span
                key={p.key}
                style={{
                  position: "absolute",
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  fontSize: 28,
                  transform: "rotate(-6deg)",
                  textShadow: "0 2px 4px rgba(14,42,92,0.15)",
                  pointerEvents: "none",
                }}
              >
                {s.emoji}
              </span>
            );
          })}
        </div>
      </div>

      {/* 입력 폼 */}
      <div style={{ padding: "4px 16px 10px" }}>
        <div
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.line}`,
            borderRadius: 16,
            padding: "12px 14px",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: "-0.005em", color: colors.ink3, marginBottom: 6 }}>
            오늘 뭐 봤어요?
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="한 줄로 적어주세요"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              color: colors.navy,
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* 스티커 팔레트 */}
      <div style={{ padding: "4px 16px 14px" }}>
        <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: "-0.005em", color: colors.ink3, marginBottom: 8, paddingLeft: 4 }}>
          스티커 탭해서 붙이기
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
          {STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => dropSticker(s)}
              style={{
                aspectRatio: "1",
                borderRadius: 10,
                border: `1px solid ${colors.line}`,
                backgroundColor: colors.white,
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              aria-label={s.label}
            >
              {s.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 저장 버튼 */}
      <div style={{ padding: "4px 16px 24px", marginTop: "auto" }}>
        <button
          type="button"
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            border: "none",
            backgroundColor: colors.navy,
            color: colors.white,
            fontFamily: "var(--font-body)",
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
            letterSpacing: "-0.01em",
          }}
        >
          오늘 일기 저장하기
        </button>
      </div>
    </div>
  );
}
