import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {theme} from '../theme';

/** 획 하나가 그어진다. at 프레임부터 dur 프레임 동안. */
export const Draw: React.FC<{
  d: string; at: number; dur: number; w?: number; color?: string;
  opacity?: number; fill?: string; dash?: boolean;
}> = ({d, at, dur, w = 5, color = theme.color.chalk, opacity = 1, fill = 'none'}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.draw});
  if (p <= 0) return null;
  const settle = interpolate(frame, [at + dur, at + dur + 14], [1, 0.88],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: theme.ease.out});
  const fillO = interpolate(frame, [at + dur * 0.7, at + dur + 8], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <path d={d} pathLength={1} fill={fill} fillOpacity={fill === 'none' ? 0 : fillO}
      stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={1} strokeDashoffset={1 - p}
      opacity={opacity * (0.6 + 0.4 * settle)} />
  );
};

/** 결정적 의사난수 0..1 */
export const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
