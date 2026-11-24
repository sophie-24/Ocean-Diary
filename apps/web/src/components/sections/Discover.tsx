import { colors } from "@/theme/tokens";
import { ScreenImage } from "@/components/ScreenImage";
import { ExperienceBlock, SectionShell } from "./ExperienceBlock";

/**
 * 플로우 ③ AI 생물 식별.
 */
export function Discover() {
  return (
    <SectionShell
      id="discover"
      background={colors.mist}
      label="AI 생물 찾기"
      title={
        <>
          사진·영상 던지면,
          <br />
          AI가 누군지 알려줘요.
        </>
      }
      lead={
        <>
          미디어 선택 → 분석 중 → 식별 결과 → 수집 완료.
          촬영 날짜·위치로 이미 저장된 로그와 자동 연결돼요.
        </>
      }
    >
      <ExperienceBlock
        no="03"
        label="미디어 → 분석 → 확정"
        title={<>영상 60초 → 생물 자동 도감 등록</>}
        body={
          <>
            사진 올리는 게 귀찮으면 나중에 올려도 되고, 아예 안 올려도 로그는 그대로.
            <br />
            <br />
            식별이 애매할 땐 <strong style={{ color: colors.navy }}>1순위·2순위</strong> 둘 다 보여줘요.
            "이 생물이 맞아요"를 누르면 그 순간 도감에 새 번호가 생기고,
            수조에 들어와 헤엄쳐요.
          </>
        }
        align="left"
        tilt={-1.5}
      >
        <ScreenImage src="/screens/discover-result.png" alt="AI 식별 결과 화면" />
      </ExperienceBlock>
    </SectionShell>
  );
}
