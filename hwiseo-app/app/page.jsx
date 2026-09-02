'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Char from './Char';

/* 앱 기준. 턴 제한은 코드에만 남겨두고 UI에서 다루지 않는다.
   전시용 짧은 버전은 앱이 끝난 뒤 별도로 만든다. (?turns=N 으로만 동작) */
const AVATAR = '/avatar.png';

const T = {
  ko: {
    tapHint: '초를 눌러 불을 켜주세요',
    ob: [
      { t: '사진은 있는데,\n이야기는 어디 갔을까요', d: '갤러리에 쌓인 사진들은 열리지 않아요.\n휘서가 질문으로 그걸 열어드릴게요.' },
      { t: '제가 묻고,\n당신이 답해요', d: '저는 사진을 볼 수는 있지만\n그 순간을 겪어보진 못했어요.' },
      { t: '일주일에 한 번,\n찾아갈게요', d: '편한 시간을 정해두면\n그때 조용히 말을 걸어요.' },
    ],
    next: '다음', start: '시작하기', allow: '알림 받기', later: '나중에',
    nameT: '뭐라고 불러드릴까요?', nameD: '휘서가 대화 중에 이 이름으로 불러요.',
    namePh: '이름 또는 별명', pickColor: '프로필 색',
    tabChat: '대화', tabDrawer: '서랍', tabMe: '나',
    tapNext: '탭해서 계속',
    listT: '대화', newChat: '새 대화 시작하기', ongoing: '이어서', doneTag: '완료',
    drawerT: '서랍', drawerD: '지금까지 꺼낸 이야기예요.',
    meT: '나', notif: '알림', notifD: '휘서가 찾아오는 주기',
    langLabel: '언어', dataT: '사진과 데이터',
    dataD: '올린 사진은 대화가 끝나면 지워지며 저장되지 않습니다. 대화 기록은 이 기기에만 남습니다.',
    dataBtn: '모든 기록 지우기',
    hwT: '휘서', hwD: '기억을 다시 꺼내는 걸 돕는 초.\n사진은 볼 수 있지만 그 순간을 겪지는 못했어요.',
    together: '함께 꺼낸 이야기', flame: '불꽃', storyUnit: '개',
    homeGreet: '오늘은 어떤 사진을\n꺼내볼까요?',
    newChat: '사진 고르고 시작하기',
    archive: '지난 이야기',
    empty: '아직 이야기가 없어요',
    ph: '메시지', online: '듣는 중', delivered: '전달됨',
    done: '오늘의 이야기', again: '다른 사진으로 다시',
    privacy: '올린 사진은 대화가 끝나면 지워지며 저장되지 않습니다.',
    finish: '이야기로 정리하기',
    err: '잠시 문제가 있었어요. 다시 보내주시겠어요?',
    pushT: '휘서', pushB: (n) => `${n ? n + '님' : '당신'}의 이야기를 듣기 위해 기다리고 있어요`,
    now: '지금',
  },
  en: {
    tapHint: 'Tap the candle to light it',
    ob: [
      { t: 'You kept the photo.\nWhere did the story go?', d: 'Photos pile up but never open.\nHwiseo opens them with questions.' },
      { t: 'I ask,\nyou answer', d: 'I can see the photograph, but I never\nlived the moment inside it.' },
      { t: 'Once a week,\nI will come by', d: 'Pick a time that suits you\nand I will quietly say hello.' },
    ],
    next: 'Next', start: 'Get started', allow: 'Turn on notifications', later: 'Later',
    nameT: 'What should I call you?', nameD: 'Hwiseo will use this during the conversation.',
    namePh: 'Name or nickname', pickColor: 'Profile color',
    tabChat: 'Chat', tabDrawer: 'Drawer', tabMe: 'Me',
    tapNext: 'tap to continue',
    listT: 'Chats', newChat: 'Start a new conversation', ongoing: 'Continue', doneTag: 'Done',
    drawerT: 'Drawer', drawerD: 'Stories you have pulled out so far.',
    meT: 'Me', notif: 'Notifications', notifD: 'How often Hwiseo drops by',
    langLabel: 'Language', dataT: 'Photos and data',
    dataD: 'Your photo is deleted when the conversation ends. Chat history stays on this device only.',
    dataBtn: 'Delete everything',
    hwT: 'Hwiseo', hwD: 'A candle that helps memories come back.\nIt can see a photo but never lived the moment.',
    together: 'Stories together', flame: 'Flame', storyUnit: '',
    homeGreet: 'Which photo shall we\nopen today?',
    newChat: 'Pick a photo to begin',
    archive: 'Past stories',
    empty: 'No stories yet',
    ph: 'Message', online: 'listening', delivered: 'Delivered',
    done: "Today's story", again: 'Try another photo',
    privacy: 'Your photo is deleted when the conversation ends. Nothing is stored.',
    finish: 'Turn this into a story',
    err: 'Something went wrong. Send that again?',
    pushT: 'Hwiseo', pushB: (n) => `Waiting to hear ${n ? n + "'s" : 'your'} story`,
    now: 'now',
  },
};

async function shrink(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const max = 1568;
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const url = c.toDataURL('image/jpeg', 0.8);
  return { url, data: url.split(',')[1], mediaType: 'image/jpeg' };
}

const SAMPLE_PHOTO = {
  url: 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#B99B76"/><circle cx="250" cy="240" r="118" fill="#D4BC9A"/><circle cx="545" cy="268" r="92" fill="#C9A87C"/><rect y="430" width="800" height="170" fill="#8E7355"/></svg>`),
  data: '', mediaType: 'image/jpeg',
};
const SAMPLE_MSGS = [
  { role: 'assistant', content: '실내에서 여럿이 모여 있는 사진이네요. 2019년쯤으로 보이는데 맞나요? 어떤 자리였는지 알려주시겠어요?' },
  { role: 'user', content: '동아리 종강 모임이었어요. 다들 시험 끝나고 모인 거였어요.' },
  { role: 'assistant', content: '그날 그 자리에, 사진에 안 찍힌 사람이 또 있었나요?' },
  { role: 'user', content: '사진 찍어준 친구요. 이름이 기억이 안 나는데 얼굴은 선명해요.' },
  { role: 'assistant', content: '그 친구가 무슨 말을 했는지 기억나세요? 사소한 말이어도 괜찮아요.' },
];
const SAMPLE_STORY = {
  oneline: '사진에 없는 사람이 그 웃음을 만들었다.',
  story: '동아리 종강 모임이었다. 사진 속에서 모두 웃고 있는 이유는 프레임 밖에 있던 친구 때문이었다. 이름은 기억나지 않지만 얼굴은 선명하다고 했다. 웃으라고 계속 이상한 소리를 하던 사람. 그 사람은 사진에 남지 않았고, 그 사람이 만든 웃음만 남았다.',
};
/* 지난 세션 — 한 방에 계속 쌓인다 */
const SESSIONS = [
  {
    d: '8월 3일', c: '#D9BEB8', o: '그 방에서는 늘 라디오가 켜져 있었다.',
    msgs: [
      { role: 'assistant', content: '자취방 사진이네요. 창이 하나뿐인 방이었나요?' },
      { role: 'user', content: '네, 그래서 낮에도 어두웠어요.' },
    ],
  },
  {
    d: '8월 14일', c: '#B8C6D9', o: '우산이 하나뿐이라 둘 다 젖었다.',
    msgs: [
      { role: 'assistant', content: '비 오는 날이었네요. 누구랑 같이 있었나요?' },
      { role: 'user', content: '동생이요. 우산이 하나밖에 없었어요.' },
    ],
  },
  {
    d: '8월 21일', c: '#D9C3A0', o: '엄마는 그날 김밥을 두 줄 쌌다.',
    msgs: [
      { role: 'assistant', content: '소풍 사진 같아요. 도시락은 누가 쌌는지 기억나세요?' },
      { role: 'user', content: '엄마가요. 김밥 두 줄이었는데 하나는 제가 다 먹었어요.' },
    ],
  },
];

/* 프로필 색 — 이름 첫 글자가 이 위에 올라간다 */
const PROFILES = [
  { bg: '#FFD54A', fg: '#2E2308' },
  { bg: '#C7B6F5', fg: '#2C2154' },
  { bg: '#8FE0D2', fg: '#0E3B34' },
  { bg: '#FFB09A', fg: '#4A1B0C' },
  { bg: '#A8C8F0', fg: '#12304F' },
  { bg: '#E9DCC8', fg: '#3D3123' },
];

/* 온보딩 — 4스텝. 안내 문구는 전부 휘서의 말풍선으로 전달한다.
   설명문이 아니라 휘서가 건네는 말이어야 인격이 생긴다. */
const OB = {
  ko: [
    { x: '안녕하세요, 저는 휘서예요.\n갤러리에 쌓인 사진들, 잘 안 열어보죠?' },
    { x: '저는 사진을 볼 수는 있지만\n그 안에 있던 순간은 겪어보지 못했어요.\n그건 {n}만 알고 있죠.' },
    { x: '그런데, 뭐라고 불러드릴까요?', need: 'name' },
    { x: '{n}님, 반가워요.\n얼마나 자주 찾아갈까요?', need: 'freq' },
  ],
  en: [
    { x: "Hello, I'm Hwiseo.\nThose photos in your gallery — you rarely open them, right?" },
    { x: 'I can see a photograph, but I never\nlived the moment inside it.\nOnly you did.' },
    { x: 'So — what should I call you?', need: 'name' },
    { x: 'Nice to meet you, {n}.\nHow often should I come by?', need: 'freq' },
  ],
};
const FREQ = { ko: ['주 1회', '2주에 한 번', '한 달에 한 번'], en: ['once a week', 'every two weeks', 'once a month'] };

const SCREENS = [
  { k: '1', id: 'splash', label: '스플래시' },
  { k: '2', id: 'ob-light', label: '온보딩 · 불 켜기' },
  { k: '3', id: 'ob-1', label: '온보딩 · 인사' },
  { k: '4', id: 'ob-name', label: '온보딩 · 이름' },
  { k: '5', id: 'ob-freq', label: '온보딩 · 알림' },
  { k: '6', id: 'list', label: '① 대화 목록' },
  { k: '7', id: 'chat1', label: '① 대화 · 첫 질문' },
  { k: '8', id: 'chat3', label: '① 대화 · 진행' },
  { k: '9', id: 'thinking', label: '① 대화 · 생각 중' },
  { k: 's', id: 'story', label: '① 대화 · 이야기 완성' },
  { k: 'd', id: 'drawer', label: '② 서랍' },
  { k: 'm', id: 'me', label: '③ 나' },
  { k: 'h', id: 'hwiseo', label: '휘서 프로필' },
  { k: '0', id: 'push', label: '푸시 배너' },
];

/* 상태바 자리 — 비워둔다.
   실기기에서는 OS 상태바(시계·배터리)가 이 자리에 오고,
   데스크톱 미리보기에서는 같은 높이의 빈 공간만 남긴다.
   가짜 시계를 그리면 실제 시간과 달라 혼란만 준다. */
function StatusBar() {
  return <div className="statusbar" aria-hidden="true" />;
}

/* 배경 도형 — 보라와 노랑 두 색만. 크기·농도로 무게를 나눈다.
   큰 것은 아주 옅게, 작은 것은 진하게. 가운데(콘텐츠 자리)는 비워둔다. */
function Blobs() {
  return (
    <svg className="blobs" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* 큰 · 아주 옅게 */}
      <circle cx="356" cy="112" r="62" fill="#FFF6DC" />
      <circle cx="18" cy="602" r="58" fill="#FFF6DC" />
      <circle cx="372" cy="676" r="44" fill="#F1ECFD" />
      <circle cx="26" cy="200" r="38" fill="#F1ECFD" />

      {/* 중간 */}
      <circle cx="330" cy="782" r="20" fill="#FFE9A8" />
      <circle cx="52" cy="758" r="14" fill="#DFD5F8" />

      {/* 작은 · 진하게 */}
      <circle cx="332" cy="300" r="8" fill="#FFD54A" />
      <circle cx="46" cy="96" r="6" fill="#B9A6EF" />
      <circle cx="358" cy="452" r="5" fill="#C9BAF3" />
      <circle cx="30" cy="426" r="4" fill="#FFD54A" />
    </svg>
  );
}

export default function Page() {
  const [stage, setStage] = useState('splash');
  const [lang] = useState('ko');
  const [photo, setPhoto] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const [story, setStory] = useState(null);
  const [mock, setMock] = useState(false);
  const [err, setErr] = useState(null);
  const [limit, setLimit] = useState(0);
  const [dev, setDev] = useState(true);
  const [devOpen, setDevOpen] = useState(true);
  const [avatarOk, setAvatarOk] = useState(true);
  const [lit, setLit] = useState(false);
  const [push, setPush] = useState(false);
  const [freq, setFreq] = useState(0);
  const [nick, setNick] = useState('');
  const [prof, setProf] = useState(0);
  const [tab, setTab] = useState('list');
  const [obI, setObI] = useState(0);   // 온보딩 진행 위치
  const [obDraft, setObDraft] = useState('');

  const fileRef = useRef(null);
  const threadRef = useRef(null);
  const taRef = useRef(null);
  const t = T[lang];
  const charSrc = undefined; // 캐릭터 그림 교체 실험 시 '/character.svg' 등으로

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = parseInt(p.get('turns') || '', 10);
    if (!Number.isNaN(n) && n > 0) setLimit(n);
    if (p.get('dev') === '0') setDev(false);
    const sc = p.get('screen');
    if (sc && SCREENS.some((x) => x.id === sc)) goto(sc);
  }, []);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy, stage]);

  useEffect(() => {
    if (!dev) return;
    const h = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      const s = SCREENS.find((x) => x.k === e.key);
      if (s) goto(s.id);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  function goto(id) {
    setErr(null); setBusy(false); setDraft(''); setPush(false);
    if (id === 'push') { setTab('list'); setStage('tabs'); setPush(true); return; }
    if (id === 'ob1') { setLit(false); setStage('ob1'); return; }
    if (id === 'splash') { setStage('splash'); return; }
    if (id.startsWith('ob-')) {
      const at = { 'ob-light': -1, 'ob-1': 0, 'ob-name': 2, 'ob-freq': 3 }[id];
      setLit(at >= 0);
      setObI(Math.max(0, at));
      setStage('ob');
      return;
    }
    if (id === 'list') { setTab('list'); setStage('tabs'); return; }
    if (id === 'drawer') { setTab('drawer'); setStage('tabs'); return; }
    if (id === 'me') { setTab('me'); setStage('tabs'); return; }
    if (id === 'hwiseo') { setStage('hwiseo'); return; }
    setPhoto((p) => p || SAMPLE_PHOTO);
    if (id === 'chat1') { setMsgs(SAMPLE_MSGS.slice(0, 1)); setStage('chat'); }
    else if (id === 'chat3') { setMsgs(SAMPLE_MSGS); setStage('chat'); }
    else if (id === 'thinking') { setMsgs(SAMPLE_MSGS.slice(0, 4)); setStage('chat'); setBusy(true); }
    else if (id === 'story') { setMsgs(SAMPLE_MSGS); setStory(SAMPLE_STORY); setStage('story'); }
  }

  const answered = msgs.filter((m) => m.role === 'user').length;
  const reached = limit > 0 && answered >= limit;
  const level = stage === 'story' ? 4 : Math.min(3, answered);
  const levelAt = (i) => Math.min(3, msgs.slice(0, i).filter((m) => m.role === 'user').length);

  const Face = ({ px, lv }) => <Char level={lv} size={px * 0.86} />;

  /* iOS 알림 배너 — OS가 그리는 것이라 앱 테마와 무관하게 항상 iOS 모양 */
  const pushCard = (staticMode = false) => (
    <div className={`ios-notif ${staticMode ? 'static' : ''}`}
      onClick={staticMode ? undefined : () => { setPush(false); setTab('list'); setStage('tabs'); }}>
      <div className="ios-icon"><img src="/icon-192.png" alt="" /></div>
      <div className="ios-body">
        <div className="ios-head"><b>{t.pushT}</b><span>{t.now}</span></div>
        <div className="ios-text">{t.pushB(nick.trim())}</div>
      </div>
    </div>
  );

  /* 잠금화면 — 폰 기본 배경 위에 알림이 온 상태. iOS 16+ 기준: 알림은 하단 버튼 위에 쌓인다. 배너를 누르면 앱이 열린다 */
  const lockScreen = () => {
    const now = new Date();
    const date = now.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', weekday: 'long' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s*(AM|PM)$/, '');
    return (
      <div className="lock">
        <div className="ltop">
          <svg className="llock" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7z" /></svg>
          <div className="ldate">{date}</div>
          <div className="ltime">{time}</div>
        </div>
        <div className="lstack">{pushCard()}</div>
        <div className="lbottom">
          <div className="lbtn" aria-label="flashlight">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10v3.2L14.6 9v11.5a1.5 1.5 0 0 1-1.5 1.5h-2.2a1.5 1.5 0 0 1-1.5-1.5V9L7 5.2V2zm5 9.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" /></svg>
          </div>
          <div className="lbtn" aria-label="camera">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 3.5 7.9 5.5H5a2.5 2.5 0 0 0-2.5 2.5v10A2.5 2.5 0 0 0 5 20.5h14a2.5 2.5 0 0 0 2.5-2.5V8A2.5 2.5 0 0 0 19 5.5h-2.9l-1.3-2H9.2zM12 8.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm0 1.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z" /></svg>
          </div>
        </div>
        <div className="lhome" />
      </div>
    );
  };

  const call = useCallback(async (path, history) => {
    const res = await fetch(path, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photo: { data: photo.data, mediaType: photo.mediaType }, history, lang, nickname: nick }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'failed');
    if (j.mock) setMock(true);
    return j;
  }, [photo, lang, nick]);

  async function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null); setMsgs([]);
    setPhoto(await shrink(f));
    setStage('chat');
  }

  useEffect(() => {
    if (stage !== 'chat' || !photo?.data || msgs.length > 0 || busy) return;
    (async () => {
      setBusy(true);
      try { const { text } = await call('/api/ask', []); setMsgs([{ role: 'assistant', content: text }]); }
      catch (e) { setErr(String(e.message)); }
      finally { setBusy(false); }
    })();
  }, [stage, photo, msgs.length, busy, call]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next); setDraft(''); setErr(null);
    if (taRef.current) taRef.current.style.height = 'auto';
    if (!photo?.data) return;
    const willEnd = limit > 0 && next.filter((m) => m.role === 'user').length >= limit;
    setBusy(true);
    try {
      if (willEnd) { setStory(await call('/api/compose', next)); setStage('story'); }
      else { const { text: reply } = await call('/api/ask', next); setMsgs([...next, { role: 'assistant', content: reply }]); }
    } catch (e) { setErr(String(e.message)); }
    finally { setBusy(false); }
  }

  /* 지난 대화 열기 — 대화별로 분리된 방 */
  function openSession(a, showStory = false) {
    const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${a.c}"/></svg>`);
    setPhoto({ url, data: '', mediaType: 'image/jpeg' });
    setMsgs(a.msgs);
    setErr(null); setBusy(false); setDraft('');
    if (showStory) { setStory({ oneline: a.o, story: SAMPLE_STORY.story }); setStage('story'); }
    else setStage('chat');
  }

  function reset() {
    setPhoto(null); setMsgs([]); setStory(null); setDraft(''); setErr(null);
    setTab('list'); setStage('tabs');
  }

  async function finish() {
    if (busy || !photo?.data) { goto('story'); return; }
    setBusy(true);
    try { setStory(await call('/api/compose', msgs)); setStage('story'); }
    catch (e) { setErr(String(e.message)); }
    finally { setBusy(false); }
  }

  const active = stage === 'chat'
    ? (busy && msgs.length === 4 ? 'thinking' : msgs.length <= 1 ? 'chat1' : 'chat3')
    : push ? 'push' : stage;

  return (
    <div className="viewport">
      {dev && (devOpen ? (
        <div className="devbar">
          <h6>SCREENS</h6>
          {SCREENS.map((s) => (
            <button key={s.id} className={active === s.id ? 'on' : ''} onClick={() => goto(s.id)}>
              <span className="k">{s.k}</span>{s.label}
            </button>
          ))}
          <button onClick={() => setDevOpen(false)} style={{ marginTop: 4, opacity: .55 }}>
            <span className="k">×</span>닫기
          </button>
        </div>
      ) : <button className="devtoggle" onClick={() => setDevOpen(true)}>▤</button>)}

      <div className="device">
        <StatusBar />
        {mock && <div className="mockflag">MOCK MODE · API 키 없음</div>}

        {/* 푸시 알림 — 잠금화면 위에 iOS 배너 */}
        {push && lockScreen()}

        {/* 스플래시 — 캐릭터가 화면 한가운데 */}
        {stage === 'splash' && (
          <div className="screen center splash">
            <Blobs />
            <div className="splash-mid">
              <Char size={188} src={charSrc} />
              <div className="brandmark">輝敍</div>
              <div className="brand-sub">HWISEO</div>
            </div>
            <button className="cta" onClick={() => { setLit(false); setObI(0); setStage('ob'); }}>{t.start}</button>
          </div>
        )}

        {/* ══ 온보딩 — 스텝 4개. 안내는 휘서의 말풍선으로 ══ */}
        {stage === 'ob' && (() => {
          const script = OB[lang];
          const step = script[obI];
          const fill = (x) =>
            x.replace('{n}', nick.trim() || (lang === 'ko' ? '당신' : 'you'))
             .replace('{f}', FREQ[lang][freq] + (lang === 'ko' ? '마다' : ''));
          const last = obI === script.length - 1;
          const canNext = step.need !== 'name' || nick.trim().length > 0;

          return (
            <div className="screen ob">
              <Blobs />

              {/* 캐릭터 — 첫 스텝에서는 자고 있다. 누르면 눈을 뜬다 */}
              <div className={`obtop ${lit ? 'lit' : ''}`}>
                <button className="obchar" onClick={() => setLit(true)} disabled={lit} aria-label={t.tapHint}>
                  <span className="ring" />
                  <Char size={lit ? 116 : 140} lit={lit} src={charSrc} />
                </button>
              </div>

              {!lit ? (
                <div className="obhint">{t.tapHint}</div>
              ) : (
                <>
                  {/* 큰 말풍선 */}
                  <div className="bigbubble">{fill(step.x)}</div>

                  {/* 스텝별 입력 */}
                  {step.need === 'name' && (
                    <div className="obinput">
                      <div className="bigprof" style={{ background: PROFILES[prof].bg, color: PROFILES[prof].fg }}>
                        {nick.trim() ? nick.trim()[0] : '?'}
                      </div>
                      <input className="nameinput" value={nick} placeholder={t.namePh} maxLength={12}
                        onChange={(e) => setNick(e.target.value)} />
                      <div className="swatches">
                        {PROFILES.map((c, i) => (
                          <button key={i} className={`sw ${prof === i ? 'on' : ''}`}
                            style={{ background: c.bg }} onClick={() => setProf(i)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {step.need === 'freq' && (
                    <div className="obinput">
                      <div className="freq">
                        {FREQ[lang].map((f, i) => (
                          <button key={f} className={`chip ${freq === i ? 'on' : ''}`} onClick={() => setFreq(i)}>{f}</button>
                        ))}
                      </div>
                      <div className="pushpreview">{pushCard(true)}</div>
                    </div>
                  )}

                  <div className="obfoot">
                    <div className="pagedots">
                      {script.map((_, i) => <i key={i} className={i === obI ? 'on' : ''} />)}
                    </div>
                    <button className="cta" disabled={!canNext}
                      onClick={() => { if (last) { setTab('list'); setStage('tabs'); } else setObI(obI + 1); }}>
                      {last ? t.start : t.next}
                    </button>
                    {last && <button className="textbtn" onClick={() => { setTab('list'); setStage('tabs'); }}>{t.later}</button>}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ══ 탭 화면 ══ */}
        {stage === 'tabs' && (
          <>
            {/* ① 대화 목록 */}
            {tab === 'list' && (
              <>
                <div className="pagehead">
                  <h1>{t.listT}</h1>
                  <button className="hwbtn" onClick={() => setStage('hwiseo')}>
                    <Char size={30} />
                  </button>
                </div>
                <div className="scroll">
                  <button className="bigcta" onClick={() => fileRef.current?.click()}>
                    <span className="plus">+</span>{t.newChat}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
                  <div className="rooms">
                    {[...SESSIONS].reverse().map((a, i) => (
                      <button key={i} className="room" onClick={() => openSession(a)}>
                        <span className="rthumb" style={{ background: a.c }} />
                        <span className="rtext">
                          <span className="rtop">
                            <span className="rname">휘서</span>
                            <span className="rdate">{a.d}</span>
                          </span>
                          <span className="rlast">{a.msgs[a.msgs.length - 1].content}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ② 서랍 */}
            {tab === 'drawer' && (
              <>
                <div className="pagehead">
                  <h1>{t.drawerT}</h1>
                </div>
                <div className="scroll">
                  <p className="pagedesc">{t.drawerD}</p>
                  <div className="grid">
                    {[...SESSIONS].reverse().map((a, i) => (
                      <button key={i} className="gcard" onClick={() => openSession(a, true)}>
                        <span className="gphoto" style={{ background: a.c }} />
                        <span className="gdate">{a.d}</span>
                        <span className="gone">{a.o}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ③ 나 */}
            {tab === 'me' && (
              <>
                <div className="pagehead"><h1>{t.meT}</h1></div>
                <div className="scroll">
                  <div className="mecard">
                    <div className="bigprof sm" style={{ background: PROFILES[prof].bg, color: PROFILES[prof].fg }}>
                      {nick.trim() ? nick.trim()[0] : '?'}
                    </div>
                    <input className="nameinput inline" value={nick} placeholder={t.namePh}
                      maxLength={12} onChange={(e) => setNick(e.target.value)} />
                    <div className="swatches sm">
                      {PROFILES.map((c, i) => (
                        <button key={i} className={`sw ${prof === i ? 'on' : ''}`}
                          style={{ background: c.bg }} onClick={() => setProf(i)} />
                      ))}
                    </div>
                  </div>

                  <div className="seclabel">{t.notif}</div>
                  <div className="setcard">
                    <div className="setrow"><span>{t.notifD}</span></div>
                    <div className="freq left">
                      {['주 1회', '2주에 한 번', '한 달에 한 번'].map((f, i) => (
                        <button key={f} className={`chip ${freq === i ? 'on' : ''}`} onClick={() => setFreq(i)}>{f}</button>
                      ))}
                    </div>
                  </div>

                  <div className="seclabel">{t.dataT}</div>
                  <div className="setcard">
                    <p className="setdesc">{t.dataD}</p>
                    <button className="danger">{t.dataBtn}</button>
                  </div>
                </div>
              </>
            )}

            {/* 하단 탭 바 */}
            <nav className="tabbar">
              {[
                { id: 'list', label: t.tabChat, d: 'M4 5h16v10H8l-4 4z' },
                { id: 'drawer', label: t.tabDrawer, d: 'M4 5h16v6H4zM4 13h16v6H4z' },
                { id: 'me', label: t.tabMe, d: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6' },
              ].map((x) => (
                <button key={x.id} className={`tabbtn ${tab === x.id ? 'on' : ''}`} onClick={() => setTab(x.id)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={x.d} />
                  </svg>
                  <span>{x.label}</span>
                </button>
              ))}
            </nav>
          </>
        )}

        {/* 휘서 프로필 */}
        {stage === 'hwiseo' && (
          <div className="screen center hwprof">
            <button className="floatback" onClick={() => setStage('tabs')}>‹</button>
            <Blobs />
            <div className="stagechar" style={{ height: 210 }}>
              <span className="ring" />
              <Char size={158} />
            </div>
            <div className="title" style={{ marginTop: 20 }}>{t.hwT}</div>
            <p className="lede">{t.hwD}</p>
            <div className="stats">
              <div className="stat">
                <b>{SESSIONS.length}</b>
                <span>{t.together}</span>
              </div>
              <div className="stat">
                <b>{Math.min(4, SESSIONS.length)} / 4</b>
                <span>{t.flame}</span>
              </div>
            </div>
            <div className="flamebar"><i style={{ width: `${Math.min(4, SESSIONS.length) / 4 * 100}%` }} /></div>
          </div>
        )}

        {/* 대화 */}
        {stage === 'chat' && photo && (
          <>
            <div className="nav">
              <button className="back" onClick={() => { setTab('list'); setStage('tabs'); }}>‹</button>
              <div className="navav"><Face px={42} lv={level} /></div>
              <div className="meta">
                <div className="nm">휘서</div>
                <div className="st"><i />{busy ? t.online : 'HWISEO'}</div>
              </div>
            </div>
            <div className="thread" ref={threadRef}>
              <div className="stamp"><b>오늘</b> 오후 9:41</div>
              {msgs.map((m, i) => {
                const me = m.role === 'user';
                const prev = msgs[i - 1], next = msgs[i + 1];
                const first = !prev || prev.role !== m.role;
                const last = !next || next.role !== m.role;
                return (
                  <div key={i} className={`row ${me ? 'me' : 'ai'} ${first ? 'first' : ''}`}>
                    {!me && <div className={`msgav ${last ? '' : 'blank'}`}>{last && <Face px={30} lv={levelAt(i)} />}</div>}
                    <div className={`bubble ${last ? '' : 'mid'}`}>{m.content}</div>
                  </div>
                );
              })}
              {busy && (
                <div className="row ai first">
                  <div className="msgav"><Face px={30} lv={level} /></div>
                  <div className="dots"><i /><i /><i /></div>
                </div>
              )}
              {!busy && msgs.length > 0 && msgs[msgs.length - 1].role === 'user' && (
                <div className="delivered">{t.delivered}</div>
              )}
              {err && <div className="sysline">{t.err}</div>}
              {!busy && msgs.length >= 4 && limit === 0 && (
                <button className="ghost" onClick={finish}>{t.finish}</button>
              )}
            </div>
            <div className="compose">
              <div className="wrap">
                <textarea ref={taRef} rows={1} value={draft} placeholder={t.ph} disabled={reached}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 104) + 'px';
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              </div>
              <button className={`send ${draft.trim() ? 'on' : ''}`} onClick={send}>↑</button>
            </div>
          </>
        )}

        {/* 이야기 */}
        {stage === 'story' && story && (
          <>
            <div className="story-wrap">
              <div className="story-label"><Char level={4} size={16} />{t.done}</div>
              {photo && <img className="storyphoto" src={photo.url} alt="" />}
              <div className="oneline">{story.oneline}</div>
              <div className="story">{story.story}</div>
              <p className="note" style={{ textAlign: 'left' }}>{t.privacy}</p>
            </div>
            <div className="foot">
              <button className="cta" style={{ marginTop: 0 }} onClick={() => { setTab('list'); setStage('tabs'); }}>{t.again}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
