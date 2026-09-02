import { NextResponse } from 'next/server';
import { generate, hasKey } from '@/lib/claude';
import { systemFor, COMPOSE, MOCK } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

function parse(raw) {
  const one = raw.match(/ONELINE:\s*(.+)/i)?.[1]?.trim() || '';
  const story = raw.split(/STORY:\s*/i)[1]?.trim() || raw.trim();
  return { oneline: one, story };
}

export async function POST(req) {
  try {
    const { photo, history = [], lang = 'ko', nickname = '' } = await req.json();

    if (!hasKey()) {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json({ ...(MOCK.compose[lang] || MOCK.compose.ko), mock: true });
    }

    const { text, refused } = await generate({
      system: systemFor(lang, nickname),
      photo,
      history: [...history, { role: 'user', content: COMPOSE }],
      instruction: '이 사진으로 대화를 나눴습니다.',
      maxTokens: 1200,
      effort: 'high',
    });

    if (refused || !text) {
      return NextResponse.json({ error: 'refused' }, { status: 502 });
    }
    return NextResponse.json({ ...parse(text), mock: false });
  } catch (e) {
    console.error('[compose]', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
