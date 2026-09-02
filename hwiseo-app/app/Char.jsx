'use client';

/**
 * 휘서 캐릭터
 *
 * 원본: design/character/hwiseo-character-v1.png (사용자 작업)
 *  · public/character.png        불이 켜진 상태 — 눈을 뜨고 있다
 *  · public/character-unlit.png  꺼진 상태 — 눈을 감고 심지만 남는다
 *    (원본에서 불꽃을 지우고 눈을 감긴 자동 생성본.
 *     같은 화풍으로 직접 그린 그림이 생기면 이 파일만 갈아끼우면 된다)
 *
 * level 은 아직 쓰지 않는다 — 불꽃이 자라는 단계 그림이 준비되면 그때 연결한다.
 */
export default function Char({ size = 120, level = 1, lit = true, className = '', style = {}, src }) {
  // src 를 주면 그 그림을 쓴다 (픽셀 테마: /character.svg — 꺼진 상태는 CSS 필터로)
  return (
    <img
      className={className}
      src={src || (lit ? '/character.png' : '/character-unlit.png')}
      data-lit={lit}
      alt="휘서"
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain', ...style }}
      data-level={level}
    />
  );
}
