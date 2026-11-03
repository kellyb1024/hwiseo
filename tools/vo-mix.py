# 확인용 믹스 — vo-rec/clean 의 VO를 컷 위치에 깔고, BGM을 얹어(구간별 음량 + 대사 나올 때 자동으로 낮춤) 영상에 소리만 바꿔 끼운다.
# 사용: python3 tools/vo-mix.py [VO폴더=vo-rec/clean] [이름=mix-check]   → promo-video/out/hwiseo-full-<이름>.mp4
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN = os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else 'vo-rec/clean')
NAME = sys.argv[2] if len(sys.argv) > 2 else 'mix-check'
BGM = os.path.join(ROOT, 'promo-video/public/bgm/hope-music-hopeful-piano.mp3')
VIDEO = os.path.join(ROOT, 'promo-video/out/hwiseo-full-flat-1015.mp4')   # 0907은 이음매마다 0.09s 튐 → concat 필터로 재인코딩(10/15)
OUT_A = os.path.join(CLEAN, f'{NAME}.m4a')
OUT_V = os.path.join(ROOT, f'promo-video/out/hwiseo-full-{NAME}.mp4')

BGM_START = 0.0   # 처음부터 깔기(10/15 "시작하자마자 노래가 안 나온다"). 곡의 숨 고르기(1:40)가 P4 시작(서), 고조(1:56~)가 P4 끝~P5
BASE = 0.5        # 0.22는 "음악이 안 들린다"(10/15) → 약 +7dB
P2, P3 = 28.7, 61.8
P2_LEVEL = 0.6    # 데이터 홍수 구간은 조금 비워 둔다
FADE_AT = 141.0   # 로고 등장부터 천천히 끝냄 — 곡이 2:24에 한 번 더 꺼지는 걸 페이드 안에 묻는다

if not os.path.exists(VIDEO):
    # 바탕 영상이 없으면 파트 원본에서 다시 잇는다 — 스트림 복사로 이으면 이음매마다 0.09s 튀어서 재인코딩
    out = os.path.join(ROOT, 'promo-video/out')
    parts = ['p1flat/P1flat.mp4', 'p2flat/P2flat-0907.mp4', 'p3flat/P3flatB.mp4', 'p4flat/P4flat.mp4', 'p5flat/P5flat-0903.mp4']
    ins = sum((['-i', os.path.join(out, p)] for p in parts), [])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex',
                    ''.join(f'[{k}:v]' for k in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0,format=yuv420p[v]',
                    '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-r', '30', '-movflags', '+faststart', VIDEO], check=True)

src = open(os.path.join(ROOT, 'promo-video/src/cuts.ts')).read()
cuts = re.findall(r"id: '(C\d\d)'.*?vo: '([^']+)', start: (\d+).*?duration: (\d+)", src)
total = max(int(s) + int(d) for _, _, s, d in cuts) / 30

args = ['ffmpeg', '-v', 'error', '-y']
fl = []
for k, (_, vo, st, _) in enumerate(cuts):
    args += ['-i', os.path.join(CLEAN, vo)]
    ms = round(int(st) / 30 * 1000)
    fl.append(f'[{k}]adelay={ms}|{ms}[v{k}]')
n = len(cuts)
fl.append(''.join(f'[v{k}]' for k in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={total},aformat=channel_layouts=stereo,asplit=2[vo][key]')

args += ['-i', BGM]
# P2에서 1.5초에 걸쳐 내리고, P3에서 2초에 걸쳐 올린다. 끝 4초 페이드아웃
env = (f"{BASE}*if(lt(t,{P2}),1,if(lt(t,{P2}+1.5),1-(1-{P2_LEVEL})*(t-{P2})/1.5,"
       f"if(lt(t,{P3}),{P2_LEVEL},if(lt(t,{P3}+2),{P2_LEVEL}+(1-{P2_LEVEL})*(t-{P3})/2,1))))")
# 곡 1:37~1:56(곡 시간)이 12dB 가까이 확 꺼져서 "중간에 끊긴다"(10/15) → 그 구간만 +8dB로 메워 준다
u = f"(t-{BGM_START})"
fill = (f"if(lt({u},97),1,if(lt({u},101),1+1.5*({u}-97)/4,if(lt({u},112),2.5,if(lt({u},117),2.5-1.5*({u}-112)/5,1))))")
env = f"{env}*{fill}"
ms = round(BGM_START * 1000)
fl.append(f"[{n}]aformat=channel_layouts=stereo,adelay={ms}|{ms},atrim=0:{total},volume='{env}':eval=frame,"
          f"afade=t=in:st={BGM_START}:d=0.8,afade=t=out:st={FADE_AT}:d={total-FADE_AT}[bg]")
fl.append('[bg][key]sidechaincompress=threshold=0.05:ratio=2.5:attack=60:release=600[bgd]')
fl.append('[vo][bgd]amix=inputs=2:normalize=0,alimiter=limit=0.9[o]')
args += ['-filter_complex', ';'.join(fl), '-map', '[o]', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', OUT_A]
subprocess.run(args, check=True)

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', VIDEO, '-i', OUT_A, '-map', '0:v', '-map', '1:a',
                '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', OUT_V], check=True)
print(OUT_A)
print(OUT_V)
