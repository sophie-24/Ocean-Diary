import { useEffect, useRef, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { useIsFocused } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

/**
 * Ambient sea sound for the 나의 바다 tanks. Off by default; the diver's choice is remembered.
 * Both tracks are pre-cut to loop seamlessly (tail cross-faded into the head).
 */
export type OceanTrack = "bubbles" | "scuba";

const SOURCES: Record<OceanTrack, number> = {
  bubbles: require("../../../assets/sounds/bubbles.m4a"),
  scuba: require("../../../assets/sounds/scuba.m4a"),
};

const KEY = "mola:sea-sound";
const VOLUME = 0.6;
const FADE_MS = 500;

let enabled = false;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

void AsyncStorage.getItem(KEY)
  .then((v) => {
    enabled = v === "on";
    loaded = true;
    emit();
  })
  .catch(() => undefined);

export const oceanSound = {
  get: () => enabled && loaded,
  toggle() {
    enabled = !enabled;
    void AsyncStorage.setItem(KEY, enabled ? "on" : "off").catch(() => undefined);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

let modeSet = false;
function ensureAudioMode() {
  if (modeSet) return;
  modeSet = true;
  // Respect the silent switch and never stop the diver's own music: ambience mixes in.
  void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers", shouldPlayInBackground: false }).catch(() => undefined);
}

/** Plays `track` while the sound is on, this screen is focused and the app is in the foreground. */
export function useOceanSound(track: OceanTrack) {
  const on = useSyncExternalStore(oceanSound.subscribe, oceanSound.get, oceanSound.get);
  const focused = useIsFocused();
  const player = useAudioPlayer(SOURCES[track]);
  const fade = useRef<ReturnType<typeof setInterval> | null>(null);
  const appActive = useRef(AppState.currentState === "active");

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    const apply = () => {
      if (fade.current) clearInterval(fade.current);
      const shouldPlay = on && loaded && focused && appActive.current;
      if (shouldPlay) {
        ensureAudioMode();
        player.volume = 0;
        player.play();
        const started = Date.now();
        fade.current = setInterval(() => {
          const t = Math.min(1, (Date.now() - started) / FADE_MS);
          player.volume = VOLUME * t;
          if (t >= 1 && fade.current) clearInterval(fade.current);
        }, 60);
      } else {
        player.pause();
      }
    };
    apply();
    const sub = AppState.addEventListener("change", (s) => {
      appActive.current = s === "active";
      apply();
    });
    return () => {
      sub.remove();
      if (fade.current) clearInterval(fade.current);
    };
  }, [on, focused, player]);

  return { on, toggle: oceanSound.toggle };
}
