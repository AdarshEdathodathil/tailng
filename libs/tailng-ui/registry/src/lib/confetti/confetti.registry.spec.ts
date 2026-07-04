import { describe, expect, it } from 'vitest';
import { confettiRegistryItem } from './confetti.registry';
describe('confetti registry item', () => {
  it('contains complete dependency-free ownable sources', () => {
    expect(confettiRegistryItem.name).toBe('confetti');
    expect(confettiRegistryItem.dependencies).toEqual([]);
    expect(confettiRegistryItem.files).toHaveLength(6);
    expect(
      confettiRegistryItem.files.find((file) => file.path.endsWith('tng-confetti.ts'))?.content,
    ).toContain('export class TngConfetti');
    expect(
      confettiRegistryItem.files.find((file) => file.path.endsWith('index.ts'))?.content,
    ).toContain("export * from './tng-confetti.utils'");
  });
});
