import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring, Easing, delayRender, continueRender} from 'remotion';
import {Subtitle} from '../components/Stage';
import {rand} from '../components/Draw';
import {CUTS, cutStart, cutDur, partDur} from '../cuts';
import {theme} from '../theme';
import {StageB, Candle, P3Shape as Shape, P3Line as Line, P3C} from './P3Flat';

/**
 * P4 플랫 — C17~C20 (전역 2887~3651, 로컬 0~764).
 * 2026-08-27 '스포트라이트와 발현' 버전 (Gemini 스토리보드 + 조정 3: 딥블루 ✗→자두색, blur ✗→투명도, 3D flip ✗→2D 납작 플립). 촛불·인물·손 ✗.
 * C17 P3 디오라마에서 풀아웃 → 회색 사진 폭포 → 敍 금박 드로잉 → 敍가 따뜻한 빛의 구로 응축되며 모든 조각 정지, 종이가 어두워짐
 * C18 빛의 구(스포트라이트)가 정지한 조각 사이를 유영, 닿는 조각만 틱틱 납작 뒤집히며 컬러 카드(감각 아이콘)로
 * C19 줌아웃 — 의미를 찾은 컬러 카드만 은은히 빛나고, 선택받지 못한 회색은 옅어져 원경으로
 * C20 컬러 카드들이 자석처럼 중앙으로 모여 작은 디오라마(P3 무대)로 찰칵 조립 → 두 번째 호흡에 컬러·온기, 종이 워시로.
 */
const P4CUTS = CUTS.filter((c) => c.part === 'P4');
const G0 = cutStart('C17');
const END = partDur('P4');   // 764

const C = {
  cream: '#F3EEE4', linen: '#E8DFCB', wash: '#F6E3D2', ink: '#4A3D52', pencil: '#6B6068',
  hwi: '#DDD4F2', seo: '#E9A24A', amber: '#E9A24A', gold: '#F2C069', pink: '#F2A6B8', sky: '#8FB3D9', green: '#B8D68A', orange: '#F08A4B',
  skin: '#E9B994', hair: '#4A3D52', hairKid: '#7A5230', kidShirt: '#8FB3D9', adultCoat: '#5B6B8C', hand: '#F2C069',
};
const soft = theme.ease.soft, inOut = theme.ease.inOut;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const F = (f: number, a: number, b: number, v0: number, v1: number, e = soft) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} -${r},${r} h-${w - 2 * r} q-${r},0 -${r},-${r} v-${h - 2 * r} q0,-${r} ${r},-${r} z`;
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 -${2 * r},0`;

/* 색실 한 가닥: x0→x1 사이 사인 파동, 위상·진폭 가변 */
export const threadPath = (x0: number, x1: number, y: number, amp: number, waves: number, phase: number, n = 48) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t;
    const yy = y + Math.sin(t * Math.PI * 2 * waves + phase) * amp;
    d += `${i ? 'L' : 'M'}${x},${yy} `;
  }
  return d;
};

/* ── 사람: 옆모습(왼쪽/오른쪽 봄), 발 중앙이 원점. kid: 고깔모자 ── */
export const Person: React.FC<{x: number; y: number; face: 1 | -1; kid?: boolean; ink: string; step: number; smile: number; reach?: number}> =
  ({x, y, face, kid, ink, step, smile, reach = 0}) => {
    const s = kid ? 0.72 : 1;
    const hop = Math.abs(Math.sin(step)) * 9 * s;
    const legA = Math.sin(step) * 18, legB = -Math.sin(step) * 18;
    const body = kid ? C.kidShirt : C.adultCoat;
    return (
      <g transform={`translate(${x} ${y - hop}) scale(${face * s} ${s})`}>
        {/* 다리 */}
        <path d={`M-10,-6 l${legA * 0.3},0 l-2,-60`} stroke={ink} strokeWidth={7} strokeLinecap="round" fill="none" transform={`rotate(${legA} -12 -66)`} />
        <path d={`M12,-6 l${legB * 0.3},0 l-2,-60`} stroke={ink} strokeWidth={7} strokeLinecap="round" fill="none" transform={`rotate(${legB} 10 -66)`} />
        {/* 몸통 */}
        <Shape d={rr(-24, -150, 48, 90, 12)} fill={body} stroke={ink} sw={3} off={[2, -1]} />
        {/* 팔 (앞쪽): reach 로 앞으로 뻗음 */}
        <g transform={`translate(-16 -138) rotate(${20 - reach * 100 + Math.sin(step) * 12 * (1 - reach)})`}>
          <path d="M0,0 v54" stroke={ink} strokeWidth={7} strokeLinecap="round" />
          <Shape d={circle(0, 60, 10)} fill={C.skin} stroke={ink} sw={2.5} off={[1, -1]} />
        </g>
        {/* 머리 (옆모습: 코 있음) */}
        <Shape d={`M-26,-176 q-4,-40 30,-44 q30,-2 32,26 q2,10 -8,14 q-6,4 -6,10 q0,10 -14,12 q-26,4 -34,-18 z`} fill={C.skin} stroke={ink} sw={3} off={[2, -1]} />
        {/* 머리카락 */}
        <Shape d={kid ? `M-28,-180 q6,-46 40,-44 q28,4 26,26 q-30,-20 -66,18 z` : `M-30,-178 q4,-50 44,-46 q26,6 24,30 q-14,-14 -30,-14 q-20,0 -38,30 z`} fill={kid ? C.hairKid : C.hair} stroke={ink} sw={2.5} off={[1, -1]} />
        {/* 눈 · 입 */}
        <circle cx={-12} cy={-186} r={2.6} fill={ink} />
        <path d={`M-22,-166 q${-6 + smile * 4},${6 * smile} ${-12 + smile * 2},${smile * 2}`} stroke={ink} strokeWidth={2.4} strokeLinecap="round" fill="none" transform="translate(16 0)" />
        {/* 고깔 */}
        {kid && (
          <g>
            <Shape d={`M-4,-214 l-20,-48 l36,8 z`} fill={C.pink} stroke={ink} sw={2.5} off={[1, -1]} />
            <path d="M-22,-262 l-4,-6" stroke={ink} strokeWidth={2} />
          </g>
        )}
      </g>
    );
  };

/* ── 실루엣 인물 (TED-Ed 레퍼런스 #4·#5: 얼굴 없는 남색 실루엣, 옆모습 머리, 흐르는 머리카락). 발 중앙이 원점(서 있을 때), 관절 각도 보간
   calm 0 = 서 있음 → 1 = 부유(몸을 뒤로 젖히고 한 팔 늘어뜨림·한 팔 구부려 듦·다리 굽힘, 머리카락이 뒤로 길게 흐름)
   질감 = P1 방식: 연필 윤곽 + 남색 채움이 (3,-2) 어긋나 삐져나옴 (wob2) ── */
export const Figure: React.FC<{x: number; y: number; calm: number; ink: string; t: number; step?: number}> = ({x, y, calm, ink, t, step = 0}) => {
  const NAVY = '#2E3054', HAIR = C.orange, OFF: [number, number] = [3, -2];
  const L = (a: number, b: number) => a + (b - a) * calm;
  const walk = 1 - calm;
  const sw = Math.sin(step) * walk, bob = Math.abs(Math.sin(step)) * 4 * walk;
  const tilt = L(0, -38);
  // 각도: 0 = 아래, + = 시계 방향. [어깨/엉덩이 원점, 위 길이, 아래 길이, 위 각, 아래 각, 굵기]
  const armL = {o: [-22, -84], l1: 50, l2: 44, a1: L(8, 42) + sw * 12, a2: L(4, 6), w: 24};
  const armR = {o: [22, -84], l1: 50, l2: 44, a1: L(-8, -70) - sw * 12, a2: L(-4, -75), w: 24};
  const legL = {o: [-13, -6], l1: 58, l2: 56, a1: L(3, -35) - sw * 18, a2: L(0, 75) + Math.max(0, sw) * 14, w: 30};
  const legR = {o: [13, -6], l1: 58, l2: 56, a1: L(-3, -55) + sw * 18, a2: L(0, 55) + Math.max(0, -sw) * 14, w: 30};
  const dir = (a: number): [number, number] => [-Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
  const chain = (m: {o: number[]; l1: number; l2: number; a1: number; a2: number}) => {
    const d1 = dir(m.a1), p1 = [m.o[0] + d1[0] * m.l1, m.o[1] + d1[1] * m.l1];
    const d2 = dir(m.a1 + m.a2), p2 = [p1[0] + d2[0] * m.l2, p1[1] + d2[1] * m.l2];
    return {d: `M${m.o[0]},${m.o[1]} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`, end: p2, dir: d2};
  };
  const Limb = ({m, hand, side = 1}: {m: typeof armL; hand: 'hand' | 'foot'; side?: number}) => {
    const c = chain(m);
    const [dx, dy] = c.dir, px = -dy, py = dx;   // 진행 방향·수직 방향
    const tip = hand === 'hand'
      ? `M${c.end[0]},${c.end[1]} l${dx * 12},${dy * 12}`                                                                 // 벙어리장갑 덩어리 (굵은 짧은 선 + 둥근 끝)
      : `M${c.end[0]},${c.end[1]} l${-px * 20 + dx * 4},${-py * 20 + dy * 4}`;                                             // 발
    const thumb = hand === 'hand' ? `M${c.end[0] + dx * 3 + px * 7 * side},${c.end[1] + dy * 3 + py * 7 * side} l${px * 7 * side},${py * 7 * side}` : '';   // 엄지 혹 (side: 왼손은 반대쪽 — 사용자)
    const tw = hand === 'hand' ? 20 : 14;
    return (
      <g>
        <path d={c.d} fill="none" stroke={ink} strokeWidth={m.w + 3} strokeLinecap="round" strokeLinejoin="round" filter="url(#wob)" />
        <path d={tip} fill="none" stroke={ink} strokeWidth={tw + 3} strokeLinecap="round" filter="url(#wob)" />
        {thumb && <path d={thumb} fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" filter="url(#wob)" />}
        <g transform={`translate(${OFF[0]} ${OFF[1]})`} filter="url(#wob2)">
          <path d={c.d} fill="none" stroke={NAVY} strokeWidth={m.w} strokeLinecap="round" strokeLinejoin="round" />
          <path d={tip} fill="none" stroke={NAVY} strokeWidth={tw} strokeLinecap="round" />
          {thumb && <path d={thumb} fill="none" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />}
        </g>
      </g>
    );
  };
  const torso = 'M-26,4 L-32,-90 Q0,-104 32,-90 L26,4 Q0,12 -26,4 Z';
  const head = 'M-9,-90 L-9,-104 Q-30,-108 -28,-134 Q-24,-160 4,-160 Q32,-158 30,-134 L38,-126 L31,-121 Q30,-104 10,-102 L9,-90 Z';   // 옆모습(오른쪽 봄), 코 있음, 얼굴 ✗
  const hair = 'M4,-160 C-20,-172 -48,-166 -70,-150 C-88,-138 -96,-146 -112,-134 C-124,-124 -118,-108 -104,-104 C-90,-100 -84,-112 -70,-112 C-56,-112 -48,-100 -36,-104 C-30,-106 -30,-124 -26,-134 C-22,-146 -10,-152 4,-160 Z';   // 물결 윗선·아랫선, 끝 둥긂
  const hairSx = 0.32 + calm * 0.68;                                   // 짧게 → 뒤로 길게 흐름
  const flow = Math.sin(t / 15) * 3 * calm;
  return (
    <g transform={`translate(${x} ${y - bob}) rotate(${tilt} 0 -95) translate(0 -95)`}>
      {/* 뒤쪽 팔·다리 → 몸통 → 앞쪽 팔·다리 → 머리 → 머리카락 */}
      <Limb m={armL} hand="hand" side={-1} />
      <Limb m={legL} hand="foot" />
      <Shape d={torso} fill={NAVY} stroke={ink} sw={2.5} off={OFF} />
      <Limb m={legR} hand="foot" />
      <Limb m={armR} hand="hand" />
      <Shape d={head} fill={NAVY} stroke={ink} sw={2.5} off={OFF} />
      <g transform={`translate(-2 -156) scale(${hairSx} 1) rotate(${flow}) translate(2 156)`}>
        <Shape d={hair} fill={HAIR} stroke={ink} sw={2} off={[4, -3]} />
      </g>
    </g>
  );
};

/* ── 거대한 손 (화면 위 밖에서 내려와 감쌈). 손목이 원점, 손끝 -y ── */
export const BigHand: React.FC<{x: number; y: number; rot: number; ink: string; p: number; o: number}> = ({x, y, rot, ink, p, o}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={o}>
    <Shape d={`M-120,0 q-30,-140 40,-260 q60,-80 140,-60 q60,20 40,120 q-10,60 -50,110 q-30,60 -20,90 z`} fill={C.hand} stroke={ink} sw={4} off={[4, -3]} fillO={0.55} />
    <Shape d={`M-70,-120 q-70,-20 -80,40 q0,40 40,50`} fill={C.hand} stroke={ink} sw={4} off={[3, -2]} fillO={0.55} />
  </g>
);

/* 감각 조각 (P5에서도 씀): 음표·잎·컵·별·하트 — 중심이 원점 */
export const SenseIcon: React.FC<{k: number; col: string; ink: string; s?: number}> = ({k, col, ink, s = 1}) => {
  const d = [
    'M-6,10 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0 M6,10 V-14 q10,2 12,10',                       // 음표
    'M0,-16 q18,6 12,26 q-8,10 -12,8 q-8,-2 -12,-10 q-4,-18 12,-24 z M0,-12 v26',            // 잎
    'M-12,-8 h22 v18 q0,8 -8,8 h-6 q-8,0 -8,-8 z M10,-4 q10,0 8,8 q-2,6 -8,6',               // 컵
    'M0,-16 l4,11 h12 l-9,7 l3,12 l-10,-7 l-10,7 l3,-12 l-9,-7 h12 z',                       // 별
    'M0,14 q-18,-14 -14,-24 q6,-10 14,-2 q8,-8 14,2 q4,10 -14,24 z',                          // 하트
    'M-14,-4 h28 v18 h-28 z M-6,-4 l4,-8 h4 l4,8 M0,5 a4,4 0 1,0 0.1,0',                    // 카메라
  ][k % 6];
  return (
    <g transform={`scale(${s})`}>
      <path d={d} fill={col} stroke={ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" transform="translate(2 -1)" filter="url(#wob2)" />
      <path d={d} fill="none" stroke={ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" filter="url(#wob)" />
    </g>
  );
};

/* ═══════════════ 메인 ═══════════════ */
export {C as P4C};

/* Catmull-Rom 스플라인: 경로 문자열 + 매개변수 u(0~1) 위치 */
const smoothPath = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
};
const crPoint = (pts: [number, number][], u: number): [number, number] => {
  const n = pts.length - 1, uu = Math.max(0, Math.min(0.9999, u)) * n, i = Math.floor(uu), t = uu - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[Math.min(n, i + 1)], p3 = pts[Math.min(n, i + 2)];
  const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
};

/* ── 직소 퍼즐: 4×3 조각 경로 (탭 볼록/오목은 이웃과 맞물림). 좌표는 그림 기준 ── */
const PZ = {cols: 4, rows: 3};   // 24 → 12 (사용자: 조각 많으면 시선 분산)
const tabSign = (kind: 'h' | 'v', a: number, b: number) => (rand(a * 31 + b * 7 + (kind === 'h' ? 1000 : 2000), 88) > 0.5 ? 1 : -1);
/* A→B 변에 버섯 모양 탭. n = 바깥 법선, sign>0 볼록 / <0 오목 */
const edgePath = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number, sign: number) => {
  const dx = bx - ax, dy = by - ay;
  const P = (t: number, u: number) => `${ax + dx * t + nx * u * sign * Math.hypot(dx, dy)},${ay + dy * t + ny * u * sign * Math.hypot(dx, dy)}`;
  return ` L${P(0.36, 0)} C${P(0.40, 0.08)} ${P(0.30, 0.22)} ${P(0.50, 0.24)} C${P(0.70, 0.22)} ${P(0.60, 0.08)} ${P(0.64, 0)} L${bx},${by}`;
};
const piecePath = (c: number, r: number, x0: number, y0: number, w: number, h: number) => {
  const L = x0 + c * w, T = y0 + r * h, R = L + w, B = T + h;
  let d = `M${L},${T}`;
  d += r === 0 ? ` L${R},${T}` : edgePath(L, T, R, T, 0, -1, tabSign('h', r, c));
  d += c === PZ.cols - 1 ? ` L${R},${B}` : edgePath(R, T, R, B, 1, 0, tabSign('v', r, c + 1));
  d += r === PZ.rows - 1 ? ` L${L},${B}` : edgePath(R, B, L, B, 0, 1, -tabSign('h', r + 1, c));
  d += c === 0 ? ` Z` : edgePath(L, B, L, T, -1, 0, -tabSign('v', r, c)) + ' Z';
  return d;
};
export const useDecoded = (url: string) => {
  const [handle] = useState(() => delayRender(`decode ${url}`));
  useEffect(() => {
    const img = new Image(); img.src = url;
    img.decode().catch(() => undefined).finally(() => continueRender(handle));
  }, [url, handle]);
};

/* ── 로제트(궤도 문양): 타원 6개가 30°씩 엮임. p(i) 0~1 = 각 타원 draw-on. P5가 이어받음 ── */
export const ROSETTE_COLS = ['#F08A4B', '#8FB3D9', '#B8D68A', '#E9A24A', '#F2A6B8', '#F08A4B'];
export const Rosette: React.FC<{cx: number; cy: number; p: (i: number) => number; rot?: number; glow?: number; sw?: number; o?: number}> =
  ({cx, cy, p, rot = 0, glow = 0, sw = 5, o = 1}) => (
    <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={o}>
      {glow > 0 && [[300, 0.07], [190, 0.12], [90, 0.18]].map(([r, a], i) => <circle key={'g' + i} cx={cx} cy={cy} r={r * glow} fill="#F2C069" opacity={a * glow} filter="url(#chalk)" />)}
      {ROSETTE_COLS.map((col, i) => {
        const pi = Math.max(0, Math.min(1, p(i)));
        return pi > 0 && (
          <ellipse key={i} cx={cx} cy={cy} rx={210} ry={82} transform={`rotate(${i * 30} ${cx} ${cy})`} fill="none" stroke={col} strokeWidth={sw}
            strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pi} opacity={0.95} filter="url(#wob)" />
        );
      })}
    </g>
  );

/** 납작한 먹구름/둔덕 모양 — P4 C20과 P5 첫 장면이 같은 둔덕을 쓰도록 모듈 스코프로 (2026-08-27) */
export const cloudD = (w: number, h: number, k: number) => {   // 윗면 울퉁불퉁 3~4 봉우리, 아랫면 거의 평평 (가로로 길게)
  const rx = w / 2, ry = h / 2, j = (n: number) => (rand(k, 140 + n) - 0.5);
  return `M${-rx},${ry * 0.2} C${-rx - 20},${-ry * 0.5} ${-rx * 0.7},${-ry * (1.1 + j(1) * 0.3)} ${-rx * 0.45},${-ry * 0.75}`
    + ` C${-rx * 0.3},${-ry * (1.5 + j(2) * 0.4)} ${rx * 0.05},${-ry * (1.4 + j(3) * 0.4)} ${rx * 0.15},${-ry * 0.8}`
    + ` C${rx * 0.35},${-ry * (1.3 + j(4) * 0.4)} ${rx * 0.8},${-ry * (1.2 + j(5) * 0.3)} ${rx},${-ry * 0.2}`
    + ` C${rx + 16},${ry * 0.5} ${rx * 0.7},${ry} ${rx * 0.3},${ry * (0.85 + j(6) * 0.2)}`
    + ` C${-rx * 0.2},${ry * (1.05 + j(7) * 0.2)} ${-rx * 0.7},${ry * 0.9} ${-rx},${ry * 0.2} z`;
};

export const P4Flat: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const seed = Math.floor(f / theme.boilEvery) * 7;

  const T = {c17: 0, c18: cutStart('C18') - G0, c19: cutStart('C19') - G0, c20: cutStart('C20') - G0};
  const B = {c20: T.c20 + 64};                       // C20 자막 두 번째 호흡 ("기록은 비로소 의미를 갖습니다")
  const PCX = 740, PCY = 390, SBASE = PCY + 150;     // P3 무대
  const ink = C.ink;
  const GREY = '#C9C2C6', GREY_INK = '#8F8790', GREY_DARK = '#6E6878', GREY_DARK_INK = '#9C93A8', GOLD_DEEP = '#C98A2E', CORE = '#FFF1C9', PLUM = '#3A2D4A';
  const COLS = [C.sky, C.green, C.amber, C.pink, C.orange];

  /* ── 카메라: P3 마지막 프레임(디오라마 안)에서 0~48f 풀아웃 → C19 줌아웃 ── */
  const pullOut = F(f, 0, 48, 0, 1, Easing.bezier(0.4, 0, 0.2, 1));
  const zoomOut = F(f, T.c19 + 4, T.c19 + 70, 0, 1, inOut);
  const cx = 750 + (640 - 750) * pullOut, cy = 392 + (360 - 392) * pullOut;
  const z0 = (2.36 + (1 - 2.36) * pullOut) * (1 - zoomOut * 0.14);
  const dioO = 1 - F(f, 30, 72, 0, 1);

  /* ── C17: 회색 사진 폭포 → 敍 금박 드로잉 → 빛의 구로 응축 + 정지 ── */
  const SEO: [number, number] = [640, 330];
  const seoDraw = F(f, 56, Math.min(120, T.c18 - 40), 0, 1, theme.ease.draw), SL = 850;
  const FREEZE = Math.min(128, T.c18 - 34);
  const fr = Math.min(f, FREEZE);
  const rainIn = F(f, 34, 60, 0, 1);
  const NR = 110;
  const rain = (i: number) => {
    const x = 30 + rand(i, 81) * 1220, sp = 9 + rand(i, 82) * 9;
    const y = ((rand(i, 83) * 1400 + fr * sp) % 1400) - 300;
    const rot = (rand(i, 84) - 0.5) * 30 + fr * (rand(i, 85) - 0.5) * 2;
    const sc = 0.8 + rand(i, 86) * 0.7;
    return {x, y, rot, sc};
  };
  const condense = F(f, FREEZE - 2, FREEZE + 20, 0, 1, Easing.bezier(0.6, 0, 0.2, 1));   // 敍 → 빛의 구
  const dusk = F(f, FREEZE - 6, FREEZE + 40, 0, 1);                                        // 종이 어두워짐
  const shock = (i: number) => F(f, FREEZE + i * 6, FREEZE + 34 + i * 6, 0, 1, Easing.bezier(0.1, 0.6, 0.3, 1));
  const jolt = f >= FREEZE ? Math.sin(Math.min(1, (f - FREEZE) / 10) * Math.PI) * 4 : 0;

  /* ── C18: 퍼즐 조립 (Gemini 안 + 사용자 '퍼즐 형태'): 회색 조각들이 화면 밖에서 착착 날아와 직소로 맞물려 생일 사진(C08–09)이 되고, 마지막 조각에 컬러 개화 ── */
  const heroes: number[] = [];
  const heroPts: [number, number][] = [];
  const NH = 0;
  const leftStart: [number, number] = SEO;
  const beat = 1;
  const hitAt = (n: number) => T.c18 + n;
  const seg = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const hop = seg;
  const PIC = {x: 340, y: 160, w: 600, h: 400};                       // 그림 자리 (1024×684 → 600×400)
  const PW = PIC.w / PZ.cols, PH = PIC.h / PZ.rows;
  const NPZ = PZ.cols * PZ.rows;
  const pzOrder = Array.from({length: NPZ}, (_, i) => i).sort((a, b) => rand(a, 121) - rand(b, 121));   // 도착 순서 섞기
  const pzGap = (T.c19 - T.c18 - 76) / NPZ;   // C18 정적 +40f(사용자: 너무 빨리 모임) 안에서 여유 있게, 완성 뒤 컬러·이음선 페이드까지 머묾
  const pzArrive = (i: number) => T.c18 + 10 + pzOrder.indexOf(i) * pzGap;
  const pzDone = T.c18 + 10 + (NPZ - 1) * pzGap;
  // 마지막 조각이 끼워지는 순간부터 한 흐름: 회색 판 걷힘 → 색 → 이음선 소거가 겹쳐 이어짐 (사용자: 멈칫·단계 끊김 ✗)
  const pzFlow = F(f, pzDone + 2, pzDone + 56, 0, 1, Easing.bezier(0.35, 0, 0.2, 1));
  const pzReveal = F(pzFlow, 0, 0.45, 0, 1, Easing.linear);
  const pzSat = F(pzFlow, 0.12, 0.85, 0, 1, Easing.linear);
  const pzSeam = 1 - F(pzFlow, 0.3, 1, 0, 1, Easing.linear);
  const rainOut = 1 - F(f, T.c18, T.c18 + 18, 0, 1);                  // 폭포 조각은 사라지며 퍼즐 조각이 됨
  const birthday = staticFile('img/pack/photo-01-birthday-v2.png');   // 2026-08-28 새 생일 사진 (P2와 동일)
  useDecoded(birthday);
  const roamPt: [number, number] = (() => {
    if (NH === 0) return SEO;
    if (f < T.c18 + 24) return seg(SEO, leftStart, F(f, T.c18, T.c18 + 24, 0, 1, inOut));
    if (f < hitAt(0)) return hop(leftStart, heroPts[0], F(f, T.c18 + 24, hitAt(0), 0, 1, Easing.linear));
    for (let n = 1; n < NH; n++) if (f < hitAt(n)) return hop(heroPts[n - 1], heroPts[n], F(f, hitAt(n - 1), hitAt(n), 0, 1, Easing.linear));
    return heroPts[NH - 1];
  })();
  // 착지 순간 구가 살짝 눌림
  const landSq = (() => { for (let n = 0; n < NH; n++) { const d = f - hitAt(n); if (d >= 0 && d < 8) return Math.sin((d / 8) * Math.PI) * 0.22; } return 0; })();
  const orbRest: [number, number] = [PCX - 100, 300];   // C19~ 구가 쉬는 자리 → C20 디오라마의 해 위치로
  const settle = F(f, T.c19 + 4, T.c19 + 60, 0, 1, inOut);
  const orb: [number, number] = f < T.c19 ? roamPt : [roamPt[0] + (orbRest[0] - roamPt[0]) * settle, roamPt[1] + (orbRest[1] - roamPt[1]) * settle];
  const orbO = condense * rainOut;   // C18: 구는 퍼즐에 자리를 내줌
  // C20 다이브: 카메라가 구를 향해 ×15 — 통과 직전 화면이 구의 빛으로 가득 참
  const dive0 = F(f, T.c20, T.c20 + 30, 0, 1, Easing.bezier(0.7, 0, 0.9, 0.4));
  const z = z0 * (1 + dive0 * 15);
  const cxD = cx + (orb[0] - cx) * F(f, T.c20, T.c20 + 12, 0, 1, soft), cyD = cy + (orb[1] - cy) * F(f, T.c20, T.c20 + 12, 0, 1, soft);
  const REACH = 105;
  const flipAt = (hn: number) => hitAt(hn);
  const flipK = (hn: number) => F(f, flipAt(hn), flipAt(hn) + 10, 0, 1, inOut);      // 0→1: 납작 뒤집힘 (0.5에서 두께 0)
  const popS = (hn: number) => spring({frame: f - (flipAt(hn) + 5), fps, config: {damping: 6, stiffness: 190, mass: 0.7}});   // 팝! 오버슈트
  const ding = (hn: number) => F(f, flipAt(hn), flipAt(hn) + 18, 0, 1, Easing.bezier(0.1, 0.7, 0.3, 1));                     // 작은 고리

  /* ── C19: 얽힘 — 켜진 카드들 사이를 실 세 가닥이 위아래로 번갈아 엮으며 지나감 (땋기) + 줌아웃 + UI 팝업 ── */
  const weaveP = F(f, T.c19 + 6, T.c19 + 110, 0, 1, Easing.bezier(0.3, 0, 0.3, 1));
  const braid = (off: number, ph: number) => smoothPath(heroPts.map(([x, y], n) => [x, y + off * (n % 2 ? 1 : -1) * ph] as [number, number]));
  const WEAVES: [string, number, number][] = [[C.orange, 0, 0], [C.sky, 16, 1], [C.pink, 16, -1]];
  /* ── C19: 줌아웃 — 회색은 옅어져 원경, 컬러 카드만 은은히 + 기계적 UI 팝업이 산만하게 (별자리 버전에서 사용자가 좋아한 화면 복원) ── */
  const fade = F(f, T.c19 + 4, T.c19 + 60, 0, 1);
  const NP = 28, UI_BTN = '#9A948E';
  const popup = (j: number) => {
    const t0 = T.c19 + 6 + rand(j, 91) * (T.c20 - T.c19 - 36), life = 12 + rand(j, 92) * 12;
    const sp = spring({frame: f - t0, fps, config: {damping: 8, stiffness: 300, mass: 0.5}});
    const alive = f >= t0 && f < t0 + life ? 1 : 0;
    const blink = Math.floor((f - t0) / 2) % 3 === 0 ? 0.55 : 1;
    return {x: 80 + rand(j, 93) * 1120, y: 60 + rand(j, 94) * 600, s: Math.min(1.1, sp), o: alive * blink, w: 96 + rand(j, 95) * 60};
  };
  const sweep = F(f, T.c20, T.c20 + 40, 0, 1, Easing.bezier(0.3, 0, 0.6, 1));   // C20: 팝업이 바깥으로 밀려 사라짐
  const twinkle = (i: number) => 0.6 + 0.4 * Math.sin(f / (5 + (i % 3)) + i * 2.1);

  /* ── C19 팝업 폭풍 (사용자 안): 하드컷 → 차가운 흰 화면에 팝업이 기하급수로 늘어 뒤덮음 → 가운데 구로 딥 다이브 ── */
  const COLD = '#EEF3F8';
  const OC: [number, number] = [640, 380];                    // 다이브 중심 (광원 ✗ — 팝업 사이로 파고듦)
  const NS = 260;   // 320 → 260 (사용자: 템포 급변)
  // 칸 순서: 가운데 두 칸 → 좌·우 번갈아 → 위·아래 (가운데에서 바깥으로 흩어져 뜨는 순서)
  const STORM_ORDER = [14, 15, 8, 9, 13, 16, 7, 10, 20, 21, 2, 3, 12, 17, 19, 22, 6, 11, 1, 4, 18, 23, 0, 5];
  const stormAt = (j: number) => T.c19 + 6 + (T.c20 - T.c19 - 14) * Math.pow(j / NS, 0.55);   // 첫 팝업부터 6f 간격으로 끊김 없이(다다다) 이어지며 컷 내내 점점 빽빽 (0.38은 첫 둘 사이 16f 공백 → 사용자 반려)
  const stormCard = (j: number) => {
    // 처음엔 따로따로: 6×4 칸(가운데 → 좌·우 번갈아 → 바깥)에 하나씩 겹치지 않게 → 그 뒤부터 빈 칸을 메우며 점점 겹쳐 쌓임
    const CW = 1280 / 6, CH = 720 / 4;   // 자막 띠까지 포함해 화면 전체 (사용자: 자막 피하지 말고 다 덮기)
    const cell = j < 24 ? STORM_ORDER[j] : Math.floor(rand(j, 109) * 24);
    const cx0 = (cell % 6 + 0.5) * CW, cy0 = (Math.floor(cell / 6) + 0.5) * CH;
    const jit = j < 24 ? 0.25 : 0.95;   // 첫 24개는 칸 안에서 조금만, 이후는 넓게
    const x = cx0 + (rand(j, 101) - 0.5) * CW * jit, y = cy0 + (rand(j, 102) - 0.5) * CH * jit;
    const w = 110 + rand(j, 103) * 120, h = 56 + rand(j, 104) * 60;
    const sp = spring({frame: f - stormAt(j), fps, config: {damping: 9, stiffness: 280, mass: 0.5}});
    const kind = Math.floor(rand(j, 105) * 3);   // 0 체크, 1 결과 바, 2 썸네일
    const tint = ['#FFFFFF', '#E9F4E4', '#E4ECF6'][Math.floor(rand(j, 106) * 3)];
    return {x, y, w, h, s: f >= stormAt(j) ? Math.min(1.08, sp) : 0, rot: (rand(j, 107) - 0.5) * 8, kind, tint, ms: (0.1 + rand(j, 108) * 0.8).toFixed(1)};
  };

  /* ── C20: 딥 다이브 — 빛의 구로 극한 줌인 → 통과 → 먹구름 씬 (Gemini '멈춤과 부유' 안, 사용자 채택)
     ① "기꺼이 멈춰 서서 생각할 때," 먹구름이 위에서 짓누르고 사람은 그림자에 먹힌 실루엣 → 머리 위 '…' 말풍선 톡!
     ② "기록은 비로소 의미를 갖습니다." 먹구름이 양옆으로 걷히고, 사람에게 색이 돌아오며 두둥실 떠오름. 등 뒤로 C18에서 완성한 사진이 후광처럼 ── */
  const IVORY = '#FFF9F0', DIM = '#CFC7C2', CLOUD = '#221D28', CLOUD_BACK = '#3B3442';
  const dive = F(f, T.c20, T.c20 + 30, 0, 1, Easing.bezier(0.7, 0, 0.9, 0.4));
  const PASS = T.c20 + 28;                                   // 통과 순간
  const inWorld = f < T.c19;                                 // C19부터는 새 화면(팝업 폭풍)
  const flash = (f >= PASS - 4 ? 1 : 0) * F(f, PASS - 4, PASS + 10, 1, 0);
  const BUBBLE = T.c20 + 54;                                 // 말풍선 팝 (자막 두 번째 호흡 직전)
  const CLEAR = B.c20;                                       // 먹구름 걷힘 시작
  const press = F(f, PASS, CLEAR, 0, 1, Easing.bezier(0.3, 0, 0.7, 1));          // 먹구름이 서서히 내려옴
  const clear = F(f, CLEAR, CLEAR + 34, 0, 1, Easing.bezier(0.5, 0, 0.8, 0.4));  // 바람에 씻기듯 양옆으로
  const shadeK = F(f, CLEAR + 4, CLEAR + 40, 0.1, 1, soft);                       // 실루엣 → 본연의 색
  const lift = F(f, CLEAR + 22, CLEAR + 112, 0, 1, Easing.bezier(0.25, 0.5, 0.15, 1)); // '!' 뒤에 두둥실 상승 (사용자: 느낌표 → 그 뒤 떠오름)
  const bubS = spring({frame: f - BUBBLE, fps, config: {damping: 6, stiffness: 260, mass: 0.6}});
  const bubO = f >= BUBBLE ? 1 : 0;
  const glowO = F(f, CLEAR + 10, CLEAR + 70, 0, 1, soft);                          // 사람 주위가 환해짐 (레퍼런스 1:25 후반)
  const cloudFly = F(clear, 0, 1, 0, 1, Easing.bezier(0.6, 0, 0.9, 0.5));         // 옅어지지 않고 날아감
  const GROUND = 612, FLOAT_Y = 430;                                                // GROUND 566→612: 그림자 웅덩이가 자막 바로 위에 오게 (사용자 23:55). 먹구름도 같이 46 내림
  const WALK0 = PASS + 2, WALK1 = PASS + 24;                                        // '기꺼이 멈춰' — 두 걸음 걷고 멈춤 (사용자)
  const walk = F(f, WALK0, WALK1, 0, 1, Easing.bezier(0.3, 0, 0.5, 1));
  const walkX = 640 - 70 * (1 - walk);
  const stepPh = walk * Math.PI * 2;                                               // 두 걸음 = sin 두 주기
  const personY = GROUND + (FLOAT_Y - GROUND) * lift + Math.sin(f / 22) * 7 * lift;   // 떠오른 뒤 물속처럼 둥둥
  const personRot = Math.sin(f / 17) * 2 * lift;                                        // RotateZ ±2° 유영
  // 레퍼런스 구도 (TED-Ed 'What is depression?' 1:25): 납작한 검은 구름이 하늘 가운데 느슨한 무리로, 서로 안 붙음
  const CLOUDS: [number, number, number, number][] = [   // [cx, cy, w, h]
    [455, 98, 250, 74], [800, 90, 260, 88], [508, 202, 250, 84], [792, 172, 280, 88], [460, 294, 290, 66],   // 머리 오른쪽 위에 생각 풍선 자리 (구름과 안 겹치게)
  ];
  const PUDDLES: [number, number, number, number][] = [[470, GROUND + 14, 170, 22], [800, GROUND + 18, 140, 20]];   // 발밑 좌우 그림자 웅덩이
  const gatherK = 0;                                          // (카드 조립 ✗ — 통과 뒤 옛 세계는 사라짐)
  const paper = f < PASS ? interpolateColors(dusk, [0, 1], [C.cream, PLUM]) : interpolateColors(clear, [0, 1], [DIM, IVORY]);

  return (
    <AbsoluteFill style={{backgroundColor: paper}}>
      {P4CUTS.map((c) => (
        <Sequence key={c.id} from={c.start - G0} durationInFrames={c.duration} name={c.id}>
          <Audio src={staticFile(`vo/${c.vo}`)} />
        </Sequence>
      ))}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block'}}>
        <defs>
          <filter id="wob" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wob2" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={seed + 3} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={7} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed + 40} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} />
          </filter>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={seed + 90} />
            <feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .12 0" />
          </filter>
          <filter id="pzSat"><feColorMatrix type="saturate" values={String(pzSat)} /></filter>
          <filter id="brush" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={3} seed={11} />
            <feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .35  0 0 0 0 .2  0 0 0 .10 0" />
          </filter>
        </defs>
        <rect width={width} height={height} filter="url(#brush)" />

        {inWorld && <g transform={`translate(${width / 2} ${height / 2}) scale(${z}) translate(${-cxD} ${-cyD + jolt})`}>
          {/* P3 디오라마: 풀아웃하며 사라짐 */}
          {dioO > 0 && (
            <g opacity={dioO}>
              <rect x={PCX - 230} y={PCY - 150} width={460} height={300} fill={P3C.bubble} stroke={ink} strokeWidth={2} filter="url(#wob)" />
              <StageB f={f} fps={fps} ink={ink} base={-2074} cx={PCX} cy={SBASE} />
            </g>
          )}

          {/* 스포트라이트 웅덩이: 구 주변 바닥이 밝아짐 (조각 뒤) */}
          {orbO > 0 && f < T.c20 + 40 && <circle cx={orb[0]} cy={orb[1]} r={REACH + 40} fill={C.gold} opacity={0.14 * orbO} filter="url(#chalk)" />}

          {/* C19 UI 팝업 (카드 뒤): 초록 바탕·검은 선·회색 버튼, 짧은 spring + 점멸 */}
          {f >= T.c19 && sweep < 1 && Array.from({length: NP}).map((_, j) => {
            const q = popup(j);
            if (q.o <= 0 || q.s <= 0) return null;
            const dx = (q.x - 640) * sweep * 0.6, dy = (q.y - 360) * sweep * 0.6;
            return (
              <g key={'u' + j} transform={`translate(${q.x + dx} ${q.y + dy}) scale(${q.s})`} opacity={q.o * (1 - sweep)}>
                <path d={rr(-q.w / 2, -32, q.w, 64, 6)} fill={C.green} stroke={ink} strokeWidth={2.5} />
                <rect x={-q.w / 2 + 10} y={-20} width={q.w * 0.6} height={7} fill={UI_BTN} />
                <rect x={-q.w / 2 + 10} y={-6} width={q.w * 0.4} height={7} fill={UI_BTN} />
                <path d={rr(-q.w / 2 + 10, 8, 44, 16, 3)} fill={UI_BTN} stroke={ink} strokeWidth={1.5} />
                <rect x={q.w / 2 - 22} y={-22} width={12} height={12} fill="none" stroke={ink} strokeWidth={2} />
              </g>
            );
          })}

          {/* C19 얽힘: 실 세 가닥 (카드 뒤) — C20 조립되며 옅어짐 */}
          {weaveP > 0 && heroPts.length > 1 && WEAVES.map(([col, off, ph], k) => (
            <path key={'w' + k} d={braid(off, ph)} fill="none" stroke={col} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, weaveP * 1.15 - k * 0.08))} opacity={0.95 * (1 - gatherK)} filter="url(#wob)" />
          ))}

          {/* 사진 폭포 → 정지 → (C18) 빛이 닿은 조각은 뒤집혀 컬러 카드 / (C19) 회색은 옅어짐 / (C20) 카드는 중앙으로 */}
          {rainIn > 0 && Array.from({length: NR}).map((_, i) => {
            const p = rain(i);
            if (p.y < -60 || p.y > 790) return null;
            const hn = heroes.indexOf(i);
            const isHero = hn >= 0;
            const k = isHero ? flipK(hn) : 0;               // 뒤집힘 진행
            const flipped = k > 0.5;
            const thick = Math.abs(1 - k * 2);              // 납작: 1 → 0 → 1
            const col = COLS[hn % 5];
            const fillG = interpolateColors(dusk, [0, 1], [GREY, GREY_DARK]), strokeG = interpolateColors(dusk, [0, 1], [GREY_INK, GREY_DARK_INK]);
            // C20: 카드는 디오라마 중앙으로
            const x = p.x, y = p.y;
            const o = rainIn * rainOut * (isHero ? 1 : (1 - fade * 0.8));
            if (o <= 0) return null;
            const pop = isHero && f >= flipAt(hn) + 5 ? 0.75 + 0.45 * Math.min(1.35, popS(hn)) : 1;   // 0.75 → 1.36 → 1.2 튀었다 안정
            const sc = p.sc * (isHero ? pop : 1 - fade * 0.15) * (isHero ? 1 - gatherK * 0.5 : 1);
            const rot = isHero ? p.rot * (1 - Math.min(1, k) * 0.8) : p.rot;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc * thick} ${sc})`} opacity={o}>
                {flipped ? (
                  <g>
                    {ding(hn) > 0 && ding(hn) < 1 && <circle r={12 + 70 * ding(hn)} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.8 * (1 - ding(hn))} />}
                    {fade > 0 && <circle r={34} fill={C.gold} opacity={0.22 * fade * twinkle(hn)} filter="url(#chalk)" />}
                    <path d={rr(-20, -14, 40, 28, 4)} fill={col} stroke={ink} strokeWidth={2} filter="url(#wob)" />
                    <g transform="translate(0 2)"><SenseIcon k={hn} col={CORE} ink={ink} s={1.1} /></g>
                  </g>
                ) : (
                  <path d={rr(-18, -12, 36, 24, 3)} fill={fillG} stroke={strokeG} strokeWidth={2} filter="url(#wob)" />
                )}
              </g>
            );
          })}

          {/* C18 퍼즐: 조각이 날아와 착! 맞물림 → 완성 순간 컬러 */}
          {f >= T.c18 && (
            <g filter="url(#pzSat)">
              {Array.from({length: NPZ}).map((_, i) => {
                const c = i % PZ.cols, r = Math.floor(i / PZ.cols);
                const ta = pzArrive(i);
                const fly = F(f, ta - 40, ta, 0, 1, Easing.bezier(0.3, 0.3, 0.3, 1));   // 40f 감속 진입 (사용자: 너무 빨리 모임 → 더 느리게)
                if (fly <= 0) return null;
                const cxp = PIC.x + (c + 0.5) * PW, cyp = PIC.y + (r + 0.5) * PH;
                const a = rand(i, 122) * Math.PI * 2;
                const sx = 640 + Math.cos(a) * 760, sy = 360 + Math.sin(a) * 520;   // 화면 가장자리 밖에서 출발
                const x = sx + (cxp - sx) * fly, y = sy + (cyp - sy) * fly;
                const rot = (rand(i, 123) - 0.5) * 40 * (1 - fly);
                const snap = f >= ta ? spring({frame: f - ta, fps, config: {damping: 14, stiffness: 160, mass: 0.7}}) : 0;
                const sc = f >= ta ? 1 + Math.sin(Math.min(1, snap) * Math.PI) * 0.035 : 1;
                const d = piecePath(c, r, PIC.x, PIC.y, PW, PH);
                return (
                  <g key={'pz' + i} transform={`translate(${x - cxp} ${y - cyp}) translate(${cxp} ${cyp}) rotate(${rot}) scale(${sc}) translate(${-cxp} ${-cyp})`}>
                    <clipPath id={'pz' + i}><path d={d} /></clipPath>
                    {/* 모이는 동안은 회색 민판 (폭포 조각과 같은 재료) → 다 맞춰지면 판이 걷히며 그림 */}
                    {pzReveal > 0 && (
                      <g clipPath={`url(#pz${i})`} opacity={pzReveal}>
                        <image href={birthday} x={PIC.x} y={PIC.y} width={PIC.w} height={PIC.h} preserveAspectRatio="none" />
                      </g>
                    )}
                    <path d={d} fill={GREY_DARK} opacity={1 - pzReveal} />
                    <path d={d} fill="none" stroke={ink} strokeWidth={2} strokeLinejoin="round" opacity={0.85 * pzSeam} />
                    {f >= ta && f < ta + 14 && <circle cx={cxp} cy={cyp} r={16 + (f - ta) * 3.5} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.5 * (1 - (f - ta) / 14)} />}
                  </g>
                );
              })}
            </g>
          )}

          {/* 정지 충격파 */}
          {[0, 1].map((i) => { const w = shock(i); return w > 0 && w < 1 && <circle key={'s' + i} cx={SEO[0]} cy={SEO[1]} r={30 + 720 * w} fill="none" stroke={C.gold} strokeWidth={6 - i * 2} opacity={0.5 * (1 - w)} filter="url(#wob)" />; })}

          {/* 敍: 금박 드로잉 → 빛의 구로 응축 */}
          {seoDraw > 0 && condense < 1 && (
            <g opacity={1 - condense} transform={`translate(${SEO[0]} ${SEO[1]}) scale(${(0.9 + seoDraw * 0.1) * (1 - condense * 0.95)}) translate(${-SEO[0]} ${-SEO[1]})`} filter="url(#wob)">
              <text x={SEO[0]} y={SEO[1]} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={170} fontWeight={500} fill={C.gold} opacity={F(seoDraw, 0.72, 1, 0, 1)}>敍</text>
              <text x={SEO[0]} y={SEO[1]} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={170} fontWeight={500} fill="none" stroke={GOLD_DEEP} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${seoDraw * SL} ${SL * 2}`}>敍</text>
            </g>
          )}
          {/* 빛의 구 (스포트라이트) — 유영 → 쉼 → 디오라마의 해로 */}
          {orbO > 0 && (
            <g transform={`translate(${orb[0]} ${orb[1]}) scale(${1 + landSq * 0.6} ${1 - landSq})`} opacity={orbO}>
              {[[120, 0.12], [70, 0.22], [38, 0.5]].map(([r, o], i) => <circle key={i} r={r * (1 + Math.sin(f / 7 + i) * 0.04)} fill={C.gold} opacity={o} filter="url(#chalk)" />)}
              <circle r={16 * (1 + Math.sin(f / 5) * 0.06)} fill={CORE} />
            </g>
          )}

        </g>}

        {/* ── C19 팝업 폭풍 → C20 구로 다이브 (레이어째 ×15) ── */}
        {f >= T.c19 && f < PASS && (
          <g transform={`translate(${OC[0]} ${OC[1]}) scale(${1 + dive0 * 15}) translate(${-OC[0]} ${-OC[1]})`}>
            <rect x={-2000} y={-2000} width={5280} height={4720} fill={COLD} />
            {Array.from({length: NS}).map((_, j) => {
              const c = stormCard(j);
              if (c.s <= 0) return null;
              return (
                <g key={'s' + j} transform={`translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${c.s})`}>
                  <path d={rr(-c.w / 2, -c.h / 2, c.w, c.h, 5)} fill={c.tint} stroke={ink} strokeWidth={2} />
                  <rect x={-c.w / 2} y={-c.h / 2} width={c.w} height={11} fill={ink} opacity={0.85} />
                  <circle cx={-c.w / 2 + 7} cy={-c.h / 2 + 5.5} r={2.2} fill="#F08A4B" />
                  {c.kind === 0 && <path d={`M${-c.w / 2 + 12},${c.h / 2 - 14} l6,6 l12,-13`} fill="none" stroke="#5FA86A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
                  {c.kind === 1 && <><rect x={-c.w / 2 + 10} y={-c.h / 2 + 18} width={c.w * 0.65} height={6} fill={UI_BTN} /><rect x={-c.w / 2 + 10} y={-c.h / 2 + 29} width={c.w * 0.45} height={6} fill={UI_BTN} /></>}
                  {c.kind === 2 && <rect x={-c.w / 2 + 10} y={-c.h / 2 + 17} width={c.w * 0.5} height={c.h - 30} fill="#8FB3D9" opacity={0.7} />}
                  <text x={c.w / 2 - 6} y={c.h / 2 - 6} textAnchor="end" fontFamily="'American Typewriter', 'Courier New', monospace" fontSize={9} fill={ink} opacity={0.7}>DONE {c.ms}s</text>
                </g>
              );
            })}
          </g>
        )}

        {/* 통과 플래시 */}
        {flash > 0 && <rect width={width} height={height} fill={IVORY} opacity={flash} />}

        {/* ── C20 먹구름 씬: 짓누르는 구름 + 실루엣 → '…' 톡! → 구름 걷힘 · 색 회복 · 부유. 등 뒤 완성 사진 후광 ── */}
        {f >= PASS && (
          <g>
            <filter id="shade"><feColorMatrix type="matrix" values={`${shadeK} 0 0 0 0  0 ${shadeK} 0 0 0  0 0 ${shadeK} 0 0  0 0 0 1 0`} /></filter>
            <filter id="haloSat"><feColorMatrix type="saturate" values="0.8" /></filter>
            {/* 빛 무리: 사람을 중심으로 동심원 3겹 (그라데이션 ✗ — 층으로) + 반짝이. 종이 자체도 아이보리로 밝아짐 */}
            {glowO > 0 && (
              <g>
                {Array.from({length: 9}).map((_, i) => (   // 얇은 층 9겹 → 부드러운 빛 (하드 링 ✗)
                  <circle key={'gl' + i} cx={640} cy={personY - 90} r={(500 - i * 42) * (0.85 + glowO * 0.15) + Math.sin(f / 19 + i) * 4} fill={C.gold} opacity={0.032 * glowO} filter="url(#chalk)" />
                ))}
                {Array.from({length: 16}).map((_, i) => {
                  const a = rand(i, 151) * Math.PI * 2, rr0 = 90 + rand(i, 152) * 300;
                  const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (7 + (i % 4)) + i * 1.3));
                  return <circle key={'sp' + i} cx={640 + Math.cos(a) * rr0} cy={personY - 90 + Math.sin(a) * rr0 * 0.8 + Math.sin(f / 30 + i) * 6} r={3 + rand(i, 153) * 3} fill="#FFFFFF" stroke={C.gold} strokeWidth={1.2} opacity={glowO * tw} />;
                })}
              </g>
            )}
            {/* 어두운 땅: 걷힌 뒤 화면 맨 아래에 그림자 둔덕이 남음 */}
            {lift > 0 && <path d={cloudD(1500, 200, 33)} transform={`translate(640 ${810 - lift * 20})`} fill={CLOUD} opacity={0.55 * lift} filter="url(#wob)" />}
            {/* 땅: 발밑 좌우 검은 그림자 웅덩이 (구름의 그림자 — 걷히면 함께 사라짐) */}
            {PUDDLES.map(([px, py, rx, ry], i) => (
              <path key={'pd' + i} d={cloudD(rx * 2, ry * 2, 20 + i)} transform={`translate(${px + (px < 640 ? -1 : 1) * cloudFly * 900} ${py})`} fill={CLOUD} opacity={0.95 * (1 - F(clear, 0.7, 1, 0, 1))} filter="url(#wob)" />
            ))}
            {/* 사람 (옆모습, 오른쪽 봄): 그림자에 먹힌 실루엣 → 색 → 두둥실 */}
            <g transform={`translate(${walkX} ${personY}) rotate(${personRot}) scale(0.85) translate(${-walkX} ${-personY})`}>
              <g filter="url(#shade)">
                <Figure x={walkX} y={personY} calm={lift} ink={ink} t={f} step={stepPh} />
              </g>
              {/* '.oO' 생각 풍선: 정지하고 생각하는 순간 — 작은 점 → 중간 → 큰 풍선 순서로 톡톡톡 (꼬리 ✗, 사용자) */}
              {bubO > 0 && (() => {
                const S = 0.85, th = (-38 * lift * Math.PI) / 180;
                const hx = walkX + 160 * S * Math.sin(th), hy = personY - 95 * S - 160 * S * Math.cos(th);   // 머리 꼭대기
                const ux = Math.cos(th), uy = Math.sin(th);                                                   // 몸 기울기에 맞춘 '오른쪽'
                const at = (rx: number, ry: number): [number, number] => [hx + rx * ux - ry * uy, hy + rx * uy + ry * ux];
                const dots: [number, number, number, number][] = [[54, -58, 4.5, 0], [76, -90, 8, 4], [106, -134, 34, 8]];   // [dx, dy, r, 지연f] — 맨 아래 점이 이마에 안 붙게 간격 벌림 (사용자 23:50)
                return dots.map(([dx, dy, r, dl], i) => {
                  const sp = spring({frame: f - BUBBLE - dl, fps, config: {damping: 6, stiffness: 260, mass: 0.6}});
                  if (f < BUBBLE + dl) return null;
                  const [px, py] = at(dx, dy);
                  return (
                    <g key={'bub' + i} transform={`translate(${px} ${py}) scale(${Math.min(1.25, sp)})`}>
                      <path d={circle(0, 0, r)} fill={CORE} stroke={ink} strokeWidth={i === 2 ? 3 : 2.2} filter="url(#wob)" />
                      {i === 2 && (() => {
                        const ex = spring({frame: f - (CLEAR - 2), fps, config: {damping: 7, stiffness: 240, mass: 0.6}});   // 두 번째 호흡에 '…' → '!' → 그 뒤 떠오름 (사용자)
                        const dotsK = f < CLEAR - 2 ? 1 : Math.max(0, 1 - ex * 1.6);
                        return (
                          <g>
                            {dotsK > 0 && [-13, 0, 13].map((ox, k) => <circle key={k} cx={ox} cy={2} r={4 * dotsK} fill={ink} opacity={0.5 + 0.5 * Math.min(1, Math.max(0, sp * 3 - k))} />)}
                            {f >= CLEAR - 2 && (
                              <g transform={`scale(${Math.min(1.3, ex)})`}>
                                <path d="M-3,-17 h6 l-1.5,20 h-3 z" fill={ink} filter="url(#wob)" />
                                <circle cx={0} cy={12} r={3.6} fill={ink} />
                              </g>
                            )}
                          </g>
                        );
                      })()}
                    </g>
                  );
                });
              })()}
            </g>
            {/* 먹구름 5개: 따로 떠서 불안하게 둥실, 아주 조금 내려앉음 → 왼쪽 무리는 왼쪽으로, 오른쪽 무리는 오른쪽으로 씻겨 나감 */}
            {CLOUDS.map(([x, y, w, h], i) => {
              const side = x < 640 ? -1 : 1;
              const bob = Math.sin(f / (16 + i * 3) + i * 1.7) * 5;
              const dy = press * 12 + bob;
              const dx = side * cloudFly * (900 + rand(i, 131) * 500);
              const o = 1 - F(clear, 0.75, 1, 0, 1);
              if (o <= 0) return null;
              return <path key={'cl' + i} d={cloudD(w, h, i)} transform={`translate(${x + dx} ${y + dy})`} fill={CLOUD} opacity={o} filter="url(#wob)" />;
            })}
          </g>
        )}

        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
      {P4CUTS.map((c) => (
        <Sequence key={'s' + c.id} from={c.start - G0} durationInFrames={c.duration} name={'sub ' + c.id}>
          <Subtitle cut={c} />
        </Sequence>
      ))}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 60%, rgba(30,20,30,0.18) 100%)'}} />
    </AbsoluteFill>
  );
};
