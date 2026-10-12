// 폰 → 사진 올리기. 최대 3장, 30분 뒤 자동 삭제
const { cmd, okSid } = require('./_redis');
module.exports = async (req, res) => {
  const s = req.query.s;
  if (req.method !== 'POST' || !okSid(s)) return res.status(400).json({ error: 'bad request' });
  try {
    const key = 'hw:' + s;
    if (req.query.done) { await cmd('SET', key + ':done', '1', 'EX', 1800); return res.json({ ok: true }); }
    const img = (req.body && req.body.img) || '';
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(img) || img.length > 3000000) return res.status(400).json({ error: 'bad image' });
    const n = await cmd('LLEN', key);
    if (n >= 3) return res.status(409).json({ error: 'full' });
    await cmd('RPUSH', key, img); await cmd('EXPIRE', key, 1800);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
