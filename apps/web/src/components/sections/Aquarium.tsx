import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";
import { OceanInApp } from "@/components/OceanInApp";
import { TankInApp } from "@/components/TankInApp";
import { MacroInApp } from "@/components/MacroInApp";
import { ScaledPhone, SectionShell } from "./ExperienceBlock";

/**
 * 플로우 ⑤ 나의 바다 · 수조 (물멍) — 하루 끝에 켜두는 세 수조.
 * 설계서의 Sea-Ocean / Sea-Aquarium / Sea-Macro 아트보드를 그대로 가져옴.
 *
 * 레이아웃: 폰 3대 나란히(데스크톱), 모바일에선 세로로 쌓임.
 */
export function Aquarium() {
  return (
    <SectionShell
      id="aquarium"
      background={colors.navy}
      label="Step 05 · 나의 바다 · 물멍"
      title={
        <span style={{ color: colors.white }}>
          쉬고 싶은 날엔,
          <br />
          수조 세 개 중 하나.
        </span>
      }
      lead={
        <span style={{ color: "rgba(255,255,255,0.72)" }}>
          대양 · 산호초 · 마크로. 내가 본 친구들만 수조 안을 느리게 헤엄쳐요. 소리를
          켜면 스쿠버 숨소리, 알림·채팅·경쟁 없음. 조명은 실제 시간대에 맞춰 바뀌어요.
        </span>
      }
    >
      <div
        className="tank-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 32,
          alignItems: "start",
          marginBottom: 32,
        }}
      >
        <TankBlock no="A" label="대양 수조" blurb="고래상어 · 환도상어 · 귀상어가 느리게 유영해요. 수심 40m 톤.">
          <ScaledPhone tilt={-2} scale={0.62}><OceanInApp /></ScaledPhone>
        </TankBlock>

        <TankBlock no="B" label="산호초 수조" blurb="내가 본 친구 18마리가 세 depth에 모여요. 숨소리 ASMR 포함.">
          <ScaledPhone tilt={0} scale={0.62}><TankInApp /></ScaledPhone>
        </TankBlock>

        <TankBlock no="C" label="마크로 수조" blurb="손가락 끝만 한 친구들. 돋보기를 움직여 찾아요.">
          <ScaledPhone tilt={2} scale={0.62}><MacroInApp /></ScaledPhone>
        </TankBlock>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tank-grid {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }
        }
      `}</style>
    </SectionShell>
  );
}

function TankBlock({
  no,
  label,
  blurb,
  children,
}: {
  no: string;
  label: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {children}
      <div style={{ textAlign: "center", maxWidth: 260 }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: "#8EC5FF",
            marginBottom: 6,
          }}
        >
          TANK · {no}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: colors.white,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <p
          style={{
            ...type.body,
            color: "rgba(255,255,255,0.68)",
            margin: 0,
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {blurb}
        </p>
      </div>
    </div>
  );
}
