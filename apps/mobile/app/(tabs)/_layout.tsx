import { Tabs } from "expo-router";
import { TabBar } from "../../src/components/TabBar";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="dogam" options={{ title: "도감" }} />
      <Tabs.Screen name="discover" options={{ title: "발견" }} />
      <Tabs.Screen name="log" options={{ title: "로그북" }} />
      <Tabs.Screen name="sea" options={{ title: "나의 바다" }} />
    </Tabs>
  );
}
