import { describe, expect, it } from 'vitest';
import { createTngFlowConnectorId } from '../model/tng-flow-connector-id';
import {
  DEFAULT_TNG_FLOW_NODE_SIZE,
  resolveTngFlowFacingSides,
  resolveTngFlowNearestBorderSides,
} from './tng-flow-nearest-border';

describe('resolveTngFlowFacingSides', () => {
  const source = {
    id: 'source',
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
  };

  it('assigns right/left when the target is to the right', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 200, y: 0 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'right', targetSide: 'left' });
  });

  it('assigns left/right when the target is to the left', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: -200, y: 0 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'left', targetSide: 'right' });
  });

  it('assigns bottom/top when the target is below', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 0, y: 200 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'bottom', targetSide: 'top' });
  });

  it('assigns top/bottom when the target is above', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 0, y: -200 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'top', targetSide: 'bottom' });
  });

  it('uses the dominant axis on a clear diagonal', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 300, y: 40 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'right', targetSide: 'left' });

    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 40, y: 300 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'bottom', targetSide: 'top' });
  });

  it('prefers horizontal on an equal |Δx| and |Δy| tie', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'right', targetSide: 'left' });
  });

  it('defaults to right/left when centers coincide', () => {
    expect(
      resolveTngFlowFacingSides(source, {
        id: 'target',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
      }),
    ).toEqual({ sourceSide: 'right', targetSide: 'left' });
  });

  it('uses node size when computing centers', () => {
    expect(
      resolveTngFlowFacingSides(
        {
          id: 'source',
          position: { x: 0, y: 0 },
          size: { width: 400, height: 100 },
        },
        {
          id: 'target',
          position: { x: 250, y: 0 },
          size: { width: 100, height: 100 },
        },
      ),
    ).toEqual({ sourceSide: 'right', targetSide: 'left' });
  });

  it('falls back to the default node size when size is omitted', () => {
    const facing = resolveTngFlowFacingSides(
      { id: 'source', position: { x: 0, y: 0 } },
      {
        id: 'target',
        position: { x: DEFAULT_TNG_FLOW_NODE_SIZE.width + 40, y: 0 },
      },
    );
    expect(facing).toEqual({ sourceSide: 'right', targetSide: 'left' });
  });
});

describe('resolveTngFlowNearestBorderSides', () => {
  it('maps only connected endpoints to facing sides', () => {
    const sides = resolveTngFlowNearestBorderSides(
      [
        { id: 'a', position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
        { id: 'b', position: { x: 300, y: 0 }, size: { width: 100, height: 100 } },
      ],
      [
        {
          id: 'a-to-b',
          source: { nodeId: 'a', portId: 'out-1' },
          target: { nodeId: 'b', portId: 'in-1' },
        },
      ],
    );

    expect(sides.get(createTngFlowConnectorId('a', 'out-1'))).toBe('right');
    expect(sides.get(createTngFlowConnectorId('b', 'in-1'))).toBe('left');
    expect(sides.has(createTngFlowConnectorId('a', 'create-out'))).toBe(false);
  });

  it('places mixed in and out endpoints from separate connections on shared facing sides', () => {
    const sides = resolveTngFlowNearestBorderSides(
      [
        { id: 'hub', position: { x: 200, y: 0 }, size: { width: 100, height: 100 } },
        { id: 'left', position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
        { id: 'right', position: { x: 400, y: 0 }, size: { width: 100, height: 100 } },
      ],
      [
        {
          id: 'left-to-hub',
          source: { nodeId: 'left', portId: 'out' },
          target: { nodeId: 'hub', portId: 'in-from-left' },
        },
        {
          id: 'hub-to-right',
          source: { nodeId: 'hub', portId: 'out-to-right' },
          target: { nodeId: 'right', portId: 'in' },
        },
      ],
    );

    expect(sides.get(createTngFlowConnectorId('hub', 'in-from-left'))).toBe('left');
    expect(sides.get(createTngFlowConnectorId('hub', 'out-to-right'))).toBe('right');
  });

  it('skips connections whose nodes are missing', () => {
    const sides = resolveTngFlowNearestBorderSides(
      [{ id: 'a', position: { x: 0, y: 0 } }],
      [
        {
          id: 'orphan',
          source: { nodeId: 'a', portId: 'out' },
          target: { nodeId: 'missing', portId: 'in' },
        },
      ],
    );
    expect(sides.size).toBe(0);
  });
});
