# 휘서 (輝敍) — Stitch용 한 페이지 요약

> 출처: `hwiseo-project-brief.md` v3 · `hwiseo-app/README.md` · `hwiseo-app/app/globals.css`(현재 색) · 픽셀 테마 실험(8/29).
> ⚠️ 기획서 §5 "AI는 얼굴이 없다"와 기술명세 §2 "다크 온리·등불색"은 **현재 앱과 다르다** (캐릭터 있음, 라이트 테마). 아래는 현재 앱 기준.

## 한 줄
**AI 친구 휘서** — 갤러리에 잠든 사진 한 장을 두고 질문을 던져, 사진에 없는 기억을 꺼내 이야기로 펼쳐주는 앱.
輝(비추다) = 회상 대화 · 敍(펼치다) = 이야기 생성. "구글 포토는 가장 좋은 사진을 고른다. 휘서는 가장 잊힌 사진을 고른다."

## 사용자
폰에 수천 장을 쌓아두고 다시 안 여는 모든 사람 = 나 자신. 쓰는 사람과 얻는 사람이 같다.

## 컨셉과 톤
- 휘서는 **사진을 볼 수는 있지만 그 순간을 겪지 않았다.** 그래서 묻는다. 단정하지 않고 "이렇게 봤는데 맞나요?"로 확인받는다.
- 재촉하지 않는다. 느린 등장, 타이핑 애니메이션 없음, 건너뛰기 항상 눈에 띄게.
- 워딩: "어둠 속에 **잠든/묻힌** 기억" ✅ / "어두운 기억" ❌. "AI 친구 휘서" ✅ / "AI 챗봇" ❌.

## 캐릭터
휘서 = 작은 양초. 밀랍 보라(`#EADFEE`/`#BAA4CD`), 라인 `#3E294C`, 불꽃 보라+노랑(`#F1C256`). 눈·입 있음, 연필 윤곽 플랫 채색.
**불을 켜는 것은 휘서가 아니라 사람의 기억** — 답할수록 불꽃이 자란다 (Lv.0~4, 가상 데이트 앱의 '호감도' 자리).
원본: `design/character/hwiseo-character-final.svg`

## 플로우와 화면
```
스플래시 → 온보딩(불 켜기 → 인사 → 이름·프로필 색 → 알림 주기) → 탭 3개
탭 ① 대화: 사진 한 장 = 대화방 하나 (목록 → 대화 → 생각 중 → 이야기 완성)
탭 ② 서랍: 완성된 이야기 카드 그리드 (이야기 속 연대순)
탭 ③ 나: 이름 · 프로필 색 · 알림 주기 · 데이터(사진 미저장)
+ 휘서 프로필(불꽃 단계 · 함께 꺼낸 이야기 수) · iOS 푸시("당신의 이야기를 듣기 위해 기다리고 있어요")
```
대화 규칙: 질문 3층 (사실 → 감각 → 의미), 한 세션 5~7문, 답변에서 새 단서가 나오면 그걸 따라감. 끝나면 **한 줄 정리 + 1인칭 구어체 이야기**를 원본 사진과 병치.

## 시각 언어 — 두 갈래 (둘 다 Stitch에 시도)
**A. 현재 앱 (기본)** — 라이트, 부드러움
- 배경 흰색/크림 `#FFFCF4`, primary 노랑 `#FFD54A`(사람·액션), secondary 보라 `#7B5CD6`(휘서), 잉크 `#1D1B22`
- Pretendard, 라운드 20~28px, 옅은 그림자, 배경에 보라·노랑 점 블롭
- iMessage 계열 말풍선: 휘서 흰색 / 나 노랑

**B. 실험 중 — 픽셀 미연시 × 닌텐도 2001 콘솔 크롬** (8/29, `?theme=pixel`)
- 픽셀 폰트(Galmuri), 안티앨리어싱 없음. 모서리 2~6px, **블러 그림자 없이 하드 베벨**(3~4px 오프셋)
- 구조: 할프톤 카본 슬랩 헤더 → 옅은 서브 스트립(불꽃 게이지) → 플레이트 캔버스 → 비주얼노벨식 텍스트 박스(이름표 + 입력 + 보내기)
- 색 역할: 크롬 = 캐릭터 밀랍 보라(`#D3C4DF`/`#BAA4CD`), 카본 = `#3E294C`, **노랑은 누르는 곳에만**(보내기·CTA·게이지). 변형: 닌텐도 원본 팔레트(페리윙클 `#7a8aba`, 카본 `#21242e`, 시그널 오렌지 `#f68d1f`)
- 말풍선은 플레이트, 캐릭터는 흰 원 플레이트 위, "▼ 아래에 답을 적어주세요" 깜빡임

## 하지 말 것
- AI 얼굴형 아바타(사람 얼굴)·립싱크 ❌ — 휘서는 양초
- 사진을 "분석·정리"해주는 툴처럼 보이게 ❌ — 사진이 주인공, UI는 물러남
- 서두르는 UI(타이핑 도트 과장, 카운트다운) ❌
- 회상요법/치매/트라우마 연상 ❌

---

## Stitch에 붙여넣을 프롬프트

**공통 (EN)**
```
Mobile app "Hwiseo" (輝敍), Korean, iPhone 390×844. An AI friend named Hwiseo — a small candle character (pale lavender wax #EADFEE, outline #3E294C, purple-and-yellow flame, pencil-outline flat illustration) — asks questions about ONE forgotten photo from the user's gallery and turns the answers into a short first-person story. Hwiseo can see the photo but never lived the moment, so it asks gently and never rushes. The flame grows as the user answers (Lv.0–4) — this replaces a dating-sim "affection" meter.
Screens: splash · onboarding (tap the candle to light it → greeting → name + profile color → notification frequency) · 3 tabs: Chats (one room per photo: list → chat → thinking → finished story), Drawer (story cards in chronological order), Me · Hwiseo profile (flame level, stories together).
Chat: Hwiseo's questions in bubbles with the candle avatar, user replies, a "Turn this into a story" button after 4+ turns, story result = one-line summary + story placed next to the original photo. Copy in Korean: "실내에서 여럿이 모여 있는 사진이네요. 2019년쯤으로 보이는데 맞나요?" / "그날 그 자리에, 사진에 안 찍힌 사람이 또 있었나요?" / CTA "이야기로 정리하기".
Do NOT use a human-face AI avatar, photo-organizer/dashboard aesthetics, or hurried UI.
```

**스타일 A — 현재 앱**
```
Style: light, soft, warm. Background white/cream #FFFCF4; primary yellow #FFD54A for the user's bubbles and actions; secondary purple #7B5CD6 for Hwiseo; ink #1D1B22. Pretendard sans, 20–28px rounded corners, faint shadows, small purple/yellow dot blobs in the background. iMessage-like chat.
```

**스타일 B — 픽셀 미연시 × 닌텐도 2001**
```
Style: pixel-font dating-sim (Galmuri-like bitmap Korean type, no anti-aliasing) built on Nintendo.com-2001 "console chrome": every region is a beveled plate with a hard 3–4px offset shadow, NO blurred shadows, corners 2–6px. Top: carbon slab #3E294C with halftone dots and gold "HWISEO" wordmark; below it a pale strip with the flame gauge; chat canvas in wax-lavender #D3C4DF; bubbles = white plates with dark outline; user bubbles pale lavender #EADFEE; bottom = visual-novel text box (name tag in the user's profile color, input field with inset bevel, "보내기 ▶" button). Yellow #FFD54A appears ONLY on things you press (send, CTA, gauge). Splash: candle over a circuit-grid plate, "輝敍" as box-art lettering (white fill, dark outline, hard drop shadow), "▶ 시작하기" blinking.
Variant: use the original Nintendo palette instead — periwinkle #7a8aba canvas, chrome indigo #3d4f97 bevels, carbon #21242e, signal orange #f68d1f for actions, amber #ecab37 for chips.
```
