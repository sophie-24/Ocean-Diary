# 수조 배경 영상 안내

Higgsfield(또는 비슷한 영상 생성 도구)로 만든 짧은 반복 영상을 이 폴더에 넣으면, 산호초·대양·마크로 수조 배경이 지금의 SVG 그림 대신 영상으로 바뀌어요. 그 위에 지금 쓰는 일러스트 물고기가 그대로 헤엄쳐요. 파일이 없으면 자동으로 지금의 SVG 배경이 쓰여요.

## 파일 자리

| 수조 | 시간대 | 파일 |
| --- | --- | --- |
| 산호초 | 새벽 | `reef/dawn.mp4` |
| 산호초 | 낮 | `reef/day.mp4` |
| 산호초 | 해 질 녘 | `reef/dusk.mp4` |
| 산호초 | 밤 | `reef/night.mp4` |
| 대양 | 낮 | `ocean/day.mp4` |
| 대양 | 밤 | `ocean/night.mp4` |
| 마크로 | 낮 | `macro/day.mp4` |

- 한 시간대만 먼저 넣어도 돼요. 새벽·해 질 녘이 없으면 '낮' 영상이 대신 쓰여요.
- 파일을 추가한 뒤 `src/features/sea/sceneVideos.ts`에서 해당 줄의 `//`를 지워 주세요.
- 대양 수조의 영상은 장소 수조(말라파스쿠아 등)에도 함께 쓰여요.

## 영상 규격 (모든 파일 공통)

- **비율·크기:** 9:16 세로, 1080×1920 권장
- **길이:** 5~8초, 반복이 자연스럽게 되도록 **첫 프레임과 마지막 프레임이 같은 그림**이어야 해요
- **편집:** 컷 전환 없이, 아주 느린 카메라/물결 움직임만
- **가운데 70%는 비워 두세요** — 그 자리에 앱의 일러스트 물고기가 헤엄쳐요
- **생물은 그리지 마세요** — 물고기가 겹쳐 보여요
- **글자 금지**
- **포맷:** H.264 mp4, 대략 2~5MB

## 수조별 Higgsfield 프롬프트 예시

필요하면 그대로 복사해서 쓰시고, 분위기를 바꾸고 싶으면 고치세요.

### 산호초 수조 (reef)

- **낮 (`reef/day.mp4`)**
  > Shallow tropical coral reef seen from a diver's perspective, bright turquoise water, soft caustic sunlight rippling on the sandy floor, pink and purple soft corals swaying gently at the bottom edges, small bubbles rising slowly, no fish, center of the frame empty, seamless loop, cinematic, 9:16 vertical, slow underwater motion.
- **새벽 (`reef/dawn.mp4`)**
  > Same shallow coral reef at dawn, dim blue-violet light, soft orange glow near the surface, almost no caustics, slow swaying corals, calm, no fish, center of the frame empty, seamless loop, 9:16 vertical.
- **해 질 녘 (`reef/dusk.mp4`)**
  > Same coral reef at sunset, warm orange and magenta light from above, long soft light rays, corals in silhouette, calm current, no fish, center of the frame empty, seamless loop, 9:16 vertical.
- **밤 (`reef/night.mp4`)**
  > Same coral reef at night, deep navy water, faint moonlight from the surface, bioluminescent plankton sparks drifting slowly, corals mostly in shadow, no fish, center of the frame empty, seamless loop, 9:16 vertical.

### 대양 수조 (ocean)

- **낮 (`ocean/day.mp4`)**
  > Deep open ocean, blue water, long volumetric god rays descending from the surface, very fine plankton floating by, slight current, empty sandy floor far below, no fish, center of the frame empty, seamless loop, cinematic, 9:16 vertical.
- **밤 (`ocean/night.mp4`)**
  > Deep open ocean at night, very dark blue-black water, a single soft moonlight shaft from above, faint bioluminescent particles drifting slowly, no fish, center of the frame empty, seamless loop, 9:16 vertical.

### 마크로 수조 (macro)

- **낮 (`macro/day.mp4`)**
  > Close-up view of a coral and sponge garden, soft torchlight from the diver side, warm orange sponges, feathery hydroids, slow swaying detail, shallow depth of field with the background out of focus, no fish, center of the frame empty, seamless loop, 9:16 vertical.

## 반복이 자연스럽지 않을 때

영상 끝이 처음과 매끄럽게 이어지지 않으면 저한테 원본 mp4를 주세요. 끝부분을 처음에 겹쳐 반복 끊김이 없게 다듬어 돌려드려요(바다 소리 음원을 다듬은 방식과 같아요).
