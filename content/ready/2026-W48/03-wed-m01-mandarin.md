# 11/25 (수) · 피드 M01 Species Card 캐러셀

## 발행 시간
저녁 7–8시 (피드는 저녁 초반이 유리)

## 종
**만다린피쉬 (Mandarinfish · Synchiropus splendidus)**
- Mola 32종 중 색감 가장 강렬 → 커버 임팩트 최적
- 야행성 짝짓기 의식으로 유명 → 사실 콘텐츠 풍부

## 포맷
- 캐러셀 5장
- 1080×1350 세로 (피드 길이 최대 활용)

## 캡션 (복붙용)

```
해가 지면 색이 켜지는 물고기, 만다린피쉬.

낮에는 산호 틈에 숨어있다가
해 질 무렵 짝을 찾아 수면으로 올라와요.
그 10분이 전 세계 수중 사진가들이 기다리는 시간이에요.

Mola 도감에 담겨있는 32마리 중 가장 화려한 친구예요.
출시되면 네 도감에도 하나씩 쌓을 수 있어요.

👉 today.mola.app (수채 카드 미리보기)

#다이빙 #만다린피쉬 #해양생물 #mola #다이빙로그
```

## 슬라이드별 콘텐츠

### Slide 1 (커버)
- **비주얼**: 만다린피쉬 수채 Critter (`apps/mobile/assets/illustrations/species/mandarin.webp`) 중앙 크게
- **텍스트 오버레이**:
  - 상단 라벨 (Pretendard Label, 자간 0.28em): `TODAY'S SPECIES`
  - 하단 제목 (Pretendard Black, 42pt): `만다린피쉬`
  - 그 아래 (Fraunces italic, 20pt): `Synchiropus splendidus`
- **배경**: `colors.mist` (#F4F8FC)

### Slide 2
- **제목**: `해 질 무렵 10분`
- **본문**:
  ```
  낮에는 산호 틈에 숨어 있다가
  일몰 전후 10분 사이에만
  수면으로 올라와 짝을 찾아요.

  이 '만다린 러시'를 찍으려고
  다이버들은 포인트 앞에서
  2시간씩 기다려요.
  ```

### Slide 3
- **제목**: `색이 진짜 '이빨 색소'예요`
- **본문**:
  ```
  대부분 물고기의 색은
  반사 구조에서 나오지만

  만다린피쉬의 파란색·주황색은
  진짜 색소 세포에서 나오는
  '진짜 색'이에요.

  척추동물 전체에서
  파란 색소가 있는 건
  이 녀석과 블루 앤젤피쉬뿐이에요.
  ```

### Slide 4
- **제목**: `어디서 만날 수 있어요`
- **본문**:
  ```
  🇵🇭 필리핀 아닐라오
  🇵🇭 세부·보홀
  🇮🇩 레이테·암본
  🇯🇵 오키나와 케라마

  모두 Mola 지도에 있는 지역이에요.
  ```

### Slide 5 (CTA)
- **비주얼**: Mola 로고 + 만다린피쉬 작게
- **텍스트**:
  ```
  Mola 도감에 담긴 32마리
  매주 한 마리씩 소개할게요.

  → @molamola_log 팔로우
  → today.mola.app (앱 미리보기)
  ```

## Higgsfield 호출 계획
- 슬라이드 1, 3, 5는 생성 이미지 필요 (3회 `generate_image`)
- 슬라이드 2, 4는 텍스트 중심이라 Mola 디자인 시스템으로 자체 레이아웃 (Canva/Figma 수동 or Higgsfield 호출 추가)

프롬프트 (Slide 1 커버용):
```
Watercolor illustration of a mandarinfish, vibrant orange and electric blue
patterns, swimming among soft coral silhouettes, Mola Korean pastel brand
style, pale mist background #F4F8FC, no text, 1080x1350 portrait, hand-painted feel
```
