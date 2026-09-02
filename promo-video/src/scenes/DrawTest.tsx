import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {PencilImage} from '../components/PencilImage';
import panel3 from '../strokes/panel3.json';
import {theme} from '../theme';

/** 크림 종이 무대 (P1용 초안) */
export const CreamStage: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const seed = Math.floor(frame / theme.boilEvery) * 7;
  return (
    <AbsoluteFill style={{backgroundColor: '#F3EEE4'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display: 'block'}}>
        <defs>
          <filter id="cpaper">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={4} seed={seed + 90} />
            <feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  0 0 0 .09 0" />
          </filter>
        </defs>
        <rect width={width} height={height} filter="url(#cpaper)" />
        {children}
      </svg>
      <AbsoluteFill style={{pointerEvents: 'none', background:
        'radial-gradient(ellipse at center, transparent 60%, rgba(60,40,20,0.10) 100%)'}} />
    </AbsoluteFill>
  );
};

export const DrawTest: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = interpolate(frame, [0, 150], [1, 1.05], {extrapolateRight: 'clamp', easing: theme.ease.soft});
  return (
    <CreamStage>
      <g transform={`translate(640 340) scale(${cam}) translate(-640 -340)`}>
        <PencilImage id="p3" src="img/test/panel3.png" strokes={panel3} x={190} y={30} w={900} at={4} dur={105} />
      </g>
    </CreamStage>
  );
};
