import type { TngConfettiOrigin, TngConfettiPiece } from './tng-confetti.types';

export const TNG_CONFETTI_MAX_PIECES = 300;
export const TNG_CONFETTI_DEFAULT_COLORS: readonly string[] = Object.freeze([
  'var(--tng-confetti-color-1, #ef4444)',
  'var(--tng-confetti-color-2, #f59e0b)',
  'var(--tng-confetti-color-3, #22c55e)',
  'var(--tng-confetti-color-4, #3b82f6)',
  'var(--tng-confetti-color-5, #a855f7)',
]);

export function normalizeTngConfettiPieces(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.floor(value), 0), TNG_CONFETTI_MAX_PIECES);
}

export function normalizeTngConfettiDuration(value: number): number {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

export function resolveTngConfettiColors(colors: readonly string[] | null): readonly string[] {
  return colors === null || colors.length === 0 ? TNG_CONFETTI_DEFAULT_COLORS : [...colors];
}

function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

export function generateTngConfettiPieces(
  options: Readonly<{
    count: number;
    duration: number;
    origin: TngConfettiOrigin;
    colors: readonly string[];
    random?: () => number;
  }>,
): readonly TngConfettiPiece[] {
  const random = options.random ?? Math.random;
  const count = normalizeTngConfettiPieces(options.count);
  const duration = normalizeTngConfettiDuration(options.duration);
  const colors = resolveTngConfettiColors(options.colors);

  return Array.from({ length: count }, (_, id) => {
    const delay = duration * between(random, 0, 0.12);
    const apexY = options.origin === 'bottom' ? between(random, 22, 62) : between(random, 4, 38);
    const apexX = between(random, 5, 95);
    return Object.freeze({
      id,
      startX: between(random, -4, 4),
      startY: 0,
      apexX,
      apexY,
      endX: Math.min(105, Math.max(-5, apexX + between(random, -12, 12))),
      endY: 110,
      rotation: between(random, -900, 900),
      delay,
      animationDuration: Math.max(duration - delay, 0),
      color: colors[Math.floor(random() * colors.length)] ?? colors[0],
      scale: between(random, 0.65, 1.35),
      aspectRatio: between(random, 0.55, 1.35),
    });
  });
}
