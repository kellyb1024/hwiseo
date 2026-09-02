import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring, Easing, delayRender, continueRender} from 'remotion';
import {Subtitle} from '../components/Stage';
import {rand} from '../components/Draw';
import {CUTS, cutStart, cutDur, partDur} from '../cuts';
import {theme} from '../theme';

/**
 * P2 플랫 — 한 캔버스, C06~C11 (전역 857~1851, 로컬 0~994).
 * 재료 블록: 3 (C06–07) 청록 물감 워시 + 흰 잉크 / 4 (C08–09) 모눈종이 + 도장 라벨 / 5 (C10–11) 크라프트 → 서랍 닫히며 어둠, 목탄.
 * 서사: 데이터의 바다(사진→폴더) → 로봇 → 스캔·라벨 → 온기 선이 라벨에 막힘 → 옆모습 머리 속 서랍이 열리고 장면이 빛남 → 푸시인, 접힘, 실타래, 서랍 닫힘, 침묵.
 */
const P2CUTS = CUTS.filter((c) => c.part === 'P2');
const G0 = cutStart('C06');                                   // 전역 시작 프레임
const END = partDur('P2');                            // 994

export const C = {
  teal: '#2C7A80', tealDeep: '#1F5C63', tealLight: '#8FC9C4', foam: '#F1EDE3',
  grid: '#EEF0E9', gridLine: '#B7C7D3', kraft: '#B8955F', kraftDark: '#5A4630', deep: '#0F1626',
  ink: '#4A3D52', charcoal: '#26201B', white: '#F3EEE4',
  folder: '#BFE3E0', folderTab: '#DDF1EE', cream: '#F7F1E3', grey: '#9A948E',
  orange: '#F08A4B', amber: '#E9A24A', pink: '#F2A6B8', sky: '#8FB3D9', green: '#B8D68A',
  stamp: '#C2453A', robot: '#D9DCE0', robotDark: '#9AA3AE', lensGlass: '#9FB3C8',
  skin: '#E9B994', hair: '#4A3D52', silhouette: '#2A2530', glow: '#FBE7B5', thread: '#EFE6D2',
};
const soft = theme.ease.soft, inOut = theme.ease.inOut;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const F = (f: number, a: number, b: number, v0: number, v1: number, e = soft) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} -${r},${r} h-${w - 2 * r} q-${r},0 -${r},-${r} v-${h - 2 * r} q0,-${r} ${r},-${r} z`;
/* 온기 물결선: (x0,y0)→(x1,y1) 방향으로 사인 굴곡 */
const wave = (x0: number, y0: number, x1: number, y1: number, amp = 9, waves = 3, n = 28) => {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, off = Math.sin(t * Math.PI * 2 * waves) * amp * (0.4 + 0.6 * t);
    d += `${i ? 'L' : 'M'}${x0 + dx * t + nx * off},${y0 + dy * t + ny * off} `;
  }
  return d;
};
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 -${2 * r},0`;

const useDecoded = (url: string) => {
  const [handle] = useState(() => delayRender(`decode ${url}`));
  useEffect(() => {
    const img = new Image(); img.src = url;
    img.decode().catch(() => undefined).finally(() => continueRender(handle));
  }, [url, handle]);
};

/* ── 손그림 도형: 채움은 살짝 어긋나게, 선은 삐뚤게 ── */
const Shape: React.FC<{d: string; fill?: string; stroke?: string; sw?: number; off?: [number, number]; opacity?: number; fillO?: number}> =
  ({d, fill = 'none', stroke, sw = 3, off = [3, -2], opacity = 1, fillO = 1}) => (
    <g opacity={opacity}>
      {fill !== 'none' && <path d={d} fill={fill} opacity={fillO} transform={`translate(${off[0]} ${off[1]})`} filter="url(#wob2)" />}
      {stroke && <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" filter="url(#wob)" />}
    </g>
  );

/* ── 선 그리기(draw-on): pathLength=1 로 정규화 ── */
const Line: React.FC<{d: string; p: number; stroke: string; sw?: number; o?: number; dashed?: boolean}> = ({d, p, stroke, sw = 4, o = 1, dashed}) =>
  p <= 0 ? null : (
    <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
      strokeDasharray={dashed ? `0.03 0.02` : 1} strokeDashoffset={dashed ? 0 : 1 - p} opacity={o} filter="url(#wob)"
      style={dashed ? {clipPath: undefined} : undefined} />
  );

/* ── 도장 라벨 ── */
const Stamp: React.FC<{x: number; y: number; text: string; p: number; rot?: number; ink: string}> = ({x, y, text, p, rot = 0, ink}) => {
  if (p <= 0) return null;
  const w = 26 + text.length * 15, h = 40;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={Math.min(1, p * 2)}>
      <path d={rr(-w / 2, -h / 2, w, h, 6)} fill={C.cream} opacity={0.85} />
      <path d={rr(-w / 2, -h / 2, w, h, 6)} fill="none" stroke={ink} strokeWidth={3} filter="url(#wob)" />
      <path d={rr(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 4)} fill="none" stroke={ink} strokeWidth={1.2} opacity={0.6} filter="url(#wob)" />
      <text x={0} y={7} textAnchor="middle" fontFamily={theme.font.sans} fontSize={20} fontWeight={500} fill={ink} letterSpacing={1.5}>{text}</text>
    </g>
  );
};

/* ── 폴더 ── */
const Folder: React.FC<{x: number; y: number; w: number; h: number; ink: string; o?: number}> = ({x, y, w, h, ink, o = 1}) => (
  <g opacity={o}>
    <Shape d={`M${x},${y + 8} h${w * 0.4} l8,-8 h${w * 0.3} l6,8 h${w * 0.3 - 14} v${h - 8} h-${w} z`} fill={C.folder} stroke={ink} sw={2} off={[2, -1]} />
  </g>
);

/* ── 기하학적 로봇 (오른쪽을 보는 AI). 발판 중앙 바닥이 원점 ── */
const Robot: React.FC<{x: number; y: number; ink: string; eye: number; tilt?: number; arm?: number; scale?: number}> = ({x, y, ink, eye, tilt = 0, arm = 0, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* 무한궤도 발판 */}
    <Shape d={rr(-70, -26, 140, 26, 13)} fill={C.robotDark} stroke={ink} sw={3} />
    {[-40, -12, 16, 44].map((k) => <circle key={k} cx={k} cy={-13} r={6} fill={ink} opacity={0.5} />)}
    {/* 몸통 */}
    <Shape d={rr(-52, -150, 104, 124, 8)} fill={C.robot} stroke={ink} sw={3} />
    <Shape d={rr(-30, -120, 60, 40, 4)} fill={C.robotDark} stroke={ink} sw={2} />
    {[-18, 0, 18].map((k) => <circle key={k} cx={k} cy={-66} r={5} fill={k === 0 ? C.stamp : ink} opacity={0.7} />)}
    {/* 팔 (왼쪽 = 화면 왼쪽으로 뻗음), 돋보기 */}
    <g transform={`translate(-52 -110) rotate(${-20 - arm * 40})`}>
      <Shape d={rr(-70, -10, 74, 20, 8)} fill={C.robotDark} stroke={ink} sw={2.5} />
      <Shape d={circle(-92, 0, 24)} fill={C.lensGlass} stroke={ink} sw={3} fillO={0.7} />
    </g>
    {/* 머리 */}
    <g transform={`translate(0 -150) rotate(${tilt})`}>
      <Shape d={rr(-46, -70, 92, 70, 10)} fill={C.robot} stroke={ink} sw={3} />
      <path d="M0,-70 v-26" stroke={ink} strokeWidth={3} filter="url(#wob)" />
      <circle cx={0} cy={-102} r={7} fill={C.stamp} opacity={0.6 + 0.4 * eye} />
      {/* 눈 하나 (렌즈) */}
      <Shape d={circle(-12, -36, 18)} fill={C.lensGlass} stroke={ink} sw={3} />
      <circle cx={-16} cy={-36} r={7} fill={ink} opacity={0.4 + 0.6 * eye} />
      <path d="M12,-22 h16" stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    </g>
  </g>
);

/* ── 옆모습 실루엣 (TED-Ed식 단색 덩어리, 왼쪽을 봄). 머리 중심이 원점, 반지름 ~200 ── */
export const Head: React.FC<{x: number; y: number; ink: string; p: number}> = ({x, y, ink, p}) => {
  const d = `M0,-200 Q140,-200 190,-80 Q220,40 170,140 Q140,190 145,260 L150,420 L-30,420 L-25,270 Q-60,250 -100,225 Q-130,205 -120,185 Q-135,170 -112,160 Q-140,145 -138,125 Q-150,110 -200,98 Q-205,70 -150,40 Q-145,10 -158,-40 Q-165,-120 -100,-170 Q-60,-200 0,-200 z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} fill={C.silhouette} opacity={F(p, 0.55, 1, 0, 1)} transform="translate(4 -3)" filter="url(#wob2)" />
      <Line d={d} p={p} stroke={ink} sw={4.5} />
    </g>
  );
};

/* ── 서랍 속 작은 장면 (생일) — 서랍 안 좌표계, 원점 = 서랍 좌상단 ── */
const MiniScene: React.FC<{w: number; h: number; ink: string; p: number}> = ({w, h, ink, p}) => {
  if (p <= 0) return null;
  const pop = (k: number) => Math.max(0, Math.min(1, (p - k * 0.18) / 0.5));
  const j = (k: number) => 1 + Math.sin(pop(k) * Math.PI) * 0.25;   // 젤리
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill={C.glow} opacity={Math.min(1, p * 1.5)} />
      {/* 케이크 */}
      <g transform={`translate(${w * 0.5} ${h * 0.8}) scale(${pop(0) * j(0)})`}>
        <Shape d={rr(-26, -22, 52, 22, 4)} fill={C.pink} stroke={ink} sw={2} off={[1, -1]} />
        {[-14, 0, 14].map((k) => <g key={k}><path d={`M${k},-22 v-12`} stroke={ink} strokeWidth={2} /><circle cx={k} cy={-38} r={4} fill={C.amber} /></g>)}
      </g>
      {/* 세 사람 */}
      {[[0.22, 0.42, C.sky], [0.5, 0.36, C.amber], [0.78, 0.44, C.green]].map(([px, py, col], i) => (
        <g key={i} transform={`translate(${w * (px as number)} ${h * (py as number)}) scale(${pop(i + 1) * j(i + 1)})`}>
          <Shape d={rr(-12, 10, 24, 30, 6)} fill={col as string} stroke={ink} sw={2} off={[1, -1]} />
          <Shape d={circle(0, 0, 13)} fill={C.skin} stroke={ink} sw={2} off={[1, -1]} />
          <path d="M-5,3 q5,5 10,0" stroke={ink} strokeWidth={1.5} fill="none" />
        </g>
      ))}
      {/* 풍선 */}
      <g transform={`translate(${w * 0.9} ${h * 0.28}) scale(${pop(4) * j(4)})`}>
        <path d="M0,14 q-4,20 -8,30" stroke={ink} strokeWidth={1.5} fill="none" />
        <Shape d={circle(0, 0, 13)} fill={C.orange} stroke={ink} sw={2} off={[1, -1]} />
      </g>
    </g>
  );
};

/* ═══════════════ 메인 ═══════════════ */
export const P2Flat: React.FC = () => {
  const g = useCurrentFrame();
  const f = g;                                     // 로컬 프레임 (컴포지션 P2flat 은 0부터)
  const {fps, width, height} = useVideoConfig();
  const seed = Math.floor(f / theme.boilEvery) * 7;
  const birthday = staticFile('img/pack/photo-01-birthday-v2.png');   // 2026-08-28 사용자 새 생일 사진(단체, Gemini) — 원본 Gemini_Generated_Image_ow8elmow8elmow8e.png(2528×1688), 1600px 사본
  useDecoded(birthday);

  /* 타임라인 (로컬) */
  const T = {c06: 0, c07: cutStart('C07') - G0, c08: cutStart('C08') - G0, c09: cutStart('C09') - G0, c10: cutStart('C10') - G0, c11: cutStart('C11') - G0};

  /* 카메라 */
  const K = [0, T.c06 + 110, T.c07, T.c07 + 60, T.c08, T.c08 + 50, T.c09 + 34, T.c09 + 90, T.c10 + 20, T.c10 + 90, T.c11, T.c11 + 70, T.c11 + 120, T.c11 + 150, END];
  const cx = interpolate(f, K, [640, 640, 640, 700, 700, 450, 450, 500, 560, 690, 690, 1000, 1000, 1000, 1000], {...clamp, easing: soft});
  const cy = interpolate(f, K, [60, 560, 560, 520, 520, 400, 400, 400, 420, 420, 420, 340, 340, 400, 400], {...clamp, easing: soft});
  const z = interpolate(f, K, [1.7, 1.0, 1.0, 1.05, 1.05, 1.3, 1.3, 1.15, 1.1, 0.95, 0.95, 3.2, 3.2, 1.4, 1.4], {...clamp, easing: soft});

  /* 재료: 종이색 / 선색 */
  const paper = f < T.c08 - 10 ? C.teal
    : f < T.c10 - 10 ? interpolateColors(f, [T.c08 - 10, T.c08 + 20], [C.teal, C.grid])
    : interpolateColors(f, [T.c10 - 10, T.c10 + 25, T.c11 + 126, END], [C.grid, C.kraft, C.kraft, C.kraftDark]);
  const ink = f < T.c08 - 10 ? C.white
    : f < T.c10 - 10 ? interpolateColors(f, [T.c08 - 10, T.c08 + 20], [C.white, C.ink])
    : interpolateColors(f, [T.c10 - 10, T.c10 + 25], [C.ink, C.charcoal]);
  const gridO = F(f, T.c08 - 10, T.c08 + 20, 0, 0.55) * F(f, T.c10 - 10, T.c10 + 25, 1, 0);
  const darkIn = F(f, 0, 24, 0.9, 0);                                  // P1 소용돌이 어둠에서 이어짐
  const darkOut = F(f, T.c11 + 126, END, 0, 0.45);
  const away = F(f, T.c11 + 152, END, 0, 1, Easing.bezier(0.35, 0, 0.75, 1));   // 닫힌 서랍이 머릿속으로 아득히
  const awayScale = 1 / (1 + 14 * away), awayO = 1 - F(away, 0.5, 1, 0, 1);   // 끝에서 완전히 사라져 P3와 이어짐

  /* ── C06: 사진이 가라앉으며 폴더로 ── */
  const NP = 42;
  const floorX = (i: number) => 110 + (i % 14) * 76, floorY = (i: number) => 640 + Math.floor(i / 14) * 58;
  const pileO = F(f, T.c08 + 50, T.c08 + 90, 1, 0);
  /* ── C07: 로봇 입장 ── */
  const robotIn = spring({frame: f - (T.c07 + 10), fps, config: {damping: 26, stiffness: 160, mass: 1}});   // 딱딱하게
  const robotX = 1500 - 640 * Math.min(1, robotIn);
  const eyeOn = F(f, T.c07 + 55, T.c07 + 62, 0, 1);
  const blink = ((f - T.c07) % 46) < 4 && f > T.c07 + 70 && f < T.c10 ? 0 : 1;
  /* ── C08: 폴더 하나가 떠올라 사진으로 펼쳐짐 → 스캔 → 라벨 ── */
  const PX = 140, PY = 120, PW = 600, PH = 400;   // 480×320→600×400: 새 크롭(#9)이 좁아 화면에서 너무 작아지지 않게 (2026-08-28)
  const rise = F(f, T.c08 + 4, T.c08 + 50, 0, 1, inOut);
  const scan = F(f, T.c08 + 44, T.c08 + 80, 0, 1, Easing.linear);
  const tagAt = [T.c08 + 84, T.c08 + 104, T.c08 + 124];
  const tag = (k: number) => spring({frame: f - tagAt[k], fps, config: {damping: 18, stiffness: 300, mass: 0.6}});
  /* ── C09: 온기 선이 밖으로 나가려다 라벨에 막힘 ── */
  /* 사진: C08엔 아이 중심 세로 크롭만 보임 → C09 "하지만" 에서 떨린 뒤 프레임이 펼쳐져 전체 공개 */
  const CROP = {x: 0.282, y: 0.265, w: 0.256, h: 0.633};   // 사용자 레퍼런스 #9 프레이밍(케이크 든 아이 + 보라 풍선) — 새 사진에서 템플릿 매칭
  const tremble = 0;
  const reveal = F(f, T.c09 + 34, T.c09 + 84, 0, 1, soft);
  const cropRect = (r: number) => ({
    x: PX + PW * CROP.x * (1 - r), y: PY + PH * CROP.y * (1 - r),
    w: PW * (CROP.w + (1 - CROP.w) * r), h: PH * (CROP.h + (1 - CROP.h) * r),
  });
  const headTilt = spring({frame: f - (T.c09 + 110), fps, config: {damping: 10, stiffness: 90}}) * 11;
  /* ── C10: 로봇 퇴장, 라벨 낙하, 머리·서랍 ── */
  const robotOut = F(f, T.c10 + 4, T.c10 + 40, 0, 1, Easing.bezier(0.6, 0, 1, 1));
  const tagFall = F(f, T.c10 + 12, T.c10 + 60, 0, 1, Easing.bezier(0.4, 0, 1, 1));
  const headP = F(f, T.c10 + 40, T.c10 + 110, 0, 1, theme.ease.draw);
  const HX = 1000, HY = 430;
  const DX = 910, DY = 290, DW = 180, DH = 100;                        // 서랍 (월드)
  const sceneP = F(f, T.c10 + 100, T.c10 + 150, 0, 1);
  /* C10 앞부분: 사진 아래 AI 설명 텍스트 타이핑 */
  const CAPTION = ['Indoor birthday party. A girl in a party hat', 'holds a cake with candles, smiling. 6 children,', "colorful balloons, 'HAPPY BIRTHDAY' banner, cups", 'and plates on the table.  Mood: joyful  ·  Confidence: 0.97'];   // 새 단체 사진 기준 (2026-08-28)
  const capChars = F(f, T.c10 + 16, T.c10 + 96, 0, CAPTION.join('').length, Easing.linear);
  const chatIn = spring({frame: f - (T.c10 + 4), fps, config: {damping: 8, stiffness: 150, mass: 0.7}});   // 채팅 말풍선 젤리 등장
  const capO = F(f, T.c11 + 20, T.c11 + 50, 1, 0);
  const link = F(f, T.c10 + 160, T.c10 + 210, 0, 1, soft);
  /* ── C11: 푸시인 → 접힘 → 실타래 → 닫힘 ── */
  const grey = F(f, T.c11 + 10, T.c11 + 54, 0, 1);                       // 장면이 회색으로
  const tangle = F(f, T.c11 + 44, T.c11 + 96, 0, 1, Easing.linear);     // 실로 엉망이 됨
  const drawerIn = F(f, T.c11 + 96, T.c11 + 122, 0, 1, inOut);   // P2 끝 정적 3.5→2.1s: 서랍 연출 압축 (사용자 02:50, 파트 간 텀 줄이기)          // 서랍이 나타나 장면을 담음
  const drawerClose = F(f, T.c11 + 126, T.c11 + 148, 0, 1, inOut);
  const panelY = drawerIn < 1 ? 160 - 88 * drawerIn : 72 * (1 - drawerClose);
  const innerDark = interpolateColors(grey, [0, 1], [C.glow, C.kraftDark]);

  /* 실타래 경로 (서랍 안 좌표) */
  const tanglePath = (() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 44; i++) pts.push([DW * 0.5 + (rand(i, 21) - 0.5) * DW * 0.7, DH * 0.55 + (rand(i, 22) - 0.5) * DH * 0.7]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const c = pts[i - 1], n = pts[i];
      d += ` Q${(c[0] + n[0]) / 2 + (rand(i, 23) - 0.5) * 40},${(c[1] + n[1]) / 2 + (rand(i, 24) - 0.5) * 40} ${n[0]},${n[1]}`;
    }
    return d;
  })();

  const showRobot = f >= T.c07 + 4 && robotOut < 1;
  const showPhoto = f >= T.c08 + 4;

  return (
    <AbsoluteFill style={{backgroundColor: paper}}>
      {P2CUTS.map((c) => (
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
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={seed + 90} />
            <feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .12 0" />
          </filter>
          <filter id="brush" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={3} seed={11} />
            <feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .15  0 0 0 0 .1  0 0 0 .14 0" />
          </filter>
          <pattern id="gridp" width={32} height={32} patternUnits="userSpaceOnUse">
            <path d="M32,0 V32 M0,32 H32" stroke={C.gridLine} strokeWidth={1} fill="none" />
          </pattern>
          <filter id="desat"><feColorMatrix type="saturate" values={String(1 - grey)} /></filter>
          <clipPath id="drawerClip"><rect x={DX} y={DY} width={DW} height={DH} /></clipPath>
          <clipPath id="photoClip"><rect x={cropRect(reveal).x} y={cropRect(reveal).y} width={cropRect(reveal).w} height={cropRect(reveal).h} /></clipPath>
        </defs>
        {/* 붓질 워시 / 모눈 */}
        <rect width={width} height={height} filter="url(#brush)" />
        <rect width={width} height={height} fill="url(#gridp)" opacity={gridO} />

        <g transform={`translate(${width / 2} ${height / 2}) scale(${z}) translate(${-cx} ${-cy})`}>
          {/* ── 바다: 수면 + 거품 (C06~C07) ── */}
          {f < T.c08 + 20 && (
            <g opacity={F(f, T.c08 - 10, T.c08 + 20, 1, 0)}>
              <rect x={-400} y={-600} width={2100} height={640} fill={C.tealLight} opacity={0.35} />
              <Line d="M-300,40 q60,-18 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0" p={1} stroke={C.white} sw={3.5} />
              {Array.from({length: 14}).map((_, i) => {
                const r = rand(i, 5), yy = 700 - ((f * (0.8 + r * 1.2) + r * 600) % 760);
                return <circle key={i} cx={80 + r * 1120 + Math.sin(f / 20 + i) * 8} cy={yy} r={3 + rand(i, 6) * 6} fill="none" stroke={C.white} strokeWidth={1.5} opacity={0.5} />;
              })}
            </g>
          )}

          {/* ── 사진 → 폴더 (C06) ── */}
          {Array.from({length: NP}).map((_, i) => {
            const r1 = rand(i, 1), r2 = rand(i, 2), r3 = rand(i, 3);
            const t = F(f, 6 + r1 * 36, 96 + r2 * 26, 0, 1, Easing.bezier(0.3, 0, 0.7, 1));
            if (t <= 0) return null;
            const m = F(t, 0.35, 0.8, 0, 1, inOut);
            const sx = 640 + (r3 - 0.5) * 240, sy = -20;
            const ex = floorX(i), ey = floorY(i);
            const x = sx + (ex - sx) * t + Math.sin(t * Math.PI * 2 + i) * 30 * (1 - t);
            const y = sy + (ey - sy) * t;
            const rot = (r2 - 0.5) * 50 * (1 - t);
            const w = 56 + (66 - 56) * m, h = 42 + (48 - 42) * m;
            const isLifted = i === 21 && rise > 0;   // C08에서 이 폴더가 떠오름
            if (isLifted || pileO <= 0) return null;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={pileO}>
                {m < 1 && (
                  <g opacity={1 - m}>
                    <rect x={0} y={0} width={w} height={h} fill={C.cream} stroke={ink} strokeWidth={1.2} filter="url(#wob)" />
                    <rect x={4} y={4} width={w - 8} height={h - 12} fill={interpolateColors(m, [0, 1], [[C.sky, C.amber, C.green][i % 3], C.grey])} />
                  </g>
                )}
                {m > 0 && <Folder x={0} y={0} w={w} h={h} ink={ink} o={m} />}
              </g>
            );
          })}

          {/* ── 로봇 (C07~C10) ── */}
          {showRobot && (
            <g transform={`translate(${robotOut * 700} 0)`}>
              <Robot x={robotX} y={640} ink={ink} eye={eyeOn * blink} tilt={f >= T.c09 ? headTilt : 0} arm={F(f, T.c08 + 50, T.c08 + 60, 0, 1) * F(f, T.c10, T.c10 + 10, 1, 0)} />
            </g>
          )}

          {/* ── 스캔 빛 ── */}
          {scan > 0 && scan < 1 && (() => {
            const ex = robotX - 52 - 40, ey = 640 - 186;              // 로봇 눈 근처
            const yy = PY + PH * (CROP.y + CROP.h * scan);
            const lx = PX + PW * CROP.x; return <path d={`M${ex},${ey} L${lx},${yy - 26} L${lx},${yy + 26} z`} fill="#fff" opacity={0.35} />;
          })()}

          {/* ── 큰 사진 (C08~): 폴더가 떠올라 크롭 사진으로 펼쳐짐 → C09 떨림 → 전체 공개 ── */}
          {showPhoto && (() => {
            const cr = cropRect(reveal);
            const B = 14;                                              // 크림 테두리
            const fx0 = cr.x - B, fy0 = cr.y - B, fw0 = cr.w + 2 * B, fh0 = cr.h + 2 * B + 8;
            const x0 = floorX(21), y0 = floorY(21), w0 = 66, h0 = 48;
            const fx = x0 + (fx0 - x0) * rise, fy = y0 + (fy0 - y0) * rise, fw = w0 + (fw0 - w0) * rise, fh = h0 + (fh0 - h0) * rise;
            const unfold = F(rise, 0.5, 1, 0, 1);
            const jx = tremble * Math.sin(f * 2.3) * 2.2, jy = tremble * Math.cos(f * 1.9) * 2.2;
            return (
              <g transform={`translate(${jx} ${jy})`}>
                {unfold < 1 && <Folder x={fx} y={fy} w={fw} h={fh} ink={ink} o={1 - unfold} />}
                <g opacity={unfold}>
                  <rect x={fx} y={fy} width={fw} height={fh} fill={C.cream} stroke={ink} strokeWidth={2} filter="url(#wob)" />
                  {rise >= 1 && (
                    <g clipPath="url(#photoClip)">
                      <image href={birthday} x={PX} y={PY} width={PW} height={PH} preserveAspectRatio="none" />
                    </g>
                  )}
                  {rise < 1 && <rect x={fx + B * rise + 2} y={fy + B * rise + 2} width={fw - 2 * B * rise - 4} height={fh - 2 * B * rise - 12} fill={C.glow} />}
                </g>
                {/* 스캔 중 검출 박스 (크롭 안: 크롭 전체 / 얼굴 / 보라 풍선) */}
                {scan > 0 && f < T.c10 + 12 && [[CROP.x + 0.01, CROP.y + 0.01, CROP.w - 0.02, CROP.h - 0.02], [0.335, 0.50, 0.10, 0.17], [0.44, 0.43, 0.13, 0.22]].map(([bx, by, bw, bh], k) => (
                  scan > by + 0.1 && <rect key={k} x={PX + PW * bx} y={PY + PH * by} width={PW * bw} height={PH * bh} fill="none" stroke={C.stamp} strokeWidth={2} strokeDasharray="8 6" opacity={0.7 * F(f, T.c09 + 30, T.c09 + 44, 1, 0)} />
                ))}
                {/* 라벨 (C08~C10): 크롭 안에 팝 → C10 낙하 */}
                {f >= tagAt[0] && f < T.c10 + 70 && (() => {
                  const home: [number, number, string, number][] = [[PX + 200, PY + 118, 'INDOOR', -6], [PX + 322, PY + 172, 'BALLOON', 4], [PX + 178, PY + 300, 'SMILE', -3]]   // 새 크롭(x 169~323, y 106~359) 위·오른쪽·아래에 배치;
                  return home.map(([hx, hy, txt, rot], k) => {
                    let x = hx, y = hy, r = rot;
                    if (tagFall > 0) { y += 900 * tagFall * tagFall; x += (k - 1) * 60 * tagFall; r += (k - 1) * 90 * tagFall; }
                    return <Stamp key={k} x={x} y={y} text={txt} p={Math.min(1.08, tag(k))} rot={r} ink={C.stamp} />;
                  });
                })()}
              </g>
            );
          })()}

          {/* ── C10 앞부분: AI 채팅 결과 — 로봇 아바타 + 쭈글쭈글 말풍선 안에 영어 설명이 타이핑됨 ── */}
          {f >= T.c10 + 4 && capO > 0 && (() => {
            let left = Math.floor(capChars);
            const ax = PX + 24, ay = PY + PH + 68;                       // 아바타
            const bx0 = PX + 76, by0 = PY + PH + 40, bw = PW - 76, bh = 116;   // 오른쪽 끝 = 사진 오른쪽 끝   // 말풍선 (글자 폭에 맞춤, 좌우 여백 18)
            const sc = Math.min(1.08, chatIn);
            return (
              <g opacity={capO}>
                {/* 로봇 프사 */}
                <g transform={`translate(${ax} ${ay}) scale(${sc})`}>
                  <Shape d={circle(0, 0, 22)} fill={C.robot} stroke={ink} sw={2.5} off={[1, -1]} />
                  <Shape d={rr(-13, -12, 26, 20, 4)} fill={C.robot} stroke={ink} sw={2} off={[1, -1]} />
                  <circle cx={-4} cy={-2} r={5} fill={C.lensGlass} stroke={ink} strokeWidth={1.5} />
                  <circle cx={-5} cy={-2} r={2} fill={ink} />
                  <path d="M0,-12 v-6" stroke={ink} strokeWidth={2} /><circle cx={0} cy={-20} r={2.5} fill={C.stamp} />
                </g>
                {/* 말풍선 (쭈글쭈글) */}
                <g transform={`translate(${bx0} ${by0 + bh / 2}) scale(${sc}) translate(${-bx0} ${-by0 - bh / 2})`}>
                  <Shape d={`${rr(bx0, by0, bw, bh, 14)} M${bx0 + 1},${by0 + 26} l-12,8 l12,10 z`} fill={C.cream} stroke={ink} sw={2.5} off={[2, -2]} />
                  {CAPTION.map((line, i) => {
                    const n = Math.max(0, Math.min(line.length, left)); left -= line.length;
                    const cursor = n < line.length && n > 0 && Math.floor(f / 8) % 2 === 0 ? '▍' : '';
                    return <text key={i} x={bx0 + 18} y={by0 + 32 + i * 22} fontFamily="'American Typewriter', 'Courier New', monospace" fontSize={15.5} fill={ink} opacity={0.9}>{line.slice(0, n) + cursor}</text>;
                  })}
                </g>
              </g>
            );
          })()}

          {/* ── C10: 사진 → 머리 손그림 화살표 ── */}
          {link > 0 && (() => {
            const ax = PX + PW + 34, ay = PY + PH / 2 + 10, bx = HX - 214, by = ay;
            const o = 0.95 * F(f, T.c11 + 10, T.c11 + 50, 1, 0);
            return (
              <g>
                <Line d={`M${ax},${ay} Q${(ax + bx) / 2},${ay - 14} ${bx},${by}`} p={Math.min(1, link * 1.3)} stroke={ink} sw={5} o={o} />
                <Line d={`M${bx - 26},${by - 22} L${bx + 2},${by} L${bx - 26},${by + 20}`} p={F(link, 0.7, 1, 0, 1)} stroke={ink} sw={5} o={o} />
              </g>
            );
          })()}

          {/* ── 머리 + 서랍 (C10~C11) ── */}
          {headP > 0 && (
            <g>
              <Head x={HX} y={HY} ink={ink} p={headP} />
              {/* 머릿속 장면 (C10: 서랍 없이 그림만) → C11 회색·엉킴 → 서랍이 나타나 담고 닫힘 → 멀어짐 */}
              <g opacity={F(headP, 0.8, 1, 0, 1) * awayO} transform={`translate(${DX + DW / 2} ${DY + DH / 2}) scale(${awayScale}) translate(${-DX - DW / 2} ${-DY - DH / 2})`}>
                <rect x={DX} y={DY} width={DW} height={DH} fill={innerDark} opacity={sceneP} />
                <g clipPath="url(#drawerClip)">
                  <g transform={`translate(${DX} ${DY})`} filter="url(#desat)" opacity={1 - grey * 0.35}>
                    <MiniScene w={DW} h={DH} ink={ink} p={sceneP} />
                  </g>
                  <g transform={`translate(${DX} ${DY})`}>
                    <Line d={tanglePath} p={tangle} stroke={C.thread} sw={2.8} o={0.9} />
                  </g>
                </g>
                {/* 서랍: 윤곽이 그려지고 앞판이 아래에서 올라와 담김 → 닫힘 */}
                {drawerIn > 0 && (
                  <g>
                    <Line d={`M${DX},${DY} h${DW} v${DH} h-${DW} z`} p={drawerIn} stroke={ink} sw={3.5} />
                    <g transform={`translate(${DX + DW / 2} ${DY + DH / 2}) translate(0 ${panelY}) scale(${1 + 0.12 * (drawerIn < 1 ? drawerIn : 1 - drawerClose)}) translate(${-DX - DW / 2} ${-DY - DH / 2})`} opacity={Math.min(1, drawerIn * 2)}>
                      <Shape d={rr(DX - 4, DY - 4, DW + 8, DH + 8, 6)} fill={C.kraft} stroke={ink} sw={3.5} />
                      <Shape d={circle(DX + DW / 2, DY + DH / 2, 9)} fill={C.charcoal} stroke={ink} sw={2} off={[1, -1]} />
                    </g>
                  </g>
                )}
              </g>
            </g>
          )}
        </g>

        {/* 종이 알갱이 */}
        <rect width={width} height={height} filter="url(#grain)" />
        {/* 어둠: 도입(P1에서 이어짐) / 말미(닫힌 서랍) */}
        <rect width={width} height={height} fill={C.deep} opacity={Math.max(darkIn, darkOut)} />
      </svg>
      {P2CUTS.map((c) => (
        <Sequence key={'s' + c.id} from={c.start - G0} durationInFrames={c.duration} name={'sub ' + c.id}>
          <Subtitle cut={c} />
        </Sequence>
      ))}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 60%, rgba(30,20,10,0.16) 100%)'}} />
    </AbsoluteFill>
  );
};
