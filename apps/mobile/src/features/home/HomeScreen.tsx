import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { BellIcon, BookmarkIcon, ChevronRight, GlobeIcon, SunIcon } from "../../components/icons";
import { NameTag } from "../../components/ui/NameTag";
import { Txt } from "../../components/ui/Txt";
import { SPECIES_BY_NO, TOTAL_SPECIES } from "../../data/species";
import { MOCK_COLLECTION } from "../../mocks/collection";
import {
  MOCK_COMMUNITY,
  MOCK_PENDING_UPLOAD,
  MOCK_PROFILE,
  MOCK_QUESTS,
  MOCK_RECENT,
  MOCK_TODAY_FRIEND,
} from "../../mocks/home";
import { colors, shadow } from "../../theme/tokens";

export function HomeScreen() {
  const router = useRouter();
  const got = MOCK_COLLECTION.length;
  const pct = Math.round((got / TOTAL_SPECIES) * 100);
  const friend = SPECIES_BY_NO[MOCK_TODAY_FRIEND.no];
  const { region, regular } = MOCK_QUESTS;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
              OCEAN DIARY
            </Txt>
            <Txt accessibilityRole="header" size={26} weight="black" tracking={-0.02}>
              {MOCK_PROFILE.nickname}님의 바다
            </Txt>
          </View>
          <View style={styles.row8}>
            <Pressable accessibilityRole="button" accessibilityLabel={`알림 ${MOCK_PROFILE.unreadNotifications}개`} style={styles.iconBtn}>
              <BellIcon />
              {MOCK_PROFILE.unreadNotifications > 0 ? <View style={styles.badgeDot} /> : null}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="내 프로필" style={styles.avatar}>
              <Txt size={17} weight="black">
                {MOCK_PROFILE.initial}
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* Collection progress */}
        <View style={[styles.card, styles.progressCard]} accessibilityLabel={`수집 달성률 ${pct}퍼센트, ${got}종 수집, 만남 ${MOCK_PROFILE.totalEncounters}회`}>
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
              / {TOTAL_SPECIES}종 · 만남 {MOCK_PROFILE.totalEncounters}회
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
          accessibilityLabel={`${MOCK_PENDING_UPLOAD.place} 사진 ${MOCK_PENDING_UPLOAD.photoCount}장 식별하기`}
          style={styles.banner}
        >
          <View style={styles.photoStack}>
            <View style={[styles.photo, { left: 0, top: 6, backgroundColor: "#27609A", transform: [{ rotate: "-8deg" }] }]} />
            <View style={[styles.photo, { left: 12, top: 2, backgroundColor: "#1B4F86", transform: [{ rotate: "4deg" }] }]} />
            <View style={[styles.photo, styles.photoTop]}>
              <Critter kind={MOCK_PENDING_UPLOAD.coverKind} width={38} height={24} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={14} weight="extraBold" color={colors.white}>
              {MOCK_PENDING_UPLOAD.place} 사진 {MOCK_PENDING_UPLOAD.photoCount}장을 찾았어요
            </Txt>
            <Txt size={12} color="#C3D8F5">
              {MOCK_PENDING_UPLOAD.dateLabel} 다이빙 {MOCK_PENDING_UPLOAD.diveCount}회와 자동으로 묶었어요
            </Txt>
          </View>
          <View style={styles.bannerCta}>
            <Txt size={13} weight="black">
              식별하기
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
                  오늘의 바다 친구 · {MOCK_TODAY_FRIEND.dateLabel}
                </Txt>
              </View>
              <NameTag ko={friend.nameKo} en={`${friend.nameEn} · ${friend.sciName}`} size="md" filled style={styles.friendTag} />
            </View>
            <View style={styles.friendBody}>
              <View style={styles.wrapRow}>
                <View style={styles.dashedChip}>
                  <Txt size={12} weight="bold" color={colors.ink2}>
                    {MOCK_TODAY_FRIEND.status}
                  </Txt>
                </View>
                <View style={styles.iucnChip}>
                  <Txt size={12} weight="bold" color="#A8382A">
                    {MOCK_TODAY_FRIEND.iucn}
                  </Txt>
                </View>
              </View>
              <Txt size={15} color="#34466E" style={{ lineHeight: 25 }}>
                {MOCK_TODAY_FRIEND.blurb}
              </Txt>
              <View style={styles.factGrid}>
                <Fact label="만나기 좋은 곳" value={MOCK_TODAY_FRIEND.bestPlace} />
                <Fact label="시즌" value={MOCK_TODAY_FRIEND.season} />
              </View>
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
                <Pressable accessibilityRole="button" accessibilityLabel="다음에 만날 친구로 저장" style={styles.squareBtn}>
                  <BookmarkIcon />
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
          {MOCK_RECENT.map((r) => {
            const s = SPECIES_BY_NO[r.no];
            return (
              <Pressable
                key={r.no}
                accessibilityRole="button"
                accessibilityLabel={`${s.nameKo}, ${r.firstTime ? "첫 만남" : `${r.round}번째 만남`}, ${r.meta}`}
                onPress={() => router.push({ pathname: "/species/[no]", params: { no: r.no } })}
                style={styles.recentCard}
              >
                <View style={[styles.recentBadge, { backgroundColor: r.firstTime ? colors.coral : colors.sky }]}>
                  <Txt size={11} weight="extraBold" color={r.firstTime ? colors.white : "#1F4FA8"}>
                    {r.firstTime ? "NEW · 첫 만남" : `${r.round}번째 만남`}
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
            배지 {MOCK_QUESTS.badgeCount}개 획득
          </Txt>
        </View>
        <View style={styles.quest}>
          <View style={styles.questBadge}>
            <GlobeIcon />
            <Txt size={10} weight="black" tracking={0.06}>
              {region.badge}
            </Txt>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Txt size={16} weight="black">
              {region.title}
            </Txt>
            <Txt size={13} color="#34466E">
              {region.body}{" "}
              <Txt size={13} weight="bold" color="#34466E">
                {region.remaining}종
              </Txt>{" "}
              더 발견하면 배지를 받아요!
            </Txt>
            <View style={styles.row8}>
              <View style={[styles.track, { flex: 1, backgroundColor: "#F3DE95" }]}>
                <View style={[styles.fill, { width: `${(region.current / region.goal) * 100}%`, backgroundColor: colors.navy }]} />
              </View>
              <Txt size={12} weight="extraBold">
                {region.current} / {region.goal}종
              </Txt>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => router.push({ pathname: "/species/[no]", params: { no: regular.no } })}
          accessibilityRole="button"
          accessibilityLabel={`${regular.title}, ${regular.goal}회 중 ${regular.current}회`}
          style={styles.regular}
        >
          <Critter kind={regular.kind} width={76} height={40} />
          <View style={{ flex: 1 }}>
            <Txt size={14} weight="extraBold">
              {regular.title}
            </Txt>
            <Txt size={12} color={colors.ink2}>
              {regular.body}
            </Txt>
          </View>
          <View style={[styles.row8, { gap: 4 }]}>
            {Array.from({ length: regular.goal }, (_, i) => (
              <View key={i} style={[styles.pip, i < regular.current ? styles.pipOn : styles.pipOff]} />
            ))}
          </View>
        </Pressable>

        {/* Community */}
        <View style={[styles.sectionHead, { marginTop: 24 }]}>
          <Txt accessibilityRole="header" size={18} weight="black">
            다른 다이버의 새로운 발견
          </Txt>
        </View>
        <View style={styles.community}>
          <View style={styles.commAvatar}>
            <Txt size={15} weight="black" color="#1F4FA8">
              {MOCK_COMMUNITY.initial}
            </Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={14}>
              <Txt size={14} weight="bold">
                {MOCK_COMMUNITY.user}
              </Txt>{" "}
              님이 {MOCK_COMMUNITY.place}에서{" "}
              <Txt size={14} weight="bold">
                {MOCK_COMMUNITY.speciesName}
              </Txt>{" "}
              무리를 만났어요
            </Txt>
            <View style={[styles.row8, { marginTop: 4, gap: 6 }]}>
              <Txt size={12} color={colors.ink2}>
                {MOCK_COMMUNITY.timeAgo}
              </Txt>
              {!MOCK_COMMUNITY.inMyBook ? (
                <View style={[styles.dashedChip, { paddingVertical: 1, paddingHorizontal: 7 }]}>
                  <Txt size={12} color={colors.ink2}>
                    내 도감에 아직 없어요
                  </Txt>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.commThumb}>
            <Critter kind={MOCK_COMMUNITY.kind} width={66} height={40} />
          </View>
        </View>
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
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  badgeDot: { position: "absolute", top: 10, right: 11, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral, borderWidth: 2, borderColor: colors.white },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.pillLine, backgroundColor: colors.sky, alignItems: "center", justifyContent: "center" },
  card: { marginHorizontal: 20, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  progressCard: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.oceanBlue },
  banner: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.navy },
  photoStack: { width: 66, height: 50 },
  photo: { position: "absolute", width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: colors.navy },
  photoTop: { left: 22, top: 0, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  bannerCta: { height: 36, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.white, justifyContent: "center" },
  friend: { marginTop: 16, marginHorizontal: 20, borderRadius: 28, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  friendArt: { height: 214, backgroundColor: "#EAF3FC", overflow: "hidden" },
  friendPill: { position: "absolute", left: 14, top: 14, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.navy },
  friendTag: { position: "absolute", bottom: 12 },
  friendBody: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  dashedChip: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#9BB2D1" },
  iucnChip: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: "#FDECEA" },
  factGrid: { flexDirection: "row", gap: 8 },
  fact: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.mist },
  primaryBtn: { flex: 1, height: 50, borderRadius: 16, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  squareBtn: { width: 50, height: 50, borderRadius: 16, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  sectionHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 28 },
  recentRow: { gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  recentCard: { width: 168, paddingTop: 14, paddingHorizontal: 10, paddingBottom: 12, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: "center", gap: 8 },
  recentBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  quest: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12, marginHorizontal: 20, padding: 16, borderRadius: 22, backgroundColor: "#FFF7DC", borderWidth: 1, borderColor: "#F3DE95" },
  questBadge: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderStyle: "dashed", borderColor: colors.navy, backgroundColor: colors.sunny, alignItems: "center", justifyContent: "center" },
  regular: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, marginHorizontal: 20, paddingVertical: 10, paddingLeft: 10, paddingRight: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  pip: { width: 10, height: 10, borderRadius: 5 },
  pipOn: { backgroundColor: colors.oceanBlue },
  pipOff: { borderWidth: 2, borderColor: colors.ghostLine },
  community: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginHorizontal: 20, paddingVertical: 14, paddingLeft: 16, paddingRight: 12, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  commAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.sky, alignItems: "center", justifyContent: "center" },
  commThumb: { width: 72, height: 56, borderRadius: 14, backgroundColor: colors.ghostBg, alignItems: "center", justifyContent: "center" },
});
