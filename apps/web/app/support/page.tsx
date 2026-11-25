import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "지원 · Mola",
  description: "Mola 문의 및 자주 묻는 질문",
};

const CONTACT = "sophia.gyuri@gmail.com";

const FAQ: { q: string; a: string }[] = [
  {
    q: "회원 탈퇴는 어떻게 하나요?",
    a: "앱의 설정에서 '회원 탈퇴'를 선택하면 계정과 다이빙 기록, 사진이 모두 삭제됩니다.",
  },
  {
    q: "AI가 알려준 생물이 틀렸어요.",
    a: "AI 식별은 참고용 후보를 제안하며 정확하지 않을 수 있습니다. 후보를 직접 확인하고 도감에서 검색해 선택해 주세요.",
  },
  {
    q: "로그인이 되지 않아요.",
    a: "앱을 최신 버전으로 업데이트한 뒤 다시 시도해 주세요. 계속되면 사용 중인 로그인 방식(Apple, Google, 카카오)과 증상을 메일로 알려 주세요.",
  },
  {
    q: "사진은 어디에 저장되나요?",
    a: "업로드한 사진은 클라우드 저장소에 보관되며, 본인만 볼 수 있습니다. 자세한 내용은 개인정보 처리방침을 확인해 주세요.",
  },
];

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-[15px] leading-7">
      <h1 className="text-3xl">Mola 지원</h1>
      <p className="mt-4">
        문의나 버그 제보는 이메일로 보내 주세요. 보통 영업일 기준 3일 이내에 답변드립니다.
      </p>
      <p className="mt-2">
        <a className="font-bold underline" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
      </p>

      <h2 className="mt-10 text-xl">자주 묻는 질문</h2>
      <dl className="mt-4 space-y-5">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt className="font-bold">{item.q}</dt>
            <dd className="mt-1">{item.a}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-neutral-500">
        <a className="underline" href="/privacy">
          개인정보 처리방침
        </a>
      </p>
    </main>
  );
}
