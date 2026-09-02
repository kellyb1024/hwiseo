import React, {useMemo, useEffect, useState} from 'react';
import {useCurrentFrame, interpolate, staticFile, delayRender, continueRender} from 'remotion';
import {theme} from '../theme';

/** 이미지가 디코드될 때까지 프레임 캡처를 미룬다 (안 하면 큰 PNG가 가끔 빈 채로 찍힘) */
const useDecoded = (url: string) => {
  const [handle] = useState(() => delayRender(`decode ${url}`));
  useEffect(() => {
    const img = new Image(); img.src = url;
    img.decode().catch(() => undefined).finally(() => continueRender(handle));
  }, [url, handle]);
};

export type Fill = {poly: string; x0: number; y0: number; x1: number; y1: number};
export type Strokes = {
  w: number; h: number; strokes: {d: string; len: number}[]; fills?: Fill[];
  /** 그리는 순서. 없으면 선 전부 → 채색 전부 */
  order?: {t: 's' | 'f'; i: number}[];
};

const parse = (d: string) => d.replace(/[MZ]/g, '').trim().split(/\s*L\s*/).map((s) => s.split(',').map(Number)) as [number, number][];
const polyLen = (pts: [number, number][]) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
const pointAt = (pts: [number, number][], t: number, len: number) => {
  let target = t * len;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (target <= seg) { const k = seg ? target / seg : 0; return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]; }
    target -= seg;
  }
  return pts[pts.length - 1];
};
/** 채색 영역을 크레파스로 칠하듯 — 비스듬한 지그재그 */
const scribble = (f: Fill, gap: number): [number, number][] => {
  const pts: [number, number][] = [];
  const w = f.x1 - f.x0, slant = w * 0.25;
  let dir = 1;
  for (let y = f.y0 - gap; y <= f.y1 + gap; y += gap) {
    const a: [number, number] = [f.x0 - slant, y + slant * 0.5], b: [number, number] = [f.x1 + slant, y - slant * 0.5];
    pts.push(dir > 0 ? a : b); pts.push(dir > 0 ? b : a); dir = -dir;
  }
  return pts;
};
const toD = (pts: [number, number][]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');

type Item = {kind: 's' | 'f'; d: string; pts: [number, number][]; len: number; eff: number; clip?: number};

/**
 * 래스터 연필 그림을 "그어지듯" 드러낸다.
 * 중심선 스트로크(JSON)를 마스크로 써서 원본 질감을 순서대로 노출. 채색 영역은 테두리 다음에 크레파스처럼 칠한다.
 * fillSpeed: 칠하기 속도 배수 (1보다 크면 선보다 빨리 칠함)
 */
export const PencilImage: React.FC<{
  id: string; src: string; strokes: Strokes;
  x: number; y: number; w: number; at: number; dur: number;
  maskWidth?: number; blend?: 'multiply' | 'screen'; tip?: boolean; fillSpeed?: number;
}> = ({id, src, strokes, x, y, w, at, dur, maskWidth = 14, blend = 'multiply', tip = true, fillSpeed = 2.5}) => {
  const frame = useCurrentFrame();
  const url = staticFile(src);
  useDecoded(url);
  const scale = w / strokes.w;
  const items = useMemo<Item[]>(() => {
    const fills = strokes.fills ?? [];
    const order = strokes.order ?? [
      ...strokes.strokes.map((_, i) => ({t: 's' as const, i})),
      ...fills.map((_, i) => ({t: 'f' as const, i})),
    ];
    return order.map((o) => {
      if (o.t === 's') { const s = strokes.strokes[o.i]; return {kind: 's', d: s.d, pts: parse(s.d), len: s.len, eff: s.len}; }
      const pts = scribble(fills[o.i], maskWidth * 0.8); const len = polyLen(pts);
      return {kind: 'f', d: toD(pts), pts, len, eff: len / fillSpeed, clip: o.i};
    });
  }, [strokes, maskWidth, fillSpeed]);
  const total = useMemo(() => items.reduce((a, s) => a + s.eff, 0), [items]);
  const p = interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.draw});
  if (p <= 0) return null;
  const P = p * total;
  let tipPt: number[] | null = null; let cum = 0;
  const els = items.map((s, i) => {
    const sp = Math.min(1, Math.max(0, (P - cum) / s.eff)); cum += s.eff;
    if (sp <= 0) return null;
    if (sp < 1 && !tipPt) tipPt = pointAt(s.pts, sp, s.len);
    const path = <path d={s.d} pathLength={1} fill="none" stroke="#fff" strokeWidth={s.kind === 'f' ? maskWidth * 1.3 : maskWidth}
      strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - sp} />;
    return s.kind === 'f' ? <g key={i} clipPath={`url(#${id}-clip${s.clip})`}>{path}</g> : <g key={i}>{path}</g>;
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        {(strokes.fills ?? []).map((f, i) => <clipPath key={i} id={`${id}-clip${i}`}><path d={f.poly} /></clipPath>)}
      </defs>
      <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={strokes.w} height={strokes.h}>
        {els.filter((_, i) => items[i].kind === 's')}
        {(strokes.fills ?? []).map((f, i) => <path key={'k' + i} d={f.poly} fill="#000" />)}
        {els.filter((_, i) => items[i].kind === 'f')}
      </mask>
      <image href={url} width={strokes.w} height={strokes.h} mask={`url(#${id})`}
        preserveAspectRatio="none" style={{mixBlendMode: blend}} />
      {tip && tipPt && p < 1 && <circle cx={tipPt[0]} cy={tipPt[1]} r={maskWidth * 0.3} fill="#4A4550" opacity={0.7} />}
    </g>
  );
};
