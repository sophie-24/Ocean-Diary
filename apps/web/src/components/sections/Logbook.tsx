import { colors } from "@/theme/tokens";
import { LogFormInApp } from "@/components/LogFormInApp";
import { ExperienceBlock, SectionShell } from "./ExperienceBlock";

/**
 * 플로우 ① 로그북 — 다이빙 끝났으니 숫자부터 기록.
 * 스쿠버·프리다이빙·스노클링 세 모드 다 지원.
 */
export function Logbook() {
  return (
    <SectionShell
      id="logbook"
      background={colors.mist}
      label="Step 01 · 로그북"
      title={
        <>
          다이빙 끝났으니,
          <br />
          숫자부터 분위기까지 2분이면 끝.
        </>
      }
      lead={
        <>
          실제 Mola 앱 화면을 눌러보세요. 상단 모드 탭을 바꾸면 스쿠버·프리·스노클링
          입력 폼이 각기 다르게 뜨고, 스노클링은 "한 번씩만 톡" 수준으로 아주 간단해요.
        </>
      }
    >
      <ExperienceBlock
        no="01"
        label="새 다이빙 기록"
        title={<>탭 세 개로 스쿠버·프리·스노클링 모두</>}
        body={
          <>
            다이브 번호는 자동 부여돼요. 날짜·지역·포인트 세 가지만 입력하면 저장 가능 —
            나머지는 다녀오면서 메모처럼 채워요.
            <br />
            <br />
            <strong style={{ color: colors.navy }}>스노클링 탭을 눌러보세요.</strong> 수심·시간
            물어보지 않고, S1·S2…로 따로 쌓여서 다이브 번호랑 안 섞여요. 보트에서 거북이
            봤던 기록도 두 줄로 남아요.
          </>
        }
        align="left"
        tilt={-2}
      >
        <LogFormInApp />
      </ExperienceBlock>
    </SectionShell>
  );
}
