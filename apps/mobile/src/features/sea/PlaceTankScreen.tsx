import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { usePlaces } from "../../api/queries";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { Txt } from "../../components/ui/Txt";
import type { CritterKind } from "../../data/illustrations";
import { SPECIES_BY_NO } from "../../data/species";
import { colors } from "../../theme/tokens";
import { BaitBall } from "./BaitBall";
import { OceanScene } from "./OceanScene";
import { VideoScene } from "./VideoScene";
import { oceanVideos } from "./sceneVideos";
import { PlaceForeground } from "./PlaceForeground";
import { SwimmingFish } from "./SwimmingFish";
import { Dance, Peek } from "./TankParts";
import { InTank } from "./stage";
import { TankShell, useResidents, type Cast } from "./TankShell";

type Place = {
  id: string;
  country: string;
  name: string;
  /** Region labels the diver may have typed for this place. */
  aliases: string[];
  cast: Cast;
};

// Places with a hand-choreographed tank. The diver's own logs decide who lives here.
export const PLACES: Record<string, Place> = {
  malapascua: {
    id: "malapascua",
    country: "필리핀 · 세부",
    name: "말라파스쿠아의 바다",
    aliases: ["말라파스쿠아", "malapascua"],
    cast: { thresher: "007", whitetip: "006", mandarin: "026", lionfish: "027", moray: "030", trevally: "034" },
  },
};

export const matchesPlace = (place: Place, label: string) => {
  const l = label.toLowerCase();
  return place.aliases.some((a) => l.includes(a.toLowerCase()));
};

export function PlaceTankScreen({ id }: { id: string }) {
  const router = useRouter();
  const place = PLACES[id] ?? PLACES.malapascua;
  const { data: places } = usePlaces();
  const visits = useMemo(() => (places ?? []).filter((p) => matchesPlace(place, p.region_label)), [places, place]);
  const seenHere = useMemo(() => new Set(visits.flatMap((v) => v.species.map((sp) => sp.catalog_no ?? ""))), [visits]);
  const residents = useResidents(place.cast, seenHere);
  const friends = Object.keys(residents) as CritterKind[];
  const logs = visits.reduce((n, v) => n + v.log_count, 0);
  const first = visits.map((v) => v.first_date).sort()[0];
  const last = visits.map((v) => v.last_date).sort().at(-1);
  const range = first ? `${first.replace(/-/g, ".")}${last && last !== first ? ` – ${last.slice(5).replace(/-/g, ".")}` : ""} · ` : "";

  return (
    <TankShell
      eyebrow={place.country}
      title={place.name}
      subtitle={(n) => `${range}다이빙 ${logs}회 · ${n}종`}
      emptyHint="이 바다에서 기록한 생물이 아직 없어요"
      scene={({ rays, phase }) => (
        <VideoScene phase={phase} videos={oceanVideos} fallback={<OceanScene rays={rays} />} />
      )}
      residents={residents}
      backHref="/sea/map"
      sound="scuba"
      notes={{ dawn: "환도상어가 클리닝 스테이션에 올라와요", day: "만다린피쉬는 산호 틈에 숨었어요", dusk: "만다린피쉬 짝짓기 춤 시간", night: "백기흉상어가 사냥 중" }}
      footer={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {friends.map((k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={`${SPECIES_BY_NO[residents[k]!.no].nameKo} 도감 보기`}
              onPress={() => router.push({ pathname: "/species/[no]", params: { no: residents[k]!.no } })}
              style={styles.friend}
            >
              <Critter kind={k} width={52} height={30} />
              <Txt size={10} weight="bold" color={colors.white} numberOfLines={1}>
                {SPECIES_BY_NO[residents[k]!.no].nameKo}
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
          <InTank kind="lionfish">
            <Pressable style={{ position: "absolute", left: 250, top: 520 }} onPress={pick("lionfish")} accessibilityRole="button" accessibilityLabel="라이언피쉬 · 눌러서 명판 보기">
              <Critter kind="lionfish" width={96} height={63} />
            </Pressable>
          </InTank>
          {night ? (
            <SwimmingFish kind="whitetip" w={140} h={58} left={30} top={560} dx={210} duration={20} phase={5} label="백기흉상어 · 밤 사냥 중" onPress={pick("whitetip")} />
          ) : (
            <InTank kind="whitetip">
              <Pressable style={{ position: "absolute", left: 150, top: 656 }} onPress={pick("whitetip")} accessibilityRole="button" accessibilityLabel="백기흉상어 · 쉬는 중">
                <Critter kind="whitetip" width={140} height={58} />
              </Pressable>
            </InTank>
          )}
          {dark ? (
            <Dance left={282} top={646} onPress={pick("mandarin")} />
          ) : (
            <InTank kind="mandarin">
              <Pressable style={{ position: "absolute", left: 300, top: 690, opacity: 0.55 }} onPress={pick("mandarin")} accessibilityRole="button" accessibilityLabel="만다린피쉬 · 산호 틈에 숨어 있어요. 해 질 녘에 나와요">
                <Critter kind="mandarin" width={30} height={19} />
              </Pressable>
            </InTank>
          )}
        </>
      )}
    </TankShell>
  );
}

const styles = StyleSheet.create({
  strip: { position: "absolute", left: 0, right: 0, bottom: 20, flexGrow: 0 },
  friend: { width: 76, height: 64, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 2, backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
});
