"use client";

import { useState } from "react";
import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";

/**
 * Mola 네이티브 "발견" 플로우 축약 — 4단계 (Select → Analyzing → Result → Collected)를
 * 하단 pager로 전환하며 한 폰 안에서 전부 체험할 수 있게 재구성했다.
 *
 * 아트보드 원본:
 *   Discover-Select.dc.html, Discover-Analyzing.dc.html,
 *   Discover-Result.dc.html, Discover-Collected.dc.html
 */

type Step = 0 | 1 | 2 | 3;
const STEPS = [
  { id: "select", label: "미디어" },
  { id: "analyze", label: "분석" },
  { id: "result", label: "식별" },
  { id: "collect", label: "수집" },
] as const;

export function DiscoverInApp() {
  const [step, setStep] = useState<Step>(0);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: 60,
        background: "#0E2A5C",
        color: colors.white,
        fontFamily: "var(--font-body)",
      }}
    >
      {/* 상단 바 */}
      <div
        style={{
          padding: "14px 20px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          ×
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#B9DCFF",
            letterSpacing: "-0.005em",
          }}
        >
          02 발견 · {STEPS[step].label}
        </div>
        <div style={{ width: 30 }} />
      </div>

      {/* step body */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {step === 0 && <SelectStep />}
        {step === 1 && <AnalyzingStep />}
        {step === 2 && <ResultStep />}
        {step === 3 && <CollectedStep />}
      </div>

      {/* 하단 페이저 */}
      <div
        style={{
          padding: "14px 16px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={() => setStep((Math.max(0, step - 1) as Step))}
          disabled={step === 0}
          style={{
            width: 72,
            height: 36,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent",
            color: colors.white,
            fontSize: 12,
            fontWeight: 700,
            cursor: step === 0 ? "default" : "pointer",
            opacity: step === 0 ? 0.35 : 1,
          }}
        >
          ← 이전
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              onClick={() => setStep(i as Step)}
              style={{
                width: i === step ? 22 : 6,
                height: 6,
                borderRadius: 999,
                background:
                  i === step ? "#6FA3EC" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "width 160ms ease",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setStep((Math.min(3, step + 1) as Step))}
          disabled={step === 3}
          style={{
            width: 72,
            height: 36,
            borderRadius: 999,
            border: "none",
            background: step === 3 ? "rgba(255,255,255,0.1)" : "#2F6FDB",
            color: colors.white,
            fontSize: 12,
            fontWeight: 800,
            cursor: step === 3 ? "default" : "pointer",
            opacity: step === 3 ? 0.4 : 1,
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

// ---------- step 1: Select ----------

function SelectStep() {
  const tiles = [
    { kind: "thresher" as const, checked: true, no: 1 },
    { kind: "thresher" as const, checked: true, no: 2 },
    { kind: "trevally" as const, checked: false, no: null },
    { kind: "hammerhead" as const, checked: false, no: null },
    { kind: "nurse" as const, checked: false, no: null },
    { kind: "puffer" as const, checked: false, no: null },
  ];
  return (
    <div style={{ padding: "8px 16px 0", color: colors.white }}>
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.08)",
          fontSize: 11,
          fontWeight: 600,
          color: "#CFE0F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        📅 날짜·위치로 다이빙을 찾아 자동 연결해요
      </div>

      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
        11월 2일 (월) · 말라파스쿠아 모나드 숄 <span style={{ color: "#8EC5FF" }}>· 다이빙 #38</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: t.checked
                ? "2px solid #6FA3EC"
                : "1px solid rgba(255,255,255,0.12)",
              padding: 10,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "80%", height: "80%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Critter kind={t.kind} size={70} />
            </div>
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 20,
                height: 20,
                borderRadius: 10,
                background: t.checked ? "#2F6FDB" : "rgba(255,255,255,0.12)",
                color: colors.white,
                fontSize: 11,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: t.checked ? "none" : "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {t.no ?? ""}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          fontWeight: 700,
          color: "#CFE0F7",
        }}
      >
        <span>
          <b style={{ color: "#FFFFFF", fontWeight: 900 }}>2개 선택됨</b> · 영상은 한 개당 최대 60초까지 분석
        </span>
      </div>

      <button
        type="button"
        style={{
          width: "100%",
          marginTop: 12,
          height: 50,
          borderRadius: 14,
          background: "#2F6FDB",
          border: "none",
          color: colors.white,
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        🔍 AI로 바닷속 친구 찾기
      </button>
    </div>
  );
}

// ---------- step 2: Analyzing ----------

function AnalyzingStep() {
  return (
    <div
      style={{
        padding: "0 16px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* fake video card */}
      <div
        style={{
          width: 240,
          height: 150,
          borderRadius: 18,
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          position: "relative",
          padding: 10,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Critter kind="thresher" size={140} />
        </div>
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            fontSize: 10,
            fontWeight: 700,
            color: "#B9DCFF",
          }}
        >
          11.02 모나드 숄 · 영상 0:32
        </span>
      </div>

      {/* submarine */}
      <div
        style={{
          width: 72,
          height: 72,
          marginBottom: 16,
          animation: "diveBob 2.5s ease-in-out infinite",
          transformOrigin: "center",
        }}
      >
        <svg viewBox="0 0 72 72">
          <ellipse cx="36" cy="38" rx="28" ry="14" fill="#F7C948" />
          <circle cx="36" cy="38" r="7" fill="#DCEBFC" stroke="#16285A" strokeWidth="1.2" />
          <path d="M36 24 L36 18 M32 18 L40 18" stroke="#16285A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="38" r="3" fill="#C8432F" />
          <path d="M8 38 Q4 36 4 42" stroke="#16285A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <style>{`@keyframes diveBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(2deg)}}`}</style>

      <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>
        AI가 바닷속 친구를 찾고 있어요…
      </div>
      <div style={{ fontSize: 12, color: "#B9DCFF", marginBottom: 20 }}>
        영상 0:32 중 <b style={{ color: "#FFFFFF" }}>0:14 구간</b>을 살펴보는 중
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 300,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          height: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "64%",
            height: "100%",
            background: "linear-gradient(90deg, #2F6FDB, #6FA3EC)",
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "#CFE0F7", marginTop: 8 }}>64% · 다 되면 알려드려요</div>
    </div>
  );
}

// ---------- step 3: Result ----------

function ResultStep() {
  return (
    <div style={{ padding: "0 16px", color: colors.white }}>
      <div
        style={{
          borderRadius: 18,
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid #F7C948",
          padding: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Critter kind="thresher" size={160} />
      </div>
      <div
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: "#F7C948",
          color: colors.navy,
          fontSize: 12,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        환도상어 · 96%
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#B9DCFF", marginBottom: 10 }}>
        이 친구가 맞나요?
      </div>

      <RankCard
        rank={1}
        name="환도상어"
        latin="Alopias pelagicus"
        pct="96%"
        note="도감에 없는 친구예요 · 첫 만남이 돼요"
        selected
      />
      <div style={{ height: 8 }} />
      <RankCard
        rank={2}
        name="백기흉상어"
        latin="Triaenodon obesus"
        pct="21%"
        note="꼬리 윗부분이 흉등만큼 긴다른 환도상어예요"
      />

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          type="button"
          style={{
            flex: 0.4,
            height: 44,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent",
            color: colors.white,
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          아니에요
        </button>
        <button
          type="button"
          style={{
            flex: 0.6,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: colors.white,
            color: colors.navy,
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          ✓ 이 생물이 맞아요
        </button>
      </div>
    </div>
  );
}

function RankCard({ rank, name, latin, pct, note, selected = false }: {
  rank: number;
  name: string;
  latin: string;
  pct: string;
  note: string;
  selected?: boolean;
}) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 14,
        background: selected ? "rgba(47,111,219,0.2)" : "rgba(255,255,255,0.05)",
        border: `1.5px solid ${selected ? "#6FA3EC" : "rgba(255,255,255,0.14)"}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Critter kind={rank === 1 ? "thresher" : "whitetip"} size={44} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#B9DCFF" }}>
          {rank}순위 {name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>
          {latin}
        </div>
        <div style={{ fontSize: 10, color: "#CFE0F7", marginTop: 2 }}>{note}</div>
      </div>
      <div
        style={{
          width: 44,
          textAlign: "right",
          fontSize: 16,
          fontWeight: 900,
          color: selected ? "#FFFFFF" : "#B9DCFF",
        }}
      >
        {pct}
      </div>
    </div>
  );
}

// ---------- step 4: Collected ----------

function CollectedStep() {
  return (
    <div
      style={{
        padding: "0 16px",
        color: colors.white,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "#B9DCFF", letterSpacing: "-0.005em" }}>
        나의 생물 도감 · NO.007
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", marginTop: 4 }}>
        도감의 22번째 친구가 생겼어요! ✨
      </div>

      <div
        style={{
          marginTop: 14,
          borderRadius: 20,
          background: colors.white,
          color: colors.navy,
          padding: "18px 16px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Critter kind="thresher" size={160} />
        </div>

        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            padding: "6px 10px",
            borderRadius: 999,
            background: colors.coral,
            color: colors.white,
            fontSize: 10,
            fontWeight: 900,
            transform: "rotate(10deg)",
          }}
        >
          NEW ENCOUNTER!
        </div>

        <div
          style={{
            marginTop: 8,
            padding: "6px 14px",
            borderRadius: 999,
            border: `2px solid ${colors.pillLine}`,
            display: "inline-block",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          환도상어 <span style={{ color: colors.ink3, fontStyle: "italic", fontWeight: 600 }}>Thresher · Alopias pelagicus</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginTop: 12,
            fontSize: 11,
          }}
        >
          <Meta label="날짜" value="2026.11.02" />
          <Meta label="포인트" value="모나드 숄" />
          <Meta label="수심" value="24m" />
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(247,201,72,0.15)",
          border: "1px solid rgba(247,201,72,0.5)",
          color: "#F7C948",
          fontSize: 12,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>🏅 아시아 탐험가까지 3종!</span>
        <span>17 / 20</span>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.08)",
          fontSize: 12,
          fontWeight: 700,
          color: "#CFE0F7",
          marginBottom: 10,
        }}
      >
        🫧 나의 바다에 새 친구가 헤엄쳐 들어왔어요 ›
      </div>
      <button
        type="button"
        style={{
          height: 48,
          borderRadius: 14,
          background: "#2F6FDB",
          border: "none",
          color: colors.white,
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        그림일기에 스티커로 붙이기
      </button>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        background: colors.ghostBg,
        padding: "8px 10px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, color: colors.ink3 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 900, color: colors.navy, marginTop: 2 }}>{value}</div>
    </div>
  );
}
