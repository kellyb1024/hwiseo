# 직접 녹음 VO 정리 — vo-rec/*.webm 에서 컷별 마지막 테이크를 골라 vo-rec/clean/<vo>.wav 로 만든다.
# 앞뒤 키 소리·무음 정리 → 잡음 감소 → 음량 맞춤 → 모션 길이(컷 duration - 0.3s)를 넘으면 최대 x1.15까지 살짝 빠르게.
# 사용: python3 tools/vo-clean.py   (결과 요약은 vo-rec/clean/_picks.json)
import os, re, subprocess, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REC = os.path.join(ROOT, 'vo-rec')
OUT = os.path.join(REC, 'clean')
os.makedirs(OUT, exist_ok=True)

HEAD, TAIL = 0.15, 0.12   # 스페이스 키 소리 구간. TAIL을 0.35로 했더니 말끝이 잘렸다(10/15)
CHAIN = ("atrim=start={h}:end={e:.3f},asetpts=N/SR/TB,highpass=f=80,afftdn=nf=-45,"
         "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.08,areverse,"
         "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.2,areverse,"
         "loudnorm=I=-18:TP=-2:LRA=11")


def dur(f):
    return float(subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).strip())


src = open(os.path.join(ROOT, 'promo-video/src/cuts.ts')).read()
slot = {a: (int(b), int(c)) for a, b, c in re.findall(r"id: '(C\d\d)'.*?voFrames: (\d+), duration: (\d+)", src)}

best = {}
for f in sorted(os.listdir(REC)):
    m = re.match(r'(C\d\d)_(.+)_t(\d+)\.webm$', f)
    if m:
        best.setdefault(m[1], []).append((int(m[3]), m[2], f))

rep = []
for cid, ts in sorted(best.items()):
    n, vo, f = max(ts)
    vf, du = slot[cid]
    mx = (du - 9) / 30
    tmp = os.path.join(OUT, '_tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(REC, f),
                    '-af', CHAIN.format(h=HEAD, e=dur(os.path.join(REC, f)) - TAIL),
                    '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', tmp], check=True)
    sec = dur(tmp)
    tempo = round(min(sec / mx + 0.005, 1.15), 3) if sec > mx else 1.0
    out = os.path.join(OUT, f'{vo}.wav')
    if tempo > 1:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'atempo={tempo}', '-c:a', 'pcm_s16le', out], check=True)
        os.remove(tmp)
    else:
        os.replace(tmp, out)
    # 짧은 클립은 loudnorm 한 번으로 ±1dB씩 흩어진다 → 실측해서 -18 LUFS로 정확히 맞춤
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', out, '-af', 'ebur128', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', meas)[-1])
    tmp = os.path.join(OUT, '_tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-af', f'volume={-18 - lufs:.2f}dB,alimiter=limit=0.84:level=false',
                    '-c:a', 'pcm_s16le', tmp], check=True)
    os.replace(tmp, out)
    s2 = dur(out)
    rep.append({'id': cid, 'take': n, 'of': len(ts), 'src': f, 'vo': vo, 'sec': round(s2, 2),
                'f': int(-(-s2 * 30 // 1)), 'tempo': tempo, 'target': vf, 'max': du - 9})
    flag = '' if s2 <= mx + 0.01 else '  ⚠️ 모션보다 김'
    print(f"{cid} t{n}/{len(ts)}  {s2:5.2f}s  목표 {vf/30:4.1f} 최대 {mx:4.1f}  {'x'+str(tempo) if tempo > 1 else ''}{flag}")

json.dump(rep, open(os.path.join(OUT, '_picks.json'), 'w'), indent=1)
print('최대 배속', max(r['tempo'] for r in rep))
