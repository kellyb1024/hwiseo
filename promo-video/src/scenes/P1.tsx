import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Stage, Chalky} from '../components/Stage';
import {Draw, rand} from '../components/Draw';
import {theme} from '../theme';
import type {Cut} from '../types';

/* ───────── C01 · 어둠에서 필름 프레임 한 장이 그어진다 ───────── */
export const C01: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const cam = interpolate(frame, [0, cut.duration], [1, 1.04], {extrapolateRight: 'clamp', easing: theme.ease.soft});
  return (
    <Stage cut={cut} glow={0.06}>
      <g transform={`translate(640 360) scale(${cam}) translate(-640 -360)`}>
        <Chalky>
          {/* 바깥 프레임 */}
          <Draw at={6} dur={52} w={8}
            d="M332,132 C520,124 760,122 948,128 C954,290 955,452 950,590 C760,597 520,598 338,592 C330,452 328,296 332,132 Z" />
          {/* 안쪽 이미지 영역 */}
          <Draw at={48} dur={40} w={5}
            d="M372,172 C540,165 740,164 908,170 C913,300 914,440 909,552 C740,558 540,559 378,552 C370,440 368,310 372,172 Z" />
          {/* 스프로킷 홀 — 필름임을 알려주는 최소 단서 */}
          {Array.from({length: 7}).map((_, i) => (
            <Draw key={i} at={84 + i * 3} dur={8} w={3}
              d={`M${372 + i * 89},142 h22 v14 h-22 z`} />
          ))}
          {Array.from({length: 7}).map((_, i) => (
            <Draw key={'b' + i} at={88 + i * 3} dur={8} w={3}
              d={`M${372 + i * 89},568 h22 v14 h-22 z`} />
          ))}
        </Chalky>
      </g>
    </Stage>
  );
};

/* ───────── C02 · 탁자 위 인화 사진, 손들, 말풍선 ───────── */
export const C02: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bubbles = [
    {x: 300, y: 178, w: 170, h: 78, at: 78},
    {x: 820, y: 150, w: 190, h: 82, at: 96},
    {x: 560, y: 110, w: 160, h: 70, at: 114},
  ];
  return (
    <Stage cut={cut} glow={0.08}>
      <Chalky>
        {/* 탁자 */}
        <Draw at={0} dur={30} w={5} d="M120,560 C400,548 880,548 1160,560" />
        {/* 인화 사진 (약간 기울어짐) */}
        <Draw at={14} dur={40} w={5} d="M520,372 L790,360 L798,522 L528,534 Z" />
        <Draw at={40} dur={26} w={3} d="M546,394 L764,384 L770,500 L552,510 Z" opacity={0.7} />
        {/* 왼손 */}
        <Draw at={30} dur={34} w={5}
          d="M330,600 C340,540 372,500 420,470 C432,462 450,470 448,486 C446,500 438,510 428,520 C452,506 476,498 494,500 C506,502 508,516 496,524 C478,536 460,548 450,560 C438,580 430,600 426,620" />
        {/* 오른손 */}
        <Draw at={38} dur={34} w={5}
          d="M950,600 C940,540 908,500 860,470 C848,462 830,470 832,486 C834,500 842,510 852,520 C828,506 804,498 786,500 C774,502 772,516 784,524 C802,536 820,548 830,560 C842,580 850,600 854,620" />
        {/* 말풍선 — 순차 팝업 */}
        {bubbles.map((b, i) => {
          const p = spring({frame: frame - b.at, fps, config: theme.spring.snappy});
          const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${p}) translate(${-cx} ${-cy})`} opacity={p}>
              <path fill="none" stroke={theme.color.chalk} strokeWidth={4} strokeLinejoin="round"
                d={`M${b.x + 18},${b.y} H${b.x + b.w - 18} Q${b.x + b.w},${b.y} ${b.x + b.w},${b.y + 18}
                    V${b.y + b.h - 18} Q${b.x + b.w},${b.y + b.h} ${b.x + b.w - 18},${b.y + b.h}
                    H${b.x + 54} L${b.x + 36},${b.y + b.h + 22} L${b.x + 40},${b.y + b.h}
                    H${b.x + 18} Q${b.x},${b.y + b.h} ${b.x},${b.y + b.h - 18} V${b.y + 18} Q${b.x},${b.y} ${b.x + 18},${b.y} Z`} />
              {[0, 1, 2].map((k) => (
                <line key={k} x1={b.x + 26} y1={b.y + 24 + k * 16} x2={b.x + b.w - 26 - k * 22} y2={b.y + 24 + k * 16}
                  stroke={theme.color.chalk} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
              ))}
            </g>
          );
        })}
      </Chalky>
    </Stage>
  );
};

/* ───────── 픽셀 밭 — C03~C06 공유 ───────── */
type Phase = 'grow' | 'vibrate' | 'scroll' | 'sink';
const COLS = 44, ROWS = 24, CELL = 29;
const OX = (1280 - COLS * CELL) / 2, OY = (720 - ROWS * CELL) / 2;

export const PixelField: React.FC<{phase: Phase; duration: number}> = ({phase, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scroll = phase === 'scroll'
    ? interpolate(frame, [0, duration], [0, -720], {extrapolateRight: 'clamp', easing: theme.ease.inOut}) : 0;
  const fadeAll = phase === 'scroll'
    ? interpolate(frame, [duration * 0.45, duration - 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const sinkT = phase === 'sink'
    ? interpolate(frame, [0, duration], [0, 1], {extrapolateRight: 'clamp', easing: theme.ease.inOut}) : 0;

  return (
    <g transform={`translate(0 ${scroll})`} opacity={fadeAll}>
      {Array.from({length: COLS * ROWS}).map((_, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        const rr = rand(i), r2 = rand(i, 3), r3 = rand(i, 7);
        // 등장: 랜덤 증식
        let a = 1;
        if (phase === 'grow') {
          const at = Math.floor(rr * (duration * 0.8));
          a = spring({frame: frame - at, fps, config: theme.spring.snappy});
        }
        // 진동
        let dx = 0, dy = 0;
        if (phase === 'vibrate' || phase === 'scroll') {
          const amp = phase === 'vibrate' ? 1.6 : 0.8;
          dx = Math.sin(frame / (6 + r2 * 5) + i) * amp;
          dy = Math.cos(frame / (7 + r3 * 5) + i * 1.3) * amp;
        }
        // 가라앉음: 일부만 아래로, 흐려지며
        let sinkY = 0, sinkO = 1, blur = false;
        if (phase === 'sink') {
          const sinks = rr < 0.55;
          if (sinks) {
            const own = interpolate(sinkT, [r2 * 0.4, 0.5 + r2 * 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.in});
            sinkY = own * (260 + r3 * 300);
            sinkO = 1 - own * 0.9;
            blur = own > 0.15;
          }
        }
        const base = 0.35 + r3 * 0.6;
        const s = 5 + r2 * 5;
        return (
          <rect key={i}
            x={OX + c * CELL + (CELL - s) / 2 + dx} y={OY + r * CELL + (CELL - s) / 2 + dy + sinkY}
            width={s * a} height={s * a}
            fill={theme.color.chalk} opacity={base * a * sinkO}
            filter={blur ? 'url(#soft)' : undefined} />
        );
      })}
    </g>
  );
};

export const C03: React.FC<{cut: Cut}> = ({cut}) => (
  <Stage cut={cut} glow={0.05}><PixelField phase="grow" duration={cut.duration} /></Stage>
);
export const C04: React.FC<{cut: Cut}> = ({cut}) => (
  <Stage cut={cut} glow={0.05}><PixelField phase="vibrate" duration={cut.duration} /></Stage>
);
export const C05: React.FC<{cut: Cut}> = ({cut}) => (
  <Stage cut={cut} glow={0.05}><PixelField phase="scroll" duration={cut.duration} /></Stage>
);
