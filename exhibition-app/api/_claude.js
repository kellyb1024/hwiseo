// Claude 호출 (서버에서만 키 사용)
const sdk = require('@anthropic-ai/sdk');
const Anthropic = sdk.default || sdk;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수 사용
async function claude(system, messages, maxTokens) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY 없음');
  const r = await client.messages.create({
    model: MODEL, max_tokens: maxTokens || 300, system, messages,
    output_config: { effort: 'low' },
  });
  if (r.stop_reason === 'refusal') throw new Error('refusal');
  if (r.stop_reason === 'max_tokens') throw new Error('cut off');
  return r.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
}
module.exports = { claude };
