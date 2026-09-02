import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, delayRender, continueRender} from 'remotion';

/** 번들된 Pretendard를 로드하고, 끝날 때까지 캡처를 미룬다 — 어느 환경에서 렌더해도 같은 폰트 */
const FONTS: [string, string][] = [['fonts/Pretendard-Regular.ttf', '400'], ['fonts/Pretendard-Medium.ttf', '500']];
let fontsLoaded: Promise<void> | null = null;
const loadFonts = () => fontsLoaded ??= Promise.all(FONTS.map(([f, weight]) =>
  new FontFace('Pretendard', `url(${staticFile(f)})`, {weight}).load().then((ff) => { document.fonts.add(ff); })
)).then(() => undefined);
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { loadFonts().catch(() => undefined).finally(() => continueRender(h)); }, [h]);
};
import {ChalkDefs} from './Chalk';
import {lampsAt, LightLayer} from './Light';
import {theme} from '../theme';
import type {Cut} from '../types';

/** 모든 컷이 공유하는 무대: 어둠 배경 → 종이 결 → 장면(SVG) → 자막 → 비네트 */
export const Stage: React.FC<{
  cut: Cut;
  glow?: number;
  bg?: string;
  light?: boolean;
  paper?: 'dark' | 'cream';
  children: React.ReactNode;
}> = ({cut, glow = 0.08, bg, light, paper = 'dark', children}) => {
  const cream = paper === 'cream';
  const isLight = light ?? cream;
  useFonts();
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const seed = Math.floor(frame / theme.boilEvery) * 7;
  const lamps = lampsAt(cut.start + frame);

  return (
    <AbsoluteFill style={{backgroundColor: bg ?? (cream ? theme.color.cream : theme.color.bg)}}>
      <Audio src={staticFile(`vo/${cut.vo}`)} />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block'}}>
        <ChalkDefs seed={seed} glow={glow} />
        {cream ? (
          <>
            <filter id="cpaper">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={4} seed={seed + 90} />
              <feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  0 0 0 .09 0" />
            </filter>
            <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
              {/* 코드 선을 이미지의 연필 선처럼: 살짝 흔들림 + 흑연 알갱이 + 부드러운 가장자리 */}
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed} result="warp" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale={2.5} xChannelSelector="R" yChannelSelector="G" result="wob" />
              <feGaussianBlur in="wob" stdDeviation={0.45} result="soft" />
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={3} seed={seed + 40} result="g" />
              <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.3 0 0 0 -0.05" result="ga" />
              <feComposite in="soft" in2="ga" operator="in" />
            </filter>
            <rect width={width} height={height} filter="url(#cpaper)" />
          </>
        ) : (
          <>
            <LightLayer lamps={lamps} />
            <rect width={width} height={height} filter="url(#paper)" />
          </>
        )}
        {children}
      </svg>
      <Subtitle cut={cut} light={isLight} />
      <AbsoluteFill style={{pointerEvents: 'none', background: cream
        ? 'radial-gradient(ellipse at center, transparent 60%, rgba(60,40,20,0.10) 100%)'
        : 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.28) 100%)'}} />
    </AbsoluteFill>
  );
};

/** 손그림 필터 묶음: 글로우 → 분필 */
export const Chalky: React.FC<{children: React.ReactNode}> = ({children}) => (
  <g filter="url(#glow)"><g filter="url(#chalk)">{children}</g></g>
);

/* 자막 분할: 한 줄(≈36자)을 넘는 문장은 쉼표/띄어쓰기 기준으로 둘로 나눠 글자 수 비례로 순차 표시 (읽는 속도 고려) */
export const splitKr = (kr: string): string[] => {
  if (kr.includes('|')) return kr.split('|').map((t) => t.trim()).filter(Boolean);   // 수동 분할 (스토리보드 호흡)
  if (kr.length <= 36) return [kr];
  const mid = kr.length / 2;
  const cands: number[] = [];
  for (let i = 0; i < kr.length; i++) if ((kr[i] === ',' || kr[i] === '.') && kr[i + 1] === ' ') cands.push(i + 1);
  const periods = cands.filter((i) => kr[i - 1] === '.');
  if (periods.length) return [kr.slice(0, periods[0]).trim(), kr.slice(periods[0]).trim()];
  let cut = cands.length ? cands.reduce((b, i) => Math.abs(i - mid) < Math.abs(b - mid) ? i : b) : -1;
  if (cut < 0 || Math.abs(cut - mid) > kr.length * 0.3) {
    let best = -1;
    for (let i = 0; i < kr.length; i++) if (kr[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    cut = best;
  }
  if (cut < 0) return [kr];
  return [kr.slice(0, cut).trim(), kr.slice(cut).trim()];
};

export const Subtitle: React.FC<{cut: Cut; light?: boolean}> = ({cut}) => {
  const frame = useCurrentFrame();
  const parts = splitKr(cut.kr);
  const total = parts.reduce((n, t) => n + t.length, 0);
  const hold = Math.min(cut.duration - 6, cut.voFrames + 18);   // 마지막 자막이 사라지기 시작하는 프레임
  // 각 조각 구간: 글자 수 비례
  let acc = 0;
  const spans = parts.map((t) => { const a = acc; acc += (t.length / total) * hold; return [a, acc] as const; });
  const style: React.CSSProperties = {
    maxWidth: 1000, padding: '0 20px',
    color: '#FFFFFF', fontFamily: theme.font.sans, fontSize: 28, fontWeight: 500, lineHeight: 1.4,
    textAlign: 'center', wordBreak: 'keep-all',
    textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.9)',
  };
  // 넷플릭스식: 상자 없음, 흰 글자 + 얇은 그림자, 하단 가까이
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      {parts.map((t, i) => {
        const [a, b] = spans[i];
        const last = i === parts.length - 1;
        const o = interpolate(frame, [a, a + 6, last ? b : b - 4, last ? b + 10 : b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        if (o <= 0) return null;
        return <div key={i} style={{...style, opacity: o, position: 'absolute', bottom: 0}}>{t}</div>;
      })}
    </div>
  );
};
