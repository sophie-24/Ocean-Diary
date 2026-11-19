import { useState } from "react";
import { DogamScreen } from "../../src/features/dogam/DogamScreen";
import { SeaMapScreen } from "../../src/features/sea/SeaMapScreen";
import type { MapBookTab } from "../../src/features/dogam/MapBookTabs";

/**
 * 도감 탭 — 지도 뷰(default)와 생물 도감 뷰를 상단 서브탭으로 전환.
 *
 * 각 자식 스크린(SeaMapScreen, DogamScreen)이 상단 MapBookTabs를 자체적으로
 * 렌더하고, 콜백으로 wrapper state를 바꿔요. props를 안 주면 두 스크린 모두
 * 서브탭 없이 독립 화면으로도 동작해요 (예: app/sea/map.tsx 레거시 라우트).
 */
export default function DogamTab() {
  const [view, setView] = useState<MapBookTab>("map");
  const onChange = (next: MapBookTab) => setView(next);
  return view === "map"
    ? <SeaMapScreen mapBookTab={{ active: "map", onChange }} />
    : <DogamScreen mapBookTab={{ active: "book", onChange }} />;
}
