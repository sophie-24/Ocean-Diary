import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { GearIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { useMemo } from "react";
import { SPECIES, SPECIES_BY_NO } from "../../data/species";
import { SPECIES_FACTS } from "../../data/facts";
import { useAuth } from "../../api/auth";
import { useCollection } from "../../api/queries";
import { colors } from "../../theme/tokens";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const daysAgo = (iso: string) => {
  const d = Math.round((Date.now() - new Date(`${iso.slice(0, 10)}T00:00:00`).getTime()) / 86_400_000);
  return d <= 0 ? "오늘" : d === 1 ? "어제" : d < 30 ? `${d}일 전` : iso.slice(0, 10).replace(/-/g, ".");
};

export function HomeScreen() {
  const router = useRouter();
  const { nickname: savedNickname } = useAuth();
  const { data: collection } = useCollection();
  const nickname = savedNickname ?? "다이버";

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

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Txt accessibilityRole="header" size={26} weight="bold" tracking={-0.02}>
              {nickname}님의 바다
            </Txt>
            <Txt size={12} weight="medium" color={colors.ink2} style={{ marginTop: 2 }}>
              {`${today.getMonth() + 1}월 ${today.getDate()}일 ${WEEKDAYS[today.getDay()]}요일`}
            </Txt>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="설정" onPress={() => router.push("/profile")} style={styles.settingsBtn}>
            <GearIcon size={22} color={colors.navy} />
          </Pressable>
        </View>

        {/* Today's friend */}
        {friend?.art ? (
          <View style={styles.friend}>
            <View style={styles.friendArt}>
              <Txt size={12} weight="medium" color={colors.ink3}>
                오늘의 바다 친구
              </Txt>
              <View style={styles.friendCritter}>
                <Critter kind={friend.art} width={340} height={160} />
              </View>
              <View style={styles.namePill}>
                <Txt size={20} weight="bold" style={{ lineHeight: 25 }}>
                  {friend.nameKo}
                </Txt>
                <Txt size={12} weight="medium" color={colors.ink2} style={{ lineHeight: 15 }}>
                  {friend.nameEn}
                </Txt>
                <Txt size={10} color={colors.ink3} style={{ lineHeight: 12, fontStyle: "italic" }}>
                  {friend.sciName}
                </Txt>
              </View>
            </View>
            <View style={styles.friendBody}>
              <View style={styles.wrapRow}>
                <View style={styles.chip}>
                  <Txt size={11} weight="medium" color={colors.ink2}>
                    미수집
                  </Txt>
                </View>
                {facts?.iucn ? (
                  <View style={[styles.chip, styles.iucnChip]}>
                    <Txt size={11} weight="bold" color={colors.coral}>
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
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: "/species/[no]", params: { no: friend.no } })}
                style={styles.primaryBtn}
              >
                <Txt size={15} weight="bold" color={colors.white}>
                  도감에서 자세히 보기
                </Txt>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Recent logbook */}
        <View style={styles.sectionHead}>
          <Txt accessibilityRole="header" size={18} weight="bold">
            최근 로그북
          </Txt>
          <Pressable accessibilityRole="link" onPress={() => router.navigate("/log")} hitSlop={8}>
            <Txt size={13} weight="medium" color={colors.oceanBlue}>
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
                <View style={[styles.recentBadge, { backgroundColor: r.firstTime ? colors.oceanBlue : colors.sky }]}>
                  <Txt size={10} weight="bold" color={r.firstTime ? colors.white : colors.oceanBlue} style={{ lineHeight: 14 }}>
                    {r.firstTime ? "신규" : `${r.round}회`}
                  </Txt>
                </View>
                <Critter kind={r.kind} width={132} height={66} />
                <View style={[styles.namePill, styles.namePillSm]}>
                  <Txt size={13} weight="bold" style={{ lineHeight: 16 }}>
                    {s.nameKo}
                  </Txt>
                  <Txt size={10} color={colors.ink2} style={{ lineHeight: 12 }}>
                    {s.nameEn}
                  </Txt>
                </View>
                <Txt size={11} color={colors.ink3} align="center">
                  {r.meta}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Txt size={11} color={colors.ink3}>
        {label}
      </Txt>
      <Txt size={13} weight="bold" style={{ marginTop: 2 }}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  settingsBtn: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  friend: { marginTop: 24, backgroundColor: colors.white },
  friendArt: { paddingTop: 32, paddingHorizontal: 20, alignItems: "center" },
  friendCritter: { marginTop: 24, width: 350, height: 180, alignItems: "center", justifyContent: "center" },
  namePill: { marginTop: 20, alignItems: "center", paddingTop: 5, paddingBottom: 6, paddingHorizontal: 20, borderRadius: 999, borderWidth: 2, borderColor: "#A8CBF2" },
  namePillSm: { marginTop: 0, paddingTop: 3, paddingBottom: 4, paddingHorizontal: 12 },
  friendBody: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 28, gap: 16 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, backgroundColor: "#F0F0F2" },
  iucnChip: { backgroundColor: "#FEF2F2" },
  factGrid: { flexDirection: "row", gap: 8 },
  fact: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.ghostBg },
  primaryBtn: { height: 48, borderRadius: 10, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  sectionHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 40 },
  recentRow: { gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  recentCard: { width: 156, paddingTop: 14, paddingHorizontal: 12, paddingBottom: 14, borderRadius: 12, backgroundColor: colors.white, alignItems: "center", gap: 10 },
  recentBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
});
