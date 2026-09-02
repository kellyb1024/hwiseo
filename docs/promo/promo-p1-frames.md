# P1 제작 시트 v3 — 단순화 (2026-08-26)

> **스타일 한 줄**: 크림 종이 위 연필 선 + 파스텔 색 2~3개 부분 채색. 한 컷에 요소 2~3개, 나머지는 빈 종이.
> 초기 분필 버전만큼 단순하게. 해칭·배경·가구 없음. 정면 얼굴 없음. 글자 없음.
> 색은 한 컷에 한두 요소만 (필름통·사진·봉투). 다섯 감각색 전부는 P5까지 아낌.
> 드로잉 효과는 코드가 함 (`PencilImage`, 검증 완료 `out/drawtest/`). 움직이는 것만 레이어로 따로.

## 규격
2560×1440 (최소 1280×720) · 크림/흰 배경 그대로 · 하단 15% 비움 · `promo-video/public/img/P1/`, 팩은 `img/pack/`

## ★ 사진 팩 — 6장 이상, 많을수록 좋음
흰 테두리는 코드가 붙임. 안은 크레파스 풀컬러 (기억). 각각 별도 이미지, 붙여넣기로 줘도 됨.
**관통 사진 하나로 묶지 않음** — 연속 두 컷만 같으면 됨:
① 생일 → C08–C09 (받음 ✓) ② 놀이동산 → C18–C19 ③ 학예회 → C16 ④~ 바닷가·자전거·눈사람·식탁·소풍… 자유
C02c 탁자·C03 쏟아짐·C04 격자·C05 소용돌이는 팩 전부를 섞어 씀. 다양할수록 "수백 장" 느낌.

## 컷

| 컷 | 시간 | 화면 (요소 2~3개) | 코드가 하는 것 | 소스 |
| :-- | :-- | :-- | :-- | :-- |
| **C01** | 3.9s | 손 하나가 필름통(주황)을 카메라에 넣는다. 왼쪽 55%. | draw-on → 리더에서 필름 띠가 오른쪽으로 풀리며 24프레임 그어짐 → 푸시인 | `C01.png` |
| **C02a** | ~1.7s | 카메라 뒤에 눈을 댄 옆얼굴 + 셔터 위 손가락. 오른쪽 60%. | draw-on → 정지 → 손가락 1px + 프레임 2f 흔들림 | `C02a.png` |
| **C02b** | ~2s | 벽시계(바늘 없음) + 봉투(연두)를 건네는 손. | 바늘 두 바퀴 → 봉투 미끄러져 들어옴 | `C02b.png` 시계+받는 손 / `C02b-envelope.png` |
| **C02c** | ~2.9s | 위에서 본 둥근 탁자 + 손 넷. 사진 없음. | 팩 사진 5장이 한 장씩 놓임(색 첫 등장) → 한 장 들어 올림 → 말풍선 | `C02c.png` |
| **C03** | 5.4s | 왼쪽 작은 앨범 / 오른쪽 폰 든 손(화면 비움). 배경 없음. | 폰에서 팩 사진이 쏟아져 격자로 증식 → 살짝 팬 | `C03-album.png` / `C03-phone.png` |
| **C04** | 6.4s | (이미지 없음) 격자 + 손 | 격자가 서로 다른 팩 사진 수백 장으로 채워짐 → 진동 → 코드 손이 한 장 집어도 그중 하나일 뿐 | 없음 (팩만) |
| **C05** | 6.3s+정적 | 소용돌이 벽 + 구멍. 사진 없음, 벽에 빈 칸만. | 팩 사진이 나선으로 빨려듦, 채도↓ → 구멍으로 푸시인 → 종이 어두워짐 → P2 | `C05-vortex.png` |

소스 합계: **이미지 8장 + 팩 6장.** C04는 코드만.

## Gemini 프롬프트

공통 (매번 앞에):
```
Simple pencil line drawing on cream paper, like a whiteboard explainer. Clean thin outlines, very few strokes,
no hatching, no shading, no background. Flat oil-pastel color on only one or two elements, everything else is line.
One single frame, 16:9, no text, no border, no vignette. Bottom 15% empty.
```
컷 뒤에 붙임:
- C01: `A hand loading a small orange film canister into a film camera, close-up, placed in the left 55% of the frame; right side empty. The film leader sticks out to the right. Color only on the canister.`
- C02a: `Profile of a person's face pressed to the back of a film camera, one finger resting on the shutter button, in the right 60%; left side empty. No color.`
- C02b: `A round wall clock with no hands, and below it an open hand receiving a light-green paper envelope. Color only on the envelope.` → 이어서 `Same image, remove the envelope and the giving hand; keep the clock and the receiving hand.`
- C02c: `A round table seen from directly above, four hands reaching in from the four edges, table empty. No color.`
- C03: `A closed old photo album, alone, small, no color.` / `Two hands holding a smartphone upright, screen blank, seen from behind the shoulder, no background, no color.`
- C05: `A spiral pit seen from above, its walls made of empty small rectangular tiles, a dark hole at the center. No photographs, no color.`
- 팩: `A small printed snapshot with a white border, isolated on plain white, 4:3. Inside, drawn with the same pencil lines and colored with oil pastel: [장면]. People from the side or back, dot faces.`

스타일 레퍼런스는 첫 결과물 1장을 고정해서 매번 첨부 ("same style as attached").
