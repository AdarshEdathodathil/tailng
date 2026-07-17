/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- Validation accumulates issues in private mutable maps and arrays. */
import type { TngFlowConnection, TngFlowNode, TngFlowPort } from '../types/tng-flow.types';

export type TngFlowValidationIssueCode =
  | 'duplicate-connection-id'
  | 'duplicate-node-id'
  | 'duplicate-port-id'
  | 'empty-connection-id'
  | 'empty-node-id'
  | 'empty-port-id'
  | 'incompatible-ports'
  | 'invalid-source-port'
  | 'invalid-target-port'
  | 'missing-source-port'
  | 'missing-target-port'
  | 'port-connection-limit'
  | 'self-connection-disabled';

export type TngFlowValidationIssue = Readonly<{
  code: TngFlowValidationIssueCode;
  message: string;
  connectionId?: string;
  nodeId?: string;
  portId?: string;
}>;

type PortRecord = Readonly<{
  direction: 'input' | 'output';
  nodeId: string;
  port: TngFlowPort;
}>;

type ValidationState = {
  connectionCounts: Map<string, number>;
  connectionIds: Set<string>;
  issues: TngFlowValidationIssue[];
  nodeIds: Set<string>;
  ports: Map<string, PortRecord>;
};

type ResolvedConnection = Readonly<{
  connection: TngFlowConnection;
  source: PortRecord;
  target: PortRecord;
}>;

function createValidationState(): ValidationState {
  return {
    connectionCounts: new Map(),
    connectionIds: new Set(),
    issues: [],
    nodeIds: new Set(),
    ports: new Map(),
  };
}

function isNonEmptyId(value: string): boolean {
  return value.trim().length > 0;
}

function validateNodeId(node: TngFlowNode, state: ValidationState): void {
  if (!isNonEmptyId(node.id)) {
    state.issues.push({ code: 'empty-node-id', message: 'A node has an empty id.' });
    return;
  }

  if (state.nodeIds.has(node.id)) {
    state.issues.push({
      code: 'duplicate-node-id',
      message: `Node id "${node.id}" is used more than once.`,
      nodeId: node.id,
    });
    return;
  }

  state.nodeIds.add(node.id);
}

function registerPort(record: PortRecord, state: ValidationState): void {
  const { direction, nodeId, port } = record;
  if (!isNonEmptyId(port.id)) {
    state.issues.push({
      code: 'empty-port-id',
      message: `Node "${nodeId}" has an ${direction} port with an empty id.`,
      nodeId,
    });
    return;
  }

  if (state.ports.has(port.id)) {
    state.issues.push({
      code: 'duplicate-port-id',
      message: `Port id "${port.id}" is used more than once. Port ids must be globally unique.`,
      nodeId,
      portId: port.id,
    });
    return;
  }

  state.ports.set(port.id, record);
}

function registerNode(node: TngFlowNode, state: ValidationState): void {
  validateNodeId(node, state);
  for (const port of node.inputs ?? []) {
    registerPort({ direction: 'input', nodeId: node.id, port }, state);
  }
  for (const port of node.outputs ?? []) {
    registerPort({ direction: 'output', nodeId: node.id, port }, state);
  }
}

function validateConnectionId(connection: TngFlowConnection, state: ValidationState): void {
  if (!isNonEmptyId(connection.id)) {
    state.issues.push({ code: 'empty-connection-id', message: 'A connection has an empty id.' });
    return;
  }

  if (state.connectionIds.has(connection.id)) {
    state.issues.push({
      code: 'duplicate-connection-id',
      message: `Connection id "${connection.id}" is used more than once.`,
      connectionId: connection.id,
    });
    return;
  }

  state.connectionIds.add(connection.id);
}

function validateSource(
  connection: TngFlowConnection,
  source: PortRecord | undefined,
  issues: TngFlowValidationIssue[],
): void {
  if (source === undefined) {
    issues.push({
      code: 'missing-source-port',
      message: `Connection "${connection.id}" references missing source port "${connection.sourcePortId}".`,
      connectionId: connection.id,
      portId: connection.sourcePortId,
    });
  } else if (source.direction !== 'output') {
    issues.push({
      code: 'invalid-source-port',
      message: `Connection "${connection.id}" uses input port "${connection.sourcePortId}" as its source.`,
      connectionId: connection.id,
      portId: connection.sourcePortId,
    });
  }
}

function validateTarget(
  connection: TngFlowConnection,
  target: PortRecord | undefined,
  issues: TngFlowValidationIssue[],
): void {
  if (target === undefined) {
    issues.push({
      code: 'missing-target-port',
      message: `Connection "${connection.id}" references missing target port "${connection.targetPortId}".`,
      connectionId: connection.id,
      portId: connection.targetPortId,
    });
  } else if (target.direction !== 'input') {
    issues.push({
      code: 'invalid-target-port',
      message: `Connection "${connection.id}" uses output port "${connection.targetPortId}" as its target.`,
      connectionId: connection.id,
      portId: connection.targetPortId,
    });
  }
}

function acceptsTarget(source: TngFlowPort, target: TngFlowPort): boolean {
  const accepted = source.accepts ?? [];
  return (
    accepted.length === 0 ||
    accepted.includes(target.id) ||
    (target.category !== undefined && accepted.includes(target.category))
  );
}

function validateResolvedConnection(
  resolved: ResolvedConnection,
  issues: TngFlowValidationIssue[],
): void {
  const { connection, source, target } = resolved;
  if (!acceptsTarget(source.port, target.port)) {
    issues.push({
      code: 'incompatible-ports',
      message: `Source port "${source.port.id}" does not accept target port "${target.port.id}".`,
      connectionId: connection.id,
    });
  }

  if (source.nodeId === target.nodeId && source.port.allowSelfConnection === false) {
    issues.push({
      code: 'self-connection-disabled',
      message: `Source port "${source.port.id}" does not allow connections to its own node.`,
      connectionId: connection.id,
      nodeId: source.nodeId,
      portId: source.port.id,
    });
  }
}

function countConnection(portId: string, state: ValidationState): void {
  state.connectionCounts.set(portId, (state.connectionCounts.get(portId) ?? 0) + 1);
}

function validateConnection(connection: TngFlowConnection, state: ValidationState): void {
  validateConnectionId(connection, state);
  const source = state.ports.get(connection.sourcePortId);
  const target = state.ports.get(connection.targetPortId);
  validateSource(connection, source, state.issues);
  validateTarget(connection, target, state.issues);

  if (source?.direction === 'output' && target?.direction === 'input') {
    validateResolvedConnection({ connection, source, target }, state.issues);
  }

  countConnection(connection.sourcePortId, state);
  countConnection(connection.targetPortId, state);
}

function validateConnectionLimits(state: ValidationState): void {
  for (const [portId, count] of state.connectionCounts) {
    const record = state.ports.get(portId);
    if (count <= 1 || record === undefined || record.port.multiple === true) {
      continue;
    }

    state.issues.push({
      code: 'port-connection-limit',
      message: `Port "${portId}" has ${count} connections but is not marked as multiple.`,
      nodeId: record.nodeId,
      portId,
    });
  }
}

export function validateTngFlow(
  nodes: readonly TngFlowNode[],
  connections: readonly TngFlowConnection[],
): readonly TngFlowValidationIssue[] {
  const state = createValidationState();
  nodes.forEach((node) => registerNode(node, state));
  connections.forEach((connection) => validateConnection(connection, state));
  validateConnectionLimits(state);
  return state.issues;
}
