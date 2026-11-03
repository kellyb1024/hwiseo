// ── 휘서 OLD — 지치고 늙은 휘서 (2026-09-07, 번외 · 인스타 프로필용) ────────────────
// 앱 캐릭터(hwiseo-F.js)는 건드리지 않는다. 이 파일은 HWF 를 읽어서 "많이 타버린 초" 상태만 다시 조립한다.
//   늙음 = 나이가 아니라 '오래 탄 것'. 몸이 짧아지고 · 심지가 길고 굽고 · 불꽃이 작아진다.
//   ★ 촛농(wax)은 건드리지 않는다 (사용자 2026-09-07). 기본 base 그대로 · 바닥 웅덩이 없음 — 늙음은 몸 높이·심지·얼굴로만 말한다.
//   ⚠ 여기서 새로 거는 모든 transform 은 감싸는 <g> 에 style="transform-origin:0 0" 을 같이 준다.
//      HWF.CSS 의 .hw *{transform-box:view-box} 때문에 origin 을 안 박으면 기준점이 뷰박스 중심으로 밀린다(측면 버그와 같은 함정).
(function(root){
const HWF = root.HWF || (typeof require!=='undefined' && require('./hwiseo-F.js'));
const {C, parts:{bodyEl, capEl, flameEl}, VB} = HWF;
const GY=316;                                   // 바닥선
const G=(t,inner)=>`<g style="transform-origin:0 0" transform="${t}">${inner}</g>`;
const sc=(kx,ky,cx=150,cy=GY)=>`translate(${cx},${cy}) scale(${kx},${ky}) translate(${-cx},${-cy})`;

// ── 늙은 얼굴 ────────────────────────────────────────────────
// 기본 얼굴 좌표(눈 x116/179 y203 · 입 149,229)를 그대로 쓰되 눈꺼풀·주름·눈썹을 더한다
function oldFace(kind='weary', gear=[]){
  const L=116, R=179, Y=203, MX=149, MY=231;
  const ink=C.ink, gray='#9A8F80';   // 흰 눈썹·눈밑 그늘. 노란 몸 위라 너무 밝으면 작은 크기에서 사라진다
  const st=`stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"`;
  // 반쯤 감긴 눈: 흰자 → 동공(아래로) → 위에서 몸색 뚜껑 → 눈꺼풀 선
  const eye=(x,lid=.42,dy=3)=>`<g class="hw-eye">
      <circle cx="${x}" cy="${Y}" r="15" fill="${C.white}"/>
      <g class="hw-pupil"><circle cx="${x}" cy="${Y+dy}" r="7" fill="${ink}"/></g>
      <path d="M${x-16},${Y-17} h32 v${lid*30} a16,${lid*10} 0 0 1 -32,0 Z" fill="${C.body}"/>
      <path d="M${x-15},${Y-17+lid*30} a15,${lid*10} 0 0 0 30,0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>`;
  // 눈 밑 그늘 두 줄
  const bag=(x)=>`<g class="hw-bag" stroke="${gray}" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M${x-11},${Y+16} q11,7 22,0"/><path d="M${x-8},${Y+23} q8,5 16,0"/></g>`;
  // 길고 처진 흰 눈썹 — 바깥쪽 끝이 아래로 내려간다
  const brow=(x,s)=>`<path class="hw-brow" d="M${x-16*s},${Y-30} q${9*s},-7 ${18*s},1 q${5*s},4 ${8*s},9" stroke="${gray}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const sigh=`<g class="hw-sigh" stroke="${gray}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".85">
      <path d="M${MX+26},${MY-2} q9,-4 16,-1"/><path d="M${MX+30},${MY+7} q7,-3 13,-1"/></g>`;
  const mouths={
    weary: `<path class="hw-mouth" d="M${MX-11},${MY+4} q11,-7 22,-1" ${st}/>`,                                    // 아래로 처진 한 줄
    sigh:  `<path class="hw-mouth" d="M${MX-8},${MY} a8,7 0 1 0 16,0 a8,7 0 1 0 -16,0 Z" fill="${ink}"/>`,          // 살짝 벌린 입 (한숨)
    calm:  `<path class="hw-mouth" d="M${MX-10},${MY} q10,6 20,0" ${st}/>`,                                          // 옅은 미소 — 지쳤지만 괜찮음
  };
  // 늙음을 한눈에 읽히게 하는 소품 — 작은 크기(프로필 40px)에서도 남는 기호
  const glasses=`<g class="hw-glasses" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round">
      <path d="M${L-17},${Y+2} a17,13 0 0 0 34,0"/><path d="M${R-17},${Y+2} a17,13 0 0 0 34,0"/>
      <path d="M${L+17},${Y+2} q${(R-L)/2-17},-5 ${R-L-34},0"/><path d="M${L-17},${Y+2} q-10,-1 -13,-7"/><path d="M${R+17},${Y+2} q10,-1 13,-7"/></g>`;
  const beard=`<g class="hw-beard"><path d="M${MX-34},${MY-4} q4,30 12,42 q10,12 22,12 q12,0 22,-12 q8,-12 12,-42 q-16,10 -34,10 q-18,0 -34,-10 Z" fill="#EDE6DA"/>
      <path d="M${MX-20},${MY+26} q20,9 40,0" stroke="#D6CCBC" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  const G2=(k)=>gear.includes(k);
  return `<g class="hw-eyes">${eye(L)}${eye(R)}${bag(L)}${bag(R)}${brow(L,1)}${brow(R,-1)}</g>
    ${G2('beard')?beard:''}${mouths[kind]||mouths.weary}${kind==='sigh'?sigh:''}${G2('glasses')?glasses:''}`;
}

// 타서 길어지고 굽은 심지 (기본 심지는 짧은 막대라 늙은 초엔 안 맞는다)
const smallFlame=(k=.78,kind='base')=>G(`translate(150,102) scale(${k}) translate(-150,-102)`, flameEl(kind));   // FLAME.small 은 10x15 조각이라 작게 보면 안 보인다 → base 를 줄여 쓴다
const oldWick=(y)=>`<path class="hw-wick" d="M150,${y+30} V${y+12} c0,-6 -3,-9 -7,-12" fill="none" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;

// ── 조립 ─────────────────────────────────────────────────────
// k    몸 높이 비율 (1=원본, 작을수록 많이 탄 초)
// kx   몸 폭 비율 (짧아진 만큼 살짝 퍼진다)
// wax  촛농 변주 (HWF 와 같음)
// face weary | sigh | calm
function old({k=.72, kx=1.06, wax='base', face='weary', gear=[], flame=.78, tilt=10, arms=true, puddle=false, vb=VB, cls=''}={}){
  const TOP=118, WICKY=316-(316-106)*k;                    // 짧아진 몸의 심지 자리
  const bodyTop=316-(316-TOP)*k;
  const faceDY=(bodyTop+314*k+(1-k)*316)/2-216;            // 얼굴을 짧아진 몸 한가운데로
  const P=puddle?`<ellipse class="hw-puddle" cx="150" cy="313" rx="${118*kx}" ry="15" fill="${C.wax}"/>`:'';
  const arm=(s)=>{const x=s<0?150-90*kx:150+90*kx, y0=316-70*k; return `<path class="hw-arm hw-arm-${s<0?'l':'r'}" d="M${x},${y0} q${s*11},2 ${s*13},13 q1,9 -2,15" fill="none" stroke="${C.body}" stroke-width="13" stroke-linecap="round"/>`;};   // 옆으로 벌어지지 않고 몸을 따라 흘러내리는 팔
  return `<svg class="hw hw-old ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" data-face="${face}">
    <ellipse class="hw-shadow" cx="150" cy="324" rx="104" ry="9" fill="${C.ink}" opacity=".10"/>
    ${P}
    <g class="hw-figure">
      ${arms?arm(-1)+arm(1):''}
      ${G(sc(kx,k), bodyEl('front')+capEl(wax,'front'))}
      ${oldWick(WICKY)}
      ${G(`translate(0,${(WICKY-100).toFixed(1)}) rotate(${tilt} 150 102)`, typeof flame==='number'?smallFlame(flame):flameEl(flame))}
      ${G(`translate(0,${faceDY.toFixed(1)})`, oldFace(face,gear))}
    </g>
  </svg>`;
}
const CSS=`
.hw-old .hw-figure{transform-origin:150px 316px;animation:hwOldBreathe 5.2s ease-in-out infinite}
.hw-old .hw-flame{transform-origin:150px 102px;animation:hwFlicker 2.6s ease-in-out infinite}
@keyframes hwOldBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.012)}}
`;
const CROP='0 70 300 300';   // 인스타 프로필(원형) 크롭 — 내용(불꽃 y107 ~ 그림자 y333)의 한가운데 y220 이 원 중심에 오게 맞춘 값. 캐릭터가 원 지름의 63%
const HWOLD={old,CSS,CROP,parts:{oldFace,oldWick}};
if(typeof module!=='undefined') module.exports=HWOLD; else root.HWOLD=HWOLD;
})(typeof window!=='undefined'?window:globalThis);
