import { useSyncExternalStore } from "react";
import type { ApiSpecies } from "../../api/types";
import type { Candidate, PickedPhoto, SaveResult } from "../../api/discover";

/**
 * Shared state for the 발견 flow (select → analyzing → result → collected), one photo at a time.
 * Kept outside React so tab and stack screens can both read it without a provider.
 */
export type PhotoWork = {
  /** Idempotency keys stay with the photo so a retry never double-uploads or double-saves. */
  intentKey: string;
  identifyKey: string;
  saveKey: string;
  mediaId?: string;
  jobId?: string;
  candidates?: Candidate[];
  error?: string;
  saved?: SaveResult & { species: ApiSpecies | null };
};

type DiscoverState = {
  photos: PickedPhoto[];
  selected: string[];
  /** Index into `selected` of the photo being analysed / confirmed. */
  current: number;
  pickedCandidate: number;
  /** Species chosen by name when the AI list missed. */
  manual: ApiSpecies | null;
  work: Record<string, PhotoWork>;
  /** Dive log the photos are linked to (matched by date, or picked by the diver). */
  logId: string | null;
};

const initial: DiscoverState = { photos: [], selected: [], current: 0, pickedCandidate: 0, manual: null, work: {}, logId: null };
let state: DiscoverState = initial;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const discoverStore = {
  get: () => state,
  set(patch: Partial<DiscoverState>) {
    state = { ...state, ...patch };
    emit();
  },
  reset() {
    state = initial;
    emit();
  },
  toggle(id: string) {
    const i = state.selected.indexOf(id);
    const selected = i >= 0 ? state.selected.filter((x) => x !== id) : [...state.selected, id];
    discoverStore.set({ selected });
  },
  patchWork(id: string, patch: Partial<PhotoWork>) {
    const prev = state.work[id];
    if (!prev) return;
    discoverStore.set({ work: { ...state.work, [id]: { ...prev, ...patch } } });
  },
  currentPhoto(): PickedPhoto | undefined {
    const id = state.selected[state.current];
    return state.photos.find((p) => p.id === id);
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useDiscover() {
  return useSyncExternalStore(discoverStore.subscribe, discoverStore.get, discoverStore.get);
}
