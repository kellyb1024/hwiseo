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

CARDS[3] = dict(css='''
.sub{top:405px}
.chat{position:absolute;left:84px;top:700px;width:912px}
.photo{position:absolute;right:10px;top:-10px;width:220px;height:240px;padding:14px 14px 50px;transform:rotate(5deg)}
.photo .pic{width:100%;height:100%;background:#FFE9A0;display:flex;align-items:center;justify-content:center}
.photo .cap{font-size:30px;bottom:8px}
.row{display:flex;align-items:flex-end;gap:16px;margin-bottom:22px}
.row.me{justify-content:flex-end;padding-right:0}
.av{width:92px;height:92px;flex:none;background:#EDE7FF;border-radius:50%;overflow:hidden}
.av svg{width:130%!important;height:130%!important;margin:-6% 0 0 -15%}
.b{font-size:36px;line-height:1.4;padding:20px 30px;border-radius:30px;max-width:560px}
.hw .b{background:#EDE7FF;border-bottom-left-radius:8px}
.me .b{background:var(--yellow);border-bottom-right-radius:8px}
.eg{position:absolute;left:100px;top:620px;font-size:40px;color:var(--mute)}
.keys{position:absolute;left:84px;top:1140px;display:flex;gap:18px}
.keys span{font-size:32px;font-weight:700;padding:12px 26px;border-radius:999px;border:3px solid var(--ink)}
.keys s{color:var(--mute);font-weight:500;text-decoration-color:var(--purple);text-decoration-thickness:4px}
''', body='''
<h1 class="title">사진을 보여주면<br><span class="hl">질문을 건네는</span> 친구</h1>
<p class="sub">사진은 클라우드에, 그날 이야기는 흐릿한 기억 속에<br>잠들어 있잖아요. 휘서는 이야기를 대신 지어내지 않고,<br><b style="color:var(--ink)">내가 다시 꺼내도록 물어봐요.</b></p>
<div class="eg pen">(대화 예시)</div>
<div class="chat">
  <div class="polaroid photo"><div class="pic"><svg width="170" height="150" viewBox="0 0 170 150" fill="none" stroke="#2B2233" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="25" y="70" width="120" height="62" rx="8" fill="#fff"/><path d="M25 92 q15 12 30 0 q15 12 30 0 q15 12 30 0 q15 12 30 0" stroke="#765DCF"/><path d="M60 70 V46 M85 70 V40 M110 70 V46"/><path d="M60 38 q-6 -8 0 -16 q6 8 0 16 M85 32 q-6 -8 0 -16 q6 8 0 16 M110 38 q-6 -8 0 -16 q6 8 0 16" fill="#F2A93B" stroke="#F2A93B" stroke-width="3"/></svg></div><div class="cap pen">내 사진</div></div>
  <div class="row hw" style="padding-top:30px"><div class="av" data-hw='{"level":2,"mood":"curious"}'></div><div class="b">이 케이크,<br>누가 골랐어요?</div></div>
  <div class="row me" style="margin-top:90px"><div class="b">동생이! 초코 아니면<br>안 된다고 떼써서 ㅋㅋ</div></div>
</div>
<div class="keys"><span><s>재현</s> 체험</span><span><s>보존</s> 동행</span></div>
''')

CARDS[4] = dict(css='''
.sub{top:390px}
.v1{left:60px;top:600px;width:490px;height:310px;transform:rotate(-4deg)}
.v2{left:540px;top:615px;width:470px;height:300px;transform:rotate(4deg)}
.v3{left:340px;top:915px;width:450px;height:290px;transform:rotate(-1.5deg);z-index:1}
.m{position:absolute;left:90px;top:1030px;font-size:46px;color:var(--purple);text-align:center;line-height:1.1}
''', body='''
<h1 class="title">8월 말,<br><span class="hl">컨셉 영상</span> 완성!</h1>
<p class="sub">TED-Ed 같은 플랫 애니메이션으로 2분 30초.<br>화면 속 움직임은 전부 <b style="color:var(--ink)">코드로 한 땀 한 땀</b> 짰어요.</p>
<div class="polaroid v1"><img src="assets/v42c.jpg"><div class="cap pen">기계는 1초 만에 태깅해요</div></div>
<div class="polaroid v2"><div class="tape"></div><img src="assets/v78c.jpg"><div class="cap pen">휘(輝), 기억 곁에 촛불 켜기</div></div>
<div class="polaroid v3"><img src="assets/v96c.jpg"><div class="cap pen">멈춰 있던 기억이 다시 움직여요</div></div>
<div class="m pen" style="transform:rotate(-6deg)">자막 넣기<br>진짜 노가다..</div>
''')

CARDS[5] = dict(css='''
.sub{top:390px}
.old{left:90px;top:640px;width:360px;height:470px;transform:rotate(-5deg);background:#fff}
.old img{object-fit:contain;object-position:center;background:#F4F0FA;padding:24px}
.new{left:600px;top:620px;width:390px;height:490px;transform:rotate(4deg)}
.new .shot{width:100%;height:100%;background:var(--purple);overflow:hidden;display:flex;align-items:flex-end;justify-content:center}
.new .shot div{width:115%;height:115%;margin-bottom:-8%}
.arr{position:absolute;left:455px;top:800px}
.icon{position:absolute;left:600px;top:1125px;width:170px;height:170px;width:190px;height:190px;border-radius:44px;box-shadow:0 14px 30px rgba(60,40,90,.22);transform:rotate(-6deg)}
.im{position:absolute;left:800px;top:1170px;font-size:46px;color:var(--purple);transform:rotate(-3deg)}
''', body='''
<h1 class="title">휘서 얼굴이<br><span class="hl">바뀌었어요</span></h1>
<p class="sub">밝고 장난스러운 쪽으로 방향을 틀면서<br>연보라 손그림 휘서가 <b style="color:var(--ink)">노란 네모 양초</b>가 됐어요.</p>
<div class="polaroid old"><img src="assets/old.png"><div class="cap pen">8월 · 첫 손그림</div></div>
<svg class="arr" width="150" height="90" viewBox="0 0 150 90" fill="none" stroke="#765DCF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 50 C50 20 90 20 135 45"/><path d="M112 28 L136 46 L110 60"/></svg>
<div class="polaroid new"><div class="tape"></div><div class="shot"><div data-hw='{"pose":"idle","level":3,"mood":"laugh"}'></div></div><div class="cap pen">9월 · 지금 휘서</div></div>
<img class="icon" src="assets/icon.png">
<div class="im pen">← 앱 아이콘도<br>새로!</div>
''')

CARDS[6] = dict(css='''
.sub{top:390px}
.no{position:absolute;left:84px;top:610px;width:440px;padding:40px 44px;transform:rotate(-2deg)}
.no h3,.yes h3{font-size:34px;font-weight:800;margin-bottom:20px}
.no li{list-style:none;font-size:34px;line-height:1.6;color:var(--mute);text-decoration:line-through;text-decoration-color:var(--purple);text-decoration-thickness:5px}
.yes{position:absolute;left:560px;top:600px;width:440px;padding:40px 44px;background:var(--yellow);transform:rotate(2deg)}
.yes li{list-style:none;font-size:34px;line-height:1.5;font-weight:600;margin-bottom:22px}
.faces{position:absolute;left:60px;top:1000px;display:flex;gap:6px}
.faces div{width:175px;height:175px}
.fm{position:absolute;left:780px;top:1020px;font-size:42px;line-height:1.15;color:var(--purple);transform:rotate(-3deg)}
''', body='''
<h1 class="title">재촉하지 않는<br><span class="hl">AI 친구</span></h1>
<p class="sub">빨라지는 세상에서 놓치는 것들에 대한 이야기라서,<br>앱도 <b style="color:var(--ink)">조급하게 만들지 않기로</b> 했어요.</p>
<div class="note no"><h3>휘서에게 없는 것</h3><ul><li>연속 접속 스트릭</li><li>배지 · 레벨 숫자</li><li>일일 미션</li><li>"놓치셨어요" 알림</li></ul></div>
<div class="note yes"><div class="tape"></div><h3>대신 이렇게</h3><ul><li>알림은 주 1회,<br>재촉 말고 편지처럼</li><li>돌아오면 휘서가<br>나를 알아봐요</li></ul></div>
<div class="faces"><div data-hw='{"level":2,"mood":"happy"}'></div><div data-hw='{"level":2,"mood":"surprised"}'></div><div data-hw='{"level":3,"mood":"love"}'></div><div data-hw='{"level":2,"mood":"wink"}'></div></div>
<div class="fm pen">← 홈에서 휘서를<br>여러 번 두드리면..?<br>(직접 찾아보세요)</div>
''')

CARDS[7] = dict(css='''
.grid{position:absolute;left:84px;top:400px;width:912px;display:grid;grid-template-columns:1fr 1fr;gap:34px}
.it{background:#fff;border-radius:28px;padding:26px 32px;box-shadow:0 12px 28px rgba(60,40,90,.10);min-height:0}
.it .n{display:inline-flex;flex:none;width:48px;height:48px;border-radius:50%;background:var(--purple);color:#fff;font-weight:800;font-size:28px;align-items:center;justify-content:center;letter-spacing:0}
.it h3{display:flex;gap:14px;align-items:center;font-size:38px;font-weight:800;margin-bottom:12px;letter-spacing:-1px}
.it p{font-size:29px;line-height:1.5;color:var(--sub)}
.it:nth-child(2){background:var(--yellow)}.it:nth-child(2) p{color:var(--ink)}
.stamp{position:absolute;left:110px;top:930px;width:430px;height:260px;padding:16px 16px 16px;transform:rotate(-3deg)}
.stamp img{object-position:center 40%}
.sm{position:absolute;left:600px;top:980px;font-size:46px;line-height:1.15;color:var(--purple);transform:rotate(3deg)}
''', body='''
<h1 class="title" style="font-size:88px">전시장에서는<br><span class="hl">이렇게</span> 만나요</h1>
<div class="grid">
  <div class="it"><h3><span class="n">1</span>휘서와 3턴 대화</h3><p>폰으로 사진 한 장 올리고<br>휘서랑 짧게 이야기해요</p></div>
  <div class="it"><h3><span class="n">2</span>영수증 사진기</h3><p>버튼 한 번이면 폴라로이드<br>모양 영수증으로 한 컷!</p></div>
  <div class="it"><h3><span class="n">3</span>도장 엽서</h3><p>몸통 · 불꽃 · 눈 도장 세 개로<br>엽서 위에 휘서를 완성해요</p></div>
  <div class="it"><h3><span class="n">4</span>느린우체통</h3><p>오늘 쓴 엽서가<br>1년 뒤에 도착해요</p></div>
</div>
<div class="polaroid stamp"><div class="tape"></div><img src="assets/stamp.png"></div>
<div class="sm pen">↖ 도장 엽서 목업!<br>(준비하면서 조금씩<br>바뀔 수도 있어요)</div>
''')

CARDS[8] = dict(cls='last', css='''
.card.last{background:var(--purple)}
.card.last .chip{background:#fff;color:var(--purple)}.card.last .chip.o{background:transparent;color:#fff;border-color:#fff}
.card.last .foot{color:rgba(255,255,255,.7)}
.title{color:#fff;top:120px;font-size:104px}
.title .y{color:var(--ink)}
.sub{top:400px;color:rgba(255,255,255,.9)}
.info{position:absolute;left:84px;top:680px;width:600px;background:#fff;border-radius:32px;padding:40px 44px;transform:rotate(-1.5deg);box-shadow:0 18px 40px rgba(30,15,70,.25)}
.info .tape{left:80px}
.info dl{display:grid;grid-template-columns:auto 1fr;gap:26px 22px;align-items:center}
.info dt{background:var(--purple);color:#fff;font-weight:700;font-size:28px;padding:8px 18px;border-radius:999px;text-align:center}
.info dd{font-size:38px;font-weight:700;letter-spacing:-1px;line-height:1.3}
.info dd small{display:block;font-size:26px;font-weight:500;color:var(--mute);letter-spacing:0}
.big{position:absolute;left:640px;top:760px;width:420px;height:420px}
.bub{position:absolute;right:60px;top:660px;background:#fff;border-radius:34px;padding:22px 30px;font-size:50px;color:var(--purple);transform:rotate(5deg)}
.bub::after{content:"";position:absolute;left:30px;bottom:-22px;border:14px solid transparent;border-top:22px solid #fff;border-left-width:6px}
.fl{position:absolute;left:96px;top:1135px;font-size:48px;color:var(--yellow);transform:rotate(-2deg)}
''', body='''
<h1 class="title">10월, 전시장에서<br><span class="hl"><span class="y">만나요!</span></span></h1>
<p class="sub">사진 한 장 들고 놀러 오세요.<br>휘서가 질문 하나 건넬게요.</p>
<div class="info"><div class="tape"></div><dl>
  <dt>기간</dt><dd>10.17(토) – 10.24(토)</dd>
  <dt>오프닝</dt><dd>10.17(토)<small>시간은 정해지면 알려드릴게요</small></dd>
  <dt>장소</dt><dd>신촌 무악로터리홀 B132</dd>
</dl></div>
<div class="big" data-hw='{"pose":"idle","level":3,"mood":"happy","spark":true}'></div>
<div class="bub pen">기다릴게요!</div>
<div class="fl pen">B132에서 휘서 찾기 ♡</div>
''')

for n, c in CARDS.items():
    open(f'card-{n:02d}.html', 'w').write(HEAD.format(n=n, css=c['css'], cls=c.get('cls', ''), body=c['body']))
