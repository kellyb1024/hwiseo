# TTS VO를 모션 길이에 맞춘다 — 앞뒤 무음 정리 → -18 LUFS. 빠르게 돌리지 않는다(10/15 '특정 구간만 빨리하지 말고 문장을 줄여') → 넘치면 경고만, 문장을 tools/vo-script-tts.json에서 줄일 것
# 사용: python3 tools/tts-fit.py vo-tts10   → vo-tts10/clean/
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, sys.argv[1])
OUT = os.path.join(SRC, 'clean')
os.makedirs(OUT, exist_ok=True)
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).strip())

cuts = re.findall(r"id: '(C\d\d)'.*?vo: '([^']+)'.*?voFrames: (\d+), duration: (\d+)",
                  open(os.path.join(ROOT, 'promo-video/src/cuts.ts')).read())
for cid, vo, vf, du in cuts:
    mx = (int(du) - 9) / 30
    tmp, out = os.path.join(OUT, '_t.wav'), os.path.join(OUT, vo)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(SRC, vo), '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse',
                    '-c:a', 'pcm_s16le', tmp], check=True)
    sec = dur(tmp)
    tempo = 1.0
    lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1])
    af = (f'atempo={tempo},' if tempo > 1 else '') + f'volume={-18 - lufs:.2f}dB,alimiter=limit=0.84:level=false'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-c:a', 'pcm_s16le', out], check=True)
    os.remove(tmp)
    s2 = dur(out)
    print(f"{cid} {s2:5.2f}s  최대 {mx:4.1f}  {'x'+str(tempo) if tempo > 1 else ''}{'  ⚠️ 김' if s2 > mx + 0.01 else ''}")
