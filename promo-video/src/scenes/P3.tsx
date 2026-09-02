import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Stage, Chalky} from '../components/Stage';
import {Draw} from '../components/Draw';
import {Tangle} from './P2';
import {theme} from '../theme';
import type {Cut} from '../types';

/* ───────── 촛불 — 캐릭터 스펙(각진 원통 + 촛농 + 보라 불꽃/노란 코어)의 선화 ───────── */
export const Candle: React.FC<{x: number; y: number; s?: number; lit?: number; at?: number}> =
({x, y, s = 1, lit = 1, at = 0}) => {
  const frame = useCurrentFrame();
  const flick = 1 + Math.sin(frame / 4.5) * 0.06 + Math.sin(frame / 11) * 0.04;
  const sway = Math.sin(frame / 9) * 2.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 몸통 — 눈 없음. 캐릭터화하지 않는다 */}
      <Draw at={at} dur={26} w={4} d="M-46,-40 L-46,84 Q-46,96 -34,96 L34,96 Q46,96 46,84 L46,-40" />
      <Draw at={at + 8} dur={16} w={4} d="M-46,-40 Q0,-56 46,-40" />
      {/* 촛농 3갈래 — 끝 뭉툭, 서로 떨어짐 */}
      <Draw at={at + 20} dur={16} w={4} d="M-46,-30 Q-40,-8 -30,6 Q-24,14 -18,4 Q-12,-8 -10,-30" />
      <Draw at={at + 26} dur={14} w={4} d="M12,-34 Q14,-14 20,-6 Q26,2 30,-8 Q34,-18 36,-34" />
      <Draw at={at + 30} dur={14} w={4} d="M-4,-36 Q-2,-24 2,-20 Q6,-16 6,-36" />
      {/* 심지 */}
      <Draw at={at + 36} dur={10} w={3} d="M0,-52 L0,-66" />
      {/* 불꽃 — 보라 바깥 + 노란 코어 (설계 시스템 색) */}
      <g opacity={lit} transform={`translate(${sway} 0) translate(0 -66) scale(${flick}) translate(0 66)`}>
        <path d="M0,-124 C18,-102 26,-84 22,-70 C18,-58 4,-56 0,-56 C-4,-56 -18,-58 -22,-70 C-26,-84 -18,-102 0,-124 Z"
          fill={theme.color.hwi} stroke={theme.color.hwi} strokeWidth={3} strokeLinejoin="round" opacity={0.92} />
        <path d="M0,-102 C8,-90 12,-80 10,-72 C8,-64 2,-62 0,-62 C-2,-62 -8,-64 -10,-72 C-12,-80 -8,-90 0,-102 Z"
          fill={theme.color.seoCore} opacity={0.95} />
      </g>
    </g>
  );
};

/* ───────── C12 · 정적. 실타래만 고요히 ───────── */
export const C12: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const br = 0.95 + Math.sin(frame / 34) * 0.006;
  return (
    <Stage cut={cut} glow={0.05}>
      <Chalky><Tangle at={-100} dur={1} scale={br} /></Chalky>
    </Stage>
  );
};

/* ───────── C13 · 촛불이 위에서 내려온다 ───────── */
export const C13: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [20, cut.duration - 30], [-160, 250],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.inOut});
  const glow = interpolate(frame, [0, cut.duration], [0.05, 0.22], {extrapolateRight: 'clamp'});
  return (
    <Stage cut={cut} glow={glow}>
      <Chalky>
        <Tangle at={-100} dur={1} scale={0.95} />
        <Candle x={640} y={y} s={0.8} at={0} />
      </Chalky>
    </Stage>
  );
};

/* ───────── 한자 — 획 순서를 흉내내는 마스크 와이프 ───────── */
export const Glyph: React.FC<{ch: string; x: number; y: number; size: number; color: string; at: number; dur: number; glow?: boolean; opacity?: number}> =
({ch, x, y, size, color, at, dur, glow = true, opacity = 1}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.draw});
  if (p <= 0) return null;
  const id = `wipe-${ch.codePointAt(0)}-${x}`;
  // 위→아래 + 좌→우 대각 와이프: 필순 느낌
  const w = size * 1.15, h = size * 1.15;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <rect x={x - w / 2} y={y - h / 2 - size * 0.1} width={w * p * 1.05 + size * 0.15} height={h * p * 1.05 + size * 0.3} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} filter={glow ? 'url(#glow)' : undefined}>
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
          fontFamily={theme.font.serif} fontSize={size} fontWeight={500}
          fill="none" stroke={color} strokeWidth={size * 0.028} strokeLinejoin="round">{ch}</text>
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
          fontFamily={theme.font.serif} fontSize={size} fontWeight={500}
          fill={color} opacity={0.18}>{ch}</text>
      </g>
    </g>
  );
};

/* ───────── C14 · 輝 ───────── */
export const C14: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [30, 120], [0.12, 0.42], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Stage cut={cut} glow={glow}>
      <Chalky>
        <Tangle at={-100} dur={1} scale={0.95} opacity={0.75} />
        <Candle x={640} y={250} s={0.8} at={-100} />
      </Chalky>
      <Glyph ch="輝" x={300} y={250} size={190} color={theme.color.hwi} at={10} dur={70} />
      <g opacity={interpolate(frame, [70, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
        <text x={300} y={372} textAnchor="middle" fontFamily={theme.font.serif} fontSize={22}
          fill={theme.color.hwi} letterSpacing={6} opacity={0.85}>빛날 휘</text>
      </g>
    </Stage>
  );
};

/* ───────── C15 · 촛불과 輝가 실타래에 닿아 융합 — 일부만 밝아진다 ───────── */
export const C15: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = interpolate(frame, [0, cut.duration * 0.55], [250, 380], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.inOut});
  const touch = cut.duration * 0.55;
  const lit = interpolate(frame, [touch, touch + 50], [0, 0.34], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.out});
  const glyphShift = spring({frame: frame - touch + 10, fps, config: theme.spring.smooth});
  const glow = interpolate(frame, [0, touch, touch + 40], [0.22, 0.3, 0.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Stage cut={cut} glow={glow}>
      <Chalky>
        <Tangle at={-100} dur={1} scale={0.95} litFrac={lit} />
        <Candle x={640} y={drop} s={0.8} at={-100} />
      </Chalky>
      <g style={{mixBlendMode: 'screen'}} transform={`translate(${glyphShift * 340} ${glyphShift * 310}) scale(${1 - glyphShift * 0.55})`}>
        <Glyph ch="輝" x={300} y={250} size={190} color={theme.color.hwi} at={-100} dur={1} opacity={1 - glyphShift * 0.6} />
      </g>
    </Stage>
  );
};

/* ───────── C16 · 멈춰 있던 인물이 숨쉬기 시작한다 ───────── */
export const C16: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wake = cut.duration * 0.42;
  const alive = spring({frame: frame - wake, fps, config: theme.spring.smooth});
  const breath = 1 + Math.sin((frame - wake) / 16) * 0.022 * alive;
  const bgDrift = Math.sin((frame - wake) / 24) * 6 * alive;
  return (
    <Stage cut={cut} glow={0.16 + alive * 0.1}>
      <Chalky>
        {/* 프레임 */}
        <Draw at={0} dur={30} w={5} d="M400,120 L880,120 L880,600 L400,600 Z" />
        {/* 배경 창 + 커튼 — 호흡 시 드리프트 */}
        <g transform={`translate(${bgDrift} 0)`}>
          <Draw at={10} dur={24} w={3} d="M700,170 L840,170 L840,330 L700,330 Z" opacity={0.6} />
          <Draw at={18} dur={20} w={3} d="M770,170 L770,330 M700,250 L840,250" opacity={0.5} />
        </g>
        {/* 인물 — 어깨 위, 호흡 스케일 */}
        <g transform={`translate(600 470) scale(${breath}) translate(-600 -470)`}>
          <Draw at={24} dur={30} w={5} d="M600,250 C650,250 682,292 682,340 C682,392 648,428 600,428 C552,428 518,392 518,340 C518,292 550,250 600,250 Z" />
          <Draw at={48} dur={30} w={5} d="M470,600 C480,520 528,470 600,462 C672,470 720,520 730,600" />
          <Draw at={64} dur={16} w={3} d="M560,345 Q574,338 588,345 M612,345 Q626,338 640,345" opacity={0.8} />
          <Draw at={74} dur={14} w={3} d="M580,388 Q600,402 620,388" opacity={0.8} />
        </g>
      </Chalky>
    </Stage>
  );
};
