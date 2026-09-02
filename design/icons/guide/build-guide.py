#!/usr/bin/env python3
"""휘서 앱 아이콘 가이드 생성 — python3 design/icons/guide/build-guide.py"""
import math

SZ=1024; C=SZ/2; N=5.0            # 슈퍼타원 지수. n=5 가 iOS 스쿼클에 가깝다
G1='#FF2D8A'; G2='#00A3FF'; G3='#9AA0AA'

def P(t):
    ct,st=math.cos(t),math.sin(t)
    return (C+C*math.copysign(abs(ct)**(2/N),ct), C+C*math.copysign(abs(st)**(2/N),st))

def squircle(samples=64):
    """접선 기준 3차 베지에. Catmull-Rom 은 평평한 변에서 밖으로 부풀어 캔버스를 넘는다."""
    h=1e-5
    pts=[P(2*math.pi*i/samples) for i in range(samples)]
    tan=[]
    for i in range(samples):
        t=2*math.pi*i/samples
        a,b=P(t-h),P(t+h)
        dx,dy=b[0]-a[0],b[1]-a[1]
        L=math.hypot(dx,dy) or 1
        tan.append((dx/L,dy/L))
    d=f"M{pts[0][0]:.2f},{pts[0][1]:.2f}"
    for i in range(samples):
        p1,p2=pts[i],pts[(i+1)%samples]
        t1,t2=tan[i],tan[(i+1)%samples]
        L=math.hypot(p2[0]-p1[0],p2[1]-p1[1])/3
        c1=(p1[0]+t1[0]*L, p1[1]+t1[1]*L)
        c2=(p2[0]-t2[0]*L, p2[1]-t2[1]*L)
        d+=f" C{c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {p2[0]:.2f},{p2[1]:.2f}"
    return d+" Z", pts

SQ,pts=squircle()
print(f'스쿼클 범위 x {min(p[0] for p in pts):.1f}~{max(p[0] for p in pts):.1f} '
      f'y {min(p[1] for p in pts):.1f}~{max(p[1] for p in pts):.1f}  (0~{SZ} 안이어야 정상)')

M=int(SZ*0.06); R_MASK=SZ*0.40; R_MIN=SZ*(66/108)/2
def dash(c,w=2,da='10 8'): return f'fill="none" stroke="{c}" stroke-width="{w}" stroke-dasharray="{da}"'
def solid(c,w=2):          return f'fill="none" stroke="{c}" stroke-width="{w}"'
def lab(x,y,t,c=G3,s=16,a='start'):
    return (f'<text x="{x}" y="{y}" font-family="ui-monospace,Menlo,monospace" font-size="{s}" '
            f'fill="{c}" text-anchor="{a}">{t}</text>')

svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{SZ}" height="{SZ}" viewBox="0 0 {SZ} {SZ}">
<title>휘서 앱 아이콘 가이드 1024</title>

<g id="00-바탕">
  <rect width="{SZ}" height="{SZ}" fill="#FFFFFF"/>
</g>

<g id="01-캔버스-1024">
  <rect x="0.5" y="0.5" width="{SZ-1}" height="{SZ-1}" {solid(G3,1)}/>
</g>

<g id="02-중심선-삼등분">
  <g {solid(G3,1)} opacity="0.45">
    <line x1="{C}" y1="0" x2="{C}" y2="{SZ}"/>
    <line x1="0" y1="{C}" x2="{SZ}" y2="{C}"/>
    <line x1="{SZ/3:.0f}" y1="0" x2="{SZ/3:.0f}" y2="{SZ}" stroke-dasharray="4 9"/>
    <line x1="{SZ*2/3:.0f}" y1="0" x2="{SZ*2/3:.0f}" y2="{SZ}" stroke-dasharray="4 9"/>
    <line x1="0" y1="{SZ/3:.0f}" x2="{SZ}" y2="{SZ/3:.0f}" stroke-dasharray="4 9"/>
    <line x1="0" y1="{SZ*2/3:.0f}" x2="{SZ}" y2="{SZ*2/3:.0f}" stroke-dasharray="4 9"/>
  </g>
  <line x1="0" y1="{C-26}" x2="{SZ}" y2="{C-26}" {dash(G2,1,'2 7')}/>
  {lab(SZ-14, C-34, '광학 중심 (기하 중심보다 26px 위)', G2, 15, 'end')}
</g>

<g id="03-여백-6퍼센트">
  <rect x="{M}" y="{M}" width="{SZ-2*M}" height="{SZ-2*M}" {dash(G2,2,'6 6')}/>
  {lab(M+10, M+26, f'여백 6% = {M}px', G2)}
</g>

<g id="04-마스커블-안전원-지름80퍼센트">
  <circle cx="{C}" cy="{C}" r="{R_MASK:.1f}" {dash(G1,3)}/>
  {lab(C, C+R_MASK-20, f'마스커블 안전원 · 지름 80% (r={R_MASK:.0f}) — 밖은 잘린다', G1, 17, 'middle')}
</g>

<g id="05-안드로이드-최소보장-66of108dp">
  <circle cx="{C}" cy="{C}" r="{R_MIN:.1f}" {dash(G1,2,'4 9')} opacity="0.65"/>
  {lab(C, C-R_MIN-16, f'최소 보장 66/108dp (r={R_MIN:.0f}) — 어떤 런처에서도 안전', G1, 15, 'middle')}
</g>

<g id="06-iOS-스쿼클-실제모양">
  <path d="{SQ}" {solid(G2,3)}/>
  {lab(14, SZ-52, 'iOS 스쿼클 (슈퍼타원 n=5) — iOS 가 실제로 씌우는 마스크', G2)}
</g>

<g id="07-원호라운드-r229-비교용">
  <rect x="0" y="0" width="{SZ}" height="{SZ}" rx="229" {dash(G3,2,'8 8')}/>
  {lab(14, SZ-26, '원호 라운드 r=229 (22.37%) — 일러스트 둥근사각형. 모서리가 더 각지다', G3)}
</g>
</svg>'''
open('guide-1024.svg','w').write(svg)

open('squircle-1024.svg','w').write(
f'''<svg xmlns="http://www.w3.org/2000/svg" width="{SZ}" height="{SZ}" viewBox="0 0 {SZ} {SZ}">
<title>iOS 스쿼클 1024 — 배경 도형</title>
<!-- 슈퍼타원 n=5. 일러스트 둥근사각형(원호)보다 iOS 실제 마스크에 가깝다.
     앱 제출용 파일에는 쓰지 말 것 — 정사각형 풀블리드로 내고 iOS 가 씌우게 둔다.
     발표자료·영상·파비콘처럼 직접 둥글게 보여야 할 때만 쓴다. -->
<path id="squircle" d="{SQ}" fill="#7B5CD6"/>
</svg>''')
print('guide-1024.svg, squircle-1024.svg 저장')
