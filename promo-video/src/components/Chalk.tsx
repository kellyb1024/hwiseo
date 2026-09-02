import React from 'react';

/** 분필 질감 + 종이 결 + 글로우 필터. seed를 프레임마다 바꿔 보일(boil)을 만든다. */
export const ChalkDefs: React.FC<{seed: number; glow: number}> = ({seed, glow}) => (
  <defs>
    <filter id="chalk" x="-25%" y="-25%" width="150%" height="150%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={seed} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={6}
        xChannelSelector="R" yChannelSelector="G" result="wob" />
      <feTurbulence type="fractalNoise" baseFrequency="0.19" numOctaves={3} seed={seed + 40} result="g" />
      <feColorMatrix in="g" type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.9 0 0 0 -0.30" result="ga" />
      <feComposite in="wob" in2="ga" operator="in" />
    </filter>
    <filter id="glow" x="-90%" y="-90%" width="280%" height="280%">
      <feGaussianBlur stdDeviation={Math.max(0.01, glow * 22)} result="b1" />
      <feGaussianBlur stdDeviation={Math.max(0.01, glow * 7)} result="b2" />
      <feComponentTransfer in="b1" result="b1a">
        <feFuncA type="linear" slope={glow * 1.5} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="b1a" />
        <feMergeNode in="b2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={3} />
    </filter>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={4} seed={seed + 90} />
      <feColorMatrix type="matrix"
        values="0 0 0 0 .55  0 0 0 0 .55  0 0 0 0 .55  0 0 0 .07 0" />
    </filter>
  </defs>
);
