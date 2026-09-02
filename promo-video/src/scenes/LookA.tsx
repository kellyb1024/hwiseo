import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ChalkDefs} from '../components/Chalk';
import {theme} from '../theme';

/* A안 — 분필 선화를 끝까지 유지하되, 파트마다 종이색·분필색·채움(해칭)이 바뀐다 */

const Sub: React.FC<{text: string; dark?: boolean}> = ({text, dark}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: 900, padding: '10px 22px', borderRadius: 4,
      background: dark ? 'rgba(40,28,20,0.18)' : 'rgba(0,0,0,0.38)',
      color: dark ? '#2B1D16' : '#F4EFE6', fontFamily: theme.font.sans, fontSize: 26, lineHeight: 1.5,
      textAlign: 'center', wordBreak: 'keep-all'}}>{text}</div>
  </div>
);

/** 분필 해칭 채움 — 면을 빗금으로 메운다 */
const Hatch: React.FC<{id: string; color: string; angle?: number; gap?: number}> = ({id, color, angle = -35, gap = 9}) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform={`rotate(${angle})`}>
    <line x1={0} y1={0} x2={0} y2={gap} stroke={color} strokeWidth={2.2} opacity={0.75} />
  </pattern>
);

const Board: React.FC<{bg: string; seed: number; glow?: number; children: React.ReactNode}> = ({bg, seed, glow = 0.08, children}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <svg width={1280} height={720}>
      <ChalkDefs seed={seed} glow={glow} />
      <rect width={1280} height={720} filter="url(#paper)" />
      {children}
    </svg>
  </AbsoluteFill>
);

/* P1 · 과거 — 어두운 세피아 칠판, 흰 분필 + 세피아 해칭 */
export const LookA1: React.FC = () => (
  <>
    <Board bg="#17120E" seed={7}>
      <defs><Hatch id="hSep" color="#C9A27A" /></defs>
      <g filter="url(#glow)"><g filter="url(#chalk)">
        <path d="M120,560 C400,548 880,548 1160,560" fill="none" stroke="#EFE6D8" strokeWidth={5} strokeLinecap="round" />
        <path d="M520,372 L790,360 L798,522 L528,534 Z" fill="url(#hSep)" stroke="#EFE6D8" strokeWidth={5} strokeLinejoin="round" />
        <path d="M546,394 L764,384 L770,500 L552,510 Z" fill="#17120E" stroke="#EFE6D8" strokeWidth={3} opacity={0.9} />
        <path d="M330,600 C340,540 372,500 420,470 C432,462 450,470 448,486 C446,500 438,510 428,520 C452,506 476,498 494,500 C506,502 508,516 496,524 C478,536 460,548 450,560 C438,580 430,600 426,620" fill="none" stroke="#EFE6D8" strokeWidth={5} strokeLinecap="round" />
        <path d="M950,600 C940,540 908,500 860,470 C848,462 830,470 832,486 C834,500 842,510 852,520 C828,506 804,498 786,500 C774,502 772,516 784,524 C802,536 820,548 830,560 C842,580 850,600 854,620" fill="none" stroke="#EFE6D8" strokeWidth={5} strokeLinecap="round" />
        {[[300, 178, 170, 78], [820, 150, 190, 82], [560, 110, 160, 70]].map(([x, y, w, h], i) => (
          <path key={i} fill="url(#hSep)" stroke="#C9A27A" strokeWidth={4} strokeLinejoin="round"
            d={`M${x + 18},${y} H${x + w - 18} Q${x + w},${y} ${x + w},${y + 18} V${y + h - 18} Q${x + w},${y + h} ${x + w - 18},${y + h} H${x + 54} L${x + 36},${y + h + 22} L${x + 40},${y + h} H${x + 18} Q${x},${y + h} ${x},${y + h - 18} V${y + 18} Q${x},${y} ${x + 18},${y} Z`} />
        ))}
      </g></g>
    </Board>
    <Sub text="우리는 한 장을 아껴 찍고, 인화를 기다렸으며, 모여 앉아 그 사진에 대해 떠들었죠." />
  </>
);

/* P2 · 데이터 — 차가운 청회 칠판, 하늘색·연보라 분필 */
export const LookA2: React.FC = () => (
  <>
    <Board bg="#1B2431" seed={3} glow={0.05}>
      <defs><Hatch id="hLav" color="#B3A5DC" angle={40} gap={7} /></defs>
      <g filter="url(#chalk)">
        {Array.from({length: 26 * 6}).map((_, i) => {
          const c = i % 26, r = Math.floor(i / 26);
          const h = 0.3 + ((i * 37) % 11) / 16;
          return <rect key={i} x={140 + c * 39} y={470 + r * 34} width={18} height={18} fill="none" stroke="#8FB3D9" strokeWidth={2.5} opacity={h * (1 - r / 7)} />;
        })}
        <path d="M392,150 L888,150 L888,450 L392,450 Z" fill="none" stroke="#DDE6F2" strokeWidth={4} strokeDasharray="14 10" opacity={0.8} />
        <circle cx={640} cy={260} r={36} fill="none" stroke="#DDE6F2" strokeWidth={4} opacity={0.7} />
        <path d="M560,378 q0 -60 80 -60 q80 0 80 60" fill="none" stroke="#DDE6F2" strokeWidth={4} opacity={0.7} />
        <line x1={420} y1={300} x2={860} y2={300} stroke="#B3A5DC" strokeWidth={3} />
        {[['indoor', 372, 196], ['person', 590, 206], ['2015', 818, 150]].map(([t, x, w], i) => (
          <g key={i}>
            <rect x={x as number} y={80} width={w as number} height={56} rx={3} fill="url(#hLav)" stroke="#B3A5DC" strokeWidth={3} />
            <text x={(x as number) + 22} y={117} fill="#EEF2FA" fontFamily={theme.font.mono} fontSize={26} letterSpacing={1}>{t}</text>
          </g>
        ))}
        {[[400, 158, 1, 1], [880, 158, -1, 1], [400, 442, 1, -1], [880, 442, -1, -1]].map(([x, y, dx, dy], k) => (
          <path key={k} d={`M${x},${y + dy * 18} V${y} H${x + dx * 18}`} fill="none" stroke="#B3A5DC" strokeWidth={3} />
        ))}
      </g>
    </Board>
    <Sub text="기계는 사진 속 장소, 연도, 웃는 얼굴을 빠르고 정확하게 분류해 냅니다." />
  </>
);

/* P3 · 어둠 — 보라 어둠, 분필 촛불에 연보라·노랑 분필 채움 */
export const LookA3: React.FC = () => (
  <>
    <Board bg="#100D16" seed={11} glow={0.3}>
      <defs>
        <Hatch id="hFl" color="#B3A5DC" angle={-60} gap={6} />
        <Hatch id="hWax" color="#EFEAF2" angle={90} gap={11} />
      </defs>
      <g filter="url(#chalk)">
        <path d="M300,560 Q380,470 460,540 Q520,600 600,520 Q660,460 700,540 Q740,610 820,540 Q900,470 980,560 Q940,620 860,590 Q780,560 720,610 Q660,660 600,600 Q540,540 460,600 Q380,650 300,560 Z"
          fill="none" stroke="#EFEAF2" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      </g>
      <g filter="url(#glow)"><g filter="url(#chalk)">
        <g transform="translate(640 250) scale(1.15)">
          <path d="M-50,-40 L-50,90 Q-50,102 -38,102 L38,102 Q50,102 50,90 L50,-40 Q0,-58 -50,-40 Z" fill="url(#hWax)" stroke="#EFEAF2" strokeWidth={4} strokeLinejoin="round" />
          <path d="M-48,-34 Q-42,-6 -32,8 Q-26,16 -20,6 Q-14,-6 -12,-34 Z M12,-38 Q14,-14 20,-4 Q26,4 30,-6 Q34,-18 36,-38 Z M-6,-40 Q-4,-26 0,-22 Q4,-18 6,-40 Z" fill="none" stroke="#EFEAF2" strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={-16} cy={40} rx={8} ry={11} fill="#FFD34A" />
          <ellipse cx={16} cy={40} rx={8} ry={11} fill="#FFD34A" />
          <path d="M-8,62 Q0,68 8,62" fill="none" stroke="#EFEAF2" strokeWidth={3} strokeLinecap="round" />
          <path d="M0,-54 L0,-68" stroke="#EFEAF2" strokeWidth={4} strokeLinecap="round" />
          <path d="M0,-134 C20,-110 28,-90 24,-76 C20,-64 4,-62 0,-62 C-4,-62 -20,-64 -24,-76 C-28,-90 -20,-110 0,-134 Z" fill="url(#hFl)" stroke="#B3A5DC" strokeWidth={4} strokeLinejoin="round" />
          <path d="M0,-110 C8,-98 12,-88 10,-80 C8,-72 2,-70 0,-70 C-2,-70 -8,-72 -10,-80 C-12,-88 -8,-98 0,-110 Z" fill="#FFD34A" />
        </g>
        <text x={300} y={270} textAnchor="middle" fontFamily={theme.font.serif} fontSize={190} fontWeight={500} fill="none" stroke="#B3A5DC" strokeWidth={5}>輝</text>
      </g></g>
    </Board>
    <Sub text="빛날 휘(輝). 어둠 속 잠든 기억 곁에 촛불을 켜, 그 시간을 따뜻하게 밝히는 것." />
  </>
);

/* P4 · 敍 — 따뜻한 갈색 칠판, 크림 분필 + 앰버·연보라 해칭 */
export const LookA4: React.FC = () => (
  <>
    <Board bg="#3A2A22" seed={5} glow={0.14}>
      <defs>
        <Hatch id="hAm" color="#E9A24A" angle={-35} gap={8} />
        <Hatch id="hLv" color="#B3A5DC" angle={35} gap={8} />
        <Hatch id="hSk" color="#F4C48F" angle={0} gap={7} />
      </defs>
      <g filter="url(#glow)"><g filter="url(#chalk)">
        {[0, 1, 2, 3].map((i) => {
          const r = 190 + i * 70;
          return <path key={i} d={`M${640 - r},${440 + i * 10} C${640 - r},${110 - i * 30} ${640 + r},${110 - i * 30} ${640 + r},${440 + i * 10}`}
            fill="none" stroke="#E9A24A" strokeWidth={5} strokeLinecap="round" opacity={0.9 - i * 0.18} />;
        })}
        <path d="M120,620 C400,606 880,606 1160,620" fill="none" stroke="#F4EFE6" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        <g transform="translate(420 330) scale(0.95)">
          <circle cx={0} cy={40} r={38} fill="url(#hSk)" stroke="#F4EFE6" strokeWidth={4} />
          <path d="M-30,96 C-24,84 -8,80 0,80 C8,80 24,84 30,96 L36,200 L-36,200 Z" fill="url(#hAm)" stroke="#F4EFE6" strokeWidth={4} strokeLinejoin="round" />
          <path d="M-14,44 Q-8,38 -2,44 M4,44 Q10,38 16,44 M-10,60 Q0,70 10,60" fill="none" stroke="#F4EFE6" strokeWidth={3} strokeLinecap="round" />
        </g>
        <g transform="translate(860 250) scale(1.05)">
          <circle cx={0} cy={46} r={42} fill="url(#hSk)" stroke="#F4EFE6" strokeWidth={4} />
          <path d="M-52,120 C-40,98 -14,92 0,92 C14,92 40,98 52,120 L60,300 L-60,300 Z" fill="url(#hLv)" stroke="#F4EFE6" strokeWidth={4} strokeLinejoin="round" />
          <path d="M-16,50 Q-10,44 -4,50 M6,50 Q12,44 18,50 M-8,70 Q0,76 8,70" fill="none" stroke="#F4EFE6" strokeWidth={3} strokeLinecap="round" />
        </g>
        <text x={300} y={200} textAnchor="middle" fontFamily={theme.font.serif} fontSize={150} fontWeight={600} fill="none" stroke="#E9A24A" strokeWidth={5}>敍</text>
      </g></g>
    </Board>
    <Sub text="프레임 너머 나를 향했던 부모님의 시선은 내가 얼마나 사랑스러운 존재였는지를 다시 한번 일깨워 줍니다." />
  </>
);

/* P5 · 빛 — 칠판이 밝아져 종이가 된다. 어두운 분필(연필)로 반전 */
export const LookA5: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #F7E8C8 0%, #E9CFA0 60%, #D9B47C 100%)'}}>
      <svg width={1280} height={720}>
        <ChalkDefs seed={9} glow={0.06} />
        <rect width={1280} height={720} filter="url(#paper)" opacity={0.6} />
        <defs><Hatch id="hGold" color="#C8862E" angle={-35} gap={7} /></defs>
        <g filter="url(#chalk)">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={640} cy={330} r={90 + i * 95} fill="none" stroke="#8A5A22" strokeWidth={3.5 - i * 0.4} opacity={0.55 - i * 0.09} />
          ))}
          <circle cx={640} cy={330} r={34} fill="url(#hGold)" stroke="#8A5A22" strokeWidth={3} />
          {[[420, 250, '♪'], [860, 260, '☼'], [500, 470, '❀'], [790, 460, '☂']].map(([x, y, ch], i) => (
            <text key={i} x={x as number} y={y as number} textAnchor="middle" fontSize={40} fill="none" stroke="#8A5A22" strokeWidth={1.5}>{ch as string}</text>
          ))}
          <text x={640} y={620} textAnchor="middle" fontFamily={theme.font.serif} fontSize={72} fontWeight={600} fill="none" stroke="#3B2F4A" strokeWidth={3} letterSpacing={14}>輝敍</text>
          <text x={640} y={664} textAnchor="middle" fontFamily={theme.font.serif} fontSize={20} fill="#3B2F4A" letterSpacing={12} opacity={0.7}>HWISEO</text>
        </g>
      </svg>
    </AbsoluteFill>
  </>
);
