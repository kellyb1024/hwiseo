// ── 휘서 캐릭터 부품 — 시안 A (mock-0831-A) 구현 ─────────────────────
// hw-character.js 와 같은 HW.* 계약. 아웃라인 없음.
//   몸통 #FFD54A · 촛농 #F5B92E · 불꽃 #FFF3CE · 눈/심지 #1D1B22
//   불꽃 크기 = 이야기 단계(level 0~4), 눈 = 순간(mood)
//   좌표계: viewBox 0 0 300 340 (몸 y130~324, 불꽃 y10~122, 눈 y215, 입 y250)
(function(){
const BODY='#FFD54A', DRIP='#F5B92E', FLAMECOL='#FFF3CE', INK='#1D1B22', SMOKE='#D9CCFF';
const FLAME = {
  0: '',
  1: 'M150,122 C138,112 136,98 150,84 C164,98 162,112 150,122 Z',
  2: 'M150,122 C132,108 128,84 150,54 C172,84 168,108 150,122 Z',
  3: 'M150,122 C126,110 114,84 124,60 C130,74 138,82 142,76 C136,58 142,40 150,26 C170,50 176,90 150,122 Z',
  4: 'M150,122 C122,110 106,80 118,52 C124,68 132,76 138,68 C134,50 140,32 150,10 C160,32 166,50 162,68 C168,76 176,68 182,52 C194,80 178,110 150,122 Z',
};
const bodyPath=(h=140)=>`M60,166 a36,36 0 0 1 36,-36 h108 a36,36 0 0 1 36,36 v${h} a18,18 0 0 1 -36,0 a18,18 0 0 1 -36,0 a18,18 0 0 1 -36,0 a18,18 0 0 1 -36,0 a18,18 0 0 1 -36,0 Z`;
const BODYPATH=bodyPath(140);
const MOOD = (m)=>({wink:'friendly',surprise:'confusion'}[m]||m);
function eyes(mood){
  const L=118,R=182,Y=215;
  const open=(dx=0,dy=0)=>`<circle cx="${L}" cy="${Y}" r="17" fill="#fff"/><circle cx="${R}" cy="${Y}" r="17" fill="#fff"/>
    <circle cx="${L+dx}" cy="${Y+dy}" r="8" fill="${INK}"/><circle cx="${R+dx}" cy="${Y+dy}" r="8" fill="${INK}"/>`;
  switch(MOOD(mood)){
    case 'friendly': return open()+`<path d="M137,246 q13,12 26,0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    case 'confusion': return `<g transform="rotate(-14 ${L} ${Y})"><ellipse cx="${L}" cy="${Y}" rx="17" ry="14" fill="#fff"/><circle cx="${L+3}" cy="${Y+1}" r="8" fill="${INK}"/></g>
      <circle cx="${R}" cy="${Y}" r="17" fill="#fff"/><circle cx="${R+4}" cy="${Y-2}" r="8" fill="${INK}"/>
      <path d="M140,252 l20,-5" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    case 'joy': return `<path d="M102,${Y+2} q16,-20 32,0 M166,${Y+2} q16,-20 32,0" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="150" cy="250" rx="11" ry="9" fill="${INK}"/>`;
    case 'sleep': return `<path d="M102,${Y-4} q16,18 32,0 M166,${Y-4} q16,18 32,0" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
    default: /* watching */ return open()+`<circle cx="150" cy="250" r="3.5" fill="${INK}"/>`;
  }
}
function draw({level=3,mood='watching',drips=true,eyesOn=true,smoke=true,tall=false,viewBox='0 0 300 340'}={}){
  const BP = tall ? bodyPath(300) : BODYPATH;   // tall: 스플래시처럼 얼굴을 위로 올리고 몸통이 화면 밑까지 이어질 때
  if(tall) viewBox='0 0 300 500';
  const id='hwA'+Math.random().toString(36).slice(2,8);
  const smokeEl = (level===0 && smoke) ? `<path d="M150,112 c8,-8 -8,-16 2,-26" stroke="${SMOKE}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>` : '';
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}"><path d="${BP}"/></clipPath></defs>
    ${FLAME[level] ? `<path d="${FLAME[level]}" fill="${FLAMECOL}"/>` : ''}
    ${smokeEl}
    <rect x="145" y="112" width="10" height="22" rx="4" fill="${INK}"/>
    <path d="${BP}" fill="${BODY}"/>
    ${drips ? `<g clip-path="url(#${id})" fill="${DRIP}">
      <rect x="40" y="120" width="220" height="34"/>
      <rect x="86" y="140" width="22" height="52" rx="11"/>
      <rect x="142" y="140" width="18" height="30" rx="9"/>
      <rect x="196" y="140" width="24" height="66" rx="12"/>
    </g>` : ''}
    ${eyesOn ? eyes(mood) : ''}
  </svg>`;
}
window.HW = {
  meta:{unit:300, headTop:10, eyeY:215, mouthY:250, chinY:324, total:(bh)=>340},   // 몸 높이는 고정 — bh 무시
  // 거대 얼굴: 작은 불꽃(1단계) 포함, viewBox 45 60 210 230
  giant:(mood='watching')=>draw({level:1,mood,viewBox:'60 60 180 230'}),   // 몸통 폭(60~240)에 딱 맞춰 화면을 꽉 채운다
  giantBox:{w:180,h:230,eyeY:155,mouthY:190},
  full:({mood='watching',bh=139,level=3,tall=false}={})=>draw({level,mood:level===0?'sleep':mood,tall}),   // 꺼진 초는 잔다. tall=긴 몸통(viewBox 300×500)
  chip:(mood='watching')=>draw({level:0,mood,drips:false,smoke:false,viewBox:'55 125 190 205'}),   // 칩: 몸만
  mark:`${FLAME[3]} ${BODYPATH}`, markBox:'40 0 220 340',
  colors:{ink:INK,flame:BODY,wax:BODY}
};
})();
