import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { ChevronRight, GlobeIcon, SunIcon } from "../../components/icons";
import { NameTag } from "../../components/ui/NameTag";
import { Txt } from "../../components/ui/Txt";
import { useMemo } from "react";
import { SPECIES, SPECIES_BY_NO, TOTAL_SPECIES } from "../../data/species";
import { SPECIES_FACTS, REGULAR_BADGE_GOAL } from "../../data/facts";
import { useAuth } from "../../api/auth";
import { useCollection, useSummary } from "../../api/queries";
import { discoverStore, useDiscover } from "../discover/discoverStore";
import { colors, shadow } from "../../theme/tokens";

const MILESTONES = [10, 20, 30, 50, 80, 120, 181];

const daysAgo = (iso: string) => {
  const d = Math.round((Date.now() - new Date(`${iso.slice(0, 10)}T00:00:00`).getTime()) / 86_400_000);
  return d <= 0 ? "오늘" : d === 1 ? "어제" : d < 30 ? `${d}일 전` : iso.slice(0, 10).replace(/-/g, ".");
};

export function HomeScreen() {
  const router = useRouter();
  const { email } = useAuth();
  const { data: summary } = useSummary();
  useDiscover();
  const pending = discoverStore.openCount();
  const { data: collection } = useCollection();
  const nickname = email ? email.split("@")[0] : "다이버";
  const initial = nickname.slice(0, 1).toUpperCase();
  const got = summary?.collected_species ?? collection?.size ?? 0;
  const total = summary?.total_species ?? TOTAL_SPECIES;
  const pct = total ? Math.round((got / total) * 100) : 0;
  const encounters = summary?.encounter_count ?? 0;

  const marks = useMemo(() => [...(collection?.values() ?? [])], [collection]);
  // 오늘의 바다 친구: an illustrated species not met yet, rotating daily (written-up species first).
  const today = new Date();
  const friend = useMemo(() => {
    const unmet = SPECIES.filter((s) => s.art && !collection?.has(s.no));
    const pool = unmet.filter((s) => SPECIES_FACTS[s.no]).length ? unmet.filter((s) => SPECIES_FACTS[s.no]) : unmet;
    const day = Math.floor(today.getTime() / 86_400_000);
    return pool.length ? pool[day % pool.length] : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);
  const facts = friend ? SPECIES_FACTS[friend.no] : undefined;
  const recent = useMemo(
    () => marks.filter((m) => SPECIES_BY_NO[m.no]?.art).sort((a, b) => b.latestSeen.localeCompare(a.latestSeen)).slice(0, 6),
    [marks],
  );
  const goal = MILESTONES.find((m) => m > got) ?? total;
  const badgeCount = MILESTONES.filter((m) => m <= got).length;
  const regularMark = useMemo(
    () => marks.filter((m) => m.count < REGULAR_BADGE_GOAL && SPECIES_BY_NO[m.no]?.art).sort((a, b) => b.count - a.count)[0],
    [marks],
  );
  const regularSpecies = regularMark ? SPECIES_BY_NO[regularMark.no] : undefined;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
              MOLA
            </Txt>
            <Txt accessibilityRole="header" size={26} weight="black" tracking={-0.02}>
              {nickname}님의 바다
            </Txt>
          </View>
          <View style={styles.row8}>
            <Pressable accessibilityRole="button" accessibilityLabel="내 계정" onPress={() => router.push("/profile")} style={styles.avatar}>
              <Txt size={17} weight="black">
                {initial}
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* Collection progress */}
        <View style={[styles.card, styles.progressCard]} accessibilityLabel={`수집 달성률 ${pct}퍼센트, ${got}종 수집, 만남 ${encounters}회`}>
          <View style={styles.spaceBetween}>
            <View style={[styles.row8, { alignItems: "baseline" }]}>
              <Txt size={13} weight="bold" color={colors.ink2}>
                수집 달성률
              </Txt>
              <Txt size={22} weight="black" color={colors.oceanBlue}>
                {pct}%
              </Txt>
            </View>
            <Txt size={13} color={colors.ink2}>
              <Txt size={13} weight="bold">
                {got}
              </Txt>{" "}
              / {total}종 · 만남 {encounters}회
            </Txt>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </View>

        {/* Pending photos banner */}
        <Pressable
          onPress={() => router.navigate("/discover")}
          accessibilityRole="button"
          accessibilityLabel={pending ? `남은 사진 ${pending}장 이어서 식별하기` : "다이빙 사진으로 생물 찾기"}
          style={styles.banner}
        >
          <View style={styles.photoStack}>
            <View style={[styles.photo, { left: 0, top: 6, backgroundColor: "#27609A", transform: [{ rotate: "-8deg" }] }]} />
            <View style={[styles.photo, { left: 12, top: 2, backgroundColor: "#1B4F86", transform: [{ rotate: "4deg" }] }]} />
            <View style={[styles.photo, styles.photoTop]}>
              <Critter kind="mandarin" width={38} height={24} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={14} weight="extraBold" color={colors.white}>
              {pending ? `식별하던 사진 ${pending}장이 남아 있어요` : "다이빙 사진 속 친구를 찾아볼까요?"}
            </Txt>
            <Txt size={12} color="#B0C4DE">
              {pending ? "멈춘 곳부터 이어서 할 수 있어요" : "사진을 고르면 AI가 생물 이름을 알려줘요"}
            </Txt>
          </View>
          <View style={styles.bannerCta}>
            <Txt size={13} weight="black">
              {pending ? "이어서 하기" : "식별하기"}
            </Txt>
          </View>
        </Pressable>

        {/* Today's friend */}
        {friend?.art ? (
          <View style={[styles.friend, shadow.card]}>
            <View style={styles.friendArt}>
              <Svg width="100%" height={214} style={StyleSheet.absoluteFill} viewBox="0 0 350 214" preserveAspectRatio="none">
                <Path d="M0 170 Q44 160 88 170 T175 170 T263 170 T350 170" stroke="#DCEAF8" strokeWidth={2} fill="none" />
                <Circle cx={40} cy={120} r={5} fill="none" stroke="#BCD5F2" strokeWidth={1.5} />
                <Circle cx={54} cy={104} r={3} fill="none" stroke="#BCD5F2" strokeWidth={1.5} />
              </Svg>
              <Critter kind={friend.art} width={326} height={138} style={{ position: "absolute", left: 12, top: 44 }} />
              <View style={styles.friendPill}>
                <SunIcon />
                <Txt size={12} weight="bold" color={colors.white}>
                  오늘의 바다 친구 · {today.getMonth() + 1}월 {today.getDate()}일
                </Txt>
              </View>
              <NameTag ko={friend.nameKo} en={`${friend.nameEn} · ${friend.sciName}`} size="md" filled style={styles.friendTag} />
            </View>
            <View style={styles.friendBody}>
              <View style={styles.wrapRow}>
                <View style={styles.dashedChip}>
                  <Txt size={12} weight="bold" color={colors.ink2}>
                    아직 못 만났어요
                  </Txt>
                </View>
                {facts?.iucn ? (
                  <View style={styles.iucnChip}>
                    <Txt size={12} weight="bold" color={colors.coral}>
                      {facts.iucn}
                    </Txt>
                  </View>
                ) : null}
              </View>
              {facts ? (
                <>
                  <Txt size={15} color={colors.ink2} style={{ lineHeight: 25 }}>
                    {facts.didYouKnow}
                  </Txt>
                  <View style={styles.factGrid}>
                    <Fact label="사는 곳" value={facts.habitat} />
                    <Fact label="크기" value={facts.size} />
                  </View>
                </>
              ) : (
                <Txt size={15} color={colors.ink2} style={{ lineHeight: 25 }}>
                  {friend.group} 친구예요. 다음 다이빙에서 만나 보세요!
                </Txt>
              )}
              <View style={styles.row8}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: "/species/[no]", params: { no: friend.no } })}
                  style={styles.primaryBtn}
                >
                  <Txt size={15} weight="extraBold" color={colors.white}>
                    도감에서 자세히 보기
                  </Txt>
                  <ChevronRight color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {/* Recent encounters */}
        <View style={styles.sectionHead}>
          <Txt accessibilityRole="header" size={18} weight="black">
            최근 나의 발자국
          </Txt>
          <Pressable accessibilityRole="link" onPress={() => router.navigate("/log")} hitSlop={8}>
            <Txt size={13} weight="bold" color={colors.oceanBlue}>
              모두 보기
            </Txt>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
          {recent.length === 0 ? (
            <View style={[styles.recentCard, { justifyContent: "center" }]}>
              <Txt size={13} color={colors.ink2} style={{ textAlign: "center" }}>
                아직 만난 생물이 없어요.{"\n"}첫 사진을 올려 보세요!
              </Txt>
            </View>
          ) : null}
          {recent.map((m) => {
            const s = SPECIES_BY_NO[m.no];
            const r = { no: m.no, kind: s.art!, firstTime: m.count === 1, round: m.count, meta: `${daysAgo(m.latestSeen)}` };
            return (
              <Pressable
                key={r.no}
                accessibilityRole="button"
                accessibilityLabel={`${s.nameKo}, ${r.firstTime ? "첫 만남" : `${r.round}번째 만남`}, ${r.meta}`}
                onPress={() => router.push({ pathname: "/species/[no]", params: { no: r.no } })}
                style={styles.recentCard}
              >
                <View style={[styles.recentBadge, { backgroundColor: r.firstTime ? colors.coral : colors.sky }]}>
                  <Txt size={11} weight="extraBold" color={r.firstTime ? colors.white : colors.oceanBlue}>
                    {r.firstTime ? "신규 · 첫 만남" : `${r.round}번째 만남`}
                  </Txt>
                </View>
                <Critter kind={r.kind} width={148} height={76} />
                <NameTag ko={s.nameKo} en={s.nameEn} />
                <Txt size={12} color={colors.ink2}>
                  {r.meta}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Quests */}
        <View style={[styles.sectionHead, { marginTop: 24 }]}>
          <Txt accessibilityRole="header" size={18} weight="black">
            탐험 과제
          </Txt>
          <Txt size={13} color={colors.ink2}>
            배지 {badgeCount}개 획득
          </Txt>
        </View>
        <View style={styles.quest}>
          <View style={styles.questBadge}>
            <GlobeIcon />
            <Txt size={10} weight="black" tracking={0.06}>
              {goal}
            </Txt>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Txt size={16} weight="black">
              도감 {goal}종 채우기
            </Txt>
            <Txt size={13} color={colors.ink2}>
              새로운 생물을{" "}
              <Txt size={13} weight="bold" color={colors.ink2}>
                {Math.max(goal - got, 0)}종
              </Txt>{" "}
              더 발견하면 배지를 받아요!
            </Txt>
            <View style={styles.row8}>
              <View style={[styles.track, { flex: 1, backgroundColor: "#F3DE95" }]}>
                <View style={[styles.fill, { width: `${Math.min(got / goal, 1) * 100}%`, backgroundColor: colors.navy }]} />
              </View>
              <Txt size={12} weight="extraBold">
                {got} / {goal}종
              </Txt>
            </View>
          </View>
        </View>
        {regularMark && regularSpecies ? (
          <Pressable
            onPress={() => router.push({ pathname: "/species/[no]", params: { no: regularMark.no } })}
            accessibilityRole="button"
            accessibilityLabel={`${regularSpecies.nameKo} 단골 친구, ${REGULAR_BADGE_GOAL}회 중 ${regularMark.count}회`}
            style={styles.regular}
          >
            <Critter kind={regularSpecies.art!} width={76} height={40} />
            <View style={{ flex: 1 }}>
              <Txt size={14} weight="extraBold">
                {regularSpecies.nameKo} 단골 친구
              </Txt>
              <Txt size={12} color={colors.ink2}>
                {`같은 종을 ${REGULAR_BADGE_GOAL}번 만나면 받아요`}
              </Txt>
            </View>
            <View style={[styles.row8, { gap: 4 }]}>
              {Array.from({ length: REGULAR_BADGE_GOAL }, (_, i) => (
                <View key={i} style={[styles.pip, i < regularMark.count ? styles.pipOn : styles.pipOff]} />
              ))}
            </View>
          </Pressable>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Txt size={11} color={colors.ink2}>
        {label}
      </Txt>
      <Txt size={13} weight="extraBold">
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8 },
  row8: { flexDirection: "row", alignItems: "center", gap: 8 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  spaceBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  badgeDot: { position: "absolute", top: 10, right: 11, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral, borderWidth: 2, borderColor: colors.white },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.pillLine, backgroundColor: colors.sky, alignItems: "center", justifyContent: "center" },
  card: { marginHorizontal: 20, borderRadius: 12, backgroundColor: colors.white },
  progressCard: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.oceanBlue },
  banner: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.navy },
  photoStack: { width: 66, height: 50 },
  photo: { position: "absolute", width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: colors.navy },
  photoTop: { left: 22, top: 0, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  bannerCta: { height: 36, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.white, justifyContent: "center" },
  friend: { marginTop: 16, marginHorizontal: 20, borderRadius: 12, backgroundColor: colors.white, overflow: "hidden" },
  friendArt: { height: 214, backgroundColor: colors.ghostBg, overflow: "hidden" },
  friendPill: { position: "absolute", left: 14, top: 14, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.navy },
  friendTag: { position: "absolute", bottom: 12 },
  friendBody: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  dashedChip: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.ink3 },
  iucnChip: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: "#FEE2E2" },
  factGrid: { flexDirection: "row", gap: 8 },
  fact: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.ghostBg },
  primaryBtn: { flex: 1, height: 50, borderRadius: 10, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  squareBtn: { width: 50, height: 50, borderRadius: 10, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  sectionHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 28 },
  recentRow: { gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  recentCard: { width: 168, paddingTop: 14, paddingHorizontal: 10, paddingBottom: 12, borderRadius: 12, backgroundColor: colors.white, alignItems: "center", gap: 8 },
  recentBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  quest: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12, marginHorizontal: 20, padding: 16, borderRadius: 12, backgroundColor: "#FFF7DC", borderWidth: 1, borderColor: "#F3DE95" },
  questBadge: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderStyle: "dashed", borderColor: colors.navy, backgroundColor: colors.sunny, alignItems: "center", justifyContent: "center" },
  regular: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, marginHorizontal: 20, paddingVertical: 10, paddingLeft: 10, paddingRight: 16, borderRadius: 12, backgroundColor: colors.white },
  pip: { width: 10, height: 10, borderRadius: 5 },
  pipOn: { backgroundColor: colors.oceanBlue },
  pipOff: { borderWidth: 2, borderColor: colors.ghostLine },
  community: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginHorizontal: 20, paddingVertical: 14, paddingLeft: 16, paddingRight: 12, borderRadius: 12, backgroundColor: colors.white },
  commAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.sky, alignItems: "center", justifyContent: "center" },
  commThumb: { width: 72, height: 56, borderRadius: 10, backgroundColor: colors.ghostBg, alignItems: "center", justifyContent: "center" },
});
