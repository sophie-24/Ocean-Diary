"use client";

import { useState } from "react";
import { colors } from "@/theme/tokens";

/**
 * 폰 스크린 안의 Mola 네이티브 앱 "새 다이빙 기록" 화면 축약 버전.
 * 실제 아트보드(Log-Form.dc.html)의 핵심만 추려 390×844에 맞게 재구성.
 *
 * 세 가지 탭(스쿠버 / 프리다이빙 / 스노클링)을 전환 가능 — "스노클링도
 * 두세 줄로 간단히 기록된다"는 걸 실제로 눌러보게 하는 게 포인트.
 */

type Mode = "scuba" | "free" | "snorkel";

export function LogFormInApp() {
  const [mode, setMode] = useState<Mode>("scuba");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: 60,
        backgroundColor: colors.mist,
        fontFamily: "var(--font-body)",
        color: colors.navy,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "14px 20px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.ink2 }}>
          취소
        </span>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 900 }}>새 다이빙 기록</div>
          <div style={{ fontSize: 10, color: colors.ink3, marginTop: 2 }}>
            30초면 돼요
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.oceanBlue }}>
          임시 저장
        </span>
      </div>

      {/* 모드 선택 */}
      <div style={{ padding: "8px 16px 12px", display: "flex", gap: 6 }}>
        {(
          [
            { v: "scuba", label: "스쿠버" },
            { v: "free", label: "프리다이빙" },
            { v: "snorkel", label: "스노클링" },
          ] as { v: Mode; label: string }[]
        ).map((m) => (
          <button
            key={m.v}
            onClick={() => setMode(m.v)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 14,
              border: "none",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              background: mode === m.v ? colors.navy : colors.white,
              color: mode === m.v ? colors.white : colors.ink2,
              boxShadow:
                mode === m.v
                  ? "0 4px 10px rgba(14,42,92,0.18)"
                  : `inset 0 0 0 1px ${colors.line}`,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0 16px 90px",
        }}
      >
        {mode === "scuba" && <ScubaBody />}
        {mode === "free" && <FreeBody />}
        {mode === "snorkel" && <SnorkelBody />}
      </div>

      {/* 하단 저장 영역 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 84,
          background: colors.white,
          borderTop: `1px solid ${colors.line}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
        }}
      >
        <button
          type="button"
          style={{
            flex: 0.4,
            height: 48,
            borderRadius: 14,
            background: colors.white,
            border: `1.5px solid ${colors.line}`,
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 800,
            color: colors.ink2,
            cursor: "pointer",
          }}
        >
          로그만 저장
        </button>
        <button
          type="button"
          style={{
            flex: 0.6,
            height: 48,
            borderRadius: 14,
            background: colors.oceanBlue,
            border: "none",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 900,
            color: colors.white,
            cursor: "pointer",
          }}
        >
          저장하고 그림일기 쓰기 ›
        </button>
      </div>
    </div>
  );
}

function ScubaBody() {
  return (
    <>
      <SectionLabel>기본 정보 <Required>필수 3개</Required></SectionLabel>

      <div
        style={{
          borderRadius: 18,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          padding: 14,
          boxShadow: "0 4px 12px rgba(30,70,140,0.05)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: colors.sky,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: colors.oceanBlue,
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "-0.005em" }}>
              다이브 No.
            </span>
            <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>39</span>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="날짜">2026. 11. 4 (수)</FormField>
            <div style={{ height: 8 }} />
            <FormField label="지역">필리핀 · 세부 말라파스쿠아</FormField>
          </div>
        </div>
        <div style={{ height: 10 }} />
        <FormField label="포인트">가토 섬</FormField>
      </div>

      <SectionLabel style={{ marginTop: 18 }}>수면 · 수중 기록</SectionLabel>

      <div
        style={{
          borderRadius: 18,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          padding: 14,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniStat label="입수" value="09:12" />
          <MiniStat label="출수" value="09:58" />
          <MiniStat label="평균 수심" value="14.2 m" />
          <MiniStat label="최대 수심" value="21.6 m" />
          <MiniStat label="수온" value="27 °C" />
          <MiniStat label="시야" value="12 m" />
        </div>
      </div>

      <SectionLabel style={{ marginTop: 18 }}>장비 · 환경</SectionLabel>
      <ChipRow chips={["슈트 3mm", "웨이트 4kg", "탱크 11.1 L", "나이트록스 32%", "약한 조류"]} />
    </>
  );
}

function FreeBody() {
  return (
    <>
      <SectionLabel>기본 정보</SectionLabel>
      <div
        style={{
          borderRadius: 18,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          padding: 14,
        }}
      >
        <FormField label="세션">#12 · 수트 · 라인 세션</FormField>
        <div style={{ height: 10 }} />
        <FormField label="장소">필리핀 · 바운티 비치</FormField>
        <div style={{ height: 10 }} />
        <FormField label="종목">CWT · 바이핀 / FIM · 프리 이머전</FormField>
      </div>

      <SectionLabel style={{ marginTop: 18 }}>다이브별 수심</SectionLabel>
      <div
        style={{
          borderRadius: 18,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          padding: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>
          {[6, 8, 10, 11, 13, 16, 14, 15, 18, 12, 10, 6].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${(h / 18) * 100}%`,
                borderRadius: "6px 6px 0 0",
                background: i === 8 ? colors.oceanBlue : colors.sky,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: colors.ink3,
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>최고 18.4 m · 다이브 10</span>
          <span style={{ color: colors.oceanBlue, fontWeight: 800 }}>
            시간 1:12
          </span>
        </div>
      </div>
    </>
  );
}

function SnorkelBody() {
  return (
    <>
      <div
        style={{
          borderRadius: 20,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          padding: 18,
          boxShadow: "0 4px 12px rgba(30,70,140,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: colors.oceanBlue,
            letterSpacing: "-0.005em",
            marginBottom: 10,
          }}
        >
          한 번씩만 톡
        </div>

        <FormField label="날짜">2026. 11. 03 (화)</FormField>
        <div style={{ height: 10 }} />
        <FormField label="지역">필리핀 · 말라파스쿠아</FormField>
        <div style={{ height: 10 }} />
        <FormField label="포인트">바운티 비치</FormField>

        <div
          style={{
            marginTop: 16,
            borderRadius: 14,
            background: colors.ghostBg,
            padding: 12,
            fontSize: 12,
            color: colors.ink2,
            lineHeight: 1.5,
          }}
        >
          만난 친구 <span style={{ fontWeight: 800, color: colors.navy }}>+ 사진으로 찾기</span>
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: colors.white,
              border: `1px dashed ${colors.ghostLine}`,
              fontSize: 12,
              color: colors.ink3,
            }}
          >
            한 줄 메모 (예: 보트 기다리다 거북이 봤다)
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 11,
            color: colors.ink3,
            lineHeight: 1.5,
          }}
        >
          스노클링은 수심·시간·장비를 묻지 않아요. 다이브 번호도 붙지 않고, S1·S2…로 따로 쌓여요.
        </div>
      </div>
    </>
  );
}

// ---------- subcomponents ----------

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: colors.ink2,
        letterSpacing: "-0.005em",
        margin: "4px 2px 10px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Required({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: colors.coral,
        background: "#FDE8E4",
        borderRadius: 999,
        padding: "2px 8px",
        letterSpacing: 0,
        textTransform: "none",
      }}
    >
      {children}
    </span>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: colors.ink3, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          height: 36,
          borderRadius: 10,
          background: colors.ghostBg,
          border: `1px solid ${colors.line}`,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          fontSize: 12.5,
          fontWeight: 600,
          color: colors.navy,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: colors.ghostBg,
        border: `1px solid ${colors.line}`,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 10, color: colors.ink3, fontWeight: 700 }}>{label}</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: colors.navy,
          marginTop: 2,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ChipRow({ chips }: { chips: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "2px 2px",
      }}
    >
      {chips.map((c) => (
        <span
          key={c}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: colors.oceanBlue,
            background: colors.sky,
            borderRadius: 999,
            padding: "6px 12px",
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}
