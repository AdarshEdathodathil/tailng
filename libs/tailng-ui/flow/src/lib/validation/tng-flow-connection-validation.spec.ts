import { describe, expect, it } from 'vitest';
import { validateTngFlowConnectionCandidate } from './tng-flow-connection-validation';
import { createTngFlowConnectionCandidate, createTngFlowGraphIndex } from '../model/tng-flow-graph';
import type {
  TngFlowConnection,
  TngFlowConnectionCandidate,
  TngFlowNode,
} from '../types/tng-flow.types';

const nodes: readonly TngFlowNode[] = [
  {
    id: 'source',
    type: 'source',
    name: 'Source',
    position: { x: 0, y: 0 },
    ports: [
      { id: 'out', direction: 'output', kind: 'data', multiple: true },
      { id: 'control-out', direction: 'output', kind: 'control' },
      { id: 'disabled-out', direction: 'output', kind: 'data', disabled: true },
    ],
  },
  {
    id: 'target',
    type: 'target',
    name: 'Target',
    position: { x: 300, y: 0 },
    ports: [
      { id: 'in', direction: 'input', kind: 'data' },
      { id: 'other-in', direction: 'input', kind: 'data' },
    ],
  },
];

function candidate(firstId: string, secondId: string): TngFlowConnectionCandidate {
  const index = createTngFlowGraphIndex(nodes, []);
  const first = [...index.portRecords].find((record) => record.port.id === firstId);
  const second = [...index.portRecords].find((record) => record.port.id === secondId);
  if (first === undefined || second === undefined) {
    throw new Error('Missing test port.');
  }
  return createTngFlowConnectionCandidate(first, second);
}

describe('validateTngFlowConnectionCandidate', () => {
  it('accepts valid output-to-input and normalized input-to-output candidates', () => {
    expect(validateTngFlowConnectionCandidate(candidate('out', 'in'), [])).toEqual({ valid: true });
    expect(validateTngFlowConnectionCandidate(candidate('in', 'out'), [])).toEqual({ valid: true });
  });

  it('rejects direction, disabled, kind, duplicate, and multiplicity violations', () => {
    const existing: readonly TngFlowConnection[] = [
      {
        id: 'existing',
        source: { nodeId: 'source', portId: 'out' },
        target: { nodeId: 'target', portId: 'in' },
      },
    ];

    expect(validateTngFlowConnectionCandidate(candidate('in', 'other-in'), []).valid).toBe(false);
    expect(validateTngFlowConnectionCandidate(candidate('disabled-out', 'in'), []).valid).toBe(
      false,
    );
    expect(validateTngFlowConnectionCandidate(candidate('control-out', 'in'), []).valid).toBe(
      false,
    );
    expect(validateTngFlowConnectionCandidate(candidate('out', 'in'), existing).reason).toContain(
      'already exists',
    );
    expect(
      validateTngFlowConnectionCandidate(candidate('out', 'other-in'), [
        {
          id: 'occupied',
          source: { nodeId: 'source', portId: 'control-out' },
          target: { nodeId: 'target', portId: 'other-in' },
        },
      ]).reason,
    ).toContain('only one');
  });

  it('excludes the reassigned connection from duplicate and capacity checks', () => {
    const existing: readonly TngFlowConnection[] = [
      {
        id: 'existing',
        source: { nodeId: 'source', portId: 'out' },
        target: { nodeId: 'target', portId: 'in' },
      },
    ];

    expect(
      validateTngFlowConnectionCandidate(candidate('out', 'in'), existing, 'existing'),
    ).toEqual({ valid: true });
  });
});
