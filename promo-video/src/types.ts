export type Part = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export type Cut = {
  id: string;
  part: Part;
  vo: string;
  start: number;
  voFrames: number;
  duration: number;
  en: string;
  kr: string;
};
