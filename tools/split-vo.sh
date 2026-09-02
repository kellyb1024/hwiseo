#!/bin/bash
# 휘서 VO 분할 — 한 번에 녹음한 파일을 25컷 wav로 자른다.
# 사용: bash tools/split-vo.sh <녹음파일> [무음초] [무음dB]
#   예: bash tools/split-vo.sh ~/Desktop/vo-take1.m4a 1.2 -38
set -e
SRC="$1"; GAP="${2:-1.2}"; DB="${3:-38}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/vo-recorded"
[ -f "$SRC" ] || { echo "파일 없음: $SRC"; exit 1; }
rm -rf "$OUT"; mkdir -p "$OUT"

# 1) 44.1k 모노로 정규화 + 앞뒤 무음 정리
ffmpeg -v error -y -i "$SRC" -ac 1 -ar 44100 -c:a pcm_s16le "$OUT/_take.wav"

# 2) 무음 지점 검출
ffmpeg -v info -i "$OUT/_take.wav" -af "silencedetect=noise=-${DB}dB:d=${GAP}" -f null - 2>&1 \
  | grep -E "silence_(start|end)" > "$OUT/_silence.txt" || true

# 3) 무음 사이 구간을 잘라낸다
python3 - "$OUT" <<'PY'
import re,sys,os,subprocess
out=sys.argv[1]; take=os.path.join(out,'_take.wav')
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',take]).strip())
txt=open(os.path.join(out,'_silence.txt')).read()
starts=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',txt)]
ends=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',txt)]
segs=[]; cur=0.0
if ends and (not starts or ends[0]<starts[0]): cur=ends.pop(0)   # 앞머리 무음
for i,s in enumerate(starts):
    if s>cur+0.25: segs.append((cur,s))
    cur = ends[i] if i<len(ends) else dur
if dur>cur+0.25: segs.append((cur,dur))
print(f"검출된 구간 {len(segs)}개 (목표 25개)")
for i,(a,b) in enumerate(segs,1):
    p=os.path.join(out,f'take_{i:02d}.wav')
    subprocess.run(['ffmpeg','-v','error','-y','-i',take,'-ss',str(max(0,a-0.12)),
                    '-to',str(min(dur,b+0.20)),'-ac','1','-ar','44100','-c:a','pcm_s16le',p],check=True)
    print(f"  take_{i:02d}.wav  {b-a:5.2f}s")
PY
rm -f "$OUT/_take.wav" "$OUT/_silence.txt"
echo; echo "→ $OUT 에 저장됨. 개수가 25가 아니면 무음초/dB 값을 바꿔 다시 실행."
