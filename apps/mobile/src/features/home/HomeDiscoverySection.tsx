import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ObservationPhotoImage } from "../../components/ObservationImages";
import type { IdentificationStatus } from "../../types/identification";
import type { ObservationCard } from "../../types/observation";
import type { PhotoSelection } from "../../types/photo";

type HomeDiscoverySectionProps = {
  authEnabled: boolean;
  signedIn: boolean;
  selectedPhoto: PhotoSelection | null;
  uploadedMediaId: string | null;
  identificationStatus: IdentificationStatus;
  discoveredSpeciesCount: number;
  unidentifiedDiscoveryCount: number;
  collectionLoadError: string | null;
  loadingCollection: boolean;
  recentObservations: ObservationCard[];
  onOpenAccountSettings: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onResumeDraft: () => void;
  onOpenObservations: () => void;
  onOpenUnidentifiedObservations: () => void;
  onRetryCollection: () => void;
  onOpenObservation: (observation: ObservationCard) => void;
};

export function HomeDiscoverySection({
  authEnabled,
  signedIn,
  selectedPhoto,
  uploadedMediaId,
  identificationStatus,
  discoveredSpeciesCount,
  unidentifiedDiscoveryCount,
  collectionLoadError,
  loadingCollection,
  recentObservations,
  onOpenAccountSettings,
  onSignIn,
  onSignOut,
  onResumeDraft,
  onOpenObservations,
  onOpenUnidentifiedObservations,
  onRetryCollection,
  onOpenObservation,
}: HomeDiscoverySectionProps) {
  const isIdentifying = identificationStatus === "queued" || identificationStatus === "running";

  return (
    <>
      <Text style={styles.eyebrow}>OCEAN DIARY · 나의 바닷속 발견</Text>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>오늘 만난 바다를{`\n`}한 장씩 모아봐요</Text>
        {authEnabled && (
          <View style={styles.authActions}>
            {signedIn && (
              <Pressable accessibilityRole="button" accessibilityLabel="계정과 개인정보 설정" onPress={onOpenAccountSettings}>
                <Text style={styles.authActionText}>계정</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={signedIn ? "로그아웃" : "로그인"}
              onPress={signedIn ? onSignOut : onSignIn}
            >
              <Text style={styles.authActionText}>{signedIn ? "로그아웃" : "로그인"}</Text>
            </Pressable>
          </View>
        )}
      </View>
      <View style={styles.collectionNote}>
        <Text style={styles.noteIcon}>✦</Text>
        <View style={styles.noteCopy}>
          <Text style={styles.noteTitle}>나만의 도감을 시작해요</Text>
          <Text style={styles.noteText}>사진으로 발견을 기록하면 이곳에 차곡차곡 모여요.</Text>
        </View>
      </View>

      {selectedPhoto && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={uploadedMediaId
            ? isIdentifying ? "생물 후보를 확인 중인 발견 기록 이어하기" : "생물 식별 및 저장 이어하기"
            : "선택한 사진 미리보기"}
          accessibilityState={{ busy: Boolean(uploadedMediaId && isIdentifying) }}
          onPress={onResumeDraft}
          style={styles.selectedPhotoCard}
        >
          <ObservationPhotoImage uri={selectedPhoto.uri} style={styles.selectedPhotoThumb} accessibilityLabel="선택한 발견 사진" />
          <View style={styles.selectedPhotoCopy}>
            <Text style={styles.selectedPhotoTitle}>{uploadedMediaId ? "사진을 안전하게 저장했어요" : "사진을 선택했어요"}</Text>
            <Text style={styles.selectedPhotoHint}>
              {uploadedMediaId
                ? isIdentifying ? "생물 후보를 확인하고 있어요" : "눌러서 식별과 저장을 이어가요"
                : "눌러서 다시 확인하기"}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>나의 발견</Text>
          <Text style={styles.sectionCaption}>내가 만난 생물이 도감에 모여요</Text>
        </View>
        <View style={styles.collectionHeadingActions}>
          <Text style={styles.count}>{discoveredSpeciesCount}종</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="모든 발견 보기" onPress={onOpenObservations}>
            <Text style={styles.viewAllText}>모두 보기 ›</Text>
          </Pressable>
        </View>
      </View>
      {unidentifiedDiscoveryCount > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`미확인 발견 ${unidentifiedDiscoveryCount}건 보기`}
          onPress={onOpenUnidentifiedObservations}
          style={styles.unidentifiedSummary}
        >
          <View>
            <Text style={styles.unidentifiedSummaryTitle}>이름을 아직 모르는 발견</Text>
            <Text style={styles.unidentifiedSummaryCaption}>사진과 날짜를 모아뒀어요</Text>
          </View>
          <Text style={styles.unidentifiedSummaryCount}>{unidentifiedDiscoveryCount}건 ›</Text>
        </Pressable>
      )}
      {collectionLoadError && (
        <View style={styles.collectionError}>
          <Text accessibilityLiveRegion="polite" style={styles.offlineText}>{collectionLoadError}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="발견 기록 다시 불러오기" disabled={loadingCollection} onPress={onRetryCollection}>
            <Text style={styles.retryText}>{loadingCollection ? "불러오는 중" : "다시 시도"}</Text>
          </Pressable>
        </View>
      )}
      {loadingCollection && recentObservations.length === 0 ? (
        <View style={styles.collectionLoading}><ActivityIndicator color="#548A84" /><Text accessibilityLiveRegion="polite" style={styles.collectionLoadingText}>도감을 불러오고 있어요</Text></View>
      ) : recentObservations.length === 0 && !collectionLoadError ? (
        <View style={styles.recentEmpty}><Text style={styles.emptyText}>아직 저장한 발견이 없어요. 사진으로 첫 기록을 남겨 보세요.</Text></View>
      ) : recentObservations.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
          {recentObservations.map((observation) => (
            <Pressable
              key={observation.id}
              accessibilityRole="button"
              accessibilityLabel={`${observation.species?.common_name_ko ?? "미확인 생물"} 발견, ${new Date(observation.observed_at).toLocaleDateString("ko-KR")}${observation.region_label ? `, ${observation.region_label}` : ""}, 상세와 수정`}
              onPress={() => onOpenObservation(observation)}
              style={styles.recentCard}
            >
              <ObservationPhotoImage uri={observation.photo_url} style={styles.recentPhoto} accessibilityLabel={`최근 발견 사진, ${observation.species?.common_name_ko ?? "미확인 생물"}`} />
              <Text style={styles.recentSpecies}>{observation.species?.common_name_ko ?? "미확인 생물"}</Text>
              <Text style={styles.recentDate}>{new Date(observation.observed_at).toLocaleDateString("ko-KR")}{observation.region_label ? ` · ${observation.region_label}` : ""}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: "#548A84", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  title: { flex: 1, marginTop: 11, color: "#203D45", fontSize: 28, lineHeight: 36, fontWeight: "800" },
  authActions: { marginTop: 21, alignItems: "flex-end", gap: 8 },
  authActionText: { color: "#366F70", fontSize: 12, fontWeight: "800" },
  collectionNote: { marginTop: 20, padding: 15, borderRadius: 17, backgroundColor: "#EAF2EC", flexDirection: "row", alignItems: "center" },
  noteIcon: { color: "#548A84", fontSize: 26, marginRight: 12 },
  noteCopy: { flex: 1 },
  noteTitle: { color: "#315B5B", fontSize: 14, fontWeight: "800" },
  noteText: { marginTop: 4, color: "#536B67", fontSize: 11, lineHeight: 16 },
  selectedPhotoCard: { marginTop: 14, padding: 10, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9E7DE", flexDirection: "row", alignItems: "center" },
  selectedPhotoThumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#EAF2EC" },
  selectedPhotoCopy: { flex: 1, marginLeft: 12 },
  selectedPhotoTitle: { color: "#315B5B", fontSize: 13, fontWeight: "800" },
  selectedPhotoHint: { marginTop: 4, color: "#87918C", fontSize: 11 },
  chevron: { paddingHorizontal: 8, color: "#548A84", fontSize: 24 },
  sectionHeading: { marginTop: 26, marginBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#203D45", fontSize: 20, fontWeight: "800" },
  sectionCaption: { marginTop: 4, color: "#87918C", fontSize: 11 },
  collectionHeadingActions: { alignItems: "flex-end", gap: 5 },
  count: { color: "#548A84", fontSize: 13, fontWeight: "800" },
  viewAllText: { color: "#366F70", fontSize: 12, fontWeight: "800" },
  unidentifiedSummary: { marginBottom: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 15, backgroundColor: "#F1EBDD", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  unidentifiedSummaryTitle: { color: "#4B5550", fontSize: 13, fontWeight: "800" },
  unidentifiedSummaryCaption: { marginTop: 4, color: "#7C8077", fontSize: 11 },
  unidentifiedSummaryCount: { color: "#54736D", fontSize: 12, fontWeight: "800" },
  offlineText: { flex: 1, color: "#6F7063", fontSize: 11, lineHeight: 16 },
  retryText: { marginTop: 6, color: "#366F70", fontSize: 12, fontWeight: "800", textAlign: "right" },
  collectionError: { marginBottom: 10, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: "#F2EBDD", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  collectionLoading: { minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  collectionLoadingText: { color: "#71807A", fontSize: 12 },
  recentEmpty: { minHeight: 58, padding: 14, justifyContent: "center", borderRadius: 14, backgroundColor: "#FFFFFF" },
  emptyText: { marginTop: 6, color: "#87918C", fontSize: 12 },
  recentRow: { gap: 11, paddingBottom: 3 },
  recentCard: { width: 142, padding: 8, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEE9DE" },
  recentPhoto: { width: "100%", height: 88, borderRadius: 10, backgroundColor: "#EAF2EC" },
  recentSpecies: { marginTop: 8, color: "#203D45", fontSize: 13, fontWeight: "800" },
  recentDate: { marginTop: 4, color: "#87918C", fontSize: 10 },
});
