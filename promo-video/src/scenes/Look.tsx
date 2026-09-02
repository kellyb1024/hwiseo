import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChalkDefs} from '../components/Chalk';
import {theme} from '../theme';

/* 파트별 룩 프레임 — 방향 확정용 정지 화면 5장 */

const Paper: React.FC<{seed: number; o?: number}> = ({seed, o = 0.07}) => (
  <>
    <filter id="paperL">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={4} seed={seed} />
      <feColorMatrix type="matrix" values={`0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 ${o} 0`} />
    </filter>
    <rect width={1280} height={720} filter="url(#paperL)" />
  </>
);

const Sub: React.FC<{text: string; light?: boolean}> = ({text, light}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: 900, padding: '10px 22px', borderRadius: 4,
      background: light ? 'rgba(60,40,30,0.10)' : 'rgba(16,13,22,0.55)',
      color: light ? '#3B2A22' : theme.color.chalk, fontFamily: theme.font.sans, fontSize: 26, lineHeight: 1.5,
      textAlign: 'center', wordBreak: 'keep-all'}}>{text}</div>
  </div>
);

const Tag: React.FC<{text: string; x: number; y: number; w: number}> = ({text, x, y, w}) => (
  <g>
    <rect x={x} y={y} width={w} height={56} rx={4} fill="#2B3446" stroke="#B3A5DC" strokeWidth={2} />
    <rect x={x} y={y} width={6} height={56} rx={2} fill="#B3A5DC" />
    <text x={x + 22} y={y + 37} fill="#DDE6F2" fontFamily={theme.font.mono} fontSize={26} letterSpacing={1}>{text}</text>
  </g>
);

/* ── P1 · 과거 — 분필 드로잉 (오프너, 유지) + 세피아 종이 ── */
export const LookP1: React.FC = () => {
  const seed = 7;
  return (
    <AbsoluteFill style={{backgroundColor: '#15110E'}}>
      <svg width={1280} height={720}>
        <ChalkDefs seed={seed} glow={0.08} />
        <rect width={1280} height={720} filter="url(#paper)" />
        <g filter="url(#glow)"><g filter="url(#chalk)">
          <path d="M120,560 C400,548 880,548 1160,560" fill="none" stroke="#EFE6D8" strokeWidth={5} strokeLinecap="round" />
          <path d="M520,372 L790,360 L798,522 L528,534 Z" fill="#EFE6D8" fillOpacity={0.08} stroke="#EFE6D8" strokeWidth={5} strokeLinejoin="round" />
          <path d="M546,394 L764,384 L770,500 L552,510 Z" fill="none" stroke="#EFE6D8" strokeWidth={3} opacity={0.7} />
          <path d="M330,600 C340,540 372,500 420,470 C432,462 450,470 448,486 C446,500 438,510 428,520 C452,506 476,498 494,500 C506,502 508,516 496,524 C478,536 460,548 450,560 C438,580 430,600 426,620" fill="none" stroke="#EFE6D8" strokeWidth={5} strokeLinecap="round" />
          <path d="M950,600 C940,540 908,500 860,470 C848,462 830,470 832,486 C834,500 842,510 852,520 C828,506 804,498 786,500 C774,502 772,516 784,524 C802,536 820,548 830,560 C842,580 850,600 854,620" fill="none" stroke="#EFE6D8" strokeWidth={5} strokeLinecap="round" />
          {/* 말풍선 — 세피아 톤 하나로 온기 */}
          {[[300, 178, 170, 78], [820, 150, 190, 82], [560, 110, 160, 70]].map(([x, y, w, h], i) => (
            <g key={i}>
              <path fill="#C9A27A" fillOpacity={0.22} stroke="#C9A27A" strokeWidth={4} strokeLinejoin="round"
                d={`M${x + 18},${y} H${x + w - 18} Q${x + w},${y} ${x + w},${y + 18} V${y + h - 18} Q${x + w},${y + h} ${x + w - 18},${y + h} H${x + 54} L${x + 36},${y + h + 22} L${x + 40},${y + h} H${x + 18} Q${x},${y + h} ${x},${y + h - 18} V${y + 18} Q${x},${y} ${x + 18},${y} Z`} />
            </g>
          ))}
        </g></g>
      </svg>
      <Sub text="우리는 한 장을 아껴 찍고, 인화를 기다렸으며, 모여 앉아 그 사진에 대해 떠들었죠." />
    </AbsoluteFill>
  );
};

/* ── P2 · 데이터 — 차가운 청회, 플랫 UI, 분필 없음 ── */
export const LookP2: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #1B2230 0%, #141A26 100%)'}}>
    <svg width={1280} height={720}>
      <Paper seed={3} o={0.05} />
      {/* 데이터 바다 — 격자 픽셀 */}
      {Array.from({length: 26 * 6}).map((_, i) => {
        const c = i % 26, r = Math.floor(i / 26);
        const h = 0.3 + ((i * 37) % 11) / 16;
        return <rect key={i} x={140 + c * 39} y={470 + r * 34} width={22} height={22} rx={2}
          fill="#8FB3D9" opacity={h * (1 - r / 7)} />;
      })}
      {/* 사진 카드 — 플랫 */}
      <rect x={392} y={150} width={496} height={300} rx={8} fill="#232C3C" stroke="#3B4761" strokeWidth={2} />
      <rect x={420} y={178} width={440} height={200} rx={4} fill="#2E3A4F" />
      <circle cx={640} cy={260} r={36} fill="#3B4761" />
      <path d="M560,378 q0 -60 80 -60 q80 0 80 60" fill="#3B4761" />
      {/* 스캔 라인 */}
      <line x1={420} y1={300} x2={860} y2={300} stroke="#B3A5DC" strokeWidth={2} opacity={0.8} />
      <rect x={420} y={300} width={440} height={30} fill="#B3A5DC" opacity={0.08} />
      {/* 라벨 */}
      <Tag text="indoor" x={372} y={80} w={196} />
      <Tag text="person" x={590} y={80} w={206} />
      <Tag text="2015" x={818} y={80} w={150} />
      {/* 타겟 브래킷 */}
      {[[400, 158, 1, 1], [880, 158, -1, 1], [400, 442, 1, -1], [880, 442, -1, -1]].map(([x, y, dx, dy], k) => (
        <path key={k} d={`M${x},${y + dy * 18} V${y} H${x + dx * 18}`} fill="none" stroke="#B3A5DC" strokeWidth={3} />
      ))}
    </svg>
    <Sub text="기계는 사진 속 장소, 연도, 웃는 얼굴을 빠르고 정확하게 분류해 냅니다." />
  </AbsoluteFill>
);

/* ── P3 · 어둠 — 유일한 어둠. 채색된 촛불 캐릭터, 흰 실 ── */
export const LookP3: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#100D16'}}>
    <svg width={1280} height={720}>
      <ChalkDefs seed={11} glow={0.3} />
      <rect width={1280} height={720} filter="url(#paper)" />
      <defs>
        <radialGradient id="cglow">
          <stop offset="0%" stopColor="#B3A5DC" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#B3A5DC" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={640} cy={300} r={300} fill="url(#cglow)" />
      <g filter="url(#chalk)">
        <path d="M300,560 Q380,470 460,540 Q520,600 600,520 Q660,460 700,540 Q740,610 820,540 Q900,470 980,560 Q940,620 860,590 Q780,560 720,610 Q660,660 600,600 Q540,540 460,600 Q380,650 300,560 Z"
          fill="none" stroke="#EFEAF2" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      </g>
      {/* 촛불 캐릭터 — 스펙: 각진 원통 + 촛농 3갈래 + 보라 불꽃/노란 코어, 자주 아웃라인 */}
      <g transform="translate(640 250) scale(1.15)">
        <path d="M-50,-40 L-50,90 Q-50,102 -38,102 L38,102 Q50,102 50,90 L50,-40 Q0,-58 -50,-40 Z" fill="#EFEAF2" stroke="#3B2F4A" strokeWidth={4} strokeLinejoin="round" />
        <path d="M-50,-40 Q0,-22 50,-40" fill="none" stroke="#3B2F4A" strokeWidth={3} opacity={0.5} />
        <path d="M-48,-34 Q-42,-6 -32,8 Q-26,16 -20,6 Q-14,-6 -12,-34 Z" fill="#D8D0E4" stroke="#3B2F4A" strokeWidth={4} strokeLinejoin="round" />
        <path d="M12,-38 Q14,-14 20,-4 Q26,4 30,-6 Q34,-18 36,-38 Z" fill="#D8D0E4" stroke="#3B2F4A" strokeWidth={4} strokeLinejoin="round" />
        <path d="M-6,-40 Q-4,-26 0,-22 Q4,-18 6,-40 Z" fill="#D8D0E4" stroke="#3B2F4A" strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={-16} cy={40} rx={8} ry={11} fill="#FFD34A" />
        <ellipse cx={16} cy={40} rx={8} ry={11} fill="#FFD34A" />
        <path d="M-8,62 Q0,68 8,62" fill="none" stroke="#3B2F4A" strokeWidth={3} strokeLinecap="round" />
        <path d="M0,-54 L0,-68" stroke="#3B2F4A" strokeWidth={4} strokeLinecap="round" />
        <path d="M0,-134 C20,-110 28,-90 24,-76 C20,-64 4,-62 0,-62 C-4,-62 -20,-64 -24,-76 C-28,-90 -20,-110 0,-134 Z" fill="#B3A5DC" stroke="#3B2F4A" strokeWidth={4} strokeLinejoin="round" />
        <path d="M0,-110 C8,-98 12,-88 10,-80 C8,-72 2,-70 0,-70 C-2,-70 -8,-72 -10,-80 C-12,-88 -8,-98 0,-110 Z" fill="#FFD34A" />
      </g>
      <text x={300} y={270} textAnchor="middle" fontFamily={theme.font.serif} fontSize={190} fontWeight={500} fill="none" stroke="#B3A5DC" strokeWidth={5} filter="url(#glow)">輝</text>
    </svg>
    <Sub text="빛날 휘(輝). 어둠 속 잠든 기억 곁에 촛불을 켜, 그 시간을 따뜻하게 밝히는 것." />
  </AbsoluteFill>
);

/* ── P4 · 敍 — 따뜻한 크림 종이. 면으로 채운 인물, 금색 시선 ── */
export const LookP4: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #F3E6D0 0%, #E9D3B3 100%)'}}>
    <svg width={1280} height={720}>
      <Paper seed={5} o={0.09} />
      {/* 부모의 시선 — 금색 호 */}
      {[0, 1, 2, 3].map((i) => {
        const r = 190 + i * 70;
        return <path key={i} d={`M${640 - r},${440 + i * 10} C${640 - r},${110 - i * 30} ${640 + r},${110 - i * 30} ${640 + r},${440 + i * 10}`}
          fill="none" stroke="#E9A24A" strokeWidth={6 - i} strokeLinecap="round" opacity={0.85 - i * 0.18} />;
      })}
      {/* 바닥 */}
      <path d="M0,600 Q640,570 1280,600 L1280,720 L0,720 Z" fill="#D9BE96" />
      {/* 꼬마 — 면 */}
      <g transform="translate(420 330) scale(0.95)">
        <circle cx={0} cy={40} r={38} fill="#F4C48F" stroke="#5A3A2A" strokeWidth={4} />
        <path d="M-30,96 C-24,84 -8,80 0,80 C8,80 24,84 30,96 L36,200 L-36,200 Z" fill="#E9A24A" stroke="#5A3A2A" strokeWidth={4} strokeLinejoin="round" />
        <path d="M-14,44 Q-8,38 -2,44 M4,44 Q10,38 16,44 M-10,60 Q0,70 10,60" fill="none" stroke="#5A3A2A" strokeWidth={3} strokeLinecap="round" />
        <path d="M-38,20 Q0,-14 38,20" fill="#5A3A2A" />
      </g>
      {/* 어른 — 면 */}
      <g transform="translate(860 250) scale(1.05)">
        <circle cx={0} cy={46} r={42} fill="#F4C48F" stroke="#5A3A2A" strokeWidth={4} />
        <path d="M-52,120 C-40,98 -14,92 0,92 C14,92 40,98 52,120 L60,300 L-60,300 Z" fill="#B3A5DC" stroke="#5A3A2A" strokeWidth={4} strokeLinejoin="round" />
        <path d="M-16,50 Q-10,44 -4,50 M6,50 Q12,44 18,50 M-8,70 Q0,76 8,70" fill="none" stroke="#5A3A2A" strokeWidth={3} strokeLinecap="round" />
        <path d="M-42,24 Q0,-10 42,24 L42,40 Q0,20 -42,40 Z" fill="#5A3A2A" />
      </g>
      <text x={300} y={200} textAnchor="middle" fontFamily={theme.font.serif} fontSize={150} fontWeight={600} fill="#C8862E" opacity={0.9}>敍</text>
    </svg>
    <Sub text="프레임 너머 나를 향했던 부모님의 시선은 내가 얼마나 사랑스러운 존재였는지를 다시 한번 일깨워 줍니다." light />
  </AbsoluteFill>
);

/* ── P5 · 빛 — 밝은 골드. 불씨가 파동으로, 타이틀 ── */
export const LookP5: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #FFF3D6 0%, #F6DDA8 45%, #E9B96E 100%)'}}>
    <svg width={1280} height={720}>
      <Paper seed={9} o={0.08} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={640} cy={330} r={90 + i * 95} fill="none" stroke="#E9A24A" strokeWidth={3 - i * 0.4} opacity={0.5 - i * 0.09} />
      ))}
      <circle cx={640} cy={330} r={34} fill="#FFDCA8" />
      <circle cx={640} cy={330} r={12} fill="#FFF7E6" />
      {/* 잊혔던 감각들 — 작은 픽토그램이 파동 위에서 피어남 */}
      {[[420, 250, '♪'], [860, 260, '☼'], [500, 470, '❀'], [790, 460, '☂']].map(([x, y, ch], i) => (
        <text key={i} x={x as number} y={y as number} textAnchor="middle" fontSize={40} fill="#C8862E" opacity={0.85}>{ch as string}</text>
      ))}
      <text x={640} y={620} textAnchor="middle" fontFamily={theme.font.serif} fontSize={72} fontWeight={600} fill="#3B2F4A" letterSpacing={14}>輝敍</text>
      <text x={640} y={664} textAnchor="middle" fontFamily={theme.font.serif} fontSize={20} fill="#3B2F4A" letterSpacing={12} opacity={0.7}>HWISEO</text>
    </svg>
  </AbsoluteFill>
);

export const _f = () => { useCurrentFrame(); useVideoConfig(); };
