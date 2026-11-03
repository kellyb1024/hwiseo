// ── 휘서 F — 네모 양초 캐릭터 (2026-09-01, 9/1 밤 재작업) ─────────────────────────
// 레퍼: Lumi 시트(ChatGPT Image Sep 1 06_21_28) + 3/4 컷(image-cache 23). 아웃라인 없음, 완전 플랫.
// 애니메이션을 전제로 부품을 나눈다. 모든 움직이는 부품에 class 가 있고, transform-origin 은 CSS 또는 inline 으로 잡는다.
// ⚠ 규칙 3가지 (전부 실제로 터졌던 버그다)
//   1) 한 요소에 속성 transform 과 CSS transform 을 같이 두지 말 것 — CSS 가 속성을 통째로 덮어쓴다 (불꽃 크기·팔 각도가 무시됐음)
//   2) transform-origin 을 px 로 줄 때 기본은 view-box 기준. 부품 자기 박스 기준이 필요하면 transform-box:fill-box 를 반드시 같이 (눈꺼풀이 깜빡일 때 위로 튀었음)
//   3) 루트 <svg> 자체에 CSS transform 을 걸지 말 것 — 안쪽 .hw-figure 에 건다
//   .hw-figure > .hw-posed   포즈(회전·이동)는 .hw-posed 의 attribute, 반복 모션은 .hw-figure 의 CSS — 둘이 안 싸움
//   .hw-cap    촛농 캡 (몸 위에 얹힘, 몸보다 6px 넓음)   .hw-drips 캡 안의 방울 path   .hw-body 몸통(원통+물결 밑단)
//   .hw-flame-wrap > .hw-flame  불꽃 (origin 150,102 = 심지 끝). 크기·기울기는 wrap 속성, 흔들림은 .hw-flame CSS. 7종: base/big/bright/sway/spiky/heart/small/off          .hw-wick  심지 (origin 150,120)  .hw-glow 후광(레벨4만)
//   .hw-eye .hw-pupil .hw-lid .hw-brow .hw-mouth .hw-cheek   얼굴 부품
//   .hw-arm-l / .hw-arm-r  팔 (origin 어깨는 inline transform-origin, 속성 transform 은 rotate(각도)만 — cx,cy 를 같이 쓰면 중심이 두 번 적용됨)     .hw-foot  발     .hw-prop  소품(깃발·하트·모자·친구…)
//   .hw-sparks 반짝   .hw-shadow 바닥 그림자
// 좌표계 viewBox 0 0 300 340.
//   몸  = 레퍼 24 윤곽 트레이스(x59~241 · y118~314, Chaikin으로 둥글림).  캡 = 몸에 클리핑, 아랫선은 둥근 방울 3개(오른 38·가운데 18·왼 54)
//   눈  y203 (흰자 r15 · 동공 r6.5)  x116/179       입 (149,232) 폭19       심지 y100~120 폭9   불꽃 밑 y100
// 실측(레퍼 24, 몸 폭=100%): 캡 두께 왼 23%/오른 14%(비대칭) · 방울 왼 x34% 깊이33% / 오른 x75% 깊이40% / 오른 모서리 흐름 · 눈 높이46% 간격35% r8.3% · 입 높이64% 폭10% · 기본 표정엔 볼 없음
(function(root){
// ── 캔버스 규격 (9/1 확정) — 모든 포즈·레벨·모션이 잘리지 않는 기준. 앱에서도 이 viewBox 를 그대로 쓴다 ──
//   CANVAS  -60,-50 ~ 360,370 (420×420 정사각). 캐릭터 중심 x=150 = 캔버스 중심, 바닥선 y=316 고정
//   ZONE.still  58,18 ~ 242,333   정지 정면(불꽃 커짐까지) — 아이콘·칩은 이 영역만 잘라 써도 됨
//   ZONE.motion 14,-40 ~ 320,363  포즈·소품·레벨4·CSS 모션(점프 -30, 튕김 ×1.12)까지 포함 — 이 밖으로 나가는 부품을 만들지 말 것
//   여백: motion 과 canvas 사이 ≥ 30 (좌 74 · 우 40 · 상 10+ · 하 7) → 새 소품·포즈는 ZONE.motion 안에서만 설계
const VB='-60 -50 420 420';
const ZONE={still:[58,18,242,333],motion:[14,-40,320,363],canvas:[-60,-50,360,370],center:150,ground:316};
const C={body:'#FFD54A',wax:'#F2B233',top:'#FFE9A0',fl:'#F9C93F',fo:'#F2A93B',fm:'#FFD54A',fm2:'#FBE38A',fi:'#FDF3C4',glow:'#FFE9A0',
         ink:'#2E2418',white:'#FFFBF3',cheek:'#F7A59B',smoke:'#C9C2B8',red:'#FF7A45',pink:'#FF8FA0',tear:'#8FD3F4',
         purple:'#7B5CD6',lilac:'#EADFEE',mint:'#9FE0C8'};

// ── 불꽃 ─────────────────────────────────────────────────────
// ── 불꽃: 기본형은 레퍼 27 트레이스(겉 연노랑 + 밑동 주황). 커짐/흔들림/작아짐/꺼짐은 같은 윤곽을 스케일·회전. 혀 3개는 화남(spiky)만 ──
const F27={outer:'M149.5,42.3 L150.5,42.5 L151.5,42.9 L152.6,43.6 L153.8,44.6 L155.1,45.8 L156.2,47.1 L157.3,48.5 L158.2,50.0 L159.1,51.7 L159.8,53.3 L160.3,55.0 L160.8,56.8 L161.1,58.6 L161.3,59.9 L161.7,60.8 L161.9,61.3 L162.2,61.3 L162.5,61.1 L162.8,60.8 L163.0,60.4 L163.2,59.8 L163.5,59.4 L163.8,59.1 L164.1,59.0 L164.5,59.1 L165.0,59.7 L165.7,60.8 L166.4,62.3 L167.3,64.4 L168.1,66.6 L168.6,69.0 L169.0,71.6 L169.2,74.4 L169.3,77.1 L169.2,79.6 L169.1,82.1 L168.8,84.4 L168.3,86.7 L167.6,88.8 L166.8,90.9 L165.8,93.0 L164.8,94.7 L163.9,96.2 L163.0,97.5 L162.0,98.5 L161.1,99.4 L160.2,100.2 L159.3,100.9 L158.4,101.5 L157.4,102.0 L156.3,102.3 L155.1,102.4 L153.8,102.4 L152.7,102.4 L151.9,102.2 L151.3,102.1 L151.0,101.9 L150.7,101.8 L150.2,101.8 L149.7,101.9 L149.1,102.1 L148.3,102.2 L147.2,102.3 L145.9,102.2 L144.4,102.1 L143.2,102.0 L142.3,101.7 L141.7,101.4 L141.3,101.0 L140.9,100.6 L140.4,100.2 L139.7,99.8 L138.9,99.4 L138.2,99.0 L137.5,98.5 L136.9,98.0 L136.4,97.5 L135.9,96.8 L135.3,95.9 L134.7,94.7 L134.0,93.2 L133.4,91.8 L132.9,90.4 L132.5,89.0 L132.2,87.6 L132.0,86.0 L132.0,84.1 L132.2,82.0 L132.5,79.7 L132.8,77.7 L133.1,76.0 L133.5,74.5 L133.9,73.5 L134.4,72.3 L134.9,71.1 L135.6,69.8 L136.2,68.5 L137.2,67.1 L138.3,65.6 L139.6,64.0 L141.1,62.3 L142.3,60.4 L143.0,58.5 L143.4,56.4 L143.4,54.2 L143.6,52.1 L143.9,50.1 L144.5,48.2 L145.2,46.3 L145.8,44.9 L146.4,43.8 L146.9,43.0 L147.4,42.6 L148.0,42.3 L148.8,42.2 Z', inner:'M150.6,78.6 L151.1,78.6 L151.7,79.2 L152.6,80.5 L153.6,82.4 L154.8,84.9 L155.8,87.1 L156.5,88.8 L157.1,90.2 L157.4,91.2 L157.6,92.3 L157.7,93.5 L157.7,94.8 L157.6,96.3 L157.4,97.5 L157.2,98.6 L157.0,99.6 L156.7,100.4 L156.3,101.0 L156.0,101.5 L155.8,101.9 L155.4,102.1 L155.0,102.2 L154.5,102.4 L153.8,102.4 L153.0,102.4 L152.3,102.4 L151.8,102.2 L151.3,102.1 L151.0,101.9 L150.7,101.8 L150.2,101.8 L149.7,101.9 L149.1,102.1 L148.4,102.2 L147.6,102.4 L146.7,102.4 L145.7,102.4 L144.8,102.2 L144.0,101.7 L143.3,101.1 L142.6,100.1 L142.2,99.0 L141.9,97.7 L141.7,96.2 L141.7,94.5 L142.0,92.6 L142.6,90.6 L143.5,88.5 L144.8,86.2 L145.9,84.2 L146.9,82.5 L147.8,81.2 L148.6,80.1 L149.3,79.4 L150.0,78.9 Z'};
const FLAME={
  base:  {outer:F27.outer, inner:F27.inner, core:'M150,102 C146,99 145,92 150,84 C155,92 154,99 150,102 Z'},
  // 3단계(커짐): 레퍼 29 구성 — 크기만 키운 게 아니라 왼쪽 혀 + 오른쪽으로 기운 끝 + 진한 금색 겉 + 주황 속 + 흰 심
  big:   {outer:'M150,102 C130,96 121,82 125,65 C128,54 134,50 133,40 C138,49 144,49 146,41 C148,29 150,21 154,13 C161,26 169,37 173,49 C177,61 177,75 170,85 C164,95 158,100 150,102 Z', outerCol:'#F6C33C',
          inner:'M150,102 C138,96 133,84 138,70 C142,59 148,53 150,45 C155,56 161,64 164,75 C166,85 162,96 150,102 Z', innerCol:'#F29D33',
          core:'M150,102 C143,98 141,90 145,81 C147,76 149,72 150,67 C154,74 156,81 156,88 C156,95 154,100 150,102 Z', coreCol:'#FFF8E6'},
  sway:  {from:'base', k:1.05, rot:-14},
  small: {inner:F27.inner, core:'M150,102 C147,100 146,95 150,90 C154,95 153,100 150,102 Z', k:.62},
  // 꺼짐: 회색 뭉게구름 (원 4개 합친 덩어리) — 심지 위 y~86 중심, 폭 ~34
  off:   {wisp:'M145,97 c-5,-6 4,-10 0,-17 c-3,-5 3,-8 1,-13'},   // 굽은 심지 끝에서 올라가는 가는 연기 한 줄 (레퍼 28)
  spiky: {outer:'M150,102 L132,96 L137,82 L123,74 L138,68 L133,50 L146,54 L150,30 L154,54 L167,50 L162,68 L177,74 L163,82 L168,96 Z', outerCol:'#F0603A',
          inner:'M150,102 C142,96 141,82 150,66 C159,82 158,96 150,102 Z', innerCol:'#F5A33A', core:'M150,102 C146,98 145,91 150,84 C155,91 154,98 150,102 Z', coreCol:'#FFD54A'},
  heart: {outer:'M150,102 C132,90 121,76 125,62 C129,50 143,47 150,57 C157,47 171,50 175,62 C179,76 168,90 150,102 Z', outerCol:'#F06C55',
          inner:'M150,102 C143,97 142,86 150,74 C158,86 157,97 150,102 Z', innerCol:'#F5A33A', core:'M150,102 C147,99 146,93 150,88 C154,93 153,99 150,102 Z', coreCol:'#FFD54A'},
};
const FL=FLAME;
const LV={0:'off',1:'small',2:'base',3:'big',4:'bright'};
const flameEl=(kind)=>{
  let k=1; if(kind==='bright'){kind='big';k=1.18}   // 4단계: 커짐×1.18 ≈ 1.65 (+후광·반짝)
  let F=FLAME[kind]||FLAME.base;
  let sx=1;
  if(F.from){ k*= (F.k||1); sx=F.sx||1; const rot=F.rot||0; F={...FLAME[F.from], rot}; } else { k*=(F.k||1); }
  const tr=[]; if(k!==1||sx!==1) tr.push(`translate(150,102) scale(${k*sx},${k}) translate(-150,-102)`); if(F.rot) tr.push(`rotate(${F.rot} 150 102)`);
  const t=tr.length?`transform="${tr.join(' ')}"`:'';
  const L=[];
  if(F.wisp) return `<g class="hw-flame-wrap"><g class="hw-flame hw-smoke"><path d="${F.wisp}" fill="none" stroke="#D9D3CB" stroke-width="2.6" stroke-linecap="round"/></g></g>`;
  if(F.outer) L.push(`<path d="${F.outer}" fill="${F.outerCol||C.fm2}"/>`);
  if(F.light) L.push(`<path d="${F.light}" fill="${F.lightCol||C.fi}"/>`);
  if(F.inner) L.push(`<path d="${F.inner}" fill="${F.innerCol||C.fo}"/>`);
  if(F.core)  L.push(`<path d="${F.core}" fill="${F.coreCol||C.fm}"/>`);
  // 스케일·회전은 바깥 래퍼(속성), 흔들림 애니메이션은 안쪽(.hw-flame, CSS transform) — 한 요소에 둘 다 두면 CSS가 속성을 덮어씀
  return `<g class="hw-flame-wrap" ${t}><g class="hw-flame ${kind==='off'?'hw-smoke':''}">${L.join('')}</g></g>`;
};
const glowEl=(level)=> level>=4 ? `<ellipse class="hw-glow" cx="150" cy="62" rx="64" ry="70" fill="${C.glow}" opacity=".18"/>` : '';
// 심지: 왁스에 박힌 짧은 막대 (레퍼 26). 아래쪽은 캡 아래로 들어가 있고 위로 16만 나옴
const wickEl=(off=false)=> off
  ? `<path class="hw-wick" d="M150,126 V108 C150,103 148,101 145,98" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`   // 탄 심지: 살짝 길고 끝이 왼쪽으로 굽음
  : `<rect class="hw-wick" x="146" y="106" width="8" height="20" rx="3" fill="${C.ink}"/>`;

// ── 몸 + 캡 ───────────────────────────────────────────────────
const TOP=120, BOT=294;
const VW={front:[60,180],q:[66,168],side:[95,110],back:[60,180]};
// 몸 윤곽 = 레퍼 24를 픽셀 윤곽 추적(Moore) → DP 단순화 → Chaikin ×3 로 둥글린 것. 정면 좌표(x60~240). 다른 뷰는 x축 스케일
const BODYD='M142.9,117.8 L157.1,117.8 L169.8,117.9 L180.9,118.0 L190.5,118.2 L198.5,118.5 L204.9,118.8 L209.8,119.2 L213.2,119.7 L214.9,120.3 L216.7,120.9 L218.4,121.6 L220.0,122.3 L221.6,123.2 L223.1,124.1 L224.6,125.0 L226.1,126.1 L227.4,127.2 L228.8,128.4 L230.1,129.8 L231.4,131.4 L232.6,133.1 L233.8,135.0 L235.0,137.0 L236.2,139.2 L237.2,141.6 L238.2,144.1 L238.9,146.9 L239.5,150.0 L239.9,153.2 L240.2,156.7 L240.2,160.4 L240.1,164.3 L239.9,168.4 L239.6,173.4 L239.5,179.2 L239.3,185.9 L239.3,193.4 L239.3,201.8 L239.3,211.0 L239.4,221.1 L239.5,232.0 L239.6,241.7 L239.5,250.3 L239.4,257.7 L239.2,263.9 L238.9,268.9 L238.5,272.8 L238.1,275.5 L237.5,277.0 L237.0,278.4 L236.4,279.8 L235.8,281.0 L235.2,282.2 L234.5,283.3 L233.9,284.3 L233.2,285.2 L232.5,286.1 L231.7,286.9 L230.9,287.7 L230.0,288.5 L229.1,289.2 L228.0,290.0 L226.9,290.7 L225.7,291.4 L224.5,292.1 L223.2,292.7 L221.9,293.2 L220.6,293.6 L219.3,294.0 L218.0,294.2 L216.6,294.4 L215.3,294.5 L213.9,294.5 L212.6,294.4 L211.2,294.2 L209.9,293.9 L208.6,293.5 L207.3,293.0 L206.0,292.3 L204.7,291.6 L203.5,290.8 L202.3,290.2 L201.1,289.9 L199.9,289.8 L198.8,289.9 L197.8,290.3 L196.7,290.9 L195.7,291.8 L194.8,292.8 L193.9,294.0 L193.1,295.2 L192.3,296.5 L191.6,297.8 L191.0,299.1 L190.4,300.5 L190.0,302.0 L189.5,303.5 L189.0,304.9 L188.4,306.2 L187.7,307.4 L186.9,308.5 L185.9,309.5 L184.9,310.4 L183.8,311.2 L182.5,312.0 L181.3,312.5 L180.0,313.0 L178.7,313.3 L177.4,313.5 L176.1,313.6 L174.7,313.6 L173.3,313.4 L172.0,313.1 L170.7,312.8 L169.4,312.4 L168.3,311.9 L167.3,311.5 L166.3,310.9 L165.5,310.3 L164.7,309.7 L164.0,309.0 L163.4,308.2 L162.7,307.3 L162.1,306.3 L161.6,305.2 L161.1,304.0 L160.6,302.7 L160.2,301.3 L159.7,299.8 L159.2,298.5 L158.6,297.5 L157.9,296.7 L157.0,296.1 L156.1,295.8 L155.1,295.8 L153.9,295.9 L152.7,296.4 L151.4,296.7 L150.1,296.9 L148.7,297.0 L147.3,297.0 L145.9,296.9 L144.5,296.7 L143.0,296.4 L141.5,295.9 L140.1,295.8 L138.8,296.0 L137.7,296.5 L136.6,297.2 L135.7,298.3 L134.9,299.6 L134.3,301.2 L133.7,303.2 L133.0,304.9 L132.2,306.5 L131.1,307.9 L130.0,309.2 L128.6,310.2 L127.1,311.1 L125.5,311.9 L123.7,312.4 L122.0,312.9 L120.4,313.1 L118.9,313.3 L117.5,313.3 L116.3,313.1 L115.1,312.9 L114.0,312.4 L113.1,311.9 L112.2,311.2 L111.3,310.4 L110.6,309.5 L109.9,308.4 L109.3,307.3 L108.7,306.0 L108.3,304.6 L107.8,303.1 L107.4,301.6 L106.8,300.2 L106.2,298.9 L105.5,297.6 L104.8,296.3 L103.9,295.1 L103.0,293.9 L102.1,292.8 L101.1,292.0 L100.0,291.3 L99.0,290.9 L97.9,290.7 L96.7,290.7 L95.5,290.9 L94.3,291.4 L93.1,292.1 L91.8,292.7 L90.5,293.2 L89.1,293.6 L87.7,294.0 L86.3,294.2 L84.9,294.4 L83.4,294.5 L81.9,294.5 L80.4,294.3 L78.8,294.0 L77.2,293.6 L75.7,292.9 L74.0,292.2 L72.4,291.2 L70.8,290.1 L69.1,288.9 L67.6,287.6 L66.2,286.3 L65.0,285.0 L63.9,283.7 L62.9,282.4 L62.1,281.0 L61.4,279.7 L60.8,278.3 L60.3,275.2 L59.9,270.3 L59.6,263.6 L59.3,255.2 L59.1,245.0 L59.0,233.1 L58.9,219.4 L58.9,203.9 L59.0,190.2 L59.1,178.2 L59.3,167.9 L59.6,159.3 L59.9,152.5 L60.3,147.4 L60.8,144.0 L61.4,142.4 L62.0,140.8 L62.7,139.2 L63.5,137.6 L64.4,136.1 L65.4,134.6 L66.5,133.2 L67.7,131.7 L68.9,130.4 L70.3,129.0 L71.9,127.7 L73.6,126.5 L75.5,125.3 L77.5,124.2 L79.6,123.1 L82.0,122.1 L84.4,121.2 L88.4,120.3 L93.8,119.6 L100.7,119.0 L109.0,118.5 L118.8,118.2 L130.1,117.9 Z';
const bodyT=(view)=>{ const [x0,w]=VW[view]||VW.front; const sx=w/180; return `translate(150,0) scale(${sx},1) translate(-150,0)`; };
// 캡 아랫선 — 이전 버전(둥근 방울 3개)으로. 오른쪽→왼쪽 [폭, b=볼록/d=방울, 깊이]. 몸에 클리핑
const CAPB=148;
const WAXD={base:[1,1,1],left:[.45,.5,1.9],right:[1.9,.5,.45],center:[.5,2.6,.5],full:[2.0,1.8,2.3]};
function capPath(wax='base'){
  const k=180/192, m=WAXD[wax]||WAXD.base;
  const segs=[[30,'b',6],[20,'d',38*m[0]],[26,'b',8],[24,'b',6],[20,'d',18*m[1]],[26,'b',6],[26,'b',8],[20,'d',54*m[2]]];
  let d=`M60,${TOP-4} H240 V${CAPB}`;
  for(const [sw,t,dep] of segs){ const ww=sw*k, r=ww/2;
    if(t==='d') d+=` v${dep} a${r},${r} 0 0 1 -${ww},0 v-${dep}`; else d+=` a${r},${dep} 0 0 1 -${ww},0`; }
  return d+' Z';
}
// ⚠ 뷰 스케일(가로 축소)은 반드시 class 없는 안쪽 <g class="hw-vw">에 건다.
//   .hw-body/.hw-cap 에는 CSS transform-origin:150px 316px 이 걸려 있어서, 속성 transform 이 그 기준점으로 한 번 더 감싸진다
//   → scale 중심이 x150 이 아니라 x300 이 되어 측면 몸이 오른쪽으로 58 밀렸었다(불꽃만 제자리, 2026-09-07 수정).
//   style 로 transform-origin:0 0 을 못박아 스타일시트가 없을 때도 같은 결과가 나오게 한다.
const VWG=(view,inner)=>`<g class="hw-vw" style="transform-origin:0 0" transform="${bodyT(view)}">${inner}</g>`;
const bodyEl=(view='front')=>`<g class="hw-body">${VWG(view,`<path class="hw-bodyfill" d="${BODYD}" fill="${C.body}"/>`)}</g>`;
let uid=0;
const capEl=(wax='base',view='front')=>{
  const [x0,w]=VW[view]||VW.front, id='hwclip'+(uid++);
  const puddle = wax==='full' ? `<ellipse class="hw-puddle" cx="150" cy="310" rx="${w*.62}" ry="12" fill="${C.wax}"/>` : '';
  return `${puddle}<g class="hw-cap">${VWG(view,`<defs><clipPath id="${id}"><path d="${BODYD}"/></clipPath></defs>
    <g clip-path="url(#${id})"><path class="hw-drips" d="${capPath(wax)}" fill="${C.wax}"/></g>
    <ellipse class="hw-top" cx="150" cy="${TOP+9}" rx="72" ry="5" fill="${C.top}" opacity=".45"/>`)}</g>`;
};

// ── 얼굴 ──────────────────────────────────────────────────────
let LIDS=true, ZZZ=true;   // ZZZ: 포즈가 zzz 소품을 갖고 있으면 표정 쪽 zzz 를 끈다(누우면 얼굴 zzz 만 같이 돌아 두 개가 엇갈렸음)
function faceEl(mood,view){
  if(view==='back'||view==='side') return '';        // 레퍼: 측면·후면은 얼굴이 안 보임
  const q=view==='q';
  const L=q?108:116, Rx=q?165:179, Y=203, MX=q?140:149, MY=229;
  const xs=[L,Rx];
  const st=`stroke="${C.ink}" stroke-width="4.5" fill="none" stroke-linecap="round"`;
  const stB=`stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"`;
  const eye=(x,side,{dx=0,dy=0,r=8,lid=0}={})=>`<g class="hw-eye hw-eye-${side}">
      <circle cx="${x}" cy="${Y}" r="15" fill="${C.white}"/>
      <g class="hw-pupil"><circle cx="${x+dx}" cy="${Y+dy}" r="${r}" fill="${C.ink}"/></g>
      ${lid?`<path d="M${x-16},${Y-16} h32 v${lid*30} a16,${lid*9} 0 0 1 -32,0 Z" fill="${C.body}"/>`:''}
      ${LIDS?`<rect class="hw-lid" x="${x-16}" y="${Y-16}" width="32" height="32" rx="16" fill="${C.body}"/>`:''}
    </g>`;
  const eyes=(o)=>xs.map((x,i)=>eye(x,i?'r':'l',o)).join('');
  const arcUp=(x)=>`<path d="M${x-11},${Y+3} q11,-15 22,0" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const arcDn=(x)=>`<path d="M${x-11},${Y-2} q11,11 22,0" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const cross=(x)=>`<path d="M${x-9},${Y-7} l9,7 l-9,7 M${x+9},${Y-7} l-9,7 l9,7" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const xx=(x)=>`<path d="M${x-8},${Y-8} l16,16 M${x+8},${Y-8} l-16,16" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const heart=(x)=>`<path d="M${x},${Y+9} C${x-15},${Y-2} ${x-11},${Y-15} ${x},${Y-7} C${x+11},${Y-15} ${x+15},${Y-2} ${x},${Y+9} Z" fill="${C.pink}"/>`;
  const brow=(x,side,a=0,lift=0)=>{ const s=side==='l'?1:-1; return `<path class="hw-brow" d="M${x-11*s},${Y-27-lift} L${x+11*s},${Y-27-lift+a}" ${stB}/>`; };
  const brows=(a,lift=0)=>xs.map((x,i)=>brow(x,i?'r':'l',a,lift)).join('');
  const wrap=(k)=>`<g class="hw-eyes">${k}</g>`;
  const mouth=(d,fill)=>`<path class="hw-mouth" d="${d}" ${fill?`fill="${C.ink}"`:st}/>`;
  const smile=(w=9.5,h=11)=>mouth(`M${MX-w},${MY} c1,${h} ${2*w-1},${h} ${2*w},0`);   // 양끝이 위로 말리는 U
  const frown=(w=11,h=8)=>mouth(`M${MX-w},${MY+6} q${w},-${h} ${2*w},0`);
  const wavy=()=>mouth(`M${MX-11},${MY+2} q5.5,-7 11,0 q5.5,7 11,0`);
  const oh=(rx=6,ry=8)=>mouth(`M${MX-rx},${MY+3} a${rx},${ry} 0 1 0 ${2*rx},0 a${rx},${ry} 0 1 0 -${2*rx},0 Z`,true);
  const grin=()=>mouth(`M${MX-14},${MY-3} q14,19 28,0 z`,true)+`<path d="M${MX-8},${MY-1} q8,4 16,0" fill="${C.white}"/>`;
  const cheeks=(op=1)=>`<g class="hw-cheek" opacity="${op}"><circle cx="${L-22}" cy="${Y+16}" r="7" fill="${C.cheek}"/><circle cx="${Rx+22}" cy="${Y+16}" r="7" fill="${C.cheek}"/></g>`;
  const tear=(x)=>`<path class="hw-tear" d="M${x+18},${Y+10} q-6,14 0,20 q6,-6 0,-20 Z" fill="${C.tear}"/>`;
  const zzz=`<g class="hw-zzz" fill="${C.ink}" font-family="Pretendard,sans-serif" font-weight="800"><text x="${Rx+20}" y="${Y-28}" font-size="17">z</text><text x="${Rx+32}" y="${Y-42}" font-size="13">z</text></g>`;
  const sweat=`<path d="M${Rx+24},${Y-20} q-7,12 0,18 q7,-6 0,-18 Z" fill="${C.tear}"/>`;
  switch(mood){
    case 'happy':     return wrap(xs.map(arcUp).join(''))+smile(12,11);
    case 'laugh':     return wrap(xs.map(arcUp).join(''))+cheeks(.9)+grin();
    case 'wink':      return wrap(eye(L,'l',{dx:1})+arcUp(Rx))+cheeks(.6)+mouth(`M${MX-11},${MY} q13,11 24,-2`);
    case 'sad':       return wrap(eyes({dy:4}))+brows(-6,2)+frown()+tear(Rx);   // 보는 사람 기준 오른쪽 눈 밑
    case 'cry':       return wrap(xs.map(arcDn).join(''))+frown(12,9)+`<path class="hw-tear" d="M${L-6},${Y+10} q-4,22 2,34 M${Rx+6},${Y+10} q4,22 -2,34" stroke="${C.tear}" stroke-width="5" fill="none" stroke-linecap="round"/>`;   // 제일 바깥 두 줄기만 (안쪽 물방울 2개 삭제 2026-09-07)
    case 'worried':   return wrap(eyes({dx:-2,dy:2,r:6.5}))+brows(-7,4)+wavy()+sweat;
    case 'angry':     return wrap(eyes({dy:-1,r:6.5,lid:.35}))+brows(8,-2)+frown(11,8);
    case 'confused':  return wrap(eye(L,'l',{dx:4,dy:-2})+eye(Rx,'r',{dx:4,dy:-2,lid:.4}))+brow(L,'l',0,6)+wavy();
    case 'surprised': return wrap(eyes({r:9.5}))+brows(0,9)+oh();
    case 'sleepy':    return wrap(xs.map(arcDn).join(''))+mouth(`M${MX-7},${MY+2} q7,5 14,0`)+(ZZZ?zzz:'');
    case 'unlit':     return wrap(xs.map(arcDn).join(''));                       // 0단계: 감은 눈만 (레퍼 28)
    case 'shy':       return cheeks(1)+wrap(eyes({dx:3,dy:5,r:6.5}))+brows(-4,2)+mouth(`M${MX-7},${MY+1} q7,6 14,0`);
    case 'excited':   return wrap(xs.map(cross).join(''))+cheeks(.8)+grin();
    case 'love':      return wrap(xs.map(heart).join(''))+cheeks(.9)+smile(9,9);
    case 'thinking':  return wrap(eyes({dx:-5,dy:-5,r:6.5}))+brow(Rx,'r',0,7)+mouth(`M${MX-8},${MY+2} q8,-6 16,2`);
    case 'curious':   return wrap(eyes({dx:5,dy:-1}))+brow(L,'l',0,8)+oh(4.5,5.5);
    case 'proud':     return wrap(eyes({dy:2,r:6.5,lid:.5}))+mouth(`M${MX-13},${MY} q9,9 20,4 q5,-3 7,-8`);
    case 'dizzy':     return wrap(xs.map(xx).join(''))+wavy();
    default:          return wrap(eyes())+smile();
  }
}

// ── 팔·발·소품·포즈 ─────────────────────────────────────────────
// 팔: 어깨(몸 옆면 y238)에서 바깥으로 뻗는 둥근 막대. angle 은 '위로 드는 각도'(0=옆으로, 90=만세) — 좌우 같은 뜻으로 쓴다
// len: 팔 길이(어깨 안쪽 6px 포함). 기본 포즈는 16 → 몸 밖으로 10px만 나오는 스텁(레퍼 히어로처럼 '티 안 나게')
const armEl=(side,ang,view='front',len=34)=>{
  const [x0,w]=VW[view]||VW.front, sy=236, sx= side==='l'?x0+6:x0+w-6, s= side==='l'?1:-1;
  return `<g class="hw-arm hw-arm-${side}" style="transform-origin:${sx}px ${sy}px" transform="rotate(${s*ang})"><rect x="${side==='l'?sx-len:sx}" y="${sy-7}" width="${len}" height="14" rx="7" fill="${C.body}"/></g>`;
};
const footEl=(dxL=0,dxR=0)=>`<g class="hw-feet"><rect class="hw-foot" x="${104+dxL}" y="306" width="24" height="13" rx="6.5" fill="${C.body}"/><rect class="hw-foot" x="${172+dxR}" y="306" width="24" height="13" rx="6.5" fill="${C.body}"/></g>`;
const PROPS={
  flag:`<g class="hw-prop hw-prop-flag"><path d="M50,152 v66" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M50,150 L96,166 L50,182 Z" fill="${C.purple}"/></g>`,
  lines:`<g class="hw-prop" stroke="${C.wax}" stroke-width="5" stroke-linecap="round"><path d="M22,200 h22"/><path d="M14,224 h30"/><path d="M24,248 h18"/></g>`,
  heart:`<g class="hw-prop"><path d="M256,176 C244,166 246,150 258,152 C264,146 276,152 274,164 C272,176 262,182 256,176 Z" fill="${C.pink}"/></g>`,
  friend:`<g class="hw-prop hw-prop-friend"><path d="M232,318 v-40 a30,30 0 0 1 60,0 v40 a10,9 0 0 1 -20,0 a10,9 0 0 1 -20,0 a10,9 0 0 1 -20,0 Z" fill="${C.lilac}"/><circle cx="252" cy="288" r="3" fill="${C.ink}"/><circle cx="272" cy="288" r="3" fill="${C.ink}"/><path d="M256,298 q6,5 12,0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`,
  zzz:`<g class="hw-prop" fill="${C.ink}" font-family="Pretendard,sans-serif" font-weight="800"><text x="196" y="150" font-size="20">z</text><text x="212" y="130" font-size="15">z</text><text x="224" y="114" font-size="11">z</text></g>`,
  party:`<g class="hw-prop hw-prop-hat"><path d="M96,124 L114,66 L138,120 Z" fill="${C.red}"/><circle cx="114" cy="64" r="6" fill="${C.pink}"/><path d="M104,100 h22" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/></g>
         <g class="hw-prop hw-prop-confetti"><circle cx="40" cy="130" r="4" fill="${C.purple}"/><rect x="250" y="110" width="8" height="8" rx="2" fill="${C.mint}" transform="rotate(20 254 114)"/><circle cx="270" cy="200" r="4" fill="${C.pink}"/><rect x="24" y="200" width="8" height="8" rx="2" fill="${C.red}" transform="rotate(-25 28 204)"/><circle cx="66" cy="70" r="3.5" fill="${C.mint}"/></g>`,
};
// pose: rot·dx·dy 는 .hw-posed 의 attribute(정적), 반복 모션은 .hw-figure 에 CSS(hw-pose-*)
const POSE={
  idle:      {},                                 // 기본은 팔 없음 (동작 포즈에서만)
  cheer:     {arms:[52,-16],props:['flag'],mood:'happy'},
  run:       {rot:-14,dx:10,arms:[38,-38],feet:[-10,10],props:['lines'],mood:'neutral'},
  jump:      {dy:-28,arms:[120,120],feet:[4,-4],spark:true,shadow:.6,mood:'laugh'},
  help:      {arms:[-6,64],props:['heart','friend'],mood:'happy'},
  sleep:     {lie:true,props:['zzz'],mood:'sleepy',flame:'small'},
  cry:       {arms:[78,78],mood:'cry',flame:'small'},
  celebrate: {arms:[118,118],props:['party'],mood:'excited',level:4},
  fall:      {rot:30,pivot:[240,316],dx:-24,arms:[104,6],feet:[12,-16],mood:'dizzy'},   // 오른쪽 아래 모서리를 축으로 기울어짐 → 바닥선 아래로 안 내려감
};
const SPARKS=`<g class="hw-sparks" stroke="${C.body}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M40,96 l14,10"/><path d="M34,130 l16,2"/><path d="M260,96 l-14,10"/><path d="M266,130 l-16,2"/></g>`;

// ── 조립 ─────────────────────────────────────────────────────
function char({level=3,mood='neutral',view='front',flame=null,wax='base',spark=false,vb=VB,cls='',lids=true,pose='idle',guide=false}={}){
  LIDS=lids;
  const P=POSE[pose]||POSE.idle;
  ZZZ=!(P.props||[]).includes('zzz');
  if(P.mood && mood==='neutral') mood=P.mood;
  if(P.level!=null) level=P.level;
  const f = flame || P.flame || LV[level];
  if(level===0 && mood==='neutral') mood='unlit';
  const pv=P.pivot||[150,316];
  const posedT = P.lie ? 'rotate(-80 150 215)' : `translate(${P.dx||0},${P.dy||0}) rotate(${P.rot||0} ${pv[0]} ${pv[1]})`;
  const G = guide ? `<g class="hw-guide" fill="none" stroke-width="1.5" stroke-dasharray="5 4"><rect x="${ZONE.canvas[0]}" y="${ZONE.canvas[1]}" width="420" height="420" stroke="#B9B0C8"/><rect x="${ZONE.motion[0]}" y="${ZONE.motion[1]}" width="${ZONE.motion[2]-ZONE.motion[0]}" height="${ZONE.motion[3]-ZONE.motion[1]}" stroke="#7B5CD6"/><rect x="${ZONE.still[0]}" y="${ZONE.still[1]}" width="${ZONE.still[2]-ZONE.still[0]}" height="${ZONE.still[3]-ZONE.still[1]}" stroke="#F2A93B"/><line x1="${ZONE.canvas[0]}" y1="316" x2="${ZONE.canvas[2]}" y2="316" stroke="#C9C2B8"/><line x1="150" y1="${ZONE.canvas[1]}" x2="150" y2="${ZONE.canvas[3]}" stroke="#C9C2B8"/></g>` : '';
  const arms = P.arms && view!=='side' ? armEl('l',P.arms[0],view,P.alen)+armEl('r',P.arms[1],view,P.alen) : '';   // 측면은 레퍼처럼 팔 없음
  const feet = P.feet ? footEl(P.feet[0],P.feet[1]) : '';
  const props = (P.props||[]).map(k=>PROPS[k]||'').join('');
  return `<svg class="hw hw-pose-${pose} ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" data-level="${level}" data-mood="${mood}" data-view="${view}" data-pose="${pose}">
    ${G}
    <ellipse class="hw-shadow" cx="150" cy="324" rx="${92*(P.shadow||1)}" ry="9" fill="${C.ink}" opacity="${.10*(P.shadow||1)}"/>
    ${f!=='off'?glowEl(level):''}
    ${(spark||P.spark||level===4)?SPARKS:''}
    <g class="hw-figure"><g class="hw-posed" transform="${posedT}">
      ${feet}
      ${bodyEl(view)}
      ${capEl(wax,view)}
      ${wickEl(f==='off')}
      ${flameEl(f)}
      ${faceEl(mood,view)}
      ${arms}
    </g></g>
    ${props}
  </svg>`;
}

// 애니메이션 CSS — 앱에서도 이 블록을 그대로 쓴다
const CSS=`
.hw{overflow:visible}
.hw *{transform-box:view-box}
.hw .hw-flame{transform-origin:150px 102px;animation:hwFlicker 1.7s ease-in-out infinite}
.hw .hw-glow{transform-origin:150px 100px;animation:hwGlow 1.7s ease-in-out infinite}
.hw .hw-smoke{animation:hwSmoke 2.8s ease-out infinite;transform-origin:145px 98px}
.hw .hw-figure{transform-origin:150px 316px}
.hw .hw-body,.hw .hw-cap,.hw .hw-wick,.hw .hw-eyes,.hw .hw-brow,.hw .hw-mouth,.hw .hw-cheek,.hw .hw-tear,.hw .hw-zzz{transform-origin:150px 316px}
.hw.hw-live .hw-figure{animation:hwBreathe 3.4s ease-in-out infinite}
.hw .hw-cap{transform-origin:150px 130px}
.hw.hw-melt .hw-drips{animation:hwMelt 2.2s ease-in-out infinite alternate;transform-origin:150px 137px}
.hw .hw-lid{transform-box:fill-box;transform-origin:center top;transform:scaleY(0);transition:transform .07s ease-in}   /* fill-box 필수: view-box 면 기준점이 뷰박스 전체가 되어 깜빡일 때 위로 튄다 */
.hw.hw-blink .hw-lid{transform:scaleY(1)}
.hw .hw-pupil{transition:transform .12s ease-out}
.hw.hw-bounce .hw-figure{animation:hwBounce .55s cubic-bezier(.3,1.6,.4,1) both}
.hw.hw-sway .hw-wick{transform-origin:150px 122px}
.hw.hw-sway .hw-flame{animation:hwSway 1.2s ease-in-out infinite,hwFlicker 1.7s ease-in-out infinite;transform-origin:150px 102px}
.hw .hw-sparks{transform-origin:150px 120px;animation:hwSparks 1.4s ease-out infinite}
.hw .hw-arm{transition:transform .25s ease-out}
.hw.hw-wave .hw-arm-r{animation:hwWave .7s ease-in-out infinite}
.hw.hw-pose-run .hw-figure{animation:hwRunBob .36s ease-in-out infinite}
.hw.hw-pose-jump .hw-figure{animation:hwJump 1.1s ease-in-out infinite}
.hw.hw-pose-cheer .hw-arm-l{animation:hwCheer .8s ease-in-out infinite}
.hw.hw-pose-cheer .hw-prop-flag{transform-origin:50px 218px;animation:hwCheerFlag .8s ease-in-out infinite}
.hw.hw-pose-celebrate .hw-figure{animation:hwBounceLoop 1s ease-in-out infinite}
.hw.hw-pose-celebrate .hw-prop-hat{transform-origin:150px 316px;animation:hwBounceLoop 1s ease-in-out infinite}   /* 소품은 .hw-figure 밖이라 몸 애니메이션을 안 받는다 — 모자만 같은 origin·같은 키프레임으로 붙여 준다 */
.hw.hw-pose-sleep .hw-flame{animation:hwFlicker 3s ease-in-out infinite}
@keyframes hwFlicker{0%,100%{transform:scale(1,1) rotate(0)}30%{transform:scale(1.06,.94) rotate(-4deg)}60%{transform:scale(.95,1.06) rotate(3deg)}80%{transform:scale(1.03,.98) rotate(-1deg)}}
@keyframes hwGlow{0%,100%{transform:scale(1);opacity:.18}50%{transform:scale(1.06);opacity:.24}}
@keyframes hwSmoke{0%{transform:translateY(6px) scale(.9);opacity:0}20%{opacity:.95}100%{transform:translateY(-22px) scale(1.15);opacity:0}}
@keyframes hwBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.022)}}
@keyframes hwMelt{0%{transform:scaleY(1)}100%{transform:scaleY(1.18)}}
@keyframes hwBounce{0%{transform:scale(1,1)}25%{transform:scale(1.12,.86)}50%{transform:scale(.94,1.08)}75%{transform:scale(1.03,.97)}100%{transform:scale(1,1)}}
@keyframes hwBounceLoop{0%,100%{transform:scale(1,1)}30%{transform:scale(1.06,.94)}60%{transform:scale(.97,1.04)}}
@keyframes hwSway{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes hwSparks{0%{transform:scale(.7);opacity:0}30%{opacity:1}100%{transform:scale(1.15);opacity:0}}
@keyframes hwWave{0%,100%{transform:rotate(-70deg)}50%{transform:rotate(-110deg)}}
@keyframes hwRunBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes hwJump{0%,100%{transform:translateY(0) scale(1,1)}15%{transform:translateY(4px) scale(1.06,.94)}45%{transform:translateY(-30px) scale(.97,1.04)}75%{transform:translateY(0) scale(1.04,.96)}}
@keyframes hwCheer{0%,100%{transform:rotate(52deg)}50%{transform:rotate(70deg)}}
@keyframes hwCheerFlag{0%,100%{transform:rotate(0)}50%{transform:rotate(12deg)}}
@media (prefers-reduced-motion:reduce){.hw *{animation:none!important}}
`;
const HWF={char,CSS,C,FL,LV,POSE,VB,ZONE,parts:{flameEl,bodyEl,capEl,wickEl,faceEl,armEl,footEl}};
if(typeof module!=='undefined') module.exports=HWF; else root.HWF=HWF;
})(typeof window!=='undefined'?window:globalThis);
