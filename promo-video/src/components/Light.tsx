import React from 'react';
import {interpolate} from 'remotion';
import {theme} from '../theme';

/** 광원 하나 */
export type Lamp = {x: number; y: number; r: number; color: string; a: number};

/**
 * 빛 레이어 — 칠판은 항상 어둡고, 광원들이 닿는 자리만 물든다.
 * 전체 프레임(g)의 함수라서 컷 경계에서 끊기지 않는다.
 */
export const lampsAt = (g: number): Lamp[] => {
  const F = (a: number, b: number, v0: number, v1: number, e = theme.ease.soft) =>
    interpolate(g, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

  // 타임라인 (cuts.ts start 기준, 30fps)
  const C10 = 1602, C11 = 1818, C13 = 2187, C15 = 2607, C16 = 2778, C17 = 3024, C18 = 3264, C19 = 3429;

  return [
    // 기계의 차가운 스크린광 — 위에서 내려오는 푸른빛. 라벨이 튕겨 나가며(C10) 꺼진다
    {x: 640, y: -120, r: 900, color: '#6E86B8', a: F(0, 1, 0, 0) + F(C10 - 400, C10 - 380, 0.55, 0.55) * F(C10 + 40, C10 + 110, 1, 0)},

    // 촛불 — 연보라. C13에서 내려오며 켜지고, 실타래에 닿으면(C15) 커진다
    {x: 640, y: F(C13 + 20, C13 + 180, 90, 500), r: F(C13, C15, 160, 420),
     color: theme.color.hwi, a: F(C13, C13 + 60, 0, 0.5) * F(C17, C17 + 80, 1, 0.35)},

    // 실타래에 닿아 번지는 온기 — 앰버. C15 후반부터
    {x: 640, y: 520, r: F(C15 + 90, C18, 120, 640),
     color: theme.color.seo, a: F(C15 + 90, C15 + 150, 0, 0.42)},

    // 인물이 숨쉬기 시작(C16)할 때 프레임 안이 따뜻해짐
    {x: 640, y: 360, r: 520, color: '#D9A066', a: F(C16 + 100, C16 + 200, 0, 0.3) * F(C17, C17 + 60, 1, 0.6)},

    // 부모의 시선 — 위에서 내려오는 금빛 (C19)
    {x: 640, y: 40, r: 760, color: '#F0B860', a: F(C19 + 20, C19 + 120, 0, 0.5)},
  ];
};

/** 세기 — 배경을 물들이는 게 아니라 광원 주변만 살짝. 읽기를 해치면 더 내린다 */
const GAIN = 0.32;
const SHRINK = 0.55;

export const LightLayer: React.FC<{lamps: Lamp[]; id?: string}> = ({lamps: raw, id = 'L'}) => {
  const lamps = raw.map((l) => ({...l, a: l.a * GAIN, r: l.r * SHRINK}));
  return (
  <g style={{mixBlendMode: 'screen'}}>
    <defs>
      {lamps.map((l, i) => (
        <radialGradient key={i} id={`${id}${i}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={l.color} stopOpacity={l.a} />
          <stop offset="55%" stopColor={l.color} stopOpacity={l.a * 0.35} />
          <stop offset="100%" stopColor={l.color} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    {lamps.map((l, i) => l.a > 0.001 && (
      <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={`url(#${id}${i})`} />
    ))}
  </g>
  );
};

/** 분필 선이 빛을 살짝 머금는다 — 가장 센 광원 색으로 아주 조금 */
export const chalkTint = (lamps: Lamp[]) => {
  const top = lamps.reduce((m, l) => (l.a > m.a ? l : m), {a: 0, color: theme.color.chalk} as Lamp);
  const k = Math.min(0.35, top.a * 0.6);
  return mix(theme.color.chalk, top.color, k);
};

const mix = (a: string, b: string, t: number) => {
  const pa = hex(a), pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
