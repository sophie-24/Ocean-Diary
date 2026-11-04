import { PlannedScreen } from "../../src/components/ui/PlannedScreen";

export default function SeaTab() {
  return (
    <PlannedScreen
      tone="dark"
      eyebrow="MY OCEAN"
      title="나의 바다"
      critter="napoleon"
      summary="수족관과 지도를 만드는 중이에요"
      screens={["산호초 · 대양 · 마크로(돋보기) 수조", "바다 소리와 실시간 조명", "세계 지도와 장소별 수족관"]}
    />
  );
}
