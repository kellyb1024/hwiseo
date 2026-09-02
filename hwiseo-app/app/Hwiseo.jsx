'use client';

/**
 * 휘서 캐릭터 — 대화가 진행될수록 불꽃이 자란다.
 *
 * 불을 켜는 것은 휘서가 아니라 사람의 기억이다.
 * level 0 = 아직 꺼져 있음 / 1~3 = 답할 때마다 자란다 / 4 = 이야기가 완성됨
 *
 * 형태 규칙 (design/character-spec.md):
 *  - 목·허리 없음. 상체 전체가 하나의 왁스 덩어리
 *  - 머리가 몸통보다 넓어지지 않는다
 *  - 촛농 갈래는 서로 떨어져 있다 (붙으면 단발머리로 읽힌다)
 *  - 팔은 높은 위치에 붙이고 살짝 아래로
 *  - 다리 없음. 밑단이 바닥에 닿아 실루엣을 닫는다
 *  - 평면 채색만. 그라데이션·그림자·글로우 없음
 */

const WAX = '#F4EFF8';
const WAX_2 = '#DDD4EA';
const LINE = '#3B2F4A';
const PURPLE = '#B3A5DC';
const YELLOW = '#FFD54A';

export default function Hwiseo({ level = 0, size = 120, className = '' }) {
  const L = Math.max(0, Math.min(4, level));

  // 불꽃 크기 단계
  const flame = [
    null,
    { h: 13, w: 9, y: 30 },
    { h: 20, w: 12, y: 23 },
    { h: 28, w: 15, y: 15 },
    { h: 34, w: 18, y: 9 },
  ][L];

  return (
    <svg
      className={className}
      width={size}
      height={size * 1.18}
      viewBox="0 0 100 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`휘서 (불꽃 ${L}단계)`}
    >
      {/* 빛무리 — 마지막 단계에만, 평면 원 두 개 */}
      {L >= 4 && (
        <>
          <circle cx="50" cy={flame.y + flame.h / 2} r="30" fill={YELLOW} opacity=".16" />
          <circle cx="50" cy={flame.y + flame.h / 2} r="20" fill={YELLOW} opacity=".2" />
        </>
      )}

      {/* 몸통 — 각진 원통. 목도 허리도 없다 */}
      <rect x="29" y="46" width="42" height="62" rx="7" fill={WAX} stroke={LINE} strokeWidth="3" />

      {/* 팔 — 높은 위치, 살짝 아래로 */}
      <path d="M29 62 L20 70" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M71 62 L80 70" stroke={LINE} strokeWidth="3" strokeLinecap="round" />

      {/* 촛농 밑단 — 바닥에 닿아 실루엣을 닫는다 */}
      <path
        d="M25 108 Q30 99 36 106 Q42 98 50 105 Q58 98 64 106 Q70 99 75 108 Z"
        fill={WAX_2}
        stroke={LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 촛농 앞머리 — 갈래는 서로 떨어져 있고 길이가 제각각 */}
      <path d="M33 47 Q33 60 37 61 Q41 60 41 47 Z" fill={WAX_2} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M45 46 Q45 66 49 67 Q53 66 53 46 Z" fill={WAX_2} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M58 47 Q58 57 61 58 Q64 57 64 47 Z" fill={WAX_2} stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />

      {/* 심지 */}
      <path d="M50 46 L50 39" stroke={LINE} strokeWidth="3" strokeLinecap="round" />

      {/* 불꽃 — 얼굴은 없다. 표정은 불꽃이 대신한다 */}
      {flame && (
        <>
          <path
            d={`M50 ${flame.y}
                C ${50 + flame.w} ${flame.y + flame.h * 0.42},
                  ${50 + flame.w * 0.72} ${flame.y + flame.h},
                  50 ${flame.y + flame.h}
                C ${50 - flame.w * 0.72} ${flame.y + flame.h},
                  ${50 - flame.w} ${flame.y + flame.h * 0.42},
                  50 ${flame.y} Z`}
            fill={PURPLE}
            stroke={LINE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d={`M50 ${flame.y + flame.h * 0.34}
                C ${50 + flame.w * 0.44} ${flame.y + flame.h * 0.64},
                  ${50 + flame.w * 0.3} ${flame.y + flame.h * 0.94},
                  50 ${flame.y + flame.h * 0.94}
                C ${50 - flame.w * 0.3} ${flame.y + flame.h * 0.94},
                  ${50 - flame.w * 0.44} ${flame.y + flame.h * 0.64},
                  50 ${flame.y + flame.h * 0.34} Z`}
            fill={YELLOW}
          />
        </>
      )}

      {/* 꺼져 있을 때 — 연기 한 줄기 */}
      {L === 0 && (
        <path
          d="M50 36 Q45 30 50 25 Q55 20 50 14"
          stroke={LINE}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity=".35"
          fill="none"
        />
      )}
    </svg>
  );
}
