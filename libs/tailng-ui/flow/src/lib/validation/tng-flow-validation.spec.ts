import { describe, expect, it } from 'vitest';
import { analyzeTngFlow, validateTngFlow } from './tng-flow-validation';
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
    source: { nodeId: 'source', portId: 'source-output' },
    target: { nodeId: 'target', portId: 'target-input' },
  },
];

describe('validateTngFlow', () => {
  it('accepts a valid connector-to-connector graph', () => {
    expect(validateTngFlow(validNodes, validConnections)).toEqual([]);
  });

  it('preserves additive connection labels and descriptions during analysis', () => {
    const connection: TngFlowConnection = {
      ...validConnections[0],
      label: 'Approved',
      description: 'Continue when the review is approved.',
    };

    expect(analyzeTngFlow(validNodes, [connection]).connections[0]).toMatchObject({
      label: 'Approved',
      description: 'Continue when the review is approved.',
    });
  });

  it('scopes reusable port ids to their owning nodes', () => {
    const nodes: readonly TngFlowNode[] = [
      { ...validNodes[0], outputs: [{ id: 'result' }] },
      { ...validNodes[1], inputs: [{ id: 'result' }] },
    ];
    const connections: readonly TngFlowConnection[] = [
      {
        id: 'shared-local-port-id',
        source: { nodeId: 'source', portId: 'result' },
        target: { nodeId: 'target', portId: 'result' },
      },
    ];

    expect(validateTngFlow(nodes, connections)).toEqual([]);
  });

  it('reports duplicate ids and missing endpoints', () => {
    const nodes: readonly TngFlowNode[] = [
      ...validNodes,
      {
        ...validNodes[1],
        inputs: [{ id: 'target-input' }],
      },
    ];
    const connections: readonly TngFlowConnection[] = [
      ...validConnections,
      {
        id: 'source-to-target',
        source: { nodeId: 'source', portId: 'missing-source' },
        target: { nodeId: 'target', portId: 'missing-target' },
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
      {
        id: 'wrong-direction',
        source: { nodeId: 'one', portId: 'one-in' },
        target: { nodeId: 'two', portId: 'two-out' },
      },
      {
        id: 'incompatible',
        source: { nodeId: 'one', portId: 'one-out' },
        target: { nodeId: 'two', portId: 'two-in' },
      },
      {
        id: 'self',
        source: { nodeId: 'one', portId: 'one-out' },
        target: { nodeId: 'one', portId: 'one-in' },
      },
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

  it('validates the canonical port model and explicit self-connection policy', () => {
    const nodes: readonly TngFlowNode[] = [
      {
        id: 'canonical',
        type: 'agent',
        name: 'Canonical',
        position: { x: 0, y: 0 },
        ports: [
          { id: 'in', direction: 'input', kind: 'data', multiple: true },
          { id: 'out', direction: 'output', kind: 'control', multiple: true },
        ],
        inputs: [{ id: 'legacy' }],
      },
    ];
    const connections: readonly TngFlowConnection[] = [
      {
        id: 'self-one',
        source: { nodeId: 'canonical', portId: 'out' },
        target: { nodeId: 'canonical', portId: 'in' },
      },
      {
        id: 'self-two',
        source: { nodeId: 'canonical', portId: 'out' },
        target: { nodeId: 'canonical', portId: 'in' },
      },
    ];

    const codes = validateTngFlow(nodes, connections).map((issue) => issue.code);

    expect(codes).toEqual(
      expect.arrayContaining([
        'mixed-port-model',
        'incompatible-port-kind',
        'self-connection-disabled',
        'duplicate-connection',
      ]),
    );
  });

  it('preserves valid port sides and ignores unsupported values', () => {
    const analysis = analyzeTngFlow(
      [
        {
          id: 'vertical',
          type: 'agent',
          name: 'Vertical',
          position: { x: 0, y: 0 },
          ports: [
            { id: 'in', direction: 'input', kind: 'data', side: 'top' },
            { id: 'out', direction: 'output', kind: 'data', side: 'diagonal' },
          ],
        },
      ],
      [],
    );

    expect(analysis.nodes[0].ports?.[0].side).toBe('top');
    expect(analysis.nodes[0].ports?.[1].side).toBeUndefined();
  });
});
