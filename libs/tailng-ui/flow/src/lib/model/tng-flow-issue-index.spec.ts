import { describe, expect, it } from 'vitest';
import { createTngFlowIssueIndex, resolveTngFlowValidationSeverity } from './tng-flow-issue-index';
import type { TngFlowValidationIssue } from '../types/tng-flow-validation.types';

const issues: readonly TngFlowValidationIssue[] = [
  {
    id: 'flow-info',
    code: 'flow-info',
    severity: 'info',
    message: 'Flow information',
    target: { kind: 'flow' },
  },
  {
    id: 'node-warning',
    code: 'node-warning',
    severity: 'warning',
    message: 'Node warning',
    target: { kind: 'node', nodeId: 'node' },
  },
  {
    id: 'port-error',
    code: 'port-error',
    severity: 'error',
    message: 'Port error',
    target: { kind: 'port', nodeId: 'node', portId: 'input' },
  },
  {
    id: 'connection-warning',
    code: 'connection-warning',
    severity: 'warning',
    message: 'Connection warning',
    target: { kind: 'connection', connectionId: 'connection' },
  },
];

describe('TailNG flow issue projection', () => {
  it('indexes each discriminated target once', () => {
    const index = createTngFlowIssueIndex({ issues });

    expect(index.flowIssues).toEqual([issues[0]]);
    expect(index.nodeIssues.get('node')).toEqual([issues[1]]);
    expect(index.portIssues.get('node::input')).toEqual([issues[2]]);
    expect(index.connectionIssues.get('connection')).toEqual([issues[3]]);
  });

  it('resolves the highest severity independent of input order', () => {
    expect(resolveTngFlowValidationSeverity([issues[0], issues[2], issues[1]])).toBe('error');
    expect(resolveTngFlowValidationSeverity([issues[0], issues[1]])).toBe('warning');
    expect(resolveTngFlowValidationSeverity([])).toBeNull();
  });
});
