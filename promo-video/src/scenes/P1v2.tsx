import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Stage} from '../components/Stage';
import {Draw} from '../components/Draw';
import {PencilImage} from '../components/PencilImage';
import {theme} from '../theme';
import type {Cut} from '../types';
import C01S from '../strokes/C01.json';

const PEN = theme.color.pencil;

/** 3차 베지어 점 */
const bez = (p: number[][], t: number) => {
  const u = 1 - t;
  return [
    u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0],
    u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1],
  ];
};

/** x 좌표에 해당하는 베지어 점 (x가 단조 증가할 때) */
const atX = (p: number[][], x: number) => {
  let lo = 0, hi = 1;
  for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (bez(p, mid)[0] < x) lo = mid; else hi = mid; }
  return bez(p, (lo + hi) / 2);
};

/* ───────── C01 · 손이 필름통을 넣고, 리더에서 필름 띠가 풀리며 24프레임 ───────── */
export const C01: React.FC<{cut: Cut}> = ({cut}) => {
  const frame = useCurrentFrame();
  // 이미지 1280 기준. 리더 끝 x≈650, y 203~278 (높이 76, 위로 -8° 기울어짐), 구멍은 위쪽 한 줄
  const HALF = 38;
  const P = [[652, 240], [800, 221], [1300, 238], [1880, 250]];
  const N = 24, PITCH = 50, FW = 40, FH = 46, FY = 8; // 프레임은 구멍 줄 아래
  const HOLES = 84, HW = 8, HH = 12;
  const STRIP_AT = 46, FRAME_AT = 52, FRAME_EVERY = 2;
  // 필름이 풀리는 만큼 카메라가 빠짐 (왼쪽 중앙 앵커)
  const s = interpolate(frame, [STRIP_AT, 106], [1, 0.64], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.soft});
  const railD = (off: number) => {
    const pts = Array.from({length: 40}, (_, i) => { const [x, y] = bez(P, i / 39); return `${x.toFixed(1)},${(y + off).toFixed(1)}`; });
    return 'M' + pts.join(' L');
  };
  return (
    <Stage cut={cut} paper="cream">
      <g transform={`translate(0 360) scale(${s}) translate(0 -360)`}>
        <PencilImage id="c01" src="img/P1/C01.png" strokes={C01S} x={0} y={0} w={1280} at={2} dur={48} maskWidth={12} tip={false} />
        <g filter="url(#pencil)">
          {/* 띠 위아래 레일 */}
          <Draw at={STRIP_AT} dur={50} w={3.2} color={PEN} d={railD(-HALF)} />
          <Draw at={STRIP_AT + 2} dur={50} w={3.2} color={PEN} d={railD(HALF)} />
          {/* 스프로킷 홀 — 이미지 리더처럼 위쪽 한 줄, 세로로 긴 둥근 네모 */}
          {Array.from({length: HOLES}).map((_, i) => {
            const [x, y] = atX(P, P[0][0] + 10 + i * 14.6);
            const x0 = x - HW / 2, y0 = y - HALF + 6;
            return <Draw key={i} at={STRIP_AT + 4 + Math.floor(i * 0.6)} dur={5} w={2.4} color={PEN}
              d={`M${x0 + 2},${y0} h${HW - 4} q2,0 2,2 v${HH - 4} q0,2 -2,2 h-${HW - 4} q-2,0 -2,-2 v-${HH - 4} q0,-2 2,-2 z`} />;
          })}
          {/* 24 프레임 */}
          {Array.from({length: N}).map((_, i) => {
            const [x, y] = atX(P, P[0][0] + 26 + i * PITCH + FW / 2);
            return <Draw key={'f' + i} at={FRAME_AT + i * FRAME_EVERY} dur={7} w={3.0} color={PEN}
              d={`M${x - FW / 2},${y + FY - FH / 2} h${FW} v${FH} h-${FW} z`} />;
          })}
        </g>
      </g>
    </Stage>
  );
};
