import { colors } from "@/theme/tokens";
import { DiscoverInApp } from "@/components/DiscoverInApp";
import { ExperienceBlock, SectionShell } from "./ExperienceBlock";

/**
 * 플로우 ③ AI 생물 식별 (옵션 가지).
 * 다이빙 영상/사진을 던지면 → 분석 → 식별 → 확정 → 도감·수조에 자동 등록.
 */
export function Discover() {
  return (
    <SectionShell
      id="discover"
      background={colors.mist}
      label="Step 03 · AI 생물 찾기"
      title={
        <>
          사진·영상 던지면,
          <br />
          AI가 누군지 알려줘요.
        </>
      }
      lead={
        <>
          4단계 플로우를 한 폰 안에서 전부 밟아볼 수 있어요. 하단 페이저로 미디어 선택 →
          분석 중 → 식별 결과 → 수집 완료까지 넘겨가며 체험해보세요.
        </>
      }
    >
      <ExperienceBlock
        no="03"
        label="미디어 → 분석 → 확정"
        title={<>영상 60초 → 생물 자동 도감 등록</>}
        body={
          <>
            촬영 날짜·위치로 이미 로그에 저장된 다이빙과 자동 연결돼요. 사진 올리는 게
            귀찮으면 나중에 올려도 되고, 아예 안 올려도 로그는 그대로.
            <br />
            <br />
            식별이 애매할 땐 <strong style={{ color: colors.navy }}>1순위·2순위</strong> 둘 다 보여줘요.
            "이 생물이 맞아요"를 누르면 그 순간 도감에 새 번호가 생기고, 수조에 들어와
            헤엄쳐 다녀요.
          </>
        }
        align="left"
        tilt={-1.5}
      >
        <DiscoverInApp />
      </ExperienceBlock>
    </SectionShell>
  );
}
