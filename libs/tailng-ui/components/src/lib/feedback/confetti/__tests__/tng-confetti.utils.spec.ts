import { describe, expect, it } from 'vitest';
import {
  generateTngConfettiPieces,
  normalizeTngConfettiDuration,
  normalizeTngConfettiPieces,
  resolveTngConfettiColors,
  TNG_CONFETTI_DEFAULT_COLORS,
} from '../tng-confetti.utils';

describe('tng-confetti utilities', () => {
  it('normalizes public numeric inputs', () => {
    expect(normalizeTngConfettiPieces(-1)).toBe(0);
    expect(normalizeTngConfettiPieces(12.9)).toBe(12);
    expect(normalizeTngConfettiPieces(999)).toBe(300);
    expect(normalizeTngConfettiPieces(Number.NaN)).toBe(0);
    expect(normalizeTngConfettiDuration(-1)).toBe(0);
    expect(normalizeTngConfettiDuration(1200)).toBe(1200);
  });

  it('uses defaults for null or empty palettes', () => {
    expect(resolveTngConfettiColors(null)).toBe(TNG_CONFETTI_DEFAULT_COLORS);
    expect(resolveTngConfettiColors([])).toBe(TNG_CONFETTI_DEFAULT_COLORS);
    expect(resolveTngConfettiColors(['red'])).toEqual(['red']);
  });

  it('generates deterministic, bounded pieces for each origin', () => {
    for (const origin of ['bottom', 'center'] as const) {
      const generated = generateTngConfettiPieces({
        count: 4,
        duration: 1000,
        origin,
        colors: ['red'],
        random: () => 0.5,
      });
      expect(generated).toHaveLength(4);
      expect(new Set(generated.map((piece) => piece.id)).size).toBe(4);
      expect(generated.every((piece) => piece.color === 'red')).toBe(true);
      expect(generated.every((piece) => piece.delay + piece.animationDuration === 1000)).toBe(true);
      expect(generated.every((piece) => piece.startY === 0)).toBe(true);
      expect(generated.every((piece) => piece.apexX >= 5 && piece.apexX <= 95)).toBe(true);
    }
  });
});
