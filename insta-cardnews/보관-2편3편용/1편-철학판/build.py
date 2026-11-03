# 카드뉴스 2~8장 HTML 생성. 공통 머리(태그·쪽수·푸터)는 여기서 감싼다.
HEAD = '''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>휘서 카드뉴스 {n:02d}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="common.css"><script src="../design/character/hwiseo-F.js"></script>
<style>{css}</style></head><body><div class="card {cls}">
{body}
<div class="foot">연세대학교 IID 전공 졸업전시 2026</div>
</div><script src="common.js"></script></body></html>'''

CARDS = {}

CARDS[2] = dict(css='''
.note{left:84px;top:470px;width:760px;padding:64px 60px 60px;transform:rotate(-1.2deg);
  background:linear-gradient(transparent 63px,#EFE9F7 63px) 0 40px/100% 64px,#fff}
.note p{font-size:40px;line-height:64px;font-weight:500}
.note b{color:var(--purple);font-weight:800}
.aside{position:absolute;left:120px;top:960px;font-size:54px;line-height:1.15;color:var(--purple);transform:rotate(-3deg)}
.who{position:absolute;right:40px;top:500px;width:300px;height:300px;transform:rotate(8deg)}
.nametag{position:absolute;right:70px;top:130px;width:290px;background:var(--purple);border-radius:22px;padding:14px 0 18px;text-align:center;transform:rotate(6deg);box-shadow:0 12px 26px rgba(60,40,90,.18)}
.nametag small{display:block;color:#fff;font-weight:800;font-size:34px;letter-spacing:2px}
.nametag span{display:block;color:#fff;font-size:22px;font-weight:600;opacity:.85}
.nametag div{margin:12px 16px 0;background:#fff;border-radius:10px;font-size:84px;line-height:1.25;color:var(--ink)}
''', body='''
<h1 class="title">왜 이름이<br><span class="hl"><span class="p">'휘서'</span>인가요?</span></h1>
<div class="nametag"><small>HELLO</small><span>my name is</span><div class="pen">휘서</div></div>
<div class="note"><div class="tape"></div>
  <p>사실 <b>휘서는 제 예명</b>이에요 ㅎㅎ<br>개명에 실패한 뒤…<br>이 소중한 이름을 영원히 간직하고 싶어서<br>자식 같은 졸업전시 AI에게<br><b>물려주게</b> 됐어요.</p>
</div>
<div class="who" data-hw='{"pose":"idle","level":2,"mood":"shy"}'></div>
<div class="aside pen">(그치만 저를 휘서로 아는 여러분에게<br>저는 영원한 휘서예요!)</div>
''')

# ── 1편: 철학 중심 (03~08) ──
CARDS[3] = dict(css='''
.sub{top:400px}
.note{left:84px;top:590px;width:860px;padding:64px 64px 60px;transform:rotate(-1deg)}
.note .q{font-size:36px;color:var(--mute);font-weight:600;margin-bottom:18px}
.note .q s{text-decoration-color:var(--purple);text-decoration-thickness:4px}
.note .a{font-size:60px;line-height:1.35;font-weight:800;letter-spacing:-1.5px}
.note .a em{font-style:normal;color:var(--purple)}
.me{position:absolute;right:60px;top:930px;width:330px;height:330px;transform:rotate(6deg)}
.memo{position:absolute;left:110px;top:1000px;font-size:56px;line-height:1.15;color:var(--purple);transform:rotate(-3deg)}
''', body='''
<h1 class="title">저는 <span class="p">가치</span>를 만들고<br><span class="hl">이야기의 힘</span>을 믿어요</h1>
<p class="sub">AI로 UI/UX를 기획하는 졸업전시.<br>그래서 처음 던진 질문을 바꿨어요.</p>
<div class="note"><div class="tape"></div>
  <p class="q"><s>이번엔 무슨 AI 기술을 보여줄까?</s></p>
  <p class="a">이 기술로 사람의 <em>무엇을<br>지킬 수 있을까?</em></p>
</div>
<div class="me" data-hw='{"level":3,"mood":"happy"}'></div>
<div class="memo pen">↑ 이 질문이<br>제 졸업작품의 출발점!</div>
''')

CARDS[4] = dict(css='''
.sub{top:400px}
.boxes{position:absolute;left:84px;top:620px;width:912px;display:grid;grid-template-columns:1fr 1fr;gap:30px}
.bx{background:#fff;border-radius:30px;padding:36px 34px 34px;box-shadow:0 12px 28px rgba(60,40,90,.10);text-align:center}
.bx svg{display:block;margin:0 auto 18px}
.bx h3{font-size:40px;font-weight:800;letter-spacing:-1px;margin-bottom:10px}
.bx p{font-size:30px;color:var(--sub);line-height:1.45}
.bx .why{display:inline-block;margin-top:18px;font-size:44px;color:var(--purple)}
.bot{position:absolute;left:84px;top:1080px;width:912px;font-size:40px;font-weight:700;line-height:1.5}
.bot span{background:linear-gradient(transparent 58%,var(--yellow) 58%)}
''', body='''
<h1 class="title">찍는 건 쉬워졌는데,<br><span class="hl">다시 꺼내본 적</span> 있어요?</h1>
<p class="sub">AI 시대는 우리를 자꾸 '만드는 사람' 자리에 세워요.<br>되돌아볼 시간은 점점 사라지고요.</p>
<div class="boxes">
  <div class="bx"><svg width="150" height="100" viewBox="0 0 150 100" fill="#EDE7FF" stroke="#765DCF" stroke-width="5" stroke-linejoin="round"><path d="M38 86 h78 a26 26 0 0 0 2 -52 a36 36 0 0 0 -68 -6 a28 28 0 0 0 -12 58 z"/><rect x="58" y="44" width="34" height="26" rx="4" fill="#fff"/><path d="M64 44 v-8 a11 11 0 0 1 22 0 v8" fill="none"/></svg>
    <h3>사진은 클라우드에</h3><p>수천 장이 쌓여 있지만</p><span class="why pen">꺼내지 않아서 잠겨 있고</span></div>
  <div class="bx"><svg width="150" height="100" viewBox="0 0 150 100" fill="#FFF3C4" stroke="#765DCF" stroke-width="5" stroke-linejoin="round"><path d="M52 94 v-16 c-16 -6 -26 -20 -26 -38 a40 40 0 0 1 80 -2 l10 16 h-10 v14 c0 8 -6 12 -14 12 h-8 v14"/><path d="M52 40 h24 M52 52 h16" stroke-dasharray="4 7" fill="none"/></svg>
    <h3>이야기는 머릿속에</h3><p>분명 있었던 그날인데</p><span class="why pen">물어봐 주지 않아서 흐릿해요</span></div>
</div>
<p class="bot">둘 다 있는데, 둘 다 열리지 않아요.<br><span>저는 이 잠긴 두 저장고를 열고 싶었어요.</span></p>
''')

CARDS[5] = dict(css='''
.cmp{position:absolute;left:84px;top:430px;width:912px;display:grid;grid-template-columns:1fr 1fr;gap:26px}
.col{border-radius:30px;padding:34px 36px}
.col.then{background:#fff;box-shadow:0 12px 28px rgba(60,40,90,.10);transform:rotate(-1.5deg)}
.col.now{background:#EDE7FF;transform:rotate(1.5deg)}
.col h3{font-size:34px;font-weight:800;color:var(--purple);margin-bottom:16px}
.col li{list-style:none;font-size:34px;line-height:1.5;font-weight:600;padding:10px 0;border-bottom:2px dashed #DDD4EE}
.col li:last-child{border:0}
.col.now li{color:var(--sub)}
.seat{position:absolute;left:84px;top:880px;width:912px;background:var(--yellow);border-radius:30px;padding:48px 40px 48px 280px;min-height:280px}
.seat p{font-size:44px;font-weight:800;line-height:1.4;letter-spacing:-1px}
.seat small{display:block;font-size:29px;font-weight:600;margin-top:10px;color:#5a4a1a}
.seat .hw{position:absolute;left:20px;top:-50px;width:260px;height:260px}
''', body='''
<h1 class="title">사라진 건 인화가 아니라<br><span class="hl">대화의 자리</span>예요</h1>
<div class="cmp">
  <div class="col then"><h3>필름 시절엔</h3><ul><li>인화를 기다리고</li><li>다 같이 보며 이야기하고</li><li>그 대화가 기억을 굳혔어요</li></ul></div>
  <div class="col now"><h3>지금은</h3><ul><li>찍자마자 보고</li><li>혼자 스크롤하고</li><li>기억이 굳을 틈이 없어요</li></ul></div>
</div>
<div class="seat"><div class="hw" data-hw='{"level":3,"mood":"happy"}'></div>
  <p>그 빈자리에 휘서가 앉아요.</p><small>사람보다 나아서가 아니라, 그 자리가 비어 있어서요.</small></div>
''')

CARDS[6] = dict(css='''
.sub{top:400px}
.chat{position:absolute;left:84px;top:700px;width:912px}
.photo{position:absolute;right:10px;top:-10px;width:220px;height:240px;padding:14px 14px 50px;transform:rotate(5deg)}
.photo .pic{width:100%;height:100%;background:#FFE9A0;display:flex;align-items:center;justify-content:center}
.photo .cap{font-size:30px;bottom:8px}
.row{display:flex;align-items:flex-end;gap:16px;margin-bottom:22px}
.row.me{justify-content:flex-end}
.av{width:92px;height:92px;flex:none;background:#EDE7FF;border-radius:50%;overflow:hidden}
.av svg{width:130%!important;height:130%!important;margin:-6% 0 0 -15%}
.b{font-size:36px;line-height:1.4;padding:20px 30px;border-radius:30px;max-width:560px}
.hw .b{background:#EDE7FF;border-bottom-left-radius:8px}
.me .b{background:var(--yellow);border-bottom-right-radius:8px}
.eg{position:absolute;left:100px;top:630px;font-size:40px;color:var(--mute)}
''', body='''
<h1 class="title">스크롤은 다시 보는 것,<br>휘서는 <span class="hl">꺼내는 것</span></h1>
<p class="sub">"아, 그때" 하고 넘기면 거기서 멈춰요.<br>누가 물어봐 줘야 <b style="color:var(--ink)">그날의 떨림까지</b> 꺼내져요.</p>
<div class="eg pen">(대화 예시)</div>
<div class="chat">
  <div class="polaroid photo"><div class="pic"><svg width="170" height="150" viewBox="0 0 170 150" fill="none" stroke="#2B2233" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="70" width="120" height="62" rx="8" fill="#fff"/><path d="M25 92 q15 12 30 0 q15 12 30 0 q15 12 30 0 q15 12 30 0" stroke="#765DCF"/><path d="M60 70 V46 M85 70 V40 M110 70 V46"/><path d="M60 38 q-6 -8 0 -16 q6 8 0 16 M85 32 q-6 -8 0 -16 q6 8 0 16 M110 38 q-6 -8 0 -16 q6 8 0 16" fill="#F2A93B" stroke="#F2A93B" stroke-width="3"/></svg></div><div class="cap pen">내 사진</div></div>
  <div class="row hw" style="padding-top:30px"><div class="av" data-hw='{"level":2,"mood":"curious"}'></div><div class="b">이 케이크,<br>누가 골랐어요?</div></div>
  <div class="row me" style="margin-top:90px"><div class="b">동생이! 초코 아니면<br>안 된다고 떼써서 ㅋㅋ</div></div>
</div>
''')

CARDS[7] = dict(css='''
.sub{top:400px}
.no{position:absolute;left:84px;top:640px;width:430px;padding:40px 42px;transform:rotate(-2deg)}
.no h3,.yes h3{font-size:34px;font-weight:800;margin-bottom:18px}
.no li{list-style:none;font-size:33px;line-height:1.65;color:var(--mute);text-decoration:line-through;text-decoration-color:var(--purple);text-decoration-thickness:5px}
.yes{position:absolute;left:560px;top:620px;width:440px;padding:40px 42px;background:var(--yellow);transform:rotate(2deg)}
.yes li{list-style:none;font-size:33px;line-height:1.45;font-weight:600;margin-bottom:18px}
.keys{position:absolute;left:84px;top:1110px;display:flex;gap:18px;align-items:center}
.keys span{font-size:34px;font-weight:700;padding:12px 28px;border-radius:999px;border:3px solid var(--ink);background:var(--paper)}
.keys s{color:var(--mute);font-weight:500;text-decoration-color:var(--purple);text-decoration-thickness:4px}
''', body='''
<h1 class="title">그래서 휘서는<br><span class="hl">대신 쓰지 않아요</span></h1>
<p class="sub">AI는 언어로 세계를 재현하고, 사람은 세계를 체험해요.<br>이야기의 주인공 자리는 늘 <b style="color:var(--ink)">사람에게 남겨둬요.</b></p>
<div class="note no"><h3>휘서가 안 하는 것</h3><ul><li>이야기 대신 지어내기</li><li>연속 접속 스트릭</li><li>배지 · 레벨 숫자</li><li>"놓치셨어요" 알림</li></ul></div>
<div class="note yes"><div class="tape"></div><h3>휘서가 하는 것</h3><ul><li>사진 한 장에<br>질문 하나 건네기</li><li>빨리 답하라고<br>재촉하지 않기</li><li>편지처럼, 주 1회만<br>안부 묻기</li></ul></div>
<div class="keys"><span><s>재현</s> 체험</span><span><s>속도</s> 가치</span><span><s>보존</s> 동행</span></div>
''')

CARDS[8] = dict(cls='last', css='''
.card.last{background:var(--purple)}
.card.last .foot{color:rgba(255,255,255,.7)}
.title{color:#fff;top:120px;font-size:112px}
.title .y{color:var(--ink)}
.sub{top:420px;color:rgba(255,255,255,.92);font-size:38px}
.quote{position:absolute;left:84px;top:620px;font-size:86px;line-height:1.1;color:var(--yellow);transform:rotate(-3deg)}
.quote small{display:block;font-size:40px;color:rgba(255,255,255,.75);margin-top:8px}
.big{position:absolute;left:640px;top:600px;width:400px;height:400px}
.info{position:absolute;left:84px;top:1010px;width:912px;background:#fff;border-radius:26px;padding:26px 36px;display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center}
.info b{background:var(--purple);color:#fff;font-size:24px;padding:6px 14px;border-radius:999px;margin-right:10px;vertical-align:middle}
.info span{font-size:31px;font-weight:700;letter-spacing:-.5px}
''', body='''
<h1 class="title">보존이 아니라<br><span class="hl"><span class="y">동행</span></span></h1>
<p class="sub">박제해 남기는 게 아니라, 살아가는 동안 곁에 두는 것.<br>휘서는 그 곁을 지키는 AI 친구예요.</p>
<div class="quote pen">"사람은<br>기억을 먹고 산다"</div>
<div class="big" data-hw='{"pose":"idle","level":3,"mood":"happy","spark":true}'></div>
<div class="info"><span><b>전시</b>10.17(토) – 10.24(토)</span><span><b>오프닝</b>10.17(토)</span><span><b>장소</b>신촌 무악로터리홀 B132</span></div>
''')

for n, c in CARDS.items():
    open(f'card-{n:02d}.html', 'w').write(HEAD.format(n=n, css=c['css'], cls=c.get('cls', ''), body=c['body']))
