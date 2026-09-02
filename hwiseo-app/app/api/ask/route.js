import { NextResponse } from 'next/server';
import { generate, hasKey } from '@/lib/claude';
import { systemFor, FIRST_TURN, MOCK, PROMPT_VERSION } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { photo, history = [], lang = 'ko', nickname = '' } = await req.json();
    if (!photo?.data) {
      return NextResponse.json({ error: 'photo required' }, { status: 400 });
    }

    // 목 모드 — API 키가 없어도 시연은 돌아가야 한다
    if (!hasKey()) {
      const bank = MOCK[lang] || MOCK.ko;
      const turn = history.filter((m) => m.role === 'assistant').length;
      await new Promise((r) => setTimeout(r, 900));
      return NextResponse.json({
        text: bank[Math.min(turn, bank.length - 1)],
        mock: true,
        promptVersion: PROMPT_VERSION,
      });
    }

    const instruction =
      history.length === 0
        ? FIRST_TURN
        : '대화를 이어가세요. 규칙을 지켜 질문 하나를 던지세요.';

    const { text, refused } = await generate({
      system: systemFor(lang, nickname),
      photo,
      history,
      instruction,
    });

    if (refused || !text) {
      return NextResponse.json({ error: 'refused' }, { status: 502 });
    }
    return NextResponse.json({ text, mock: false, promptVersion: PROMPT_VERSION });
  } catch (e) {
    console.error('[ask]', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
