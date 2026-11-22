import type { Destination } from "@/data/destinations";
import { SPECIES_LABEL } from "@/data/illustrations";
import { Critter } from "@/components/Critter";
import { colors } from "@/theme/tokens";

/**
 * 폰 스크린 안에 들어가는 Mola 네이티브 앱의 "오늘의 다이빙" 화면.
 * 네이티브 앱의 실제 Home/SeaMap 디자인(apps/mobile/src/features/sea/*)과
 * 같은 색 토큰·그리드 리듬·Txt 사이즈 체계를 사용한다. 화면 캡처 대신
 * 네이티브와 동일한 소스로 다시 그려서 "진짜 앱 같이" 느껴지게.
 */
export function TodayInApp({ destination }: { destination: Destination }) {
  const { nameKo, nameEn, country, bestSeasons, waterTempC, level, signatureSpecies, vibe, tip } = destination;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: 60, // Dynamic Island 비켜주기
        backgroundColor: colors.mist,
        fontFamily: "var(--font-body)",
      }}
    >
      {/* 상단 바 (Mola 네이티브 홈의 헤더 톤) */}
      <div style={{ padding: "18px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 900, fontSize: 12, letterSpacing: "-0.005em", color: colors.oceanBlue }}>
          MOLA · 오늘의 바다
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.oceanBlue,
            color: colors.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          S
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflow: "hidden", padding: "4px 16px 0" }}>
        {/* 메인 카드 — 오늘의 다이빙 */}
        <article
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.line}`,
            borderRadius: 22,
            padding: "20px 20px 22px",
            boxShadow: "0 4px 12px rgba(30,70,140,0.06)",
          }}
        >
          <p style={{ fontWeight: 800, fontSize: 11, letterSpacing: "-0.005em", color: colors.oceanBlue, margin: 0 }}>
            오늘은
          </p>
          <h3 style={{ fontWeight: 900, fontSize: 28, lineHeight: 1.12, letterSpacing: "-0.025em", color: colors.navy, margin: "6px 0 4px" }}>
            {nameKo}
          </h3>
          <p style={{ fontSize: 12.5, color: colors.ink3, margin: 0 }}>
            {nameEn} · {country}
          </p>
          <p
            style={{
              fontFamily: "var(--font-gaegu), cursive",
              fontSize: 15,
              lineHeight: 1.45,
              color: colors.ink2,
              margin: "14px 0 0",
            }}
          >
            {vibe}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 14 }}>
            <MiniFact label="시즌" value={bestSeasons[0]} />
            <MiniFact label="수온" value={`${waterTempC}°C`} />
            <MiniFact label="난이도" value={level} />
          </div>
        </article>

        {/* 만나는 친구들 */}
        <div style={{ marginTop: 14 }}>
          <p style={{ fontWeight: 800, fontSize: 10, letterSpacing: "-0.005em", color: colors.ink3, margin: "0 0 10px 4px" }}>
            만나는 친구들
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {signatureSpecies.slice(0, 4).map((kind) => (
              <div
                key={kind}
                style={{
                  width: 76,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 16,
                  padding: "10px 6px 8px",
                  textAlign: "center",
                }}
              >
                <Critter kind={kind} size={48} />
                <div style={{ fontSize: 10, color: colors.ink2, marginTop: 4, fontWeight: 500 }}>
                  {SPECIES_LABEL[kind]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 */}
        <div
          style={{
            marginTop: 14,
            backgroundColor: colors.ghostBg,
            borderLeft: `3px solid ${colors.sunny}`,
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <p style={{ fontWeight: 800, fontSize: 10, letterSpacing: "-0.005em", color: colors.ink3, margin: 0 }}>
            살짝 팁
          </p>
          <p style={{ fontSize: 12.5, color: colors.ink2, margin: "4px 0 0", lineHeight: 1.5 }}>
            {tip}
          </p>
        </div>
      </div>

      {/* 하단 탭바 (Mola 네이티브 TabBar 톤) */}
      <TabBar activeTab="sea" />
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: colors.ghostBg,
        border: `1px solid ${colors.line}`,
        borderRadius: 10,
        padding: "8px 4px",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 9, letterSpacing: "-0.005em", color: colors.ink3 }}>
        {label}
      </div>
      <div style={{ fontWeight: 800, fontSize: 11.5, color: colors.navy, marginTop: 2, letterSpacing: "-0.01em" }}>
        {value}
      </div>
    </div>
  );
}

function TabBar({ activeTab }: { activeTab: "home" | "dogam" | "discover" | "log" | "sea" }) {
  const tabs = [
    { key: "home", label: "홈" },
    { key: "dogam", label: "도감" },
    { key: "discover", label: "발견" },
    { key: "log", label: "로그북" },
    { key: "sea", label: "나의 바다" },
  ] as const;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 28px",
        borderTop: `1px solid ${colors.line}`,
        backgroundColor: colors.white,
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.key}
          style={{
            fontSize: 10,
            fontWeight: t.key === activeTab ? 800 : 500,
            color: t.key === activeTab ? colors.navy : colors.ghostInk,
            letterSpacing: "-0.01em",
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
