"use client";

import { useState } from "react";
import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";

/**
 * Mola 네이티브 "03 도감" 화면 축약 — 그리드 뷰와 생물 상세의 핵심을
 * 한 폰 안에서 토글하게 재구성.
 *
 * 원본 아트보드: Dogam-Grid.dc.html, Dogam-Detail.dc.html
 */

type Tab = "species" | "sites";

const COLLECTED: { kind: CritterKind; no: string; ko: string; new?: boolean }[] = [
  { kind: "thresher", no: "001", ko: "환도상어", new: true },
  { kind: "mandarin", no: "002", ko: "만다린피쉬", new: true },
  { kind: "whitetip", no: "003", ko: "백기흉상어" },
  { kind: "lionfish", no: "004", ko: "라이온피쉬" },
  { kind: "moray", no: "005", ko: "곰치" },
  { kind: "trevally", no: "006", ko: "트레발리" },
];

const UNCOLLECTED: CritterKind[] = ["hammerhead", "whale", "nurse", "tiger", "boxfish", "pygmy"];

export function DogamGridInApp() {
  const [tab, setTab] = useState<Tab>("species");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: 60,
        background: colors.mist,
        fontFamily: "var(--font-body)",
        color: colors.navy,
      }}
    >
      {/* 상단 */}
      <div
        style={{
          padding: "14px 20px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: colors.oceanBlue,
              letterSpacing: "-0.005em",
            }}
          >
            나의 생물 도감
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", marginTop: 2 }}>
            나의 도감
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconBtn>🔍</IconBtn>
          <IconBtn>🏅</IconBtn>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ padding: "4px 16px 10px", display: "flex", gap: 6 }}>
        <TabBtn active={tab === "species"} onClick={() => setTab("species")}>
          바다 생물 <b style={{ fontWeight: 900 }}>27/181</b>
        </TabBtn>
        <TabBtn active={tab === "sites"} onClick={() => setTab("sites")}>
          명소 스탬프 <b style={{ fontWeight: 900 }}>3/40</b>
        </TabBtn>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, overflow: "hidden", padding: "0 16px 90px" }}>
        {tab === "species" ? <SpeciesBody /> : <SitesBody />}
      </div>

      {/* 하단 TabBar */}
      <AppTabBar active="dogam" />
    </div>
  );
}

function SpeciesBody() {
  return (
    <>
      {/* 진도 카드 */}
      <div
        style={{
          borderRadius: 16,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          padding: 14,
          boxShadow: "0 4px 12px rgba(30,70,140,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: colors.navy }}>
            27<span style={{ fontSize: 13, color: colors.ink3, fontWeight: 700 }}> / 181</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.ink2 }}>
            3종 더 모으면 30종 기념 카드
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            height: 6,
            borderRadius: 999,
            background: colors.ghostBg,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "15%",
              height: "100%",
              background: colors.oceanBlue,
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      {/* 카테고리 */}
      <div
        style={{
          display: "flex",
          gap: 6,
          margin: "12px 0 10px",
          overflowX: "auto",
        }}
      >
        <CategoryChip active>전체 27/181</CategoryChip>
        <CategoryChip>상어 8/15</CategoryChip>
        <CategoryChip>가오리 1/10</CategoryChip>
        <CategoryChip>물고기 12/60</CategoryChip>
      </div>

      {/* 정렬 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: colors.ink3,
          padding: "0 4px 8px",
        }}
      >
        <span style={{ fontWeight: 700 }}>도감 번호순 ↓</span>
        <span>
          미수집도 보기{" "}
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: 4,
              background: colors.oceanBlue,
              verticalAlign: "-2px",
              marginLeft: 4,
            }}
          />
        </span>
      </div>

      {/* 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {COLLECTED.slice(0, 3).map((c) => (
          <SpeciesCell key={c.no} {...c} />
        ))}
        {UNCOLLECTED.slice(0, 3).map((k, i) => (
          <GhostCell key={i} no={(104 + i).toString().padStart(3, "0")} kind={k} />
        ))}
      </div>
    </>
  );
}

function SitesBody() {
  const sites = [
    { name: "가토 섬 동굴", place: "필리핀 · 말라파스쿠아", date: "26.11.02", kind: "cave" as const, got: true },
    { name: "라이트하우스 렉", place: "필리핀 · 말라파스쿠아", date: "26.11.01", kind: "wreck" as const, got: true },
    { name: "수중 성모상", place: "필리핀 · 보홀 바우위우프", date: "25.08.17", kind: "sculpture" as const, got: true },
    { name: "도나 마릴린 렉", place: "필리핀 · 말라파스쿠아", date: "미방문", kind: "wreck" as const, got: false },
    { name: "코론 침몰선", place: "필리핀 · 팔라완 코론", date: "미방문", kind: "wreck" as const, got: false },
    { name: "USAT 리버티", place: "인도네시아 · 발리", date: "미방문", kind: "wreck" as const, got: false },
  ];
  return (
    <>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          background: colors.navy,
          color: colors.white,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>📍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800 }}>가까이에 찍지 않은 스탬프가 있어요</div>
          <div style={{ fontSize: 10, color: "#B9DCFF", marginTop: 2 }}>
            도나 마릴린 렉 · 말라파스쿠아 · 1988년 침몰한 여객선
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {sites.map((s) => (
          <SiteCell key={s.name} {...s} />
        ))}
      </div>
    </>
  );
}

// ---------- subcomponents ----------

function SpeciesCell({ kind, no, ko, new: isNew }: { kind: CritterKind; no: string; ko: string; new?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 16,
        background: colors.white,
        border: `1px solid ${colors.line}`,
        padding: "10px 6px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        boxShadow: "0 4px 12px rgba(30,70,140,0.04)",
        position: "relative",
      }}
    >
      {isNew && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            padding: "2px 5px",
            borderRadius: 999,
            background: colors.coral,
            color: colors.white,
            fontSize: 8,
            fontWeight: 900,
          }}
        >
          NEW
        </span>
      )}
      <div
        style={{
          width: "100%",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Critter kind={kind} size={66} />
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: colors.ink3 }}>No.{no}</div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: colors.navy,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {ko}
      </div>
    </div>
  );
}

function GhostCell({ no, kind }: { no: string; kind: CritterKind }) {
  return (
    <div
      style={{
        borderRadius: 16,
        background: colors.ghostBg,
        border: `1px dashed ${colors.ghostLine}`,
        padding: "10px 6px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}
      >
        <Critter kind={kind} size={66} />
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: colors.ghostInk }}>No.{no}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: colors.ghostInk }}>???</div>
    </div>
  );
}

function SiteCell({
  name,
  place,
  date,
  got,
}: {
  name: string;
  place: string;
  date: string;
  kind: "wreck" | "cave" | "sculpture";
  got: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        background: got ? colors.white : colors.ghostBg,
        border: `1px ${got ? "solid" : "dashed"} ${got ? colors.line : colors.ghostLine}`,
        padding: 10,
        boxShadow: got ? "0 4px 12px rgba(30,70,140,0.05)" : "none",
        position: "relative",
      }}
    >
      {got && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "2px 6px",
            borderRadius: 999,
            background: colors.sunny,
            color: colors.navy,
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "-0.005em",
          }}
        >
          {date}
        </span>
      )}
      <div
        style={{
          width: "100%",
          height: 60,
          borderRadius: 10,
          background: got
            ? "radial-gradient(circle at 30% 30%, #2F6FDB 0%, #0E2A5C 100%)"
            : colors.ghostBg,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: got ? colors.white : colors.ghostInk,
          fontSize: 10,
          fontWeight: 800,
        }}
      >
        {got ? "🏛️" : "??"}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: got ? colors.navy : colors.ghostInk,
          lineHeight: 1.2,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 9,
          color: got ? colors.ink3 : colors.ghostInk,
          marginTop: 2,
        }}
      >
        {place}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 36,
        borderRadius: 12,
        border: `1px solid ${active ? colors.navy : colors.line}`,
        background: active ? colors.navy : colors.white,
        color: active ? colors.white : colors.ink2,
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function CategoryChip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        height: 28,
        padding: "0 10px",
        borderRadius: 999,
        background: active ? colors.navy : colors.white,
        color: active ? colors.white : colors.ink2,
        border: `1px solid ${active ? colors.navy : colors.line}`,
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        background: colors.white,
        border: `1px solid ${colors.line}`,
        color: colors.navy,
        fontFamily: "inherit",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function AppTabBar({ active }: { active: "home" | "dogam" | "discover" | "log" | "sea" }) {
  const tabs: { k: typeof active; icon: string; label: string }[] = [
    { k: "home", icon: "🏠", label: "홈" },
    { k: "dogam", icon: "📘", label: "도감" },
    { k: "discover", icon: "📷", label: "발견" },
    { k: "log", icon: "📝", label: "로그북" },
    { k: "sea", icon: "🫧", label: "나의 바다" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 84,
        background: colors.white,
        borderTop: `1px solid ${colors.line}`,
        display: "flex",
        padding: "10px 8px 24px",
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.k}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: t.k === active ? colors.oceanBlue : colors.ink3,
          }}
        >
          <span style={{ fontSize: 18, opacity: t.k === active ? 1 : 0.6 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: t.k === active ? 900 : 600 }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
