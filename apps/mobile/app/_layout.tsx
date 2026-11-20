import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../src/api/auth";
import { OnboardingOverlay } from "../src/features/onboarding/OnboardingOverlay";
import { ApiError } from "../src/api/client";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import { Gaegu_400Regular, Gaegu_700Bold } from "@expo-google-fonts/gaegu";
import { GamjaFlower_400Regular } from "@expo-google-fonts/gamja-flower";
import { colors } from "../src/theme/tokens";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Do not hammer the API on auth/validation errors; retry transient ones twice.
      retry: (count, error) => count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
  },
});

/** Sends signed-out users to the login screen (only when Supabase login is configured). */
function AuthGate() {
  const { loading, signedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const onLogin = segments[0] === "login";
  useEffect(() => {
    if (loading) return;
    if (!signedIn && !onLogin) router.replace("/login");
    else if (signedIn && onLogin) router.replace("/");
  }, [loading, signedIn, onLogin, router]);
  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <StatusBar style="dark" />
      <AuthGate />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.mist } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="profile" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="species/[no]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="discover/analyzing" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="discover/result" options={{ animation: "fade" }} />
        <Stack.Screen name="discover/collected" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="log/new" options={{ presentation: "modal" }} />
        <Stack.Screen name="log/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="diary/[logId]/write" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="diary/[logId]/decorate" options={{ animation: "slide_from_right", gestureEnabled: false }} />
        <Stack.Screen name="sea/map" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="sea/tank/ocean" options={{ animation: "fade" }} />
        <Stack.Screen name="sea/tank/macro" options={{ animation: "fade" }} />
        <Stack.Screen name="sea/place/[id]" options={{ animation: "fade" }} />
      </Stack>
      <OnboardingOverlay />
      </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
