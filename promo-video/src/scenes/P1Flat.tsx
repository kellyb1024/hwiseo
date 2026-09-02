import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, interpolateColors, spring, Easing} from 'remotion';
import {Subtitle} from '../components/Stage';
import {rand} from '../components/Draw';
import {CUTS, cutStart, cutDur, partDur} from '../cuts';
import {theme} from '../theme';

/**
 * P1 플랫 테스트 — 한 캔버스, 카메라 이동으로 이어지는 C01~C05 (0~857f).
 * TED-Ed식: 플랫 컬러 2~4색 + 종이 질감 + 삐뚤한 선 + 색이 선 밖으로. 움직임은 느리고 무겁게.
 */
const P1CUTS = CUTS.filter((c) => c.part === 'P1');
const END = partDur('P1');

const C = {
  paper1: '#EDE3CF', paper2: '#F4F1EA', sea: '#1D2B4A', deep: '#0F1626',
  ink: '#4A3D52', camera: '#5B6B8C', cameraDark: '#3E4A66', lens: '#2F2A3A', lensGlass: '#9FB3C8',
  orange: '#F08A4B', film: '#6E6A70', frame: '#F4EBD6', skin: '#E9B994', skinDark: '#C98D6B',
  table: '#B98A5C', cream: '#F7F1E3', sky: '#8FB3D9', green: '#B8D68A', pink: '#F2A6B8', amber: '#E9A24A',
  phone: '#2F2A3A', screen: '#F4F1EA', grey: '#9A948E',
};
const soft = theme.ease.soft, inOut = theme.ease.inOut;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const F = (f: number, a: number, b: number, v0: number, v1: number, e = soft) => interpolate(f, [a, b], [v0, v1], {...clamp, easing: e});

/* ── 손그림 느낌: 채움은 살짝 어긋나게, 선은 삐뚤게 ── */
const Shape: React.FC<{d: string; fill?: string; stroke?: string; sw?: number; off?: [number, number]; opacity?: number}> =
  ({d, fill = 'none', stroke, sw = 3, off = [3, -2], opacity = 1}) => (
    <g opacity={opacity}>
      {fill !== 'none' && <path d={d} fill={fill} transform={`translate(${off[0]} ${off[1]})`} filter="url(#wob2)" />}
      {stroke && <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" filter="url(#wob)" />}
    </g>
  );
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y} h${w - 2 * r} q${r},0 ${r},${r} v${h - 2 * r} q0,${r} -${r},${r} h-${w - 2 * r} q-${r},0 -${r},-${r} v-${h - 2 * r} q0,-${r} ${r},-${r} z`;
const circle = (cx: number, cy: number, r: number) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 -${2 * r},0`;

/* ── 인화 사진: 크림 테두리 + 단순한 색면 (seed로 내용 변화) ── */
const Photo: React.FC<{x: number; y: number; w: number; h?: number; seed: number; rot?: number; sat?: number; same?: boolean; o?: number}> =
  ({x, y, w, h = w * 0.75, seed, rot = 0, sat = 1, same = false, o = 1}) => {
    const s = same ? 3 : seed;
    const pal = [[C.sky, C.green, C.orange], [C.amber, C.sky, C.pink], [C.green, C.pink, C.sky], [C.sky, C.amber, C.green]][s % 4];
    const mix = (c: string) => interpolateColors(sat, [0, 1], [C.grey, c]);
    const b = w * 0.07, iw = w - 2 * b, ih = h - 2 * b - b * 0.8;
    const r1 = rand(s, 1), r2 = rand(s, 2);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
        <rect x={0} y={0} width={w} height={h} fill={C.cream} stroke={C.ink} strokeWidth={1.2} filter="url(#wob)" />
        <rect x={b} y={b} width={iw} height={ih} fill={mix(pal[0])} />
        <path d={`M${b},${b + ih * 0.6} q${iw * 0.3},${-ih * 0.25 * r1} ${iw * 0.55},0 t${iw * 0.45},${-ih * 0.1} V${b + ih} H${b} z`} fill={mix(pal[1])} />
        <circle cx={b + iw * (0.3 + 0.4 * r2)} cy={b + ih * 0.45} r={ih * 0.16} fill={mix(pal[2])} />
      </g>
    );
  };

/* ── 벙어리장갑 손: 소매(색) + 손바닥 + 엄지 (+검지). 손끝이 원점, 팔은 +y 방향 ── */
const Hand: React.FC<{x: number; y: number; rot?: number; scale?: number; point?: boolean; sleeve?: string}> =
  ({x, y, rot = 0, scale = 1, point, sleeve = C.amber}) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {/* 소매 */}
      <Shape d={`M-58,70 h116 l20,900 h-156 z`} fill={sleeve} stroke={C.ink} sw={2.5} />
      <path d="M-60,96 h120" stroke={C.ink} strokeWidth={2.5} opacity={0.5} filter="url(#wob)" />
      {/* 손바닥 + 엄지 */}
      <Shape d={point
        ? `M-40,80 q-14,-50 6,-78 q10,-14 24,-12 l2,-60 q4,-14 16,-6 l4,66 q16,-2 26,10 q16,32 2,70 q-16,18 -46,18 q-30,0 -34,-8 z`
        : `M-42,80 q-12,-60 24,-88 q34,-18 58,8 q16,30 0,66 q-14,22 -46,22 q-30,0 -36,-8 z`} fill={C.skin} stroke={C.ink} sw={2.5} />
      <Shape d={`M-36,40 q-30,-6 -30,24 q2,20 24,20`} fill={C.skin} stroke={C.ink} sw={2.5} off={[1, -1]} />
    </g>
  );

/* ── 말풍선 ── */
const Bubble: React.FC<{x: number; y: number; w: number; h: number; p: number; flip?: boolean; color?: string}> = ({x, y, w, h, p, flip, color = C.cream}) => {
  if (p <= 0) return null;
  const cx = x + w / 2, cy = y + h / 2, t = flip ? x + w - 40 : x + 40;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${p}) translate(${-cx} ${-cy})`} opacity={Math.min(1, p * 1.4)}>
      <Shape d={`${rr(x, y, w, h, 18)} M${t - 10},${y + h - 1} l${flip ? 12 : -12},22 l${flip ? 10 : 22},-22 z`} fill={color} stroke={C.ink} sw={2.5} />
      {[0, 1].map((k) => <path key={k} d={`M${x + 22},${y + 22 + k * 16} h${w - 44 - k * 30}`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.45} filter="url(#wob)" />)}
    </g>
  );
};

/* ── 카메라 (플랫, 옆에서) ── */
const Camera: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <Shape d={rr(0, 40, 320, 190, 22)} fill={C.camera} stroke={C.ink} sw={3} />
    <Shape d={rr(70, 10, 120, 40, 10)} fill={C.cameraDark} stroke={C.ink} sw={3} />
    <Shape d={rr(230, 0, 40, 40, 8)} fill={C.cameraDark} stroke={C.ink} sw={3} />
    <Shape d={circle(230, 135, 62)} fill={C.lens} stroke={C.ink} sw={3} />
    <Shape d={circle(230, 135, 34)} fill={C.lensGlass} />
    <Shape d={rr(20, 60, 70, 34, 8)} fill={C.cameraDark} stroke={C.ink} sw={2.5} />
    {/* 필름 슬롯 */}
    <path d="M12,150 h120" stroke={C.ink} strokeWidth={3} opacity={0.5} filter="url(#wob)" />
  </g>
);

/* ── 필름 띠 ── */
const FilmStrip: React.FC<{x: number; y: number; len: number; frames: number}> = ({x, y, len, frames}) => {
  if (len <= 0) return null;
  const H = 76;
  return (
    <g transform={`translate(${x} ${y})`}>
      <Shape d={rr(0, -H / 2, len, H, 4)} fill={C.film} stroke={C.ink} sw={2.5} off={[2, -1]} />
      {Array.from({length: Math.floor(len / 14)}).map((_, i) => <rect key={i} x={8 + i * 14} y={-H / 2 + 6} width={7} height={10} rx={2} fill={C.frame} opacity={0.8} />)}
      {Array.from({length: frames}).map((_, i) => <rect key={'f' + i} x={14 + i * 42} y={-H / 2 + 22} width={34} height={46} fill={C.frame} filter="url(#wob2)" />)}
    </g>
  );
};

/* ── 벽시계 ── */
const Clock: React.FC<{x: number; y: number; turns: number; o: number}> = ({x, y, turns, o}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <Shape d={circle(0, 0, 58)} fill={C.cream} stroke={C.ink} sw={3} />
    {Array.from({length: 12}).map((_, i) => <circle key={i} cx={Math.sin(i / 12 * Math.PI * 2) * 44} cy={-Math.cos(i / 12 * Math.PI * 2) * 44} r={2.5} fill={C.ink} />)}
    <path d={`M0,0 L${Math.sin(turns * Math.PI * 2) * 34},${-Math.cos(turns * Math.PI * 2) * 34}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <path d={`M0,0 L${Math.sin(turns / 12 * Math.PI * 2) * 22},${-Math.cos(turns / 12 * Math.PI * 2) * 22}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/* ═══════════════ 메인 ═══════════════ */
export const P1Flat: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const seed = Math.floor(f / theme.boilEvery) * 7;

  /* 타임라인 (전역 프레임) */
  const T = {c01: 0, c02: cutStart('C02'), c03: cutStart('C03'), c04: cutStart('C04'), c05: cutStart('C05')};

  /* 카메라: 월드 좌표 (cx, cy)가 화면 중앙에, 배율 z */
  const cx = interpolate(f, [0, 100, T.c02, T.c02 + 60, 300, T.c03 + 40, T.c03 + 80, T.c04, T.c04 + 60, END],
    [640, 900, 900, 640, 640, 660, 640, 640, 640, 640], {...clamp, easing: soft});
  const cy = interpolate(f, [0, 100, T.c02, T.c02 + 60, 300, T.c03 + 40, T.c03 + 80, T.c04, T.c04 + 60, END],
    [360, 380, 380, 500, 520, 560, 600, 360, 360, 360], {...clamp, easing: soft});
  const z = interpolate(f, [0, 100, T.c02, T.c02 + 60, 300, T.c03 + 40, T.c03 + 80, T.c04, T.c04 + 60, T.c05, T.c05 + 60, T.c05 + 150, END],
    [1.15, 0.68, 0.68, 1.05, 1.1, 2.6, 1.2, 1.2, 0.8, 0.8, 1, 2.8, 4], {...clamp, easing: soft});

  /* 종이 색: 크림 → (C03) 흰 → (C05) 바다 → 어둠 */
  const paper = f < T.c05 + 40
    ? interpolateColors(f, [T.c03 - 20, T.c03 + 30], [C.paper1, C.paper2])
    : interpolateColors(f, [T.c05 + 40, T.c05 + 130, END], [C.paper2, C.sea, C.deep]);

  /* ── C01: 필름통 → 카메라 → 띠 ── */
  const canX = F(f, 6, 40, -200, 396, soft);            // 필름통 미끄러져 카메라 슬롯 앞으로
  const canIn = F(f, 40, 58, 0, 1, inOut);               // 슬롯으로 들어감
  const stripLen = F(f, 60, 104, 0, 1040, theme.ease.draw);
  const frames = Math.floor(F(f, 66, 104, 0, 24.99));

  /* ── C02: 사진이 카메라에서 나와 탁자로, 시계, 손, 말풍선 ── */
  const flash = f < T.c02 + 8 ? 0 : f < T.c02 + 12 ? 1 : F(f, T.c02 + 12, T.c02 + 22, 0.6, 0);   // 셔터 플래시
  const camOut = F(f, T.c02 + 30, T.c02 + 70, 0, 1, inOut);          // 카메라가 위로 빠짐
  const clockO = F(f, T.c02 + 40, T.c02 + 60, 0, 1) * F(f, T.c02 + 120, T.c02 + 140, 1, 0);
  const clockTurns = F(f, T.c02 + 45, T.c02 + 115, 0, 2, inOut);
  const tableW = F(f, T.c02 + 36, T.c02 + 86, 0, 1, theme.ease.draw);
  const photoDrop = F(f, T.c02 + 108, T.c02 + 140, 0, 1, Easing.bezier(0.3, 0, 0.6, 1));   // 사진이 위에서 떨어져 탁자에
  const photoOut = 1;
  const handIn = (at: number) => F(f, at, at + 36, 0, 1, soft);
  const bub = (at: number) => spring({frame: f - at, fps, config: {damping: 8, stiffness: 150, mass: 0.7}});  // 젤리
  // 사진: 하늘(월드 560,-260) → 탁자 위(월드 560,600)
  const px = 560, py = -260 + (600 + 260) * photoDrop;
  const pw = 200, ph = 150;

  /* ── C03: 사진 → 폰 모핑, 썸네일 쏟아짐 ── */
  const morph = F(f, T.c03 + 46, T.c03 + 84, 0, 1, inOut);
  const N = 144;
  const pour = F(f, T.c03 + 80, T.c04 + 20, 0, 1, Easing.linear);
  /* ── C04: 격자 정렬 → 전부 같은 사진 → 진동 → 손이 집음 ── */
  const gridT = F(f, T.c04 + 10, T.c04 + 70, 0, 1, inOut);
  const sameT = F(f, T.c04 + 80, T.c04 + 130, 0, 1);
  const vib = f > T.c04 + 90 && f < T.c05 ? 1 : 0;
  const reach = F(f, T.c04 + 116, T.c04 + 150, 0, 1, soft);   // 손이 내려와 사진 윗변에 닿음
  const lift = F(f, T.c04 + 152, T.c04 + 178, 0, 1, soft);     // 닿은 뒤 사진과 손이 같이 올라감
  /* ── C05: 소용돌이 ── */
  const vortex = F(f, T.c05 + 10, T.c05 + 150, 0, 1, Easing.bezier(0.5, 0, 0.9, 1));
  const desat = F(f, T.c05 + 20, T.c05 + 120, 1, 0);

  const showPhoto = f >= T.c02 && f < T.c03 + 84;
  const showPhone = f >= T.c03 + 46 && f < T.c04 + 60;
  const phoneO = F(f, T.c04 + 30, T.c04 + 60, 1, 0);

  return (
    <AbsoluteFill style={{backgroundColor: paper}}>
      {P1CUTS.map((c) => (
        <Sequence key={c.id} from={c.start} durationInFrames={c.duration} name={c.id}>
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
            <feColorMatrix type="matrix" values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .15  0 0 0 .10 0" />
          </filter>
        </defs>
        {/* 붓질 워시 */}
        <rect width={width} height={height} filter="url(#brush)" />

        <g transform={`translate(${width / 2} ${height / 2}) scale(${z}) translate(${-cx} ${-cy})`}>
          {/* 탁자 */}
          {f >= T.c02 && f < T.c03 + 84 && (
            <Shape d={`M${180},${640} h${900 * tableW} v40 h-${900 * tableW} z`} fill={C.table} stroke={C.ink} sw={3} />
          )}
          {/* 벽시계 */}
          {f >= T.c02 + 40 && f < T.c02 + 140 && <Clock x={640} y={330} turns={clockTurns} o={clockO} />}

          {/* 카메라 + 필름 (C01~C02) */}
          {f < T.c02 + 72 && (
            <g opacity={1 - camOut} transform={`translate(0 ${-420 * camOut})`}>
              {/* 필름통 — 카메라 뒤로 들어감 */}
              <g transform={`translate(${canX + canIn * 40} ${430}) scale(${1 - canIn * 0.4})`} opacity={1 - canIn}>
                <Shape d={rr(-28, -46, 56, 92, 8)} fill={C.orange} stroke={C.ink} sw={2.5} />
                <Shape d={rr(-12, -58, 24, 14, 3)} fill={C.cameraDark} stroke={C.ink} sw={2} />
              </g>
              <FilmStrip x={640} y={445} len={stripLen} frames={frames} />
              <Camera x={330} y={300} />
              {/* 렌즈 플래시 */}
              {flash > 0 && <circle cx={560} cy={435} r={90 + 40 * (1 - flash)} fill="#fff" opacity={flash * 0.9} />}
            </g>
          )}
          {/* 사진이 하늘에서 떨어져 탁자에 */}
          {showPhoto && !showPhone && f >= T.c02 + 100 && (
            <Photo x={px} y={py} w={pw} h={ph} seed={3} rot={-10 + 8 * photoDrop} o={photoOut} />
          )}

          {/* 손 넷 + 말풍선 (C02c) */}
          {f >= T.c02 + 130 && f < T.c03 + 60 && (
            <g opacity={F(f, T.c03 + 20, T.c03 + 60, 1, 0)}>
              {/* 세 사람의 손 — 화면 가장자리에서 들어오고 팔은 화면 밖으로. 카메라 뷰: cx 640, cy 520, z 1.1 → 보이는 월드 x 60~1220, y 190~850 */}
              {/* rot 90: 손끝이 오른쪽, 팔은 왼쪽 화면 밖 / rot -90: 반대 / rot 0: 팔이 아래 화면 밖 */}
              <Hand x={540 - 420 * (1 - handIn(T.c02 + 130))} y={630} rot={82} scale={0.62} point sleeve={C.amber} />
              <Hand x={800 + 420 * (1 - handIn(T.c02 + 140))} y={690} rot={-84} scale={0.62} point sleeve={C.sky} />
              <Hand x={610} y={770 + 300 * (1 - handIn(T.c02 + 150))} rot={-14} scale={0.62} point sleeve={C.pink} />
              <Bubble x={110} y={400} w={200} h={80} p={bub(T.c02 + 150)} />
              <Bubble x={960} y={430} w={210} h={84} p={bub(T.c02 + 162)} flip color={C.sky} />
              <Bubble x={400} y={300} w={190} h={76} p={bub(T.c02 + 174)} color={C.pink} />
            </g>
          )}

          {/* 폰 (사진에서 모핑) + 든 손 */}
          {showPhone && (
            <g opacity={phoneO}>
              {(() => {
                const w = pw + (150 - pw) * morph, h = ph + (300 - ph) * morph;
                const x = px + (pw - w) / 2, y = py + (ph - h) / 2 - 60 * morph;
                const rx = 2 + 22 * morph;
                const body = interpolateColors(morph, [0, 1], [C.cream, C.phone]);
                return (
                  <g>
                    <g opacity={morph}><Hand x={x + w / 2 + 30} y={y + h - 30} rot={20} scale={1.2} sleeve={C.camera} /></g>
                    <Shape d={rr(x, y, w, h, rx)} fill={body} stroke={C.ink} sw={2.5} />
                    <rect x={x + 10} y={y + 10 + 14 * morph} width={w - 20} height={h - 20 - 24 * morph} rx={rx * 0.6} fill={interpolateColors(morph, [0, 1], [C.sky, C.screen])} />
                  </g>
                );
              })()}
            </g>
          )}

          {/* 썸네일: 폰에서 쏟아짐 → 격자 → 같은 사진 → 소용돌이 */}
          {f >= T.c03 + 80 && (
            <g>
              {Array.from({length: N}).map((_, i) => {
                const r1 = rand(i, 1), r2 = rand(i, 2), r3 = rand(i, 3);
                const t0 = (i / N) * 0.85;               // 쏟아지는 순서
                const tp = Math.min(1, Math.max(0, (pour - t0) / 0.15));
                if (tp <= 0) return null;
                // 폰 화면(월드 ~ (px+pw/2, py-60)) 에서 포물선으로 바닥에
                const sx = px + pw / 2, sy = py + 40;
                const ex = 120 + r1 * 1040, ey = 700 - r2 * 60;
                const ax = sx + (ex - sx) * tp, ay = sy + (ey - sy) * tp - Math.sin(tp * Math.PI) * (220 + r3 * 200);
                // 격자 위치
                const col = i % 16, row = Math.floor(i / 16);
                const gx = 40 + col * 76, gy = 30 + row * 76;
                let x = ax + (gx - ax) * gridT, y = ay + (gy - ay) * gridT;
                let rot = (r3 - 0.5) * 40 * (1 - gridT);
                if (vib) { x += Math.sin(f / (5 + r1 * 4) + i) * 1.6; y += Math.cos(f / (6 + r2 * 4) + i * 1.3) * 1.6; }
                // 소용돌이: 중심 (640,360) 기준 극좌표
                let sc = 1, o = 1;
                if (vortex > 0) {
                  const dx = gx - 640, dy = gy - 360, R0 = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx);
                  const own = Math.min(1, Math.max(0, (vortex - r2 * 0.25) / 0.75));
                  const R = R0 * (1 - own) + 10 * own, a = a0 + own * 3.2;
                  x = 640 + Math.cos(a) * R; y = 360 + Math.sin(a) * R;
                  sc = 1 - own * 0.85; rot = own * 120; o = 1 - own * own;
                }
                const lifted = i === 71 ? lift : 0;
                return (
                  <g key={i} transform={`translate(0 ${-lifted * 40})`}>
                    <Photo x={x} y={y} w={64 * sc} seed={i} rot={rot} sat={desat} same={sameT > (i / N)} o={o} />
                  </g>
                );
              })}
              {/* 한 장 집는 손 */}
              {reach > 0 && f < T.c05 + 30 && (
                <g opacity={F(f, T.c05, T.c05 + 30, 1, 0)}>
                  <Hand x={40 + 7 * 76 + 32 - 6} y={30 + 4 * 76 + 24 - 49 - lift * 40 - 260 * (1 - reach)} rot={180} scale={0.7} point sleeve={C.amber} />
                </g>
              )}
            </g>
          )}
        </g>
        {/* 셔터 플래시 (전체) */}
        {flash > 0 && <rect width={width} height={height} fill="#fff" opacity={flash * 0.45} />}
        {/* 종이 알갱이 */}
        <rect width={width} height={height} filter="url(#grain)" />
        {/* 소용돌이 어둠 */}
        <rect width={width} height={height} fill={C.deep} opacity={F(f, T.c05 + 120, END - 10, 0, 0.9)} />
      </svg>
      {P1CUTS.map((c) => (
        <Sequence key={'s' + c.id} from={c.start} durationInFrames={c.duration} name={'sub ' + c.id}>
          <Subtitle cut={c} light={f < T.c05 + 90} />
        </Sequence>
      ))}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 60%, rgba(60,40,20,0.12) 100%)'}} />
    </AbsoluteFill>
  );
};
