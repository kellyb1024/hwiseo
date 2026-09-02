import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-opus-5';
export const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY);

let _client = null;
export function client() {
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * 사진 + 대화 이력으로 다음 발화를 생성한다.
 * 사진과 시스템 프롬프트는 매 턴 반복되므로 프롬프트 캐싱을 켠다.
 */
export async function generate({ system, photo, history, instruction, maxTokens = 700, effort = 'medium' }) {
  const first = [];
  if (photo) {
    first.push({
      type: 'image',
      source: { type: 'base64', media_type: photo.mediaType, data: photo.data },
    });
  }
  first.push({ type: 'text', text: instruction });

  const messages = [{ role: 'user', content: first }, ...history];

  const res = await client().beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort },
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages,
  });

  if (res.stop_reason === 'refusal') {
    return { text: null, refused: true };
  }
  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return { text, refused: false, usage: res.usage };
}
