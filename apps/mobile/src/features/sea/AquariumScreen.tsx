import { Pressable } from "react-native";
import { Critter } from "../../components/Critter";
import type { CritterKind } from "../../data/illustrations";
import { SPECIES_BY_NO } from "../../data/species";
import { ReefScene } from "./ReefScene";
import { VideoScene } from "./VideoScene";
import { reefVideos } from "./sceneVideos";
import { SwimmingFish } from "./SwimmingFish";
import { Dance, Peek } from "./TankParts";
import { InTank } from "./stage";
import { TankShell, useResidents, type Cast } from "./TankShell";

// Choreographed critters of the reef tank → catalog no. Only species the diver has met appear.
const CAST: Cast = {
  napoleon: "029",
  lionfish: "027",
  boxfish: "032",
  puffer: "031",
  mandarin: "026",
  moray: "030",
  epaulette: "015",
  whitetip: "006",
  blacktip: "005",
  grouper: "028",
  trevally: "034",
};

const name = (k: CritterKind) => SPECIES_BY_NO[CAST[k]!]?.nameKo ?? "";

export function AquariumScreen() {
  const residents = useResidents(CAST);
  return (
    <TankShell
      title="나의 바다"
      subtitle={(n) => `산호초 수조 · ${n}종이 살고 있어요`}
      scene={({ rays, phase }) => (
        <VideoScene phase={phase} videos={reefVideos} fallback={<ReefScene rays={rays} />} />
      )}
      residents={residents}
      current="reef"
    >
      {({ night, dark, pick }) => {
        const far = [
          { kind: "blacktip" as const, w: 96, h: 40, left: 10, top: 196, dx: 260, dur: 34, phase: 4 },
          { kind: "trevally" as const, w: 44, h: 22, left: 200, top: 156, dx: -150, dur: 22, phase: 10 },
          { kind: "trevally" as const, w: 38, h: 19, left: 230, top: 178, dx: -160, dur: 24, phase: 11 },
        ];
        const mid = [
          ...(night ? [] : [{ kind: "napoleon" as const, w: 164, h: 78, left: 10, top: 300, dx: 190, dur: 22, phase: 3 }]),
          { kind: "puffer" as const, w: 70, h: 41, left: 296, top: 268, dx: -150, dur: 18, phase: 8 },
          { kind: "boxfish" as const, w: 58, h: 35, left: 40, top: 420, dx: 220, dur: 16, phase: 2 },
          { kind: "epaulette" as const, w: 92, h: 37, left: 150, top: 664, dx: 70, dur: 26, phase: 12 },
          { kind: "grouper" as const, w: 230, h: 108, left: -60, top: 470, dx: 300, dur: 26, phase: 6 },
          ...(night ? [{ kind: "whitetip" as const, w: 146, h: 60, left: 20, top: 560, dx: 230, dur: 20, phase: 7 }] : []),
        ];
        return (
          <>
            {far.map((f, i) => (
              <SwimmingFish key={`far${i}`} {...f} duration={f.dur} far label={`${name(f.kind)} · 눌러서 명판 보기`} onPress={pick(f.kind)} />
            ))}
            {!night ? (
              <InTank kind="whitetip">
                <Pressable style={{ position: "absolute", left: 250, top: 644 }} onPress={pick("whitetip")} accessibilityRole="button" accessibilityLabel="백기흉상어 · 쉬는 중">
                  <Critter kind="whitetip" width={136} height={56} />
                </Pressable>
              </InTank>
            ) : (
              <InTank kind="napoleon">
                <Pressable style={{ position: "absolute", left: 160, top: 576, opacity: 0.75 }} onPress={pick("napoleon")} accessibilityRole="button" accessibilityLabel="나폴레옹피쉬 · 자는 중">
                  <Critter kind="napoleon" width={150} height={71} />
                </Pressable>
              </InTank>
            )}
            <Peek onPress={pick("moray")} />
            <InTank kind="lionfish">
              <Pressable style={{ position: "absolute", left: 270, top: 520 }} onPress={pick("lionfish")} accessibilityRole="button" accessibilityLabel="라이언피쉬 · 눌러서 명판 보기">
                <Critter kind="lionfish" width={92} height={60} />
              </Pressable>
            </InTank>
            {dark ? (
              <Dance onPress={pick("mandarin")} />
            ) : (
              <InTank kind="mandarin">
                <Pressable style={{ position: "absolute", left: 190, top: 682, opacity: 0.55 }} onPress={pick("mandarin")} accessibilityRole="button" accessibilityLabel="만다린피쉬 · 산호 틈에 숨어 있어요. 해 질 녘에 나와요">
                  <Critter kind="mandarin" width={30} height={19} />
                </Pressable>
              </InTank>
            )}
            {mid.map((f) => (
              <SwimmingFish key={f.kind} {...f} duration={f.dur} label={`${name(f.kind)} · 눌러서 명판 보기`} onPress={pick(f.kind)} />
            ))}
          </>
        );
      }}
    </TankShell>
  );
}
