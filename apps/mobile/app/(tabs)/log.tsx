import { PlannedScreen } from "../../src/components/ui/PlannedScreen";

export default function LogTab() {
  return (
    <PlannedScreen
      eyebrow="MY LOGBOOK"
      title="로그북"
      critter="mandarin"
      summary="다이빙 기록과 그림일기를 만드는 중이에요"
      screens={["로그 목록 (스쿠버 · 프리 · 스노클)", "새 기록 입력 (필수: 날짜 · 지역 · 포인트)", "500자 그림일기 + 크레파스 스티커"]}
    />
  );
}
