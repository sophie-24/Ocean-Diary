import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";

/**
 * 폰 스크린 안의 Mola "대양 수조" (Sea-Ocean) 화면.
 * 설계서의 Sea-Ocean.dc.html 느낌을 단순화 — 심해 톤에 큰 유영 생물
 * 서너 마리가 slow drift.
 *
 * 변경점 (2026-11-19): drift 애니메이션을 Sea-Place의 odCruise 공식으로
 * 통일. 반환 지점에서 생물이 중간 90°를 거쳐 돌아보기 때문에 2D 좌우반전
 * 느낌이 사라지고, perspective + scale 변화로 "가까이 왔다 멀어지는"
 * 3D-ish 결까지 살아요.
 */

export function OceanInApp() {
  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        paddingTop: 60,
        background:
          "linear-gradient(180deg, #2E6FC8 0%, #174A9E 40%, #0C2E70 78%, #061A45 100%)",
        color: colors.white,
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Sea-Place 아트보드의 odCruise 공식. --dx = travel distance (음수 = R→L). */}
      <style>{`
        @keyframes odCruise {
          0%   { transform: perspective(800px) translate3d(0px,-6px,0) rotateZ(0deg) scale(.88) rotateY(180deg); filter: brightness(.88) drop-shadow(0 6px 4px rgba(0,10,30,.14)); }
          40%  { transform: perspective(800px) translate3d(calc(var(--dx) * .94),-8px,0) rotateZ(0deg) scale(.88) rotateY(180deg); filter: brightness(.88) drop-shadow(0 6px 4px rgba(0,10,30,.14)); }
          46%  { transform: perspective(800px) translate3d(calc(var(--dx) * 1.06),0px,0) rotateZ(-7deg) scale(.97) rotateY(90deg); filter: brightness(.7) drop-shadow(0 9px 6px rgba(0,10,30,.2)); }
          52%  { transform: perspective(800px) translate3d(var(--dx),8px,0) rotateZ(0deg) scale(1.06) rotateY(0deg); filter: brightness(1.05) drop-shadow(0 14px 8px rgba(0,10,30,.3)); }
          89%  { transform: perspective(800px) translate3d(calc(var(--dx) * .06),8px,0) rotateZ(0deg) scale(1.06) rotateY(0deg); filter: brightness(1.05) drop-shadow(0 14px 8px rgba(0,10,30,.3)); }
          95%  { transform: perspective(800px) translate3d(calc(var(--dx) * -.06),0px,0) rotateZ(7deg) scale(.97) rotateY(-90deg); filter: brightness(.7) drop-shadow(0 9px 6px rgba(0,10,30,.2)); }
          100% { transform: perspective(800px) translate3d(0px,-6px,0) rotateZ(0deg) scale(.88) rotateY(-180deg); filter: brightness(.88) drop-shadow(0 6px 4px rgba(0,10,30,.14)); }
        }
        @keyframes oiRays { 0%,100% { opacity:.4 } 50% { opacity:.75 } }
        @keyframes oiBob  { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes oiBubble {
          0%   { transform: translateY(0) scale(.5); opacity: 0; }
          15%  { opacity: .8; }
          100% { transform: translateY(-640px) scale(1.3); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="odCruise"], [style*="oiRays"], [style*="oiBob"], [style*="oiBubble"] {
            animation: none !important;
          }
        }
      `}</style>

      {/* ambient rays */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(104deg, transparent 20%, rgba(255,255,255,0.08) 32%, transparent 40%, transparent 55%, rgba(255,255,255,0.06) 64%, transparent 72%)",
          animation: "oiRays 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* HUD top */}
      <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            flex: 1,
            padding: "8px 14px",
            borderRadius: 16,
            background: "rgba(8,24,58,0.55)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(169,210,255,0.22)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "-0.005em", color: "#8EC5FF" }}>
            나의 바다
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>대양 수조</div>
          <div style={{ fontSize: 10, color: "#CFE0F7", marginTop: 1 }}>
            깊은 바다 · 생물 4 · 수심 40m
          </div>
        </div>
        <TankSwitcher active="ocean" />
      </div>

      {/* Drifting critters — odCruise 공식. --dx 로 방향·거리 설정. */}
      <div
        aria-label="whale shark"
        style={{
          position: "absolute",
          top: 190,
          left: -40,
          animation: "odCruise 42s ease-in-out infinite",
          opacity: 0.88,
          ["--dx" as never]: "470px",
        }}
      >
        <div style={{ animation: "oiBob 5s ease-in-out infinite" }}>
          <Critter kind="whale" size={260} />
        </div>
      </div>

      <div
        aria-label="thresher"
        style={{
          position: "absolute",
          top: 390,
          left: 230,
          animation: "odCruise 32s ease-in-out -8s infinite",
          opacity: 0.95,
          ["--dx" as never]: "-360px",
        }}
      >
        <div style={{ animation: "oiBob 4.5s ease-in-out infinite" }}>
          <Critter kind="thresher" size={200} />
        </div>
      </div>

      <div
        aria-label="hammerhead"
        style={{
          position: "absolute",
          top: 540,
          left: -30,
          animation: "odCruise 36s ease-in-out -14s infinite",
          opacity: 0.85,
          ["--dx" as never]: "430px",
        }}
      >
        <div style={{ animation: "oiBob 4s ease-in-out infinite" }}>
          <Critter kind="hammerhead" size={180} />
        </div>
      </div>

      {/* bubbles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: `${15 + i * 18}%`,
            bottom: 90,
            width: 6 + (i % 3) * 2,
            height: 6 + (i % 3) * 2,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.7)",
            animation: `oiBubble ${7 + (i % 4) * 2}s linear infinite`,
            animationDelay: `-${i * 1.4}s`,
          }}
        />
      ))}

      {/* bottom plaque hint */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 100,
          padding: "12px 14px",
          borderRadius: 18,
          background: "rgba(6,20,50,0.65)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(169,210,255,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
        }}
      >
        <span style={{ fontSize: 16 }}>👆</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>생물을 톡 — 명판이 떠요</div>
          <div style={{ fontSize: 10, color: "#CFE0F7", marginTop: 2 }}>
            만난 날짜 · 포인트 · 그날 로그
          </div>
        </div>
        <button
          type="button"
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: colors.white,
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          감상 모드
        </button>
      </div>

      <DarkTabBar active="sea" />
    </div>
  );
}

function TankSwitcher({ active }: { active: "ocean" | "coral" | "macro" }) {
  const tabs = [
    { k: "ocean", icon: "🌊" },
    { k: "coral", icon: "🪸" },
    { k: "macro", icon: "🔍" },
  ] as const;
  return (
    <div
      style={{
        display: "flex",
        padding: 3,
        borderRadius: 999,
        background: "rgba(8,24,58,0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(169,210,255,0.22)",
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.k}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: t.k === active ? "rgba(255,255,255,0.9)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            filter: t.k === active ? "none" : "grayscale(0.8)",
          }}
        >
          {t.icon}
        </div>
      ))}
    </div>
  );
}

function DarkTabBar({ active }: { active: "home" | "dogam" | "discover" | "log" | "sea" }) {
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
        background: "rgba(6,20,50,0.75)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(169,210,255,0.18)",
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
            color: t.k === active ? "#B9DCFF" : "rgba(255,255,255,0.5)",
          }}
        >
          <span style={{ fontSize: 18, opacity: t.k === active ? 1 : 0.6 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: t.k === active ? 900 : 600 }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
