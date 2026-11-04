import { PlannedScreen } from "../../src/components/ui/PlannedScreen";

export default function DiscoverTab() {
  return (
    <PlannedScreen
      eyebrow="DISCOVER"
      title="생물 찾기"
      critter="thresher"
      summary="사진 업로드와 AI 식별 흐름을 새 디자인으로 옮기는 중이에요"
      screens={["미디어 선택", "분석 중", "식별 결과 · 후보 확인", "수집 완료 도장"]}
    />
  );
}
