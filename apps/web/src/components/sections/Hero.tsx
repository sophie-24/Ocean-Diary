import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";

/**
 * 히어로 — Pretendard 통일 (2026-11-18 revised).
 * Fraunces italic 서브헤드 제거. 모든 영문도 Pretendard.
 * 레이아웃 비대칭 유지: 좌상단 아이콘 + 라벨, 중앙 공백, 우하단 서브헤드,
 * 바닥 거대 워드마크, 하단 CTA 바.
 */
export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        backgroundColor: colors.oceanBlue,
        color: colors.white,
        minHeight: "96vh",
        padding: "48px clamp(24px, 6vw, 80px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-25%",
          right: "-10%",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.14), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 20 }}>
        <img
          src="/brand/mola-icon.png"
          alt="Mola"
          width={76}
          height={76}
          style={{
            width: 76,
            height: 76,
            borderRadius: 18,
            boxShadow: "0 12px 28px rgba(14,42,92,0.28)",
          }}
        />
        <div style={{ paddingTop: 8 }}>
          <p style={{ ...type.label, color: colors.sky, margin: 0, opacity: 0.85 }}>
            Mola · 다이빙 그림일기
          </p>
          <p style={{ ...type.caption, color: colors.sky, margin: "6px 0 0", opacity: 0.7 }}>
            2026년 겨울 출시 예정
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 60 }} />

      <div
        style={{
          position: "relative",
          alignSelf: "flex-end",
          maxWidth: 560,
          marginBottom: 32,
          textAlign: "right",
        }}
      >
        <p style={{ ...type.label, color: colors.sky, margin: "0 0 10px", opacity: 0.8 }}>
          수채화 다이빙 다이어리
        </p>
        <p style={{ ...type.lead, color: colors.white, margin: 0, opacity: 0.92 }}>
          다이빙에서 만난 바다 친구들을
          <br />
          수채화 그림일기와 도감으로 남기는 앱.
        </p>
      </div>

      <h1
        style={{
          ...type.display,
          color: colors.white,
          margin: 0,
          textAlign: "left",
          marginBottom: "-0.08em",
        }}
      >
        Mola
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="#signup"
            style={{
              display: "inline-block",
              backgroundColor: colors.white,
              color: colors.navy,
              padding: "18px 30px",
              borderRadius: 999,
              fontFamily: "var(--font-body)",
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: "-0.005em",
              textDecoration: "none",
            }}
          >
            출시 연락받기 →
          </a>
          <a
            href="#experience"
            style={{
              display: "inline-block",
              backgroundColor: "transparent",
              color: colors.white,
              padding: "18px 24px",
              borderRadius: 999,
              border: `1px solid ${colors.sky}`,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: "-0.005em",
              textDecoration: "none",
              opacity: 0.9,
            }}
          >
            먼저 체험해보기
          </a>
        </div>
        <p style={{ ...type.caption, color: colors.sky, margin: 0, opacity: 0.65 }}>
          iOS / Android · 로그인 X · 설치 X
        </p>
      </div>
    </section>
  );
}
