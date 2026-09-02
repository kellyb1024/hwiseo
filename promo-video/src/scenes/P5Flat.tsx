import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring, Easing} from 'remotion';
import {Subtitle} from '../components/Stage';
import {rand} from '../components/Draw';
import {CUTS, cutStart, partDur} from '../cuts';
import {theme} from '../theme';
import {P3Shape as Shape} from './P3Flat';
import {Figure, useDecoded, cloudD} from './P4Flat';
import {HwiseoCharF, CHAR_FLAME_BASE, CHAR_CENTER, CHAR_GROUND} from '../components/HwiseoCharF';

/**
 * P5 플랫 — C21~C24. 2026-08-27 밤 '가슴 안에서 피어남' 버전 (사용자 레퍼런스 TED-Ed 'Think Like A Musician' #5·#6·#7).
 * P4 끝(빛 속에 떠 있는 실루엣 + '!' 풍선)을 그대로 이어받는다.
 * C21 카메라가 실루엣의 가슴으로 푸시인 → 남색 가슴 속 → 불씨 한 점(마중물)이 켜지고 색 조각들이 하나씩 피어남
 * C22 불씨 둘레에 동심원 고리(흰 실선 + 노란 점선)가 그려지고 점선 고리가 천천히 돌기 시작 (멈춰진 시간이 흐름)
 * C23 창이 열리면 사진 대신 '빛의 캔버스'(아이보리 + 금색 동심원 층) → "'당신'의 몫입니다"에 둘레 조각들이 가운데로 빨려들어 불씨 한 점으로 (사용자 2026-08-27 밤, 플랫 버전).
 * C24 빛의 캔버스가 화면을 채우며 輝 → 敍 금박 도장.
 * C25 "사진 너머의 이야기를 끌어내는 AI 친구 휘서"에 캐릭터(네모 양초 휘서 = design/character/hwiseo-F.js → HwiseoCharF, 불꽃 일렁임) 등장 → VO 끝나면 캐릭터 사라지고 빈 화면 가운데 앱 아이콘 + 그 아래 'AI friend Hwiseo' 워드마크(`img/logo/hwiseo-icon-1024.png`, 쭈글 wob)만 딱 → 끝 (사용자 22:50).
 * 재료: P4와 동일 (연필 윤곽 + 어긋난 채움, wob, 종이 알갱이). 조각은 색이 선 밖으로 번진 듯 두 겹.
 */
const P5CUTS = CUTS.filter((c) => c.part === 'P5');
const G0 = cutStart('C21');
const END = partDur('P5');
const P4END = partDur('P4');

const C = {
  ivory: '#FFF9F0', cream: '#F3EEE4', warm: '#FBF2E4', ink: '#4A3D52', pencil: '#6B6068', navy: '#2E3054', navyDeep: '#252747', cloud: '#221D28',
  amber: '#E9A24A', gold: '#F2C069', goldDeep: '#C98A2E', core: '#FFF1C9', ember: '#F3A13F',
  pink: '#F2A6B8', sky: '#8FB3D9', green: '#B8D68A', orange: '#F08A4B', mint: '#8EDCD0', white: '#FFFDF7',
};
const soft = theme.ease.soft, inOut = theme.ease.inOut;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const F = (f: number, a: number, b: number, v0: number, v1: number, e = soft) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 -${2 * r},0`;

/* 가슴 속 색 조각 6개 (레퍼런스 #6: 노랑 고리·민트 붓·분홍 지그재그·흰 점·파랑 물결·주황 교차) — 중심이 원점 */
const PIECES: {d: string; col: string; sw: number; dots?: boolean}[] = [
  {d: 'M-30,10 C-40,-30 20,-40 10,-5 C0,25 -20,20 -10,-10 C0,-40 40,-20 30,20', col: C.gold, sw: 7},
  {d: 'M-42,-6 Q0,-24 48,4', col: C.mint, sw: 17},
  {d: 'M-34,-14 L-8,8 L4,-16 L30,10', col: C.pink, sw: 7},
  {d: '', col: C.white, sw: 0, dots: true},
  {d: 'M-40,0 Q-20,-22 0,0 T40,0', col: C.sky, sw: 7},
  {d: 'M-18,-18 L18,18 M-18,18 L18,-18', col: C.orange, sw: 8},
];

export const P5Flat: React.FC<{charStyle?: 'grain' | 'hatch' | 'flat'}> = ({charStyle = 'flat'}) => {   // flat 확정 (사용자 2026-09-03): 연필 윤곽 + 어긋난 채움, 결 없음
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const fp = P4END + f;                                   // P4에서 이어지는 위상 (둥둥·유영이 끊기지 않게)
  const seed = Math.floor(f / theme.boilEvery) * 7;
  const T = {c21: 0, c22: cutStart('C22') - G0, c23: cutStart('C23') - G0, c24: cutStart('C24') - G0, c25: cutStart('C25') - G0};
  const c25 = P5CUTS.find((c) => c.id === 'C25')!;
  const c23 = P5CUTS.find((c) => c.id === 'C23')!;
  const BRIGHT = T.c23 + c23.voFrames - 8;   // '몫입니다'에 창이 화면을 채우며 밝아짐 → 輝 (사용자 00:55: C24 VO를 기다리지 않음)
  const ink = C.ink;
  const logo = staticFile('img/logo/hwiseo-icon-480.png');   // 480px: 1024는 팝 중 재디코딩 레이스로 프레임이 비어 보임 (2026-08-28)
  useDecoded(logo);

  /* ── P4 끝 상태 (떠 있는 실루엣) ── */
  const S = 0.85, TILT = -38, th = (TILT * Math.PI) / 180;
  const personY = 430 + Math.sin(fp / 22) * 7;
  const personRot = Math.sin(fp / 17) * 2;
  const hip: [number, number] = [640, personY - 95 * S];
  const chest: [number, number] = [hip[0] + 42.5 * Math.sin(th), hip[1] - 42.5 * Math.cos(th)];   // 몸통 가운데 (기울기 반영)
  const headTop: [number, number] = [640 + 160 * S * Math.sin(th), personY - 95 * S - 160 * S * Math.cos(th)];
  const ux = Math.cos(th), uy = Math.sin(th);
  const at = (rx: number, ry: number): [number, number] => [headTop[0] + rx * ux - ry * uy, headTop[1] + rx * uy + ry * ux];

  /* ── C21 ①: 푸시인 ×3.4 — 몸이 화면을 꽉 채우는 크기(레퍼런스 #10)에서 멈춤 → 몸 위에 색 조각이 피어나는 동안 천천히 더 다가감 → C22 직전 가슴 속으로 파고듦 ── */
  const SWITCH = T.c22 - 3;
  const dive1 = F(f, 0, 44, 0, 1, Easing.bezier(0.4, 0, 0.2, 1));
  const drift = F(f, 44, SWITCH - 30, 0, 1, Easing.linear);
  const dive2 = F(f, SWITCH - 30, SWITCH, 0, 1, Easing.bezier(0.5, 0, 0.85, 0.6));   // 30f 가속 (16f는 컷처럼 보임 → 사용자)
  const z = 1 + dive1 * 3.2 + drift * 1.8 + dive2 * 16;   // ×4.2에서 피어나기 시작 → 피어나는 동안 ×6까지 계속 확대 → 가슴 속
  const bubO = 1 - F(f, 0, 26, 0, 1);
  const outerO = 1 - F(f, SWITCH - 6, SWITCH, 0, 1);   // 줌이 남색으로 이어지는 마지막 6f에만 페이드
  // 몸 위 조각 (figure-local 좌표, 엉덩이 원점 → 기울기·스케일 반영해 월드로)
  const rot = (lx: number, ly: number): [number, number] => [hip[0] + S * (lx * Math.cos(th) - ly * Math.sin(th)), hip[1] + S * (lx * Math.sin(th) + ly * Math.cos(th))];
  const BODY: [number, number, number][] = [[-2, -62, -20], [12, -34, 25], [-6, -8, 0], [-40, -76, 0], [40, 12, -50], [2, 60, 0]];   // [lx, ly, 회전]
  const bodyAt = (i: number) => 48 + i * 12;
  const bodyP = (i: number) => F(f, bodyAt(i), bodyAt(i) + 16, 0, 1, theme.ease.draw);
  const bodyPop = (i: number) => spring({frame: f - bodyAt(i), fps, config: {damping: 9, stiffness: 180, mass: 0.7}});

  /* ── C21 ②: 가슴 속 — 불씨(마중물) → 조각들이 피어남 ── */
  const CC: [number, number] = [640, 380];
  const inside = f >= SWITCH - 10;
  const insideK = F(f, SWITCH - 10, SWITCH - 2, 0, 1);      // 종이색 아이보리 → 남색 (한 프레임 전환 ✗)
  const emberS = spring({frame: f - (SWITCH - 2), fps, config: {damping: 7, stiffness: 220, mass: 0.6}});
  const emberO = (f >= SWITCH - 2 ? 1 : 0) * (1 - F(f, BRIGHT + 20, BRIGHT + 50, 0, 1));     // 불씨는 조각을 다 받고, 밝아지며 輝가 뜰 때 물러남
  const pulse = (k: number) => { const t = ((f - (SWITCH + 10) - k * 20) % 60) / 60; return f >= SWITCH + 10 + k * 20 && f < T.c23 ? t : -1; };
  const pieceAt = (i: number) => SWITCH + 2 + i * 3;   // 가슴 속에선 이미 피어 있던 조각들이 둘레에 빠르게 자리 잡음
  const pieceP = (i: number) => F(f, pieceAt(i), pieceAt(i) + 14, 0, 1, theme.ease.draw);
  const piecePop = (i: number) => spring({frame: f - pieceAt(i), fps, config: {damping: 9, stiffness: 180, mass: 0.7}});
  const spread = F(f, T.c22, T.c22 + 60, 0, 1, inOut);                                            // C22: 조각들이 고리 바깥으로 물러남
  const piecePos = (i: number): [number, number, number] => {
    const a = (i / PIECES.length) * Math.PI * 2 + 0.3 + rand(i, 11) * 0.3;
    const r = 250 + rand(i, 12) * 50 + spread * 95;
    const drift = Math.sin(f / (26 + i * 3) + i * 1.9) * 5;
    return [CC[0] + Math.cos(a) * r + drift, CC[1] + Math.sin(a) * r * 0.82 + Math.cos(f / 31 + i) * 4, (rand(i, 13) - 0.5) * 50];
  };
  const piecesO = 1;   // 조각은 빨려들어 사라짐 (pullK)
  /* ── C23 ②: "'당신'의 몫입니다" — 조각들이 자석처럼 가운데 불씨로 빨려듦 (4f 간격, 26f 가속) → 도착마다 그 색의 파문 + 불씨가 조금씩 커짐 ── */
  const PULL = T.c23 + 30;   // "'you', the one who lived the moment" 동안 빨려듦, BRIGHT 전에 끝남
  const arriveAt = (i: number) => PULL + i * 4 + 26;
  const pullK = (i: number) => F(f, PULL + i * 4, arriveAt(i), 0, 1, Easing.bezier(0.55, 0, 0.9, 0.45));
  const arrived = PIECES.reduce((n, _, i) => n + (f >= arriveAt(i) ? 1 : 0), 0);
  const bumpK = Math.max(0, ...PIECES.map((_, i) => (f >= arriveAt(i) ? Math.max(0, 1 - (f - arriveAt(i)) / 12) : 0)));
  const emberGrow = 1 + 0.06 * arrived + 0.3 * bumpK;
  const lightK = F(f, T.c23, T.c23 + 70, 0.55, 1, soft);                                           // 창이 열리며 빛의 층이 퍼짐

  /* ── C22: 동심원 고리 — 흰 실선(r120) + 노란 점선(r185) 그려짐 → 점선이 천천히 돌기 시작 ── */
  const ring1P = F(f, T.c22 + 4, T.c22 + 50, 0, 1, theme.ease.draw);
  const ring2P = F(f, T.c22 + 18, T.c22 + 74, 0, 1, theme.ease.draw);
  const ringRot = F(f, T.c22 + 60, END, 0, 130, Easing.linear);                                   // 멈춰진 시간이 흐름
  const R1 = 150, R2 = 232;

  /* ── C23 ①: 창이 열림 — 불씨 자리에서 둥근 창, 그 안은 빛의 캔버스 → C24 화면을 채움 ── */
  const wr = f < BRIGHT
    ? F(f, T.c23 + 2, T.c23 + 44, 0, 130, Easing.bezier(0.2, 0.8, 0.3, 1)) + F(f, T.c23 + 50, BRIGHT, 0, 80, inOut)   /* 2차 확장은 BRIGHT에 정확히 210 도달 */
    : 210 + F(f, BRIGHT, BRIGHT + 50, 0, 900, Easing.bezier(0.5, 0, 0.8, 0.6));
  const winOpen = wr > 0;
  const ring1O = 1 - F(wr, 130, 160, 0, 1);                                                       // 창이 지나가면 흰 고리는 사라짐
  const ring2O = 1 - F(wr, 215, 250, 0, 1);
  const overlayO = 1 - F(wr, 760, 960, 0, 1);
  const innerZoom = 0.9 + F(wr, 0, 1000, 0, 0.25, soft);                                            // 창이 커질수록 안쪽도 조금씩 다가옴

  /* ── C24: 빛의 캔버스가 화면을 채우고 輝 → 敍 도장, 두 번째 호흡에 "AI 친구 휘서" ── */
  const memFade = F(f, BRIGHT + 14, BRIGHT + 56, 0, 1, soft);                                       // 아이보리 → 웜 종이
  const hwiS = spring({frame: f - T.c24, fps, config: {damping: 12, stiffness: 140}});   // 'Shining' 첫 음절에 輝 (사용자 01:00) — 밝아짐은 BRIGHT, 輝는 C24 VO 시작
  const seoS = spring({frame: f - (T.c24 + 66), fps, config: {damping: 12, stiffness: 140}});
  /* ── C25: 輝敍가 위로 물러나고 앱 아이콘 팝 → '휘서' 워드마크 ── */
  const up = F(f, T.c25, T.c25 + 24, 0, 1, inOut);                                                // 도장이 위로·작게 (캐릭터에 자리 내줌)
  const charS = spring({frame: f - (T.c25 + 8), fps, config: {damping: 9, stiffness: 140, mass: 0.9}});   // 캐릭터 등장
  const VO_END = T.c25 + c25.voFrames;
  const clearAll = F(f, VO_END + 6, VO_END + 34, 0, 1, soft);                                       // 글자·캐릭터 전부 사라짐 → 빈 화면
  const LOGO_AT = VO_END + 44;
  const logoS = spring({frame: f - LOGO_AT, fps, config: {damping: 10, stiffness: 150, mass: 0.8}});   // 아이콘만 딱
  const iconSeed = f < LOGO_AT + 14 ? 300 : seed + 3;                                               // 팝 동안은 노이즈 고정(재래스터 ✗) → 안착 후 쭈글 boil
  const NAME_AT = VO_END + 70;                                                                        // 아이콘 아래 'AI friend Hwiseo' 워드마크 (사용자 00:30: 캐릭터 밑에서 엔딩으로 이동)
  const nameS = spring({frame: f - NAME_AT, fps, config: {damping: 11, stiffness: 150}});
  const nameP = F(f, NAME_AT, NAME_AT + 34, 0, 1, theme.ease.draw);
  const flick = 1 + Math.sin(f / 5) * 0.05 + Math.sin(f / 11 + 0.8) * 0.04;                          // 불꽃 숨쉬기 (세로 ±9%) — 피벗이 밑동이라 밑동 선은 안 움직임
  const flickR = Math.sin(f / 23 + 1.2) * 1.5;                                                       // 회전은 거의 ✗ (회전·큰 변위가 밑동을 움직여 몸 윤곽과 겹선 생김 — 사용자 01:10)
  const flickSk = Math.sin(f / 6) * 6 + Math.sin(f / 13 + 1) * 6;                                    // 휘어짐: skewX ±12° (밑동 고정, 끝만 크게)
  const breath = 1 + Math.sin(f / 24) * 0.012;
  const shimmer = 0.92 + 0.08 * Math.sin(f / 9);
  const twinkle = (i: number) => 0.6 + 0.4 * Math.sin(f / (5 + (i % 3)) + i * 2.1);
  const endFade = 1;                                                                                 // 끝은 아이콘이 남은 채로 (사용자)

  const paper = interpolateColors(insideK, [0, 1], [C.ivory, C.navy]);
  const winPaper = interpolateColors(memFade, [0, 1], [C.ivory, C.warm]);

  /* 창 안 장면 (좌표: 창 중심 = CC). 빛의 캔버스 — 아이보리 종이 + 금색 동심원 9겹(P4 C20 빛 무리와 동일 파라미터, 그라데이션 ✗) + 반짝이 */
  const Inner = (
    <g transform={`translate(${CC[0]} ${CC[1]}) scale(${innerZoom}) translate(${-CC[0]} ${-CC[1]})`}>
      <rect x={-400} y={-400} width={width + 800} height={height + 800} fill={winPaper} />
      {Array.from({length: 9}).map((_, i) => (
        <circle key={'wl' + i} cx={CC[0]} cy={CC[1]} r={(500 - i * 42) * lightK + Math.sin(f / 19 + i) * 4} fill={C.gold} opacity={0.032 * (1 - clearAll)} />   /* 엔딩(아이콘만)에선 빛 층도 걷힘 */
      ))}
      {Array.from({length: 12}).map((_, i) => {
        const a = rand(i, 161) * Math.PI * 2, rr0 = 70 + rand(i, 162) * 260;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (7 + (i % 4)) + i * 1.3));
        return <circle key={'ws' + i} cx={CC[0] + Math.cos(a) * rr0} cy={CC[1] + Math.sin(a) * rr0 * 0.8 + Math.sin(f / 30 + i) * 6} r={2.5 + rand(i, 163) * 3} fill="#FFFFFF" stroke={C.gold} strokeWidth={1.2} opacity={tw * lightK * (1 - clearAll)} />;
      })}
    </g>
  );

  return (
    <AbsoluteFill style={{backgroundColor: paper}}>
      {P5CUTS.map((c) => (
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
          <filter id="wobIcon" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={iconSeed} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={7} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* ── 양초 휘서 필터 (캐릭터 로컬 좌표 기준: 420 단위 · 화면 배율 ≈1.24) ──
              화면 px 값 → 로컬: baseFrequency ×1.24, scale ÷1.24.  (옛 불꽃머리는 1000 단위 × 0.45 였음)
              wobCharF/wobFlameF = 옛 wobChar/wobFlame 과 화면에서 같은 진폭·결 (2026-09-03, 주파수 환산 방향 정정) */}
          <filter id="wobCharF" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves={2} seed={seed + 21} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wobFlameF" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={100 + Math.floor(f / 8)} result="fa" />
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={101 + Math.floor(f / 8)} result="fb" />
            <feComposite in="fa" in2="fb" operator="arithmetic" k1={0} k2={1 - (f % 8) / 8} k3={(f % 8) / 8} k4={0} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={7} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* 연필 윤곽 = 씬 wob(0.018 / 4px) 의 로컬 환산 */}
          <filter id="charOutlineF" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={seed + 22} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* 어긋난 채움 = 씬 wob2(0.012 / 7px) 의 로컬 환산 */}
          <filter id="charFillFlatF" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={2} seed={seed + 24} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={5.6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* 색연필 알갱이: 종이 결(고정 seed — 종이는 안 끓음)로 채움 알파를 깎고 → 어긋남 쭈글. 한 필터에 묶은 이유: 한 요소엔 filter 하나뿐 */}
          <filter id="charFillGrainF" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={7} result="n" />
            <feComponentTransfer in="n" result="m"><feFuncA type="table" tableValues="0 0.1 0.55 0.95 1 1" /></feComponentTransfer>
            <feComposite in="SourceGraphic" in2="m" operator="in" result="g" />
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={2} seed={seed + 24} result="w" />
            <feDisplacementMap in="g" in2="w" scale={5.6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* 빗금 선 쭈글 (가늘게) */}
          <filter id="charHatchF" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed + 26} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wobChar" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves={2} seed={seed + 21} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={16} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wobFlame" x="-30%" y="-30%" width="160%" height="160%">
            {/* 일렁임: 노이즈 두 장을 8f 주기로 크로스페이드 → 윤곽이 끊김 없이 물결침 (seed 교체식은 떨림으로 보임 — 사용자 01:15) */}
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={2} seed={100 + Math.floor(f / 8)} result="fa" />
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={2} seed={101 + Math.floor(f / 8)} result="fb" />
            <feComposite in="fa" in2="fb" operator="arithmetic" k1={0} k2={1 - (f % 8) / 8} k3={(f % 8) / 8} k4={0} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={20} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={seed + 5} result="w" />
            <feDisplacementMap in="SourceGraphic" in2="w" scale={9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed + 40} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} />
          </filter>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={seed + 90} />
            <feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .12 0" />
          </filter>
          <filter id="brush" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={3} seed={11} />
            <feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .35  0 0 0 0 .2  0 0 0 .10 0" />
          </filter>
          <clipPath id="win"><circle cx={CC[0]} cy={CC[1]} r={Math.max(0, wr)} /></clipPath>
        </defs>
        <rect width={width} height={height} filter="url(#brush)" />

        {/* ── A. P4 끝 장면 → 가슴으로 푸시인 ── */}
        {outerO > 0 && (
          <g opacity={outerO} transform={`translate(${chest[0]} ${chest[1]}) scale(${z}) translate(${-chest[0]} ${-chest[1]})`}>
            {/* 빛 무리 + 반짝이 (P4 C20과 동일 파라미터) */}
            {Array.from({length: 9}).map((_, i) => (
              <circle key={'gl' + i} cx={640} cy={personY - 90} r={500 - i * 42 + Math.sin(fp / 19 + i) * 4} fill={C.gold} opacity={0.032} filter="url(#chalk)" />
            ))}
            {Array.from({length: 16}).map((_, i) => {
              const a = rand(i, 151) * Math.PI * 2, rr0 = 90 + rand(i, 152) * 300;
              const tw = 0.4 + 0.6 * Math.abs(Math.sin(fp / (7 + (i % 4)) + i * 1.3));
              return <circle key={'sp' + i} cx={640 + Math.cos(a) * rr0} cy={personY - 90 + Math.sin(a) * rr0 * 0.8 + Math.sin(fp / 30 + i) * 6} r={3 + rand(i, 153) * 3} fill="#FFFFFF" stroke={C.gold} strokeWidth={1.2} opacity={tw} />;
            })}
            <path d={cloudD(1500, 200, 33)} transform="translate(640 790)" fill="#221D28" opacity={0.55} filter="url(#wob)" />   {/* P4 C20 마지막 프레임의 둔덕과 동일 (모양·위치·색) */}
            <g transform={`translate(640 ${personY}) rotate(${personRot}) scale(${S}) translate(-640 ${-personY})`}>
              <Figure x={640} y={personY} calm={1} ink={ink} t={fp} />
              {bubO > 0 && ([[54, -58, 4.5], [76, -90, 8], [106, -134, 34]] as const)   /* P4 C20과 동일 좌표 — 얼굴에 안 닿게 */.map(([dx, dy, r], i) => {
                const [px, py] = at(dx, dy);
                return (
                  <g key={'bub' + i} transform={`translate(${px} ${py})`} opacity={bubO}>
                    <path d={circle(0, 0, r)} fill={C.core} stroke={ink} strokeWidth={i === 2 ? 3 : 2.2} filter="url(#wob)" />
                    {i === 2 && <g><path d="M-3,-17 h6 l-1.5,20 h-3 z" fill={ink} filter="url(#wob)" /><circle cx={0} cy={12} r={3.6} fill={ink} /></g>}
                  </g>
                );
              })}
            </g>
            {/* 몸 위에 피어나는 색 조각들 (레퍼런스 #10) */}
            {BODY.map(([lx, ly, rr], i) => {
              const pr = bodyP(i);
              if (pr <= 0) return null;
              const [x, y] = rot(lx, ly);
              const p = PIECES[i];
              const pop = (0.85 + 0.15 * Math.min(1.2, bodyPop(i))) * 0.22;   // 몸 비율 기준으로 작게 (확대는 카메라가) — 사용자
              return (
                <g key={'bd' + i} transform={`translate(${x} ${y}) rotate(${rr + TILT}) scale(${pop})`}>
                  {p.dots ? (
                    ([[0, 0, 9], [-22, 14, 5], [18, -16, 4]] as const).map(([dx, dy, r], k) => (
                      <circle key={k} cx={dx} cy={dy} r={r} fill={p.col} opacity={F(pr, k * 0.3, k * 0.3 + 0.4, 0, 1)} filter="url(#wob)" />
                    ))
                  ) : (
                    <g>
                      <path d={p.d} fill="none" stroke={p.col} strokeWidth={p.sw + 2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} opacity={0.45} transform="translate(2 -1.5)" filter="url(#wob2)" />
                      <path d={p.d} fill="none" stroke={p.col} strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} filter="url(#wob)" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* ── B. 가슴 속 ── */}
        {inside && (
          <g>
            {/* 창 안 장면 (C23~): 원형 클립 */}
            {winOpen && <g clipPath="url(#win)">{Inner}</g>}

            {/* 남색 덮개 — 창 자리만 뚫림, 가장자리는 거칠게 */}
            {overlayO > 0 && (
              <path d={`M-40,-40 H${width + 40} V${height + 40} H-40 Z ${winOpen ? circle(CC[0], CC[1], wr) : ''}`} fillRule="evenodd" fill={C.navy} opacity={overlayO * insideK} filter="url(#rough)" />   // 줌 마지막 8f 동안 서서히 덮음 (한 번에 덮으면 컷처럼 보임 — 사용자)
            )}

            {/* 불씨(마중물): 톡 켜지고 파문이 세 번 ── */}
            {emberO > 0 && (
              <g opacity={emberO}>
                {[0, 1, 2].map((k) => { const t = pulse(k); return t >= 0 && <circle key={'pl' + k} cx={CC[0]} cy={CC[1]} r={14 + 110 * t} fill="none" stroke={C.amber} strokeWidth={3} opacity={0.55 * (1 - t)} filter="url(#wob)" />; })}
                {PIECES.map((p, i) => {   // 조각이 닿을 때 그 색의 파문 한 번
                  const t = (f - arriveAt(i)) / 18;
                  return t >= 0 && t < 1 ? <circle key={'ar' + i} cx={CC[0]} cy={CC[1]} r={12 + 70 * t} fill="none" stroke={p.col} strokeWidth={3} opacity={0.7 * (1 - t)} filter="url(#wob)" /> : null;
                })}
                <g transform={`translate(${CC[0]} ${CC[1]}) scale(${Math.min(1.3, emberS) * 1.6 * emberGrow})`}>
                  <circle r={16} fill={C.amber} opacity={0.18} />
                  <path d={circle(0, 0, 7)} fill={C.ember} stroke={C.core} strokeWidth={1.5} filter="url(#wob)" />
                  <circle r={2.5} fill={C.core} />
                </g>
              </g>
            )}

            {/* 색 조각: 하나씩 draw-on + 살짝 팝, 색이 선 밖으로 번진 두 겹 */}
            {piecesO > 0 && PIECES.map((p, i) => {
              const pr = pieceP(i);
              const k = pullK(i);
              if (pr <= 0 || k >= 1) return null;
              const [x0, y0, rot] = piecePos(i);
              const x = x0 + (CC[0] - x0) * k, y = y0 + (CC[1] - y0) * k;                          // C23 ②: 가운데 불씨로 빨려듦
              const pop = (0.8 + 0.2 * Math.min(1.2, piecePop(i))) * 2.1 * (1 - 0.82 * k);        // 레퍼런스처럼 큼직하게 → 빨려들며 작아짐
              return (
                <g key={'pc' + i} transform={`translate(${x} ${y}) rotate(${rot + k * 90}) scale(${pop})`} opacity={piecesO * (1 - F(k, 0.86, 1, 0, 1))}>
                  {p.dots ? (
                    ([[0, 0, 9], [-22, 14, 5], [18, -16, 4]] as const).map(([dx, dy, r], k) => (
                      <g key={k} opacity={F(pr, k * 0.3, k * 0.3 + 0.4, 0, 1)}>
                        <circle cx={dx + 2} cy={dy - 2} r={r} fill={p.col} opacity={0.5} filter="url(#wob2)" />
                        <circle cx={dx} cy={dy} r={r} fill={p.col} filter="url(#wob)" />
                      </g>
                    ))
                  ) : (
                    <g>
                      <path d={p.d} fill="none" stroke={p.col} strokeWidth={p.sw + 2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} opacity={0.45} transform="translate(3 -2)" filter="url(#wob2)" />
                      <path d={p.d} fill="none" stroke={p.col} strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} filter="url(#wob)" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* 동심원 고리: 흰 실선 → 노란 점선(회전) */}
            {ring1P > 0 && ring1O > 0 && (
              <path d={circle(CC[0], CC[1], R1)} fill="none" stroke={C.white} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring1P} opacity={0.95 * ring1O} filter="url(#wob)" />
            )}
            {ring2P > 0 && ring2O > 0 && (
              <g transform={`rotate(${ringRot} ${CC[0]} ${CC[1]})`}>
                <path d={circle(CC[0], CC[1], R2)} fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" pathLength={1}
                  strokeDasharray={ring2P >= 1 ? '0.028 0.022' : `${ring2P * 1} 1`} opacity={0.95 * ring2O} filter="url(#wob)" />
                {ring2P < 1 && <path d={circle(CC[0], CC[1], R2)} fill="none" stroke={C.navy} strokeWidth={8} pathLength={1} strokeDasharray="0.022 0.028" strokeDashoffset={-0.028} opacity={1} />}
              </g>
            )}

            {/* C24: 輝 → 敍 금박 도장 → C25: 위로 물러남 + 캐릭터 등장 + 'AI 친구 휘서' → 전부 사라짐 → 아이콘만 */}
            {f >= BRIGHT && (   /* 輝敍·캐릭터·아이콘 그룹: 밝아지는 순간부터 */
              <g opacity={endFade}>
                <g opacity={1 - clearAll} transform={`translate(640 ${296 - up * 150}) scale(${1 - up * 0.4}) translate(-640 -296)`}>
                  {([[540, hwiS, '輝', 0], [740, seoS, '敍', 4]] as const).map(([x, sp, ch, ti]) => sp > 0 && (
                    <g key={ch} opacity={Math.min(1, sp * 1.4) * shimmer} transform={`translate(${x} 296) scale(${(1.35 - 0.35 * Math.min(1, sp)) * breath}) translate(${-x} -296)`} filter="url(#wob)">
                      <circle cx={x} cy={296} r={96} fill={C.gold} opacity={0.07} filter="url(#chalk)" />
                      <text x={x} y={296} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={140} fontWeight={500} fill={C.gold} stroke={C.goldDeep} strokeWidth={3} strokeLinejoin="round">{ch}</text>
                      {[0, 1, 2, 3].map((i) => <circle key={i} cx={x - 60 + rand(i + ti, 81) * 120} cy={236 + rand(i + ti, 82) * 120} r={2.5} fill={C.core} opacity={twinkle(i + ti)} />)}
                    </g>
                  ))}
                </g>
                {/* 캐릭터: 아래에서 톡 올라옴, 심지 불꽃 일렁임 + 은은한 빛. 쭈글(핸드드로잉 boil)은 영상 컨셉이라 양초 휘서에도 건다 (사용자 2026-09-03) */}
                {f >= T.c25 + 8 && charS > 0 && clearAll < 1 && (() => {
                  const SC = 1.24, GY = 596 + (1 - Math.min(1, charS)) * 60;   // 바닥선(y=316)을 화면 y=GY 에, 중심(x=150)을 640 에. 불꽃 끝 ≈221 · 그림자 밑 ≈617 (옛 불꽃머리와 같은 자리)
                  const [fbx, fby] = CHAR_FLAME_BASE;
                  const flameT = `translate(${fbx} ${fby}) rotate(${flickR}) skewX(${flickSk}) scale(${1 - (flick - 1) * 0.4} ${flick}) translate(${-fbx} ${-fby})`;
                  const wickT = `translate(${fbx} 122) rotate(${flickR * 0.4}) translate(${-fbx} -122)`;
                  const innerT = `translate(${fbx} ${fby}) skewX(${Math.sin(f / 4 + 2) * 5}) scale(${1 - Math.sin(f / 3.5) * 0.03} ${1 + Math.sin(f / 3.5) * 0.07}) translate(${-fbx} ${-fby})`;   // 속불은 다른 위상으로 더 빠르게 → 일렁임 (옛 불꽃머리와 같은 식)
                  return (
                    <g opacity={Math.min(1, charS * 1.3) * (1 - clearAll)}
                       transform={`translate(640 ${GY}) scale(${SC * (0.9 + 0.1 * Math.min(1.15, charS)) * breath}) translate(${-CHAR_CENTER} ${-CHAR_GROUND})`}>
                      <circle cx={fbx} cy={fby - 10} r={150 + Math.sin(f / 4) * 8} fill={C.gold} opacity={0.14} filter="url(#chalk)" />
                      {/* 연필 레이어: 윤곽 2.5px·어긋남 (3,-2)px = P4 인물과 같은 값의 로컬 환산 (÷1.24). charStyle: grain=색연필 알갱이 / hatch=빗금 / flat=윤곽만 */}
                      <HwiseoCharF flameTransform={flameT} wickTransform={wickT} innerTransform={innerT} flameFilter="url(#wobFlameF)" opts={{level: 3, mood: 'happy', pose: 'idle', view: 'front'}}
                        pencil={{
                          ink, sw: 2.0, off: [2.4, -1.6], outlineFilter: 'url(#charOutlineF)',
                          texture: charStyle === 'grain' ? 'grain' : charStyle === 'hatch' ? 'hatch' : 'none',
                          fillFilter: charStyle === 'grain' ? 'url(#charFillGrainF)' : 'url(#charFillFlatF)',
                          hatch: {spacing: 5.5, sw: 2.2, base: 0.42, filter: 'url(#charHatchF)'},
                          rim: charStyle === 'grain' ? {color: '#E9A62B', sw: 9, opacity: 0.32} : undefined,
                        }} />
                    </g>
                  );
                })()}
                {/* 빈 화면 → 앱 아이콘만 가운데에 딱 (쭈글: 이미지·테두리 wob) */}
                {f >= LOGO_AT && logoS > 0 && (() => {
                  const LS = 200, LY = 330, lx = 640 - LS / 2, ly = LY - LS / 2, rr = LS * 0.22;   // 아이콘을 살짝 올려 아래 워드마크와 함께 가운데 정렬
                  const d = `M${lx + rr},${ly} h${LS - 2 * rr} q${rr},0 ${rr},${rr} v${LS - 2 * rr} q0,${rr} -${rr},${rr} h-${LS - 2 * rr} q-${rr},0 -${rr},-${rr} v-${LS - 2 * rr} q0,-${rr} ${rr},-${rr} z`;
                  return (
                    <g transform={`translate(640 ${LY}) scale(${Math.min(1.2, logoS)}) translate(-640 ${-LY})`}>
                      <clipPath id="logoClip"><path d={d} filter="url(#wob)" /></clipPath>
                      <path d={d} fill={C.gold} opacity={0.14} transform="translate(7 -5)" filter="url(#wobIcon)" />
                      <g filter="url(#wobIcon)"><image href={logo} x={lx} y={ly} width={LS} height={LS} clipPath="url(#logoClip)" /></g>
                      <path d={d} fill="none" stroke={ink} strokeWidth={3} strokeLinejoin="round" filter="url(#wobIcon)" />
                    </g>
                  );
                })()}
                {/* 엔딩 워드마크: 아이콘 아래 'AI friend Hwiseo' 연필 draw-on (자막은 한국어 'AI 친구 휘서') */}
                {f >= NAME_AT && nameS > 0 && (
                  <g transform={`translate(640 482) scale(${Math.min(1.15, nameS)}) translate(-640 -482)`} opacity={Math.min(1, nameS * 1.4)}>
                    <text x={640} y={482} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={44} fontWeight={600} fill="none" stroke={ink} strokeWidth={1.6} strokeLinejoin="round"
                      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - nameP} filter="url(#wob)">AI friend Hwiseo</text>
                    <text x={640} y={482} textAnchor="middle" dominantBaseline="central" fontFamily={theme.font.sans} fontSize={44} fontWeight={600} fill={ink} opacity={F(nameP, 0.75, 1, 0, 1)} transform="translate(2 -1)" filter="url(#wob2)">AI friend Hwiseo</text>
                  </g>
                )}
              </g>
            )}
          </g>
        )}

        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
      {P5CUTS.map((c) => (
        <Sequence key={'s' + c.id} from={c.start - G0} durationInFrames={c.duration} name={'sub ' + c.id}>
          <Subtitle cut={c} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
