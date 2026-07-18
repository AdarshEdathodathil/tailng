import { describe, expect, it } from 'vitest';
import { resolveTngFlowCapabilities } from './tng-flow-capabilities';

describe('resolveTngFlowCapabilities', () => {
  it('centralizes edit, inspect, and strict readonly behavior', () => {
    expect(resolveTngFlowCapabilities('edit')).toMatchObject({
      activate: true,
      connect: true,
      delete: true,
      move: true,
      select: true,
    });
    expect(resolveTngFlowCapabilities('inspect')).toMatchObject({
      activate: true,
      connect: false,
      delete: false,
      move: false,
      select: true,
    });
    expect(resolveTngFlowCapabilities('readonly')).toMatchObject({
      activate: false,
      connect: false,
      delete: false,
      move: false,
      navigate: true,
      panZoom: true,
      select: false,
    });
  });
});
