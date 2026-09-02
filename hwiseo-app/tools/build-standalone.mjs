/**
 * 단일 HTML 프로토타입 생성기
 *
 * 앱과 같은 CSS·캐릭터 이미지를 그대로 쓰고, 화면 전환만 순수 JS로 다시 쓴다.
 * AI 대화는 들어가지 않는다 — API 키를 HTML에 넣을 수 없기 때문.
 * 대신 미리 짜둔 대화가 돈다 (앱의 목 모드와 같은 내용).
 *
 *   node tools/build-standalone.mjs
 *   → ../prototype/휘서-프로토타입.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const outDir = path.join(root, '..', 'prototype');

const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const charB64 = fs.readFileSync(path.join(root, 'public/character.png')).toString('base64');
const CHAR = `data:image/png;base64,${charB64}`;

const SESSIONS = [
  { d: '8월 3일', c: '#D9BEB8', o: '그 방에서는 늘 라디오가 켜져 있었다.',
    msgs: [['ai','자취방 사진이네요. 창이 하나뿐인 방이었나요?'],['me','네, 그래서 낮에도 어두웠어요.']] },
  { d: '8월 14일', c: '#B8C6D9', o: '우산이 하나뿐이라 둘 다 젖었다.',
    msgs: [['ai','비 오는 날이었네요. 누구랑 같이 있었나요?'],['me','동생이요. 우산이 하나밖에 없었어요.']] },
  { d: '8월 21일', c: '#D9C3A0', o: '엄마는 그날 김밥을 두 줄 쌌다.',
    msgs: [['ai','소풍 사진 같아요. 도시락은 누가 쌌는지 기억나세요?'],['me','엄마가요. 김밥 두 줄이었는데 하나는 제가 다 먹었어요.']] },
];

const SCRIPT_MSGS = [
  ['ai','실내에서 여럿이 모여 있는 사진이네요. 2019년쯤으로 보이는데 맞나요? 어떤 자리였는지 알려주시겠어요?'],
  ['me','동아리 종강 모임이었어요. 다들 시험 끝나고 모인 거였어요.'],
  ['ai','그날 그 자리에, 사진에 안 찍힌 사람이 또 있었나요?'],
  ['me','사진 찍어준 친구요. 이름이 기억이 안 나는데 얼굴은 선명해요.'],
  ['ai','그 친구가 무슨 말을 했는지 기억나세요? 사소한 말이어도 괜찮아요.'],
];

const STORY = {
  oneline: '사진에 없는 사람이 그 웃음을 만들었다.',
  story: '동아리 종강 모임이었다. 사진 속에서 모두 웃고 있는 이유는 프레임 밖에 있던 친구 때문이었다. 이름은 기억나지 않지만 얼굴은 선명하다고 했다. 웃으라고 계속 이상한 소리를 하던 사람. 그 사람은 사진에 남지 않았고, 그 사람이 만든 웃음만 남았다.',
};

const PROFILES = [
  ['#FFD54A','#2E2308'],['#C7B6F5','#2C2154'],['#8FE0D2','#0E3B34'],
  ['#FFB09A','#4A1B0C'],['#A8C8F0','#12304F'],['#E9DCC8','#3D3123'],
];

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#FFFFFF">
<title>휘서 輝敍 — 프로토타입</title>
<link rel="apple-touch-icon" href="${CHAR}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>
${css}
/* 단일 HTML 전용 — 폰에서는 프레임 없이 꽉 차게 */
.proto-note{position:fixed;bottom:0;left:0;right:0;z-index:99;background:#1D1B22;color:#FFD54A;
  font:500 11px/1.5 -apple-system,sans-serif;padding:7px 14px;text-align:center;letter-spacing:.01em}
@media (max-width:899px){ .proto-note{display:none} }
</style>
</head>
<body>
<div class="viewport"><div class="device" id="device"></div></div>
<div class="proto-note">디자인 프로토타입 · 대화는 미리 준비된 내용입니다 (실제 AI 연결은 앱에서)</div>

<script>
const CHAR = ${JSON.stringify(CHAR)};
const SESSIONS = ${JSON.stringify(SESSIONS)};
const SCRIPT_MSGS = ${JSON.stringify(SCRIPT_MSGS)};
const STORY = ${JSON.stringify(STORY)};
const PROFILES = ${JSON.stringify(PROFILES)};

const S = { stage:'splash', tab:'list', lit:false, nick:'', prof:0, freq:0,
            msgs:[], step:0, photo:null, push:false, busy:false };

const el = (h) => { const d=document.createElement('div'); d.innerHTML=h.trim(); return d.firstElementChild; };
const char = (px) => \`<img src="\${CHAR}" alt="휘서" style="width:\${px}px;height:\${px}px;object-fit:contain;display:block">\`;
const esc = (s) => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

const statusbar = '<div class="statusbar" aria-hidden="true"></div>';

const blobs = \`<svg class="blobs" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<circle cx="356" cy="112" r="62" fill="#FFF6DC"/><circle cx="18" cy="602" r="58" fill="#FFF6DC"/>
<circle cx="372" cy="676" r="44" fill="#F1ECFD"/><circle cx="26" cy="200" r="38" fill="#F1ECFD"/>
<circle cx="330" cy="782" r="20" fill="#FFE9A8"/><circle cx="52" cy="758" r="14" fill="#DFD5F8"/>
<circle cx="332" cy="300" r="8" fill="#FFD54A"/><circle cx="46" cy="96" r="6" fill="#B9A6EF"/>
<circle cx="358" cy="452" r="5" fill="#C9BAF3"/><circle cx="30" cy="426" r="4" fill="#FFD54A"/></svg>\`;

const dots = (n,i,tot=4) => '<div class="pagedots">' + Array.from({length:tot},(_,k)=>\`<i class="\${k===i?'on':''}"></i>\`).join('') + '</div>';
const photoSvg = (c) => 'data:image/svg+xml;utf8,' + encodeURIComponent(\`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="\${c}"/></svg>\`);
const pushText = () => (S.nick.trim() ? S.nick.trim()+'님' : '당신') + '의 이야기를 듣기 위해 기다리고 있어요';
const pushBanner = (cls='') => \`<div class="pushbanner \${cls}" \${cls?'':'data-act="closepush"'}>
  <div class="pushicon">\${char(38)}</div>
  <div class="pushbody"><div class="pt">휘서<span>지금</span></div><div class="pb">\${esc(pushText())}</div></div></div>\`;

function bubbles(msgs){
  return msgs.map(([role,text],i)=>{
    const me = role==='me';
    const prev = msgs[i-1], next = msgs[i+1];
    const first = !prev || prev[0]!==role;
    const last = !next || next[0]!==role;
    return \`<div class="row \${me?'me':'ai'} \${first?'first':''}">
      \${!me ? \`<div class="msgav \${last?'':'blank'}">\${last?char(26):''}</div>\` : ''}
      <div class="bubble \${last?'':'mid'}">\${esc(text)}</div></div>\`;
  }).join('');
}

function render(){
  const d = document.getElementById('device');
  let h = statusbar;
  if (S.push) h += pushBanner();

  if (S.stage==='splash') h += \`<div class="screen center splash">\${blobs}
    <div class="splash-mid">\${char(188)}<div class="brandmark">輝敍</div><div class="brand-sub">HWISEO</div></div>
    <button class="cta" data-act="go:ob1">시작하기</button></div>\`;

  else if (S.stage==='ob1') h += \`<div class="screen center">\${blobs}
    <button class="stagechar" data-act="light"><span class="ring"></span>\${char(150)}</button>
    \${S.lit
      ? '<div class="title">사진은 있는데,\\n이야기는 어디 갔을까요</div><p class="lede">갤러리에 쌓인 사진들은 열리지 않아요.\\n휘서가 질문으로 그걸 열어드릴게요.</p>'
      : '<div class="title" style="color:var(--muted);font-size:17px;font-weight:600">초를 눌러 불을 켜주세요</div>'}
    \${dots(4,0)}
    \${S.lit ? '<button class="cta" data-act="go:ob2">다음</button>' : ''}</div>\`;

  else if (S.stage==='ob2') h += \`<div class="screen center">\${blobs}
    <div class="obchat">
      <div class="obrow ai"><div class="obav">\${char(24)}</div><div class="obb">어떤 자리였는지 기억나세요?</div></div>
      <div class="obrow me"><div class="obb my">동아리 종강 모임이요</div></div>
      <div class="obrow ai"><div class="obav">\${char(24)}</div><div class="obb">사진에 안 찍힌 사람도 있었나요?</div></div>
    </div>
    <div class="title">제가 묻고,\\n당신이 답해요</div>
    <p class="lede">저는 사진을 볼 수는 있지만\\n그 순간을 겪어보진 못했어요.</p>
    \${dots(4,1)}<button class="cta" data-act="go:name">다음</button></div>\`;

  else if (S.stage==='name') h += \`<div class="screen center">\${blobs}
    <div class="bigprof" style="background:\${PROFILES[S.prof][0]};color:\${PROFILES[S.prof][1]}">\${S.nick.trim()?esc(S.nick.trim()[0]):'?'}</div>
    <div class="title">뭐라고 불러드릴까요?</div>
    <p class="lede">휘서가 대화 중에 이 이름으로 불러요.</p>
    <input class="nameinput" id="nick" value="\${esc(S.nick)}" placeholder="이름 또는 별명" maxlength="12">
    <div class="swatches">\${PROFILES.map((c,i)=>\`<button class="sw \${S.prof===i?'on':''}" style="background:\${c[0]}" data-act="prof:\${i}"></button>\`).join('')}</div>
    \${dots(4,2)}<button class="cta" data-act="go:ob3">다음</button></div>\`;

  else if (S.stage==='ob3') h += \`<div class="screen center">\${blobs}
    <div class="pushpreview">\${pushBanner('static')}
      <div class="freq">\${['주 1회','2주에 한 번','한 달에 한 번'].map((f,i)=>\`<button class="chip \${S.freq===i?'on':''}" data-act="freq:\${i}">\${f}</button>\`).join('')}</div>
    </div>
    <div class="title">일주일에 한 번,\\n찾아갈게요</div>
    <p class="lede">편한 시간을 정해두면\\n그때 조용히 말을 걸어요.</p>
    \${dots(4,3)}
    <button class="cta" data-act="go:tabs">알림 받기</button>
    <button class="textbtn" data-act="go:tabs">나중에</button></div>\`;

  else if (S.stage==='tabs'){
    if (S.tab==='list') h += \`<div class="pagehead"><h1>대화</h1>
      <button class="hwbtn" data-act="go:hwiseo">\${char(28)}</button></div>
      <div class="scroll"><button class="bigcta" data-act="newchat"><span class="plus">+</span>사진 고르고 시작하기</button>
      <div class="rooms">\${[...SESSIONS].reverse().map((a,i)=>\`<button class="room" data-act="open:\${SESSIONS.length-1-i}">
        <span class="rthumb" style="background:\${a.c}"></span>
        <span class="rtext"><span class="rtop"><span class="rname">휘서</span><span class="rdate">\${a.d}</span></span>
        <span class="rlast">\${esc(a.msgs[a.msgs.length-1][1])}</span></span></button>\`).join('')}</div></div>\`;
    else if (S.tab==='drawer') h += \`<div class="pagehead"><h1>서랍</h1></div>
      <div class="scroll"><p class="pagedesc">지금까지 꺼낸 이야기예요.</p>
      <div class="grid">\${[...SESSIONS].reverse().map((a,i)=>\`<button class="gcard" data-act="story:\${SESSIONS.length-1-i}">
        <span class="gphoto" style="background:\${a.c}"></span><span class="gdate">\${a.d}</span>
        <span class="gone">\${esc(a.o)}</span></button>\`).join('')}</div></div>\`;
    else h += \`<div class="pagehead"><h1>나</h1></div><div class="scroll">
      <div class="mecard"><div class="bigprof sm" style="background:\${PROFILES[S.prof][0]};color:\${PROFILES[S.prof][1]}">\${S.nick.trim()?esc(S.nick.trim()[0]):'?'}</div>
      <input class="nameinput inline" id="nick" value="\${esc(S.nick)}" placeholder="이름 또는 별명" maxlength="12">
      <div class="swatches sm">\${PROFILES.map((c,i)=>\`<button class="sw \${S.prof===i?'on':''}" style="background:\${c[0]}" data-act="prof:\${i}"></button>\`).join('')}</div></div>
      <div class="seclabel">알림</div><div class="setcard"><div class="setrow"><span>휘서가 찾아오는 주기</span></div>
      <div class="freq left">\${['주 1회','2주에 한 번','한 달에 한 번'].map((f,i)=>\`<button class="chip \${S.freq===i?'on':''}" data-act="freq:\${i}">\${f}</button>\`).join('')}</div></div>
      <div class="seclabel">사진과 데이터</div><div class="setcard">
      <p class="setdesc">올린 사진은 대화가 끝나면 지워지며 저장되지 않습니다. 대화 기록은 이 기기에만 남습니다.</p>
      <button class="danger">모든 기록 지우기</button></div></div>\`;

    h += \`<nav class="tabbar">
      <button class="tabbtn \${S.tab==='list'?'on':''}" data-act="tab:list"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v10H8l-4 4z"/></svg><span>대화</span></button>
      <button class="tabbtn \${S.tab==='drawer'?'on':''}" data-act="tab:drawer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v6H4zM4 13h16v6H4z"/></svg><span>서랍</span></button>
      <button class="tabbtn \${S.tab==='me'?'on':''}" data-act="tab:me"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg><span>나</span></button>
    </nav>\`;
  }

  else if (S.stage==='hwiseo') h += \`<div class="screen center hwprof">
    <button class="floatback" data-act="go:tabs">‹</button>\${blobs}
    <div class="stagechar" style="height:210px"><span class="ring"></span>\${char(158)}</div>
    <div class="title" style="margin-top:20px">휘서</div>
    <p class="lede">기억을 다시 꺼내는 걸 돕는 초.\\n사진은 볼 수 있지만 그 순간을 겪지는 못했어요.</p>
    <div class="stats"><div class="stat"><b>\${SESSIONS.length}</b><span>함께 꺼낸 이야기</span></div>
    <div class="stat"><b>3 / 4</b><span>불꽃</span></div></div>
    <div class="flamebar"><i style="width:75%"></i></div></div>\`;

  else if (S.stage==='chat') h += \`<div class="nav"><button class="back" data-act="go:tabs">‹</button>
    <div class="navav">\${char(38)}</div>
    <div class="meta"><div class="nm">휘서</div><div class="st"><i></i>\${S.busy?'듣는 중':'HWISEO'}</div></div></div>
    <div class="thread" id="thread"><div class="stamp"><b>오늘</b> 오후 9:41</div>
    \${bubbles(S.msgs)}
    \${S.busy?'<div class="row ai first"><div class="msgav">'+char(26)+'</div><div class="dots"><i></i><i></i><i></i></div></div>':''}
    \${(!S.busy && S.msgs.length && S.msgs[S.msgs.length-1][0]==='me')?'<div class="delivered">전달됨</div>':''}
    \${(!S.busy && S.step>=SCRIPT_MSGS.length)?'<button class="ghost" data-act="tostory">이야기로 정리하기</button>':''}
    </div>
    <div class="compose"><div class="wrap"><textarea rows="1" id="ta" placeholder="메시지"></textarea></div>
    <button class="send" id="send" data-act="send">↑</button></div>\`;

  else if (S.stage==='story') h += \`<div class="story-wrap">
    <div class="story-label">\${char(15)}오늘의 이야기</div>
    <img class="storyphoto" src="\${photoSvg(S.photo||'#B99B76')}" alt="">
    <div class="oneline">\${esc(S.storyData?.oneline||STORY.oneline)}</div>
    <div class="story">\${esc(S.storyData?.story||STORY.story)}</div>
    <p class="note" style="text-align:left">올린 사진은 대화가 끝나면 지워지며 저장되지 않습니다.</p></div>
    <div class="foot"><button class="cta" style="margin-top:0" data-act="go:tabs">다른 사진으로 다시</button></div>\`;

  d.innerHTML = h;
  const th = document.getElementById('thread'); if (th) th.scrollTop = th.scrollHeight;
  const ta = document.getElementById('ta');
  if (ta) {
    ta.addEventListener('input', () => {
      document.getElementById('send').classList.toggle('on', !!ta.value.trim());
      ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,104)+'px';
    });
    ta.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); act('send'); } });
  }
  const nk = document.getElementById('nick');
  if (nk) nk.addEventListener('input', e => {
    S.nick = e.target.value;
    const bp = document.querySelector('.bigprof'); if (bp) bp.textContent = S.nick.trim() ? S.nick.trim()[0] : '?';
  });
}

function advance(){
  if (S.step >= SCRIPT_MSGS.length) return;
  S.busy = true; render();
  setTimeout(() => {
    S.msgs.push(SCRIPT_MSGS[S.step]); S.step++;
    S.busy = false; render();
  }, 900);
}

function act(a){
  const [k,v] = a.split(':');
  if (k==='go'){ S.push=false; if(v==='tabs'){S.tab='list';S.stage='tabs';} else S.stage=v; }
  else if (k==='light'){ S.lit=true; }
  else if (k==='prof'){ S.prof=+v; }
  else if (k==='freq'){ S.freq=+v; }
  else if (k==='tab'){ S.tab=v; }
  else if (k==='closepush'){ S.push=false; S.tab='list'; S.stage='tabs'; }
  else if (k==='newchat'){ S.msgs=[]; S.step=0; S.photo='#B99B76'; S.storyData=null; S.stage='chat'; render(); advance(); return; }
  else if (k==='open'){ const a2=SESSIONS[+v]; S.msgs=a2.msgs.slice(); S.step=SCRIPT_MSGS.length; S.photo=a2.c; S.stage='chat'; }
  else if (k==='story'){ const a2=SESSIONS[+v]; S.photo=a2.c; S.storyData={oneline:a2.o, story:STORY.story}; S.stage='story'; }
  else if (k==='tostory'){ S.storyData=null; S.stage='story'; }
  else if (k==='send'){
    const ta=document.getElementById('ta'); const txt=ta?.value.trim();
    if(!txt||S.busy) return;
    S.msgs.push(['me',txt]);
    if (S.step<SCRIPT_MSGS.length && SCRIPT_MSGS[S.step][0]==='me') S.step++;
    render(); advance(); return;
  }
  render();
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (b) act(b.dataset.act);
});
render();
</script>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, '휘서-프로토타입.html');
fs.writeFileSync(outPath, html);
const kb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`생성: ${outPath}  (${kb} KB, 단일 파일)`);
