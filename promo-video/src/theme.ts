import {Easing} from 'remotion';

/** 휘서 디자인 시스템 v0 (2026-08-25) — 어둠 위에 두 개의 빛 */
export const theme = {
  color: {
    bg:       '#100D16', // 보라 기운이 도는 어둠
    cream:    '#F3EEE4', // P1 크림 종이
    pencil:   '#7A7268', // 연필 선 (코드가 그리는 것) — C01 이미지 선색에 맞춤
    chalk:    '#EFEAF2', // 흰 색연필 선
    chalkDim: 'rgba(239,234,242,0.42)',
    hwi:      '#B3A5DC', // 輝 — 휘서의 빛 (기계·질문)
    hwiCore:  '#DDD4F2',
    seo:      '#E9A24A', // 敍 — 사람의 등불 (기억·이야기)
    seoCore:  '#FFDCA8',
  },
  font: {
    serif: "'Noto Serif KR', 'Apple SD Gothic Neo', 'Hiragino Mincho ProN', serif",
    sans:  "'Pretendard', sans-serif", // public/fonts 에 번들 — 환경 무관하게 동일
    mono:  "ui-monospace, 'SF Mono', Menlo, monospace",
  },
  boilEvery: 3,
  ease: {
    draw:  Easing.bezier(0.33, 0.0, 0.15, 1.0),
    soft:  Easing.bezier(0.4, 0.0, 0.2, 1.0),
    out:   Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in:    Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: {damping: 14, stiffness: 160, mass: 0.6},
    smooth: {damping: 20, stiffness: 90,  mass: 1},
    stiff:  {damping: 30, stiffness: 400, mass: 0.5}, // 라벨이 딱딱하게 꽂힘
  },
} as const;
