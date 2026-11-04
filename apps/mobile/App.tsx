import { useEffect, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "./src/lib/supabase";
import { CatalogCollectionSection } from "./src/features/catalog/CatalogCollectionSection";
import { SpeciesDetailModal } from "./src/features/catalog/SpeciesDetailModal";
import { AuthModal } from "./src/features/auth/AuthModal";
import { AccountSettingsModal } from "./src/features/account/AccountSettingsModal";
import type { Species } from "./src/types/species";
import type { ObservationCard, ObservationFilter, ObservationSummary } from "./src/types/observation";
import { ObservationListModal } from "./src/features/observations/ObservationListModal";
import { ObservationDetailModal } from "./src/features/observations/ObservationDetailModal";
import { PhotoPreviewModal } from "./src/features/observations/PhotoPreviewModal";
import { ObservationSavedModal } from "./src/features/observations/ObservationSavedModal";
import { IdentificationFlowModal } from "./src/features/observations/IdentificationFlowModal";
import { HomeDiscoverySection } from "./src/features/home/HomeDiscoverySection";
import { PhotoCaptureAction } from "./src/features/home/PhotoCaptureAction";
import type { ClientConfig } from "./src/types/clientConfig";
import type { IdentificationCandidate, SelectionSource } from "./src/types/identification";
import type { PhotoSelection } from "./src/types/photo";
import { Directory, File, Paths } from "expo-file-system";
import {
  AppState,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import catalog from "../../data/species/catalog.json";

type UploadIntent = {
  media_id: string;
  status: "pending_upload" | "ready";
  upload_url: string;
  method: "PUT";
  required_headers: Record<string, string>;
  expires_at: string;
};
type CollectionBody = {
  items: {
    species: Species;
    discovery_count: number;
    first_seen_at: string;
    latest_seen_at: string;
  }[];
  unidentified_count: number;
  total_species: number;
};
type ObservationPage = { items: ObservationCard[]; next_cursor: string | null };
type ObservationCreateBody = {
  observation: ObservationCard;
  species_summary: ObservationSummary | null;
};
type JobResponse = {
  job_id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  candidates: IdentificationCandidate[];
  error_code: string | null;
};
type RateLimitAction = "upload" | "identify" | "save" | "account";
type RateLimitWaits = Record<RateLimitAction, number>;
type DraftSnapshot = {
  version: 1;
  ownerUserId?: string | null;
  photo: PhotoSelection;
  mediaId: string | null;
  pendingMediaId?: string | null;
  pendingIntentKey?: string | null;
  jobId: string | null;
  identificationIdempotencyKey?: string | null;
  identificationRequestPending?: boolean;
  identificationStatus: JobResponse["status"] | "idle" | "timed_out";
  identificationCandidates: IdentificationCandidate[];
  selectedSpecies: Species | null;
  selectionSource: SelectionSource | null;
  regionLabel: string;
  observedAt: string;
  saveIdempotencyKey: string | null;
  saveRequestStarted?: boolean;
};
type PersistedDraft = DraftSnapshot | { version: 1; completedObservationId: string };

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8765").replace(/\/$/, "");
const DEV_AUTH_TOKEN = process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN ?? "";
const SUPPORTED_EXTERNAL_AI_CONSENT_VERSION = "v1";
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const API_REQUEST_TIMEOUT_MS = 30_000;
const IDENTIFICATION_REQUEST_TIMEOUT_MS = 30_000;
const PHOTO_UPLOAD_TIMEOUT_MS = 180_000;
// Expo's native file-system API is unavailable in web previews. Some preview
// runtimes report a non-web Platform.OS, so also detect the browser global
// before constructing any native File/Directory objects at module load time.
const IS_WEB_PREVIEW = Platform.OS === "web" || typeof document !== "undefined";
const DRAFT_FILE = IS_WEB_PREVIEW ? null : new File(Paths.document, "ocean-diary-active-draft-v1.json");
const DRAFT_PHOTO_NAME = /^ocean-diary-photo-\d+-[a-z0-9]+\.(?:jpg|png)$/i;

const localDateAndTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const pad = (part: number) => String(part).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
};

const colors = ["#E7B887", "#9DBCB0", "#B8A9C9", "#D7A28C", "#9DB4C9"];

const localPhotoExists = (uri: string) => {
  if (IS_WEB_PREVIEW) return true;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
};

export default function App() {
  const [catalogItems, setCatalogItems] = useState<Species[]>(catalog.species);
  const [catalogLoadState, setCatalogLoadState] = useState<"loading" | "online" | "offline">("loading");
  const [catalogRetryKey, setCatalogRetryKey] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Species | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSelection | null>(null);
  const [unavailablePhotoUri, setUnavailablePhotoUri] = useState<string | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabaseEnabled);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authCodeSent, setAuthCodeSent] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resumeUploadAfterAuth, setResumeUploadAfterAuth] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [clientConfigOutdated, setClientConfigOutdated] = useState(false);
  const [isLoadingClientConfig, setIsLoadingClientConfig] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [pendingUploadIntent, setPendingUploadIntent] = useState<UploadIntent | null>(null);
  const [pendingUploadRecoveryId, setPendingUploadRecoveryId] = useState<string | null>(null);
  const [pendingUploadIntentKey, setPendingUploadIntentKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showIdentification, setShowIdentification] = useState(false);
  const [identificationJobId, setIdentificationJobId] = useState<string | null>(null);
  const [identificationIdempotencyKey, setIdentificationIdempotencyKey] = useState<string | null>(null);
  const [identificationRequestPending, setIdentificationRequestPending] = useState(false);
  const [identificationStatus, setIdentificationStatus] = useState<JobResponse["status"] | "idle" | "timed_out">("idle");
  const [identificationCandidates, setIdentificationCandidates] = useState<IdentificationCandidate[]>([]);
  const [identificationError, setIdentificationError] = useState<string | null>(null);
  const [identificationDailyLimitReached, setIdentificationDailyLimitReached] = useState(false);
  const [manualSpeciesQuery, setManualSpeciesQuery] = useState("");
  const [manualSpeciesResults, setManualSpeciesResults] = useState<Species[]>([]);
  const [isSearchingManualSpecies, setIsSearchingManualSpecies] = useState(false);
  const [selectedSpeciesForSave, setSelectedSpeciesForSave] = useState<Species | null>(null);
  const [selectionSource, setSelectionSource] = useState<SelectionSource | null>(null);
  const [regionLabel, setRegionLabel] = useState("");
  const [observedAt, setObservedAt] = useState(() => new Date().toISOString());
  const initialObservedDateTime = localDateAndTime(observedAt);
  const [observedDate, setObservedDate] = useState(initialObservedDateTime.date);
  const [observedTime, setObservedTime] = useState(initialObservedDateTime.time);
  const [observedDateError, setObservedDateError] = useState<string | null>(null);
  const [saveIdempotencyKey, setSaveIdempotencyKey] = useState<string | null>(null);
  const [saveRequestStarted, setSaveRequestStarted] = useState(false);
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [rateLimitWaits, setRateLimitWaits] = useState<RateLimitWaits>({ upload: 0, identify: 0, save: 0, account: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNeedsReupload, setSaveNeedsReupload] = useState(false);
  const [savedObservation, setSavedObservation] = useState<ObservationCard | null>(null);
  const [savedSpeciesSummary, setSavedSpeciesSummary] = useState<ObservationSummary | null>(null);
  const [recentObservations, setRecentObservations] = useState<ObservationCard[]>([]);
  const [showObservationsList, setShowObservationsList] = useState(false);
  const [observationFilter, setObservationFilter] = useState<ObservationFilter>("all");
  const [allObservations, setAllObservations] = useState<ObservationCard[]>([]);
  const [observationCursor, setObservationCursor] = useState<string | null>(null);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<ObservationCard | null>(null);
  const [observationEditDate, setObservationEditDate] = useState("");
  const [observationEditRegion, setObservationEditRegion] = useState("");
  const [observationSpeciesQuery, setObservationSpeciesQuery] = useState("");
  const [observationSpeciesResults, setObservationSpeciesResults] = useState<Species[]>([]);
  const [isSearchingObservationSpecies, setIsSearchingObservationSpecies] = useState(false);
  const [editedObservationSpecies, setEditedObservationSpecies] = useState<Species | null>(null);
  const [hasObservationSpeciesEdit, setHasObservationSpeciesEdit] = useState(false);
  const [isSavingObservationEdit, setIsSavingObservationEdit] = useState(false);
  const [isDeletingObservation, setIsDeletingObservation] = useState(false);
  const [observationListError, setObservationListError] = useState<string | null>(null);
  const [observationDetailError, setObservationDetailError] = useState<string | null>(null);
  const [failedObservationPhoto, setFailedObservationPhoto] = useState<{ observationId: string; photoUrl: string } | null>(null);
  const [isRefreshingObservationPhoto, setIsRefreshingObservationPhoto] = useState(false);
  const [discoveredSpeciesCount, setDiscoveredSpeciesCount] = useState(0);
  const [unidentifiedDiscoveryCount, setUnidentifiedDiscoveryCount] = useState(0);
  const [discoveryCounts, setDiscoveryCounts] = useState<Record<string, number>>({});
  const [discoveryDates, setDiscoveryDates] = useState<Record<string, { first: string; latest: string }>>({});
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [collectionLoadError, setCollectionLoadError] = useState<string | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [draftAwaitingSignIn, setDraftAwaitingSignIn] = useState(false);
  const draftWriteQueue = useRef<Promise<void>>(Promise.resolve());
  const draftRecoveryKey = useRef("");
  const identificationCreateInFlight = useRef<string | null>(null);
  const identificationRequestController = useRef<AbortController | null>(null);
  const activeAuthUserId = useRef<string | null>(null);
  const privateRequestEpoch = useRef(0);
  const draftRequestEpoch = useRef(0);
  const observationDetailRefreshSequence = useRef(0);
  const latestObservationDetailRefresh = useRef(0);
  const authEventReceived = useRef(false);
  const observationDetailReturnToList = useRef(false);
  const accountDeletionNotified = useRef(false);
  const selectedPhotoRef = useRef<PhotoSelection | null>(selectedPhoto);
  selectedPhotoRef.current = selectedPhoto;
  const selectedObservationRef = useRef<ObservationCard | null>(selectedObservation);
  selectedObservationRef.current = selectedObservation;
  const selectedPhotoUnavailable = selectedPhoto?.uri === unavailablePhotoUri;
  const apiAuthToken = authSession?.access_token ?? (supabaseEnabled ? "" : DEV_AUTH_TOKEN);
  const catalogSearchRequest = useRef(0);
  const manualSearchRequest = useRef(0);
  const observationSpeciesSearchRequest = useRef(0);
  const observationListRequest = useRef(0);
  const observationRetryRequest = useRef<{
    cursor: string | null;
    append: boolean;
    unidentifiedOnly: boolean;
  } | null>(null);

  const enqueueDraftWrite = (snapshot: PersistedDraft | null): Promise<void> => {
    if (!DRAFT_FILE) return Promise.resolve();
    const write = draftWriteQueue.current.catch(() => undefined).then(async () => {
      if (snapshot === null) {
        if (DRAFT_FILE.exists) DRAFT_FILE.delete();
      } else {
        await DRAFT_FILE.write(JSON.stringify(snapshot));
      }
    });
    draftWriteQueue.current = write.catch(() => undefined);
    return write;
  };
  const applyAuthSession = (session: Session | null) => {
    const nextUserId = session?.user.id ?? null;
    if (activeAuthUserId.current !== nextUserId) {
      activeAuthUserId.current = nextUserId;
      privateRequestEpoch.current += 1;
    }
    setAuthSession(session);
  };

  const clearPrivateUiState = () => {
    observationSpeciesSearchRequest.current += 1;
    observationListRequest.current += 1;
    deleteDraftPhoto(selectedPhotoRef.current?.uri);
    void enqueueDraftWrite(null).catch(() => undefined);
    setRecentObservations([]);
    setAllObservations([]);
    setObservationCursor(null);
    setShowObservationsList(false);
    setObservationFilter("all");
    setSelectedObservation(null);
    observationDetailReturnToList.current = false;
    setObservationListError(null);
    setObservationDetailError(null);
    observationRetryRequest.current = null;
    setObservationEditDate("");
    setObservationEditRegion("");
    setObservationSpeciesQuery("");
    setObservationSpeciesResults([]);
    setEditedObservationSpecies(null);
    setHasObservationSpeciesEdit(false);
    setIsSearchingObservationSpecies(false);
    setDiscoveredSpeciesCount(0);
    setUnidentifiedDiscoveryCount(0);
    setDiscoveryCounts({});
    setDiscoveryDates({});
    setCollectionLoadError(null);
    setIsLoadingCollection(false);
    setIsLoadingObservations(false);
    setIsSavingObservationEdit(false);
    setIsDeletingObservation(false);
    setDraftHydrated(false);
    setShowPhotoPreview(false);
    setShowIdentification(false);
    setUploadError(null);
    setIdentificationError(null);
    setIdentificationDailyLimitReached(false);
    setSaveError(null);
    setSaveNeedsReupload(false);
    setSaveRequestStarted(false);
    setSavedObservation(null);
    setSavedSpeciesSummary(null);
    setSelectedPhoto(null);
    setUploadedMediaId(null);
    setPendingUploadIntent(null);
    setPendingUploadRecoveryId(null);
    setPendingUploadIntentKey(null);
    setIdentificationJobId(null);
    setIdentificationIdempotencyKey(null);
    setIdentificationRequestPending(false);
    setIdentificationStatus("idle");
    setIdentificationCandidates([]);
    setSelectedSpeciesForSave(null);
    setSelectionSource(null);
    setRegionLabel("");
    const resetObservedAt = new Date().toISOString();
    setObservedAt(resetObservedAt);
    const resetObservedDateTime = localDateAndTime(resetObservedAt);
    setObservedDate(resetObservedDateTime.date);
    setObservedTime(resetObservedDateTime.time);
    setObservedDateError(null);
    setSaveIdempotencyKey(null);
    setAuthCode("");
    setAuthEmail("");
    setAuthCodeSent(false);
    setAuthError(null);
    setShowAccountSettings(false);
    setResumeUploadAfterAuth(false);
    setIsUploadingPhoto(false);
    setIsSavingObservation(false);
    setIsDeletingAccount(false);
  };
  const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = init?.signal ? null : new AbortController();
    const timeout = controller
      ? setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS)
      : null;
    let response: Response;
    try {
      const networkResponse = await fetch(
        input,
        controller ? { ...init, signal: controller.signal } : init,
      );
      const body = await networkResponse.arrayBuffer();
      response = new Response(
        [204, 205, 304].includes(networkResponse.status) ? null : body,
        {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: networkResponse.headers,
        },
      );
    } catch (error) {
      if (controller && error instanceof Error && error.name === "AbortError") {
        throw new TypeError("서버 응답이 늦어지고 있어요. 연결을 확인하고 다시 시도해 주세요.");
      }
      throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    if (response.status === 410) {
      const body = await response.clone().json().catch(() => null);
      const code = body?.error?.code ?? body?.detail?.code;
      if (code === "ACCOUNT_DELETED" && !accountDeletionNotified.current) {
        accountDeletionNotified.current = true;
        applyAuthSession(null);
        clearPrivateUiState();
        setShowAuthModal(false);
        if (supabase) void supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        Alert.alert("계정이 삭제됐어요", "다른 기기에서 계정 삭제가 진행되어 이 기기의 기록과 로그인 정보를 정리했어요.");
      }
    }
    return response;
  };
  const species = useMemo(
    () =>
      catalogItems.filter((item) =>
        `${item.common_name_ko} ${item.scientific_name}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [catalogItems, query],
  );
  const manualSpecies = useMemo(
    () =>
      catalogItems.filter((item) =>
        `${item.common_name_ko} ${item.scientific_name}`
          .toLowerCase()
          .includes(manualSpeciesQuery.trim().toLowerCase()),
      ),
    [catalogItems, manualSpeciesQuery],
  );

  const visibleManualSpecies = manualSpeciesQuery.trim() ? manualSpeciesResults : manualSpecies;

  const beginRateLimitWait = (action: RateLimitAction, response: Response) => {
    const seconds = Number(response.headers.get("Retry-After"));
    if (Number.isFinite(seconds) && seconds > 0) {
      setRateLimitWaits((current) => ({ ...current, [action]: Math.ceil(seconds) }));
    }
  };

  useEffect(() => {
    if (!Object.values(rateLimitWaits).some((seconds) => seconds > 0)) return;
    const timer = setTimeout(() => {
      setRateLimitWaits((current) => ({
        upload: Math.max(0, current.upload - 1),
        identify: Math.max(0, current.identify - 1),
        save: Math.max(0, current.save - 1),
        account: Math.max(0, current.account - 1),
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [rateLimitWaits]);

  const refreshClientConfig = async () => {
    if (isLoadingClientConfig) return;
    setClientConfig(null);
    setClientConfigOutdated(false);
    setIsLoadingClientConfig(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/v1/client-config`);
      if (!response.ok) throw new Error("client config unavailable");
      const body = await response.json();
      if (typeof body.external_ai_processing !== "boolean") throw new Error("invalid client config");
      const provider = typeof body.external_ai_provider === "string" ? body.external_ai_provider : null;
      const consentVersion = typeof body.external_ai_consent_version === "string" ? body.external_ai_consent_version : null;
      if (body.external_ai_processing && (!provider || !consentVersion)) throw new Error("incomplete external AI config");
      if (body.external_ai_processing && consentVersion !== SUPPORTED_EXTERNAL_AI_CONSENT_VERSION) {
        setClientConfigOutdated(true);
        throw new Error("external AI disclosure update required");
      }
      setClientConfig({
        external_ai_processing: body.external_ai_processing,
        external_ai_provider: provider,
        external_ai_consent_version: consentVersion,
      });
    } catch {
      setClientConfig(null);
    } finally {
      setIsLoadingClientConfig(false);
    }
  };

  const refreshCollection = async () => {
    if (!apiAuthToken) return;
    const requestEpoch = privateRequestEpoch.current;
    setIsLoadingCollection(true);
    setCollectionLoadError(null);
    try {
      const headers = { Authorization: `Bearer ${apiAuthToken}` };
      const [collectionResponse, observationsResponse] = await Promise.all([
        apiFetch(`${API_BASE_URL}/v1/collection`, { headers }),
        apiFetch(`${API_BASE_URL}/v1/observations?limit=5`, { headers }),
      ]);
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (!collectionResponse.ok || !observationsResponse.ok) {
        throw new Error("collection request failed");
      }
      const [collectionBody, observationsBody] = await Promise.all([
        collectionResponse.json(),
        observationsResponse.json(),
      ]);
      if (requestEpoch !== privateRequestEpoch.current) return;
      const collection = collectionBody as CollectionBody;
      setDiscoveredSpeciesCount(collection.total_species ?? 0);
      setUnidentifiedDiscoveryCount(collection.unidentified_count ?? 0);
      setDiscoveryCounts(
        Object.fromEntries((collection.items ?? []).map((item) => [item.species.id, item.discovery_count])),
      );
      setDiscoveryDates(
        Object.fromEntries(
          (collection.items ?? []).map((item) => [
            item.species.id,
            { first: item.first_seen_at, latest: item.latest_seen_at },
          ]),
        ),
      );
      setRecentObservations(observationsBody.items ?? []);
    } catch {
      if (requestEpoch !== privateRequestEpoch.current) return;
      setCollectionLoadError("발견 기록을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      if (requestEpoch === privateRequestEpoch.current) setIsLoadingCollection(false);
    }
  };

  const fetchObservationPage = async (
    cursor: string | null,
    append: boolean,
    unidentifiedOnly = observationFilter === "unidentified",
  ) => {
    if (!apiAuthToken) {
      observationRetryRequest.current = { cursor, append, unidentifiedOnly };
      setObservationListError("발견 기록을 보려면 앱의 개발용 API 토큰을 설정해 주세요.");
      return;
    }
    if (isLoadingObservations && append) return;
    observationRetryRequest.current = { cursor, append, unidentifiedOnly };
    const requestEpoch = privateRequestEpoch.current;
    const requestId = ++observationListRequest.current;
    setIsLoadingObservations(true);
    setObservationListError(null);
    try {
      const cursorQuery = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const unidentifiedQuery = unidentifiedOnly ? "&unidentified_only=true" : "";
      const response = await apiFetch(`${API_BASE_URL}/v1/observations?limit=20${cursorQuery}${unidentifiedQuery}`, {
        headers: { Authorization: `Bearer ${apiAuthToken}` },
      });
      if (!response.ok) throw new Error("발견 목록을 불러오지 못했어요. 다시 시도해 주세요.");
      const page = (await response.json()) as ObservationPage;
      if (requestEpoch !== privateRequestEpoch.current || requestId !== observationListRequest.current) return;
      setAllObservations((current) => append ? [...current, ...page.items] : page.items);
      setObservationCursor(page.next_cursor);
      observationRetryRequest.current = null;
    } catch (error) {
      if (requestEpoch !== privateRequestEpoch.current || requestId !== observationListRequest.current) return;
      setObservationListError(error instanceof Error ? error.message : "발견 목록을 불러오지 못했어요.");
    } finally {
      if (requestEpoch === privateRequestEpoch.current && requestId === observationListRequest.current) {
        setIsLoadingObservations(false);
      }
    }
  };

  const refreshSelectedObservation = async (observation: ObservationCard): Promise<boolean> => {
    if (!apiAuthToken) return false;
    const requestEpoch = privateRequestEpoch.current;
    const requestId = ++observationDetailRefreshSequence.current;
    latestObservationDetailRefresh.current = requestId;
    try {
      const response = await apiFetch(`${API_BASE_URL}/v1/observations/${observation.id}`, {
        headers: { Authorization: `Bearer ${apiAuthToken}` },
      });
      if (
        !response.ok
        || requestEpoch !== privateRequestEpoch.current
        || requestId !== latestObservationDetailRefresh.current
        || selectedObservationRef.current?.id !== observation.id
      ) return false;
      const refreshed = (await response.json()) as ObservationCard;
      if (
        requestEpoch !== privateRequestEpoch.current
        || requestId !== latestObservationDetailRefresh.current
        || selectedObservationRef.current?.id !== observation.id
      ) return false;
      setSelectedObservation((current) => current?.id === refreshed.id ? refreshed : current);
      setRecentObservations((items) => items.map((item) => item.id === refreshed.id ? refreshed : item));
      setAllObservations((items) => {
        if (observationFilter === "unidentified" && refreshed.species_id !== null) {
          return items.filter((item) => item.id !== refreshed.id);
        }
        return items.map((item) => item.id === refreshed.id ? refreshed : item);
      });
      return true;
    } catch {
      // Keep the existing record visible; the next screen refresh can renew its photo URL.
      return false;
    }
  };

  const retryObservationPhoto = async () => {
    const observation = selectedObservation;
    if (!observation || isRefreshingObservationPhoto) return;
    setIsRefreshingObservationPhoto(true);
    setObservationDetailError(null);
    try {
      const refreshed = await refreshSelectedObservation(observation);
      const currentObservation = selectedObservationRef.current;
      if (currentObservation?.id !== observation.id) return;
      if (refreshed || currentObservation.photo_url !== observation.photo_url) {
        setFailedObservationPhoto(null);
      } else {
        setObservationDetailError("사진 주소를 새로 가져오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.");
      }
    } finally {
      setIsRefreshingObservationPhoto(false);
    }
  };

  const openObservationsList = () => {
    setObservationFilter("all");
    setShowObservationsList(true);
    setObservationListError(null);
    setAllObservations([]);
    setObservationCursor(null);
    void fetchObservationPage(null, false, false);
  };

  const openUnidentifiedObservations = () => {
    setObservationFilter("unidentified");
    setShowObservationsList(true);
    setObservationListError(null);
    setAllObservations([]);
    setObservationCursor(null);
    void fetchObservationPage(null, false, true);
  };

  const changeObservationFilter = (filter: "all" | "unidentified") => {
    const unidentifiedOnly = filter === "unidentified";
    setObservationFilter(filter);
    setObservationListError(null);
    setAllObservations([]);
    setObservationCursor(null);
    void fetchObservationPage(null, false, unidentifiedOnly);
  };

  const openObservationDetail = (observation: ObservationCard, returnToList = false) => {
    observationDetailReturnToList.current = returnToList;
    const date = new Date(observation.observed_at);
    const pad = (value: number) => String(value).padStart(2, "0");
    setObservationEditDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
    setObservationEditRegion(observation.region_label ?? "");
    setObservationSpeciesQuery("");
    setObservationSpeciesResults([]);
    setEditedObservationSpecies(observation.species);
    setHasObservationSpeciesEdit(false);
    setObservationDetailError(null);
    setFailedObservationPhoto(null);
    setSelectedObservation(observation);
    setShowObservationsList(false);
    void refreshSelectedObservation(observation);
  };

  const closeObservationDetail = () => {
    setSelectedObservation(null);
    if (observationDetailReturnToList.current) setShowObservationsList(true);
    observationDetailReturnToList.current = false;
  };

  const retryObservationPage = () => {
    const previousRequest = observationRetryRequest.current;
    if (previousRequest) {
      void fetchObservationPage(
        previousRequest.cursor,
        previousRequest.append,
        previousRequest.unidentifiedOnly,
      );
    } else {
      void fetchObservationPage(null, false, observationFilter === "unidentified");
    }
  };

  const saveObservationEdit = async () => {
    if (!selectedObservation || isSavingObservationEdit) return;
    const requestEpoch = privateRequestEpoch.current;
    const returnToList = observationDetailReturnToList.current;
    const listFilter = observationFilter;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(observationEditDate)) {
      setObservationDetailError("날짜를 YYYY-MM-DD 형식으로 입력해 주세요.");
      return;
    }
    const oldDate = new Date(selectedObservation.observed_at);
    const [year, month, day] = observationEditDate.split("-").map(Number);
    const editedDate = new Date(year, month - 1, day, oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
    if (Number.isNaN(editedDate.getTime()) || editedDate.getFullYear() !== year || editedDate.getMonth() !== month - 1 || editedDate.getDate() !== day) {
      setObservationDetailError("실제로 존재하는 날짜를 입력해 주세요.");
      return;
    }
    setIsSavingObservationEdit(true);
    setObservationDetailError(null);
    try {
      const body: Record<string, unknown> = {
        observed_at: editedDate.toISOString(),
        region_label: observationEditRegion.trim() || null,
      };
      if (hasObservationSpeciesEdit) {
        body.species_id = editedObservationSpecies?.id ?? null;
        body.identified_by = editedObservationSpecies ? "user_selected" : "unidentified";
      }
      const response = await apiFetch(`${API_BASE_URL}/v1/observations/${selectedObservation.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiAuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (!response.ok) throw new Error("발견 기록을 수정하지 못했어요. 다시 시도해 주세요.");
      const updated = (await response.json()) as ObservationCard;
      setSelectedObservation(updated);
      setRecentObservations((items) => items.map((item) => item.id === updated.id ? updated : item));
      setAllObservations((items) => {
        if (observationFilter === "unidentified" && updated.species_id !== null) {
          return items.filter((item) => item.id !== updated.id);
        }
        return items.map((item) => item.id === updated.id ? updated : item);
      });
      setEditedObservationSpecies(updated.species);
      setHasObservationSpeciesEdit(false);
      await refreshCollection();
      if (returnToList) {
        await fetchObservationPage(null, false, listFilter === "unidentified");
      }
    } catch (error) {
      if (requestEpoch !== privateRequestEpoch.current) return;
      setObservationDetailError(error instanceof Error ? error.message : "발견 기록을 수정하지 못했어요.");
    } finally {
      if (requestEpoch === privateRequestEpoch.current) setIsSavingObservationEdit(false);
    }
  };

  const confirmDeleteObservation = () => {
    if (!selectedObservation || isDeletingObservation) return;
    Alert.alert("발견 기록을 삭제할까요?", "이 기록은 도감에서 숨겨지고, 다른 기록에서 사용 중이지 않은 사진은 함께 삭제돼요.", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => void deleteSelectedObservation() },
    ]);
  };

  const deleteSelectedObservation = async () => {
    if (!selectedObservation || isDeletingObservation) return;
    const requestEpoch = privateRequestEpoch.current;
    setIsDeletingObservation(true);
    setObservationDetailError(null);
    try {
      const response = await apiFetch(`${API_BASE_URL}/v1/observations/${selectedObservation.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiAuthToken}` },
      });
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (!response.ok) throw new Error("발견 기록을 삭제하지 못했어요. 다시 시도해 주세요.");
      const deletedId = selectedObservation.id;
      setRecentObservations((items) => items.filter((item) => item.id !== deletedId));
      setAllObservations((items) => items.filter((item) => item.id !== deletedId));
      closeObservationDetail();
      await refreshCollection();
    } catch (error) {
      if (requestEpoch !== privateRequestEpoch.current) return;
      setObservationDetailError(error instanceof Error ? error.message : "발견 기록을 삭제하지 못했어요.");
    } finally {
      if (requestEpoch === privateRequestEpoch.current) setIsDeletingObservation(false);
    }
  };

  useEffect(() => {
    const searchTerm = observationSpeciesQuery.trim();
    const requestId = ++observationSpeciesSearchRequest.current;
    let active = true;
    if (!searchTerm) {
      setObservationSpeciesResults([]);
      setIsSearchingObservationSpecies(false);
      return () => { active = false; };
    }
    setObservationSpeciesResults([]);
    setIsSearchingObservationSpecies(true);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/v1/species?limit=50&query=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error("species search failed");
        const body = await response.json();
        if (active && requestId === observationSpeciesSearchRequest.current && Array.isArray(body.items)) {
          setObservationSpeciesResults(body.items as Species[]);
        }
      } catch {
        const fallback = catalog.species.filter((item) =>
          `${item.common_name_ko} ${item.scientific_name}`.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        if (active && requestId === observationSpeciesSearchRequest.current) setObservationSpeciesResults(fallback);
      } finally {
        if (active && requestId === observationSpeciesSearchRequest.current) setIsSearchingObservationSpecies(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [observationSpeciesQuery]);

  const refreshExistingJob = async (jobId: string) => {
    const requestEpoch = privateRequestEpoch.current;
    const deadline = Date.now() + 60_000;
    let pollDelayMs = 1_500;
    let currentJob: JobResponse;
    const initialResponse = await apiFetch(`${API_BASE_URL}/v1/identification-jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiAuthToken}` },
    });
    if (requestEpoch !== privateRequestEpoch.current) return;
    if (!initialResponse.ok) throw new Error("식별 상태를 불러오지 못했어요.");
    currentJob = (await initialResponse.json()) as JobResponse;
    setIdentificationStatus(currentJob.status);
    setIdentificationCandidates(currentJob.candidates ?? []);
    if (currentJob.status === "failed") {
      setIdentificationError("사진을 식별하지 못했어요. 직접 생물을 골라 주세요.");
      return;
    }
    while (Date.now() < deadline && (currentJob.status === "queued" || currentJob.status === "running")) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(pollDelayMs, deadline - Date.now())));
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (Date.now() >= deadline) break;
      const response = await apiFetch(`${API_BASE_URL}/v1/identification-jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${apiAuthToken}` },
      });
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (!response.ok) throw new Error("식별 상태를 확인하지 못했어요.");
      currentJob = (await response.json()) as JobResponse;
      setIdentificationStatus(currentJob.status);
      pollDelayMs = Math.min(Math.ceil(pollDelayMs * 1.5), 8_000);
    }
    if (currentJob.status === "queued" || currentJob.status === "running") {
      setIdentificationStatus("timed_out");
      setIdentificationError("식별이 오래 걸리고 있어요. 직접 생물을 고르거나 미확인으로 기록해 주세요.");
      return;
    }
    setIdentificationCandidates(currentJob.candidates ?? []);
    if (currentJob.status === "failed") setIdentificationError("사진을 식별하지 못했어요. 직접 생물을 골라 주세요.");
  };

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && !authEventReceived.current) {
        applyAuthSession(data.session);
        setAuthReady(true);
      }
    }).catch(() => {
      if (active) setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      authEventReceived.current = true;
      const previousUserId = activeAuthUserId.current;
      applyAuthSession(session);
      setAuthReady(true);
      if (previousUserId && previousUserId !== (session?.user.id ?? null)) clearPrivateUiState();
      if (session) {
        accountDeletionNotified.current = false;
        setShowAuthModal(false);
        setAuthCode("");
        setAuthError(null);
      } else if (event === "SIGNED_OUT") clearPrivateUiState();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    let active = true;
    let deferredForSignIn = false;
    const activeUserId = authSession?.user.id ?? null;
    setDraftHydrated(false);
    setDraftAwaitingSignIn(false);
    const restoreDraft = async () => {
      let recoveredMediaId: string | null = null;
      let recoveredPhotoUri: string | null = null;
      try {
        // Account changes enqueue a draft purge. Wait for it before reading so
        // the next account cannot race with the previous account's local draft.
        await draftWriteQueue.current.catch(() => undefined);
        if (!active) return;
        setDraftAwaitingSignIn(false);
        if (!DRAFT_FILE || !DRAFT_FILE.exists) return;
        const draft = JSON.parse(await DRAFT_FILE.text()) as PersistedDraft;
        if ("completedObservationId" in draft) {
          if (DRAFT_FILE?.exists) DRAFT_FILE.delete();
          if (active) {
            Alert.alert("발견을 저장했어요", "저장한 기록은 도감에서 확인할 수 있어요.");
          }
          return;
        }
        recoveredMediaId = draft.mediaId ?? draft.pendingMediaId ?? null;
        recoveredPhotoUri = typeof draft.photo?.uri === "string" ? draft.photo.uri : null;
        if (draft.ownerUserId && !activeUserId) {
          deferredForSignIn = true;
          setDraftAwaitingSignIn(true);
          return;
        }
        if (draft.ownerUserId && draft.ownerUserId !== activeUserId) {
          throw new Error("Draft belongs to another account");
        }
        if (draft.version !== 1 || !draft.photo || typeof draft.photo.uri !== "string") {
          throw new Error("Invalid saved draft");
        }
        if (!new File(draft.photo.uri).exists) throw new Error("Saved photo no longer exists");
        if (!active) return;
        setSelectedPhoto(draft.photo);
        setUploadedMediaId(draft.mediaId);
        setPendingUploadRecoveryId(draft.mediaId ? null : draft.pendingMediaId ?? null);
        setPendingUploadIntentKey(draft.pendingIntentKey ?? null);
        setPendingUploadIntent(null);
        setIdentificationJobId(draft.jobId);
        setIdentificationIdempotencyKey(draft.identificationIdempotencyKey ?? null);
        setIdentificationRequestPending(draft.identificationRequestPending === true);
        setIdentificationStatus(draft.identificationStatus ?? "idle");
        setIdentificationCandidates(draft.identificationCandidates ?? []);
        setSelectedSpeciesForSave(draft.selectedSpecies ?? null);
        setSelectionSource(draft.selectionSource ?? null);
        setRegionLabel(draft.regionLabel ?? "");
        const restoredObservedAt = draft.observedAt ?? new Date().toISOString();
        setObservedAt(restoredObservedAt);
        const restoredDateTime = localDateAndTime(restoredObservedAt);
        setObservedDate(restoredDateTime.date);
        setObservedTime(restoredDateTime.time);
        setObservedDateError(null);
        setSaveIdempotencyKey(draft.saveIdempotencyKey ?? null);
        const restoredSaveRequestStarted = draft.saveRequestStarted === true;
        setSaveRequestStarted(restoredSaveRequestStarted);
        setSaveError(
          restoredSaveRequestStarted
            ? "이전 저장 요청의 응답을 확인하지 못했어요. 같은 내용으로 다시 저장해 완료 여부를 확인해 주세요."
            : null,
        );
        setShowIdentification(Boolean(draft.mediaId));
        setShowPhotoPreview(!draft.mediaId);
      } catch (error) {
        deleteDraftPhoto(recoveredPhotoUri ?? undefined);
        if (recoveredMediaId && apiAuthToken) {
          void apiFetch(`${API_BASE_URL}/v1/media/${recoveredMediaId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${apiAuthToken}` },
          }).catch(() => undefined);
        }
        try {
          if (DRAFT_FILE?.exists) DRAFT_FILE.delete();
        } catch {
          // Ignore inaccessible or malformed local draft files.
        }
        if (active && error instanceof Error && error.message === "Saved photo no longer exists") {
          Alert.alert("사진 초안을 복구할 수 없어요", "기기 저장 공간을 정리하는 과정에서 임시 사진이 사라졌어요. 사진을 다시 선택해 발견 기록을 이어가 주세요.");
        }
      } finally {
        if (active) pruneOrphanedDraftPhotos(recoveredPhotoUri);
        if (active && !deferredForSignIn) setDraftHydrated(true);
      }
    };
    void restoreDraft();
    return () => { active = false; };
  }, [authReady, authSession?.user.id]);

  useEffect(() => {
    if (!draftHydrated) return;
    const snapshot: DraftSnapshot | null = selectedPhoto
      ? {
          version: 1,
          ownerUserId: authSession?.user.id ?? null,
          photo: selectedPhoto,
          mediaId: uploadedMediaId,
          pendingMediaId: pendingUploadIntent?.media_id ?? pendingUploadRecoveryId,
          pendingIntentKey: pendingUploadIntentKey,
          jobId: identificationJobId,
          identificationIdempotencyKey,
          identificationRequestPending,
          identificationStatus,
          identificationCandidates,
          selectedSpecies: selectedSpeciesForSave,
          selectionSource,
          regionLabel,
          observedAt,
          saveIdempotencyKey,
          saveRequestStarted,
        }
      : null;
    void enqueueDraftWrite(snapshot).catch(() => undefined);
  }, [draftHydrated, authSession?.user.id, selectedPhoto, uploadedMediaId, pendingUploadIntent, pendingUploadRecoveryId, pendingUploadIntentKey, identificationJobId, identificationIdempotencyKey, identificationRequestPending, identificationStatus, identificationCandidates, selectedSpeciesForSave, selectionSource, regionLabel, observedAt, saveIdempotencyKey, saveRequestStarted]);
  useEffect(() => {
    if (showPhotoPreview) void refreshClientConfig();
  }, [showPhotoPreview]);

  useEffect(() => {
    void refreshCollection();
  }, [apiAuthToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" || !apiAuthToken) return;
      void refreshCollection();
      if (showObservationsList) void fetchObservationPage(null, false, observationFilter === "unidentified");
      if (selectedObservation) void refreshSelectedObservation(selectedObservation);
    });
    return () => subscription.remove();
  }, [apiAuthToken, showObservationsList, observationFilter, selectedObservation?.id]);

  useEffect(() => {
    if (!draftHydrated || !apiAuthToken || !uploadedMediaId) return;
    const recoveryId = identificationJobId ?? uploadedMediaId;
    if (draftRecoveryKey.current === recoveryId) return;
    if (identificationJobId) {
      const requestEpoch = privateRequestEpoch.current;
      draftRecoveryKey.current = recoveryId;
      void refreshExistingJob(identificationJobId).catch(() => {
        if (requestEpoch === privateRequestEpoch.current) {
          setIdentificationError("식별 상태를 불러오지 못했어요. 직접 생물을 고르거나 미확인으로 기록할 수 있어요.");
        }
      });
    } else if (
      identificationRequestPending
      || identificationStatus === "idle"
      || identificationStatus === "queued"
    ) {
      if (
        identificationRequestPending
        && identificationIdempotencyKey
        && identificationCreateInFlight.current === identificationIdempotencyKey
      ) return;
      draftRecoveryKey.current = recoveryId;
      void identifyUploadedPhoto(uploadedMediaId);
    }
  }, [draftHydrated, apiAuthToken, uploadedMediaId, identificationJobId, identificationIdempotencyKey, identificationRequestPending, identificationStatus]);

  useEffect(() => {
    const requestId = ++catalogSearchRequest.current;
    const searchTerm = query.trim();
    let active = true;
    const timer = setTimeout(async () => {
      const search = searchTerm ? `&query=${encodeURIComponent(searchTerm)}` : "";
      setCatalogLoadState("loading");
      try {
        const response = await apiFetch(`${API_BASE_URL}/v1/species?limit=50${search}`);
        if (!response.ok) throw new Error("catalog unavailable");
        const body = await response.json();
        if (!Array.isArray(body.items)) throw new Error("invalid catalog response");
        if (active && requestId === catalogSearchRequest.current) {
          setCatalogItems(body.items as Species[]);
          setCatalogLoadState("online");
        }
      } catch {
        if (active && requestId === catalogSearchRequest.current) {
          setCatalogItems(catalog.species);
          setCatalogLoadState("offline");
        }
      }
    }, searchTerm ? 300 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, catalogRetryKey]);

  useEffect(() => {
    const searchTerm = manualSpeciesQuery.trim();
    const requestId = ++manualSearchRequest.current;
    let active = true;
    if (!searchTerm) {
      setManualSpeciesResults([]);
      setIsSearchingManualSpecies(false);
      return () => { active = false; };
    }
    setManualSpeciesResults([]);
    setIsSearchingManualSpecies(true);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/v1/species?limit=50&query=${encodeURIComponent(searchTerm)}`,
        );
        if (!response.ok) throw new Error("species search failed");
        const body = await response.json();
        if (active && requestId === manualSearchRequest.current && Array.isArray(body.items)) {
          setManualSpeciesResults(body.items as Species[]);
        }
      } catch {
        if (active && requestId === manualSearchRequest.current) setManualSpeciesResults(manualSpecies);
      } finally {
        if (active && requestId === manualSearchRequest.current) setIsSearchingManualSpecies(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [manualSpeciesQuery, manualSpecies]);

  const returnToUploadForConsent = (mediaId: string, requestEpoch: number) => {
    if (requestEpoch !== privateRequestEpoch.current) return;
    if (apiAuthToken) {
      void apiFetch(`${API_BASE_URL}/v1/media/${mediaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiAuthToken}` },
      }).catch(() => undefined);
    }
    setUploadedMediaId(null);
    setPendingUploadIntent(null);
    setPendingUploadRecoveryId(null);
    setPendingUploadIntentKey(null);
    setIdentificationJobId(null);
    setIdentificationIdempotencyKey(null);
    setIdentificationRequestPending(false);
    setIdentificationStatus("idle");
    setIdentificationError(null);
    setShowIdentification(false);
    setShowPhotoPreview(true);
    setUploadError("사진 분석 방식이 변경되어 안내를 다시 확인해야 해요. 내용을 확인한 뒤 사진을 다시 업로드해 주세요.");
    void refreshClientConfig();
  };

  const identifyUploadedPhoto = async (mediaId: string, retryAttempt = false) => {
    identificationRequestController.current?.abort();
    const requestEpoch = privateRequestEpoch.current;
    const draftEpoch = ++draftRequestEpoch.current;
    const requestController = new AbortController();
    identificationRequestController.current = requestController;
    const isCurrentDraftRequest = () =>
      requestEpoch === privateRequestEpoch.current
      && draftEpoch === draftRequestEpoch.current;
    const existingMediaKey = identificationIdempotencyKey?.startsWith(`identify-${mediaId}`)
      ? identificationIdempotencyKey
      : null;
    const requestIdempotencyKey = retryAttempt
      && !(identificationRequestPending && existingMediaKey)
      ? `identify-${mediaId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      : existingMediaKey ?? `identify-${mediaId}`;
    identificationCreateInFlight.current = requestIdempotencyKey;
    draftRecoveryKey.current = mediaId;
    setIdentificationDailyLimitReached(false);
    setShowIdentification(true);
    setIdentificationStatus("queued");
    setIdentificationError(null);
    setIdentificationCandidates([]);
    setIdentificationJobId(null);
    setIdentificationIdempotencyKey(requestIdempotencyKey);
    setIdentificationRequestPending(true);
    setSelectedSpeciesForSave(null);
    setSelectionSource(null);
    setSaveIdempotencyKey(null);
    setSaveError(null);
    setSaveRequestStarted(false);
    try {
      if (!selectedPhoto) throw new Error("사진 복구 정보를 확인할 수 없어요. 사진을 다시 선택해 주세요.");
      await enqueueDraftWrite({
        version: 1,
        ownerUserId: authSession?.user.id ?? null,
        photo: selectedPhoto,
        mediaId,
        pendingMediaId: null,
        pendingIntentKey: null,
        jobId: null,
        identificationIdempotencyKey: requestIdempotencyKey,
        identificationRequestPending: true,
        identificationStatus: "queued",
        identificationCandidates: [],
        selectedSpecies: null,
        selectionSource: null,
        regionLabel,
        observedAt,
        saveIdempotencyKey: null,
        saveRequestStarted: false,
      });
      if (!isCurrentDraftRequest()) return;
      const requestTimeout = setTimeout(
        () => requestController.abort(),
        IDENTIFICATION_REQUEST_TIMEOUT_MS,
      );
      let createResponse: Response;
      try {
        createResponse = await apiFetch(`${API_BASE_URL}/v1/identification-jobs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiAuthToken}`,
            "Content-Type": "application/json",
            "Idempotency-Key": requestIdempotencyKey,
          },
          body: JSON.stringify({ media_id: mediaId }),
          signal: requestController.signal,
        });
      } finally {
        clearTimeout(requestTimeout);
      }
      if (!isCurrentDraftRequest()) return;
      const createBody = await createResponse.json().catch(() => null);
      if (!isCurrentDraftRequest()) return;
      if (!createResponse.ok || !createBody?.job_id) {
        if (createResponse.status >= 400 && createResponse.status < 500) {
          setIdentificationRequestPending(false);
        }
        const errorCode = createBody?.error?.code ?? createBody?.detail?.code;
        if (errorCode === "RATE_LIMITED") beginRateLimitWait("identify", createResponse);
        if (errorCode === "AI_PROVIDER_CIRCUIT_OPEN") {
          beginRateLimitWait("identify", createResponse);
          throw new Error("AI 식별 서비스가 잠시 불안정해 자동 식별을 쉬고 있어요. 잠시 뒤 다시 시도하거나 생물을 직접 선택해 주세요.");
        }
        if (errorCode === "IDENTIFICATION_DAILY_LIMIT") {
          setIdentificationDailyLimitReached(true);
          throw new Error("오늘 사용할 수 있는 AI 식별 횟수를 다 썼어요. 한국 시간 자정에 다시 이용할 수 있고, 지금은 종 이름을 직접 찾거나 미확인으로 기록할 수 있어요.");
        }
        if (errorCode === "EXTERNAL_AI_CONSENT_REQUIRED") {
          returnToUploadForConsent(mediaId, requestEpoch);
          return;
        }
        throw new Error(
          errorCode === "RATE_LIMITED"
            ? "요청이 잠시 많아요. 조금 기다린 뒤 식별을 다시 시도하거나 직접 생물을 골라 주세요."
            : "식별 작업을 시작하지 못했어요. 직접 생물을 고르거나 미확인으로 기록할 수 있어요.",
        );
      }
      const initialJob = createBody as JobResponse;
      draftRecoveryKey.current = initialJob.job_id;
      setIdentificationJobId(initialJob.job_id);
      setIdentificationRequestPending(false);
      setIdentificationStatus(initialJob.status);
      if (initialJob.status === "succeeded" || initialJob.status === "failed") {
        if (initialJob.error_code === "EXTERNAL_AI_CONSENT_REQUIRED") {
          returnToUploadForConsent(mediaId, requestEpoch);
          return;
        }
        setIdentificationCandidates(initialJob.candidates ?? []);
        if (initialJob.status === "failed") setIdentificationError("사진을 식별하지 못했어요. 직접 선택해 주세요.");
        return;
      }

      const deadline = Date.now() + 60_000;
      let pollDelayMs = 1_500;
      let currentJob = initialJob;
      while (Date.now() < deadline && (currentJob.status === "queued" || currentJob.status === "running")) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(pollDelayMs, deadline - Date.now())));
        if (!isCurrentDraftRequest()) return;
        if (Date.now() >= deadline) break;
        const jobResponse = await apiFetch(`${API_BASE_URL}/v1/identification-jobs/${initialJob.job_id}`, {
          headers: { Authorization: `Bearer ${apiAuthToken}` },
          signal: requestController.signal,
        });
        if (!isCurrentDraftRequest()) return;
        if (!jobResponse.ok) throw new Error("식별 상태를 확인하지 못했어요. 직접 생물을 골라 주세요.");
        currentJob = (await jobResponse.json()) as JobResponse;
        if (!isCurrentDraftRequest()) return;
        setIdentificationStatus(currentJob.status);
        pollDelayMs = Math.min(Math.ceil(pollDelayMs * 1.5), 8_000);
      }
      if (currentJob.status === "queued" || currentJob.status === "running") {
        setIdentificationStatus("timed_out");
        setIdentificationError("식별이 오래 걸리고 있어요. 직접 생물을 고르거나 미확인으로 기록해 주세요.");
      } else {
        setIdentificationStatus(currentJob.status);
        if (currentJob.status === "failed" && currentJob.error_code === "EXTERNAL_AI_CONSENT_REQUIRED") {
          returnToUploadForConsent(mediaId, requestEpoch);
          return;
        }
        setIdentificationCandidates(currentJob.candidates ?? []);
        if (currentJob.status === "failed") setIdentificationError("사진을 식별하지 못했어요. 직접 생물을 골라 주세요.");
      }
    } catch (error) {
      if (!isCurrentDraftRequest()) return;
      setIdentificationStatus("failed");
      setIdentificationError(
        error instanceof Error && error.name === "AbortError"
          ? "식별 요청 응답이 늦어지고 있어요. 같은 요청으로 다시 시도하거나 생물을 직접 골라 주세요."
          : error instanceof TypeError
          ? "서버에 연결할 수 없어요. 잠시 후 다시 시도하거나 직접 생물을 골라 주세요."
          : error instanceof Error
            ? error.message
            : "식별을 시작하지 못했어요. 직접 생물을 골라 주세요.",
      );
    } finally {
      if (identificationCreateInFlight.current === requestIdempotencyKey) {
        identificationCreateInFlight.current = null;
      }
      if (identificationRequestController.current === requestController) {
        identificationRequestController.current = null;
      }
    }
  };

  const chooseSpecies = (speciesToChoose: Species | null, source: SelectionSource) => {
    setSelectedSpeciesForSave(speciesToChoose);
    setSelectionSource(source);
    setSaveIdempotencyKey(`${uploadedMediaId ?? "draft"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    setSaveError(null);
    setSaveRequestStarted(false);
    setSaveNeedsReupload(false);
  };

  const updateObservedDateTime = (nextDate: string, nextTime: string) => {
    setObservedDate(nextDate);
    setObservedTime(nextTime);
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nextDate);
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(nextTime);
    if (!dateMatch || !timeMatch) {
      setObservedDateError("관찰 날짜는 YYYY-MM-DD, 시간은 HH:MM 형식으로 입력해 주세요.");
      return;
    }

    const [, yearText, monthText, dayText] = dateMatch;
    const [, hourText, minuteText] = timeMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const value = new Date(0);
    value.setFullYear(year, month - 1, day);
    value.setHours(hour, minute, 0, 0);
    if (
      year < 1 ||
      value.getFullYear() !== year ||
      value.getMonth() !== month - 1 ||
      value.getDate() !== day ||
      value.getHours() !== hour ||
      value.getMinutes() !== minute
    ) {
      setObservedDateError("실제로 존재하는 날짜와 시간을 입력해 주세요.");
      return;
    }

    setObservedAt(value.toISOString());
    setObservedDateError(null);
  };

  const saveObservation = async () => {
    if (!uploadedMediaId || !selectedPhoto || !selectionSource || isSavingObservation) return;
    const idempotencyKey = saveIdempotencyKey ?? `${uploadedMediaId}-${Date.now()}`;
    const requestEpoch = privateRequestEpoch.current;
    setSaveIdempotencyKey(idempotencyKey);
    setIsSavingObservation(true);
    setSaveError(null);
    setSaveRequestStarted(true);
    const saveAttemptDraft: DraftSnapshot = {
      version: 1,
      ownerUserId: authSession?.user.id ?? null,
      photo: selectedPhoto,
      mediaId: uploadedMediaId,
      jobId: identificationJobId,
      identificationIdempotencyKey,
      identificationRequestPending,
      identificationStatus,
      identificationCandidates,
      selectedSpecies: selectedSpeciesForSave,
      selectionSource,
      regionLabel,
      observedAt,
      saveIdempotencyKey: idempotencyKey,
      saveRequestStarted: true,
    };
    try {
      try {
        await enqueueDraftWrite(saveAttemptDraft);
      } catch {
        throw new Error("저장 요청 전에 기록 초안을 기기에 보존하지 못했어요. 기기 저장 공간을 확인한 뒤 같은 내용으로 다시 시도해 주세요.");
      }
      if (requestEpoch !== privateRequestEpoch.current) return;
      const response = await apiFetch(`${API_BASE_URL}/v1/observations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiAuthToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          media_id: uploadedMediaId,
          species_id: selectedSpeciesForSave?.id ?? null,
          identification_job_id: identificationJobId,
          identified_by: selectionSource,
          observed_at: observedAt,
          region_label: regionLabel.trim() || null,
        }),
      });
      if (requestEpoch !== privateRequestEpoch.current) return;
      const result = await response.json().catch(() => null) as ObservationCreateBody | null;
      if (!response.ok || !result?.observation) {
        const errorBody = result as unknown as { error?: { code?: string }; detail?: { code?: string } } | null;
        const code = errorBody?.error?.code ?? errorBody?.detail?.code;
        if (code === "RATE_LIMITED") beginRateLimitWait("save", response);
        if (code === "MEDIA_NOT_FOUND" || code === "MEDIA_NOT_READY") {
          setSaveNeedsReupload(true);
          throw new Error("임시 사진 보관 기간이 지났거나 사진을 찾을 수 없어요. 이 기기에 사진이 남아 있으면 다시 올려 기록을 저장할 수 있어요.");
        }
        throw new Error(
          code === "RATE_LIMITED"
            ? "저장 요청이 잠시 많아요. 조금 기다렸다가 다시 눌러 주세요. 입력한 내용은 보존했어요."
            : "발견을 저장하지 못했어요. 입력한 내용은 그대로 보존했어요.",
        );
      }
      const completionMarker: PersistedDraft = {
        version: 1,
        completedObservationId: result.observation.id,
      };
      try {
        await enqueueDraftWrite(completionMarker);
        if (DRAFT_FILE?.exists) DRAFT_FILE.delete();
      } catch {
        // A durable marker prevents an old save form from reopening if removing
        // the completed draft fails. The same idempotency key remains the last
        // fallback if the device cannot write either marker.
        try {
          await enqueueDraftWrite(completionMarker);
        } catch {
          // The server has already saved the record; a retry remains idempotent.
        }
      }
      if (requestEpoch !== privateRequestEpoch.current) return;
      setSavedObservation(result.observation);
      setSavedSpeciesSummary(result.species_summary ?? null);
      setShowIdentification(false);
      setIdentificationStatus("idle");
      deleteDraftPhoto(selectedPhoto?.uri);
      setSelectedPhoto(null);
      setUploadedMediaId(null);
      setPendingUploadIntent(null);
      setPendingUploadRecoveryId(null);
      setPendingUploadIntentKey(null);
      setIdentificationIdempotencyKey(null);
      setIdentificationRequestPending(false);
      setSelectedSpeciesForSave(null);
      setSelectionSource(null);
      setRegionLabel("");
      setSaveRequestStarted(false);
      setSaveNeedsReupload(false);
      void refreshCollection();
    } catch (error) {
      if (requestEpoch !== privateRequestEpoch.current) return;
      setSaveError(
        error instanceof TypeError
          ? "서버에 연결할 수 없어요. 네트워크를 확인하고 같은 저장을 다시 시도해 주세요."
          : error instanceof Error
            ? error.message
            : "저장하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      if (requestEpoch === privateRequestEpoch.current) setIsSavingObservation(false);
    }
  };

  const persistSelectedPhoto = async (photo: ImagePicker.ImagePickerAsset): Promise<PhotoSelection> => {
    const mimeType = photo.mimeType?.toLowerCase() ?? null;
    if (IS_WEB_PREVIEW) {
      return {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        fileName: photo.fileName,
        fileSize: photo.fileSize,
        mimeType: mimeType ?? undefined,
      };
    }
    const extension = mimeType === "image/png" ? "png" : "jpg";
    const destination = new File(Paths.document, `ocean-diary-photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`);
    await new File(photo.uri).copy(destination);
    return {
      uri: destination.uri,
      width: photo.width,
      height: photo.height,
      fileName: photo.fileName,
      fileSize: photo.fileSize,
      mimeType: mimeType ?? undefined,
    };
  };

  const deleteDraftPhoto = (uri: string | undefined) => {
    if (!uri || IS_WEB_PREVIEW) return;
    try {
      const isInAppDirectory = [Paths.cache.uri, Paths.document.uri].some((directoryUri) => {
        const prefix = directoryUri.endsWith("/") ? directoryUri : `${directoryUri}/`;
        return uri.startsWith(prefix);
      });
      if (!isInAppDirectory) return;
      const file = new File(uri);
      if (DRAFT_PHOTO_NAME.test(file.name) && file.exists) file.delete();
    } catch {
      // Local photo deletion is best effort; server-side privacy actions continue.
    }
  };

  const pruneOrphanedDraftPhotos = (retainedUri: string | null) => {
    if (IS_WEB_PREVIEW) return;
    for (const directory of [Paths.cache, Paths.document]) {
      try {
        for (const entry of new Directory(directory).list()) {
          if (!(entry instanceof File) || !DRAFT_PHOTO_NAME.test(entry.name) || entry.uri === retainedUri) continue;
          try {
            if (entry.exists) entry.delete();
          } catch {
            // Continue pruning other app-owned draft photos if one file is unavailable.
          }
        }
      } catch {
        // A cleanup failure must not prevent the user from restoring a valid draft.
      }
    }
  };

  const discardCurrentDraft = () => {
    draftRequestEpoch.current += 1;
    identificationRequestController.current?.abort();
    identificationRequestController.current = null;
    draftRecoveryKey.current = "";
    const mediaIdsToDelete = new Set(
      [uploadedMediaId, pendingUploadIntent?.media_id, pendingUploadRecoveryId].filter(
        (mediaId): mediaId is string => Boolean(mediaId),
      ),
    );
    if (apiAuthToken) {
      for (const mediaId of mediaIdsToDelete) {
        void apiFetch(`${API_BASE_URL}/v1/media/${mediaId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiAuthToken}` },
        }).catch(() => undefined);
      }
    }
    deleteDraftPhoto(selectedPhoto?.uri);
    setSelectedPhoto(null);
    setUploadedMediaId(null);
    setPendingUploadIntent(null);
    setPendingUploadRecoveryId(null);
    setPendingUploadIntentKey(null);
    setIdentificationJobId(null);
    setIdentificationIdempotencyKey(null);
    setIdentificationRequestPending(false);
    setIdentificationStatus("idle");
    setIdentificationCandidates([]);
    setSelectedSpeciesForSave(null);
    setSelectionSource(null);
    setRegionLabel("");
    setSaveIdempotencyKey(null);
    setSaveError(null);
    setSaveRequestStarted(false);
    setSaveNeedsReupload(false);
    setUploadError(null);
  };

  const resumeCurrentDraft = () => {
    if (!selectedPhoto) return;
    if (uploadedMediaId) {
      setShowPhotoPreview(false);
      setShowIdentification(true);
    } else {
      setShowIdentification(false);
      setShowPhotoPreview(true);
    }
  };

  const confirmCancelCurrentDraft = () => {
    if (isUploadingPhoto || isSavingObservation || saveRequestStarted) return;
    const providerMayBeRunning = Boolean(
      clientConfig?.external_ai_processing
      && (identificationStatus === "queued" || identificationStatus === "running"),
    );
    Alert.alert(
      "발견 기록을 취소할까요?",
      providerMayBeRunning
        ? "선택한 사진과 서버 식별 작업을 삭제해요. 이미 외부 분석이 시작됐다면 요청은 취소되지 않고 결과만 폐기돼요."
        : "선택한 사진과 진행 중인 식별 작업이 삭제돼요. 다시 기록하려면 새 사진을 선택해야 해요.",
      [
        { text: "계속 기록", style: "cancel", onPress: resumeCurrentDraft },
        {
          text: "기록 취소",
          style: "destructive",
          onPress: () => {
            discardCurrentDraft();
            setShowPhotoPreview(false);
            setShowIdentification(false);
          },
        },
      ],
    );
  };

  const retrySaveWithPhotoUpload = () => {
    if (!selectedPhoto || !localPhotoExists(selectedPhoto.uri)) {
      setSaveError(null);
      setSaveRequestStarted(false);
      setSaveNeedsReupload(false);
      setShowIdentification(false);
      Alert.alert("기기에 원래 사진이 없어요", "새 사진을 골라 발견 기록을 다시 시작해 주세요.");
      return;
    }
    setSaveError(null);
    draftRequestEpoch.current += 1;
    identificationRequestController.current?.abort();
    identificationRequestController.current = null;
    draftRecoveryKey.current = "";
    setSaveNeedsReupload(false);
    setUploadedMediaId(null);
    setPendingUploadIntent(null);
    setPendingUploadRecoveryId(null);
    setPendingUploadIntentKey(null);
    setIdentificationJobId(null);
    setIdentificationIdempotencyKey(null);
    setIdentificationRequestPending(false);
    setIdentificationStatus("idle");
    setIdentificationCandidates([]);
    setIdentificationError(null);
    setSelectedSpeciesForSave(null);
    setSelectionSource(null);
    setSaveIdempotencyKey(null);
    setSaveRequestStarted(false);
    setShowIdentification(false);
    setShowPhotoPreview(true);
  };
  const pickPhoto = async () => {
    if (!draftHydrated || draftAwaitingSignIn || isPickingPhoto || isUploadingPhoto || isSavingObservation || saveRequestStarted) return;
    setIsPickingPhoto(true);
    try {
      let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!permission.granted && permission.accessPrivileges !== "limited") {
        permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permission.granted && permission.accessPrivileges !== "limited") {
        Alert.alert(
          "사진 접근 권한이 필요해요",
          "발견 사진을 선택하려면 사진 보관함 접근을 허용해 주세요.",
          [
            { text: "나중에", style: "cancel" },
            ...(permission.canAskAgain
              ? []
              : [{ text: "설정 열기", onPress: () => void Linking.openSettings() }]),
          ],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        allowsEditing: false,
        exif: false,
        quality: 1,
      });

      if (result.canceled) return;
      const photo = result.assets[0];
      if (!photo) {
        Alert.alert("사진을 불러오지 못했어요", "사진을 다시 선택해 주세요.");
        return;
      }

      const selectedMimeType = photo.mimeType?.toLowerCase();
      if (selectedMimeType && selectedMimeType !== "image/jpeg" && selectedMimeType !== "image/png") {
        Alert.alert("지원하지 않는 사진 형식이에요", "현재는 JPEG 또는 PNG 사진만 기록할 수 있어요. 다른 사진을 선택해 주세요.");
        return;
      }
      if (photo.fileSize != null && (photo.fileSize <= 0 || photo.fileSize > MAX_PHOTO_BYTES)) {
        Alert.alert("사진 크기를 확인해 주세요", "사진은 15 MiB 이하로 선택해 주세요.");
        return;
      }

      const persistentPhoto = await persistSelectedPhoto(photo);
      discardCurrentDraft();
      const now = new Date().toISOString();
      setObservedAt(now);
      const currentDateTime = localDateAndTime(now);
      setObservedDate(currentDateTime.date);
      setObservedTime(currentDateTime.time);
      setObservedDateError(null);
      setSelectedPhoto(persistentPhoto);
      setUnavailablePhotoUri(null);
      setUploadedMediaId(null);
      setPendingUploadIntent(null);
      setPendingUploadRecoveryId(null);
      setPendingUploadIntentKey(null);
      setUploadError(null);
      setShowPhotoPreview(true);
    } catch {
      Alert.alert("사진을 열지 못했어요", "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const startPhotoSelection = () => {
    if (isUploadingPhoto || isPickingPhoto || isSavingObservation || saveRequestStarted || !draftHydrated || draftAwaitingSignIn) return;
    if (!selectedPhoto) {
      void pickPhoto();
      return;
    }
    Alert.alert(
      "진행 중인 기록을 바꿀까요?",
      "사진을 새로 선택하면 현재 사진과 식별 진행이 교체돼요. 사진 선택을 취소하면 현재 초안은 그대로 남아요.",
      [
        { text: "계속 기록", style: "cancel", onPress: resumeCurrentDraft },
        { text: "사진 다시 고르기", style: "destructive", onPress: () => void pickPhoto() },
      ],
    );
  };

  const sendAuthCode = async () => {
    if (!supabase) {
      setAuthError("이메일 로그인을 사용하려면 앱 환경에 Supabase 프로젝트 URL과 공개 키를 설정해 주세요.");
      return;
    }
    const email = authEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("이메일 주소를 확인해 주세요.");
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw error;
      setAuthEmail(email);
      setAuthCodeSent(true);
    } catch {
      setAuthError("로그인 코드를 보내지 못했어요. 이메일 주소와 Supabase 이메일 설정을 확인해 주세요.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const verifyAuthCode = async () => {
    if (!supabase) return;
    const email = authEmail.trim().toLowerCase();
    const code = authCode.trim();
    if (!code) {
      setAuthError("이메일로 받은 로그인 코드를 입력해 주세요.");
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
      applyAuthSession(data.session);
      setShowAuthModal(false);
      setAuthCode("");
    } catch {
      setAuthError("코드가 맞지 않거나 만료됐어요. 다시 확인하거나 새 코드를 받아 주세요.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return false;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch {
      Alert.alert("로그아웃하지 못했어요", "잠시 후 다시 시도해 주세요.");
      return false;
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "계정을 삭제할까요?",
      "저장한 발견 기록과 사진, 식별 기록이 삭제되고 계정에서 로그아웃돼요. 이 작업은 되돌릴 수 없어요.",
      [
        { text: "취소", style: "cancel" },
        { text: "계정 삭제", style: "destructive", onPress: () => void deleteAccount() },
      ],
    );
  };

  const deleteAccount = async () => {
    if (!apiAuthToken || isDeletingAccount) return;
    const requestEpoch = privateRequestEpoch.current;
    setIsDeletingAccount(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/v1/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiAuthToken}` },
      });
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const code = body?.error?.code ?? body?.detail?.code;
        if (code === "RATE_LIMITED") {
          beginRateLimitWait("account", response);
          throw new Error("삭제 요청이 잠시 많아요. 조금 기다린 뒤 다시 시도해 주세요.");
        }
        if (code === "ACCOUNT_DELETE_NOT_CONFIGURED") {
          throw new Error("서버에 계정 삭제 설정이 필요해요. 잠시 후 다시 시도해 주세요.");
        }
        if (code === "ACCOUNT_DELETE_UPLOAD_URL_ACTIVE") {
          const deletingUserId = authSession?.user.id ?? null;
          try {
            deleteDraftPhoto(selectedPhoto?.uri);
            await enqueueDraftWrite(null);
          } catch {
            // Local private state is still cleared below; the worker owns deletion.
          }
          if (supabase) {
            try {
              await supabase.auth.signOut({ scope: "local" });
            } catch {
              // The server tombstone already blocks this session from private APIs.
            }
          }
          if (
            requestEpoch !== privateRequestEpoch.current &&
            activeAuthUserId.current !== null &&
            activeAuthUserId.current !== deletingUserId
          ) return;
          applyAuthSession(null);
          clearPrivateUiState();
          setShowAccountSettings(false);
          Alert.alert(
            "계정 삭제를 진행하고 있어요",
            supabase
              ? "사진 업로드 주소가 만료된 뒤 서버가 삭제를 마무리합니다. 이 기기에서는 로그아웃했어요."
              : "사진 업로드 주소가 만료된 뒤 계정 삭제를 다시 눌러 완료해 주세요.",
          );
          return;
        }
        throw new Error("계정과 기록을 삭제하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.");
      }

      try {
        deleteDraftPhoto(selectedPhoto?.uri ?? undefined);
        if (DRAFT_FILE?.exists) DRAFT_FILE.delete();
      } catch {
        // Server-side deletion is authoritative; local draft cleanup is best effort.
      }
      setShowAccountSettings(false);
      if (supabase) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          // The auth account may already be gone; always clear this device's session.
        }
      }
      // A local sign-out after successful deletion advances the epoch. Continue
      // only when no different account has become active in the meantime.
      if (activeAuthUserId.current !== null) return;
      applyAuthSession(null);
      clearPrivateUiState();
      Alert.alert("계정을 삭제했어요", "개인 발견 기록과 계정 정보가 삭제됐어요.");
    } catch (error) {
      if (requestEpoch !== privateRequestEpoch.current) return;
      Alert.alert(
        "계정을 삭제하지 못했어요",
        error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const uploadSelectedPhoto = async () => {
    if (!selectedPhoto || isUploadingPhoto || uploadedMediaId) return;
    if (!localPhotoExists(selectedPhoto.uri)) {
      setUnavailablePhotoUri(selectedPhoto.uri);
      return;
    }
    if (!clientConfig) {
      setUploadError("사진 분석 방식을 확인하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.");
      void refreshClientConfig();
      return;
    }
    if (!apiAuthToken) {
      if (supabase) {
        setAuthError(null);
        setResumeUploadAfterAuth(true);
        setShowAuthModal(true);
      } else {
        setUploadError("이메일 로그인을 시작하려면 앱 환경에 Supabase 프로젝트 URL과 공개 키를 설정해 주세요.");
      }
      return;
    }
    setIsUploadingPhoto(true);
    setUploadError(null);
    const requestEpoch = privateRequestEpoch.current;
    try {
      let photoBlob: Blob;
      try {
        const photoResponse = await fetch(selectedPhoto.uri);
        if (requestEpoch !== privateRequestEpoch.current) return;
        if (!photoResponse.ok) throw new Error("LOCAL_PHOTO_UNAVAILABLE");
        photoBlob = await photoResponse.blob();
      } catch {
        if (requestEpoch !== privateRequestEpoch.current) return;
        setUnavailablePhotoUri(selectedPhoto.uri);
        setUploadError(null);
        return;
      }
      if (requestEpoch !== privateRequestEpoch.current) return;
      const mimeType = (selectedPhoto.mimeType || photoBlob.type).toLowerCase();
      if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
        throw new Error("현재는 JPEG 또는 PNG 사진만 기록할 수 있어요.");
      }
      if (photoBlob.size <= 0 || photoBlob.size > MAX_PHOTO_BYTES) {
        throw new Error("사진은 15 MiB 이하로 선택해 주세요.");
      }

      let intentKey = pendingUploadIntentKey;
      if (pendingUploadRecoveryId && !pendingUploadIntent) {
        const recoveryId = pendingUploadRecoveryId;
        const recoveryResponse = await apiFetch(`${API_BASE_URL}/v1/media/${recoveryId}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiAuthToken}` },
        });
        if (requestEpoch !== privateRequestEpoch.current) return;
        const recoveryBody = await recoveryResponse.json().catch(() => null);
        if (recoveryResponse.ok && recoveryBody?.status === "ready") {
          setUploadedMediaId(recoveryId);
          setPendingUploadRecoveryId(null);
          setPendingUploadIntentKey(null);
          setShowPhotoPreview(false);
          void identifyUploadedPhoto(recoveryId);
          return;
        }
        const recoveryCode = recoveryBody?.detail?.code ?? recoveryBody?.error?.code;
        if (["UPLOAD_NOT_FOUND", "UPLOAD_EXPIRED", "MEDIA_NOT_FOUND"].includes(recoveryCode)) {
          const cleanupResponse = await apiFetch(`${API_BASE_URL}/v1/media/${recoveryId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${apiAuthToken}` },
          });
          if (requestEpoch !== privateRequestEpoch.current) return;
          if (!cleanupResponse.ok && cleanupResponse.status !== 404) {
            throw new Error("이전 사진 업로드를 정리하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.");
          }
          setPendingUploadRecoveryId(null);
          setPendingUploadIntentKey(null);
          intentKey = null;
        } else {
          if (recoveryCode === "RATE_LIMITED") beginRateLimitWait("upload", recoveryResponse);
          throw new Error(
            recoveryCode === "RATE_LIMITED"
              ? "사진 확인 요청이 잠시 많아요. 잠시 뒤 같은 업로드를 다시 시도해 주세요."
              : "이전 사진 업로드 상태를 확인하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
          );
        }
      }

      let intent = pendingUploadIntent;
      if (!intent || Date.parse(intent.expires_at) < Date.now() + 30_000) {
        if (!intentKey) {
          intentKey = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
          setPendingUploadIntentKey(intentKey);
        }
        const intentKeyDraft: DraftSnapshot = {
          version: 1,
          ownerUserId: authSession?.user.id ?? null,
          photo: selectedPhoto,
          mediaId: uploadedMediaId,
          pendingMediaId: pendingUploadRecoveryId,
          pendingIntentKey: intentKey,
          jobId: identificationJobId,
          identificationIdempotencyKey,
          identificationRequestPending,
          identificationStatus,
          identificationCandidates,
          selectedSpecies: selectedSpeciesForSave,
          selectionSource,
          regionLabel,
          observedAt,
          saveIdempotencyKey,
          saveRequestStarted,
        };
        try {
          await enqueueDraftWrite(intentKeyDraft);
        } catch {
          setPendingUploadIntentKey(null);
          throw new Error("업로드 요청을 보내기 전에 복구 정보를 저장하지 못했어요. 저장 공간을 확인해 주세요.");
        }
        if (requestEpoch !== privateRequestEpoch.current) return;
        const intentResponse = await apiFetch(`${API_BASE_URL}/v1/media/upload-intents`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiAuthToken}`,
            "Content-Type": "application/json",
            "Idempotency-Key": intentKey,
          },
          body: JSON.stringify({
            mime_type: mimeType,
            byte_size: photoBlob.size,
            external_ai_consent_provider: clientConfig.external_ai_processing
              ? clientConfig.external_ai_provider
              : null,
            external_ai_consent_version: clientConfig.external_ai_processing
              ? SUPPORTED_EXTERNAL_AI_CONSENT_VERSION
              : null,
          }),
        });
        if (requestEpoch !== privateRequestEpoch.current) return;
        const intentBody = await intentResponse.json().catch(() => null);
        if (!intentResponse.ok) {
          const code = intentBody?.detail?.code ?? intentBody?.error?.code;
          if (code === "RATE_LIMITED") beginRateLimitWait("upload", intentResponse);
          if (code === "EXTERNAL_AI_CONSENT_REQUIRED") void refreshClientConfig();
          if (code === "UPLOAD_INTENT_NOT_REUSABLE") {
            setPendingUploadIntent(null);
            setPendingUploadRecoveryId(null);
            setPendingUploadIntentKey(null);
            throw new Error("이전 업로드 주소가 만료됐어요. 다시 눌러 새 업로드를 시작해 주세요.");
          }
          if (code === "IDEMPOTENCY_KEY_REUSED") {
            setPendingUploadIntent(null);
            setPendingUploadRecoveryId(null);
            setPendingUploadIntentKey(null);
            throw new Error("업로드 복구 정보가 현재 사진과 맞지 않아요. 사진을 다시 선택해 새 업로드를 시작해 주세요.");
          }
          throw new Error(
            code === "RATE_LIMITED"
              ? "업로드 요청이 잠시 많아요. 잠시 기다렸다가 다시 눌러 주세요."
              : code === "EXTERNAL_AI_CONSENT_REQUIRED"
              ? "사진 분석 방식이 바뀌었어요. 안내를 다시 확인하고 업로드해 주세요."
              : code === "STORAGE_UNAVAILABLE"
              ? "사진 저장소에 연결하지 못했어요. MinIO가 실행 중인지 확인해 주세요."
              : "사진 업로드를 준비하지 못했어요. 잠시 후 다시 시도해 주세요.",
          );
        }
        intent = intentBody as UploadIntent;
        if (intent.status === "ready") {
          setUploadedMediaId(intent.media_id);
          setPendingUploadIntent(null);
          setPendingUploadRecoveryId(null);
          setPendingUploadIntentKey(null);
          setShowPhotoPreview(false);
          void identifyUploadedPhoto(intent.media_id);
          return;
        }
        setPendingUploadIntent(intent);
        setPendingUploadRecoveryId(intent.media_id);
      }

      const pendingIntentDraft: DraftSnapshot = {
        version: 1,
        ownerUserId: authSession?.user.id ?? null,
        photo: selectedPhoto,
        mediaId: uploadedMediaId,
        pendingMediaId: intent.media_id,
        pendingIntentKey: intentKey,
        jobId: identificationJobId,
        identificationIdempotencyKey,
        identificationRequestPending,
        identificationStatus,
        identificationCandidates,
        selectedSpecies: selectedSpeciesForSave,
        selectionSource,
        regionLabel,
        observedAt,
        saveIdempotencyKey,
        saveRequestStarted,
      };
      try {
        await enqueueDraftWrite(pendingIntentDraft);
      } catch {
        setPendingUploadIntent(null);
        setPendingUploadRecoveryId(null);
        setPendingUploadIntentKey(null);
        await apiFetch(`${API_BASE_URL}/v1/media/${intent.media_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiAuthToken}` },
        }).catch(() => undefined);
        throw new Error("업로드를 시작하기 전에 사진 복구 정보를 기기에 저장하지 못했어요. 저장 공간을 확인해 주세요.");
      }
      if (requestEpoch !== privateRequestEpoch.current) return;

      // After a lost completion response, ask the API whether this intent was
      // already finalized before replaying its still-valid signed PUT URL.
      // New server uploads use separate original/final object keys; this also
      // avoids needless duplicate uploads and protects older in-flight intents.
      if (pendingUploadIntent?.media_id === intent.media_id) {
        const retryCheck = await apiFetch(
          `${API_BASE_URL}/v1/media/${intent.media_id}/complete`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${apiAuthToken}` },
          },
        );
        if (requestEpoch !== privateRequestEpoch.current) return;
        const retryBody = await retryCheck.json().catch(() => null);
        if (retryCheck.ok && retryBody?.status === "ready") {
          setUploadedMediaId(intent.media_id);
          setPendingUploadIntent(null);
          setPendingUploadRecoveryId(null);
          setPendingUploadIntentKey(null);
          setShowPhotoPreview(false);
          void identifyUploadedPhoto(intent.media_id);
          return;
        }
        const retryCode = retryBody?.detail?.code ?? retryBody?.error?.code;
        if (retryCode !== "UPLOAD_NOT_FOUND") {
          if (retryCode === "RATE_LIMITED") beginRateLimitWait("upload", retryCheck);
          if (retryCode === "MEDIA_NOT_FOUND" || retryCode === "UPLOAD_EXPIRED") {
            setPendingUploadIntent(null);
            setPendingUploadRecoveryId(null);
            setPendingUploadIntentKey(null);
          }
          throw new Error(
            retryCode === "RATE_LIMITED"
              ? "사진 확인 요청이 잠시 많아요. 기다렸다가 같은 업로드를 다시 시도해 주세요."
              : retryCode === "UPLOAD_EXPIRED"
                ? "업로드 시간이 지났어요. 다시 눌러 새 업로드를 시작해 주세요."
                : "기존 사진 업로드 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
          );
        }
      }

      const uploadController = new AbortController();
      const uploadTimeout = setTimeout(
        () => uploadController.abort(),
        PHOTO_UPLOAD_TIMEOUT_MS,
      );
      let putResponse: Response;
      try {
        putResponse = await fetch(intent.upload_url, {
          method: intent.method,
          headers: intent.required_headers,
          body: photoBlob,
          signal: uploadController.signal,
        });
      } finally {
        clearTimeout(uploadTimeout);
      }
      if (requestEpoch !== privateRequestEpoch.current) return;
      if (!putResponse.ok) {
        throw new Error("사진 전송에 실패했어요. 네트워크를 확인하고 다시 시도해 주세요.");
      }

      const completeResponse = await apiFetch(
        `${API_BASE_URL}/v1/media/${intent.media_id}/complete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiAuthToken}` },
        },
      );
      if (requestEpoch !== privateRequestEpoch.current) return;
      const completeBody = await completeResponse.json().catch(() => null);
      if (!completeResponse.ok || completeBody?.status !== "ready") {
        const code = completeBody?.detail?.code ?? completeBody?.error?.code;
        if (code === "RATE_LIMITED") {
          beginRateLimitWait("upload", completeResponse);
          throw new Error("사진 확인 요청이 잠시 많아요. 기다렸다가 같은 업로드를 다시 시도해 주세요.");
        }
        const invalidPhotoCodes = [
          "UPLOAD_SIZE_MISMATCH",
          "UPLOAD_TYPE_MISMATCH",
          "UPLOAD_METADATA_MISMATCH",
          "UPLOAD_CHECKSUM_MISMATCH",
          "UNSUPPORTED_MEDIA",
          "INVALID_IMAGE",
          "INVALID_IMAGE_DIMENSIONS",
          "IMAGE_TOO_LARGE",
          "PROCESSED_IMAGE_TOO_LARGE",
        ];
        if (code === "MEDIA_NOT_FOUND" || code === "UPLOAD_EXPIRED" || invalidPhotoCodes.includes(code)) {
          setPendingUploadIntent(null);
          setPendingUploadRecoveryId(null);
          setPendingUploadIntentKey(null);
        }
        throw new Error(
          code === "UPLOAD_EXPIRED"
            ? "업로드 시간이 지났어요. 다시 눌러 새 업로드를 시작해 주세요."
            : invalidPhotoCodes.includes(code)
              ? "사진을 처리할 수 없어요. 다른 JPEG 또는 PNG 사진을 골라 주세요."
              : "사진 처리를 마치지 못했어요. 다시 시도해 주세요.",
        );
      }

      setUploadedMediaId(intent.media_id);
      setPendingUploadIntent(null);
      setPendingUploadRecoveryId(null);
      setPendingUploadIntentKey(null);
      setShowPhotoPreview(false);
      void identifyUploadedPhoto(intent.media_id);
    } catch (error) {
      if (requestEpoch !== privateRequestEpoch.current) return;
      setUploadError(
        error instanceof Error && error.name === "AbortError"
          ? "사진 전송이 오래 걸려 중단했어요. 업로드 상태를 확인한 뒤 다시 시도해 주세요."
          : error instanceof TypeError
          ? "서버에 연결할 수 없어요. 컴퓨터와 휴대폰이 같은 네트워크인지 확인해 주세요."
          : error instanceof Error
            ? error.message
            : "사진을 업로드하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      if (requestEpoch === privateRequestEpoch.current) setIsUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (!authSession || !resumeUploadAfterAuth || !selectedPhoto || uploadedMediaId) return;
    setResumeUploadAfterAuth(false);
    void uploadSelectedPhoto();
  }, [authSession, resumeUploadAfterAuth]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <HomeDiscoverySection
          authEnabled={supabaseEnabled}
          signedIn={Boolean(authSession)}
          selectedPhoto={selectedPhoto}
          uploadedMediaId={uploadedMediaId}
          identificationStatus={identificationStatus}
          discoveredSpeciesCount={discoveredSpeciesCount}
          unidentifiedDiscoveryCount={unidentifiedDiscoveryCount}
          collectionLoadError={collectionLoadError}
          loadingCollection={isLoadingCollection}
          recentObservations={recentObservations}
          onOpenAccountSettings={() => setShowAccountSettings(true)}
          onSignIn={() => setShowAuthModal(true)}
          onSignOut={() => void signOut()}
          onResumeDraft={resumeCurrentDraft}
          onOpenObservations={openObservationsList}
          onOpenUnidentifiedObservations={openUnidentifiedObservations}
          onRetryCollection={() => void refreshCollection()}
          onOpenObservation={openObservationDetail}
        />

        <CatalogCollectionSection
          species={species}
          query={query}
          discoveryCounts={discoveryCounts}
          offline={catalogLoadState === "offline"}
          onQueryChange={setQuery}
          onRetry={() => {
            setCatalogLoadState("loading");
            setCatalogRetryKey((key) => key + 1);
          }}
          onSelectSpecies={setSelected}
        />

        <Text style={styles.photoPrivacyNote}>
          {Platform.OS === "web"
            ? "웹 미리보기의 사진은 브라우저 임시 주소로만 표시되며 새로고침하면 사라져요. 휴대폰 앱에서는 기기의 임시 공간에 저장되고 저장 완료·기록 취소·로그아웃 시 삭제돼요."
            : "선택한 사진은 기록을 이어가기 위해 기기의 임시 공간에 저장돼요. 저장 공간이 부족하면 앱이 임시 사진을 지울 수 있어요. 저장 완료·기록 취소·로그아웃 시 삭제돼요."}
        </Text>
        <PhotoCaptureAction
          draftAwaitingSignIn={draftAwaitingSignIn}
          saveRequestStarted={saveRequestStarted}
          pickingPhoto={isPickingPhoto}
          uploadingPhoto={isUploadingPhoto}
          savingObservation={isSavingObservation}
          draftHydrated={draftHydrated}
          hasSelectedPhoto={Boolean(selectedPhoto)}
          onPress={() => {
            if (draftAwaitingSignIn) {
              setShowAuthModal(true);
              return;
            }
            if (saveRequestStarted) {
              resumeCurrentDraft();
              return;
            }
            startPhotoSelection();
          }}
        />
        <Text style={styles.footer}>생물 이름과 학명은 국립수산과학원 종정보를 참고했어요.</Text>
      </ScrollView>

      <AccountSettingsModal
        visible={showAccountSettings}
        email={authSession?.user.email ?? null}
        deleting={isDeletingAccount}
        deleteRetryWait={rateLimitWaits.account}
        onClose={() => setShowAccountSettings(false)}
        onSignOut={signOut}
        onRequestDelete={confirmDeleteAccount}
      />

      <AuthModal
        visible={showAuthModal}
        authReady={authReady}
        email={authEmail}
        code={authCode}
        codeSent={authCodeSent}
        authenticating={isAuthenticating}
        error={authError}
        onEmailChange={setAuthEmail}
        onCodeChange={setAuthCode}
        onClose={() => setShowAuthModal(false)}
        onSendCode={() => void sendAuthCode()}
        onVerifyCode={() => void verifyAuthCode()}
        onChangeEmail={() => { setAuthCodeSent(false); setAuthCode(""); }}
      />

      <SpeciesDetailModal
        species={selected}
        discoveryCount={selected ? discoveryCounts[selected.id] ?? 0 : 0}
        discoveryDates={selected ? discoveryDates[selected.id] : undefined}
        onClose={() => setSelected(null)}
      />

      <PhotoPreviewModal
        visible={showPhotoPreview}
        photo={selectedPhoto}
        unavailable={selectedPhotoUnavailable}
        uploadedMediaId={uploadedMediaId}
        uploading={isUploadingPhoto}
        uploadError={uploadError}
        clientConfig={clientConfig}
        clientConfigOutdated={clientConfigOutdated}
        loadingClientConfig={isLoadingClientConfig}
        uploadRetryWait={rateLimitWaits.upload}
        saveInProgress={isSavingObservation}
        saveRequestStarted={saveRequestStarted}
        onDismiss={() => setShowPhotoPreview(false)}
        onReplacePhoto={() => {
          setShowPhotoPreview(false);
          setTimeout(() => void pickPhoto(), 250);
        }}
        onPhotoError={() => {
          if (selectedPhoto) setUnavailablePhotoUri(selectedPhoto.uri);
        }}
        onRetryClientConfig={() => void refreshClientConfig()}
        onUpload={() => void uploadSelectedPhoto()}
        onCancelDraft={confirmCancelCurrentDraft}
      />

      <IdentificationFlowModal
        visible={showIdentification && uploadedMediaId !== null}
        photo={selectedPhoto}
        photoUnavailable={selectedPhotoUnavailable}
        identificationStatus={identificationStatus}
        identificationCandidates={identificationCandidates}
        identificationError={identificationError}
        identificationRetryWait={rateLimitWaits.identify}
        identificationDailyLimitReached={identificationDailyLimitReached}
        selectedSpecies={selectedSpeciesForSave}
        selectionSource={selectionSource}
        manualSpeciesQuery={manualSpeciesQuery}
        visibleManualSpecies={visibleManualSpecies}
        searchingManualSpecies={isSearchingManualSpecies}
        observedDate={observedDate}
        observedTime={observedTime}
        observedDateError={observedDateError}
        regionLabel={regionLabel}
        saving={isSavingObservation}
        saveError={saveError}
        saveNeedsReupload={saveNeedsReupload}
        saveRetryWait={rateLimitWaits.save}
        saveRequestStarted={saveRequestStarted}
        onClose={() => setShowIdentification(false)}
        onPhotoError={() => {
          if (selectedPhoto) setUnavailablePhotoUri(selectedPhoto.uri);
        }}
        onSearchQueryChange={setManualSpeciesQuery}
        onChooseCandidate={(species) => chooseSpecies(species, "ai_confirmed")}
        onChooseSpecies={(species) => chooseSpecies(species, "user_selected")}
        onChooseUnidentified={() => chooseSpecies(null, "unidentified")}
        onObservedDateTimeChange={updateObservedDateTime}
        onRegionLabelChange={setRegionLabel}
        onReupload={retrySaveWithPhotoUpload}
        onRetryIdentification={() => {
          if (uploadedMediaId) void identifyUploadedPhoto(uploadedMediaId, true);
        }}
        onSave={() => void saveObservation()}
        onCancel={confirmCancelCurrentDraft}
      />

      <ObservationSavedModal
        observation={savedObservation}
        speciesSummary={savedSpeciesSummary}
        onOpenCollection={() => { setSavedObservation(null); setSavedSpeciesSummary(null); }}
        onAddAnother={() => {
          setSavedObservation(null);
          setSavedSpeciesSummary(null);
          void pickPhoto();
        }}
      />

      <ObservationListModal
        visible={showObservationsList}
        filter={observationFilter}
        unidentifiedCount={unidentifiedDiscoveryCount}
        observations={allObservations}
        loading={isLoadingObservations}
        error={observationListError}
        cursor={observationCursor}
        onClose={() => setShowObservationsList(false)}
        onFilterChange={changeObservationFilter}
        onOpenObservation={(observation) => openObservationDetail(observation, true)}
        onRetry={retryObservationPage}
        onLoadMore={(cursor) => void fetchObservationPage(cursor, true)}
      />

      <ObservationDetailModal
        observation={selectedObservation}
        photoUnavailable={Boolean(selectedObservation && failedObservationPhoto?.observationId === selectedObservation.id && failedObservationPhoto.photoUrl === selectedObservation.photo_url)}
        refreshingPhoto={isRefreshingObservationPhoto}
        editDate={observationEditDate}
        editRegion={observationEditRegion}
        speciesQuery={observationSpeciesQuery}
        searchingSpecies={isSearchingObservationSpecies}
        speciesResults={observationSpeciesResults}
        editedSpecies={editedObservationSpecies}
        hasSpeciesEdit={hasObservationSpeciesEdit}
        error={observationDetailError}
        saving={isSavingObservationEdit}
        deleting={isDeletingObservation}
        onClose={closeObservationDetail}
        onRetryPhoto={() => void retryObservationPhoto()}
        onPhotoError={(observation) => setFailedObservationPhoto({ observationId: observation.id, photoUrl: observation.photo_url })}
        onDateChange={setObservationEditDate}
        onRegionChange={setObservationEditRegion}
        onSpeciesQueryChange={setObservationSpeciesQuery}
        onSelectSpecies={(species) => { setEditedObservationSpecies(species); setHasObservationSpeciesEdit(true); }}
        onSelectUnidentified={() => { setEditedObservationSpecies(null); setHasObservationSpeciesEdit(true); }}
        onResetSpecies={() => {
          if (selectedObservation) setEditedObservationSpecies(selectedObservation.species);
          setHasObservationSpeciesEdit(false);
        }}
        onDelete={confirmDeleteObservation}
        onSave={() => void saveObservationEdit()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F1" },
  page: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24 },
  footer: { marginTop: 13, color: "#929993", fontSize: 10, textAlign: "center" },
  photoPrivacyNote: { marginTop: 10, marginHorizontal: 20, color: "#68736D", fontSize: 11, lineHeight: 16, textAlign: "center" },
});








