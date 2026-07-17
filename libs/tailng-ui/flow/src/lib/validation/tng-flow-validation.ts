/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- Validation accumulates issues in private mutable maps and arrays. */
import { createTngFlowConnectorId } from '../model/tng-flow-connector-id';
import { getTngFlowNodePorts, tngFlowConnectionPairKey } from '../model/tng-flow-graph';
import type { TngFlowConnection, TngFlowNode, TngFlowPort } from '../types/tng-flow.types';

export type TngFlowValidationIssueCode =
  | 'duplicate-connection-id'
  | 'duplicate-connection'
  | 'duplicate-node-id'
  | 'duplicate-port-id'
  | 'empty-connection-id'
  | 'empty-node-id'
  | 'empty-port-id'
  | 'incompatible-ports'
  | 'incompatible-port-kind'
  | 'invalid-source-port'
  | 'invalid-target-port'
  | 'missing-source-port'
  | 'missing-target-port'
  | 'mixed-port-model'
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
  connectionPairs: Set<string>;
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
    connectionPairs: new Set(),
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

  const id = createTngFlowConnectorId(nodeId, port.id);
  if (state.ports.has(id)) {
    state.issues.push({
      code: 'duplicate-port-id',
      message: `Port id "${port.id}" is used more than once on node "${nodeId}".`,
      nodeId,
      portId: port.id,
    });
    return;
  }

  state.ports.set(id, record);
}

function registerNode(node: TngFlowNode, state: ValidationState): void {
  validateNodeId(node, state);
  if (node.ports !== undefined && (node.inputs !== undefined || node.outputs !== undefined)) {
    state.issues.push({
      code: 'mixed-port-model',
      message: `Node "${node.id}" mixes canonical ports with legacy inputs or outputs.`,
      nodeId: node.id,
    });
  }
  for (const port of getTngFlowNodePorts(node)) {
    registerPort({ direction: port.direction, nodeId: node.id, port }, state);
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
      message: `Connection "${connection.id}" references missing source port "${connection.source.portId}" on node "${connection.source.nodeId}".`,
      connectionId: connection.id,
      nodeId: connection.source.nodeId,
      portId: connection.source.portId,
    });
  } else if (source.direction !== 'output') {
    issues.push({
      code: 'invalid-source-port',
      message: `Connection "${connection.id}" uses input port "${connection.source.portId}" as its source.`,
      connectionId: connection.id,
      nodeId: connection.source.nodeId,
      portId: connection.source.portId,
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
      message: `Connection "${connection.id}" references missing target port "${connection.target.portId}" on node "${connection.target.nodeId}".`,
      connectionId: connection.id,
      nodeId: connection.target.nodeId,
      portId: connection.target.portId,
    });
  } else if (target.direction !== 'input') {
    issues.push({
      code: 'invalid-target-port',
      message: `Connection "${connection.id}" uses output port "${connection.target.portId}" as its target.`,
      connectionId: connection.id,
      nodeId: connection.target.nodeId,
      portId: connection.target.portId,
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

  if (source.port.kind !== target.port.kind) {
    issues.push({
      code: 'incompatible-port-kind',
      message: `Source port "${source.port.id}" and target port "${target.port.id}" have different kinds.`,
      connectionId: connection.id,
    });
  }

  if (source.nodeId === target.nodeId && source.port.allowSelfConnection !== true) {
    issues.push({
      code: 'self-connection-disabled',
      message: `Source port "${source.port.id}" does not allow connections to its own node.`,
      connectionId: connection.id,
      nodeId: source.nodeId,
      portId: source.port.id,
    });
  }
}

function validateConnectionPair(connection: TngFlowConnection, state: ValidationState): void {
  const pair = tngFlowConnectionPairKey(connection.source, connection.target);
  if (state.connectionPairs.has(pair)) {
    state.issues.push({
      code: 'duplicate-connection',
      message: `Connection "${connection.id}" duplicates an existing endpoint pair.`,
      connectionId: connection.id,
    });
  }
  state.connectionPairs.add(pair);
}

function countConnection(portId: string, state: ValidationState): void {
  state.connectionCounts.set(portId, (state.connectionCounts.get(portId) ?? 0) + 1);
}

function validateConnection(connection: TngFlowConnection, state: ValidationState): void {
  validateConnectionId(connection, state);
  validateConnectionPair(connection, state);
  const sourceId = createTngFlowConnectorId(connection.source.nodeId, connection.source.portId);
  const targetId = createTngFlowConnectorId(connection.target.nodeId, connection.target.portId);
  const source = state.ports.get(sourceId);
  const target = state.ports.get(targetId);
  validateSource(connection, source, state.issues);
  validateTarget(connection, target, state.issues);

  if (source?.direction === 'output' && target?.direction === 'input') {
    validateResolvedConnection({ connection, source, target }, state.issues);
  }

  countConnection(sourceId, state);
  countConnection(targetId, state);
}

function validateConnectionLimits(state: ValidationState): void {
  for (const [connectorId, count] of state.connectionCounts) {
    const record = state.ports.get(connectorId);
    if (count <= 1 || record === undefined || record.port.multiple === true) {
      continue;
    }

    state.issues.push({
      code: 'port-connection-limit',
      message: `Port "${record.port.id}" has ${count} connections but is not marked as multiple.`,
      nodeId: record.nodeId,
      portId: record.port.id,
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
