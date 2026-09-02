# 휘서 — 기술 구현 명세

> 실제 서비스 기준. 디자인 시스템 → 구현 → 배포·운영까지.
> 개발 기간: W3~W4 (9/04–9/17). **9/17까지 동작해야 다큐 촬영이 가능하다.**
> 작성 2026-08-25

---

## 0. 설계 원칙

| | |
|---|---|
| **대화가 본체다** | UI는 사라져야 한다. 화면의 주인공은 사진과 질문 |
| **프롬프트는 데이터다** | 코드에 하드코딩하지 않는다. 배포 없이 튜닝할 수 있어야 한다 |
| **전시는 실패하면 안 된다** | 네트워크·API 장애 시에도 부스가 돌아가야 한다 |
| **사진은 남기지 않는다** | 세션 종료 시 삭제가 기본. 보관은 예외이며 명시적 동의 필요 |
| **API 키는 서버에만** | 프론트에 어떤 형태로도 노출하지 않는다 |

---

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| **프레임워크** | **Next.js (App Router)** | API Routes가 내장돼 별도 서버 없이 키를 숨길 수 있다. Vercel 배포 최적화. 순수 React + Vite보다 구성이 단순 |
| **호스팅** | Vercel | Next.js 네이티브. 프리뷰 배포로 시안 공유 가능 |
| **DB** | **Supabase (Postgres)** | 세션·대화·결과 저장 |
| **파일** | Supabase Storage | 업로드 사진, 생성 이미지 |
| **실시간** | Supabase Realtime | **QR 페어링의 핵심** — 폰이 올린 사진을 태블릿이 즉시 받는다 |
| **LLM** | 🔲 Gemini vs Claude — 프롬프트 테스트로 결정 | 비용 차이는 무의미 (12장 참조). 질문 품질로 판단 |
| **이미지 생성** | 🔲 미정 | 4컷용. 텍스트와 다른 제공자를 써도 무방 |
| **음성 출력** | TTS API | 질문을 읽어준다. 헤드폰 전제 |
| **음성 입력** | Web Speech API | 선택 기능 |
| **모션** | Framer Motion (Motion.dev) | 등불·선 애니메이션. **영상 제작(Remotion)과 컴포넌트를 공유할 수 있다** |
| **스케줄** | Vercel Cron | 타임캡슐 발송, 4컷 비동기 생성 |
| **메일** | Resend 또는 Supabase 내장 | 캡슐 도착 알림 |

### ⚠️ Auth는 최소로
로그인은 **이메일만 받는다.** 비밀번호·소셜 로그인 없음.
전시 세션은 로그인 없이 익명 토큰으로 돌고, "이어서 하기"와 캡슐 발송에만 이메일을 쓴다.
→ 6주 안에 만들 것이 아니고, 진입 장벽만 높인다.

---

## 2. 디자인 시스템

### 2-1. 토큰

```
color/
  ink          #08080B   바탕 (검정)
  ink-2        #0E0E13   카드·입력창
  rule         #1F1F29   경계선
  paper        #EAE7E0   본문 텍스트
  muted        #8C857A   보조 텍스트 (따뜻한 회색)
  lantern      #F0B15E   등불색 — 유일한 강조색
  lantern-deep #C97B3A
  slate        #4A5560   아직 열리지 않은 것 (차가운 회색)

space/  4 8 12 16 24 32 48 64 96
radius/ 0 2 4         (둥근 모서리 최소화 — 손그림 톤과 충돌)
```

**다크 온리.** 어둠이 컨셉이므로 라이트 테마를 만들지 않는다. 대신 **모든 색을 명시적으로 칠한다.**

**의미 규칙 (영상과 공유)**
- `lantern` = 열린 것, 빛, AI의 질문
- `slate` = 아직 안 열린 것, 엉킨 것
- 이 두 색의 대비가 영상·제품·전시를 하나로 묶는다

### 2-2. 타이포

| 역할 | 서체 | 용도 |
|---|---|---|
| 디스플레이 | 명조 계열 (Nanum Myeongjo / Gowun Batang) | 輝敍, 생성된 이야기, 한 줄 정리 |
| 본문·UI | Pretendard 또는 IBM Plex Sans KR | 질문, 버튼, 안내 |
| 데이터 | IBM Plex Mono | 연도, 시간, 카운터 |

- 질문 텍스트는 **크게**. 태블릿 기준 최소 22px
- 행간 1.7 이상. 한 줄 30자 이내
- 생성된 이야기는 명조로 — **UI 텍스트와 시각적으로 구분**되어야 "이건 내 말"로 읽힌다

### 2-3. 컴포넌트

| 컴포넌트 | 설명 |
|---|---|
| `PhotoStage` | 사진 표시. 화면의 주인공. 여백을 크게 |
| `Question` | AI 질문. 타이핑 애니메이션 없이 **한 번에 나타나되 페이드** (타이핑은 재촉하는 느낌) |
| `AnswerInput` | 텍스트 입력 + 음성 토글. 글자 수 제한 없음 |
| `ThreadLine` | AI의 시각적 존재. **얼굴 없음.** 질문할 때 선이 움직이고, 들을 때 잦아든다 |
| `SkipControl` | **건너뛰기** — 회피 시기 대응 (필수, 눈에 띄게) |
| `StoryCard` | 생성된 이야기 + 한 줄 정리 + 수정 버튼 |
| `PanelFour` | 4컷 + 원본 사진 병치 + 발화 캡션 |
| `Lantern` | 등불 모션. 세션 종료 시 |
| `QRPair` | 태블릿에 표시되는 QR + 대기 상태 |

### 2-4. 모션 원칙
- **선형 이징 금지.** 모든 전환에 커브
- 등장은 2속성 이상 (투명도 + 이동)
- 질문 등장은 **느리게**(400ms+) — 재촉하지 않는다
- `prefers-reduced-motion` 존중

---

## 3. 데이터 모델

```sql
-- 세션: 전시/개인 공통
sessions
  id              uuid pk
  mode            text        -- 'exhibition' | 'personal'
  pair_token      text unique -- QR 페어링용 (전시 모드)
  prompt_version  text        -- 어떤 프롬프트로 돌았는지 ★
  model           text        -- 어떤 모델로 돌았는지 ★
  target_period   text        -- AI가 지목한 시기 '2019-11'
  status          text        -- 'waiting_photo'|'active'|'done'|'abandoned'
  created_at      timestamptz
  completed_at    timestamptz

-- 사진: 세션당 1장
photos
  id           uuid pk
  session_id   uuid fk
  storage_path text
  analysis     jsonb        -- AI 분석 결과 (라벨, 추정 연대 등)
  delete_after timestamptz  -- ★ 삭제 예정 시각
  deleted_at   timestamptz

-- 대화 턴
turns
  id          uuid pk
  session_id  uuid fk
  idx         int          -- 순서
  role        text         -- 'ai' | 'user'
  content     text
  layer       text         -- 'context'|'everything'|'order'|'perspective'|'meaning'
  created_at  timestamptz

-- 생성 결과
stories
  id          uuid pk
  session_id  uuid fk
  oneline     text         -- 한 줄 정리
  body        text         -- 이야기
  edited_by_user boolean   -- 사용자가 수정했는지 ★
  created_at  timestamptz

-- 4컷 (비동기 생성)
panels
  id          uuid pk
  story_id    uuid fk
  status      text         -- 'queued'|'done'|'failed'
  image_path  text
  captions    jsonb        -- 각 컷의 근거 발화 ★
  created_at  timestamptz

-- 타임캡슐
capsules
  id          uuid pk
  story_id    uuid fk
  email       text
  deliver_at  timestamptz
  delivered_at timestamptz

-- 전시 등불 (익명, 공용 스크린)
lanterns
  id          uuid pk
  oneline     text         -- 한 줄만. 사진 없음 ★
  consented   boolean      -- 게시 동의
  created_at  timestamptz
```

### ★ 표시 항목의 이유
- `prompt_version` / `model` — **프롬프트를 튜닝하며 세션 품질을 비교하려면 필수.** 없으면 어떤 버전이 좋았는지 알 수 없다
- `delete_after` — 삭제가 정책이 아니라 **스키마로 강제**된다
- `edited_by_user` — "AI 환각을 UX로 통제"의 증거. 실제로 몇 %가 수정했는지가 데이터가 된다
- `captions` — 4컷 각 컷이 어느 발화에서 나왔는지. 저자성 추적
- `lanterns.oneline` — **사진 컬럼 자체가 없다.** 실수로도 못 올린다

### RLS (Row Level Security)
- 익명 세션은 자기 `pair_token`으로만 접근
- `lanterns`는 `consented = true`만 공개 읽기
- 나머지 테이블은 서버(service role)에서만 접근

---

## 4. API 설계

전부 Next.js Route Handler. **키는 서버에만.**

| 엔드포인트 | 역할 | 비고 |
|---|---|---|
| `POST /api/session` | 세션 생성, 시기 지목, `pair_token` 발급 | 전시 모드 |
| `POST /api/upload` | 폰에서 사진 업로드 | `pair_token`으로 세션 찾음 |
| `POST /api/analyze` | 사진 분석 → 확인 문장 생성 | LLM 호출 ① |
| `POST /api/ask` | 다음 질문 생성 | LLM 호출 ② — **대화 이력 전체 전송** |
| `POST /api/compose` | 이야기 + 한 줄 정리 | LLM 호출 ③ |
| `POST /api/illustrate` | 4컷 생성 요청 (큐에 넣고 즉시 응답) | 비동기 |
| `POST /api/capsule` | 타임캡슐 등록 | |
| `POST /api/lantern` | 등불 게시 (동의 시) | |
| `GET /api/lanterns` | 전시 스크린용 목록 | 공개 |
| `POST /api/session/:id/end` | 종료 + **사진 삭제 예약** | |

### 프롬프트 캐싱
사진과 시스템 프롬프트가 한 세션에서 7~9회 반복된다.
**캐싱을 켜면 입력 비용이 약 1/3로 내려간다.** 반드시 적용할 것.

---

## 5. 프롬프트 관리 ★

**프롬프트를 코드에 넣지 않는다.**

```
/prompts
  analyze.v1.md
  ask.v1.md          ← 여기가 이 프로젝트의 본체
  compose.v1.md
  illustrate.v1.md
```

- 파일로 두고 빌드 시 로드. 또는 Supabase 테이블에 두고 런타임 로드
- 세션마다 `prompt_version`을 기록 → **A/B 비교 가능**
- **패널에 그대로 게재할 수 있는 형태로 작성할 것.** 이것이 디자인 산출물이다

### `ask` 프롬프트에 반드시 들어갈 규칙 (리서치 반영)
1. 맥락 재구성을 **먼저**, 단계로 (질문 하나로 압축하지 말 것)
2. **"사소해 보여도 괜찮아요"** 를 명시적으로 전달
3. 반복적으로 존재했던 것(옷·소지품·공간) 우선 — 시각적으로 튀는 것보다
4. 옷·소지품 언급 허용 / **외모 평가 금지**
5. 확인받는 톤 — 단정 금지
6. **채널만 열고 내용은 제안하지 않는다** ("냄새 기억나세요?" ⭕ / "비 냄새 아니었어요?" ❌)
7. "기억 안 남"을 **AI가 채우지 않는다**
8. **2연속 실패 시 축 전환**
9. **무조건 동조하지 않는다** (감정을 규정해주지 않는다)
10. 사진 유형(셀피/풍경/단체/사물)에 따라 층 순서 조정

---

## 6. QR 페어링 흐름

```
태블릿                          서버                        폰
  │ POST /api/session            │                          │
  │◄─── pair_token ──────────────│                          │
  │ QR 표시                       │                          │
  │ Realtime 구독 시작            │                          │
  │                              │  ◄── QR 스캔 ────────────│
  │                              │  POST /api/upload        │
  │                              │  Storage 저장            │
  │                              │  sessions 업데이트        │
  │◄─── Realtime 이벤트 ─────────│                          │
  │ 사진 표시 → 세션 시작          │                          │
```

---

## 7. 비동기 처리

| 작업 | 방식 |
|---|---|
| **4컷 생성** | 큐에 넣고 즉시 응답 → Vercel Cron이 처리 → 완료 시 이메일. **전시 세션을 붙잡지 않는다** |
| **타임캡슐 발송** | Cron 1일 1회. `deliver_at <= now()` 조회 후 발송 |
| **사진 삭제** | Cron. `delete_after <= now()` 인 것 삭제 |

---

## 8. 전시 모드 특수 요구

### 8-1. 폴백 (필수)
- 샘플 세션 **3종을 앱에 내장** (JSON)
- API 응답이 **8초** 안에 없으면 자동 전환
- 관람객은 전환 사실을 모른다

### 8-2. 키오스크
- Chrome 키오스크 모드로 실행
- 새로고침·주소창 차단
- 세션 종료 후 **60초 무입력 시 자동 초기화** → 대기 화면
- 화면 꺼짐 방지 (Wake Lock API)

### 8-3. 프린터 ⚠️ 기술 리스크
브라우저에서 프린터를 직접 제어할 수 없다. 두 가지 방법.

| 방법 | 내용 | 평가 |
|---|---|---|
| **Chrome `--kiosk-printing`** | `window.print()` 호출 시 다이얼로그 없이 기본 프린터로 즉시 출력 | ⭐ 간단. **먼저 이걸로 시도** |
| 로컬 프린트 서버 | 부스 PC에 Node 서버를 두고 태블릿이 요청 | 확실하지만 장비가 하나 더 필요 |

- 출력 레이아웃은 **CSS `@media print`** 로 별도 작성
- ⚠️ **W5까지 실물 프린터로 반드시 테스트.** 여백·크기·소요 시간을 실측할 것

### 8-4. 등불 스크린
- 별도 라우트 `/wall` — 전체화면, `GET /api/lanterns` 폴링 또는 Realtime 구독
- **한 줄 정리만 표시. 사진 없음**
- 동의(`consented`)한 것만

---

## 9. 개발 순서 (우선순위)

**9/17까지 동작해야 다큐 촬영이 가능하다.** 이 순서를 지킬 것.

| 순서 | 범위 | 마감 |
|---|---|---|
| **1** | **세션 1개 완주** — 사진 업로드 → 분석 → 질문 5~7 → 이야기 생성 | W3 (9/10) |
| **2** | QR 페어링 + 전시 모드 UI | W3 말 |
| **3** | 폴백 + 키오스크 + 자동 초기화 | W4 |
| **4** | 프린트 출력 | W4 |
| 5 | 4컷 비동기 생성 | W5 이후 |
| 6 | 타임캡슐·아카이브 | **목업 허용** |
| 7 | 등불 스크린 | W5~W6 |

> **1번이 늦어지면 촬영이 밀리고, 촬영이 밀리면 편집이 밀리고, 10/8 검수를 못 맞춘다.**
> 1번만큼은 다른 무엇보다 먼저.

---

## 10. 배포·운영

- **프리뷰 배포**로 매주 목요일 교수님께 링크 공유 (설치 없이 폰으로 확인 가능)
- 환경변수는 Vercel 대시보드. `NEXT_PUBLIC_` 접두사 **금지**
- 전시 당일용 **프로덕션 브랜치 고정** — 전시 중 배포하지 않는다
- 에러 로깅 최소한 (Vercel 기본 로그)
- ⚠️ **전시장 와이파이를 사전에 반드시 테스트.** 학교 망은 종종 외부 API를 막는다

---

## 11. 남은 결정

- [ ] LLM 제공자 (프롬프트 테스트 후)
- [ ] 이미지 생성 모델 (4컷)
- [ ] TTS 제공자 및 목소리
- [ ] 프린터 기종 및 용지 규격
- [ ] 전시 태블릿 대수
- [ ] 도메인 (`hwiseo.xyz` 등)
