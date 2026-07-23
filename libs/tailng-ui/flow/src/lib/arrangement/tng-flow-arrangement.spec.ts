import { describe, expect, it } from 'vitest';
import { alignTngFlowNodes, distributeTngFlowNodes } from './tng-flow-arrangement';
import type { TngFlowNodeBounds } from '../types/tng-flow-geometry.types';

const bounds: readonly TngFlowNodeBounds[] = [
  {
    id: 'a',
    position: { x: 10, y: 20 },
    size: { width: 100, height: 60 },
  },
  {
    id: 'b',
    position: { x: 180, y: 120 },
    size: { width: 160, height: 100 },
  },
  {
    id: 'c',
    position: { x: 420, y: 260 },
    size: { width: 80, height: 140 },
  },
];

describe('TailNG flow arrangement utilities', () => {
  it.each([
    [
      'left',
      [
        { id: 'b', position: { x: 10, y: 120 } },
        { id: 'c', position: { x: 10, y: 260 } },
      ],
    ],
    [
      'horizontal-center',
      [
        { id: 'a', position: { x: 205, y: 20 } },
        { id: 'b', position: { x: 175, y: 120 } },
        { id: 'c', position: { x: 215, y: 260 } },
      ],
    ],
    [
      'right',
      [
        { id: 'a', position: { x: 400, y: 20 } },
        { id: 'b', position: { x: 340, y: 120 } },
      ],
    ],
    [
      'top',
      [
        { id: 'b', position: { x: 180, y: 20 } },
        { id: 'c', position: { x: 420, y: 20 } },
      ],
    ],
    [
      'vertical-center',
      [
        { id: 'a', position: { x: 10, y: 180 } },
        { id: 'b', position: { x: 180, y: 160 } },
        { id: 'c', position: { x: 420, y: 140 } },
      ],
    ],
    [
      'bottom',
      [
        { id: 'a', position: { x: 10, y: 340 } },
        { id: 'b', position: { x: 180, y: 300 } },
      ],
    ],
  ] as const)('aligns mixed-size bounds by %s', (alignment, expected) => {
    expect(alignTngFlowNodes(bounds, alignment)).toEqual(expected);
  });

  it('distributes mixed-size bounds with equal edge gaps on either axis', () => {
    expect(distributeTngFlowNodes(bounds, 'horizontal')).toEqual([
      { id: 'b', position: { x: 185, y: 120 } },
    ]);
    expect(
      distributeTngFlowNodes(
        bounds.map((entry) =>
          entry.id === 'b' ? { ...entry, position: { x: entry.position.x, y: 100 } } : entry,
        ),
        'vertical',
      ),
    ).toEqual([{ id: 'b', position: { x: 180, y: 120 } }]);
  });

  it('uses locked bounds as alignment anchors without returning locked moves', () => {
    const anchored: readonly TngFlowNodeBounds[] = [
      bounds[0],
      { ...bounds[1], locked: true },
      { ...bounds[2], locked: true },
    ];

    expect(alignTngFlowNodes(anchored, 'horizontal-center')).toEqual([
      { id: 'a', position: { x: 290, y: 20 } },
    ]);
    expect(alignTngFlowNodes(anchored, 'left', { lockedNodes: 'ignore' })).toEqual([]);
  });

  it('partitions distribution runs around locked anchors', () => {
    const anchored: readonly TngFlowNodeBounds[] = [
      { id: 'a', position: { x: 0, y: 0 }, size: { width: 50, height: 40 } },
      { id: 'b', position: { x: 80, y: 0 }, size: { width: 50, height: 40 } },
      {
        id: 'c',
        position: { x: 240, y: 0 },
        size: { width: 60, height: 40 },
        locked: true,
      },
      { id: 'd', position: { x: 360, y: 0 }, size: { width: 40, height: 40 } },
      { id: 'e', position: { x: 520, y: 0 }, size: { width: 50, height: 40 } },
    ];

    expect(distributeTngFlowNodes(anchored, 'horizontal')).toEqual([
      { id: 'b', position: { x: 120, y: 0 } },
      { id: 'd', position: { x: 390, y: 0 } },
    ]);
  });

  it('ignores disabled nodes, snaps the changed axis, and produces stable id order', () => {
    const candidates: readonly TngFlowNodeBounds[] = [
      { ...bounds[2], disabled: true },
      bounds[1],
      bounds[0],
    ];

    expect(alignTngFlowNodes(candidates, 'left', { gridSize: 16 })).toEqual([
      { id: 'a', position: { x: 16, y: 20 } },
      { id: 'b', position: { x: 16, y: 120 } },
    ]);
  });

  it('does not mutate deeply frozen inputs', () => {
    const frozen = Object.freeze(
      bounds.map((entry) =>
        Object.freeze({
          ...entry,
          position: Object.freeze({ ...entry.position }),
          size: Object.freeze({ ...entry.size }),
        }),
      ),
    );
    const before = JSON.stringify(frozen);

    alignTngFlowNodes(frozen, 'right');
    distributeTngFlowNodes(frozen, 'horizontal');

    expect(JSON.stringify(frozen)).toBe(before);
  });

  it('rejects duplicate and non-finite geometry', () => {
    expect(() => alignTngFlowNodes([bounds[0], bounds[0]], 'left')).toThrow(
      'duplicate node bounds',
    );
    expect(() =>
      distributeTngFlowNodes(
        [{ ...bounds[0], size: { width: Number.NaN, height: 40 } }, bounds[1], bounds[2]],
        'horizontal',
      ),
    ).toThrow('invalid bounds');
  });
});
