import { useState } from "react";
import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";

/**
 * Mola "마크로 수조" (Sea-Macro) 화면 축약.
 * 아주 작은 크리터들이 산호초 바닥에 숨어있고, 돋보기를 움직여
 * 찾아내는 모드. 돋보기 영역 안의 생물만 라벨이 뜨도록 CSS만으로 구현.
 */

type Spot = { kind: CritterKind; x: number; y: number; size: number; ko: string; en: string };

const SPOTS: Spot[] = [
  { kind: "pygmy", x: 70, y: 260, size: 46, ko: "피그미해마", en: "Pygmy Seahorse" },
  { kind: "harlequin", x: 240, y: 300, size: 60, ko: "하리퀸새우", en: "Harlequin Shrimp" },
  { kind: "mantis", x: 110, y: 480, size: 72, ko: "공작갯가재", en: "Mantis Shrimp" },
  { kind: "seabunny", x: 270, y: 500, size: 44, ko: "바다토끼", en: "Sea Bunny" },
  { kind: "boxercrab", x: 60, y: 600, size: 56, ko: "복서크랩", en: "Boxer Crab" },
  { kind: "ghostpipe", x: 230, y: 610, size: 78, ko: "고스트파이프", en: "Ghost Pipefish" },
];

export function MacroInApp() {
  const [lens, setLens] = useState({ x: 220, y: 460 });
  const LENS_R = 90; // px

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        paddingTop: 60,
        background:
          "linear-gradient(180deg, #7BB3E8 0%, #4A8BCA 45%, #2D5A91 85%, #1E3F6B 100%)",
        color: colors.white,
        fontFamily: "var(--font-body)",
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setLens({
          x: ((e.clientX - rect.left) / rect.width) * 390,
          y: ((e.clientY - rect.top) / rect.height) * 844,
        });
      }}
      onTouchMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const t = e.touches[0];
        setLens({
          x: ((t.clientX - rect.left) / rect.width) * 390,
          y: ((t.clientY - rect.top) / rect.height) * 844,
        });
      }}
    >
      {/* coral silhouettes at bottom */}
      <svg
        viewBox="0 0 390 300"
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 84,
          width: "100%",
          height: 300,
          opacity: 0.55,
        }}
      >
        <path d="M0 260 Q40 230 70 240 Q90 200 120 230 Q160 210 180 250 Q220 220 260 240 Q300 210 330 240 Q370 220 390 240 L390 300 L0 300 Z" fill="#1E3F6B" />
        <path d="M30 240 L30 200 M28 205 L32 205 M26 210 L34 210 M24 215 L36 215" stroke="#F49AB8" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 210 L100 170 M96 175 L104 175 M94 180 L106 180" stroke="#FFC77D" strokeWidth="3" strokeLinecap="round" />
        <path d="M280 220 L280 180 M276 185 L284 185" stroke="#6FD6C6" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* HUD top */}
      <div
        style={{
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
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
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#CFE0F7",
            }}
          >
            나의 바다
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, marginTop: 2 }}>
            마크로 수조
          </div>
          <div style={{ fontSize: 10, color: "#DCEBFC", marginTop: 1 }}>
            돋보기를 움직여 찾아요 · 6마리 숨음
          </div>
        </div>
        <TankSwitcher active="macro" />
      </div>

      {/* critters with per-spot opacity based on lens distance */}
      {SPOTS.map((s, i) => {
        const dx = s.x - lens.x;
        const dy = s.y - lens.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const visible = d < LENS_R;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x - s.size / 2,
              top: s.y - s.size / 2,
              width: s.size,
              height: s.size,
              opacity: visible ? 1 : 0.18,
              transition: "opacity 180ms ease",
              pointerEvents: "none",
            }}
          >
            <Critter kind={s.kind} size={s.size} />
            {visible && (
              <div
                style={{
                  position: "absolute",
                  top: s.size + 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(14,42,92,0.85)",
                  color: colors.white,
                  fontSize: 10,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  textAlign: "center",
                }}
              >
                {s.ko}
                <div style={{ fontSize: 8, fontWeight: 500, opacity: 0.7 }}>
                  {s.en}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* magnifier */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: lens.x - LENS_R,
          top: lens.y - LENS_R,
          width: LENS_R * 2,
          height: LENS_R * 2,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.75)",
          boxShadow:
            "inset 0 0 40px rgba(255,255,255,0.22), 0 6px 20px rgba(0,0,0,0.3)",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 50%)",
          pointerEvents: "none",
          transition: "left 60ms linear, top 60ms linear",
        }}
      />
      {/* magnifier handle */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: lens.x + LENS_R * 0.6,
          top: lens.y + LENS_R * 0.6,
          width: 10,
          height: 60,
          borderRadius: 999,
          background: "rgba(255,255,255,0.7)",
          transform: "rotate(45deg)",
          transformOrigin: "top center",
          pointerEvents: "none",
        }}
      />

      {/* bottom counter */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 100,
          padding: "10px 14px",
          borderRadius: 16,
          background: "rgba(6,20,50,0.6)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(169,210,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 800 }}>
          🔍 찾은 생물{" "}
          <b style={{ color: "#F7C948" }}>
            {
              SPOTS.filter((s) => {
                const dx = s.x - lens.x;
                const dy = s.y - lens.y;
                return Math.sqrt(dx * dx + dy * dy) < LENS_R;
              }).length
            }
          </b>{" "}
          / 6
        </span>
        <span style={{ fontSize: 10, color: "#CFE0F7" }}>돋보기를 움직여 보세요</span>
      </div>

      <DarkTabBar />
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

function DarkTabBar() {
  const tabs = [
    { k: "home", icon: "🏠", label: "홈" },
    { k: "dogam", icon: "📘", label: "도감" },
    { k: "discover", icon: "📷", label: "발견" },
    { k: "log", icon: "📝", label: "로그북" },
    { k: "sea", icon: "🫧", label: "나의 바다", active: true },
  ] as const;
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
            color: "active" in t && t.active ? "#B9DCFF" : "rgba(255,255,255,0.5)",
          }}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: "active" in t && t.active ? 900 : 600 }}>
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}
