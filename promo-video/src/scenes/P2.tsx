import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Stage, Chalky} from '../components/Stage';
import {Draw} from '../components/Draw';
import {PixelField} from './P1';
import {theme} from '../theme';
import type {Cut} from '../types';

/* ───────── C06 · 데이터의 바다로 가라앉음 ───────── */
export const C06: React.FC<{cut: Cut}> = ({cut}) => (
  <Stage cut={cut} glow={0.05}><PixelField phase="sink" duration={cut.duration} /></Stage>
);

/* ───────── 라벨 UI — C07~C10 공유 ───────── */
const TAGS = [
  {t: 'indoor', x: 372, y: 250, w: 196},
  {t: 'person', x: 590, y: 250, w: 206},
  {t: '2015',   x: 818, y: 250, w: 150},
];
type TagPhase = 'stab' | 'blink' | 'repel' | 'eject';

const PhotoGhost: React.FC<{o?: number}> = ({o = 0.35}) => (
  <g opacity={o}>
    <rect x={392} y={190} width={496} height={340} fill="none" stroke={theme.color.chalk} strokeWidth={2} strokeDasharray="6 8" />
  </g>
);

export const Tags: React.FC<{phase: TagPhase; duration: number}> = ({phase, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <g>
      {TAGS.map((tg, i) => {
        let sx = 1, o = 1, rot = 0, tx = 0, ty = 0;
        if (phase === 'stab') {
          const p = spring({frame: frame - 6 - i * 9, fps, config: theme.spring.stiff});
          sx = p; o = p;
        }
        if (phase === 'repel') {
          // 아지랑이가 닿을 때마다 반발
          const kick = Math.max(0, Math.sin((frame - i * 7) / 9));
          rot = (i % 2 ? -1 : 1) * kick * 3.2;
        }
        if (phase === 'eject') {
          const e = interpolate(frame, [duration * 0.42 + i * 5, duration * 0.42 + 26 + i * 5], [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.in});
          tx = e * (i === 1 ? 0 : (i === 0 ? -900 : 900));
          ty = e * (i === 1 ? -700 : -120);
          o = 1 - e;
        }
        const cx = tg.x + tg.w / 2, cy = tg.y + 26;
        return (
          <g key={tg.t} opacity={o}
            transform={`translate(${tx} ${ty}) translate(${cx} ${cy}) rotate(${rot}) scale(${sx} 1) translate(${-cx} ${-cy})`}>
            <rect x={tg.x} y={tg.y} width={tg.w} height={52} rx={3}
              fill={theme.color.bg} stroke={theme.color.hwi} strokeWidth={2} />
            <text x={tg.x + 20} y={tg.y + 35} fill={theme.color.hwi}
              fontFamily={theme.font.mono} fontSize={27} letterSpacing={1}>{tg.t}</text>
            {phase === 'blink' && (
              <g opacity={0.5 + 0.5 * Math.round(Math.abs(Math.sin((frame + i * 11) / 8)))}>
                {[[tg.x - 8, tg.y - 8, 1, 1], [tg.x + tg.w + 8, tg.y - 8, -1, 1],
                  [tg.x - 8, tg.y + 60, 1, -1], [tg.x + tg.w + 8, tg.y + 60, -1, -1]].map(([x, y, dx, dy], k) => (
                  <path key={k} d={`M${x},${y + dy * 12} V${y} H${x + dx * 12}`}
                    fill="none" stroke={theme.color.hwi} strokeWidth={2} />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const C07: React.FC<{cut: Cut}> = ({cut}) => (
  <Stage cut={cut} glow={0.04}><PhotoGhost /><Tags phase="stab" duration={cut.duration} /></Stage>
);
export const C08: React.FC<{cut: Cut}> = ({cut}) => (
  <Stage cut={cut} glow={0.04}><PhotoGhost /><Tags phase="blink" duration={cut.duration} /></Stage>
);

/* ───────── C09 · 온기의 아지랑이가 자라나려다 끊긴다 ───────── */
export const C09: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const waves = [
    {x: 456, dl: 0}, {x: 649, dl: 14}, {x: 824, dl: 28},
    {x: 520, dl: 40}, {x: 730, dl: 52},
  ];
  return (
    <Stage cut={cut} glow={0.12}>
      <PhotoGhost />
      <Chalky>
        {waves.map((wv, i) => {
          // 자라나다(0→0.45) 끊겨 다시 0으로 — 3번 반복
          const t = ((frame - wv.dl) / 46) % 1;
          const grow = t < 0.62 ? interpolate(t, [0, 0.62], [0, 0.48], {easing: theme.ease.out})
                                : interpolate(t, [0.62, 0.7], [0.48, 0], {extrapolateRight: 'clamp', easing: theme.ease.in});
          if (frame < wv.dl) return null;
          const d = `M${wv.x},${296} C${wv.x - 26},${250} ${wv.x + 30},${212} ${wv.x - 8},${164}
                      C${wv.x - 40},${120} ${wv.x + 20},${86} ${wv.x + 4},${40}`;
          return (
            <path key={i} d={d} pathLength={1} fill="none" stroke={theme.color.seo} strokeWidth={4}
              strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - grow} opacity={0.85} />
          );
        })}
      </Chalky>
      <Tags phase="repel" duration={cut.duration} />
    </Stage>
  );
};

/* ───────── C10 · 라벨이 화면 밖으로 튕겨 나간다 ───────── */
export const C10: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const ghostO = interpolate(frame, [cut.duration * 0.5, cut.duration * 0.75], [0.35, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Stage cut={cut} glow={0.04}>
      <PhotoGhost o={ghostO} />
      <Tags phase="eject" duration={cut.duration} />
    </Stage>
  );
};

/* ───────── 엉킨 실타래 — C11~C17 공유 ───────── */
export const tanglePath = (cx: number, cy: number, r: number, seedOff = 0) => {
  let d = `M${cx - r},${cy}`;
  const n = 34;
  for (let i = 1; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 * 3.7 + seedOff;
    const rr = r * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + seedOff)));
    const x = cx + Math.cos(a) * rr + Math.sin(i * 2.3) * r * 0.25;
    const y = cy + Math.sin(a) * rr * 0.55 + Math.cos(i * 1.9) * r * 0.2;
    const c1x = x + Math.sin(i * 3.1) * r * 0.5, c1y = y + Math.cos(i * 2.7) * r * 0.4;
    d += ` Q${c1x},${c1y} ${x},${y}`;
  }
  return d;
};
export const TANGLE = tanglePath(640, 500, 190);

export const Tangle: React.FC<{at?: number; dur?: number; scale?: number; color?: string; opacity?: number; litFrac?: number}> =
({at = 0, dur = 70, scale = 1, color = theme.color.chalk, opacity = 1, litFrac = 0}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(640 500) scale(${scale}) translate(-640 -500)`} opacity={opacity}>
      <Draw d={TANGLE} at={at} dur={dur} w={4} color={color} />
      {litFrac > 0 && frame > at + dur && (
        <path d={TANGLE} pathLength={1} fill="none" stroke={theme.color.hwi} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={`${litFrac} ${1 - litFrac}`} strokeDashoffset={-0.31} opacity={0.95} />
      )}
    </g>
  );
};

/* ───────── C11 · 어둠 속에 접힌 채 — 실타래 등장, 서서히 수축 ───────── */
export const C11: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const sc = interpolate(frame, [70, cut.duration], [1, 0.95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.soft});
  return (
    <Stage cut={cut} glow={0.05}>
      <Chalky><Tangle at={4} dur={80} scale={sc} /></Chalky>
    </Stage>
  );
};
