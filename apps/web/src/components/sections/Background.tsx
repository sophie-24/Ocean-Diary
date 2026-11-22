import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";
import { ChapterLabel } from "@/components/ui/ChapterLabel";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";

/**
 * "Background" — Pretendard 통일. Fraunces italic 영문 중간 삽입구 제거.
 */
export function Background() {
  return (
    <section
      style={{
        backgroundColor: colors.mist,
        padding: "clamp(80px, 11vw, 140px) clamp(20px, 6vw, 80px)",
        color: colors.navy,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <ChapterLabel>우리가 본 문제</ChapterLabel>

        <h2 style={{ ...type.h1, color: colors.navy, margin: "24px 0 20px", maxWidth: 820 }}>
          다이빙 다녀오면
          <br />
          뭘 봤는지 자꾸 까먹지 않나요?
        </h2>

        <p style={{ ...type.lead, color: colors.ink2, margin: "0 0 72px", maxWidth: 640 }}>
          종이 로그북은 가방에서 젖고, 메모장에 쓰면 사진이랑 따로 놀고,
          앨범엔 그 날의 바다가 수백 장 묻혀 있어요.
        </p>

        <Reveal>
        <div
          className="bg-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          <article
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.line}`,
              borderRadius: 24,
              padding: "clamp(28px, 4vw, 48px) clamp(22px, 3.5vw, 40px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 340,
            }}
          >
            <div>
              <Chip tone="blue">문제 01</Chip>
            </div>
            <div>
              <h3 style={{ ...type.h2, color: colors.navy, margin: "16px 0 14px", lineHeight: 1.15 }}>
                로그북은
                <br />
                손이 안 가요.
              </h3>
              <p style={{ ...type.body, color: colors.ink2, margin: 0 }}>
                바다 다녀와서 종이 로그북에 수심·시간·장비·버디까지 다 쓰는
                사람, 솔직히 10%도 안 돼요. 다이빙 횟수가 쌓여도 기록은
                3페이지에서 멈춰 있어요.
              </p>
            </div>
          </article>

          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 20 }}>
            <article
              style={{
                backgroundColor: colors.navy,
                color: colors.white,
                borderRadius: 24,
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Chip tone="glass">문제 02</Chip>
              </div>
              <h3 style={{ ...type.h3, color: colors.white, margin: "14px 0 10px" }}>
                사진은 앨범 어딘가.
              </h3>
              <p style={{ ...type.body, color: colors.sky, margin: 0, opacity: 0.85 }}>
                수백 장 중에 어떤 게 어떤 포인트였는지, 뭘 만났는지 1년 뒤면
                기억이 사라져요.
              </p>
            </article>
            <article
              style={{
                backgroundColor: colors.ghostBg,
                borderRadius: 24,
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Chip tone="blue">문제 03</Chip>
              </div>
              <h3 style={{ ...type.h3, color: colors.navy, margin: "14px 0 10px" }}>
                기록이 재미없어요.
              </h3>
              <p style={{ ...type.body, color: colors.ink2, margin: 0 }}>
                수치 몇 개 적고 끝나면 돌아보기 애매해요. 추억이 안 쌓여요.
              </p>
            </article>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
