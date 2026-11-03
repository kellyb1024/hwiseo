# 인스타 프로필 시안 (1080×1080, 원형 크롭 전제)
V = {
 'A': dict(opt="{pose:'hi',level:3,mood:'happy',vb:'6 4 288 288'}", note='클로즈업 + 양손'),
 'B': dict(opt="{pose:'hi',level:4,mood:'laugh',spark:true,vb:'-6 -22 312 312'}", note='불꽃 강조'),
 'C': dict(opt="{pose:'hi',level:3,mood:'wink',vb:'6 4 288 288'}", note='윙크'),
}
T = '''<!doctype html><html><head><meta charset="utf-8"><script src="../../design/character/hwiseo-F.js"></script>
<style>*{{margin:0}}html,body{{width:1080px;height:1080px;background:#765DCF;overflow:hidden}}
#c{{width:1080px;height:1080px}}#c svg{{width:100%;height:100%;display:block}}</style></head><body><div id="c"></div>
<script>HWF.POSE.hi={{arms:[42,42]}};document.head.insertAdjacentHTML('beforeend',`<style>${{HWF.CSS}} .hw *{{animation:none!important}} .hw-glow{{display:none}}</style>`);
document.getElementById('c').innerHTML=HWF.char({opt});</script></body></html>'''
for k, v in V.items():
    open(f'profile-{k}.html', 'w').write(T.format(opt=v['opt']))
