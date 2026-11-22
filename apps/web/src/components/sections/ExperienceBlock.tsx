import type { ReactNode } from "react";
import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChapterLabel } from "@/components/ui/ChapterLabel";
import { Reveal } from "@/components/ui/Reveal";

/**
 * 플로우 섹션 공통 블록 — 좌/우 지그재그로 PhoneFrame 하나 + 설명.
 *
 * Experience.tsx의 내부 Block을 분리·재사용 가능하게 꺼내둔 것.
 * 각 섹션(Logbook, Diary, Discover, Dogam …)에서 임포트.
 */

export function ExperienceBlock({
  no,
  label,
  title,
  body,
  children,
  align,
  tilt = 0,
  extras,
}: {
  no: string;
  label: string;
  title: ReactNode;
  body: ReactNode;
  children: ReactNode;
  align: "left" | "right";
  tilt?: number;
  /** 폰 아래 작은 부가 UI(핫키·힌트)가 필요할 때. */
  extras?: ReactNode;
}) {
  const phoneFirst = align === "left";
  return (
    <div
      className="exp-block"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(28px, 5vw, 60px)",
        alignItems: "center",
        marginBottom: "clamp(64px, 9vw, 120px)",
      }}
    >
      {phoneFirst ? (
        <>
          <Reveal>
            <div className="stage">
              <ScaledPhone tilt={tilt}>{children}</ScaledPhone>
              {extras}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <BlockText no={no} label={label} title={title} body={body} />
          </Reveal>
        </>
      ) : (
        <>
          <Reveal delay={120}>
            <BlockText no={no} label={label} title={title} body={body} />
          </Reveal>
          <Reveal>
            <div className="stage">
              <ScaledPhone tilt={tilt}>{children}</ScaledPhone>
              {extras}
            </div>
          </Reveal>
        </>
      )}

      <style>{`
        @media (max-width: 860px) {
          .exp-block {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .exp-block > :first-child { order: 2; }
          .exp-block > :last-child { order: 1; }
        }
      `}</style>
    </div>
  );
}

export function ScaledPhone({
  children,
  tilt = 0,
  scale = 0.72,
}: {
  children: ReactNode;
  tilt?: number;
  scale?: number;
}) {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
        width: 390 * scale,
        height: 844 * scale,
      }}
    >
      <PhoneFrame tilt={tilt}>{children}</PhoneFrame>
    </div>
  );
}

function BlockText({
  no,
  label,
  title,
  body,
}: {
  no: string;
  label: string;
  title: ReactNode;
  body: ReactNode;
}) {
  return (
    <div>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 800,
          fontSize: "clamp(56px, 7vw, 92px)",
          lineHeight: 1,
          color: colors.oceanBlue,
          letterSpacing: "-0.035em",
          display: "block",
          opacity: 0.9,
          marginBottom: 20,
        }}
      >
        {no}
      </span>
      <ChapterLabel style={{ marginBottom: 14 }}>{label}</ChapterLabel>
      <h3 style={{ ...type.h2, color: colors.navy, margin: "0 0 20px", lineHeight: 1.18 }}>
        {title}
      </h3>
      <div style={{ ...type.body, color: colors.ink2, margin: 0, maxWidth: 440 }}>{body}</div>
    </div>
  );
}

export function SectionShell({
  id,
  background,
  label,
  title,
  lead,
  children,
  tone = "light",
}: {
  id: string;
  background: string;
  tone?: "light" | "dark";
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        backgroundColor: background,
        padding: "clamp(88px, 12vw, 160px) clamp(20px, 6vw, 80px)",
        color: colors.navy,
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
        <ChapterLabel tone={tone}>{label}</ChapterLabel>
        <h2
          style={{
            ...type.h1,
            color: colors.navy,
            margin: "22px 0 18px",
            maxWidth: 820,
          }}
        >
          {title}
        </h2>
        {lead && (
          <p
            style={{
              ...type.lead,
              color: colors.ink2,
              margin: "0 0 clamp(48px, 7vw, 96px)",
              maxWidth: 620,
            }}
          >
            {lead}
          </p>
        )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
