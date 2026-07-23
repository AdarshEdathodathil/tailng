import { describe, expect, it, vi } from 'vitest';
import {
  calculateTngFlowLayout,
  resolveTngFlowLayoutOptions,
  resolveTngFlowLayoutViewportOptions,
} from './tng-flow-layout-coordinator';
import type { TngFlowLayoutEngine, TngFlowLayoutGraph } from '../types/tng-flow-layout.types';

const graph: TngFlowLayoutGraph = {
  nodes: [
    {
      node: { id: 'a', type: 'step', name: 'A', position: { x: 8, y: 16 }, locked: true },
      bounds: {
        id: 'a',
        position: { x: 8, y: 16 },
        size: { width: 120, height: 80 },
        locked: true,
      },
    },
    {
      node: { id: 'b', type: 'step', name: 'B', position: { x: 240, y: 16 } },
      bounds: {
        id: 'b',
        position: { x: 240, y: 16 },
        size: { width: 180, height: 96 },
      },
    },
  ],
  connections: [
    {
      connection: {
        id: 'a-b',
        source: { nodeId: 'a', portId: 'out' },
        target: { nodeId: 'b', portId: 'in' },
      },
    },
  ],
};

describe('TailNG flow layout coordinator', () => {
  it('resolves the frozen Phase 0 defaults independently from viewport effects', () => {
    expect(resolveTngFlowLayoutOptions({})).toEqual({
      direction: 'left-to-right',
      nodeSpacing: 48,
      levelSpacing: 120,
      componentSpacing: 64,
      preserveLockedNodes: true,
      includeDisconnectedNodes: true,
    });
    expect(resolveTngFlowLayoutViewportOptions({})).toEqual({
      fit: false,
      animated: false,
      padding: 48,
    });
    expect(
      resolveTngFlowLayoutOptions({ nodeSpacing: -1, levelSpacing: Number.NaN }),
    ).toMatchObject({
      nodeSpacing: 48,
      levelSpacing: 120,
    });
  });

  it('invokes the engine once, anchors locked nodes, snaps, and returns one calculation', async () => {
    const calculate = vi.fn<TngFlowLayoutEngine['calculate']>(() =>
      Promise.resolve([
        { id: 'b', position: { x: 257, y: 4 } },
        { id: 'a', position: { x: 0, y: 0 } },
      ]),
    );
    const result = await calculateTngFlowLayout({
      engine: { calculate },
      graph,
      autoLayout: { viewport: { fit: true, animated: true, padding: 32 } },
      policy: { snapToGrid: true, gridSize: 16 },
    });

    expect(calculate).toHaveBeenCalledOnce();
    expect(calculate.mock.calls[0][0]).toBe(graph);
    expect(result.nodes).toEqual([{ id: 'b', position: { x: 272, y: 16 } }]);
    expect(result.viewport).toEqual({ fit: true, animated: true, padding: 32 });
  });

  it('emits an empty move list for an already stable graph without changing the input', async () => {
    const before = structuredClone(graph);
    const result = await calculateTngFlowLayout({
      engine: {
        calculate: () =>
          Promise.resolve(
            graph.nodes.map((entry) => ({
              id: entry.node.id,
              position: entry.node.position,
            })),
          ),
      },
      graph,
      autoLayout: { preserveLockedNodes: false },
      policy: { snapToGrid: false, gridSize: 16 },
    });

    expect(result.nodes).toEqual([]);
    expect(graph).toEqual(before);
  });

  it('rejects duplicate, unknown, and non-finite engine results', async () => {
    const invalidResults = [
      [{ id: 'missing', position: { x: 0, y: 0 } }],
      [{ id: 'a', position: { x: Number.NaN, y: 0 } }],
      [
        { id: 'a', position: { x: 0, y: 0 } },
        { id: 'a', position: { x: 1, y: 1 } },
      ],
    ];

    for (const moves of invalidResults) {
      await expect(
        calculateTngFlowLayout({
          engine: { calculate: () => Promise.resolve(moves) },
          graph,
          autoLayout: {},
          policy: { snapToGrid: false, gridSize: 16 },
        }),
      ).rejects.toThrow('Layout engine returned an invalid move');
    }
  });
});
