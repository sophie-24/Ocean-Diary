import { PlannedScreen } from "../../src/components/ui/PlannedScreen";

export default function SeaMapRoute() {
  return (
    <PlannedScreen
      tone="dark"
      eyebrow="MY OCEAN MAP"
      title="세계 지도"
      critter="whale"
      summary="다녀온 나라를 색칠하는 지도를 만드는 중이에요"
      screens={["확대 · 이동 · 검색", "다녀온 나라 색", "장소별 수족관 (예: 말라파스쿠아)"]}
    />
  );
}
