// 스티커 뒷면 한 줄 (색인)
const { claude } = require('./_claude');
const TPL = "아래 대화를 보고 스티커 뒷면에 적을 한 줄을 써.\n이건 이야기가 아니라 '색인'이야. 나중에 이 사진이 무슨 날이었는지 알아보게 하는 정도면 돼.\n\n- 짧게. 20자 이내(영어는 8단어 이내)의 짧은 구절. 끝에 마침표(.)를 찍지 마.\n- 사용자가 실제로 말한 사실만. 새로 지어내거나 꾸미지 마.\n- 숫자, 판단, 감정 평가(\"행복했던\", \"소중한\") 쓰지 마. 대신 대화의 분위기는 단어 선택으로만 살려.\n- 주어는 생략하거나 사진 속 대상으로. \"나는/사용자는\" 쓰지 마.\n- {lang}으로 써. 한 줄만 출력해.\n\n예) 추석에 한복 입은 밀크티\n예) Milk Tea in a hanbok, Chuseok\n\n대화:\n{conversation}";
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { lang = 'ko', msgs = [] } = req.body || {};
    const conv = msgs.map(x => (x.who === 'u' ? '사용자: ' : '휘서: ') + x.text).join('\n');
    const prompt = TPL.replace('{lang}', lang === 'en' ? '영어' : '한국어').replace('{conversation}', conv);
    let text = await claude('너는 짧은 색인 문구를 쓰는 도우미야.', [{ role: 'user', content: prompt }], 1000);
    text = text.split('\n')[0].replace(/^["'“”]+|["'“”]+$/g, '').replace(/[.。]$/, '');
    res.json({ text });
  } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
