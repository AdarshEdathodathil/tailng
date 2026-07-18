import { describe, expect, it } from 'vitest';
import { createTngFlowGraphIndex } from './tng-flow-graph';
import { areTngFlowSelectionsEqual, sanitizeTngFlowSelection } from './tng-flow-selection';

describe('TailNG flow selection utilities', () => {
  const index = createTngFlowGraphIndex(
    [{ id: 'node', type: 'task', name: 'Node', position: { x: 0, y: 0 }, ports: [] }],
    [],
  );

  it('removes stale ids without mutating the controlled selection', () => {
    const selection = {
      nodeIds: new Set(['node', 'missing']),
      connectionIds: new Set(['missing']),
    };

    const sanitized = sanitizeTngFlowSelection(selection, index);

    expect(sanitized).toEqual({ nodeIds: new Set(['node']), connectionIds: new Set() });
    expect(selection.nodeIds).toEqual(new Set(['node', 'missing']));
  });

  it('compares set contents instead of set identity', () => {
    expect(
      areTngFlowSelectionsEqual(
        { nodeIds: new Set(['node']), connectionIds: new Set() },
        { nodeIds: new Set(['node']), connectionIds: new Set() },
      ),
    ).toBe(true);
  });
});
