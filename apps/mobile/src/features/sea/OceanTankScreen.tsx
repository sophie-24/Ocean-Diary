import { Pressable } from "react-native";
import { Critter } from "../../components/Critter";
import type { CritterKind } from "../../data/illustrations";
import { BaitBall } from "./BaitBall";
import { OceanScene } from "./OceanScene";
import { SwimmingFish } from "./SwimmingFish";
import { InTank } from "./stage";
import { TankShell, useResidents, type Cast } from "./TankShell";

const CAST: Cast = { thresher: "007", silvertip: "012", zebra: "010", tawny: "009", trevally: "034" };

export function OceanTankScreen() {
  const residents = useResidents(CAST);
  return (
    <TankShell
      title="나의 바다"
      subtitle={(n) => `대양 수조 · ${n}종이 헤엄치고 있어요`}
      scene={(rays) => <OceanScene rays={rays} />}
      residents={residents}
      current="ocean"
      notes={{ dawn: "물빛이 밝아지고 있어요", day: "햇빛이 깊이 들어와요", dusk: "바다가 보랏빛으로 물들어요", night: "달빛 아래 천천히 헤엄쳐요" }}
    >
      {({ pick }) => (
        <>
          <SwimmingFish kind="silvertip" w={190} h={88} left={150} top={232} dx={-130} duration={28} phase={9} far label="실버팁샤크 · 눌러서 명판 보기" onPress={pick("silvertip")} />
          <BaitBall left={100} top={370} onPress={pick("trevally")} />
          <SwimmingFish kind="zebra" w={170} h={76} left={18} top={664} dx={50} duration={44} phase={14} label="제브라샤크 · 눌러서 명판 보기" onPress={pick("zebra")} />
          <InTank kind="tawny">
            <Pressable style={{ position: "absolute", left: 222, top: 670 }} onPress={pick("tawny")} accessibilityRole="button" accessibilityLabel="토니 너스샤크 · 쉬는 중">
              <Critter kind="tawny" width={160} height={69} />
            </Pressable>
          </InTank>
          <SwimmingFish kind="thresher" w={300} h={143} left={-40} top={470} dx={150} duration={30} phase={4} label="환도상어 · 눌러서 명판 보기" onPress={pick("thresher")} />
        </>
      )}
    </TankShell>
  );
}
