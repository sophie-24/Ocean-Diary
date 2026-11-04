import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  NotoSansKR_800ExtraBold,
  NotoSansKR_900Black,
} from "@expo-google-fonts/noto-sans-kr";
import { Gaegu_400Regular, Gaegu_700Bold } from "@expo-google-fonts/gaegu";
import { GamjaFlower_400Regular } from "@expo-google-fonts/gamja-flower";
import { colors } from "../src/theme/tokens";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    NotoSansKR_800ExtraBold,
    NotoSansKR_900Black,
    Gaegu_400Regular,
    Gaegu_700Bold,
    GamjaFlower_400Regular,
  });

  useEffect(() => {
    // Fall back to system fonts rather than blocking the app if a font fails to load.
    if (loaded || error) void SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.mist } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="species/[no]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="discover/analyzing" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="discover/result" options={{ animation: "fade" }} />
        <Stack.Screen name="discover/collected" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="log/new" options={{ presentation: "modal" }} />
        <Stack.Screen name="log/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="diary/[logId]/write" options={{ animation: "slide_from_right" }} />
      </Stack>
    </>
  );
}
