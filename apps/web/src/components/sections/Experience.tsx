import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";
import { pickOfTheDay } from "@/data/destinations";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TodayInApp } from "@/components/TodayInApp";
import { TankInApp } from "@/components/TankInApp";
import { DiaryInApp } from "@/components/DiaryInApp";

/**
 * "Experience Now" — 폰 목업 안에서 실제 Mola 앱 UI를 그대로 체험.
 *
 * 각 블록 레이아웃:
 *   [ 폰 미리보기 ]  |  [ 설명 텍스트 (실제 앱 기능) ]
 *
 * 홀수 블록: 폰이 왼쪽, 텍스트가 오른쪽
 * 짝수 블록: 폰이 오른쪽, 텍스트가 왼쪽
 * (지그재그로 비대칭 유지)
 *
 * 폰 안의 UI는 네이티브 앱의 디자인 시스템(색·폰트·Critter)을 그대로
 * 사용한 "화면 재현". 캡처 이미지가 아니라 실제 React로 그려서 폰트
 * 렌더링·반응형이 자연스럽다.
 */
export function Experience() {
  const today = pickOfTheDay();

  return (
    <section
      id="experience"
      style={{
        backgroundColor: colors.mist,
        padding: "160px clamp(24px, 6vw, 80px)",
        color: colors.navy,
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <p style={{ ...type.label, color: colors.oceanBlue, margin: 0 }}>
          Experience Now
        </p>
        <h2 style={{ ...type.h1, color: colors.navy, margin: "22px 0 18px", maxWidth: 820 }}>
          설치 전에
          <br />
          실제 앱을 먼저 만져봐요.
        </h2>
        <p style={{ ...type.lead, color: colors.ink2, margin: "0 0 96px", maxWidth: 560 }}>
          회원가입 없이, 알림 없이, 결제 없이. 실제 Mola 앱의 세 가지 화면을
          여기에서 바로 눌러봐요.
        </p>

        <Block
          no="01"
          label="오늘의 다이빙"
          title="매일 하나씩 바뀌는 다이빙 명소"
          body={
            <>
              Mola는 다이빙 다녀올 곳을 고민하는 사람을 위해 매일 새 지역을
              제안해요. 시즌·수온·접근성·만날 수 있는 바다 친구들까지
              한 화면에.
              <br />
              <br />
              저장해두면 다음 트립 계획 짤 때 꺼내 보기 좋아요.
            </>
          }
          align="left"
          tilt={-2}
        >
          <TodayInApp destination={today} />
        </Block>

        <Block
          no="02"
          label="물멍 수조"
          title="수집한 친구들이 떠다녀요"
          body={
            <>
              다이빙에서 만난 바다 친구들이 수조 안을 느리게 헤엄쳐요.
              대양·산호초·마크로 세 수조 중 골라서 볼 수 있어요.
              <br />
              <br />
              소리를 켜면 스쿠버 숨소리가 깔려요. 알림·채팅·경쟁 없음.
              하루 끝에 한번 켜두세요.
            </>
          }
          align="right"
          tilt={2}
        >
          <TankInApp />
        </Block>

        <Block
          no="03"
          label="그림일기"
          title="한 줄 쓰면 그림일기로 바뀌어요"
          body={
            <>
              "오늘 뭐 봤어요?" 한 줄 입력하면 Mola가 수채 카드 + 손글씨
              레이아웃으로 조판해요. 수치가 아니라 분위기가 남는 로그북.
              <br />
              <br />
              <strong style={{ color: colors.navy }}>스티커도 붙여요.</strong>{" "}
              파도, 반짝임, 산호, 방울…
              하단 팔레트에서 탭하면 일기장 위에 떨어져요. 오늘 하루에 작은
              악센트 하나씩.
            </>
          }
          align="left"
          tilt={-1.5}
        >
          <DiaryInApp />
        </Block>
      </div>
    </section>
  );
}

function Block({
  no,
  label,
  title,
  body,
  children,
  align,
  tilt = 0,
}: {
  no: string;
  label: string;
  title: string;
  body: React.ReactNode;
  children: React.ReactNode;
  align: "left" | "right";
  tilt?: number;
}) {
  const phoneFirst = align === "left";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 60,
        alignItems: "center",
        marginBottom: 120,
      }}
      className="exp-block"
    >
      {phoneFirst ? (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ScaledPhone tilt={tilt}>{children}</ScaledPhone>
          </div>
          <BlockText no={no} label={label} title={title} body={body} />
        </>
      ) : (
        <>
          <BlockText no={no} label={label} title={title} body={body} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ScaledPhone tilt={tilt}>{children}</ScaledPhone>
          </div>
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

/** PhoneFrame을 화면 폭에 맞게 CSS 스케일. 390×844 원본 → 보통 0.72 배. */
function ScaledPhone({
  children,
  tilt,
}: {
  children: React.ReactNode;
  tilt: number;
}) {
  return (
    <div
      style={{
        transform: "scale(0.72)",
        transformOrigin: "center",
        width: 390 * 0.72,
        height: 844 * 0.72,
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
  title: string;
  body: React.ReactNode;
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
      <p style={{ ...type.label, color: colors.oceanBlue, margin: "0 0 14px" }}>
        {label}
      </p>
      <h3 style={{ ...type.h2, color: colors.navy, margin: "0 0 20px", lineHeight: 1.18 }}>
        {title}
      </h3>
      <p style={{ ...type.body, color: colors.ink2, margin: 0, maxWidth: 440 }}>
        {body}
      </p>
    </div>
  );
}
