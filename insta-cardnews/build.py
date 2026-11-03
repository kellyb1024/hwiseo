# 카드뉴스 2~8장 HTML 생성. 공통 머리(태그·쪽수·푸터)는 여기서 감싼다.
HEAD = '''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>휘서 카드뉴스 {n:02d}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="common.css"><script src="../design/character/hwiseo-F.js"></script>
<style>{css}</style></head><body><div class="card {cls}">
{body}
<div class="foot">연세대학교 IID 전공 졸업전시</div>
</div><script src="common.js"></script></body></html>'''

CARDS = {}

# ── 1편: 주제 아이디에이션 (캐릭터는 2편에서 공개) ──
CARDS[1] = dict(css="""
.title{top:120px;font-size:112px;letter-spacing:-4px}
.sub{top:420px;font-size:38px}
.p1{left:90px;top:620px;width:390px;height:560px;transform:rotate(-6deg)}
.p2{left:380px;top:600px;width:360px;height:470px;transform:rotate(4deg);z-index:2}
.p3{left:660px;top:640px;width:350px;height:520px;transform:rotate(-2deg)}
.p1 .cap,.p2 .cap,.p3 .cap{font-size:38px}
""", body="""
<h1 class="title">졸업작품 주제,<br><span class="hl">이렇게</span> 찾았어요</h1>
<p class="sub">노트 한 권, 책 한 권, 전시 하나에서 시작된<br>막학기 아이디에이션 기록</p>
<div class="polaroid p1"><img src="assets/note1.jpg"><div class="cap pen">노트</div></div>
<div class="polaroid p2"><div class="tape"></div><img src="assets/book-cover.jpg" style="object-position:center 40%"><div class="cap pen">책</div></div>
<div class="polaroid p3"><img src="assets/note2.jpg"><div class="cap pen">또 노트..</div></div>
""")

CARDS[2] = dict(css="""
.sub{top:400px}
.note{left:84px;top:600px;width:860px;padding:64px 64px 60px;transform:rotate(-1deg)}
.note .q{font-size:36px;color:var(--mute);font-weight:600;margin-bottom:18px}
.note .q s{text-decoration-color:var(--purple);text-decoration-thickness:4px}
.note .a{font-size:60px;line-height:1.35;font-weight:800;letter-spacing:-1.5px}
.note .a em{font-style:normal;color:var(--purple)}
.memo{position:absolute;left:110px;top:1010px;font-size:56px;line-height:1.15;color:var(--purple);transform:rotate(-3deg)}
""", body="""
<h1 class="title">저는 <span class="p">가치</span>를 만들고<br><span class="hl">이야기의 힘</span>을 믿어요</h1>
<p class="sub">AI로 UI/UX를 기획하는 졸업전시.<br>그래서 처음 던진 질문을 바꿨어요.</p>
<div class="note"><div class="tape"></div>
  <p class="q"><s>이번엔 무슨 AI 기술을 보여줄까?</s></p>
  <p class="a">이 기술로 사람의 <em>무엇을<br>지킬 수 있을까?</em></p>
</div>
<div class="memo pen">↑ 이 질문이<br>제 졸업작품의 출발점!</div>
""")

CARDS[3] = dict(css="""
.shot{left:60px;top:380px;width:500px;height:740px;transform:rotate(-3deg)}
.shot .cap{font-size:40px}
.st{position:absolute;left:600px;width:410px;padding:34px 34px}
.s1{top:400px;background:var(--yellow);transform:rotate(2deg)}
.s2{top:800px;background:#fff;transform:rotate(-1.5deg)}
.st small{display:block;font-size:26px;font-weight:700;color:var(--purple);margin-bottom:12px;letter-spacing:.5px}
.st p{font-size:34px;line-height:1.45;font-weight:700;letter-spacing:-.8px}
.st .en{font-size:46px;color:var(--purple);margin-top:6px;line-height:1.1}
""", body="""
<h1 class="title">제 노트엔<br><span class="hl">이렇게</span> 적혀 있어요</h1>
<div class="polaroid shot"><div class="tape"></div><img src="assets/note1.jpg"><div class="cap pen">AI 쓰는 법에 대한 메모</div></div>
<div class="note st s1"><small>번역하면</small><p>새로운 걸 만드는 대신,<br>사람이 이미 가진 것 ·<br>만든 것 · 겪은 것에서<br>다시 만들 기회를 주는 AI</p></div>
<div class="note st s2"><small>밑줄 친 한 줄</small><p class="en pen">Represent vs Feel</p><p>AI는 재현하고,<br>사람은 느껴요</p></div>
""")

CARDS[4] = dict(css="""
.shot{left:540px;top:360px;width:470px;height:690px;transform:rotate(3deg)}
.shot .cap{font-size:40px}
.steps{position:absolute;left:84px;top:390px;width:430px}
.step{background:#fff;border-radius:26px;padding:26px 30px;box-shadow:0 10px 24px rgba(60,40,90,.10);margin-bottom:18px}
.step h3{font-size:34px;font-weight:800;letter-spacing:-.5px;margin-bottom:6px}
.step p{font-size:29px;line-height:1.45;color:var(--sub)}
.step.r{background:var(--purple);color:#fff}.step.r p{color:rgba(255,255,255,.9)}
.step.a{background:var(--yellow)}.step.a p{color:var(--ink)}
.arr{text-align:center;font-size:40px;color:var(--purple);margin:-8px 0 10px;line-height:1}
.memo{position:absolute;left:100px;top:1120px;font-size:46px;color:var(--purple);transform:rotate(-2deg)}
""", body="""
<h1 class="title" style="font-size:88px">Before → <span class="hl">Recall</span><br>→ After</h1>
<div class="steps">
  <div class="step"><h3>Before</h3><p>사진은 앨범 속에 잠들어 있고,<br>대화할 때 잘 꺼내지도 않아요</p></div>
  <div class="arr">↓</div>
  <div class="step r"><h3>Recall</h3><p>그날을 다시 떠올리는 순간</p></div>
  <div class="arr">↓</div>
  <div class="step a"><h3>After</h3><p>사진이 나만의 의미와 감정을 얻고,<br>일상에서 더 자주 떠올라요</p></div>
</div>
<div class="polaroid shot"><div class="tape"></div><img src="assets/note2.jpg"><div class="cap pen">별표 친 페이지 ★</div></div>
<div class="memo pen">빨간 박스가 제 기획의 뼈대예요</div>
""")

CARDS[5] = dict(css="""
.sub{top:400px}
.b1{left:70px;top:550px;width:460px;height:610px;transform:rotate(-4deg)}
.b2{left:520px;top:570px;width:460px;height:600px;transform:rotate(3deg)}
.memo{position:absolute;right:70px;top:500px;font-size:44px;line-height:1.1;color:var(--purple);transform:rotate(4deg);text-align:right}
""", body="""
<h1 class="title">서점에서 만난<br><span class="hl">책 한 권</span></h1>
<p class="sub">〈The Art of Memory Collecting〉, Martina Calvi<br>영수증, 티켓, 스티커로 기억을 모으는 책이었어요.</p>
<div class="polaroid b1"><div class="tape"></div><img src="assets/book-cover.jpg" style="object-position:center 45%"><div class="cap pen">표지</div></div>
<div class="polaroid b2"><img src="assets/book-spread.jpg" style="object-position:center 55%"><div class="cap pen">안쪽 페이지</div></div>
""")

CARDS[6] = dict(css="""
.list{position:absolute;left:84px;top:380px;width:912px}
.w{background:#fff;border-radius:28px;padding:30px 36px;box-shadow:0 10px 24px rgba(60,40,90,.10);margin-bottom:24px}
.w:nth-child(2){transform:rotate(-1deg);margin-left:30px}
.w small{display:block;font-size:26px;font-weight:700;color:var(--purple);margin-bottom:10px}
.w p{font-size:36px;line-height:1.45;font-weight:700;letter-spacing:-.8px}
.memo{position:absolute;left:100px;top:1150px;font-size:44px;color:var(--purple);transform:rotate(-2deg)}
""", body="""
<h1 class="title">전시에서<br><span class="hl">멈춰 선</span> 작품들</h1>
<div class="list">
  <div class="w"><small>이정우 〈씌여진 영화, 씌여질 역사〉</small><p>생성형 AI는 빈칸을 그럴듯하게 메워요.<br>저는 <span class="p">빈칸을 묻는 AI</span>를 만들고 싶어졌어요.</p></div>
  <div class="w"><small>홍진훤 〈사실 은하수는 유령입니다〉</small><p>기억은 사진 속이 아니라, 사진과<br>그걸 바라보는 사람 <span class="p">사이에서</span> 빛나요.</p></div>
  <div class="w"><small>이정우 〈뜬구름〉</small><p>한 사람의 기억은 AI의 세계에서<br><span class="p">가장 드문 데이터</span>예요.</p></div>
</div>
<div class="memo pen">(작품 사진 대신 받은 문장만 적어둘게요)</div>
""")

CARDS[7] = dict(css="""
.sub{top:390px}
.boxes{position:absolute;left:84px;top:560px;width:912px;display:grid;grid-template-columns:1fr 1fr;gap:30px}
.bx{background:#fff;border-radius:30px;padding:32px 30px;box-shadow:0 12px 28px rgba(60,40,90,.10);text-align:center}
.bx svg{display:block;margin:0 auto 14px}
.bx h3{font-size:38px;font-weight:800;letter-spacing:-1px;margin-bottom:8px}
.bx .why{display:inline-block;font-size:42px;color:var(--purple)}
.seat{position:absolute;left:84px;top:890px;width:912px;background:var(--yellow);border-radius:30px;padding:40px 44px}
.seat p{font-size:44px;font-weight:800;line-height:1.35;letter-spacing:-1px}
.seat small{display:block;font-size:30px;font-weight:600;margin-top:12px;color:#5a4a1a;line-height:1.45}
""", body="""
<h1 class="title">찍는 건 쉬워졌는데,<br><span class="hl">다시 꺼내본 적</span> 있어요?</h1>
<p class="sub">AI 시대는 우리를 자꾸 '만드는 사람' 자리에 세워요.<br>되돌아볼 시간은 점점 사라지고요.</p>
<div class="boxes">
  <div class="bx"><svg width="130" height="88" viewBox="0 0 150 100" fill="#EDE7FF" stroke="#765DCF" stroke-width="5" stroke-linejoin="round"><path d="M38 86 h78 a26 26 0 0 0 2 -52 a36 36 0 0 0 -68 -6 a28 28 0 0 0 -12 58 z"/><rect x="58" y="44" width="34" height="26" rx="4" fill="#fff"/><path d="M64 44 v-8 a11 11 0 0 1 22 0 v8" fill="none"/></svg>
    <h3>사진은 클라우드에</h3><span class="why pen">꺼내지 않아서 잠겨 있고</span></div>
  <div class="bx"><svg width="130" height="88" viewBox="-6 -10 162 114" fill="#FFF3C4" stroke="#765DCF" stroke-width="5" stroke-linejoin="round"><path d="M52 94 v-16 c-16 -6 -26 -20 -26 -38 a40 40 0 0 1 80 -2 l10 16 h-10 v14 c0 8 -6 12 -14 12 h-8 v14"/><path d="M52 40 h24 M52 52 h16" stroke-dasharray="4 7" fill="none"/></svg>
    <h3>이야기는 머릿속에</h3><span class="why pen">물어봐 주지 않아서 흐릿해요</span></div>
</div>
<div class="seat"><p>사라진 건 인화가 아니라,<br>같이 보며 이야기하던 대화의 자리였어요.</p>
  <small>필름 시절엔 인화를 기다리고, 다 같이 보며 이야기했죠.<br>그 대화가 기억을 굳혔는데, 지금은 혼자 스크롤해요.</small></div>
""")

CARDS[8] = dict(css="""
.sub{top:390px;font-size:38px}
.big{position:absolute;left:84px;top:560px;width:912px;background:var(--purple);border-radius:34px;padding:56px 56px 50px;color:#fff;transform:rotate(-1deg)}
.big .en{font-size:92px;line-height:1.02;font-weight:800;letter-spacing:-3px}
.big .en span{color:var(--yellow)}
.big .ko{font-size:36px;margin-top:22px;font-weight:600;color:rgba(255,255,255,.92)}
.keys{position:absolute;left:84px;top:1030px;display:flex;gap:18px;flex-wrap:wrap}
.keys span{font-size:34px;font-weight:700;padding:12px 28px;border-radius:999px;border:3px solid var(--ink)}
.keys s{color:var(--mute);font-weight:500;text-decoration-color:var(--purple);text-decoration-thickness:4px}
""", body="""
<h1 class="title">AI는 재현하고,<br>사람은 <span class="hl">겪어요</span></h1>
<p class="sub">AI가 못해서가 아니라,<br><b style="color:var(--ink)">대신하면 의미가 사라지니까요.</b></p>
<div class="big"><div class="tape"></div><p class="en">Bring <span>data</span><br>into the real world.</p><p class="ko">클라우드에 잠든 데이터를, 다시 삶 속으로.</p></div>
<div class="keys"><span><s>재현</s> 체험</span><span><s>속도</s> 가치</span><span><s>보존</s> 동행</span></div>
""")

CARDS[9] = dict(cls='last', css="""
.card.last{background:#2A1F4A}
.card.last .foot{color:rgba(255,255,255,.6)}
.title{color:#fff;top:120px;font-size:108px}
.title .y{color:var(--yellow)}
.sub{top:410px;color:rgba(255,255,255,.88);font-size:40px}
.tz{position:absolute;left:290px;top:520px;width:500px;height:500px}
.tz .hw-figure *:not(.hw-flame-wrap):not(.hw-flame-wrap *){fill:#3E2F6B!important;stroke:none!important}
.tz .hw-shadow{opacity:.25!important}
.glow{position:absolute;left:390px;top:520px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(248,215,100,.35),transparent 65%)}
.q{position:absolute;right:120px;top:600px;font-size:120px;color:var(--yellow);transform:rotate(12deg)}
.info{position:absolute;left:84px;top:1060px;width:912px;background:#fff;border-radius:26px;padding:24px 34px;display:flex;flex-wrap:wrap;gap:10px 28px;align-items:center}
.info b{background:var(--purple);color:#fff;font-size:24px;padding:6px 14px;border-radius:999px;margin-right:10px;vertical-align:middle}
.info span{font-size:31px;font-weight:700;letter-spacing:-.5px}
""", body="""
<h1 class="title">그래서 만든 건,<br><span class="y">AI 친구</span>예요</h1>
<p class="sub">누군지는… 2편에서 공개할게요!</p>
<div class="glow"></div>
<div class="tz" data-hw='{"level":3,"mood":"neutral"}'></div>
<div class="q pen">?</div>
<div class="info"><span><b>전시</b>10.17(토) – 10.24(토)</span><span><b>오프닝</b>10.17(토)</span><span><b>장소</b>신촌 무악로터리홀 B132</span></div>
""")

for n, c in CARDS.items():
    open(f'card-{n:02d}.html', 'w').write(HEAD.format(n=n, css=c['css'], cls=c.get('cls', ''), body=c['body']))
