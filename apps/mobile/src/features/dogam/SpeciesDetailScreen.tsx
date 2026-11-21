import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { ChevronLeft, ChevronRight, ShareIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { SPECIES_BY_NO } from "../../data/species";
import { SPECIES_FACTS, REGULAR_BADGE_GOAL } from "../../data/facts";
import { useCollection, useSpeciesEncounters } from "../../api/queries";
import { colors } from "../../theme/tokens";

const ENCOUNTER_PHOTO_BG = ["#1E4E86", "#27609A", "#1B4579"];

export function SpeciesDetailScreen({ no }: { no: string }) {
  const router = useRouter();
  const species = SPECIES_BY_NO[no];
  const facts = SPECIES_FACTS[no];
  const { data: collection } = useCollection();
  const mark = collection?.get(no);
  const { data: raw } = useSpeciesEncounters(mark?.speciesId);
  const encounters = (raw ?? []).map((e, i) => ({
    key: e.id,
    round: i + 1,
    date: e.observedAt.slice(0, 10).replace(/-/g, "."),
    place: e.region ?? "장소 기록 없음",
    meta: e.diveLogId ? "로그북에 연결됨" : "사진 기록",
    first: i === 0,
    logId: e.diveLogId,
  }));
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
  const last = (mark?.latestSeen ?? "—").replace(/-/g, ".");

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroBar}>
              <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="도감으로 돌아가기" style={styles.backBtn}>
                <ChevronLeft size={20} />
              </Pressable>
              <Txt size={12} weight="bold" color={colors.ink3}>
                No.{species.no}
              </Txt>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="도감 카드 공유"
                style={styles.backBtn}
                onPress={() => void Share.share({ message: `Mola 도감 No.${species.no} ${species.nameKo} (${species.nameEn})` })}
              >
                <ShareIcon size={20} />
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
          <View style={styles.heroTag}>
            <View style={styles.namePill}>
              <Txt accessibilityRole="header" size={22} weight="bold" style={{ lineHeight: 28 }}>
                {collected ? species.nameKo : "???"}
              </Txt>
              <Txt size={12} weight="medium" color={colors.ink2} style={{ lineHeight: 15 }}>
                {collected ? species.nameEn : species.group}
              </Txt>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sciRow}>
            <View style={{ flexShrink: 1 }}>
              <Txt size={13} color={colors.ink2} style={{ fontStyle: "italic" }}>
                {species.sciName}
              </Txt>
              {facts?.family ? (
                <Txt size={12} color={colors.ink3}>
                  {facts.family}
                </Txt>
              ) : null}
            </View>
            {facts?.iucn ? (
              <View style={styles.iucn}>
                <Txt size={11} weight="bold" color={colors.coral}>
                  {facts.iucn}
                </Txt>
              </View>
            ) : null}
          </View>

          {collected ? (
            <View style={styles.stats}>
              <Stat value={`${count}회`} label="만남" />
              <Stat value={`${places}곳`} label="다이빙 포인트" />
              <Stat value={last} label="마지막 만남" small />
            </View>
          ) : (
            <View style={styles.notYet}>
              <Txt size={14} weight="bold">
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
                <Txt accessibilityRole="header" size={16} weight="bold" style={{ marginBottom: 10 }}>
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
                <Txt accessibilityRole="header" size={16} weight="bold" color={colors.oceanBlue} style={{ marginBottom: 6 }}>
                  알고 있었나요?
                </Txt>
                <Txt size={14} color={colors.ink2} style={{ lineHeight: 23 }}>
                  {facts.didYouKnow}
                </Txt>
              </View>
              {facts.manner ? (
                <View style={styles.manner}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" style={{ marginTop: 1 }}>
                    <Path d="M12 3 L20 6.5 V12 C20 16.5 16.5 19.8 12 21 C7.5 19.8 4 16.5 4 12 V6.5 Z" fill="none" stroke={colors.oceanBlue} strokeWidth={2} strokeLinejoin="round" />
                    <Path d="M8.5 12 L11 14.5 L15.5 10" fill="none" stroke={colors.oceanBlue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <View style={{ flex: 1 }}>
                    <Txt size={13} weight="bold" color={colors.navy} style={{ lineHeight: 20 }}>
                      관찰 매너
                    </Txt>
                    <Txt size={13} color={colors.ink2} style={{ lineHeight: 20 }}>
                      {facts.manner}
                    </Txt>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.section}>
              <Txt size={14} weight="bold">
                {species.group} {species.subgroup}
              </Txt>
              <Txt size={14} color={colors.ink2} style={{ marginTop: 2 }}>
                자세한 도감 설명을 준비하고 있어요.
              </Txt>
            </View>
          )}

          {encounters.length > 0 ? (
            <View>
              <View style={styles.sectionHead}>
                <Txt accessibilityRole="header" size={18} weight="bold">
                  나의 만남 기록
                </Txt>
                <Txt size={13} color={colors.ink3}>
                  총 {encounters.length}회
                </Txt>
              </View>
              <View style={{ marginTop: 14 }}>
                {encounters.map((e, i) => {
                  const dot = e.first ? colors.coral : colors.oceanBlue;
                  return (
                    <View key={e.key} style={styles.tlRow}>
                      <View style={styles.tlRail}>
                        <View style={[styles.tlDot, { backgroundColor: dot, shadowColor: dot }]} />
                        {i < encounters.length - 1 ? <View style={styles.tlLine} /> : null}
                      </View>
                      <View style={styles.tlCard}>
                        <View style={[styles.tlPhoto, { backgroundColor: ENCOUNTER_PHOTO_BG[i % 3] }]}>
                          {species.art ? <Critter kind={species.art} width={56} height={30} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={[styles.row, { gap: 6 }]}>
                            <Txt size={12} weight="bold" color={colors.oceanBlue}>
                              {e.round}회차
                            </Txt>
                            <Txt size={12} color={colors.ink3}>
                              {e.date}
                            </Txt>
                            {e.first ? (
                              <View style={styles.first}>
                                <Txt size={10} weight="bold" color={colors.white} style={{ lineHeight: 14 }}>
                                  첫 만남
                                </Txt>
                              </View>
                            ) : null}
                          </View>
                          <Txt size={15} weight="bold" style={{ marginTop: 2 }}>
                            {e.place}
                          </Txt>
                          <Txt size={12} color={colors.ink3} style={{ marginTop: 2 }}>
                            {e.meta}
                          </Txt>
                        </View>
                        {e.logId ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${e.round}회차 로그북 보기`}
                            onPress={() => router.push({ pathname: "/log/[id]", params: { id: e.logId! } })}
                            hitSlop={8}
                          >
                            <ChevronRight size={16} color={colors.ink3} />
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.badgeBox}>
                <View style={{ flex: 1 }}>
                  <Txt size={14} weight="bold">
                    {count >= REGULAR_BADGE_GOAL ? "단골 친구 배지를 받았어요!" : `단골 친구 배지까지 ${REGULAR_BADGE_GOAL - count}번 남았어요`}
                  </Txt>
                  <View style={styles.badgeTrack}>
                    <View style={[styles.badgeFill, { width: `${Math.min(1, count / REGULAR_BADGE_GOAL) * 100}%` }]} />
                  </View>
                </View>
                <Txt size={13} weight="bold" color={colors.ink2}>
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

function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <View style={styles.stat}>
      <Txt size={small ? 15 : 20} weight="bold" color={colors.oceanBlue}>
        {value}
      </Txt>
      <Txt size={12} color={colors.ink2} style={{ marginTop: 2 }}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  center: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  hero: { height: 340, backgroundColor: colors.white },
  heroBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  heroArt: { position: "absolute", left: 0, right: 0, top: 112, alignItems: "center" },
  heroTag: { position: "absolute", top: 270, left: 0, right: 0, alignItems: "center" },
  namePill: { alignItems: "center", paddingTop: 5, paddingBottom: 6, paddingHorizontal: 22, borderRadius: 999, borderWidth: 2, borderColor: "#A8CBF2", backgroundColor: colors.white },
  noArt: { width: 300, height: 150, borderRadius: 12, backgroundColor: colors.mist, alignItems: "center", justifyContent: "center" },
  body: { paddingTop: 18, paddingHorizontal: 20, gap: 16 },
  sciRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  iucn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, backgroundColor: "#FEF2F2" },
  stats: { flexDirection: "row", gap: 1, borderRadius: 12, backgroundColor: colors.line, overflow: "hidden" },
  stat: { flex: 1, paddingVertical: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  notYet: { padding: 16, gap: 4, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.ghostLine, backgroundColor: colors.ghostBg },
  section: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 12, backgroundColor: colors.white },
  dlRow: { flexDirection: "row", gap: 12, paddingVertical: 5 },
  didYouKnow: { backgroundColor: colors.sky },
  manner: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.white },
  sectionHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  tlRow: { flexDirection: "row", gap: 8 },
  tlRail: { width: 28, alignItems: "center" },
  tlDot: { width: 12, height: 12, marginTop: 22, borderRadius: 6, borderWidth: 3, borderColor: colors.mist, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
  tlLine: { flex: 1, width: 2, marginTop: 4, backgroundColor: colors.line },
  tlCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: colors.white },
  tlPhoto: { width: 60, height: 60, borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  first: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: colors.coral },
  badgeBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.white },
  badgeTrack: { height: 4, borderRadius: 2, marginTop: 8, backgroundColor: colors.line, overflow: "hidden" },
  badgeFill: { height: 4, borderRadius: 2, backgroundColor: colors.navy },
});
