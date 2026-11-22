import type { Destination } from "@/data/destinations";
import { SPECIES_LABEL } from "@/data/illustrations";
import { Critter } from "@/components/Critter";
import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";

/**
 * "오늘의 다이빙" 카드.
 * Experience 블록 내부에서 쓰는 하위 컴포넌트. 비대칭: 좌정렬, 라벨/본문
 * 자간·행간 변주로 균일성 깨기.
 */
export function TodaySpot({ destination }: { destination: Destination }) {
  const {
    nameKo,
    nameEn,
    country,
    accessFromKorea,
    bestSeasons,
    waterTempC,
    level,
    signatureSpecies,
    vibe,
    tip,
  } = destination;

  return (
    <article
      style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.line}`,
        borderRadius: 28,
        boxShadow: "0 4px 12px rgba(30,70,140,0.06)",
        overflow: "hidden",
      }}
    >
      {/* 상단: 라벨 + 지명 */}
      <header style={{ padding: "28px 28px 8px" }}>
        <p style={{ ...type.label, color: colors.oceanBlue, margin: 0 }}>
          오늘은
        </p>
        <h3
          style={{
            ...type.h2,
            color: colors.navy,
            margin: "10px 0 4px",
            fontSize: 36,
            lineHeight: 1.12,
          }}
        >
          {nameKo}
        </h3>
        <p
          style={{
            ...type.label,
            color: colors.ink3,
            margin: "6px 0 0",
          }}
        >
          {nameEn} · {country}
        </p>
      </header>

      {/* 분위기 — 손글씨 */}
      <div style={{ padding: "16px 28px 4px" }}>
        <p
          style={{
            fontFamily: "var(--font-gaegu), cursive",
            fontSize: 20,
            lineHeight: 1.5,
            color: colors.ink2,
            margin: 0,
          }}
        >
          {vibe}
        </p>
      </div>

      {/* 팩트 3x1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          padding: "18px 28px 0",
        }}
      >
        <Fact label="시즌" value={bestSeasons.join(" · ")} />
        <Fact label="수온" value={`${waterTempC}°C`} />
        <Fact label="난이도" value={level} />
      </div>

      {/* 접근성 */}
      <div style={{ padding: "16px 28px 0" }}>
        <section
          style={{
            backgroundColor: colors.ghostBg,
            border: `1px solid ${colors.line}`,
            borderRadius: 16,
            padding: "14px 16px",
          }}
        >
          <p style={{ ...type.label, color: colors.ink3, margin: 0, fontSize: 11 }}>
            한국에서
          </p>
          <p style={{ ...type.body, color: colors.navy, margin: "4px 0 0", fontSize: 15 }}>
            {accessFromKorea}
          </p>
        </section>
      </div>

      {/* 시그니처 생물 */}
      <section style={{ padding: "22px 28px 0" }}>
        <p style={{ ...type.label, color: colors.ink3, margin: 0, fontSize: 11 }}>
          만나는 친구들
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          {signatureSpecies.map((kind) => (
            <div
              key={kind}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 88,
                gap: 6,
              }}
            >
              <Critter kind={kind} size={74} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  lineHeight: 1.3,
                  letterSpacing: "-0.005em",
                  color: colors.ink2,
                  textAlign: "center",
                  display: "block",
                }}
              >
                {SPECIES_LABEL[kind]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 팁 */}
      <div style={{ padding: "20px 28px 0" }}>
        <div
          style={{
            backgroundColor: colors.ghostBg,
            borderLeft: `3px solid ${colors.sunny}`,
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <p style={{ ...type.label, color: colors.ink3, margin: 0, fontSize: 11 }}>
            살짝 팁
          </p>
          <p style={{ ...type.body, color: colors.ink2, margin: "4px 0 0", fontSize: 14.5 }}>
            {tip}
          </p>
        </div>
      </div>

      <footer style={{ padding: "24px 28px 26px" }}>
        <a
          href="#signup"
          style={{
            display: "block",
            textAlign: "center",
            backgroundColor: colors.navy,
            color: colors.white,
            padding: "15px 18px",
            borderRadius: 14,
            textDecoration: "none",
            fontFamily: "var(--font-body)",
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: "-0.005em",
          }}
        >
          Mola 출시되면 알려주세요 →
        </a>
      </footer>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: colors.ghostBg,
        border: `1px solid ${colors.line}`,
        borderRadius: 14,
        padding: "10px 8px",
        textAlign: "center",
      }}
    >
      <p style={{ ...type.label, color: colors.ink3, margin: 0, fontSize: 10, letterSpacing: "-0.005em" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 800,
          fontSize: 14,
          color: colors.navy,
          margin: "4px 0 0",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </p>
    </div>
  );
}
