import { PlannedScreen } from "../../src/components/ui/PlannedScreen";

export default function HomeTab() {
  return (
    <PlannedScreen
      eyebrow="TODAY'S OCEAN"
      title="오늘의 바다"
      critter="whale"
      summary="홈 화면을 디자인 그대로 옮기는 중이에요"
      screens={["수집 달성률과 최근 만난 생물", "이어 쓰는 그림일기 초안", "다음 다이빙 추천 명소"]}
    />
  );
}
