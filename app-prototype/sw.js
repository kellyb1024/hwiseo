// 휘서 프로토타입 서비스워커 — 한 번 열면 오프라인에서도 동작
const VERSION='hwiseo-v2';
const CORE=[
"./",
"index.html",
"support.js",
"hwiseo-F.js",
"hwiseo-en.js",
"ios-frame.jsx",
"manifest.webmanifest",
"install-guide.js",
"apple-touch-icon.png",
"icon-192.png",
"icon-512.png",
"photos/p01.jpg",
"photos/p02.jpg",
"photos/p03.jpg",
"photos/p04.jpg",
"photos/p05.jpg",
"photos/p06.jpg",
"photos/p07.jpg",
"photos/p08.jpg",
"photos/p09.jpg",
"photos/p10.jpg",
"photos/p11.jpg",
"photos/p12.jpg",
"photos/p13.jpg",
"photos/p14.jpg",
"photos/p15.jpg",
"photos/p16.jpg",
"photos/p17.jpg",
"photos/p18.jpg",
"photos/p19.jpg",
"photos/p20.jpg",
"photos/p21.jpg",
"photos/p22.jpg",
"photos/p23.jpg",
"photos/p24.jpg",
"photos/p25.jpg",
"photos/p26.jpg",
"photos/p27.jpg",
"photos/p28.jpg",
"photos/p29.jpg",
"photos/p30.jpg",
"photos/p31.jpg",
"photos/p32.jpg",
"photos/p33.jpg",
"photos/p34.jpg",
"photos/p35.jpg",
"uploads/1-lift.png",
"uploads/1-orig.jpg",
"uploads/1.png",
"uploads/2.png",
"uploads/4.png",
"uploads/IMG_8938-s.jpg",
"uploads/c-brunch.png",
"uploads/c-calico.png",
"uploads/c-nose.png",
"uploads/c-orange.png",
"uploads/c-stadium.png",
"uploads/c-ticket.png"
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // 페이지: 네트워크 우선(업데이트 반영), 실패하면 캐시
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('./',c));return r;}).catch(()=>caches.match('./')));return;}
  // 나머지(사진·스크립트·CDN 글꼴/라이브러리): 캐시 우선, 없으면 받아서 저장
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c));}return r;})));
});
