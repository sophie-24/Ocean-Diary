import { colors } from "@/theme/tokens";
import { DiaryInApp } from "@/components/DiaryInApp";
import { ExperienceBlock, SectionShell } from "./ExperienceBlock";

/**
 * 플로우 ② 그림일기 — 로그 저장 뒤에 이어지는 감성 기록.
 * 글쓰기(500자) → 자동 조판 → 스티커 꾸미기 → 저장·공유 순.
 */
export function Diary() {
  return (
    <SectionShell
      id="diary"
      background={colors.white}
      label="Step 02 · 그림일기"
      title={
        <>
          말 몇 마디면,
          <br />
          수채 일기 한 편.
        </>
      }
      lead={
        <>
          "오늘 가토 섬 입구가 생각보다 좁아서 살짝 긴장했는데" — 이렇게 써 주면 Mola가
          수채 삽화 + 손글씨 레이아웃으로 조판해요. 그 위에 스티커 44종을 자유롭게.
        </>
      }
    >
      <ExperienceBlock
        no="02"
        label="글쓰기 → 꾸미기"
        title={<>입력한 한 줄이 수채 카드로</>}
        body={
          <>
            수치가 아니라 <strong style={{ color: colors.navy }}>그날의 분위기</strong>가 남는 로그북.
            10년 뒤 꺼내 봐도 그날 다이빙이 떠오르게.
            <br />
            <br />
            텍스트 영역을 눌러서 직접 써보세요. 그러면 하단 스티커 팔레트에서 파도·반짝임·
            산호·방울을 골라 올리는 플로우가 바로 보여요. 최대 5개까지, 아래 저장 버튼으로
            완성.
          </>
        }
        align="right"
        tilt={2}
      >
        <DiaryInApp />
      </ExperienceBlock>
    </SectionShell>
  );
}
