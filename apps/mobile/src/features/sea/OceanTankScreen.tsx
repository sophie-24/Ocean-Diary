import { Pressable } from "react-native";
import { Critter } from "../../components/Critter";
import type { CritterKind } from "../../data/illustrations";
import { BaitBall } from "./BaitBall";
import { OceanScene } from "./OceanScene";
import { SwimmingFish } from "./SwimmingFish";
import { TankShell, type Resident } from "./TankShell";

const RESIDENTS: Partial<Record<CritterKind, Resident>> = {
  thresher: { no: "007", date: "2026년 11월 2일", place: "말라파스쿠아 모나드 숄", count: 1, log: "로그 #38", isNew: true },
  silvertip: { no: "012", date: "2026년 3월 7일", place: "투바타하 리프", count: 1, log: "로그 #29" },
  zebra: { no: "010", date: "2025년 9월 12일", place: "호주 헤론섬", count: 2, log: "로그 #19" },
  tawny: { no: "009", date: "2026년 3월 8일", place: "투바타하 리프", count: 1, log: "로그 #31" },
  trevally: { no: "034", date: "2025년 4월 15일", place: "보홀 발리카삭", count: 2, log: "로그 #12" },
};

export function OceanTankScreen() {
  return (
    <TankShell
      title="나의 바다"
      subtitle={`대양 수조 · ${Object.keys(RESIDENTS).length}종이 헤엄치고 있어요`}
      scene={(rays) => <OceanScene rays={rays} />}
      residents={RESIDENTS}
      current="ocean"
      notes={{ dawn: "물빛이 밝아지고 있어요", day: "햇빛이 깊이 들어와요", dusk: "바다가 보랏빛으로 물들어요", night: "달빛 아래 천천히 헤엄쳐요" }}
    >
      {({ pick }) => (
        <>
          <SwimmingFish kind="silvertip" w={190} h={88} left={150} top={232} dx={-130} duration={28} phase={9} far label="실버팁샤크 · 눌러서 명판 보기" onPress={pick("silvertip")} />
          <BaitBall left={100} top={370} onPress={pick("trevally")} />
          <SwimmingFish kind="zebra" w={170} h={76} left={18} top={664} dx={50} duration={44} phase={14} label="제브라샤크 · 눌러서 명판 보기" onPress={pick("zebra")} />
          <Pressable style={{ position: "absolute", left: 222, top: 670 }} onPress={pick("tawny")} accessibilityRole="button" accessibilityLabel="토니 너스샤크 · 쉬는 중">
            <Critter kind="tawny" width={160} height={69} />
          </Pressable>
          <SwimmingFish kind="thresher" w={300} h={143} left={-40} top={470} dx={150} duration={30} phase={4} label="환도상어 · 눌러서 명판 보기" onPress={pick("thresher")} />
        </>
      )}
    </TankShell>
  );
}
