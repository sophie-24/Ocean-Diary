import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { Txt } from "../../components/ui/Txt";
import type { CritterKind } from "../../data/illustrations";
import { SPECIES_BY_NO } from "../../data/species";
import { colors } from "../../theme/tokens";
import { BaitBall } from "./BaitBall";
import { OceanScene } from "./OceanScene";
import { PlaceForeground } from "./PlaceForeground";
import { SwimmingFish } from "./SwimmingFish";
import { Dance, Peek } from "./TankParts";
import { TankShell, type Resident } from "./TankShell";

type Place = {
  id: string;
  country: string;
  name: string;
  meta: string;
  residents: Partial<Record<CritterKind, Resident>>;
};

// Mock place data. Phase 4 serves this from dive_logs + observations grouped by region.
export const PLACES: Record<string, Place> = {
  malapascua: {
    id: "malapascua",
    country: "필리핀 · 세부",
    name: "말라파스쿠아의 바다",
    meta: "2026.11.1 – 11.4 · 다이빙 4회 · 6종",
    residents: {
      thresher: { no: "007", date: "2026년 11월 2일", place: "모나드 숄", count: 1, log: "로그 #38", isNew: true },
      whitetip: { no: "006", date: "2026년 11월 1일", place: "가토 섬 동굴", count: 1, log: "로그 #36" },
      mandarin: { no: "026", date: "2026년 11월 1일", place: "라이트하우스", count: 1, log: "로그 #37", isNew: true },
      lionfish: { no: "027", date: "2026년 11월 1일", place: "라이트하우스", count: 1, log: "로그 #37" },
      moray: { no: "030", date: "2026년 11월 1일", place: "라이트하우스", count: 1, log: "로그 #37" },
      trevally: { no: "034", date: "2026년 11월 2일", place: "모나드 숄", count: 1, log: "로그 #38" },
    },
  },
};

export function PlaceTankScreen({ id }: { id: string }) {
  const router = useRouter();
  const place = PLACES[id] ?? PLACES.malapascua;
  const friends = Object.keys(place.residents) as CritterKind[];

  return (
    <TankShell
      eyebrow={place.country}
      title={place.name}
      subtitle={place.meta}
      scene={(rays) => <OceanScene rays={rays} />}
      residents={place.residents}
      backHref="/sea/map"
      notes={{ dawn: "환도상어가 클리닝 스테이션에 올라와요", day: "만다린피쉬는 산호 틈에 숨었어요", dusk: "만다린피쉬 짝짓기 춤 시간", night: "백기흉상어가 사냥 중" }}
      footer={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {friends.map((k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={`${SPECIES_BY_NO[place.residents[k]!.no].nameKo} 도감 보기`}
              onPress={() => router.push({ pathname: "/species/[no]", params: { no: place.residents[k]!.no } })}
              style={styles.friend}
            >
              <Critter kind={k} width={52} height={30} />
              <Txt size={10} weight="bold" color={colors.white} numberOfLines={1}>
                {SPECIES_BY_NO[place.residents[k]!.no].nameKo}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
      }
    >
      {({ night, dark, pick }) => (
        <>
          <SwimmingFish kind="thresher" w={290} h={138} left={-30} top={300} dx={140} duration={28} phase={6} label="환도상어 · 눌러서 명판 보기" onPress={pick("thresher")} />
          <BaitBall left={150} top={200} onPress={pick("trevally")} />
          <PlaceForeground />
          <Peek left={76} top={640} onPress={pick("moray")} />
          <Pressable style={{ position: "absolute", left: 250, top: 520 }} onPress={pick("lionfish")} accessibilityRole="button" accessibilityLabel="라이언피쉬 · 눌러서 명판 보기">
            <Critter kind="lionfish" width={96} height={63} />
          </Pressable>
          {night ? (
            <SwimmingFish kind="whitetip" w={140} h={58} left={30} top={560} dx={210} duration={20} phase={5} label="백기흉상어 · 밤 사냥 중" onPress={pick("whitetip")} />
          ) : (
            <Pressable style={{ position: "absolute", left: 150, top: 656 }} onPress={pick("whitetip")} accessibilityRole="button" accessibilityLabel="백기흉상어 · 쉬는 중">
              <Critter kind="whitetip" width={140} height={58} />
            </Pressable>
          )}
          {dark ? (
            <Dance left={282} top={646} onPress={pick("mandarin")} />
          ) : (
            <Pressable style={{ position: "absolute", left: 300, top: 690, opacity: 0.55 }} onPress={pick("mandarin")} accessibilityRole="button" accessibilityLabel="만다린피쉬 · 산호 틈에 숨어 있어요. 해 질 녘에 나와요">
              <Critter kind="mandarin" width={30} height={19} />
            </Pressable>
          )}
        </>
      )}
    </TankShell>
  );
}

const styles = StyleSheet.create({
  strip: { position: "absolute", left: 0, right: 0, bottom: 20, flexGrow: 0 },
  friend: { width: 76, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 2, backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
});
