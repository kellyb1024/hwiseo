import React from 'react';
// @ts-ignore — 캐릭터 소스는 순수 JS (design/character/hwiseo-F.js 복사본)
import HWF from './hwiseo-F.js';

/* 휘서 F(네모 양초) 를 Remotion 안에서 쓰기 위한 래퍼. 2026-09-03.
 * 옛 HwiseoChar(불꽃머리 SVG 변환본)를 대체한다.
 *
 * ⚠ 원본은 반복 모션을 CSS @keyframes 로 돌린다 → Remotion(프레임 단위 렌더)에서는 CSS 애니메이션을
 *   쓸 수 없다. 그래서 HWF.CSS 는 아예 넣지 않고, 움직임은 전부 프레임 계산 → 속성 transform 으로 넣는다.
 *   (CSS 를 안 넣으므로 원본 규칙 1 '속성 transform 과 CSS transform 혼용 ✗' 에도 안 걸린다)
 * ⚠ lids:false 필수 — 눈꺼풀 rect 는 CSS 의 scaleY(0) 로 숨기는 구조라, CSS 없이 그리면 눈을 덮어버린다.
 *
 * 연필(pencil) 옵션 — 이 영상의 그림체(연필 윤곽 + 어긋난 채움 + 쭈글)를 캐릭터 위에 얹는다. 캐릭터 소스는 안 건드림 (앱은 아웃라인 없는 플랫 그대로).
 *   · 채움(몸·캡·불꽃)을 off 만큼 밀고 fillFilter 를 건다
 *   · 같은 윤곽(몸·캡 방울선·불꽃 겉)을 잉크 선으로 맨 위에 다시 그린다 (outlineFilter = 쭈글)
 *   · texture 'grain' 은 fillFilter 안에서 알갱이를 만들고, 'hatch' 는 채움을 반투명으로 낮춘 뒤 빗금을 클리핑해 올린다
 *   모든 수치는 캐릭터 로컬 좌표(420 단위 · 화면 배율 ≈1.24) 기준 — 씬의 다른 wob 필터 값을 그대로 쓰면 안 됨. P5Flat 의 char*F 필터 참고.
 *
 * 좌표계(원본 그대로): viewBox -60 -50 420 420 · 중심 x=150 · 바닥선 y=316 · 불꽃 밑동 (150,102)
 */
export const CHAR_VB = {x: -60, y: -50, w: 420, h: 420};
export const CHAR_CENTER = 150;    // 좌우 중심
export const CHAR_GROUND = 316;    // 바닥선 (발/그림자 기준)
export const CHAR_FLAME_BASE: [number, number] = [150, 102];   // 불꽃 밑동 = 심지 끝
export const CHAR_TOP_L3 = 13;     // level 3(big) 불꽃 끝 y
export const CHAR_BOTTOM = 333;    // 바닥 그림자 아래끝

type Opts = {
  level?: number;
  mood?: string;
  pose?: string;
  view?: 'front' | 'q' | 'side' | 'back';
  wax?: string;
};

export type Pencil = {
  ink: string;
  sw: number;                       // 윤곽 굵기 (로컬 단위)
  off: [number, number];            // 채움 어긋남 (로컬 단위)
  outlineFilter?: string;           // 윤곽선 쭈글, 예: url(#charOutlineF)
  fillFilter?: string;              // 채움 (어긋남 쭈글 + grain 이면 알갱이까지 한 필터에서)
  texture?: 'grain' | 'hatch' | 'none';
  hatch?: {spacing: number; sw: number; base: number; filter?: string};   // base = 빗금 밑 플랫 채움 불투명도
  rim?: {color: string; sw: number; opacity: number};                     // 색연필 가장자리 눌림 (몸 안쪽 진한 테)
};

/** HWF.char() 결과에서 바깥 <svg> 를 벗겨 내용만 돌려준다 (씬 SVG 안에 <g> 로 넣기 위함) */
const inner = (opts: Opts): string => {
  const s: string = HWF.char({...opts, lids: false});
  return s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
};

const m1 = (s: string, re: RegExp) => { const m = s.match(re); return m ? m[1] : ''; };

/** 빗금 한 장: bbox 를 넉넉히 덮는 평행선 묶음을 (150,170) 기준으로 rot 만큼 돌린 것 */
const hatchLines = (spacing: number, rot: number) => {
  const segs: string[] = [];
  for (let y = -320; y <= 640; y += spacing) segs.push(`M-300,${y} H600`);
  return {d: segs.join(' '), t: `rotate(${rot} 150 170)`};
};

let pid = 0;

export const HwiseoCharF: React.FC<{
  /** 불꽃 흔들림 — .hw-flame 그룹에 그대로 들어가는 transform 문자열 (원점 150,102) */
  flameTransform?: string;
  /** 심지 미세 흔들림 (원점 150,122) */
  wickTransform?: string;
  /** 속불+심(겉불 뺀 나머지 층)만 따로 — 겉불과 다른 위상으로 더 빠르게 일렁이게 (원점 150,102) */
  innerTransform?: string;
  /** 캐릭터 전체(.hw-posed) 쭈글 필터 — pencil 을 쓰면 보통 비움 (윤곽/채움이 각자 필터를 가짐) */
  bodyFilter?: string;
  /** 불꽃(.hw-flame) 쭈글 필터 */
  flameFilter?: string;
  pencil?: Pencil;
  opts?: Opts;
}> = ({flameTransform, wickTransform, innerTransform, bodyFilter, flameFilter, pencil, opts}) => {
  const key = JSON.stringify([opts ?? {}, pencil ?? null]);
  const html = React.useMemo(() => {
    let h = inner(opts ?? {});

    // ── 원본에서 윤곽 추출 (연필 레이어용) ──
    const BODYD = m1(h, /class="hw-bodyfill" d="([^"]+)"/);
    const bodyT = m1(h, /<g class="hw-body" transform="([^"]*)"/);
    const DRIPD = m1(h, /class="hw-drips" d="([^"]+)"/);
    const wrapT = m1(h, /<g class="hw-flame-wrap"\s*(?:transform="([^"]*)")?\s*>/);
    const flameInner = m1(h, /<g class="hw-flame[^"]*">([\s\S]*?)<\/g>/);
    const flamePaths = [...flameInner.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g)].map((m) => ({d: m[1], fill: m[2]}));
    const FLAMED = flamePaths[0]?.d ?? '';
    const bodyFill = m1(h, /class="hw-bodyfill" d="[^"]+" fill="([^"]+)"/);
    const dripFill = m1(h, /class="hw-drips" d="[^"]+" fill="([^"]+)"/);

    // ── 반복 모션·필터를 속성으로 주입 ──
    if (flameTransform) h = h.replace('class="hw-flame ', `transform="${flameTransform}" class="hw-flame `);
    if (wickTransform) h = h.replace('class="hw-wick"', `transform="${wickTransform}" class="hw-wick"`);
    if (flameFilter) h = h.replace('class="hw-flame ', `filter="${flameFilter}" class="hw-flame `);
    if (bodyFilter) h = h.replace('class="hw-posed"', `filter="${bodyFilter}" class="hw-posed"`);
    // 속불 위상 분리: hw-flame 안의 첫 path(겉불) 뒤부터 닫는 태그까지를 <g transform> 으로 감싼다
    if (innerTransform) {
      h = h.replace(/(<g[^>]*class="hw-flame[^"]*">\s*<path [^>]*\/>)([\s\S]*?)(<\/g>)/, (_m, a, mid, c) => `${a}<g transform="${innerTransform}">${mid}</g>${c}`);
    }

    if (!pencil) return h;

    // ── 연필 레이어 ──
    const [ox, oy] = pencil.off;
    const tex = pencil.texture ?? 'grain';
    const baseOp = tex === 'hatch' ? (pencil.hatch?.base ?? 0.45) : 1;
    const fillAttr = `${pencil.fillFilter ? ` filter="${pencil.fillFilter}"` : ''}${baseOp < 1 ? ` opacity="${baseOp}"` : ''}`;
    // 채움 3덩이(몸·캡·불꽃)를 off 만큼 밀고 채움 필터를 건다 — 기존 transform 앞에 translate 를 붙이는 식
    h = h.replace(/<g class="hw-body" transform="/, `<g class="hw-body"${fillAttr} transform="translate(${ox},${oy}) `);
    h = h.replace(/<g class="hw-cap" transform="/, `<g class="hw-cap"${fillAttr} transform="translate(${ox},${oy}) `);
    h = h.replace(/<g class="hw-flame-wrap"\s*(?:transform="([^"]*)")?\s*>/, (_m, t) => `<g class="hw-flame-wrap"${fillAttr} transform="translate(${ox},${oy}) ${t ?? ''}">`);

    const id = 'hwp' + (pid++);
    const flameG = (content: string) => `<g transform="${wrapT}"><g transform="${flameTransform ?? ''}"${flameFilter ? ` filter="${flameFilter}"` : ''}>${content}</g></g>`;
    let extra = '';

    // 빗금: 플랫 채움 위에 같은 색 선을 클리핑해서 올림 (부위마다 각도 다르게).
    // 얼굴·심지(잉크) 밑에 깔려야 하므로 extra 가 아니라 원본 순서 안에 끼워 넣는다: 몸·캡 빗금은 심지 앞, 불꽃 빗금은 얼굴 앞 (+속불·심을 다시 올림)
    if (tex === 'hatch') {
      const hs = pencil.hatch?.spacing ?? 5.5, hw = pencil.hatch?.sw ?? 2.2, hf = pencil.hatch?.filter ? ` filter="${pencil.hatch.filter}"` : '';
      const hb = hatchLines(hs, 34), hc = hatchLines(hs, -26), hfl = hatchLines(hs * 0.9, 58);
      const bodyHatch = `<defs>
        <clipPath id="${id}b"><path d="${BODYD}" transform="${bodyT}"/></clipPath>
        <clipPath id="${id}c"><path d="${DRIPD}" transform="${bodyT}"/></clipPath>
        <clipPath id="${id}f"><path d="${FLAMED}"/></clipPath>
      </defs>
      <g class="hw-hatch" fill="none" stroke-width="${hw}" stroke-linecap="round" transform="translate(${ox},${oy})"${hf}>
        <g clip-path="url(#${id}b)"><path d="${hb.d}" transform="${hb.t}" stroke="${bodyFill}"/></g>
        <g clip-path="url(#${id}b)"><g clip-path="url(#${id}c)"><path d="${hc.d}" transform="${hc.t}" stroke="${dripFill}"/></g></g>
      </g>`;
      const flameHatch = `<g class="hw-hatch" fill="none" stroke-width="${hw}" stroke-linecap="round" transform="translate(${ox},${oy})"${hf}>
        ${flameG(`<g clip-path="url(#${id}f)"><path d="${hfl.d}" transform="${hfl.t}" stroke="${flamePaths[0]?.fill ?? '#F6C33C'}"/></g>`)}
      </g>
      <g transform="translate(${ox},${oy})">${flameG(flamePaths.slice(1).map((p) => `<path d="${p.d}" fill="${p.fill}"/>`).join(''))}</g>`;
      // 심지 태그는 위에서 transform 이 앞에 끼어들었을 수 있어 class 앞 속성을 허용. 못 찾으면 빗금이 클립 없이 화면을 덮으니 반드시 걸려야 함
      if (!/<(?:rect|path)[^>]*class="hw-wick"/.test(h)) throw new Error('HwiseoCharF: hw-wick not found — hatch insertion point');
      h = h.replace(/(<(?:rect|path)[^>]*class="hw-wick")/, bodyHatch + '$1');
      h = h.replace(/(<g class="hw-eyes">)/, flameHatch + '$1');
    }

    // 가장자리 눌림: 몸 안쪽으로 진한 테 (색연필이 윤곽 근처에서 진해지는 것)
    if (pencil.rim) {
      extra += `<defs><clipPath id="${id}r"><path d="${BODYD}" transform="${bodyT}"/></clipPath></defs>
      <g clip-path="url(#${id}r)" transform="translate(${ox},${oy})"${pencil.fillFilter ? ` filter="${pencil.fillFilter}"` : ''}>
        <path d="${BODYD}" transform="${bodyT}" fill="none" stroke="${pencil.rim.color}" stroke-width="${pencil.rim.sw}" opacity="${pencil.rim.opacity}"/>
      </g>`;
    }

    // 잉크 윤곽 (맨 위): 몸 + 캡 방울선(몸에 클리핑) + 불꽃 겉. 심지·얼굴은 원래 잉크라 그대로.
    extra += `<defs><clipPath id="${id}o"><path d="${BODYD}" transform="${bodyT}"/></clipPath></defs>
    <g class="hw-pencil" fill="none" stroke="${pencil.ink}" stroke-width="${pencil.sw}" stroke-linejoin="round" stroke-linecap="round"${pencil.outlineFilter ? ` filter="${pencil.outlineFilter}"` : ''}>
      <path d="${BODYD}" transform="${bodyT}"/>
      <g clip-path="url(#${id}o)"><path d="${DRIPD}" transform="${bodyT}"/></g>
      ${flameG(`<path d="${FLAMED}"/>`)}
    </g>`;

    // 심지는 연필 윤곽보다 위에 있어야 한다 (사용자 2026-09-03) → 원래 자리에서 떼어 윤곽 뒤에 다시 붙임
    const wickM = h.match(/<(?:rect|path)[^>]*class="hw-wick"[^>]*\/>/);
    if (wickM) { h = h.replace(wickM[0], ''); extra += wickM[0]; }

    // 연필 레이어는 .hw-figure 안(포즈 transform 아래)에 들어가야 캐릭터와 같이 움직인다 → hw-posed 의 닫는 태그 바로 앞에 삽입
    const closeIdx = h.lastIndexOf('</g></g>');   // `</g></g>` = hw-posed, hw-figure 닫힘 (원본 조립 순서 고정)
    h = closeIdx >= 0 ? h.slice(0, closeIdx) + extra + h.slice(closeIdx) : h + extra;
    return h;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, flameTransform, wickTransform, innerTransform, bodyFilter, flameFilter]);

  return <g dangerouslySetInnerHTML={{__html: html}} />;
};
