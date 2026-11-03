// 휘서 VO 생성 — fish.audio TTS로 25컷 wav를 만든다.
// 사용: FISH_KEY=xxx FISH_VOICE=voice_model_id node tools/fish-vo.mjs [--speed 1.0] [--model s2.1-pro] [--only C13,C24]
import {readFileSync, mkdirSync, writeFileSync} from 'fs';
import {execFileSync} from 'child_process';
import {resolve, dirname} from 'path';
import {fileURLToPath} from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.FISH_KEY, VOICE = process.env.FISH_VOICE;
if (!KEY) { console.error('FISH_KEY 없음'); process.exit(1); }
if (!VOICE) { console.error('FISH_VOICE 없음 (fish.audio에서 만든 목소리 모델 id)'); process.exit(1); }

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i+1] : d; };
const SPEED = parseFloat(arg('--speed', '1.0'));
const MODEL = arg('--model', 's2.1-pro-free');   // 기본은 무료 모델. 유료는 --model s2.1-pro 로 명시해야만 쓰임
const ONLY  = (arg('--only', '') || '').split(',').filter(Boolean);
const OUTDIR = arg('--out', 'vo-fish');
// 대사 덮어쓰기 — cuts.ts는 그대로 두고 TTS용으로만 줄인 문장
const OVR = JSON.parse(readFileSync(`${ROOT}/tools/vo-script-tts.json`, 'utf8'));

// 발음 교정 — CMU Arpabet. cuts.ts는 그대로 두고 여기서만 치환한다.
// 긴 단어 먼저 치환되도록 길이순 정렬.
const PRON = {
  'Hwiseo': 'HH W IY1 S AH0',   // 휘서
  'Hwi':    'HH W IY1',          // 휘 (輝)
  'Seo':    'S AH1',             // 서 (敍)
};
const applyPron = (t) => Object.keys(PRON)
  .sort((a, b) => b.length - a.length)
  .reduce((s, w) => s.replace(new RegExp(`\\b${w}\\b`, 'g'),
    `<|phoneme_start|>${PRON[w]}<|phoneme_end|>`), t);

const src = readFileSync(`${ROOT}/promo-video/src/cuts.ts`, 'utf8');
const re = /\{id: '(C\d\d)', part: '(P\d)', vo: '([^']+)', start: \d+, voFrames: (\d+),[\s\S]*?en: '((?:[^'\\]|\\.)*)'/g;
const cuts = [];
let m; while ((m = re.exec(src))) cuts.push({id:m[1], part:m[2], vo:m[3], oldF:+m[4], en: OVR[m[1]] || m[5].replace(/\\'/g,"'")});

const OUT = `${ROOT}/${OUTDIR}`;
mkdirSync(OUT, {recursive:true});
const targets = ONLY.length ? cuts.filter(c => ONLY.includes(c.id)) : cuts;
console.log(`${targets.length}컷 생성 · model=${MODEL}${MODEL.endsWith('-free') ? ' (무료)' : ' ⚠️ 유료'} · speed=${SPEED}\n`);

const report = [];
for (const c of targets) {
  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', model: MODEL},
    body: JSON.stringify({
      text: applyPron(c.en), reference_id: VOICE,
      format: 'wav', sample_rate: 44100,
      prosody: {speed: SPEED, volume: 0, normalize_loudness: true},
      temperature: 0.7, normalize: true,
    }),
  });
  if (!res.ok) { console.error(`${c.id} 실패 ${res.status}: ${(await res.text()).slice(0,200)}`); continue; }
  const raw = `${OUT}/_raw.wav`, dst = `${OUT}/${c.vo}`;
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  // 기존 파이프라인과 동일하게 44.1k 모노 16bit로 정규화
  execFileSync('ffmpeg', ['-v','error','-y','-i',raw,'-ac','1','-ar','44100','-c:a','pcm_s16le',dst]);
  const sec = parseFloat(execFileSync('ffprobe',
    ['-v','error','-show_entries','format=duration','-of','csv=p=0',dst]).toString().trim());
  const f = Math.ceil(sec * 30), d = f - c.oldF;
  report.push({id:c.id, sec, f, old:c.oldF, d});
  console.log(`  ${c.id}  ${sec.toFixed(2)}s  voFrames ${f}  (기존 ${c.oldF}, ${d>=0?'+':''}${d})`);
}
const tot = report.reduce((a,b)=>a+b.f,0), oldTot = report.reduce((a,b)=>a+b.old,0);
console.log(`\nVO 합계 ${(tot/30).toFixed(1)}s (기존 ${(oldTot/30).toFixed(1)}s, ${tot-oldTot>=0?'+':''}${((tot-oldTot)/30).toFixed(1)}s)`);
writeFileSync(`${OUT}/_measure.json`, JSON.stringify(report, null, 2));
console.log(`→ ${OUT} · 실측값은 _measure.json`);
