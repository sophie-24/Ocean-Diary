import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";

type Feat = {
  tag: string;
  title: string;
  body: string;
  critter: CritterKind;
  bg: string;
  fg: string;
  subFg: string;
  area: string;
};

const FEATS: Feat[] = [
  {
    tag: "AI 종 식별",
    title: "사진으로 바다 친구 알아보기",
    body: "수중 사진 한 장 올리면 종 후보가 나와요. 잘 모르면 ‘미확인’으로 저장해도 괜찮아요.",
    critter: "hammerhead",
    bg: "#FFFFFF",
    fg: "#16285A",
    subFg: "#4A5B7E",
    area: "a",
  },
  {
    tag: "그림책 도감",
    title: "수채 카드로 모으기",
    body: "수채 톤 카드로 그려지는 개인 도감. 같은 종은 횟수가 쌓여요.",
    critter: "mandarin",
    bg: "#2F6FDB",
    fg: "#FFFFFF",
    subFg: "#DCEBFC",
    area: "b",
  },
  {
    tag: "그림일기",
    title: "로그북 겸 일기",
    body: "수치보다 분위기가 남는 기록. 스티커도 붙여요.",
    critter: "pygmy",
    bg: "#EEF4FB",
    fg: "#16285A",
    subFg: "#4A5B7E",
    area: "c",
  },
  {
    tag: "나의 수조",
    title: "친구들이 떠다녀요",
    body: "수집한 바다 친구들이 수조 안을 느리게 헤엄쳐요. 내 다이빙 이력이 하나의 풍경이 돼요.",
    critter: "whale",
    bg: "#0E2A5C",
    fg: "#FFFFFF",
    subFg: "#DCEBFC",
    area: "d",
  },
];

export function Features() {
  return (
    <section
      style={{
        backgroundColor: colors.ghostBg,
        padding: "160px clamp(24px, 6vw, 80px)",
        color: colors.navy,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 56,
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 740 }}>
            <p style={{ ...type.label, color: colors.oceanBlue, margin: 0 }}>
              핵심 기능
            </p>
            <h2 style={{ ...type.h1, color: colors.navy, margin: "22px 0 18px" }}>
              다이버의 하루를
              <br />
              네 조각으로 담아요.
            </h2>
          </div>
          <p style={{ ...type.body, color: colors.ink2, margin: 0, maxWidth: 320, textAlign: "right" }}>
            기록은 간단하게, 결과물은 두고두고 보고 싶은 그림책 한 페이지처럼.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "320px 280px",
            gridTemplateAreas: `
              "a a b"
              "c d d"
            `,
            gap: 18,
          }}
          className="bento-grid"
        >
          {FEATS.map((f) => (
            <FeatureCard key={f.area} feat={f} />
          ))}
        </div>

        <style>{`
          @media (max-width: 760px) {
            .bento-grid {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto auto auto auto !important;
              grid-template-areas:
                "a"
                "b"
                "c"
                "d" !important;
            }
            .bento-grid > article {
              min-height: 280px;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

function FeatureCard({ feat }: { feat: Feat }) {
  return (
    <article
      style={{
        gridArea: feat.area,
        backgroundColor: feat.bg,
        color: feat.fg,
        border: feat.bg === "#FFFFFF" ? `1px solid ${colors.line}` : "none",
        borderRadius: 28,
        padding: "32px 30px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div>
        <p
          style={{
            ...type.label,
            color:
              feat.bg === "#FFFFFF" || feat.bg === "#EEF4FB"
                ? colors.oceanBlue
                : colors.sky,
            margin: 0,
            opacity: 0.85,
          }}
        >
          {feat.tag}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ ...type.h3, color: feat.fg, margin: "0 0 10px", lineHeight: 1.25 }}>
            {feat.title}
          </h3>
          <p style={{ ...type.body, color: feat.subFg, margin: 0, fontSize: 15.5 }}>
            {feat.body}
          </p>
        </div>
        <Critter kind={feat.critter} size={110} />
      </div>
    </article>
  );
}
