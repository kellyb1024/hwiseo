# 휘서 전시용 앱 — 올리는 법 (Vercel)

## 1. 올리기
1. vercel.com 로그인 → Add New → Project → 이 폴더(server)를 통째로 끌어다 놓기
2. 배포가 끝나면 주소가 생겨요 (예: hwiseo-ex.vercel.app). 아이패드 2대 모두 이 주소를 Safari로 열고 '홈 화면에 추가'.

## 2. 사진 보관함 (Upstash Redis, 무료)
- Vercel 프로젝트 → Storage → Upstash(Redis) → Create → 프로젝트에 연결
- 환경변수(KV_REST_API_URL / KV_REST_API_TOKEN)가 자동으로 들어가요.
- 사진은 30분 뒤 자동 삭제되고, 아이패드가 받는 순간 바로 지워져요.

## 3. AI 키 (Claude)
- console.anthropic.com → API Keys → Create Key → 키 복사
- Vercel 프로젝트 → Settings → Environment Variables → 이름 ANTHROPIC_API_KEY, 값 = 키
- (선택) CLAUDE_MODEL = claude-haiku-5-5 (더 싸게. 기본값은 claude-sonnet-5-5)
- 저장 후 Deployments → Redeploy

## 4. 확인
- 아이패드에서 [대화하기] → QR → 폰으로 찍고 사진 보내기 → 아이패드가 자동으로 넘어가면 성공
- 인터넷·AI가 끊기면 휘서는 미리 준비된 질문으로 대신 물어봐요 (체험은 계속 가능)

## 파일
- Hwiseo Exhibition.dc.html : 아이패드 앱 (주소 / 로 열림)
- Hwiseo Upload.dc.html : 폰 업로드 페이지 (QR이 이리로 연결)
- api/ : 서버 (upload·photos = 사진 전달, chat = 대화, summary = 스티커 뒷면 한 줄)
- 스크랩북(날짜별 노트)은 각 아이패드 안에만 저장돼요. 초기화하려면 Safari 방문 기록·웹사이트 데이터 삭제.

## 전시 전 꼭
- 테스트로 붙인 스티커가 남아 있으면, 아이패드 Safari에서 웹사이트 데이터를 지우고 시작하세요.
