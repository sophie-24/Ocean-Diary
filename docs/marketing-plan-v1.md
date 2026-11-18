# Mola 마케팅 플랜 v1 (Instagram · Threads · Reels)

- 상태: MVP 출시 전 베타 모집 단계용 초안
- 대상 계정: [@molamola_log](https://www.instagram.com/molamola_log/) (디스플레이명 "Mola | 다이버의 로그북 앱")
- 전제: 네이티브 Mola 앱이 docs/product-overview.md 1절 범위 그대로, docs/feature-spec-v1.md 화면(S01~S12)대로 구현된다는 가정.
- 디자인 시스템 기준: apps/mobile/src/theme/tokens.ts의 색 토큰 + 수채 Critter(32종) + Noto Sans KR/Pretendard/Gaegu 폰트 시스템. 랜딩(apps/web)과 동일한 톤·여백·타이포 규칙을 소셜 포스트에도 그대로 적용.
- 본 문서는 "어떤 글·이미지·영상을 어느 채널에 어떻게 올리고, 그 중 어디까지를 Claude가 자동화할 수 있는가"를 한 번에 정리한다.

---

## 1. 피드 포스트 유형 (M01~M09)

### 1.1 콘텐츠 기둥과 포스트 매트릭스

5개 콘텐츠 기둥(Species Spotlight · Diary Reveal · Dive Story · Map Discovery · Behind the Mola)을 포스트 포맷(피드 단일 · 캐러셀 · 릴스) 축과 교차해서 9개 포스트 유형(M01~M09)으로 세분화한다. 한 포스트는 반드시 한 포스트 유형에 속한다.

| ID | 유형 | 포맷 | 기둥 | 주기 |
|----|------|------|------|------|
| M01 | Species Card 캐러셀 | 캐러셀 5–7장 | Species Spotlight | 주 1회 |
| M02 | 오늘의 다이빙 추천 | 피드 단일 또는 캐러셀 3장 | Map Discovery | 주 1–2회 |
| M03 | 다이빙 그림일기 미리보기 | 캐러셀 3–5장 | Diary Reveal | 주 1회 |
| M04 | Dive Story 릴스 | 릴스 15–30초 | Dive Story | 주 1회 |
| M05 | 수조 ASMR 릴스 | 릴스 10–20초 | Diary Reveal | 격주 1회 |
| M06 | 앱 기능 시연 릴스 | 릴스 15–30초 | Behind the Mola | 주 1회 |
| M07 | Behind-the-build 릴스 | 릴스 30–60초 | Behind the Mola | 격주 1회 |
| M08 | 밈/반응 포스트 | 피드 단일 | 전 기둥 | 비정기 |
| M09 | 유저 UGC 리포스트 | 피드 단일·캐러셀 | Dive Story / Diary Reveal | 유입 시 |

주당 평균 7–9개 포스트 (피드 4–5 + 릴스 2–3 + 스토리는 상시). docs/marketing-plan에 들어가는 콘텐츠 캘린더는 이 M01~M09 ID를 사용해서 Notion DB로 운영한다.

### 1.2 M01 Species Card 캐러셀

- **목적**: 수채 생물 일러스트를 자산으로 보여주며 "Mola는 어떤 비주얼로 바다 친구를 그리는가"를 매주 반복 노출.
- **포맷**: 캐러셀 5~7장 (1080×1350 세로).
- **1장 (커버)**: 수채 Critter 1종 중앙, 상단에 "오늘의 바다 친구" 라벨(Pretendard Label, 자간 0.28em), 하단에 한글명 + 학명. 배경은 `colors.mist` 또는 `colors.ghostBg`.
- **2~N장**: 해당 종의 특징 1개씩 (서식지, 크기, 다이버가 만나는 포인트, 비슷한 종과 구분하는 법 등).
- **마지막 장 (CTA)**: "앱 출시되면 내 도감에 담아둘게요 → @molamola_log" + Mola 로고 + bio 링크 안내.
- **디자인 베이스**: `apps/web/src/theme/typography.ts`의 `type.h3` + `type.body`. 손글씨 vibe 라인은 `type.diary`.
- **카피 구조**: hook(1줄 질문형) → fact 3개 → CTA. 150자 이내 캡션.
- **해시태그**: `#다이빙 #스쿠버다이빙 #해양생물 #mola #다이빙로그` (5개 상한).
- **자산 출처**: `apps/mobile/assets/illustrations/species/*.webp` 32종 중 매주 1종 로테이션.

### 1.3 M02 오늘의 다이빙 추천

- **목적**: `apps/web/src/data/destinations.ts`의 18개 지역 큐레이션을 소셜에 확장. 랜딩의 "오늘의 다이빙" 카드를 소셜 네이티브 포맷으로 리패키징.
- **포맷**: 피드 단일(1080×1350) 또는 캐러셀 3장 (지역 소개 + 시그니처 생물 + 접근성).
- **디자인**: 상단 2/3 수채 배경(`WatercolorBlob` 톤), 하단 1/3 지역명 + 국가. 캐러셀 2~3장은 Critter 수채 카드 그대로.
- **카피**: "오늘은 **말라파스쿠아** 어때요? 환도상어가 청소받는 새벽을 기다려요." 30~60자.
- **해시태그**: 지역 태그 추가 (`#malapascua #필리핀다이빙 #세부다이빙`).
- **CTA**: "매일 아침 하나씩 → today.mola.app"

### 1.4 M03 다이빙 그림일기 미리보기

- **목적**: 앱 핵심 기능(그림일기 로그북)의 톤을 스크린샷 형식으로 보여줌. "결과물이 이렇게 생긴다"가 유일한 메시지.
- **포맷**: 캐러셀 3~5장. 각 장이 하나의 완성된 그림일기 페이지.
- **디자인**: 흰 바탕 + Critter + 손글씨(Gaegu) 본문 + 날짜·장소·수온 메타. `apps/web/src/components/DiaryTeaser.tsx`에 쓴 샘플 레이아웃 그대로.
- **카피**: "이번주 바다, 이렇게 남겼어요." 간결.
- **CTA**: 마지막 장에 "앱 출시되면 네 바다도 이렇게 → 출시 연락받기 today.mola.app"

### 1.5 M04 Dive Story 릴스

- **목적**: 실제 다이빙 영상(수중 클립 or 보트 클립) 위에 Mola 앱 UI를 얹어 "다녀와서 이렇게 기록된다"를 보여줌.
- **포맷**: 릴스 15~30초, 1080×1920.
- **구조**: hook(1~3초) → 다이빙 하이라이트(5~15초) → Mola 앱 로그 reveal(5~10초) → CTA.
- **카피 훅**: "다이빙 다녀와서 뭘 봤는지 자꾸 까먹지 않나요?" / "오늘 바다가 어땠는지 기록하는 가장 쉬운 방법"
- **자막**: 자동 생성 (Submagic 또는 Higgsfield). 글씨 색은 흰색, 백드롭은 `colors.navy` 반투명.
- **음원**: 트렌딩 오디오 2026년 기준 small-account 추천 리스트 매주 업데이트 (Reel 알고리즘이 트렌딩 오디오에 가산점).

### 1.6 M05 수조 ASMR 릴스

- **목적**: 랜딩 `WaterMeditation` 섹션의 톤을 15초 릴스로 압축. "Mola 수조에서 수집한 친구들이 떠다니는 모습" + 스쿠버 숨소리.
- **포맷**: 릴스 10~20초, 1080×1920.
- **구조**: 수조 애니메이션 풀샷 + 스쿠버 숨소리 + 하단 작은 카피 "잠시 쉬어가요 · Mola".
- **CTA**: "오디오 켜고 보세요" 1줄 캡션. 캡션 CTA는 최소.
- **제작**: Higgsfield `generate_video` + 네이티브 앱의 `scuba.m4a` 믹스. 또는 Mola 네이티브 앱 화면 녹화.

### 1.7 M06 앱 기능 시연 릴스

- **목적**: 앱의 한 기능을 7–15초 안에 "이렇게 쓰면 돼요"로 보여줌. Cal AI의 "take a picture of 밥 한 장 → 칼로리" 공식의 Mola 버전.
- **포맷**: 릴스 7–20초.
- **시퀀스 템플릿**:
  1. "다이빙 다녀와서" (hook 1~3초, 수중 사진 썸네일)
  2. Mola 앱 열기 → 사진 업로드 (3~5초)
  3. AI 종 식별 결과 reveal (3~5초)
  4. 도감에 저장 → 수조에 새 친구 등장 (3~5초)
- **자막**: 각 시퀀스에 1줄씩. Submagic 스타일.
- **카피**: 캡션은 짧게 "사진 한 장이면 돼요." + 이모지 1~2개.

### 1.8 M07 Behind-the-build 릴스

- **목적**: 메이커 서사 (산사의 메타몽 공식). "취준생이 바이브 코딩으로 만들었어요" 톤을 Mola 버전으로 — "다이빙 로그 쓰기 귀찮아서 만들었어요."
- **포맷**: 릴스 30~60초.
- **구조**: 창업자 셀피 톤 또는 화면 녹화. 코드 → 디자인 → 결과물 → 사용자 반응 흐름.
- **카피**: 1인칭, 평어체. "오늘은 수조에 생물이 떠다니게 만들었어요" 같은 메이커 일지 느낌.
- **빈도**: 격주 1회. 너무 자주 하면 서사 힘 빠짐.

### 1.9 M08 밈·반응 포스트

- **목적**: 다이버 커뮤니티의 공감 포인트를 가볍게 밈화. "힙불교"가 "극락도 락이다"로 밈을 썼듯, Mola는 "다이빙"을 밈 소재로.
- **포맷**: 피드 단일(1080×1080) 또는 Threads 글.
- **예시 밈 소재**:
  - "다이버의 MBTI는 전부 J다 (로그북 쓰려고 노력하지만 못 쓰는)"
  - "다이빙 가방에 꼭 있는데 한번도 안 쓴 것" (종이 로그북)
  - "다이빙 10년차의 현실적 로그북 상태 before/after"
- **디자인**: 흰 바탕 + Pretendard Black + 1~2 line 큰 글씨. 또는 짤 캡쳐 + Mola 로고.

### 1.10 M09 유저 UGC 리포스트

- **목적**: Mola 앱을 쓰거나 베타 신청한 유저가 올린 포스트를 리그램. 사회적 증거 + 유저 활성화.
- **운영 규칙**:
  - 해시태그 `#mola_diary` 또는 `#mola수조` 모니터링 (주 1회)
  - 유저에게 DM으로 "피쳐해도 될까요?" 동의 받기
  - 리그램 시 유저 핸들 크게, Mola 코멘트 1줄
- **출시 전**: 베타 모집 단계라 UGC는 적지만, 랜딩 미니앱 체험 스샷(오늘의 다이빙 카드, DiaryTeaser 샘플)을 올리는 유저가 있을 가능성 → 먼저 체크.

---

## 2. Reels 자동화 플로우

### 2.1 Reel 제작의 단계와 각 단계의 자동화 가능성

Reel 하나를 만들어서 발행하기까지 5단계. 각 단계에서 Claude(이 세션)가 혼자 할 수 있는지, 외부 AI 도구가 필요한지, 사람 손이 반드시 필요한지 명시.

| 단계 | 작업 | Claude 혼자 가능? | 사용 도구 | 사람 개입 |
|------|------|------------------|----------|----------|
| 1 | 스크립트·훅·캡션 생성 | ✓ | Claude 본체 | 톤 승인만 |
| 2 | 비주얼 소재 생성 (이미지·수조 애니) | ✓ | `mcp__Higgsfield__generate_image`, `generate_video` | 결과 선택 |
| 3 | 영상 편집 (컷·BGM·자막) | △ | Higgsfield → OR Submagic·OpusClip·CapCut | **수동 업로드 필요** |
| 4 | 메타데이터 (커버·해시태그·멘션) | ✓ | Claude 본체 | 검수 |
| 5 | Instagram Reels 발행 | ✗ (직접은 불가) | Meta IG Business API → 서드파티 스케줄러(Blotato/PostLink/Buffer) | **IG Business 계정 전환 + 스케줄러 가입 필수** |

### 2.2 실제 쓸 수 있는 세 가지 자동화 수준

**레벨 A — 풀 오토 (Claude만으로)**
- 흐름: Claude가 스크립트 작성 → Higgsfield `generate_video`로 영상 만듦 → Vercel Storage(또는 네 디스크)에 저장 → 네가 IG에 수동 업로드.
- **실현 가능한 범위**: 수조 ASMR 릴스(M05), 앱 기능 시연 릴스(M06). 인물이 안 등장하거나 화면 녹화 기반인 릴스.
- **한계**: 실제 다이빙 영상(Dive Story 릴스, M04)은 유저가 수중 촬영한 영상이 필요하므로 Claude가 소재 없음.

**레벨 B — 하이브리드 (Claude + Submagic/OpusClip + 수동 업로드)** ← **추천**
- 흐름:
  1. Claude: 스크립트 + 캡션 + 해시태그 draft
  2. Higgsfield: 수조·수채 비주얼 소재 생성
  3. 네가 다이빙 영상 촬영 OR 기존 영상 선택
  4. Submagic(자막) 또는 OpusClip(장영상 → 클립 분할)으로 후처리
  5. Claude가 커버 이미지·해시태그 세트 완성
  6. 네가 IG에 수동 업로드 (Meta Business Suite 또는 Instagram 앱 내 네이티브 스케줄러)
- **장점**: 비용 낮음 (Submagic $12/월, OpusClip 무료), 각 단계 네가 통제 가능.
- **비용**: Submagic $12/월 또는 OpusClip 무료 + Higgsfield 구독.

**레벨 C — 풀 오토 end-to-end (서드파티 스케줄러까지 묶음)**
- 흐름: Claude 스크립트 → Higgsfield 영상 → Vercel → **Blotato / PostLink / Buffer API** → IG Business 계정에 자동 발행.
- **전제 조건**:
  - [@molamola_log] 계정을 Business로 전환 + Facebook Page 연결
  - 서드파티 스케줄러 가입 (Blotato $20~/월, PostLink $15~/월, Buffer $15~/월)
  - 서드파티 API 키를 네 환경변수로 넣어주면 Claude가 호출
- **주의**: Meta Content Publishing API는 Reels 발행 시 네이티브 스케줄링 파라미터가 없어서 스케줄러가 "지정된 시간에 발행" 역할을 대신한다.

### 2.3 레벨 B 상세 레시피 (일주일 Reel 3개 배치 제작)

금요일 오후 2시간 블록 하나로 다음 주 Reel 3개 다 만들기:

```
금 14:00  Claude: 다음 주 3개 Reel 아이디어 생성
          (M04 Dive Story / M05 수조 ASMR / M06 앱 기능 중 로테이션)
금 14:15  Claude: 각 Reel 스크립트 + 캡션 + 해시태그 + 커버 copy
금 14:30  Higgsfield generate_video:
          - M05용 수조 애니메이션 (10초, 수채 Critter 떠다님)
          - M06용 앱 UI 녹화 overlay
          → .mp4 3개 Vercel Storage 업로드
금 15:00  네가 M04용 다이빙 영상 Finder/Photos에서 선택
금 15:15  Submagic: 세 영상에 자막 입히기 (각 5~10분)
금 15:45  네가 Meta Business Suite로 3개 예약 (월·수·금 20시)
```

전체 2시간 안에 다음 주 Reel 3개 완성. Claude 자동화 포함 시 수동 작업 시간은 1시간 이하로 축소 가능.

### 2.4 Mola에 최적화된 Reel 소재 생성 MCP 호출 템플릿

**수조 ASMR 릴스(M05) Higgsfield 호출 예시**:
```
mcp__Higgsfield__generate_video({
  prompt: "Gentle watercolor aquarium scene, pale Korean pastel palette,
           three silhouettes of tropical fish drifting slowly left to right,
           soft blue background #16285A, 10 seconds, vertical 1080x1920,
           no text, cinematic calm underwater ambience",
  duration: 10,
  aspect_ratio: "9:16"
})
```

**앱 UI 시연 릴스(M06)**: 화면 녹화는 네 iPhone에서 해야 하고, Claude는 자막·커버·캡션만 담당.

### 2.5 Instagram 네이티브 스케줄러 vs. 서드파티 비교 (2026년 11월 기준)

| 요소 | IG 네이티브 (Business 계정) | Meta Business Suite | 서드파티 (Blotato 등) |
|------|---------------------------|---------------------|---------------------|
| 가격 | 무료 | 무료 | $15~$30/월 |
| Reels 지원 | ✓ | ✓ | ✓ |
| 캐러셀 | ✓ | ✓ | ✓ |
| Stories | 제한적 | ✓ | ✓ |
| 1일 발행 한도 | 25 포스트 · 75일 ahead | 동일 | 동일 |
| Claude에서 API 호출 | ✗ (수동 UI만) | ✗ | ✓ (레벨 C) |
| 성과 분석 | 기본 | 기본 | 상세 |

**출시 전 베타 모집 단계 추천**: **Meta Business Suite + Claude 레벨 B** 조합. 비용 0원, 수동이지만 통제력 높음. 계정 성장 후 월 포스트 20+개 넘어가면 레벨 C로 이행.

---

## 3. Threads 자동화

### 3.1 Threads의 특성과 Mola 기용

Threads는 [산사 바이럴 사례](https://toss.im/apps-in-toss/blog/sansa)에서 보듯 **긴 캡션보다 1인칭 짧은 글이 터지는 채널**. "링크 하나 올려두면 100만명이 들어온다"의 공식 플랫폼. Mola에 가장 중요한 이유 3가지:

1. **메이커 서사 공유의 최적 채널**: @몰라몰라.해녀 or [@molamola_log] 계정이 "오늘 코드 좀 더 썼어요" 같은 Behind-the-build 포스트를 올리는 곳.
2. **밈화 가능한 포맷**: 500자 제한 + 짧은 쓰레드로 밈·반응·관찰 공유에 적합.
3. **광고 경쟁도 낮음**: 2026년 4월부터 광고 열림(Instagram 분리) 했지만 아직 CPM 낮고 유기 도달 높음.

### 3.2 Threads 포스트 유형 (T01~T05)

| ID | 유형 | 톤 | 빈도 |
|----|------|------|------|
| T01 | 메이커 일지 (Behind-the-build) | 평어체, 솔직, 밤 포스트 | 주 2–3개 |
| T02 | 다이버 공감 질문 | "다이빙 다녀와서 뭘 봤는지 기억나세요?" | 주 1–2개 |
| T03 | 오늘의 다이빙 스냅 | "오늘은 **말라파스쿠아** 어때요?" + today.mola.app 링크 | 주 2개 |
| T04 | 밈·관찰 | 짧고 재치. 바다·다이빙·앱 개발 crossover | 비정기 |
| T05 | 유저 피드백 공유 | "오늘 이런 반응 받았어요" + 스샷 | 반응 나올 때 |

### 3.3 Threads 자동화 단계

| 단계 | 작업 | Claude 혼자 가능? | 사용 도구 | 사람 개입 |
|------|------|------------------|----------|----------|
| 1 | 글 draft 작성 (T01~T05) | ✓ | Claude 본체 | 톤 승인 |
| 2 | 첨부 이미지 생성 | ✓ | Higgsfield `generate_image` | 선택 |
| 3 | Threads 발행 (단일 포스트) | ✗ (직접 불가) | Threads API via Blotato/PostLink | **네 승인 또는 자동** |
| 4 | Thread 체인 (대댓글) 발행 | ✗ (단일 포스트 wrapper로만) | 서드파티 wrapper | 수동 체인 추천 |

### 3.4 Mola에 실질적인 Threads 운영 방식 (3안)

**안 1 — "글만 Claude, 포스팅은 내가"** ← **1차 추천**
- Claude가 매일 저녁 T01~T05 중 1~2개 draft를 Notion 큐에 쌓음
- 네가 밤에 Threads 앱 열어서 복붙·수정·발행 (5분 이하)
- **장점**: 톤 100% 네 손 거침. 비용 0원. API 가입 불필요.
- **단점**: 매일 수동 작업.

**안 2 — Buffer/PostLink로 네가 승인 후 자동 발행**
- Claude가 draft 생성 → Buffer/PostLink 큐에 올림 → 네가 모바일 앱에서 승인 → 자동 발행
- **장점**: 밤에 안 켜도 발행됨. 톤 검수는 아침에 모아서.
- **단점**: Buffer $15/월, PostLink $15/월.

**안 3 — 풀 오토 (산사식 1인칭 메이커 계정에는 비추)**
- Claude가 draft → 서드파티 API → 자동 발행 (검토 X)
- **장점**: 손 안 대도 매일 올라감.
- **단점**: 메이커 서사 톤이 AI 티 남. 네가 아니라 봇이 쓰는 걸로 보임. 산사·석가머니 바이럴 공식(1인칭 솔직한 톤)이 깨짐.

### 3.5 Threads 대댓글 체인 (multi-post thread)

Meta 공식 Threads Content Publishing API는 **단일 포스트 발행만 지원**, 대댓글 체인은 publishing endpoint로 못 만든다. 서드파티(Publora 등)가 wrapper로 지원하지만 비용 추가.

Mola 운영 방식: **대댓글 체인은 네가 Threads 앱에서 직접 쓰기** 추천. 이게 오히려 유기 도달·공감 유도에 유리 (산사 메이커의 "서버 터졌어요" 라이브 업데이트처럼 실시간 느낌).

---

## 4. 자동화 종합 매트릭스

이 한 표가 "Claude가 어디까지 하고 네가 어디부터 해야 하는지"의 정답지.

| 작업 | Claude(이 세션) | 외부 AI 도구 | 네가 반드시 | 비용/월 |
|------|---------------|-------------|------------|--------|
| 피드 포스트 카피 | ✓ | — | 승인 | 0 |
| 피드 포스트 이미지 (M01~M03) | ✓ `Higgsfield.generate_image` | — | 선택 | Higgsfield 구독 |
| 수조 ASMR 릴스 (M05) | ✓ `Higgsfield.generate_video` | — | 업로드 | 상동 |
| 앱 UI 시연 릴스 (M06) | 자막·커버만 ✓ | Submagic (자막) | 화면 녹화·업로드 | $12 |
| Dive Story 릴스 (M04) | 스크립트만 ✓ | Submagic·OpusClip | 영상 촬영·편집·업로드 | $12 |
| Behind-the-build 릴스 (M07) | 스크립트만 ✓ | CapCut (셀피 편집) | 셀피 녹화·업로드 | 0 |
| 밈 포스트 (M08) | ✓ | — | 발행 | 0 |
| UGC 리포스트 (M09) | 검수·캡션만 | — | DM·리그램 | 0 |
| IG 피드·릴스 발행 | ✗ | Meta Business Suite(수동) 또는 Blotato(자동) | 결정 | 0~$20 |
| Threads 글 draft | ✓ | — | 발행 | 0 |
| Threads 발행 | ✗ | Threads 앱(수동) 또는 PostLink(자동) | 결정 | 0~$15 |
| Threads 대댓글 체인 | ✗ | — | 네가 직접 | 0 |
| Meta Ads 캠페인 집행 | ✓ `Higgsfield.meta_ads_*` | — | 승인·결제 | 광고비 별도 |
| 성과 리포트 | ✓ (스케줄러 API 연결 시) | — | 읽기 | 0 |

### 4.1 Mola 베타 모집 단계 최종 권장 조합

- **IG 피드/릴스**: **Meta Business Suite 수동 발행** (레벨 B). Claude가 소재+카피 전부 생성 → 네가 금요일 저녁 2시간 블록으로 다음 주 치 배치 업로드.
- **Threads**: **Claude draft → 네 수동 발행** (안 1). 매일 저녁 5분, 밤 새벽 포스팅 시간대에 네가 직접.
- **광고**: **Higgsfield `meta_ads_*` MCP로 Claude 자동 집행** (단, 네 결제·예산 승인 후).

이 조합의 월 비용: **Higgsfield 구독 + Submagic $12 = 약 $30~50/월** (광고비 별도). 서드파티 스케줄러 가입은 월 포스트 20개 돌파 시점에 재검토.

---

## 5. 운영 체크리스트

### 5.1 계정 세팅 (한 번만)

- [ ] [@molamola_log] 를 Instagram Business 계정으로 전환
- [ ] 연결용 Facebook Page 생성 (비공개 가능)
- [ ] Meta Business Suite에 계정 등록
- [ ] Threads 프로필 바이오 확정 (`Mola | 다이버의 로그북 앱` + today.mola.app 링크)
- [ ] 프로필 이미지 A안(흰 바탕·파란 몰라·검은 Mola) 적용 — `~/Ocean Diary/brand/instagram/mola_profile_A_stacked.png`

### 5.2 콘텐츠 운영 리듬 (주간)

- **월** 저녁: Threads T01 메이커 일지 1개, IG Stories 1개 (오늘 뭐 작업했는지)
- **화** 저녁: Threads T03 오늘의 다이빙 + today.mola.app 링크
- **수** 저녁: 피드 M01 Species Card 캐러셀
- **목** 저녁: 피드 M02 오늘의 다이빙 or M03 그림일기 미리보기 + Threads T02 공감 질문
- **금** 저녁: 릴스 M04 Dive Story (주요 발행일)
- **토** 저녁: 릴스 M05 수조 ASMR 또는 M06 앱 시연
- **일** 저녁: 피드 M09 유저 UGC 리포스트 or M08 밈 + Threads T05 피드백 공유

### 5.3 금요일 2시간 배치 제작 템플릿

1. (00:00–00:15) 다음 주 캘린더 확정 — 7슬롯 중 M ID 배정
2. (00:15–00:45) Claude에 "다음 주 7개 포스트 카피 작성" 요청
3. (00:45–01:15) Higgsfield로 이미지·영상 소재 배치 생성
4. (01:15–01:45) 네가 Submagic·CapCut에서 자막·컷 다듬기
5. (01:45–02:00) Meta Business Suite에 예약

---

## 6. 다음 문서

- `docs/marketing-plan-v2.md`: 출시 후 커뮤니티·UGC 수확·인플루언서 리테이너 (Cal AI 모델) 플랜
- `docs/content-calendar-template.md`: Notion DB 스키마 정의
- `docs/brand-voice.md`: Mola 1인칭 톤·금칙어·해시태그 사전
