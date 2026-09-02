import React from 'react';
import {Composition, Sequence, AbsoluteFill} from 'remotion';
import {CUTS, FPS, TOTAL_FRAMES, partDur} from './cuts';
import type {Cut, Part} from './types';
import * as P1 from './scenes/P1';
import * as P1v2 from './scenes/P1v2';
import * as P2 from './scenes/P2';
import * as P3 from './scenes/P3';
import * as P4 from './scenes/P4';
import * as P5 from './scenes/P5';
import {LookP1, LookP2, LookP3, LookP4, LookP5} from './scenes/Look';
import {LookA1, LookA2, LookA3, LookA4, LookA5} from './scenes/LookA';
import {DrawTest} from './scenes/DrawTest';
import {P1Flat} from './scenes/P1Flat';
import {P2Flat} from './scenes/P2Flat';
import {P3Flat} from './scenes/P3Flat';
import {P4Flat} from './scenes/P4Flat';
import {P5Flat} from './scenes/P5Flat';

const SCENES: Record<string, React.FC<{cut: Cut}>> = {
  C01: P1v2.C01, C02: P1.C02, C03: P1.C03, C04: P1.C04, C05: P1.C05,
  C06: P2.C06, C07: P2.C07, C08: P2.C08, C09: P2.C09, C10: P2.C10, C11: P2.C11,
  C12: P3.C12, C13: P3.C13, C14: P3.C14, C15: P3.C15, C16: P3.C16,
  C17: P4.C17, C18: P4.C18, C19: P4.C19, C20: P4.C20,
  C21: P5.C21, C22: P5.C22, C23: P5.C23, C24: P5.C24, C25: P5.C24,   // C25(로고 컷)는 옛 분필 씬이 없어 C24로 대체
};

const W = 1280, H = 720;

/** 컷 하나 (컷 단독 확인용) */
const CutComp: React.FC<{cut: Cut}> = ({cut}) => {
  const Scene = SCENES[cut.id];
  return <Scene cut={cut} />;
};

/** 여러 컷을 이어붙임 (파트 / 전체) */
const Reel: React.FC<{cuts: Cut[]}> = ({cuts}) => {
  const base = cuts[0].start;
  return (
    <AbsoluteFill>
      {cuts.map((c) => {
        const Scene = SCENES[c.id];
        return (
          <Sequence key={c.id} from={c.start - base} durationInFrames={c.duration} name={`${c.id} ${c.en.slice(0, 32)}`}>
            <Scene cut={c} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PARTS: Part[] = ['P1', 'P2', 'P3', 'P4', 'P5'];

export const RemotionRoot: React.FC = () => (
  <>
    {[LookA1, LookA2, LookA3, LookA4, LookA5].map((L, i) => (
      <Composition key={'LookA' + i} id={`LookA-P${i + 1}`} component={L} durationInFrames={1} fps={FPS} width={W} height={H} />
    ))}
    {[LookP1, LookP2, LookP3, LookP4, LookP5].map((L, i) => (
      <Composition key={'LookB' + i} id={`LookB-P${i + 1}`} component={L} durationInFrames={1} fps={FPS} width={W} height={H} />
    ))}
    <Composition id="P1flat" component={P1Flat} durationInFrames={partDur('P1')} fps={FPS} width={W} height={H} />
    <Composition id="P2flat" component={P2Flat} durationInFrames={partDur('P2')} fps={FPS} width={W} height={H} />
    <Composition id="P3flatA" component={P3Flat} durationInFrames={partDur('P3')} fps={FPS} width={W} height={H} defaultProps={{variant: 'A' as const}} />
    <Composition id="P3flatB" component={P3Flat} durationInFrames={partDur('P3')} fps={FPS} width={W} height={H} defaultProps={{variant: 'B' as const}} />
    <Composition id="P4flat" component={P4Flat} durationInFrames={partDur('P4')} fps={FPS} width={W} height={H} />
    <Composition id="P5flat" component={P5Flat} durationInFrames={partDur('P5')} fps={FPS} width={W} height={H} />
    <Composition id="DrawTest" component={DrawTest} durationInFrames={150} fps={FPS} width={W} height={H} />
    <Composition id="Full" component={Reel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H}
      defaultProps={{cuts: CUTS}} />
    <Composition id="LightTest" component={Reel} fps={FPS} width={W} height={H}
      durationInFrames={CUTS.filter((c) => c.id >= 'C10' && c.id <= 'C19').reduce((a, c) => a + c.duration, 0)}
      defaultProps={{cuts: CUTS.filter((c) => c.id >= 'C10' && c.id <= 'C19')}} />
    {PARTS.map((p) => {
      const cs = CUTS.filter((c) => c.part === p);
      const dur = cs.reduce((a, c) => a + c.duration, 0);
      return <Composition key={p} id={p} component={Reel} durationInFrames={dur} fps={FPS} width={W} height={H}
        defaultProps={{cuts: cs}} />;
    })}
    {CUTS.map((c) => (
      <Composition key={c.id} id={c.id} component={CutComp} durationInFrames={c.duration} fps={FPS} width={W} height={H}
        defaultProps={{cut: c}} />
    ))}
  </>
);
