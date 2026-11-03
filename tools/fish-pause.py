# "Hwi" / "Seo"처럼 이름 뒤에 정확히 쉼을 두고 싶은 줄 — 앞 단어와 나머지를 따로 뽑아 무음을 끼워 붙인다.
# TTS가 이름 바로 뒤에 다음 단어를 붙여 읽어서(10/16) 오디오를 잘라 끼우는 대신 이렇게 한다.
# 사용: FISH_KEY=… FISH_VOICE=… python3 tools/fish-pause.py vo-tts10   (그다음 tools/tts-fit.py)
import json, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, sys.argv[1])
KEY, VOICE = os.environ['FISH_KEY'], os.environ['FISH_VOICE']
PAUSE = 0.5
PRON = {'Hwi': 'HH W IY1', 'Seo': 'S AH1'}   # fish-vo.mjs와 같은 발음 교정

# 컷 → (앞, 뒤). 파일 이름은 cuts.ts의 vo
SPLIT = {
    'cut_03_93.wav':  ('Hwi.', 'The light. To set a small candle beside a sleeping memory, and warm the time it holds.'),   # C14
    'cut_04_115.wav': ('Seo.', "The uncovering. It's pausing the endless flow of data,"),                                 # C17
}


def tts(text, dst):
    for w, p in PRON.items():
        text = text.replace(w, f'<|phoneme_start|>{p}<|phoneme_end|>')
    req = urllib.request.Request('https://api.fish.audio/v1/tts', method='POST', headers={
        'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json', 'model': 's2.1-pro-free'},
        data=json.dumps({'text': text, 'reference_id': VOICE, 'format': 'wav', 'sample_rate': 44100,
                         'prosody': {'speed': 0.9, 'volume': 0, 'normalize_loudness': True},
                         'temperature': 0.7, 'normalize': True}).encode())
    raw = dst + '.raw.wav'
    open(raw, 'wb').write(urllib.request.urlopen(req).read())
    # 앞뒤 무음을 걷어 내야 끼우는 쉼이 정확히 PAUSE가 된다
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-ac', '1', '-ar', '44100', '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-c:a', 'pcm_s16le', dst], check=True)
    os.remove(raw)


for vo, (head, tail) in SPLIT.items():
    a, b = os.path.join(OUT, '_a.wav'), os.path.join(OUT, '_b.wav')
    tts(head, a)
    tts(tail, b)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-f', 'lavfi', '-t', str(PAUSE), '-i', 'anullsrc=r=44100:cl=mono',
                    '-i', b, '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', '-c:a', 'pcm_s16le', os.path.join(OUT, vo)], check=True)
    os.remove(a), os.remove(b)
    print(vo, '앞:', head, f'+ {PAUSE}s +', tail[:30] + '…')
