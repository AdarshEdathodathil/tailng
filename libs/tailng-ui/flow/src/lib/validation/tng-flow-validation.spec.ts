import { describe, expect, it } from 'vitest';
import { validateTngFlow } from './tng-flow-validation';
import type { TngFlowConnection, TngFlowNode } from '../types/tng-flow.types';

const validNodes: readonly TngFlowNode[] = [
  {
    id: 'source',
    type: 'source',
    name: 'Source',
    position: { x: 0, y: 0 },
    outputs: [{ id: 'source-output', category: 'text' }],
  },
  {
    id: 'target',
    type: 'target',
    name: 'Target',
    position: { x: 300, y: 0 },
    inputs: [{ id: 'target-input', category: 'text' }],
  },
];

const validConnections: readonly TngFlowConnection[] = [
  {
    id: 'source-to-target',
    sourcePortId: 'source-output',
    targetPortId: 'target-input',
  },
];

describe('validateTngFlow', () => {
  it('accepts a valid connector-to-connector graph', () => {
    expect(validateTngFlow(validNodes, validConnections)).toEqual([]);
  });

  it('reports duplicate ids and missing endpoints', () => {
    const nodes: readonly TngFlowNode[] = [
      ...validNodes,
      {
        ...validNodes[1],
        inputs: [{ id: 'source-output' }],
      },
    ];
    const connections: readonly TngFlowConnection[] = [
      ...validConnections,
      {
        id: 'source-to-target',
        sourcePortId: 'missing-source',
        targetPortId: 'missing-target',
      },
    ];

    const codes = validateTngFlow(nodes, connections).map((issue) => issue.code);

    expect(codes).toEqual(
      expect.arrayContaining([
        'duplicate-node-id',
        'duplicate-port-id',
        'duplicate-connection-id',
        'missing-source-port',
        'missing-target-port',
      ]),
    );
  });

  it('enforces source/target direction, compatibility, and multiplicity', () => {
    const nodes: readonly TngFlowNode[] = [
      {
        id: 'one',
        type: 'agent',
        name: 'One',
        position: { x: 0, y: 0 },
        inputs: [{ id: 'one-in' }],
        outputs: [
          {
            id: 'one-out',
            accepts: ['structured'],
            allowSelfConnection: false,
          },
        ],
      },
      {
        id: 'two',
        type: 'agent',
        name: 'Two',
        position: { x: 300, y: 0 },
        inputs: [{ id: 'two-in', category: 'plain' }],
        outputs: [{ id: 'two-out' }],
      },
    ];
    const connections: readonly TngFlowConnection[] = [
      { id: 'wrong-direction', sourcePortId: 'one-in', targetPortId: 'two-out' },
      { id: 'incompatible', sourcePortId: 'one-out', targetPortId: 'two-in' },
      { id: 'self', sourcePortId: 'one-out', targetPortId: 'one-in' },
    ];

    const codes = validateTngFlow(nodes, connections).map((issue) => issue.code);

    expect(codes).toEqual(
      expect.arrayContaining([
        'invalid-source-port',
        'invalid-target-port',
        'incompatible-ports',
        'self-connection-disabled',
        'port-connection-limit',
      ]),
    );
  });
});
