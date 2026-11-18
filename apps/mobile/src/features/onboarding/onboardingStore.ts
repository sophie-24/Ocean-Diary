import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * "앱 소개 (how-to-use) 팝업" state.
 *
 * - Shows once per device, keyed by `mola:onboarding.v1`. Bump the version
 *   if the walkthrough is reworked and should re-fire for returning users.
 * - External store so the overlay re-renders without a context provider
 *   and the auto-open check is cheap to run anywhere in the tree.
 */

const KEY = "mola:onboarding.v1";

type OnboardingState = {
  /** The storage flag has been read: before this, we don't know if the user has seen it. */
  loaded: boolean;
  /** The user has already finished or dismissed the walkthrough on this device. */
  seen: boolean;
  /** The overlay is visible right now. */
  open: boolean;
};

let state: OnboardingState = { loaded: false, seen: false, open: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const set = (patch: Partial<OnboardingState>) => {
  state = { ...state, ...patch };
  emit();
};

// Hydrate once at module load. A failure here is non-fatal — we just treat
// the user as "unseen" and let the overlay auto-open; they can skip it.
void AsyncStorage.getItem(KEY)
  .then((v) => set({ seen: v === "1", loaded: true }))
  .catch(() => set({ loaded: true }));

export const onboardingStore = {
  /** External store contract — same reference while nothing has changed. */
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },

  /** Manually open from Profile → "앱 소개 다시 보기". Doesn't touch the seen flag. */
  openManual: () => set({ open: true }),
  close: () => set({ open: false }),

  /** Mark the walkthrough as seen and close it; persists across launches. */
  markSeen() {
    void AsyncStorage.setItem(KEY, "1").catch(() => undefined);
    set({ seen: true, open: false });
  },

  /** Called from the overlay once auth has settled: open if never seen. */
  autoOpenIfFirstTime() {
    if (state.loaded && !state.seen && !state.open) set({ open: true });
  },

  /** Dev helper: forget the "seen" flag so onboarding fires again at next launch. */
  reset() {
    void AsyncStorage.removeItem(KEY).catch(() => undefined);
    set({ seen: false, open: false });
  },
};

export function useOnboarding() {
  // getServerSnapshot === getSnapshot keeps web/SSR hydration consistent.
  return useSyncExternalStore(onboardingStore.subscribe, onboardingStore.get, onboardingStore.get);
}
