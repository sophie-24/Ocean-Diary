import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";

type Step = {
  no: string;
  title: string;
  body: string;
  critter: CritterKind;
  critterSize: number;
};

const STEPS: Step[] = [
  {
    no: "01",
    title: "사진을 올려요",
    body: "다이빙 끝나고 아이클라우드 뒤질 필요 없이, 그 자리에서 수중 사진 한 장. 그걸로 다 끝.",
    critter: "pygmy",
    critterSize: 160,
  },
  {
    no: "02",
    title: "Mola가 알아봐요",
    body: "AI가 바다 친구의 종 후보를 알려주고, 모르면 ‘미확인’으로 저장해도 돼요. 수치·점수는 안 보여줘요.",
    critter: "mandarin",
    critterSize: 200,
  },
  {
    no: "03",
    title: "도감에 쌓여요",
    body: "같은 종을 다시 만나면 횟수가 올라가고, 지도엔 다녀간 바다가 조용히 찍혀요.",
    critter: "thresher",
    critterSize: 180,
  },
];

export function Solution() {
  return (
    <section
      style={{
        backgroundColor: colors.deepSea,
        color: colors.white,
        padding: "160px clamp(24px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <p style={{ ...type.label, color: colors.sky, margin: 0 }}>
          Solution
        </p>

        <h2 style={{ ...type.h1, color: colors.white, margin: "22px 0 18px", maxWidth: 900 }}>
          사진 한 장이면 돼요.
          <br />
          나머지는 Mola가 다 해줄게요.
        </h2>

        <p style={{ ...type.lead, color: colors.sky, margin: "0 0 96px", maxWidth: 640, opacity: 0.85 }}>
          AI가 바다 친구를 알아보고, 수채 카드로 그려주고, 당신의 도감에
          기록해둬요. 마치 그림일기 한 장 넘기듯이.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {STEPS.map((s, i) => (
            <StepRow key={s.no} step={s} align={i % 2 === 0 ? "left" : "right"} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepRow({ step, align }: { step: Step; align: "left" | "right" }) {
  const textFirst = align === "left";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: textFirst ? "1fr auto" : "auto 1fr",
        gap: 48,
        alignItems: "center",
        paddingLeft: align === "right" ? "clamp(0px, 8vw, 120px)" : 0,
        paddingRight: align === "left" ? "clamp(0px, 8vw, 120px)" : 0,
      }}
    >
      {textFirst ? <StepText step={step} /> : <StepArt step={step} />}
      {textFirst ? <StepArt step={step} /> : <StepText step={step} />}
    </div>
  );
}

function StepText({ step }: { step: Step }) {
  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ ...type.label, color: colors.sky, margin: 0, opacity: 0.8 }}>
        Step {step.no}
      </p>
      <h3 style={{ ...type.h2, color: colors.white, margin: "10px 0 14px", lineHeight: 1.15 }}>
        {step.title}
      </h3>
      <p style={{ ...type.body, color: colors.sky, margin: 0, opacity: 0.88 }}>
        {step.body}
      </p>
    </div>
  );
}

function StepArt({ step }: { step: Step }) {
  return (
    <div
      style={{
        width: step.critterSize + 40,
        height: step.critterSize + 40,
        borderRadius: 32,
        backgroundColor: "rgba(220,235,252,0.06)",
        border: "1px solid rgba(169,210,255,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Critter kind={step.critter} size={step.critterSize} />
    </div>
  );
}
