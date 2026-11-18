import { Redirect } from "expo-router";

// 나의 바다 탭은 '대양 수조'로 즉시 리다이렉트해서 메인 탭바를 비워주고
// (수조 간 전환은 수조 switcher chip이 담당) 몰입형 수조 화면이 뜬다.
export default function SeaTab() {
  return <Redirect href="/sea/tank/ocean" />;
}
