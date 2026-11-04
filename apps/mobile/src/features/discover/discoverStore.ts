import { useSyncExternalStore } from "react";

/**
 * Tiny shared state for the 발견 flow (select → analyzing → result → collected).
 * Kept outside React so tab and stack screens can both read it without a provider.
 */
type DiscoverState = { selected: string[]; pickedCandidate: number };

let state: DiscoverState = { selected: ["a1", "a2"], pickedCandidate: 0 };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const discoverStore = {
  get: () => state,
  set(patch: Partial<DiscoverState>) {
    state = { ...state, ...patch };
    emit();
  },
  toggle(id: string) {
    const i = state.selected.indexOf(id);
    const selected = i >= 0 ? state.selected.filter((x) => x !== id) : [...state.selected, id];
    discoverStore.set({ selected });
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useDiscover() {
  return useSyncExternalStore(discoverStore.subscribe, discoverStore.get, discoverStore.get);
}
