// 사용량 기록 (대화 내용은 저장하지 않음, 숫자만)
const { cmd } = require('./_redis');
// 1M 토큰당 달러 [입력, 출력]
const PRICE = { 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5], 'claude-opus-5-5': [4, 20] };
const dayKST = (d = new Date()) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
async function record(kind, model, usage, ok) {
  try {
    const u = usage || {}, inT = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0), outT = u.output_tokens || 0;
    const p = PRICE[model] || PRICE['claude-sonnet-5-5'];
    const micro = Math.round(inT * p[0] + outT * p[1]); // 백만분의 1달러
    const f = { calls: 1, in_tok: inT, out_tok: outT, micro, ['k_' + kind]: 1 };
    if (!ok) f.errors = 1;
    for (const key of ['hw:stats:total', 'hw:stats:day:' + dayKST()]) for (const [k, v] of Object.entries(f)) if (v) await cmd('HINCRBY', key, k, v);
    await cmd('LPUSH', 'hw:stats:recent', JSON.stringify({ t: Date.now(), kind, model, in: inT, out: outT, ok: !!ok }));
    await cmd('LTRIM', 'hw:stats:recent', 0, 59);
  } catch (e) { /* 기록 실패는 체험에 영향 주지 않음 */ }
}
module.exports = { record, dayKST, PRICE };
