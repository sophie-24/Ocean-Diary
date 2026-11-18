# today.mola.app

Mola의 Threads/IG 유입용 **로그인·설치 없는 체험 미니앱**. 산사(온라인 절) 패턴을 다이빙 도메인에 이식.

링크 하나 → 즉시 "오늘의 다이빙" 보임 → 물멍 → 그림일기 체험 → Mola 네이티브 앱 다운로드 CTA.

## 구조

```
apps/web/
  app/
    layout.tsx       # 폰트(Noto Sans KR + Gaegu) + 전역 메타
    page.tsx         # 랜딩: 섹션 1–3 연결
    globals.css      # Tailwind 베이스 + 수채 그레인 유틸
  src/
    data/
      destinations.ts    # 큐레이션된 18개 다이빙 지역 + pickOfTheDay 로직
    components/
      TodaySpot.tsx      # 섹션 1 히어로 카드
      SpeciesChip.tsx    # 시그니처 생물 칩
      WatercolorBlob.tsx # 수채 블롭 SVG (SSR-safe)
```

## 개발

```bash
cd apps/web
npm install
npm run dev     # http://localhost:3000
npm run typecheck
```

## 배포

Vercel 프로젝트 연결 + 도메인 `today.mola.app` 연결.

```
Framework preset: Next.js
Root directory: apps/web
Build command: next build
Output: .next
```

## 진행 상태

- [x] 섹션 1 "오늘의 다이빙" MVP
  - [x] 18개 지역 데이터 (필리핀 7, 인니 3, 이집트 2, 몰디브, 말레이, 팔라우, 일본, 제주, 호주)
  - [x] UTC 날짜 기반 오늘의 추천 로테이션
  - [x] 수채 블롭 히어로 + Gaegu 손글씨 vibe 라인
  - [x] 시그니처 생물 칩 (실루엣 아이콘, 네이티브 앱 일러스트 포팅 시 교체)
  - [x] 공유 OG 메타
- [ ] 섹션 2 "물멍" — 수조 애니메이션 + 스쿠버 ASMR
- [ ] 섹션 3 "그림일기" — Higgsfield 서버 호출로 수채 로그 카드 생성
- [ ] 동적 OG 이미지 라우트 (`/api/og/[id]`) — Threads/IG 공유 시 수채 카드 썸네일

## 디자인 원칙 (산사 바이럴 공식 이식)

1. **0.5초 안에 뭔가 보여야** — 로그인·CTA 모달 금지
2. **채팅·알림·경쟁·광고 없음** — Threads에서 "조용함"을 셀링 포인트로
3. **공유 가능한 카드 = 한 장짜리 스샷** — 유저 화면 캡처 → 바로 피드에 던질 수 있어야
4. **네이티브 Mola 앱이랑 폰트/색이 같음** — "같은 스튜디오의 또 다른 작은 선물" 느낌
