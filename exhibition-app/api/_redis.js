// Upstash Redis (Vercel 마켓플레이스 연동 시 환경변수 자동 생성)
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function cmd(...args) {
  if (!URL_ || !TOKEN) throw new Error('Redis 환경변수 없음');
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const okSid = s => /^[a-z0-9]{8}$/.test(s || '');
module.exports = { cmd, okSid };
