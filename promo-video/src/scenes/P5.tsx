import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Stage, Chalky} from '../components/Stage';
import {Draw} from '../components/Draw';
import {Pair} from './P4';
import {TANGLE} from './P2';
import {theme} from '../theme';
import type {Cut} from '../types';

const Arcs: React.FC<{o?: number}> = ({o = 1}) => (
  <g opacity={o}>
    {[0, 1, 2, 3].map((i) => {
      const r = 190 + i * 70;
      return <path key={i} d={`M${640 - r},${430 + i * 10} C${640 - r},${120 - i * 30} ${640 + r},${120 - i * 30} ${640 + r},${430 + i * 10}`}
        fill="none" stroke={theme.color.seo} strokeWidth={4} strokeLinecap="round" opacity={0.9 - i * 0.15} />;
    })}
  </g>
);

/* ───────── C21 · 정중앙에 불씨가 점화 ───────── */
export const C21: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const ig = interpolate(frame, [30, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.out});
  const flick = 1 + Math.sin(frame / 5) * 0.08;
  return (
    <Stage cut={cut} glow={0.3}>
      <defs>
        <radialGradient id="ember">
          <stop offset="0%" stopColor={theme.color.seoCore} stopOpacity={1} />
          <stop offset="35%" stopColor={theme.color.seo} stopOpacity={0.8} />
          <stop offset="100%" stopColor={theme.color.seo} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Chalky>
        <Draw at={-100} dur={1} w={3} d="M120,640 C400,632 880,632 1160,640" opacity={0.5} />
        <Pair approach={1} at={-100} pulse={1} />
        <Arcs />
      </Chalky>
      <circle cx={640} cy={330} r={28 * ig * flick} fill="url(#ember)" />
      <circle cx={640} cy={330} r={6 * ig} fill={theme.color.seoCore} />
    </Stage>
  );
};

/* ───────── C22 · 불씨에서 파동이 연쇄로 뻗는다 ───────── */
export const C22: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const rings = 6;
  return (
    <Stage cut={cut} glow={0.3}>
      <defs>
        <radialGradient id="ember2">
          <stop offset="0%" stopColor={theme.color.seoCore} stopOpacity={1} />
          <stop offset="35%" stopColor={theme.color.seo} stopOpacity={0.8} />
          <stop offset="100%" stopColor={theme.color.seo} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Chalky>
        <Draw at={-100} dur={1} w={3} d="M120,640 C400,632 880,632 1160,640" opacity={0.5} />
        <Pair approach={1} at={-100} pulse={1} />
        <Arcs />
      </Chalky>
      {Array.from({length: rings}).map((_, i) => {
        const t = interpolate(frame, [10 + i * 18, 10 + i * 18 + 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.out});
        return <circle key={i} cx={640} cy={330} r={20 + t * 620} fill="none" stroke={theme.color.seo}
          strokeWidth={3 - t * 2} opacity={(1 - t) * 0.8} />;
      })}
      <circle cx={640} cy={330} r={30 * (1 + Math.sin(frame / 5) * 0.08)} fill="url(#ember2)" />
      <circle cx={640} cy={330} r={6} fill={theme.color.seoCore} />
    </Stage>
  );
};

/* ───────── C23 · 파동이 화면을 덮으며 따뜻한 빛으로 ───────── */
export const C23: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const wash = interpolate(frame, [0, cut.duration], [0, 1], {extrapolateRight: 'clamp', easing: theme.ease.inOut});
  const lineO = 1 - wash * 0.75;
  return (
    <Stage cut={cut} glow={0.3 + wash * 0.3}>
      <defs>
        <radialGradient id="wash">
          <stop offset="0%" stopColor={theme.color.seoCore} stopOpacity={0.95} />
          <stop offset="60%" stopColor={theme.color.seo} stopOpacity={0.6} />
          <stop offset="100%" stopColor={theme.color.seo} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g opacity={lineO}>
        <Chalky>
          <Pair approach={1} at={-100} pulse={1} />
          <Arcs />
        </Chalky>
      </g>
      <circle cx={640} cy={330} r={60 + wash * 1100} fill="url(#wash)" />
      {/* ★ 끝까지 풀리지 않는 실 뭉치 — 어둠 구석에 남긴다 */}
      <g transform="translate(-78 410) scale(0.34)" opacity={0.5 * (1 - wash * 0.4)}>
        <path d={TANGLE} fill="none" stroke={theme.color.chalk} strokeWidth={5} strokeLinecap="round" />
      </g>
    </Stage>
  );
};

/* ───────── C24 · 선들이 사라지고 빛과 타이틀 ───────── */
export const C24: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 40], [1, 0], {extrapolateRight: 'clamp', easing: theme.ease.in});
  const title = interpolate(frame, [cut.voFrames + 10, cut.voFrames + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.out});
  const end = interpolate(frame, [cut.duration - 40, cut.duration - 4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.in});
  const breathe = 1 + Math.sin(frame / 30) * 0.01;
  return (
    <Stage cut={cut} glow={0.5} light>
      <defs>
        <radialGradient id="wash2">
          <stop offset="0%" stopColor={theme.color.seoCore} stopOpacity={0.95} />
          <stop offset="60%" stopColor={theme.color.seo} stopOpacity={0.6} />
          <stop offset="100%" stopColor={theme.color.seo} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g opacity={fade}>
        <Chalky><Pair approach={1} at={-100} pulse={1} /><Arcs /></Chalky>
      </g>
      <circle cx={640} cy={330} r={1160 * breathe} fill="url(#wash2)" opacity={end} />
      <g transform="translate(-78 410) scale(0.34)" opacity={0.3 * end}>
        <path d={TANGLE} fill="none" stroke={theme.color.chalk} strokeWidth={5} strokeLinecap="round" />
      </g>
      <g opacity={title * end} transform={`translate(0 ${(1 - title) * 14})`}>
        <text x={640} y={318} textAnchor="middle" fontFamily={theme.font.serif} fontSize={86} fontWeight={600}
          fill={theme.color.bg} letterSpacing={14}>輝敍</text>
        <text x={640} y={372} textAnchor="middle" fontFamily={theme.font.serif} fontSize={22}
          fill={theme.color.bg} letterSpacing={12} opacity={0.75}>HWISEO</text>
      </g>
    </Stage>
  );
};

export const _AbsoluteFill = AbsoluteFill;
