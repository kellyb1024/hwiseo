// 대시보드용 숫자. ADMIN_PASS 비밀번호가 맞아야만 응답
const crypto = require('crypto');
const { cmd } = require('./_redis');
const { dayKST } = require('./_stats');
const { MODEL } = require('./_claude');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const obj = (arr) => { const o = {}; for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = +arr[i + 1]; return o; };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const pass = process.env.ADMIN_PASS;
  if (!pass) return res.status(503).json({ error: 'no-pass' });
  if (!same(req.headers['x-admin-pass'] || '', pass)) { await new Promise(r => setTimeout(r, 800)); return res.status(401).json({ error: 'wrong' }); }
  try {
    const days = [];
    for (let i = 7; i >= 0; i--) days.push(dayKST(new Date(Date.now() - i * 864e5)));
    const total = obj(await cmd('HGETALL', 'hw:stats:total'));
    const perDay = [];
    for (const d of days) perDay.push({ day: d, ...obj(await cmd('HGETALL', 'hw:stats:day:' + d)) });
    const recent = ((await cmd('LRANGE', 'hw:stats:recent', 0, 29)) || []).map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
    res.json({ model: MODEL, budget: 100, today: dayKST(), total, perDay, recent, now: Date.now() });
  } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
