import { describe, expect, it } from 'vitest';
import {
  resolveTngFlowConnectionOptions,
  tngFlowLabelPlacementPosition,
  tngFlowPathTypeToRendererType,
} from './tng-flow-connection-options';
import { RECOMMENDED_TNG_FLOW_CONNECTION_OPTIONS } from '../types/tng-flow-connection.types';
import type { TngFlowConnection } from '../types/tng-flow.types';

const connection: TngFlowConnection = {
  id: 'source-to-target',
  source: { nodeId: 'source', portId: 'output' },
  target: { nodeId: 'target', portId: 'input' },
};

describe('resolveTngFlowConnectionOptions', () => {
  it('preserves the legacy bezier geometry by default', () => {
    expect(resolveTngFlowConnectionOptions(connection)).toEqual({
      routing: {
        type: 'bezier',
        offset: 12,
        radius: 8,
        waypoints: [],
      },
      sourceMarker: 'none',
      targetMarker: 'none',
      labelPlacement: 'center',
      labelOffset: 0,
      labelOffsetX: 0,
      labelOffsetY: 0,
    });
  });

  it('maps legacy renderer names before editor defaults', () => {
    expect(
      resolveTngFlowConnectionOptions(
        { ...connection, type: 'segment' },
        { defaultConnection: RECOMMENDED_TNG_FLOW_CONNECTION_OPTIONS },
      ).routing,
    ).toMatchObject({
      type: 'orthogonal-rounded',
      radius: 8,
    });
    expect(
      resolveTngFlowConnectionOptions({ ...connection, type: 'adaptive-curve' }).routing.type,
    ).toBe('adaptive');
  });

  it('resolves connection overrides before recommended editor defaults', () => {
    const resolved = resolveTngFlowConnectionOptions(
      {
        ...connection,
        routing: {
          type: 'orthogonal',
          offset: 36,
          radius: 99,
          waypoints: [{ x: 200, y: 120 }],
        },
        sourceMarker: 'circle',
        labelOptions: { placement: 'start', offset: -8, offsetX: 4, offsetY: -2 },
      },
      { defaultConnection: RECOMMENDED_TNG_FLOW_CONNECTION_OPTIONS },
    );

    expect(resolved).toMatchObject({
      routing: {
        type: 'orthogonal',
        offset: 36,
        radius: 0,
        waypoints: [{ x: 200, y: 120 }],
      },
      sourceMarker: 'circle',
      targetMarker: 'arrow',
      labelPlacement: 'start',
      labelOffset: -8,
      labelOffsetX: 4,
      labelOffsetY: -2,
    });
    expect(resolved.routing.waypoints).not.toBe(connection.routing?.waypoints);
  });

  it('rejects invalid runtime values without leaking renderer types', () => {
    const unsafe = {
      ...connection,
      routing: {
        type: 'wave',
        offset: Number.NaN,
        radius: -4,
        waypoints: [{ x: Number.POSITIVE_INFINITY, y: 10 }],
      },
      sourceMarker: 'triangle',
    } as unknown as TngFlowConnection;

    expect(resolveTngFlowConnectionOptions(unsafe)).toEqual({
      routing: {
        type: 'bezier',
        offset: 12,
        radius: 8,
        waypoints: [],
      },
      sourceMarker: 'none',
      targetMarker: 'none',
      labelPlacement: 'center',
      labelOffset: 0,
      labelOffsetX: 0,
      labelOffsetY: 0,
    });
  });
});

describe('connection renderer mappings', () => {
  it('maps TailNG path names and label positions to internal values', () => {
    expect(tngFlowPathTypeToRendererType('orthogonal')).toBe('segment');
    expect(tngFlowPathTypeToRendererType('orthogonal-rounded')).toBe('segment');
    expect(tngFlowPathTypeToRendererType('adaptive')).toBe('adaptive-curve');
    expect(tngFlowLabelPlacementPosition('start')).toBe(0.2);
    expect(tngFlowLabelPlacementPosition('center')).toBe(0.5);
    expect(tngFlowLabelPlacementPosition('end')).toBe(0.8);
  });
});
