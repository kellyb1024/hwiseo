# 휘서 홍보영상 배경음악 — 생성 프롬프트 (2026-09-10)

대상 영상: `promo-video/out/hwiseo-full-flat-0907.mp4` · **150.8초 (2:30.8)** · 30fps · 4516프레임
음악 모델용 프롬프트는 **영어**로 씀 — 악기·음색·프로덕션 디스크립터를 영어로 줘야 알아듣는다.

## 타임라인 (컷 데이터 실측, `promo-video/src/cuts.ts`)

| 시각 | 프레임 | 사건 | 음악이 해야 할 일 |
| :-- | :-- | :-- | :-- |
| 0:00 | 0 | P1 시작 · 필름 스물네 장 | 거의 무음. 단음 하나 |
| 0:15.4 | 461 | 사진이 흔해짐 | 층이 조금씩 쌓임(과잉의 암시), 커지진 않음 |
| 0:28.7 | 861 | P2 · 데이터의 바다 | 온기 빠짐. 낮은 드론 + 미세한 디지털 결 |
| 0:55.7 | 1671 | 가장 어두운 지점 | 거의 정적. 드론만 |
| 1:01.8 | 1853 | P3 · 질문 | 조심스러운 한 음 |
| **1:14.5** | **2234** | **★ 촛불 켜짐 (빛날 輝)** | **최대 전환. 따뜻한 음색 첫 등장, 여기서 해소** |
| 1:31.3 | 2739 | 멈춘 세상이 다시 움직임 | 조용한 맥박(부드러운 아르페지오) 시작 |
| 1:40.4 | 3011 | P4 · 폭포를 멈춰 세움 | 밀도 낮추고 사색적으로 |
| 2:02.2 | 3665 | P5 · 마지막 상승 시작 | 서서히 모임 |
| **2:14.3** | **4029** | **輝 — 화면이 밝아짐** | **절정 한 번. 크지 않게, 따뜻하게** |
| 2:25.5 | 4366 | 내레이션 끝 · 로고만 5초 | **음악이 혼자 남는 유일한 구간.** 여운 → 2:30.5 소멸 |

## 반드시 지킬 것

- **내레이션이 0:00~2:25.5 내내 깔린다.** 언더스코어여야 하고, 300Hz–3.5kHz를 비워야 한다.
- 보컬·가사·보컬 찹 없음.
- 이 프로젝트는 "빠른 것이 가치를 놓친다"를 말한다. **음악이 서두르면 자기모순이다.** 여백을 두려워하지 말 것.
- 금지: corporate uplifting tech, 트레일러 브람, EDM 빌드·드롭, 4/4 마케팅 비트, 뻔한 inspirational piano.

---

## A. 통짜 한 곡 (권장 — 이어붙일 필요 없음)

```
Compose a 150-second instrumental underscore for a quiet documentary-style short film about
photographs, memory, and slowing down. Warm, unhurried, intimate. 62-68 BPM, 3/4 feel, A minor
resolving to C major.

Instruments: felt piano recorded close (keep the pedal and key noise), low bowed string pad,
glockenspiel / celesta for small points of light, soft nylon-string harmonics, faint analog tape
hiss and room tone. No drum kit, no synth lead, no orchestral hits, no percussion loops.

Structure, follow these timings exactly:
0:00-0:15  near silence. one felt piano note at a time, long gaps between them. nostalgic, fragile.
0:15-0:28  layers accumulate slightly — more notes, closer together — suggesting excess, not energy.
           Do not get louder.
0:28-0:56  warmth drains out. a low drone takes over, minor, cold. sparse digital artifacts, like a
           file loading. piano recedes.
0:56-1:02  almost nothing. drone alone. the darkest point of the piece.
1:02-1:14  a single hesitant note returns, questioning. space around it.
1:14       ** the turn ** a candle is lit. warm timbres enter for the first time — felt piano and
           glockenspiel together, harmony resolves to major. Gentle, not triumphant.
1:14-1:31  the warmth settles and holds.
1:31-1:40  a quiet pulse begins: soft arpeggio, like something frozen starting to move again.
1:40-2:02  reduce density. reflective, patient, still moving.
2:02-2:14  slowly gather.
2:14       ** the peak ** one warm swell. Restrained — this is intimate, not cinematic.
2:14-2:25  release, settle.
2:25-2:30  narration has ended and only the logo is on screen. The music is alone here. Let it ring
           out and resolve, fading to silence exactly at 2:30.

Mix as an underscore under continuous narration: leave 300Hz-3.5kHz open, keep dynamics gentle,
no loud transients. Instrumental only, no vocals, no lyrics, no vocal chops.
Avoid: corporate uplifting tech music, trailer braams, EDM builds and drops, four-on-the-floor,
generic inspirational piano.
Deliver 48kHz stereo, exactly 150 seconds.
```

## B. 파트별로 따로 뽑을 때 (모델이 150초를 못 버티면)

각 클립을 **표시된 길이 + 앞뒤 2초씩** 여유 있게 뽑고, 이어붙일 때 2초 크로스페이드. 다섯 개 모두
같은 문장으로 시작할 것 — 음색이 갈리면 이어붙였을 때 티가 난다.

> 공통 머리말: `Instrumental underscore, felt piano close-miked with pedal noise, low bowed string pad, glockenspiel, faint tape hiss. 62-68 BPM, 3/4, A minor. No drums, no vocals, no synth lead. Leave 300Hz-3.5kHz open for narration. Gentle dynamics.`

| 클립 | 길이 | 뒤에 붙일 말 |
| :-- | :-- | :-- |
| P1 | 29s | `Near silence at first — one note at a time with long gaps, nostalgic and fragile. Over the second half, notes accumulate slightly, suggesting excess. Never gets louder.` |
| P2 | 33s | `Warmth drains out. A low minor drone takes over, cold, with sparse digital artifacts. Piano recedes. Ends almost silent — drone alone.` |
| P3 | 39s | `Begins with one hesitant questioning note in wide space. At 13 seconds in, the turn: warm felt piano and glockenspiel enter together and the harmony resolves to major — gentle, not triumphant. Last 8 seconds, a soft arpeggio pulse begins.` |
| P4 | 22s | `Reduced density, reflective and patient, the soft pulse still moving underneath.` |
| P5 | 29s | `Slowly gathers. At 12 seconds in, one restrained warm swell — intimate, not cinematic — then release. The final 5 seconds are alone with no narration: let it ring out and resolve into silence.` |

## C. 믹스 (음악 받은 뒤)

- 내레이션 대비 음악 **-18 ~ -22 LUFS** 정도로 깔고, VO 구간에서 3~4dB 덕킹.
- 마지막 5초(2:25.5~)는 덕킹 풀고 음악만 남기기 — 여기가 유일하게 음악이 주인공인 구간.
- `ffmpeg`로 합칠 때 영상 길이 150.805s에 맞춰 음악 끝을 자르지 말고 **음악이 먼저 끝나게** 할 것.
