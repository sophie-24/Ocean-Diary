import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ApiSpecies } from "../../api/types";
import type { Candidate, PickedPhoto, SaveResult } from "../../api/discover";
import { localDate } from "../../api/discover";
import type { DiveLog } from "../log/logStore";
import { forgetKeptPhotos } from "./photoKeep";

/**
 * Shared state for the 발견 flow (select → analyzing → result → collected), one photo at a time.
 * Kept outside React so tab and stack screens can both read it without a provider, and saved to
 * the device so an interrupted session (app closed, phone locked) can pick up where it stopped.
 */
export type PhotoWork = {
  /** Idempotency keys stay with the photo so a retry never double-uploads or double-saves. */
  intentKey: string;
  identifyKey: string;
  saveKey: string;
  mediaId?: string;
  jobId?: string;
  candidates?: Candidate[];
  saved?: SaveResult & { species: ApiSpecies | null };
  skipped?: boolean;
};

/** Per shooting date: the dive log the diver picked, or null for "don't link". */
export type LogChoice = Record<string, string | null>;

type DiscoverState = {
  photos: PickedPhoto[];
  selected: string[];
  /** Index into `selected` of the photo being analysed / confirmed. */
  current: number;
  pickedCandidate: number;
  /** Species chosen by name when the AI list missed. */
  manual: ApiSpecies | null;
  work: Record<string, PhotoWork>;
  logChoice: LogChoice;
  /** Who this session belongs to; a different account never sees it. */
  owner: string | null;
};

const STORAGE_KEY = "ocean-diary:discover:v1";
const initial: DiscoverState = { photos: [], selected: [], current: 0, pickedCandidate: 0, manual: null, work: {}, logChoice: {}, owner: null };
let state: DiscoverState = initial;
let hydratedFor: string | null = null;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const done = state.photos.length === 0;
    const write = done ? AsyncStorage.removeItem(STORAGE_KEY) : AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    void write.catch(() => undefined);
  }, 300);
}

const emit = () => {
  listeners.forEach((l) => l());
  persist();
};

const isOpen = (w: PhotoWork | undefined) => !w || (!w.saved && !w.skipped);

export const discoverStore = {
  get: () => state,
  set(patch: Partial<DiscoverState>) {
    state = { ...state, ...patch };
    emit();
  },
  /** Load the saved session for this account (once per account). */
  async hydrate(owner: string) {
    if (hydratedFor === owner) return;
    hydratedFor = owner;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as DiscoverState) : null;
      if (saved && saved.owner === owner && Array.isArray(saved.photos)) {
        state = { ...initial, ...saved, manual: null, pickedCandidate: 0 };
      } else {
        state = { ...initial, owner };
        if (saved) forgetKeptPhotos();
      }
    } catch {
      state = { ...initial, owner };
    }
    listeners.forEach((l) => l());
  },
  /** Throw the session away (finished, "새로 시작", or signed out). */
  reset(clearOwner = false) {
    state = { ...initial, owner: clearOwner ? null : state.owner };
    if (clearOwner) hydratedFor = null;
    forgetKeptPhotos();
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
  chooseLog(date: string, logId: string | null) {
    discoverStore.set({ logChoice: { ...state.logChoice, [date]: logId } });
  },
  currentPhoto(): PickedPhoto | undefined {
    const id = state.selected[state.current];
    return state.photos.find((p) => p.id === id);
  },
  /** Index of the next photo still waiting after `from` (or the first one if none after). */
  nextOpen(from = state.current): number {
    const order = state.selected.map((_, i) => i);
    const after = order.filter((i) => i > from).concat(order.filter((i) => i <= from));
    return after.find((i) => i !== from && isOpen(state.work[state.selected[i]])) ?? -1;
  },
  /** Photos of a started run that are neither saved nor skipped. */
  openCount(): number {
    if (!Object.keys(state.work).length) return 0;
    return state.selected.filter((id) => isOpen(state.work[id])).length;
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useDiscover() {
  return useSyncExternalStore(discoverStore.subscribe, discoverStore.get, discoverStore.get);
}

/** "HH:MM" → minutes after midnight. */
const hm = (v: unknown) => {
  const m = typeof v === "string" ? /^(\d{1,2}):(\d{2})$/.exec(v.trim()) : null;
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export type LogMatch = {
  log: DiveLog | undefined;
  /** Logs dated the same day as the photo. */
  sameDay: DiveLog[];
  /** True when several logs fit and we picked one by guess (the diver should check). */
  guessed: boolean;
};

/**
 * Which dive log a photo belongs to. The diver's choice for that date wins; otherwise a single
 * same-day log is used, and with several the dive whose entry→exit window contains (or is closest
 * before) the shooting time.
 */
export function matchLog(photo: PickedPhoto | undefined, logs: DiveLog[] | undefined, choice: LogChoice): LogMatch {
  if (!photo?.takenAt || !logs) return { log: undefined, sameDay: [], guessed: false };
  const day = localDate(photo.takenAt);
  const sameDay = logs.filter((l) => l.date === day);
  if (day in choice) {
    const id = choice[day];
    return { log: id ? logs.find((l) => l.id === id) : undefined, sameDay, guessed: false };
  }
  if (sameDay.length <= 1) return { log: sameDay[0], sameDay, guessed: false };

  const t = new Date(photo.takenAt);
  const at = t.getHours() * 60 + t.getMinutes();
  let best: DiveLog | undefined;
  let bestScore = Infinity;
  for (const l of sameDay) {
    const start = hm(l.details.timeIn);
    if (start == null) continue;
    const end = hm(l.details.timeOut) ?? start + (Number(l.details.bottom) || 60);
    // Inside the dive window scores 0; otherwise distance in minutes (after the dive counts double).
    const score = at < start ? start - at : at <= end + 10 ? 0 : (at - end) * 2;
    if (score < bestScore) {
      bestScore = score;
      best = l;
    }
  }
  return { log: best ?? sameDay[0], sameDay, guessed: !best || bestScore > 0 };
}
