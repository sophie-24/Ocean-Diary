import { colors } from "@/theme/tokens";
import { DogamGridInApp } from "@/components/DogamGridInApp";
import { ExperienceBlock, SectionShell } from "./ExperienceBlock";

/**
 * 플로우 ④ 도감 — 만난 친구들이 쌓여서 나만의 도감으로.
 * 생물 도감(바다 생물 181종) + 명소 스탬프(난파선·조각·동굴 40곳) 두 축.
 */
export function Dogam() {
  return (
    <SectionShell
      id="dogam"
      background={colors.white}
      label="도감"
      title={
        <>
          만난 친구들이 쌓여서,
          <br />
          나만의 수중 도감으로.
        </>
      }
      lead={
        <>
          생물 도감 181종, 명소 스탬프 40곳. 상단 탭으로 두 축을 전환해요. 내가 본
          친구는 번호와 함께 선명하게, 아직 안 본 친구는 투명한 실루엣으로.
        </>
      }
    >
      <ExperienceBlock
        no="04"
        label="생물 도감, 명소 스탬프"
        title={<>본 것만 선명하게, 안 본 건 힌트로</>}
        body={
          <>
            상단 두 탭을 번갈아 눌러 보세요. 바다 생물은 분류별로, 명소 스탬프는 난파선,
            수중 조각, 동굴로 묶여요.
            <br />
            <br />
            "27/181, 3종 더 모으면 30종 기념 카드" 같은 <strong style={{ color: colors.navy }}>작은 목표</strong>가
            매일 뜨는 게 핵심. 다이빙 다녀올 때마다 1-2칸씩 채워지는 재미.
          </>
        }
        align="right"
        tilt={1.5}
      >
        <DogamGridInApp />
      </ExperienceBlock>
    </SectionShell>
  );
}
