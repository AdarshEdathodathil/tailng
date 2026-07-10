import { describe, expect, it } from 'vitest';
import {
  normalizeIconRef,
  normalizeIconSize,
  normalizeOptionalString,
} from './tng-icon.normalizers';

describe('normalizeOptionalString', () => {
  it('returns null for undefined, null, and whitespace-only values', () => {
    expect(normalizeOptionalString(undefined)).toBeNull();
    expect(normalizeOptionalString(null)).toBeNull();
    expect(normalizeOptionalString('   ')).toBeNull();
  });

  it('trims and returns meaningful values', () => {
    expect(normalizeOptionalString(' bell ')).toBe('bell');
  });
});

describe('normalizeIconRef', () => {
  it('returns null for empty icon refs', () => {
    expect(normalizeIconRef('')).toBeNull();
    expect(normalizeIconRef('   ')).toBeNull();
  });

  it('trims icon refs', () => {
    expect(normalizeIconRef(' lucide:bell ')).toBe('lucide:bell');
  });
});

describe('normalizeIconSize', () => {
  it('returns null for undefined, null, whitespace-only, and non-finite number values', () => {
    expect(normalizeIconSize(undefined)).toBeNull();
    expect(normalizeIconSize(null)).toBeNull();
    expect(normalizeIconSize('   ')).toBeNull();
    expect(normalizeIconSize(Number.NaN)).toBeNull();
    expect(normalizeIconSize(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('coerces finite numbers and numeric strings to pixel lengths', () => {
    expect(normalizeIconSize(20)).toBe('20px');
    expect(normalizeIconSize(20.5)).toBe('20.5px');
    expect(normalizeIconSize('20')).toBe('20px');
    expect(normalizeIconSize(' 20.5 ')).toBe('20.5px');
  });

  it('passes CSS lengths, variables, and expressions through after trimming', () => {
    expect(normalizeIconSize('1.25rem')).toBe('1.25rem');
    expect(normalizeIconSize('24px')).toBe('24px');
    expect(normalizeIconSize(' var(--size) ')).toBe('var(--size)');
    expect(normalizeIconSize('calc(1rem + 2px)')).toBe('calc(1rem + 2px)');
  });
});
