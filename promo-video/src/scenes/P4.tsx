import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Stage, Chalky} from '../components/Stage';
import {Draw} from '../components/Draw';
import {Tangle, TANGLE} from './P2';
import {Glyph} from './P3';
import {theme} from '../theme';
import type {Cut} from '../types';

/* ───────── C17 · 輝 → 敍 모핑, 실타래가 한 줄로 펼쳐진다 ───────── */
export const C17: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const morph = interpolate(frame, [10, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.inOut});
  const unwind = interpolate(frame, [40, cut.duration - 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.inOut});
  const flow = `M120,560 C300,440 420,640 640,540 C860,440 980,600 1160,520`;
  return (
    <Stage cut={cut} glow={0.3}>
      <Chalky>
        {/* 엉킨 것 → 풀림: 일부(구석)는 끝까지 남긴다 ★ */}
        <g opacity={1 - unwind * 0.85}>
          <Tangle at={-100} dur={1} scale={0.95 - unwind * 0.25} />
        </g>
        <path d={flow} pathLength={1} fill="none" stroke={theme.color.seo} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={1} strokeDashoffset={1 - unwind} opacity={0.95} />
        <g transform="translate(-78 410) scale(0.34)" opacity={0.55}>
          <path d={TANGLE} fill="none" stroke={theme.color.chalk} strokeWidth={5} strokeLinecap="round" />
        </g>
      </Chalky>
      {/* 모핑: 輝가 흐려지며 흩어지고 敍가 모인다 */}
      <g filter={morph > 0 && morph < 1 ? 'url(#soft)' : undefined}>
        <g opacity={1 - morph} transform={`translate(300 250) scale(${1 + morph * 0.3}) translate(-300 -250)`}>
          <Glyph ch="輝" x={300} y={250} size={190} color={theme.color.hwi} at={-100} dur={1} />
        </g>
        <g opacity={morph} transform={`translate(300 250) scale(${0.7 + morph * 0.3}) translate(-300 -250)`}>
          <Glyph ch="敍" x={300} y={250} size={190} color={theme.color.seo} at={-100} dur={1} />
        </g>
      </g>
      <g opacity={interpolate(frame, [60, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
        <text x={300} y={372} textAnchor="middle" fontFamily={theme.font.serif} fontSize={22}
          fill={theme.color.seo} letterSpacing={6} opacity={0.85}>펼 서</text>
      </g>
    </Stage>
  );
};

/* ───────── 실루엣 두 사람 — C18~C20 공유 ───────── */
const CHILD = 'M0,0 C22,0 36,18 36,40 C36,62 22,78 0,78 C-22,78 -36,62 -36,40 C-36,18 -22,0 0,0 Z M-30,96 C-24,84 -8,80 0,80 C8,80 24,84 30,96 L36,190 L-36,190 Z';
const ADULT = 'M0,0 C24,0 40,20 40,46 C40,72 24,90 0,90 C-24,90 -40,72 -40,46 C-40,20 -24,0 0,0 Z M-52,120 C-40,98 -14,92 0,92 C14,92 40,98 52,120 L60,290 L-60,290 Z';

export const Pair: React.FC<{approach: number; pulse?: number; at?: number}> = ({approach, pulse = 0, at = 0}) => {
  const frame = useCurrentFrame();
  const p = 1 + Math.sin(frame / 14) * 0.02 * pulse;
  const cx = 250 + approach * 170, ax = 1030 - approach * 170;
  return (
    <g>
      <g transform={`translate(${cx} 330) scale(${0.95 * p})`}>
        <Draw at={at} dur={40} w={5} d={CHILD} />
        <Draw at={at + 26} dur={16} w={4} d="M-14,44 Q-8,38 -2,44 M4,44 Q10,38 16,44 M-10,60 Q0,70 10,60" opacity={0.85} />
      </g>
      <g transform={`translate(${ax} 250) scale(${1.05 * p})`}>
        <Draw at={at + 10} dur={40} w={5} d={ADULT} />
        <Draw at={at + 36} dur={16} w={4} d="M-16,50 Q-10,44 -4,50 M6,50 Q12,44 18,50 M-8,70 Q0,76 8,70" opacity={0.85} />
      </g>
    </g>
  );
};

/* ───────── C18 · 꼬마와 지금의 나가 마주본다 ───────── */
export const C18: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const ap = interpolate(frame, [60, cut.duration - 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.inOut});
  return (
    <Stage cut={cut} glow={0.18}>
      <Chalky>
        <Draw at={0} dur={30} w={3} d="M120,640 C400,632 880,632 1160,640" opacity={0.5} />
        <Pair approach={ap} at={4} />
      </Chalky>
    </Stage>
  );
};

/* ───────── C19 · 부모님의 시선 — 위에서 내려오는 따뜻한 호 ───────── */
export const C19: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const arcs = [0, 1, 2, 3];
  return (
    <Stage cut={cut} glow={0.3}>
      <Chalky>
        <Draw at={-100} dur={1} w={3} d="M120,640 C400,632 880,632 1160,640" opacity={0.5} />
        <Pair approach={1} at={-100} />
        {arcs.map((i) => {
          const p = spring({frame: frame - 20 - i * 12, fps, config: theme.spring.smooth});
          const r = 190 + i * 70;
          return (
            <g key={i} transform={`translate(640 -60) scale(1 ${p}) translate(-640 60)`} opacity={p * (0.9 - i * 0.15)}>
              <path d={`M${640 - r},${430 + i * 10} C${640 - r},${120 - i * 30} ${640 + r},${120 - i * 30} ${640 + r},${430 + i * 10}`}
                fill="none" stroke={theme.color.seo} strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })}
      </Chalky>
    </Stage>
  );
};

/* ───────── C20 · 모든 선이 같은 주기로 숨쉰다 ───────── */
export const C20: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp', easing: theme.ease.out});
  const p = 1 + Math.sin(frame / 14) * 0.02 * pulse;
  return (
    <Stage cut={cut} glow={0.3 + Math.sin(frame / 14) * 0.08 * pulse}>
      <Chalky>
        <Draw at={-100} dur={1} w={3} d="M120,640 C400,632 880,632 1160,640" opacity={0.5} />
        <Pair approach={1} at={-100} pulse={pulse} />
        {[0, 1, 2, 3].map((i) => {
          const r = 190 + i * 70;
          return (
            <g key={i} transform={`translate(640 300) scale(${p}) translate(-640 -300)`} opacity={0.9 - i * 0.15}>
              <path d={`M${640 - r},${430 + i * 10} C${640 - r},${120 - i * 30} ${640 + r},${120 - i * 30} ${640 + r},${430 + i * 10}`}
                fill="none" stroke={theme.color.seo} strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })}
      </Chalky>
    </Stage>
  );
};
