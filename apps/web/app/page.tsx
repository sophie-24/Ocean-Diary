import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { Background } from "@/components/sections/Background";
import { Solution } from "@/components/sections/Solution";
import { Features } from "@/components/sections/Features";
import { Logbook } from "@/components/sections/Logbook";
import { Diary } from "@/components/sections/Diary";
import { Discover } from "@/components/sections/Discover";
import { Dogam } from "@/components/sections/Dogam";
import { Aquarium } from "@/components/sections/Aquarium";
import { SignupCTA } from "@/components/sections/SignupCTA";
import { Footer } from "@/components/sections/Footer";

/**
 * Mola 랜딩 one-pager.
 *
 * 색·톤 리듬:
 *   파랑(Hero) → mist(Background) → 다크(Solution) → ghost(Features)
 *   → mist(Logbook) → white(Diary) → mist(Discover) → white(Dogam)
 *   → 네이비(Aquarium · 수조 다크톤) → 파랑(Signup) → 다크(Footer)
 *
 * 섹션 흐름 — 다이빙 끝나고 앱에서 일어나는 순서 그대로:
 *   01 로그북 → 02 그림일기 → 03 AI 식별 → 04 도감 → 05 나의 바다 수조
 *
 * 각 섹션엔 설계서의 실제 앱 화면을 PhoneFrame으로 재현한 미니 앱이
 * 들어있어서 설치 전에 손가락으로 눌러볼 수 있어요.
 */
export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
      <Hero />
      <Background />
      <Solution />
      <Features />
      <Logbook />
      <Diary />
      <Discover />
      <Dogam />
      <Aquarium />
      <SignupCTA />
      <Footer />
      </main>
    </>
  );
}
