export type TngConfettiOrigin = 'bottom' | 'center';
export type TngConfettiVariant = 'paper';
export type TngConfettiReducedMotion = boolean | 'auto';

export type TngConfettiPiece = Readonly<{
  id: number;
  startX: number;
  startY: number;
  apexX: number;
  apexY: number;
  endX: number;
  endY: number;
  rotation: number;
  delay: number;
  animationDuration: number;
  color: string;
  scale: number;
  aspectRatio: number;
}>;
