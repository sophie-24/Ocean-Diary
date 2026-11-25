import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 · Mola",
  description: "Mola 개인정보 처리방침",
};

const CONTACT = "sophia.gyuri@gmail.com";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-[15px] leading-7">
      <h1 className="text-3xl">개인정보 처리방침</h1>
      <p className="mt-2 text-sm text-neutral-500">시행일: 2026년 11월 24일</p>

      <p className="mt-6">
        Mola(이하 &quot;서비스&quot;)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 권익을
        지키기 위해 다음과 같이 처리방침을 수립·공개합니다.
      </p>

      <Section title="1. 수집하는 개인정보">
        <h3 className="mt-2 font-bold">로그인 시 (Apple, Google, 카카오 중 이용자가 선택한 방식)</h3>
        <ul>
          <li>Apple: 이메일(Apple의 비공개 릴레이 주소일 수 있음), 이름(이용자가 제공에 동의한 경우)</li>
          <li>Google: 이메일, 이름, 프로필 이미지</li>
          <li>카카오: 닉네임, 프로필 이미지 (이메일은 요청하지 않음)</li>
          <li>서비스 계정 식별자(Supabase 사용자 ID)</li>
        </ul>
        <h3 className="mt-4 font-bold">이용자가 직접 입력·업로드하는 정보</h3>
        <ul>
          <li>다이빙 로그(장소, 일시, 수심, 메모 등)</li>
          <li>다이빙 사진, 생물 기록</li>
        </ul>
        <h3 className="mt-4 font-bold">자동 수집</h3>
        <ul>
          <li>서비스 이용 기록(요청 일시, 오류 로그, 사용량 제한을 위한 요청 횟수)</li>
        </ul>
      </Section>

      <Section title="2. 이용 목적">
        <ul>
          <li>회원 가입, 로그인, 본인 확인</li>
          <li>다이빙 로그와 사진의 저장·동기화</li>
          <li>AI 생물 식별 기능 제공</li>
          <li>서비스 안정성 확보, 오남용 방지, 오류 대응</li>
        </ul>
      </Section>

      <Section title="3. 처리 위탁 및 국외 이전">
        <p>서비스 제공을 위해 아래 사업자에게 개인정보 처리를 위탁하며, 모두 해외 서버에서 처리됩니다.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3">수탁자</th>
                <th className="py-2 pr-3">위탁 업무 / 항목</th>
                <th className="py-2">처리 위치</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b">
                <td className="py-2 pr-3">Supabase Inc.</td>
                <td className="py-2 pr-3">인증, 데이터베이스 저장 (계정 정보, 다이빙 기록)</td>
                <td className="py-2">인도 (뭄바이)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">Fly.io, Inc.</td>
                <td className="py-2 pr-3">API 서버 운영 (요청 처리 중 전송되는 모든 항목)</td>
                <td className="py-2">일본 (도쿄)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">Cloudflare, Inc. (R2)</td>
                <td className="py-2 pr-3">사진 파일 저장</td>
                <td className="py-2">Cloudflare 글로벌 네트워크</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">OpenAI, L.L.C.</td>
                <td className="py-2 pr-3">AI 생물 식별: 이용자가 식별을 요청한 사진</td>
                <td className="py-2">미국</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-3">Apple / Google / Kakao</td>
                <td className="py-2 pr-3">소셜 로그인 인증</td>
                <td className="py-2">각 사 처리방침에 따름</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          AI 식별 기능은 이용자가 식별을 요청한 사진만 OpenAI에 전송하며, 전송 시 저장 옵션을 끄고 요청합니다.
          다만 OpenAI의 정책에 따라 남용 방지 목적으로 일정 기간 보관될 수 있습니다. 사진은 서비스 운영 외의
          목적으로 판매하거나 광고에 사용하지 않습니다.
        </p>
      </Section>

      <Section title="4. 보관 및 파기">
        <ul>
          <li>회원 탈퇴 시 계정, 다이빙 기록, 사진 등 이용자 데이터를 삭제합니다.</li>
          <li>이용자가 삭제한 기록은 복구 가능 기간(최대 30일) 이후 완전히 삭제됩니다.</li>
          <li>관련 법령에 따라 보관이 필요한 정보는 해당 기간 동안 분리 보관 후 파기합니다.</li>
        </ul>
      </Section>

      <Section title="5. 이용자 권리">
        <ul>
          <li>열람·수정: 앱의 프로필 및 기록 화면에서 직접 확인·수정</li>
          <li>삭제: 앱의 &apos;설정 → 회원 탈퇴&apos;에서 모든 데이터를 삭제</li>
          <li>처리 정지·기타 요청: 아래 연락처로 문의</li>
        </ul>
      </Section>

      <Section title="6. 안전성 확보 조치">
        <ul>
          <li>모든 통신은 HTTPS/TLS로 암호화됩니다.</li>
          <li>비밀번호를 저장하지 않으며 소셜 로그인만 사용합니다.</li>
          <li>데이터베이스 접근 제한 및 서버 접근 권한 최소화</li>
        </ul>
      </Section>

      <Section title="7. 기기 저장 정보 및 추적">
        <p>
          세션 유지를 위해 기기에 인증 토큰을 저장합니다. 광고 식별자(IDFA)를 수집하지 않으며, 이용자를 추적하거나
          광고 목적으로 제3자와 공유하지 않습니다.
        </p>
      </Section>

      <Section title="8. 개인정보 보호책임자">
        <p>
          이름: 김규리
          <br />
          이메일: <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </Section>

      <Section title="9. 변경 사항">
        <p>이 방침이 변경되면 시행일과 변경 내용을 서비스 내 또는 이 페이지에 공지합니다.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
      <h2 className="mb-2 text-xl">{title}</h2>
      {children}
    </section>
  );
}
