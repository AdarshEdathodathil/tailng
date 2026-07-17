import { createTngFlowConnectorId } from './tng-flow-connector-id';
import type {
  TngFlowConnection,
  TngFlowConnectionCandidate,
  TngFlowEndpoint,
  TngFlowLegacyPort,
  TngFlowNode,
  TngFlowPort,
  TngFlowPortDirection,
} from '../types/tng-flow.types';

export type TngFlowPortRecord<TNodeData = unknown> = Readonly<{
  connectorId: string;
  endpoint: TngFlowEndpoint;
  node: TngFlowNode<TNodeData>;
  port: TngFlowPort;
}>;

export type TngFlowGraphIndex<TNodeData = unknown, TConnectionData = unknown> = Readonly<{
  nodesById: ReadonlyMap<string, TngFlowNode<TNodeData>>;
  portsByConnectorId: ReadonlyMap<string, TngFlowPortRecord<TNodeData>>;
  connectionsById: ReadonlyMap<string, TngFlowConnection<TConnectionData>>;
  portRecords: readonly TngFlowPortRecord<TNodeData>[];
}>;

function normalizeLegacyPort(
  port: TngFlowLegacyPort,
  direction: TngFlowPortDirection,
): TngFlowPort {
  return {
    ...port,
    direction,
    kind: port.kind ?? 'data',
  };
}

export function getTngFlowNodePorts<TNodeData>(
  node: TngFlowNode<TNodeData>,
): readonly TngFlowPort[] {
  if (node.ports !== undefined) {
    return node.ports;
  }

  return [
    ...(node.inputs ?? []).map((port) => normalizeLegacyPort(port, 'input')),
    ...(node.outputs ?? []).map((port) => normalizeLegacyPort(port, 'output')),
  ];
}

function createPortRecord<TNodeData>(
  node: TngFlowNode<TNodeData>,
  port: TngFlowPort,
): TngFlowPortRecord<TNodeData> {
  const endpoint = { nodeId: node.id, portId: port.id };
  return {
    connectorId: createTngFlowConnectorId(node.id, port.id),
    endpoint,
    node,
    port,
  };
}

function indexPortRecords<TNodeData>(
  nodes: readonly TngFlowNode<TNodeData>[],
): readonly TngFlowPortRecord<TNodeData>[] {
  return nodes.flatMap((node) =>
    getTngFlowNodePorts(node).map((port) => createPortRecord(node, port)),
  );
}

export function createTngFlowGraphIndex<TNodeData, TConnectionData>(
  nodes: readonly TngFlowNode<TNodeData>[],
  connections: readonly TngFlowConnection<TConnectionData>[],
): TngFlowGraphIndex<TNodeData, TConnectionData> {
  const portRecords = indexPortRecords(nodes);
  return {
    nodesById: new Map(nodes.map((node) => [node.id, node])),
    portsByConnectorId: new Map(portRecords.map((record) => [record.connectorId, record])),
    connectionsById: new Map(connections.map((connection) => [connection.id, connection])),
    portRecords,
  };
}

function createCandidateFromRecords<TNodeData>(
  source: TngFlowPortRecord<TNodeData>,
  target: TngFlowPortRecord<TNodeData>,
): TngFlowConnectionCandidate<TNodeData> {
  return {
    source: source.endpoint,
    target: target.endpoint,
    sourceNode: source.node,
    sourcePort: source.port,
    targetNode: target.node,
    targetPort: target.port,
  };
}

export function createTngFlowConnectionCandidate<TNodeData>(
  first: TngFlowPortRecord<TNodeData>,
  second: TngFlowPortRecord<TNodeData>,
): TngFlowConnectionCandidate<TNodeData> {
  if (first.port.direction === 'input' && second.port.direction === 'output') {
    return createCandidateFromRecords(second, first);
  }

  return createCandidateFromRecords(first, second);
}

export function tngFlowConnectionPairKey(source: TngFlowEndpoint, target: TngFlowEndpoint): string {
  return JSON.stringify([source.nodeId, source.portId, target.nodeId, target.portId]);
}
