// 홈 화면 추가 안내 — 폰 브라우저로 열 때마다(탭 하나당 한 번) 뜬다 (설치 앱·데스크톱에서는 안 뜸)
(function(){
  var KEY='hwiseo.installSeen';
  var ua=navigator.userAgent||'';
  var standalone=!!navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  var phone=Math.min(innerWidth,innerHeight)<=600&&(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  var seen=false;try{seen=sessionStorage.getItem(KEY)==='1';}catch(e){}
  var deferred=null;
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;});
  var force=/[?&]install(=|&|$)/.test(location.search);   // 주소 끝에 ?install — 조건 무시하고 띄움(폰 확인용)
  if(!force&&(standalone||!phone||seen))return;

  var isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var isKakao=/KAKAOTALK/i.test(ua);
  var inApp=isKakao||/NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua);

  var css='.hwig-dim{position:fixed;inset:0;z-index:9999;background:rgba(29,27,34,.42);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .35s}'+
  '.hwig-dim.on{opacity:1}'+
  '.hwig{width:100%;max-width:440px;box-sizing:border-box;margin:0 10px calc(10px + env(safe-area-inset-bottom));background:#fff;border-radius:28px;padding:24px 22px 18px;font-family:Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;color:#1D1B22;word-break:keep-all;transform:translateY(40px);transition:transform .45s cubic-bezier(.2,.9,.3,1.1);-webkit-user-select:none;user-select:none}'+
  '.hwig-dim.on .hwig{transform:none}'+
  '.hwig-top{display:flex;gap:14px;align-items:center}'+
  '.hwig-ic{width:56px;height:56px;border-radius:14px;flex:0 0 auto;box-shadow:0 2px 8px rgba(91,63,176,.25)}'+
  '.hwig-t{font-size:18px;font-weight:800;line-height:1.38;letter-spacing:-.02em}'+
  '.hwig-steps{margin-top:16px;background:#F6F3FF;border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600;color:#5B3FB0;line-height:1.45}'+
  '.hwig-steps b{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#7B5CD6;color:#fff;font-size:12px;margin-right:8px;vertical-align:1px}'+
  '.hwig-btns{display:flex;gap:10px;margin-top:18px}'+
  '.hwig-btns button{flex:1;height:54px;border-radius:27px;border:0;font-family:inherit;font-size:16px;font-weight:800;cursor:pointer}'+
  '.hwig-btns button:active{transform:scale(.97)}'+
  '.hwig-no{background:#F0EDE6;color:#5D5866}.hwig-yes{background:#FFD54A;color:#1D1B22}'+
  '.hwig-arrow{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));z-index:10000;transform:translateX(-50%);background:#7B5CD6;color:#fff;font-family:Pretendard,-apple-system,sans-serif;font-size:14px;font-weight:700;padding:11px 18px;border-radius:22px;box-shadow:0 6px 18px rgba(91,63,176,.35);white-space:nowrap;animation:hwigb 1.1s ease-in-out infinite;word-break:keep-all}'+
  '@keyframes hwigb{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,6px)}}';

  function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
  function remember(){try{sessionStorage.setItem(KEY,'1');}catch(e){}}

  function show(){
    var st=el('style');st.textContent=css;document.head.appendChild(st);
    var dim=el('div','hwig-dim'),card=el('div','hwig');
    var top=el('div','hwig-top');
    var ic=el('img','hwig-ic');ic.src='apple-touch-icon.png';ic.alt='';
    var title,steps,yesLabel,onYes;
    if(inApp){
      title='홈 화면에 추가하려면<br>Safari나 Chrome에서 열어줘';
      steps=isKakao?null:'<div><b>1</b>오른쪽 위 메뉴(⋯)</div><div><b>2</b>\'다른 브라우저로 열기\'</div>';
      yesLabel=isKakao?'브라우저로 열기':'알겠어';
      onYes=function(){remember();if(isKakao){location.href='kakaotalk://web/openExternal?url='+encodeURIComponent(location.href);}close();};
    }else{
      title='앱처럼 꽉 찬 화면으로 보려면<br>홈 화면에 추가해줘';
      steps=(isIOS||!deferred)?(isIOS?'<div><b>1</b>아래 공유 버튼 또는 ⋯ 메뉴</div><div><b>2</b>\'홈 화면에 추가\'</div>':'<div><b>1</b>브라우저 메뉴(⋮)</div><div><b>2</b>\'홈 화면에 추가\' 또는 \'앱 설치\'</div>'):null;
      yesLabel='추가할래';
      onYes=function(){remember();
        if(deferred){deferred.prompt();deferred=null;close();return;}
        close();var a=el('div','hwig-arrow',isIOS?'공유 → 홈 화면에 추가 ↓':'메뉴 → 홈 화면에 추가');document.body.appendChild(a);
        setTimeout(function(){a.style.transition='opacity .4s';a.style.opacity='0';setTimeout(function(){a.remove();},400);},7000);
        a.onclick=function(){a.remove();};};
    }
    top.appendChild(ic);top.appendChild(el('div','hwig-t',title));card.appendChild(top);
    if(steps)card.appendChild(el('div','hwig-steps',steps));
    var btns=el('div','hwig-btns'),no=el('button','hwig-no','그냥 볼래'),yes=el('button','hwig-yes',yesLabel);
    no.onclick=function(){remember();close();};yes.onclick=onYes;
    btns.appendChild(no);btns.appendChild(yes);card.appendChild(btns);
    dim.appendChild(card);document.body.appendChild(dim);
    dim.addEventListener('click',function(e){if(e.target===dim){remember();close();}});
    requestAnimationFrame(function(){requestAnimationFrame(function(){dim.classList.add('on');});});
    function close(){dim.classList.remove('on');setTimeout(function(){dim.remove();},400);}
  }
  // 스플래시가 먼저 보이고 나서 올라오게
  if(document.readyState==='complete')setTimeout(show,1400);else addEventListener('load',function(){setTimeout(show,1400);});
})();
