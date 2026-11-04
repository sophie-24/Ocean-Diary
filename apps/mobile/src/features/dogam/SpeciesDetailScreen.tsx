import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { ChevronLeft, ChevronRight, InfoIcon, ShareIcon } from "../../components/icons";
import { NameTag } from "../../components/ui/NameTag";
import { Txt } from "../../components/ui/Txt";
import { SPECIES_BY_NO } from "../../data/species";
import { MOCK_COLLECTION } from "../../mocks/collection";
import { MOCK_ENCOUNTERS, MOCK_FACTS, REGULAR_BADGE_GOAL } from "../../mocks/speciesDetail";
import { colors, shadow } from "../../theme/tokens";

const ENCOUNTER_PHOTO_BG = ["#1E4E86", "#27609A", "#1B4579"];

export function SpeciesDetailScreen({ no }: { no: string }) {
  const router = useRouter();
  const species = SPECIES_BY_NO[no];
  const facts = MOCK_FACTS[no];
  const encounters = MOCK_ENCOUNTERS[no] ?? [];
  const mark = MOCK_COLLECTION.find((c) => c.no === no);
  const collected = !!mark;

  const goBack = () => (router.canGoBack() ? router.back() : router.navigate("/dogam"));

  if (!species) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <Txt size={16} weight="bold">
          도감에서 찾을 수 없는 생물이에요
        </Txt>
        <Pressable onPress={goBack} accessibilityRole="button" style={[styles.backBtn, { marginTop: 16 }]}>
          <ChevronLeft />
        </Pressable>
      </SafeAreaView>
    );
  }

  const count = mark?.count ?? 0;
  const places = new Set(encounters.map((e) => e.place)).size || (collected ? 1 : 0);
  const last = encounters.at(-1)?.date ?? mark?.firstSeen ?? "—";

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Svg width="100%" height={340} style={StyleSheet.absoluteFill} viewBox="0 0 390 340" preserveAspectRatio="none">
            <Path d="M0 250 Q48 238 97 250 T195 250 T292 250 T390 250" stroke="#E3EEF9" strokeWidth={2} fill="none" />
            <Path d="M0 278 Q48 266 97 278 T195 278 T292 278 T390 278" stroke="#EDF4FB" strokeWidth={2} fill="none" />
          </Svg>
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroBar}>
              <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="도감으로 돌아가기" style={styles.backBtn}>
                <ChevronLeft />
              </Pressable>
              <Txt size={13} weight="extraBold" color={colors.ink3} tracking={0.06}>
                No.{species.no}
              </Txt>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="도감 카드 공유"
                style={styles.backBtn}
                onPress={() => void Share.share({ message: `오션 다이어리 도감 No.${species.no} ${species.nameKo} (${species.nameEn})` })}
              >
                <ShareIcon />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.heroArt}>
            {species.art ? (
              <Critter kind={species.art} width={350} height={150} ghost={!collected} accessibilityLabel={`${species.nameKo} 일러스트`} />
            ) : (
              <View style={styles.noArt}>
                <Txt size={13} weight="bold" color={colors.ink3}>
                  일러스트 준비 중
                </Txt>
              </View>
            )}
          </View>
          <NameTag ko={collected ? species.nameKo : "???"} en={collected ? species.nameEn : species.group} size="lg" filled heading style={styles.heroTag} />
        </View>

        <View style={styles.body}>
          <View style={styles.sciRow}>
            <Txt size={14} color={colors.ink2} style={{ fontStyle: "italic", flexShrink: 1 }}>
              {species.sciName}
              {facts ? ` · ${facts.family}` : ""}
            </Txt>
            {facts?.iucn ? (
              <View style={styles.iucn}>
                <Txt size={12} weight="bold" color="#A8382A">
                  {facts.iucn}
                </Txt>
              </View>
            ) : null}
          </View>

          {collected ? (
            <View style={styles.stats}>
              <Stat value={`${count}회`} label="만남" />
              <Stat value={`${places}곳`} label="다이빙 포인트" divider />
              <Stat value={last} label="마지막 만남" divider small />
            </View>
          ) : (
            <View style={styles.notYet}>
              <Txt size={14} weight="extraBold">
                아직 만나지 못한 친구예요
              </Txt>
              <Txt size={12} color={colors.ink2}>
                사진을 올려 이 생물을 찾으면 도감에 색이 채워져요.
              </Txt>
            </View>
          )}

          {facts ? (
            <>
              <View style={styles.section}>
                <Txt accessibilityRole="header" size={16} weight="black" style={{ marginBottom: 10 }}>
                  기본 정보
                </Txt>
                {(
                  [
                    ["크기", facts.size],
                    ["서식지", facts.habitat],
                    ["수심", facts.depth],
                    ["먹이", facts.food],
                  ] as const
                ).map(([k, v]) => (
                  <View key={k} style={styles.dlRow}>
                    <Txt size={14} color={colors.ink2} style={{ width: 64 }}>
                      {k}
                    </Txt>
                    <Txt size={14} weight="medium" style={{ flex: 1 }}>
                      {v}
                    </Txt>
                  </View>
                ))}
              </View>
              <View style={[styles.section, styles.didYouKnow]}>
                <Txt accessibilityRole="header" size={16} weight="black" color="#1F4FA8" style={{ marginBottom: 6 }}>
                  알고 있었나요?
                </Txt>
                <Txt size={14} color="#34466E" style={{ lineHeight: 23 }}>
                  {facts.didYouKnow}
                </Txt>
              </View>
              {facts.manner ? (
                <View style={styles.manner}>
                  <InfoIcon />
                  <Txt size={13} color="#34466E" style={{ flex: 1, lineHeight: 20 }}>
                    <Txt size={13} weight="bold">
                      관찰 매너
                    </Txt>{" "}
                    · {facts.manner}
                  </Txt>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.section}>
              <Txt size={14} color={colors.ink2}>
                {species.group} · {species.subgroup} — 자세한 도감 설명을 준비하고 있어요.
              </Txt>
            </View>
          )}

          {encounters.length > 0 ? (
            <View>
              <View style={styles.sectionHead}>
                <Txt accessibilityRole="header" size={18} weight="black">
                  나의 만남 기록
                </Txt>
                <Txt size={13} color={colors.ink2}>
                  총 {encounters.length}회
                </Txt>
              </View>
              <View style={{ marginTop: 14 }}>
                {encounters.map((e, i) => {
                  const dot = e.first ? colors.coral : colors.oceanBlue;
                  return (
                    <View key={e.round} style={styles.tlRow}>
                      <View style={styles.tlRail}>
                        <View style={[styles.tlDot, { backgroundColor: dot, shadowColor: dot }]} />
                        {i < encounters.length - 1 ? <View style={styles.tlLine} /> : null}
                      </View>
                      <View style={styles.tlCard}>
                        <View style={[styles.tlPhoto, { backgroundColor: ENCOUNTER_PHOTO_BG[i % 3] }]}>
                          {species.art ? <Critter kind={species.art} width={64} height={34} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={[styles.row, { gap: 6 }]}>
                            <Txt size={12} weight="black" color={colors.oceanBlue}>
                              {e.round}회차
                            </Txt>
                            <Txt size={12} color={colors.ink2}>
                              {e.date}
                            </Txt>
                            {e.first ? (
                              <View style={styles.first}>
                                <Txt size={10} weight="black" color={colors.white}>
                                  FIRST
                                </Txt>
                              </View>
                            ) : null}
                          </View>
                          <Txt size={15} weight="extraBold">
                            {e.place}
                          </Txt>
                          <Txt size={12} color={colors.ink2}>
                            {e.meta}
                            {e.logLabel ? ` · ${e.logLabel}` : ""}
                          </Txt>
                        </View>
                        <ChevronRight size={18} color={colors.ink3} />
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.badgeBox}>
                <View style={{ flex: 1 }}>
                  <Txt size={14} weight="extraBold">
                    {count >= REGULAR_BADGE_GOAL ? "단골 친구 배지를 받았어요!" : `단골 친구 배지까지 ${REGULAR_BADGE_GOAL - count}번 남았어요`}
                  </Txt>
                  <View style={styles.badgeTrack}>
                    <View style={[styles.badgeFill, { width: `${Math.min(1, count / REGULAR_BADGE_GOAL) * 100}%` }]} />
                  </View>
                </View>
                <Txt size={13} weight="black">
                  {Math.min(count, REGULAR_BADGE_GOAL)} / {REGULAR_BADGE_GOAL}
                </Txt>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, divider, small }: { value: string; label: string; divider?: boolean; small?: boolean }) {
  return (
    <View style={[styles.stat, divider && styles.statDivider]}>
      <Txt size={small ? 15 : 20} weight="black" color={colors.oceanBlue}>
        {value}
      </Txt>
      <Txt size={12} color={colors.ink2}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  center: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  hero: { height: 340, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  heroBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mist, alignItems: "center", justifyContent: "center" },
  heroArt: { position: "absolute", left: 0, right: 0, top: 112, alignItems: "center" },
  heroTag: { position: "absolute", top: 270 },
  noArt: { width: 300, height: 150, borderRadius: 20, backgroundColor: colors.mist, alignItems: "center", justifyContent: "center" },
  body: { paddingTop: 18, paddingHorizontal: 20, gap: 16 },
  sciRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  iucn: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: "#FDECEA" },
  stats: { flexDirection: "row", paddingVertical: 14, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  stat: { flex: 1, alignItems: "center", justifyContent: "center" },
  statDivider: { borderLeftWidth: 1, borderLeftColor: "#E6EEF8" },
  notYet: { padding: 16, gap: 4, borderRadius: 20, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.ghostLine, backgroundColor: colors.ghostBg },
  section: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  dlRow: { flexDirection: "row", gap: 12, paddingVertical: 5 },
  didYouKnow: { backgroundColor: "#EAF3FC", borderWidth: 0 },
  manner: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sectionHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  tlRow: { flexDirection: "row", gap: 8 },
  tlRail: { width: 28, alignItems: "center" },
  tlDot: { width: 14, height: 14, marginTop: 22, borderRadius: 7, borderWidth: 3, borderColor: colors.mist, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
  tlLine: { flex: 1, width: 2, marginTop: 4, backgroundColor: "#D3E2F3" },
  tlCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12, padding: 12, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  tlPhoto: { width: 68, height: 68, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  first: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: colors.coral },
  badgeBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: "#FFF7DC", borderWidth: 1, borderColor: "#F3DE95" },
  badgeTrack: { height: 6, borderRadius: 3, marginTop: 8, backgroundColor: "#F3DE95", overflow: "hidden" },
  badgeFill: { height: 6, borderRadius: 3, backgroundColor: colors.navy },
});
