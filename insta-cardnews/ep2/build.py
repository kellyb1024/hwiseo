# 카드뉴스 2~8장 HTML 생성. 공통 머리(태그·쪽수·푸터)는 여기서 감싼다.
HEAD = '''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>휘서 카드뉴스 {n:02d}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../common.css"><script src="../../design/character/hwiseo-F.js"></script>
<style>{css}</style></head><body><div class="card {cls}">
{body}
<div class="foot">연세대학교 IID 전공 졸업전시</div>
</div><script src="../common.js"></script></body></html>'''

CARDS = {}
# ── 2편: 캐릭터 공개 ──
CARDS[0] = dict(css="""
.series{position:absolute;left:84px;top:130px;background:var(--purple);color:#fff;font-weight:700;font-size:36px;padding:12px 28px;border-radius:999px}
.title{top:215px;font-size:100px;letter-spacing:-4px}
.meme{left:280px;top:490px;width:520px;height:690px;padding:22px;transform:rotate(-2deg)}
.meme img{object-fit:contain;object-position:center;background:#fff}
""", body="""
<div class="series">졸업전시 2편</div>
<h1 class="title">AI 친구 공개하려고<br>오늘도 <span class="hl">철야</span>합니다</h1>
<div class="polaroid meme"><div class="tape"></div><img src="assets/meme.png"></div>
""")

CARDS[1] = dict(cls='last', css="""
.card.last{background:var(--purple)}
.card.last .foot{color:rgba(255,255,255,.7)}
.title{color:#fff;top:120px;font-size:110px}
.title .y{color:var(--yellow)}
.sub{top:420px;color:rgba(255,255,255,.9);font-size:38px}
.big{position:absolute;left:170px;top:520px;width:740px;height:740px}
.bub{position:absolute;right:70px;top:560px;background:#fff;border-radius:34px;padding:22px 30px;font-size:50px;color:var(--purple);transform:rotate(6deg)}
.bub::after{content:"";position:absolute;left:30px;bottom:-22px;border:14px solid transparent;border-top:22px solid #fff;border-left-width:6px}
""", body="""
<h1 class="title">안녕하세요,<br>저는 <span class="y">휘서</span>예요!</h1>
<p class="sub">1편 마지막 실루엣의 정체, AI 친구 휘서예요.</p>
<script>HWF.POSE.hi={arms:[42,42]};</script><div class="big" data-hw='{"pose":"hi","level":3,"mood":"wink","spark":true}'></div>
<div class="bub pen">짠!</div>
""")

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

CARDS[3] = dict(css="""
.sub{top:390px}
.hz{position:absolute;top:560px;width:430px;background:#fff;border-radius:30px;padding:34px 36px;box-shadow:0 12px 28px rgba(60,40,90,.10)}
.hz1{left:84px;transform:rotate(-2deg)}.hz2{left:566px;transform:rotate(2deg);background:var(--yellow)}
.hz .g{font-family:'Noto Serif KR',serif;font-size:130px;line-height:1;font-weight:700;color:var(--purple)}
.hz2 .g{color:var(--ink)}
.hz h3{font-size:38px;font-weight:800;margin:14px 0 8px}
.hz p{font-size:30px;line-height:1.45;color:var(--sub)}.hz2 p{color:var(--ink)}
.flow{position:absolute;left:84px;top:1000px;width:912px;font-size:40px;font-weight:800;line-height:1.45;letter-spacing:-1px}
.flow span{background:linear-gradient(transparent 58%,var(--yellow) 58%)}
""", body="""
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&display=swap" rel="stylesheet">
<h1 class="title">왜 하필<br><span class="hl">양초</span>예요?</h1>
<p class="sub">이름 '휘서'를 한자로 쓰면 輝敍.<br>두 글자에 휘서가 하는 일이 그대로 들어 있어요.</p>
<div class="hz hz1"><div class="g">輝</div><h3>빛날 휘</h3><p>앨범에 잠든 사진에<br>빛을 비추고</p></div>
<div class="hz hz2"><div class="tape"></div><div class="g">敍</div><h3>펼 서</h3><p>그 안의 이야기를<br>펼쳐 내요</p></div>
<p class="flow">어둠 속 잠든 기억 곁에 촛불을 켜는 친구.<br><span>그래서 휘서는 양초가 됐어요.</span></p>
""")

CARDS[4] = dict(css="""
.sub{top:390px}
.old{left:90px;top:560px;width:360px;height:470px;transform:rotate(-5deg);background:#fff}
.old img{object-fit:contain;object-position:center;background:#F4F0FA;padding:24px}
.new{left:600px;top:540px;width:390px;height:490px;transform:rotate(4deg)}
.new .shot{width:100%;height:100%;background:var(--purple);overflow:hidden;display:flex;align-items:flex-end;justify-content:center}
.new .shot div{width:115%;height:115%;margin-bottom:-8%}
.arr{position:absolute;left:455px;top:720px}
.icon{position:absolute;left:120px;top:1080px;width:170px;height:170px;border-radius:40px;box-shadow:0 14px 30px rgba(60,40,90,.22);transform:rotate(-6deg)}
.im{position:absolute;left:320px;top:1130px;font-size:46px;color:var(--purple);transform:rotate(-3deg)}
""", body="""
<h1 class="title">휘서 얼굴이<br><span class="hl">바뀌어 왔어요</span></h1>
<p class="sub">밝고 장난스러운 쪽으로 방향을 틀면서<br>연보라 손그림 휘서가 <b style="color:var(--ink)">노란 네모 양초</b>가 됐어요.</p>
<div class="polaroid old"><img src="../assets/old.png"><div class="cap pen">8월 · 첫 손그림</div></div>
<svg class="arr" width="150" height="90" viewBox="0 0 150 90" fill="none" stroke="#765DCF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 50 C50 20 90 20 135 45"/><path d="M112 28 L136 46 L110 60"/></svg>
<div class="polaroid new"><div class="tape"></div><div class="shot"><div data-hw='{"pose":"idle","level":3,"mood":"laugh"}'></div></div><div class="cap pen">9월 · 지금 휘서</div></div>
<img class="icon" src="../assets/icon.png">
<div class="im pen">← 앱 아이콘도 새로!</div>
""")

CARDS[5] = dict(css="""
.sub{top:390px}
.chat{position:absolute;left:84px;top:690px;width:912px}
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
.eg{position:absolute;left:100px;top:620px;font-size:40px;color:var(--mute)}
""", body="""
<h1 class="title">사진을 보여주면<br><span class="hl">질문을 건네요</span></h1>
<p class="sub">휘서는 이야기를 대신 지어내지 않아요.<br>내가 그날을 <b style="color:var(--ink)">다시 꺼내도록</b> 물어봐요.</p>
<div class="eg pen">(대화 예시)</div>
<div class="chat">
  <div class="polaroid photo"><div class="pic"><svg width="170" height="150" viewBox="0 0 170 150" fill="none" stroke="#2B2233" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="70" width="120" height="62" rx="8" fill="#fff"/><path d="M25 92 q15 12 30 0 q15 12 30 0 q15 12 30 0 q15 12 30 0" stroke="#765DCF"/><path d="M60 70 V46 M85 70 V40 M110 70 V46"/><path d="M60 38 q-6 -8 0 -16 q6 8 0 16 M85 32 q-6 -8 0 -16 q6 8 0 16 M110 38 q-6 -8 0 -16 q6 8 0 16" fill="#F2A93B" stroke="#F2A93B" stroke-width="3"/></svg></div><div class="cap pen">내 사진</div></div>
  <div class="row hw" style="padding-top:30px"><div class="av" data-hw='{"level":2,"mood":"curious"}'></div><div class="b">이 케이크,<br>누가 골랐어요?</div></div>
  <div class="row me" style="margin-top:90px"><div class="b">동생이! 초코 아니면<br>안 된다고 떼써서 ㅋㅋ</div></div>
</div>
""")

CARDS[6] = dict(css="""
.sub{top:390px}
.no{position:absolute;left:84px;top:620px;width:430px;padding:40px 42px;transform:rotate(-2deg)}
.no h3,.yes h3{font-size:34px;font-weight:800;margin-bottom:18px}
.no li{list-style:none;font-size:33px;line-height:1.65;color:var(--mute);text-decoration:line-through;text-decoration-color:var(--purple);text-decoration-thickness:5px}
.yes{position:absolute;left:560px;top:600px;width:440px;padding:40px 42px;background:var(--yellow);transform:rotate(2deg)}
.yes li{list-style:none;font-size:33px;line-height:1.45;font-weight:600;margin-bottom:18px}
""", body="""
<h1 class="title">그래서 휘서는<br><span class="hl">재촉하지 않아요</span></h1>
<p class="sub">빨라지는 세상에서 놓치는 것들에 대한 이야기라서,<br>휘서도 <b style="color:var(--ink)">조급하게 만들지 않기로</b> 했어요.</p>
<div class="note no"><h3>휘서가 안 하는 것</h3><ul><li>이야기 대신 지어내기</li><li>연속 접속 스트릭</li><li>배지 · 레벨 숫자</li><li>"놓치셨어요" 알림</li></ul></div>
<div class="note yes"><div class="tape"></div><h3>휘서가 하는 것</h3><ul><li>사진 한 장에<br>질문 하나 건네기</li><li>빨리 답하라고<br>재촉하지 않기</li><li>편지처럼, 주 1회만<br>안부 묻기</li></ul></div>
""")

CARDS[7] = dict(css="""
.grid{position:absolute;left:84px;top:380px;width:912px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.f{background:#fff;border-radius:28px;padding:16px 10px 20px;text-align:center;box-shadow:0 10px 24px rgba(60,40,90,.10)}
.f:nth-child(odd){transform:rotate(-1.5deg)}.f:nth-child(even){transform:rotate(1.5deg)}
.f div{width:250px;height:250px;margin:0 auto}
.f b{display:block;font-size:44px;color:var(--purple);font-family:'Nanum Pen Script',cursive;font-weight:400;margin-top:-6px}
""", body="""
<h1 class="title">휘서의<br><span class="hl">여러 얼굴</span></h1>
<div class="grid">
  <div class="f"><div data-hw='{"level":3,"mood":"happy","vb":"-2 15 304 304"}'></div><b>반가울 때</b></div>
  <div class="f"><div data-hw='{"level":3,"mood":"wink","vb":"-2 15 304 304"}'></div><b>장난칠 때</b></div>
  <div class="f"><div data-hw='{"level":3,"mood":"curious","vb":"-2 15 304 304"}'></div><b>궁금할 때</b></div>
  <div class="f"><div data-hw='{"level":3,"mood":"love","vb":"-2 15 304 304"}'></div><b>좋아할 때</b></div>
  <div class="f"><div data-hw='{"level":2,"mood":"surprised","vb":"-2 15 304 304"}'></div><b>놀랄 때</b></div>
  <div class="f"><div data-hw='{"level":1,"mood":"sleepy","vb":"-2 15 304 304"}'></div><b>졸릴 때</b></div>
</div>
""")

CARDS[8] = dict(cls='last', css="""
.card.last{background:var(--purple)}
.card.last .foot{color:rgba(255,255,255,.7)}
.title{color:#fff;top:120px;font-size:112px}
.title .y{color:var(--ink)}
.sub{top:420px;color:rgba(255,255,255,.92);font-size:38px}
.quote{position:absolute;left:84px;top:620px;font-size:86px;line-height:1.1;color:var(--yellow);transform:rotate(-3deg)}
.big{position:absolute;left:640px;top:580px;width:400px;height:400px}
.info{position:absolute;left:84px;top:1000px;width:912px;background:#fff;border-radius:26px;padding:26px 36px;display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center}
.info b{background:var(--purple);color:#fff;font-size:24px;padding:6px 14px;border-radius:999px;margin-right:10px;vertical-align:middle}
.info span{font-size:31px;font-weight:700;letter-spacing:-.5px}
.next{position:absolute;left:84px;top:1170px;font-size:46px;color:var(--yellow);transform:rotate(-2deg)}
""", body="""
<h1 class="title">보존이 아니라<br><span class="hl"><span class="y">동행</span></span></h1>
<p class="sub">박제해 남기는 게 아니라, 살아가는 동안 곁에 두는 것.<br>휘서는 그 곁을 지키는 AI 친구예요.</p>
<div class="quote pen">"사람은<br>기억을 먹고 산다"</div>
<div class="big" data-hw='{"pose":"idle","level":3,"mood":"happy","spark":true}'></div>
<div class="info"><span><b>전시</b>10.17(토) – 10.24(토)</span><span><b>오프닝</b>10.17(토)</span><span><b>장소</b>신촌 무악로터리홀 B132</span></div>
<div class="next pen">3편 예고 → (곧 공개!)</div>
""")

for n, c in CARDS.items():
    open(f'card-{n:02d}.html', 'w').write(HEAD.format(n=n, css=c['css'], cls=c.get('cls', ''), body=c['body']))
