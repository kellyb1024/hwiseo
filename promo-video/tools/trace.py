"""연필 래스터 → 중심선 스트로크 + 채색 영역 JSON.
usage: python tools/trace.py in.png out.json [scale] [--zone name=x0,y0,x1,y1 ...] [--order rest,fills,name,...]
- zone: 그리는 순서를 지정할 영역 (0~1 정규화 좌표). --order 로 zone 이름·rest(나머지)·fills(채색 영역+테두리)의 순서를 정함
- 선: 종이보다 어둡고 채도 낮은 픽셀 → skeletonize → 폴리라인 (그리는 순서: 긴 윤곽 → 근접 디테일)
- 채색: 채도 높은 영역 → 외곽 폴리곤 (코드가 크레파스 칠하듯 채움)
"""
import sys, json, numpy as np
from PIL import Image
from skimage.morphology import skeletonize, remove_small_objects, binary_dilation, disk
from skimage.measure import approximate_polygon, find_contours, label, regionprops

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = sys.argv[1:]
zones = {}; order_spec = None
for i, a in enumerate(opts):
    if a == '--zone':
        name, box = opts[i+1].split('='); zones[name] = [float(v) for v in box.split(',')]
    if a == '--order': order_spec = opts[i+1].split(',')
args = [a for i, a in enumerate(opts) if not a.startswith('--') and (i == 0 or opts[i-1] not in ('--zone', '--order'))]
src, out_json = args[0], args[1]
scale = float(args[2]) if len(args) > 2 else 1.0
im = Image.open(src).convert('RGB')
if scale != 1.0:
    im = im.resize((int(im.width*scale), int(im.height*scale)), Image.LANCZOS)
rgb = np.asarray(im).astype(float) / 255
g = rgb.mean(axis=2) * 255
mx, mn = rgb.max(axis=2), rgb.min(axis=2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
paper = np.percentile(g, 90)
color = (sat > 0.32) & (mx > 0.3)
color = remove_small_objects(color, max_size=400)
ink = (g < paper - 45) & ~color
ink = remove_small_objects(ink, max_size=30)
sk = skeletonize(ink)
H, W = sk.shape
pts = set(zip(*np.nonzero(sk)))
nb = lambda p: [(p[0]+dy, p[1]+dx) for dy in (-1,0,1) for dx in (-1,0,1) if (dy or dx) and (p[0]+dy, p[1]+dx) in pts]
deg = {p: len(nb(p)) for p in pts}
visited = set(); strokes = []
def walk(start):
    path = [start]; visited.add(start); cur = start
    while True:
        nxt = [q for q in nb(cur) if q not in visited]
        if not nxt: break
        if len(path) > 1:
            dy, dx = cur[0]-path[-2][0], cur[1]-path[-2][1]
            nxt.sort(key=lambda q: -((q[0]-cur[0])*dy + (q[1]-cur[1])*dx))
        cur = nxt[0]; visited.add(cur); path.append(cur)
        if deg[cur] > 2 and len(path) > 3: break
    return path
for p in sorted(pts, key=lambda p: (deg[p] != 1, p[1], p[0])):
    if p in visited: continue
    path = walk(p)
    if len(path) >= 6: strokes.append(path)
for p in pts:
    if p not in visited:
        path = walk(p)
        if len(path) >= 6: strokes.append(path)
out = []
for path in strokes:
    arr = approximate_polygon(np.array([(x, y) for y, x in path], float), 1.2)
    L = float(np.sum(np.hypot(*np.diff(arr, axis=0).T)))
    if L < 8: continue
    out.append({'d': 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in arr), 'len': L,
                'cx': float(arr[:,0].mean()), 'cy': float(arr[:,1].mean())})
out.sort(key=lambda s: -s['len'])
big = [s for s in out if s['len'] > 120]; small = [s for s in out if s['len'] <= 120]
ordered = big[:]; cur = (ordered[-1]['cx'], ordered[-1]['cy']) if ordered else (0.0, 0.0)
rest = small[:]
while rest:
    i = min(range(len(rest)), key=lambda k: (rest[k]['cx']-cur[0])**2 + (rest[k]['cy']-cur[1])**2)
    s = rest.pop(i); ordered.append(s); cur = (s['cx'], s['cy'])
fills = []
lab = label(color)
for r in regionprops(lab):
    m = np.pad(lab == r.label, 1)
    cs = find_contours(m.astype(float), 0.5)
    if not cs: continue
    c = max(cs, key=len); c = approximate_polygon(c, 1.5) - 1
    y0, x0, y1, x1 = r.bbox
    fills.append({'poly': 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for y, x in c) + ' Z',
                  'x0': int(x0), 'y0': int(y0), 'x1': int(x1), 'y1': int(y1), 'area': int(r.area)})
fills.sort(key=lambda f: (f['x0'], f['y0']))
# 그리는 순서: 일반 선 → (채색 영역마다: 그 테두리 선 → 칠하기)
order = []; taken = set()
for fi, f in enumerate(fills):
    pad = max(10, 0.08 * max(f['x1'] - f['x0'], f['y1'] - f['y0']))
    mine = [i for i, s in enumerate(ordered) if i not in taken
            and f['x0'] - pad <= s['cx'] <= f['x1'] + pad and f['y0'] - pad <= s['cy'] <= f['y1'] + pad]
    taken.update(mine); f['outline'] = mine
zone_of = {}
for name, (zx0, zy0, zx1, zy1) in zones.items():
    for i, s_ in enumerate(ordered):
        if i in taken or i in zone_of: continue
        if zx0 * W <= s_['cx'] <= zx1 * W and zy0 * H <= s_['cy'] <= zy1 * H: zone_of[i] = name
general = [i for i in range(len(ordered)) if i not in taken and i not in zone_of]
fills_part = []
for fi, f in enumerate(fills):
    fills_part += [{'t': 's', 'i': i} for i in f['outline']] + [{'t': 'f', 'i': fi}]
parts = {'rest': [{'t': 's', 'i': i} for i in general], 'fills': fills_part}
for name in zones:
    # 영역 안: 긴 선(윤곽) 먼저, 나머지는 근접 순
    idx = [i for i in range(len(ordered)) if zone_of.get(i) == name]
    longs = sorted([i for i in idx if ordered[i]['len'] > 60], key=lambda i: -ordered[i]['len'])
    rest_ = [i for i in idx if ordered[i]['len'] <= 60]
    seq = longs[:]; cur_ = (ordered[seq[-1]]['cx'], ordered[seq[-1]]['cy']) if seq else (0.0, 0.0)
    while rest_:
        j = min(rest_, key=lambda i: (ordered[i]['cx']-cur_[0])**2 + (ordered[i]['cy']-cur_[1])**2)
        rest_.remove(j); seq.append(j); cur_ = (ordered[j]['cx'], ordered[j]['cy'])
    parts[name] = [{'t': 's', 'i': i} for i in seq]
spec = order_spec or ['rest', 'fills'] + list(zones)
order = [it for name in spec for it in parts.get(name, [])]
print('order:', ', '.join(f'{n}({len(parts.get(n, []))})' for n in spec))
json.dump({'w': W, 'h': H, 'strokes': ordered, 'fills': fills, 'order': order}, open(out_json, 'w'))
print(f'{W}x{H} strokes={len(ordered)} len={sum(s["len"] for s in ordered):.0f} fills={len(fills)} outline={[len(f["outline"]) for f in fills]}')
