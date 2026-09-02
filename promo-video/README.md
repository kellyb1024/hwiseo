# 휘서 컨셉 영상 — Remotion

타임라인 기준: `../promo-timeline-v11.1.md` (2:24, 24컷). 컷 데이터는 `src/cuts.ts`.

## 컷별 확인 (Studio)

```bash
npm start
```

왼쪽 사이드바에서 고른다:

| ID | 내용 |
| :-- | :-- |
| `Full` | 전체 2:24 |
| `P1`~`P5` | 파트 단위 |
| `C01`~`C24` | **컷 하나만.** 반복 재생해서 모션 확인 |

컷 하나를 열면 그 컷의 VO와 자막이 같이 붙어 있어서, 타이밍이 대사와 맞는지 바로 보인다.

## 렌더

Remotion이 브라우저를 자동으로 못 받는 환경이라 로컬 헤드리스 셸을 지정한다:

```bash
BR=~/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell

# 전체
npx remotion render src/index.ts Full out/hwiseo-full.mp4 --codec h264 --crf 18 --overwrite --browser-executable=$BR

# 컷 하나
npx remotion render src/index.ts C15 out/C15.mp4 --browser-executable=$BR

# 정지 프레임 하나
npx remotion still src/index.ts C15 out/C15_f150.png --frame=150 --browser-executable=$BR
```

## 구조

```
src/
  cuts.ts            컷 데이터 (VO 실측 프레임 + 정적)
  theme.ts           색·서체·이징 — 여기만 고치면 전체에 반영
  components/
    Stage.tsx        모든 컷의 무대: 배경 → 종이 결 → 장면 → 자막 → 비네트. VO 재생 포함
    Chalk.tsx        분필 질감·글로우·종이 SVG 필터
    Draw.tsx         획이 그어지는 <path> + 결정적 난수
  scenes/
    P1.tsx  C01–C05  필름 프레임, 탁자·말풍선, 픽셀 밭
    P2.tsx  C06–C11  가라앉음, 라벨 UI, 아지랑이, 실타래
    P3.tsx  C12–C16  촛불, 輝, 융합, 숨쉬는 인물
    P4.tsx  C17–C20  敍, 꼬마와 어른, 부모의 시선, 맥박
    P5.tsx  C21–C24  불씨, 파동, 빛, 타이틀
```

## 색 규칙 (디자인 시스템 v0)

- 흰 선 `#EFEAF2` on 어둠 `#100D16`
- **輝 · 촛불 · 라벨** = 연보라 `#B3A5DC` (기계의 빛)
- **敍 · 아지랑이 · 불씨 · 시선** = 앰버 `#E9A24A` (사람의 등불)

## 지금 상태의 메모

- VO는 임시(macOS TTS). 최종 더빙 받으면 `public/vo/` 교체 → `src/cuts.ts`의 `voFrames`/`duration` 재측정
- 글로우 포함 상태. 어색하면 `theme.ts`나 각 `Stage glow={}` 값으로 조절
- 좌하단 실 뭉치(C17·C23·C24)는 브리프 9장 ★"전부 풀지 말 것" 반영. 빼려면 해당 `<g transform="translate(-78 410)…">` 삭제
- 한글 서체는 시스템(Apple SD Gothic Neo) 폴백 중. Pretendard 넣으려면 `public/fonts/` + `@font-face`
