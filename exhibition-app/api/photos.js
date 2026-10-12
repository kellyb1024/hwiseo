// 아이패드 → 사진 받기(GET) / 지우기(DELETE)
const { cmd, okSid } = require('./_redis');
module.exports = async (req, res) => {
  const s = req.query.s;
  if (!okSid(s)) return res.status(400).json({ error: 'bad sid' });
  const key = 'hw:' + s;
  try {
    if (req.method === 'DELETE') { await cmd('DEL', key, key + ':done'); return res.json({ ok: true }); }
    const done = await cmd('GET', key + ':done');
    if (!done) return res.json({ done: false });
    const imgs = await cmd('LRANGE', key, 0, 2);
    await cmd('DEL', key, key + ':done');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ done: true, imgs });
  } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
