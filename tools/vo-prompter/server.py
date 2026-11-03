# VO 프롬프터 서버 — 페이지를 띄우고, 녹음한 테이크를 vo-rec/ 에 바로 저장한다.
# 사용: python3 tools/vo-prompter/server.py  →  http://localhost:8790
import http.server, os, re, json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'vo-rec')
os.makedirs(OUT, exist_ok=True)
SAFE = re.compile(r'^[A-Za-z0-9_\-]+\.(webm|ogg|mp4|wav)$')


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HERE, **k)

    def do_POST(self):
        name = self.path.rsplit('/', 1)[-1]
        if not self.path.startswith('/save/') or not SAFE.match(name):
            self.send_error(400, 'bad name')
            return
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(OUT, name), 'wb') as f:
            f.write(data)
        print(f'saved {name} ({len(data)//1024} KB)')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True, 'name': name}).encode())

    def do_GET(self):
        # 이미 녹음된 테이크 목록 — 새로고침해도 진행 상황 유지
        if self.path == '/takes':
            names = sorted(n for n in os.listdir(OUT) if SAFE.match(n))
            body = json.dumps(names).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


print(f'VO 프롬프터 → http://localhost:8790   (저장 위치: {OUT})')
http.server.ThreadingHTTPServer(('127.0.0.1', 8790), H).serve_forever()
