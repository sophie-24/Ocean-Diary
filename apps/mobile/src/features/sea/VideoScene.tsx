import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useIsFocused } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import type { Phase } from "./timeOfDay";

/**
 * Looping video background for a tank. Falls back to the SVG `scene` while the asset is missing
 * or the platform can't play it (web preview), so adding Higgsfield videos is drop-in.
 */
export type SceneVideoMap = Partial<Record<Phase, number>>;

type Props = {
  phase: Phase;
  videos: SceneVideoMap;
  /** Drawn when no video exists for this phase (or on web). */
  fallback: ReactNode;
};

export function VideoScene({ phase, videos, fallback }: Props) {
  // The day video doubles for dawn and dusk if those phases are not generated yet.
  const source = videos[phase] ?? videos.day ?? null;
  // expo-video does not render on react-native-web, and we don't want videos in the dev preview.
  const useVideo = Platform.OS !== "web" && source != null;

  const player = useVideoPlayer(useVideo ? source : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.audioMixingMode = "mixWithOthers";
  });
  const focused = useIsFocused();

  useEffect(() => {
    if (!useVideo) return;
    if (focused) player.play();
    else player.pause();
  }, [player, focused, useVideo]);

  if (!useVideo) return <>{fallback}</>;

  return (
    <View style={StyleSheet.absoluteFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}
