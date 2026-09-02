import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring, Easing, delayRender, continueRender} from 'remotion';
import {Subtitle} from '../components/Stage';
import {rand} from '../components/Draw';
import {CUTS, cutStart, cutDur, partDur} from '../cuts';
import {theme} from '../theme';
import {Head, C as P2C} from './P2Flat';

/**
 * P3 플랫 — C12~C16 (전역 1851~2887, 로컬 0~1036).
 * 재료: 블록 6 (C12–14) 짙은 남보라 종이 + 초크(연보라·앰버) / 블록 7 (C15–16) 펴지는 순간 크림 + 크레파스 풀컬러.
 * 서사: P2 끝 실루엣 안으로 푸시인 → 머릿속 허공에 접힌 기억 → 촛불이 내려와 어둠을 밀어냄 → 輝 → 몽글 말풍선이 접힌 종이에 닿음,
 *       종이가 살짝 벌어지고 실 한 가닥 → 종이가 펴지며 (A) 생일 사진 + 프레임 밖 커튼·창·냄비 팝업 / (B) 일반 팝업 장면.
 */
const P3CUTS = CUTS.filter((c) => c.part === 'P3');
const G0 = cutStart('C12');
const END = partDur('P3');   // 1036

const C = {
  void: '#1E1A33', voidWarm: '#2A2140', plum: '#3A2D4A', cream: '#F3EEE4',
  chalk: '#C9BCE8', chalkDim: '#8F84B0', ink: '#4A3D52',
  wax: '#F4E7C8', waxShade: '#E2D2AE', flame: '#F08A4B', amber: '#E9A24A', core: '#FFF1C9', hwi: '#DDD4F2',
  memory: '#6E6878', memoryDark: '#4C4756', bubble: '#F7F1E3',
  pink: '#F2A6B8', sky: '#8FB3D9', green: '#B8D68A', table: '#B98A5C', pot: '#5B6B8C', skin: '#E9B994', grey: '#9A948E',
};
const soft = theme.ease.soft, inOut = theme.ease.inOut;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const F = (f: number, a: number, b: number, v0: number, v1: number, e = soft) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} -${r},${r} h-${w - 2 * r} q-${r},0 -${r},-${r} v-${h - 2 * r} q0,-${r} ${r},-${r} z`;
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 -${2 * r},0`;

const useDecoded = (url: string) => {
  const [handle] = useState(() => delayRender(`decode ${url}`));
  useEffect(() => {
    const img = new Image(); img.src = url;
    img.decode().catch(() => undefined).finally(() => continueRender(handle));
  }, [url, handle]);
};

const Shape: React.FC<{d: string; fill?: string; stroke?: string; sw?: number; off?: [number, number]; opacity?: number; fillO?: number}> =
  ({d, fill = 'none', stroke, sw = 3, off = [3, -2], opacity = 1, fillO = 1}) => (
    <g opacity={opacity}>
      {fill !== 'none' && <path d={d} fill={fill} opacity={fillO} transform={`translate(${off[0]} ${off[1]})`} filter="url(#wob2)" />}
      {stroke && <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" filter="url(#wob)" />}
    </g>
  );
const Line: React.FC<{d: string; p: number; stroke: string; sw?: number; o?: number}> = ({d, p, stroke, sw = 4, o = 1}) =>
  p <= 0 ? null : (
    <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
      strokeDasharray={1} strokeDashoffset={1 - p} opacity={o} filter="url(#wob)" />
  );

/* ── 촛불 (눈 없음): 각진 원통 + 촛농 세 갈래 + 심지 + 불꽃. 바닥 중앙이 원점 ── */
const Candle: React.FC<{x: number; y: number; ink: string; flick: number; lit: number}> = ({x, y, ink, flick, lit}) => {
  const fs = 1 + Math.sin(flick * 0.9) * 0.06 + (rand(Math.floor(flick / 2), 9) - 0.5) * 0.08;
  const fx = Math.sin(flick * 0.6) * 3 + (rand(Math.floor(flick / 3), 8) - 0.5) * 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <Shape d={`M-33,-150 h66 v150 h-66 z`} fill={C.wax} stroke={ink} sw={3} />
      <path d={`M-33,-150 h66 l-6,8 h-54 z`} fill={C.waxShade} opacity={0.6} />
      {/* 촛농 */}
      <Shape d={`M-30,-148 q-4,30 2,52 q6,12 -2,22 q-8,-16 -6,-44 z`} fill={C.wax} stroke={ink} sw={2} off={[1, -1]} />
      <Shape d={`M8,-148 q6,26 0,40 q-6,10 2,18 q6,-14 8,-36 z`} fill={C.wax} stroke={ink} sw={2} off={[1, -1]} />
      <Shape d={`M26,-148 q4,18 0,30 q-4,8 4,12 q4,-12 4,-30 z`} fill={C.wax} stroke={ink} sw={2} off={[1, -1]} />
      <path d="M0,-150 v-18" stroke={ink} strokeWidth={3} strokeLinecap="round" filter="url(#wob)" />
      {/* 불꽃 */}
      {lit > 0 && (
        <g transform={`translate(${fx} -168) scale(${lit} ${lit * fs})`} opacity={Math.min(1, lit)}>
          <path d="M0,0 q-22,-22 -18,-50 q4,-24 18,-40 q14,16 18,40 q4,28 -18,50 z" fill={C.flame} transform="translate(2 -2)" filter="url(#wob2)" />
          <path d="M0,-4 q-12,-14 -10,-32 q2,-14 10,-24 q8,10 10,24 q2,18 -10,32 z" fill={C.amber} />
          <path d="M0,-8 q-6,-8 -5,-18 q1,-8 5,-12 q4,4 5,12 q1,10 -5,18 z" fill={C.core} />
        </g>
      )}
    </g>
  );
};

/* ── 접힌 기억 (작은 회색 네모). 중심이 원점. 다이브 때 스쳐 가는 네모와 같은 단판 — crack>0 일 때만 가운데가 갈라지며 좌우로 벌어짐 ── */
const Memory: React.FC<{ink: string; crack: number}> = ({ink, crack}) => crack <= 0 ? (
  <Shape d={rr(-18, -12, 36, 24, 3)} fill={C.memory} stroke={ink} sw={2} off={[1, -1]} />
) : (
  <g>
    <g transform={`translate(-1 12) rotate(${-22 * crack}) translate(1 -12)`}>
      <Shape d={rr(-18, -12, 19, 24, 3)} fill={C.memory} stroke={ink} sw={2} off={[1, -1]} />
    </g>
    <g transform={`translate(1 12) rotate(${22 * crack}) translate(-1 -12)`}>
      <Shape d={rr(-1, -12, 19, 24, 3)} fill={C.memory} stroke={ink} sw={2} off={[1, -1]} />
    </g>
  </g>
);

/* ── 몽글 말풍선 (비어 있음). 중심이 원점 ── */
const Blob: React.FC<{ink: string; s: number}> = ({ink, s}) => s <= 0 ? null : (
  <g transform={`scale(${s})`}>
    <Shape d={`M-46,-6 q-4,-30 30,-32 q30,-2 44,10 q18,16 6,34 q-14,18 -46,14 q-34,-2 -34,-26 z`} fill={C.bubble} stroke={ink} sw={2.5} off={[2, -2]} />
  </g>
);

/* ── 팝업 도우미: 바닥 기준 세로로 솟음 ── */
const Pop: React.FC<{x: number; y: number; p: number; sway?: number; children: React.ReactNode}> = ({x, y, p, sway = 0, children}) =>
  p <= 0 ? null : <g transform={`translate(${x} ${y}) skewX(${sway}) scale(1 ${Math.max(0, p)})`}>{children}</g>;

/* ── B안 팝업 무대 (P4가 이어받아 색실로 풀어냄). (cx,cy) = 무대 바닥 중앙.
   collapse 0→1: 층이 바닥으로 접힘 / tint 0→1: 흑백→수채 컬러 / speed: 팝업 간격 배수 / 시계·새는 tint>0.5부터 움직임 ── */
export const StageB: React.FC<{f: number; fps: number; ink: string; base: number; cx: number; cy: number; collapse?: number; breatheK?: number; tint?: number; speed?: number; wire?: boolean}> =
  ({f, fps, ink, base, cx, cy, collapse = 0, breatheK = 1, tint = 1, speed = 1, wire = false}) => {
    // wire: 청사진 모드 — 채움 없음, 팝업 없음(이미 다 서 있음 = 박제), 숨 ✗
    const pop = (at: number) => wire ? 1 : spring({frame: f - (base + at * speed), fps, config: {damping: 7, stiffness: 120, mass: 0.9}});
    const br = (k: number) => wire ? 0 : Math.sin(f / 13 + k) * 3 * breatheK;
    const col = (k: number) => Math.max(0, 1 - Math.max(0, collapse * 1.6 - k * 0.12));   // 위층부터 접힘
    const tc = (c: string, k: number) => wire ? 'none' : interpolateColors(Math.max(0, Math.min(1, tint * 1.6 - k * 0.1)), [0, 1], [C.grey, c]);
    const alive = tint > 0.5 ? 1 : 0;
    const tick = alive ? f : 0;
    const sun = Math.sin(f / 30) * 6 * alive;
    const sw = Math.sin(f / 18) * 2.5 * alive;
    const birdT = alive ? ((f - (base + 130 * speed)) / 110) % 1 : 0;
    const bx = cx - 250 + 500 * birdT, byy = cy - 250 - Math.sin(birdT * Math.PI) * 40, flap = Math.sin(f * 0.8) * 6;
    return (
      <g>
        <Pop x={cx} y={cy - 20} p={pop(60) * col(0)}>
          <Shape d={`M-210,0 a210,210 0 0 1 420,0 z`} fill={tc(C.sky, 0)} stroke={ink} sw={3} />
          <Shape d={circle(130, -120 + sun, 34)} fill={tc(C.amber, 1)} stroke={ink} sw={2.5} />
        </Pop>
        <Pop x={cx} y={cy - 16} p={pop(76) * col(1)}>
          <Shape d={`M-220,0 q-40,-90 60,-70 q40,-60 110,-10 q60,-30 80,80 h-250 z`} fill={tc(C.green, 2)} stroke={ink} sw={3} />
        </Pop>
        <Pop x={cx - 120} y={cy - 30} p={pop(92) * col(2)}>
          <Shape d={`M-36,0 v-50 h72 v50 z`} fill={tc(C.amber, 3)} stroke={ink} sw={3} />
          <Shape d={`M-44,-50 l44,-36 l44,36 z`} fill={tc(C.pink, 3)} stroke={ink} sw={3} />
          <Shape d={`M-8,0 v-24 h16 v24 z`} fill={wire ? 'none' : C.ink} stroke={ink} sw={2} />
          {/* 시계: 색이 닿으면 째깍 */}
          <Shape d={circle(0, -60, 11)} fill={wire ? 'none' : C.bubble} stroke={ink} sw={2} off={[1, -1]} />
          <path d={`M0,-60 l0,-7`} stroke={ink} strokeWidth={2} strokeLinecap="round" transform={`rotate(${tick * 6} 0 -60)`} />
          <path d={`M0,-60 l0,-5`} stroke={ink} strokeWidth={2} strokeLinecap="round" transform={`rotate(${tick * 0.5 + 90} 0 -60)`} />
        </Pop>
        {[[90, 106], [150, 118]].map(([tx, at], i) => (
          <Pop key={i} x={cx + tx} y={cy - 34} p={pop(at) * col(3 + i)} sway={sw * (i ? -1 : 1)}>
            <path d="M0,0 v-30" stroke={ink} strokeWidth={5} strokeLinecap="round" />
            <Shape d={`M-24,-30 q-8,-40 24,-44 q32,4 24,44 z`} fill={tc(C.green, 4 + i)} stroke={ink} sw={2.5} />
          </Pop>
        ))}
        {[[-40, C.sky, 130], [10, C.amber, 142], [50, C.pink, 154]].map(([px, colr, at], i) => (
          <Pop key={i} x={cx + (px as number)} y={cy - 40 + br(i)} p={pop(at as number) * col(5 + i)}>
            <Shape d={rr(-13, -44, 26, 44, 7)} fill={tc(colr as string, 6 + i)} stroke={ink} sw={2.5} off={[1, -1]} />
            <Shape d={circle(0, -58, 15)} fill={tc(C.skin, 6 + i)} stroke={ink} sw={2.5} off={[1, -1]} />
            <path d="M-5,-55 q5,5 10,0" stroke={ink} strokeWidth={1.8} fill="none" />
          </Pop>
        ))}
        {/* 새: 색이 닿으면 날아감 */}
        {alive > 0 && pop(60) > 0.9 && collapse < 0.3 && (
          <path d={`M${bx - 16},${byy - flap} q16,${10 + flap} 16,0 q0,${10 + flap} 16,${-flap}`} fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" filter="url(#wob)" />
        )}
      </g>
    );
  };

export {Candle, Shape as P3Shape, Line as P3Line, C as P3C};
export const P3Flat: React.FC<{variant?: 'A' | 'B'}> = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const seed = Math.floor(f / theme.boilEvery) * 7;

  const T = {c12: 0, c13: cutStart('C13') - G0, c14: cutStart('C14') - G0, c15: cutStart('C15') - G0, c16: cutStart('C16') - G0};

  /* ── 도입: P2 끝 실루엣 안으로 푸시인 → 허공 카메라가 같은 방향으로 계속 파고듦 ── */
  const pushZ = F(f, 0, 90, 1.4, 9, Easing.bezier(0.55, 0, 0.9, 1));
  const pushCy = F(f, 0, 90, 400, 340, Easing.bezier(0.55, 0, 0.9, 1));
  const voidIn = F(f, 40, 100, 0, 1);
  const showHead = f < 102;

  /* ── C12: 수많은 접힌 기억 사이를 빠르게 다이브 → 급브레이크, 하나에 줌인 ── */
  const MX = 760, MY = 400;
  const diveRaw = F(f, 40, 96, 0, 1.55, Easing.bezier(0.5, 0, 0.9, 0.6));
  const brake = spring({frame: f - 96, fps, config: {damping: 8, stiffness: 90, mass: 1}});
  const camZ = f < 96 ? diveRaw : 1.55 + 0.15 * Math.min(1.2, brake);       // 1.7 에서 선택된 기억이 scale 1
  const NM = 70;

  /* ── 허공 카메라 (+ 멈추지 않는 느린 드리프트) ── */
  // C15+20~110: 청사진에 가려진 동안 기억 쪽으로 줌인(1.15→1.38, 중심 y335 = 輝 상단 여유) → 돌아오면 이미 가까움 → C16 펼쳐지며 안으로
  const K = [40, T.c13 - 4, T.c13, T.c13 + 60, T.c14, T.c14 + 50, T.c15, T.c15 + 10, T.c15 + 20, T.c15 + 110, T.c16, T.c16 + 60, END];
  const drift = 1 - F(f, T.c16, T.c16 + 60, 0, 1);
  const vcxBase = interpolate(f, K, [700, 700, 700, 600, 600, 520, 520, 600, 600, 700, 700, 700, 700], {...clamp, easing: soft}) + Math.sin(f / 90) * 12 * drift;
  const vcyBase = interpolate(f, K, [390, 390, 390, 380, 380, 320, 320, 380, 380, 335, 335, 335, 335], {...clamp, easing: soft}) + Math.cos(f / 70) * 8 * drift;
  const vzBase = interpolate(f, K, [1.3, 1.3, 1.3, 1.1, 1.1, 1.55, 1.55, 1.15, 1.15, 1.38, 1.38, 1.38, 1.38], {...clamp, easing: soft});
  // C16+6~56: 종이가 펴지는 순간 사진 프레임 안쪽으로 훅 (1.38 → 2.3, 중심을 종이로) → 촛불(x430)·輝는 앵글 밖으로. 이후 아주 천천히 더 들어감
  const pushIn = F(f, T.c16 + 6, T.c16 + 44, 0, 1, Easing.bezier(0.2, 0.85, 0.25, 1));   // 38f 만에 — 촛불 빨리 퇴장
  const creep = F(f, T.c16 + 56, END, 0, 1, Easing.linear);
  const vz0 = vzBase + (2.3 - vzBase) * pushIn + 0.06 * creep;   // 2.3 + 중심 x750: 촛불 오른쪽 변(x463)은 밖(-20px), 종이 300h는 위아래 10px 여유
  const vcx0 = vcxBase + (750 - vcxBase) * pushIn;   // 종이 중심(PCX 740)보다 10 오른쪽 — 촛불 완전 프레임아웃용
  const vcy0 = vcyBase + (392 - vcyBase) * pushIn;
  const vz = vz0, vcx = vcx0, vcy = vcy0;
  // C15 +4~24f: 촛불 불꽃에서 검은 원(AI의 시선)이 고리처럼 퍼져 나와 화면을 덮음 — C13·14 빛 파문의 어휘. 줌·컷 ✗
  const FLAME: [number, number] = [430, 262];   // 불꽃 중심 (촛불 바닥 480 − 168 − 50)
  const flameSX = width / 2 + (FLAME[0] - vcx) * vz, flameSY = height / 2 + (FLAME[1] - vcy) * vz;
  const irisR = F(f, T.c15 + 4, T.c15 + 26, 0, 1500, Easing.bezier(0.55, 0, 0.35, 1));

  /* ── 재료 ── */
  const flapL = spring({frame: f - (T.c16 + 8), fps, config: {damping: 8, stiffness: 120, mass: 1}});
  const flapR = spring({frame: f - (T.c16 + 14), fps, config: {damping: 8, stiffness: 120, mass: 1}});
  const unfold = Math.max(flapL, 0);
  const tint = F(f, T.c16 + 60, T.c16 + 130, 0, 1);
  const brighten = F(f, T.c16 + 40, T.c16 + 110, 0, 1);
  const blast = F(f, T.c14 + 10, T.c14 + 70, 0, 1, Easing.bezier(0.1, 0.7, 0.2, 1));   // C14 빛 파도
  const paperVoid = f < T.c14 ? interpolateColors(f, [T.c13 + 70, T.c13 + 200], [C.void, C.voidWarm])
    : interpolateColors(blast, [0, 1], [C.voidWarm, C.plum]);
  const paper = f < T.c16 + 40 ? paperVoid : interpolateColors(brighten, [0, 1], [C.plum, C.cream]);
  const ink = interpolateColors(brighten, [0, 1], [C.chalk, C.ink]);
  const bg = showHead ? interpolateColors(voidIn, [0, 1], [P2C.kraftDark, paper]) : paper;

  /* ── C13: 컨베이어(빠른 결과물) 휙 → 한 점으로 모여 촛불로 → 기울여 다가감 ── */
  const belt = F(f, T.c13 + 4, T.c13 + 14, 0, 1) * F(f, T.c13 + 48, T.c13 + 66, 1, 0);
  const converge = F(f, T.c13 + 34, T.c13 + 58, 0, 1, Easing.bezier(0.5, 0, 0.9, 1));
  const CX = 430, CY = 480, FX = CX, FY = CY - 200;
  const born = spring({frame: f - (T.c13 + 56), fps, config: {damping: 6, stiffness: 130, mass: 1}});   // 0 → ~1.2 → 1 띠용
  const bornS = Math.min(1.22, born);
  const bornSy = bornS * (1 + Math.sin(Math.min(1, born) * Math.PI) * 0.12);           // 세로로 쭉 늘었다가
  const bornSx = Math.max(0.01, bornS * (1 - (bornSy / Math.max(0.01, bornS) - 1) * 0.7));  // 가로는 그만큼 눌림(스쿼시)
  const lean = F(f, T.c13 + 96, T.c13 + 130, 0, 1, inOut) * F(f, T.c13 + 176, T.c13 + 206, 1, 0, inOut);
  const litS = spring({frame: f - (T.c13 + 70), fps, config: {damping: 7, stiffness: 190, mass: 0.8}});
  const lit = Math.min(1.3, litS);   // 불꽃 팟! (스케일은 1.3까지 오버슈트, 투명도는 Candle 안에서 1로 클램프)
  const glowIn = (i: number) => F(f, T.c13 + 76 + i * 12, T.c13 + 116 + i * 12, 0, 1, Easing.bezier(0.2, 0.7, 0.3, 1));
  const glowK = (1 - brighten * 0.6) * (1 - pushIn);   // 줌인하면 촛불 빛도 앵글 밖으로
  const pulse = 1 + Math.sin(f / 9) * 0.035 + (rand(Math.floor(f / 2), 4) - 0.5) * 0.03;
  const push = F(f, T.c13 + 76, T.c13 + 140, 0, 70, Easing.bezier(0.2, 0.7, 0.3, 1));
  const bobY = Math.sin(f / 38) * 7, bobR = Math.sin(f / 55) * 6, flip = Math.cos(f / 45);
  /* ── C14: 불씨 탁 → 빛 파도 → 輝가 불꽃에서 꽃처럼 ── */
  const NS = 26;
  const sparkBurst = F(f, T.c14 + 4, T.c14 + 30, 0, 1, Easing.bezier(0.1, 0.7, 0.3, 1));
  const hwiP = F(f, T.c14 + 30, T.c14 + 104, 0, 1, theme.ease.draw);
  const bloom = F(f, T.c14 + 24, T.c14 + 90, 0, 1, Easing.bezier(0.2, 0.8, 0.3, 1));
  const hwiO = F(f, T.c16, T.c16 + 40, 1, 0);
  const HX = 680, HY = 190, HL = 1800;   // HL: 輝 윤곽 총 길이 (150px, 실측: 3200이면 62%에 다 그려짐 → 1800)
  const big = spring({frame: f - (T.c14 + 100), fps, config: {damping: 6, stiffness: 120}});
  const pulseBig = 1 + Math.sin(Math.min(1, big) * Math.PI) * 0.18;
  /* ── C15: 파란 스캐너 광선이 튕겨 나감 → 랜턴이 불씨(질문)를 불어 보냄 ── */
  // 청사진(AI가 읽는 세계): +18 하드컷 인 → +100~124 접힌 기억으로 쪼그라들며 룸 복귀 (매치컷)
  const BP = {paper: '#141418', line: '#EAF2FA', log: '#B9C4D6', err: '#E0514A'};   // 검은 종이 + 흰 선 + 타자기 처리 로그 (C08 캡션의 회수)
  const LOG = [
    '> load   photo_0427.jpg   1024x684   RGB', '> 01101000 01101111 01110101 01110011 01100101', '> detect  house        conf 0.96', '> detect  human x3     conf 0.91',
    '> detect  tree x2      conf 0.94', '> detect  sun          conf 0.88', '> segment sky / ground / object', '> 01110100 01110010 01100101 01100101',
    '> color        none', '> depth        none', '! temperature  null', '! emotion      unknown', '> 01101101 01100101 01101101', '! memory       not found', '> _',
  ];   // '!' 로 시작하는 줄 = 빨간 에러 로그 (AI가 못 읽는 것)
  const logChars = Math.max(0, (f - (T.c15 + 22)) * 10);   // 타다닥: ~55f 에 'memory not found' 까지
  const bpFreeze = f >= T.c15 + 100;                          // 탁! 정지 — 타이핑·점멸 멈춤
  const bpFlash = (f >= T.c15 + 100 ? 1 : 0) * F(f, T.c15 + 100, T.c15 + 106, 0.9, 0);      // 정지 순간 흰 플래시 (clamp 때문에 시작 전 0 보장)
  const logCursor = !bpFreeze && Math.floor(f / 8) % 2 === 0 ? '▍' : '';
  const bpO = (f >= T.c15 + 4 ? 1 : 0) * F(f, T.c15 + 116, T.c15 + 124, 1, 0);
  const bpSettle = 1;
  const bpBack = F(f, T.c15 + 106, T.c15 + 124, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));   // 정지(100~106) 뒤 접힌 기억으로 훅
  const memSX = width / 2 + (MX - vcx0) * vz0, memSY = height / 2 + (MY - vcy0) * vz0;   // 접힌 기억의 화면 좌표
  const bpS = 1 + (36 * vz0 / width - 1) * bpBack;
  const bpTx = (memSX - width / 2) * bpBack, bpTy = (memSY - height / 2) * bpBack;
  const bpLabel = (i: number) => (f >= T.c15 + 30 + i * 3 ? 1 : 0) * (bpFreeze ? 1 : Math.floor((f - i * 3) / 5) % 2 ? 1 : 0.45);   // 3f 간격으로 꽂힘, 건조한 점멸
  // 불씨(질문): 룸 복귀 직후 촛불에서 분리 — 72f 동안 공중에 둥둥 떠가듯 천천히, 베지어 + 미세한 흔들림
  const LAND = T.c15 + 196;
  const travel = F(f, T.c15 + 124, LAND, 0, 1, Easing.bezier(0.42, 0, 0.18, 1));
  const floatY = Math.sin(f / 5.5) * 4 * Math.sin(travel * Math.PI);
  const ex = (1 - travel) ** 2 * FX + 2 * (1 - travel) * travel * 560 + travel ** 2 * MX;
  const ey = (1 - travel) ** 2 * (FY - 30) + 2 * (1 - travel) * travel * 200 + travel ** 2 * (MY - 22) + floatY;
  const emberO = F(f, T.c15 + 124, T.c15 + 134, 0, 1) * F(f, T.c16, T.c16 + 10, 1, 0);
  const landK = spring({frame: f - LAND, fps, config: {damping: 6, stiffness: 200}});
  const bumpK = f >= LAND ? Math.sin(Math.min(1, landK) * Math.PI) : 0;
  const crack = F(f, LAND + 4, LAND + 36, 0, 1, inOut) * (1 - Math.min(1, unfold));
  const puff = F(f, LAND, LAND + 34, 0, 1, Easing.bezier(0.1, 0.6, 0.3, 1));
  const thread = Math.min(1.05, spring({frame: f - (LAND + 20), fps, config: {damping: 9, stiffness: 40}})) * F(f, T.c16, T.c16 + 20, 1, 0);
  /* ── C16: 디오라마 폭발 ── */
  const PCX = 740, PCY = 390;
  const grow = 1 + unfold * 6;
  const swapO = F(unfold, 0.25, 0.5, 0, 1);
  // 팝업북: 종이 아랫변(PCY+150)을 경첩으로 rotateX 90°(누움) → 0°(섬). 스프링이라 살짝 넘어갔다 돌아옴
  const popUp = spring({frame: f - (T.c16 + 6), fps, config: {damping: 9, stiffness: 95, mass: 1}});
  const rotX = 90 * (1 - popUp);
  const voidTf = `translate(${width / 2} ${height / 2}) scale(${vz}) translate(${-vcx} ${-vcy})`;
  const hingeX = width / 2 + (PCX - vcx) * vz, hingeY = height / 2 + (PCY + 150 - vcy) * vz;   // 경첩의 화면 좌표

  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      {P3CUTS.map((c) => (
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
            <feComponentTransfer><feFuncA type="linear" slope={0.92} /></feComponentTransfer>
          </filter>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={seed + 90} />
            <feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .12 0" />
          </filter>
          <filter id="brush" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={3} seed={11} />
            <feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .6  0 0 0 .10 0" />
          </filter>
          <clipPath id="flapLClip"><rect x={PCX - 240} y={PCY - 160} width={243} height={320} /></clipPath>
          <clipPath id="flapRClip"><rect x={PCX} y={PCY - 160} width={240} height={320} /></clipPath>
        </defs>
        <rect width={width} height={height} filter="url(#brush)" />

        {/* ── 도입: P2 실루엣 (푸시인) ── */}
        {showHead && (
          <g opacity={1 - voidIn}>
            <g transform={`translate(${width / 2} ${height / 2}) scale(${pushZ}) translate(-1000 ${-pushCy})`}>
              <Head x={1000} y={430} ink={P2C.charcoal} p={1} />
            </g>
            <rect width={width} height={height} fill={P2C.deep} opacity={0.45} />
          </g>
        )}

        {/* ── 머릿속 허공 ── */}
        {f >= 40 && (
          <g opacity={voidIn} transform={voidTf}>
            {/* C14 빛 파도: 화면 전체로 쫙 (계단식 3겹) */}
            {blast > 0 && blast < 1 && [0, 0.12, 0.24].map((d, i) => {
              const w = Math.max(0, Math.min(1, (blast - d) / (1 - d)));
              return w > 0 && <circle key={'b' + i} cx={FX} cy={FY - 30} r={20 + 1500 * w} fill="none" stroke={C.amber} strokeWidth={26 - i * 6} opacity={0.35 * (1 - w)} filter="url(#chalk)" />;
            })}

            {/* 초크 가루: 두 층(패럴랙스), 촛불에 밀려나고, 밝아지면 색 종이가루로 */}
            {Array.from({length: 46}).map((_, i) => {
              const r = rand(i, 1), r2 = rand(i, 2), deep = i % 2 === 0;
              const sp = deep ? 0.5 : 1;
              let x = 60 + r * 1180 + Math.sin(f / (60 * sp) + i) * 14 * sp + (f * 0.12 * sp) % 40;
              let y = 60 + r2 * 680 + Math.cos(f / (75 * sp) + i * 2) * 10 * sp - (f * 0.08 * sp) % 30;
              const dx = x - FX, dy = y - (FY - 30), dist = Math.hypot(dx, dy) || 1;
              const k = push * Math.min(1, 260 / dist);
              x += (dx / dist) * k; y += (dy / dist) * k;
              const col = brighten > 0 ? [C.pink, C.sky, C.green, C.amber][i % 4] : C.chalk;
              return <circle key={i} cx={x} cy={y} r={(1.2 + rand(i, 3) * 1.8) * (deep ? 0.8 : 1.2) * (1 + brighten * 1.2)}
                fill={col} opacity={(0.18 + rand(i, 4) * 0.3) * (deep ? 0.7 : 1) * (1 - brighten * 0.3) * F(f, 100, 130, 0, 1)} />;
            })}

            {/* C12 다이브: 수많은 접힌 기억을 스쳐 지나감 (원근 = 1/(d - camZ)) */}
            {f < 128 && Array.from({length: NM}).map((_, i) => {
              const d = 0.3 + rand(i, 51) * 2.3, ox = -500 + rand(i, 52) * 2300, oy = -400 + rand(i, 53) * 1500;
              const dz = d - camZ;
              if (dz < 0.08) return null;
              const sc = Math.min(7, 1 / dz);
              if (sc < 0.12) return null;
              const x = vcx + (ox - vcx) * sc, y = vcy + (oy - vcy) * sc;
              const o = Math.min(1, (sc - 0.12) * 3) * Math.min(1, Math.max(0, (7 - sc) / 2.5)) * 0.9 * F(f, 96, 126, 1, 0);   // 브레이크(96) 뒤 30f 동안 흩어지며 사라짐 — 선택된 한 장(hero)만 남음
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${rand(i, 54) * 360 + f * (rand(i, 55) - 0.5) * 2}) scale(${sc})`} opacity={o}>
                  <Shape d={rr(-18, -12, 36, 24, 3)} fill={C.memory} stroke={C.chalk} sw={2} off={[1, -1]} />
                </g>
              );
            })}

            {/* C13 컨베이어: 차가운 결과물이 휙 지나가다 한 점으로 모임 */}
            {belt > 0 && (
              <g opacity={belt}>
                <rect x={-200} y={CY - 26} width={1800 * F(f, T.c13 + 4, T.c13 + 16, 0, 1)} height={30} fill={C.chalkDim} opacity={0.5} />
                {Array.from({length: 14}).map((_, i) => {
                  const bx0 = ((i * 140 + (f - T.c13) * 42) % 1900) - 300;
                  const x = bx0 + (CX - bx0) * converge, y = CY - 60 + (FY - 20 - (CY - 60)) * converge;
                  return (
                    <g key={i} transform={`translate(${x} ${y}) scale(${1 - converge * 0.9})`}>
                      <Shape d={rr(-28, -20, 56, 40, 4)} fill={C.void} stroke={C.sky} sw={2} off={[1, -1]} />
                      <rect x={-20} y={-12} width={40} height={20} fill={C.sky} opacity={0.5} />
                    </g>
                  );
                })}
              </g>
            )}

            {/* 촛불 빛: 파문처럼 한 겹씩 */}
            {[[330, 0.05], [210, 0.10], [110, 0.2]].map(([r, o], i) => {
              const g = glowIn(2 - i);
              return g > 0 && <circle key={i} cx={FX} cy={FY - 30} r={r * g * pulse * pulseBig * (1 + blast * 0.5)} fill={C.amber} opacity={o * g * glowK} filter="url(#chalk)" />;
            })}
            {[0, 1, 2].map((i) => {
              const w = F(f, T.c13 + 74 + i * 16, T.c13 + 134 + i * 16, 0, 1, Easing.bezier(0.1, 0.6, 0.3, 1));
              return w > 0 && w < 1 && <circle key={'w' + i} cx={FX} cy={FY - 30} r={40 + 520 * w} fill="none" stroke={C.amber} strokeWidth={3} opacity={0.35 * (1 - w)} filter="url(#wob)" />;
            })}

            {/* 촛불: 한 점에서 젤리로 태어나 기울여 다가감 (눈 없음) */}
            {born > 0 && (
              <g transform={`translate(${CX} ${CY}) rotate(${lean * 14}) scale(${bornSx} ${Math.max(0.01, bornSy)}) translate(${-CX} ${-CY})`}>
                <Candle x={CX} y={CY} ink={ink} flick={f} lit={lit} />
              </g>
            )}

            {/* C14: 불씨 탁 (방사 파티클) */}
            {sparkBurst > 0 && sparkBurst < 1 && Array.from({length: 16}).map((_, i) => {
              const a = rand(i, 61) * Math.PI * 2, d = 20 + sparkBurst * (90 + rand(i, 62) * 120);
              return <circle key={i} cx={FX + Math.cos(a) * d} cy={FY - 30 + Math.sin(a) * d - sparkBurst * 40} r={2.5 + rand(i, 63) * 3} fill={i % 2 ? C.amber : C.core} opacity={0.95 * (1 - sparkBurst)} />;
            })}
            {/* 불티 → 輝 */}
            {f >= T.c14 + 8 && hwiO > 0 && Array.from({length: NS}).map((_, i) => {
              const t0 = T.c14 + 8 + rand(i, 11) * 64, t = F(f, t0, t0 + 34, 0, 1, Easing.bezier(0.2, 0.6, 0.4, 1));
              if (t <= 0 || t >= 1) return null;
              const tx = HX - 70 + rand(i, 12) * 140, ty = HY - 70 + rand(i, 13) * 140;
              const x = FX + (tx - FX) * t + Math.sin(t * Math.PI) * (rand(i, 14) - 0.5) * 120;
              const y = (FY - 30) + (ty - (FY - 30)) * t - Math.sin(t * Math.PI) * 80;
              return <circle key={i} cx={x} cy={y} r={2 + rand(i, 15) * 3} fill={i % 3 ? C.amber : C.hwi} opacity={0.9 * (1 - t * 0.5)} />;
            })}
            {hwiP > 0 && hwiO > 0 && (() => {
              const gx = FX + (HX - FX) * bloom, gy = (FY - 30) + (HY - (FY - 30)) * bloom, gs = (0.15 + 0.85 * bloom) * pulseBig;
              return (
                <g opacity={hwiO} filter="url(#wob)" transform={`translate(${gx} ${gy}) scale(${gs}) translate(${-HX} ${-HY})`}>
                  {/* 글리프 윤곽을 붓글씨 쓰듯: dash 길이가 0 → HL 로 자람 (gap 은 항상 전체보다 길게) */}
                  <text x={HX} y={HY} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={150} fontWeight={500}
                    fill="none" stroke={C.hwi} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
                    strokeDasharray={`${hwiP * HL} ${HL * 2}`}>輝</text>
                  <text x={HX} y={HY} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={150} fontWeight={500}
                    fill={C.hwi} opacity={0.22 * F(hwiP, 0.72, 1, 0, 1)}>輝</text>
                </g>
              );
            })()}

            {/* 선택된 접힌 기억: 둥둥·뒤집힘 → 스캐너에 밀림 → 불씨 착지에 튕김 → 벌어짐 → (C16) 커지며 사라짐 */}
            {swapO < 1 && f >= 66 && (() => {
              // hero: 다이브 무리 중 하나 (d 2.8, 원점 775/402 → camZ 1.55 에서 MX/MY 근처, scale 0.8) → 브레이크 뒤 96~130f 에 제자리(MX,MY,1)로 미끄러져 멈춤
              const hz = 2.8 - camZ, hsc = hz > 0.08 ? Math.min(7, 1 / hz) : 7;
              const hx = vcx + (775 - vcx) * hsc, hy = vcy + (402 - vcy) * hsc;
              const k = F(f, 96, 130, 0, 1, soft);
              const px = hx + (MX - hx) * k, py = hy + (MY - hy) * k, ps = hsc + (1 - hsc) * k;
              const flipK = crack > 0 ? 1 : (1 - k) + k * Math.max(0.25, Math.abs(flip));
              return (
                <g transform={`translate(${px} ${py + (bobY - bumpK * 14) * k}) rotate(${bobR * k}) scale(${ps * (1 + bumpK * 0.3) * grow * flipK} ${ps * (1 + bumpK * 0.3) * grow})`} opacity={(1 - swapO) * F(f, 66, 80, 0, 1)}>
                  <Memory ink={ink} crack={crack} />
                </g>
              );
            })()}
            {/* 가루 퍽 */}
            {puff > 0 && puff < 1 && Array.from({length: 10}).map((_, i) => {
              const a = rand(i, 31) * Math.PI * 2, d = 20 + puff * (40 + rand(i, 32) * 50);
              return <circle key={i} cx={MX + Math.cos(a) * d} cy={MY + bobY + Math.sin(a) * d} r={2 + rand(i, 33) * 2} fill={C.amber} opacity={0.7 * (1 - puff)} />;
            })}
            {/* 실 한 가닥 (오버슈트) */}
            {thread > 0 && <Line d={`M${MX - 2},${MY - 10 + bobY} q-8,-26 -26,-34 q-24,-10 -18,-34 q6,-20 -10,-30 q-14,-8 -12,-22`} p={thread} stroke={C.amber} sw={3} o={0.95} />}

            {/* C15 불씨(질문): 랜턴이 불어 보냄 — 베지어로 사뿐히 */}
            {emberO > 0 && (
              <g opacity={emberO}>
                {[0.08, 0.16, 0.24].map((k, i) => {
                  const tt = Math.max(0, travel - k);
                  const px = (1 - tt) ** 2 * FX + 2 * (1 - tt) * tt * 560 + tt ** 2 * MX;
                  const py = (1 - tt) ** 2 * (FY - 30) + 2 * (1 - tt) * tt * 200 + tt ** 2 * (MY - 22);
                  return travel > k && travel < 1 && <circle key={i} cx={px} cy={py} r={6 - i * 1.5} fill={C.amber} opacity={0.5 - i * 0.12} />;
                })}
                <circle cx={ex} cy={ey} r={14 * (1 + Math.sin(f / 4) * 0.08)} fill={C.amber} opacity={0.7} filter="url(#chalk)" />
                <circle cx={ex} cy={ey} r={7} fill={C.core} />
              </g>
            )}

          </g>
        )}
        {/* C15 아이리스 고리: 검은 원의 가장자리 (바깥 절반만 보임) */}
        {irisR > 0 && irisR < 1500 && (
          <circle cx={flameSX} cy={flameSY} r={irisR + 3} fill="none" stroke={BP.line} strokeWidth={6} opacity={0.85 * F(irisR, 1000, 1400, 1, 0)} filter="url(#wob)" />
        )}
      </svg>

      {/* ── C15 청사진: 촛불(AI) 속으로 들어가 본 세계 — 색·채움 없는 흰 선, 모눈, 라벨 점멸. 돌아올 땐 접힌 기억으로 쪼그라듦 ── */}
      {bpO > 0 && (
        <AbsoluteFill style={{opacity: bpO, transform: `translate(${bpTx}px, ${bpTy}px) scale(${bpS})`, transformOrigin: 'center', pointerEvents: 'none',
          clipPath: irisR < 1500 ? `circle(${irisR}px at ${flameSX}px ${flameSY}px)` : undefined}}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block'}}>
            <rect width={width} height={height} fill={BP.paper} />
            {/* 처리 로그: 왼쪽 위에서 한 글자씩 타이핑 (선화 뒤, 읽기를 해치지 않게 옅게) */}
            {(() => { let left = logChars; return LOG.map((line, i) => {
              const n = Math.max(0, Math.min(line.length, left)); left -= line.length;
              if (n <= 0) return null;
              const cur = n < line.length ? logCursor : '';
              const err = line.startsWith('!');
              return <text key={i} x={44} y={64 + i * 26} fontFamily="'American Typewriter', 'Courier New', monospace" fontSize={15} fill={err ? BP.err : BP.log} opacity={err ? 0.8 : 0.32}>{line.slice(0, n) + cur}</text>;
            }); })()}
            {/* 오른쪽: 이진수 스트림 (더 옅게) */}
            {Array.from({length: 14}).map((_, i) => {
              const row = Array.from({length: 8}).map((_, k) => (rand(i * 8 + k + Math.floor((f - i * 3) / 20), 77) > 0.5 ? '1' : '0')).join('');
              const o = 0.14 * F(f, T.c15 + 24 + i * 5, T.c15 + 34 + i * 5, 0, 1);
              return <text key={'b' + i} x={1040} y={64 + i * 26} fontFamily="'American Typewriter', 'Courier New', monospace" fontSize={15} fill={BP.log} opacity={o}>{row}</text>;
            })}
            <g transform={`translate(640 400) scale(${2.0 * bpSettle}) translate(-640 -400)`}>
              <StageB f={f} fps={fps} ink={BP.line} base={0} cx={640} cy={520} tint={0} wire />
              {/* AI 라벨: 점선 박스 + 건조한 텍스트 (C09 라벨의 회수) */}
              {([[476, 402, 122, 90, 'HOUSE', 0], [584, 406, 122, 76, 'HUMAN ×3', 1], [706, 410, 110, 78, 'TREE ×2', 2], [736, 346, 70, 70, 'SUN', 3]] as const).map(([x, y, w, h, t, i]) => {
                const o = bpLabel(i);
                return o > 0 && (
                  <g key={t} opacity={o}>
                    <rect x={x} y={y} width={w} height={h} fill="none" stroke={BP.line} strokeWidth={1.5} strokeDasharray="6 5" />
                    <rect x={x} y={y - 16} width={t.length * 6.2 + 8} height={14} fill={BP.line} opacity={0.9} />
                    <text x={x + 4} y={y - 5} fontFamily={theme.font.sans} fontSize={9} fontWeight={600} fill={BP.paper} letterSpacing={0.8}>{t}</text>
                  </g>
                );
              })}
            </g>
            {bpFlash > 0 && <rect width={width} height={height} fill={BP.line} opacity={bpFlash} />}
            <rect width={width} height={height} filter="url(#grain)" />
          </svg>
        </AbsoluteFill>
      )}

      {/* ── C16 디오라마: 별도 레이어에 CSS 3D — 종이가 팝업북처럼 rotateX 로 일어섬 ── */}
      {unfold > 0 && (
        <AbsoluteFill style={{perspective: 900, perspectiveOrigin: `${hingeX}px ${hingeY - 120}px`, pointerEvents: 'none'}}>
          <div style={{width, height, transform: `rotateX(${rotX}deg)`, transformOrigin: `${hingeX}px ${hingeY}px`, transformStyle: 'preserve-3d'}}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block'}}>
              <g transform={voidTf}>
                {/* 종이가 순식간에 펼쳐짐 (좌 → 우) */}
                <g opacity={swapO}>
                  {flapR >= 0.98 ? (
                    <rect x={PCX - 230} y={PCY - 150} width={460} height={300} fill={C.bubble} stroke={ink} strokeWidth={2} filter="url(#wob)" />
                  ) : (<>
                  <g clipPath="url(#flapLClip)" transform={`translate(${PCX} ${PCY}) scale(${Math.min(1.06, flapL)} 1) translate(${-PCX} ${-PCY})`}>
                    <rect x={PCX - 230} y={PCY - 150} width={460} height={300} fill={C.bubble} stroke={ink} strokeWidth={2} filter="url(#wob)" />
                  </g>
                  <g clipPath="url(#flapRClip)" transform={`translate(${PCX} ${PCY}) scale(${Math.max(0, Math.min(1.06, flapR))} 1) translate(${-PCX} ${-PCY})`}>
                    <rect x={PCX - 230} y={PCY - 150} width={460} height={300} fill={C.bubble} stroke={ink} strokeWidth={2} filter="url(#wob)" />
                  </g>
                  </>)}
                </g>
                {/* 흑백 팝업 → 수채 컬러 번짐 → 시계·새 움직임 */}
                {flapR > 0.5 && <StageB f={f} fps={fps} ink={ink} base={T.c16 - 36} cx={PCX} cy={PCY + 150} tint={tint} speed={0.75} />}
              </g>
            </svg>
          </div>
        </AbsoluteFill>
      )}

      {/* 종이 알갱이는 맨 위에 */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block', position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
      {P3CUTS.map((c) => (
        <Sequence key={'s' + c.id} from={c.start - G0} durationInFrames={c.duration} name={'sub ' + c.id}>
          <Subtitle cut={c} />
        </Sequence>
      ))}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 60%, rgba(20,10,30,0.18) 100%)'}} />
    </AbsoluteFill>
  );
};
