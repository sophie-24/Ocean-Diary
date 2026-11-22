import { Critter } from "@/components/Critter";
import { Txt, DiaryTxt } from "@/components/ui/Txt";
import { colors } from "@/theme/tokens";

/**
 * 섹션 3 — 다이빙 그림일기 미리보기.
 *
 * 설계서 "MVP 제외 - 로그북/그림일기" 항목을 랜딩에서 미리 시각적으로
 * 보여주는 데모 카드. 실제 AI 생성은 아직 서버에 붙어있지 않지만, "이렇게
 * 생긴 그림일기가 매일 쌓이는 앱"이라는 감만 전달.
 *
 * 세 개의 가상 샘플을 보여줘서 "다이버 한 명의 로그"가 어떻게 누적되는지
 * 미리보기. 실제 생성 체험은 앱 출시 후.
 */

const SAMPLES = [
  {
    date: "2026. 11. 02",
    spot: "말라파스쿠아 모나드 숄",
    critter: "thresher" as const,
    body: "새벽 5시 입수. 어둠 속에서 환도상어가 조용히 다가왔어요. 꼬리가 몸만큼 길어서, 지느러미가 아니라 리본 같았어요.",
    weather: "수온 28°C · 시야 20m",
  },
  {
    date: "2026. 10. 24",
    spot: "모알보알 파낙사",
    critter: "trevally" as const,
    body: "정어리 떼가 머리 위를 지나가는데 햇빛이 비늘에 부딪혀 은빛 폭죽 같았어요. 숨 쉬는 걸 깜빡했어요.",
    weather: "수온 27°C · 시야 15m",
  },
  {
    date: "2026. 10. 18",
    spot: "아닐라오 바실루라",
    critter: "pygmy" as const,
    body: "손톱만 한 피그미 해마. 핀셋으로 집어든 리본 같았어요. 눈이 마주쳤다고 생각했는데, 그쪽에선 그냥 분홍색 산호였을지도.",
    weather: "수온 26°C · 시야 12m",
  },
];

export function DiaryTeaser() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {SAMPLES.map((s, i) => (
        <article
          key={i}
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.line}`,
            borderRadius: 24,
            padding: "24px 24px 26px",
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
          }}
        >
          {/* 왼쪽: 수채 생물 미니 카드 */}
          <div
            style={{
              flexShrink: 0,
              width: 108,
              height: 108,
              backgroundColor: colors.mist,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Critter kind={s.critter} size={88} />
          </div>

          {/* 오른쪽: 날짜·장소·일기·메타 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <Txt size={14} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
                {s.date}
              </Txt>
              
              <Txt size={14} weight="extraBold" color={colors.navy}>
                {s.spot}
              </Txt>
            </div>
            <DiaryTxt
              size={18}
              color={colors.ink2}
              as="p"
              style={{ display: "block", margin: "6px 0 10px" }}
            >
              {s.body}
            </DiaryTxt>
            <Txt size={13} color={colors.ink3}>
              {s.weather}
            </Txt>
          </div>
        </article>
      ))}

      <p
        style={{
          margin: "8px 0 0",
          fontSize: 15,
          color: colors.ink3,
          textAlign: "center",
        }}
      >
        * 샘플 입니다. 앱 출시 후 네 다이빙이 이렇게 쌓여요.
      </p>
    </div>
  );
}
