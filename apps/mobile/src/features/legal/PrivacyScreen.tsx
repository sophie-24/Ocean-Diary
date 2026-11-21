/**
 * Mola 개인정보 처리방침 — in-app page shown from Profile and the login notice.
 *
 * This is a plain-language draft meant for the beta period. Before the first
 * public release it must go through a lawyer's review and be updated with the
 * final business entity, retention periods, and overseas transfer details.
 */
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors } from "../../theme/tokens";

export function PrivacyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => (router.canGoBack() ? router.back() : router.navigate("/"))}
          style={styles.hit}
        >
          <ChevronLeft />
        </Pressable>
        <Txt accessibilityRole="header" size={20} weight="black">
          개인정보 처리방침
        </Txt>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Txt size={13} color={colors.ink2}>
          시행일: 2026년 11월 17일
        </Txt>

        <Txt size={14} style={styles.intro}>
          Mola(이하 &quot;서비스&quot;)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 권익을 지키기 위해 다음과 같이 처리방침을 수립·공개합니다.
        </Txt>

        <Section title="1. 수집하는 개인정보">
          <Txt size={14} weight="bold">필수 항목</Txt>
          <Bullet>이메일 주소 (Google 계정 로그인 시)</Bullet>
          <Bullet>서비스 식별자 (Supabase 계정 ID)</Bullet>

          <Txt size={14} weight="bold" style={styles.subhead}>
            선택 항목
          </Txt>
          <Bullet>프로필 이미지 (Google 계정 연동 시 자동)</Bullet>

          <Txt size={14} weight="bold" style={styles.subhead}>
            이용자가 직접 입력·업로드
          </Txt>
          <Bullet>다이빙 로그 (장소명, 일시, 수심, 메모 등)</Bullet>
          <Bullet>다이빙 사진</Bullet>

          <Txt size={14} weight="bold" style={styles.subhead}>
            자동 수집
          </Txt>
          <Bullet>서비스 이용 기록 (접속 일시, 오류 로그)</Bullet>
        </Section>

        <Section title="2. 이용 목적">
          <Bullet>회원 가입 및 본인 확인</Bullet>
          <Bullet>다이빙 로그 저장·동기화</Bullet>
          <Bullet>AI 생물 식별 서비스 제공</Bullet>
          <Bullet>서비스 품질 개선과 오류 대응</Bullet>
        </Section>

        <Section title="3. 보관 기간">
          <Txt size={14}>
            회원 탈퇴 시 수집된 개인정보와 이용 기록이 즉시 삭제됩니다. 다만 관련 법령에 따라 보관이 필요한 경우(예: 「전자상거래법」상 계약·결제 기록 5년)는 해당 기간 동안 분리 보관됩니다.
          </Txt>
        </Section>

        <Section title="4. 제3자 제공·위탁">
          <Txt size={14}>다음 서비스에 제한된 정보가 처리됩니다.</Txt>
          <Bullet>Supabase (인증·데이터 저장): 이메일, 계정 ID, 이용자 입력 데이터</Bullet>
          <Bullet>Google OAuth (로그인): 이메일, 프로필 정보</Bullet>
          <Bullet>OpenAI (AI 생물 식별): 이용자가 업로드한 사진 — 식별 결과 반환 후 영구 저장하지 않음</Bullet>
        </Section>

        <Section title="5. 이용자 권리">
          <Txt size={14}>이용자는 언제든 다음 권리를 행사할 수 있습니다.</Txt>
          <Bullet>열람: &apos;설정&apos;에서 수집된 정보 확인</Bullet>
          <Bullet>수정: 프로필 수정</Bullet>
          <Bullet>삭제: &apos;설정 → 회원탈퇴&apos;로 모든 기록 영구 삭제</Bullet>
          <Bullet>처리 정지 요청: 아래 책임자 연락처로 문의</Bullet>
        </Section>

        <Section title="6. 안전성 확보 조치">
          <Bullet>통신 암호화 (HTTPS/TLS)</Bullet>
          <Bullet>비밀번호 저장 안 함 (OAuth 방식)</Bullet>
          <Bullet>접근 권한 최소화 및 접근 로그 기록</Bullet>
        </Section>

        <Section title="7. 쿠키·식별자 사용">
          <Txt size={14}>
            서비스는 세션 유지를 위해 기기에 인증 토큰을 저장합니다. 광고용 추적 식별자는 수집하지 않습니다.
          </Txt>
        </Section>

        <Section title="8. 개인정보 보호책임자">
          <Txt size={14}>
            이름: 김규리{"\n"}
            연락처: <Txt size={14} weight="bold">sophia.gyuri@gmail.com</Txt>
          </Txt>
        </Section>

        <Section title="9. 변경 사항">
          <Txt size={14}>
            이 처리방침이 변경되면 서비스 내 공지와 함께 변경 내용·시행일을 알립니다. 중요한 변경은 로그인 시 다시 동의를 받습니다.
          </Txt>
        </Section>

        <Txt size={12} color={colors.ink2} align="center" style={styles.footer}>
          이 문서는 베타 버전입니다. 정식 출시 전 법률 검토를 거쳐 업데이트됩니다.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt size={17} weight="black" style={styles.sectionTitle}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bullet}>
      <Txt size={14}>• </Txt>
      <Txt size={14} style={{ flex: 1, lineHeight: 22 }}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  intro: { marginTop: 8, lineHeight: 22 },
  section: { marginTop: 16, gap: 6 },
  sectionTitle: { marginBottom: 4 },
  subhead: { marginTop: 10 },
  bullet: { flexDirection: "row", paddingVertical: 2, paddingLeft: 4 },
  footer: { marginTop: 32, paddingHorizontal: 12 },
});
