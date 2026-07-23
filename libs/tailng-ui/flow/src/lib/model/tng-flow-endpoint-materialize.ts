import type {
  TngFlowDefinition,
  TngFlowEndpoint,
  TngFlowNode,
  TngFlowPort,
  TngFlowPortDirection,
} from '../types/tng-flow.types';
import { getTngFlowNodePorts } from './tng-flow-graph';

export type TngFlowMaterializedEndpointResult<TNodeData = unknown> = Readonly<{
  endpoint: TngFlowEndpoint;
  nodes: readonly TngFlowNode<TNodeData>[];
}>;

export type TngFlowEndpointMaterializeOptions = Readonly<{
  /** Port ids that trigger materialization when used as a connection endpoint. */
  creatorPortIds: Readonly<{
    input: string;
    output: string;
  }>;
  /** Prefix for generated unique connection port ids, e.g. `connection-`. */
  connectionPortPrefix: string;
  /** Builds the materialized port. Defaults to a data port with a numbered name. */
  createPort?: (
    portId: string,
    direction: TngFlowPortDirection,
    portNumber: number,
    node: TngFlowNode,
  ) => TngFlowPort;
}>;

function defaultCreatePort(
  portId: string,
  direction: TngFlowPortDirection,
  portNumber: number,
): TngFlowPort {
  const label =
    direction === 'input'
      ? portNumber === 1
        ? 'Input'
        : `Input ${portNumber}`
      : portNumber === 1
        ? 'Output'
        : `Output ${portNumber}`;
  return {
    id: portId,
    name: label,
    direction,
    kind: 'data',
    multiple: false,
  };
}

function creatorIdFor(
  options: TngFlowEndpointMaterializeOptions,
  direction: TngFlowPortDirection,
): string {
  return direction === 'input' ? options.creatorPortIds.input : options.creatorPortIds.output;
}

function isMaterializedConnectionPort(
  portId: string,
  connectionPortPrefix: string,
): boolean {
  return portId.startsWith(connectionPortPrefix);
}

function nextConnectionPortNumber<TNodeData>(
  node: TngFlowNode<TNodeData>,
  direction: TngFlowPortDirection,
  options: TngFlowEndpointMaterializeOptions,
): number {
  const prefix = `${options.connectionPortPrefix}${direction}-`;
  const numbers = getTngFlowNodePorts(node)
    .filter((port) => port.id.startsWith(prefix))
    .map((port) => Number(port.id.slice(prefix.length)))
    .filter(Number.isFinite);
  return Math.max(0, ...numbers) + 1;
}

function insertBeforeCreator(
  ports: readonly TngFlowPort[],
  port: TngFlowPort,
  options: TngFlowEndpointMaterializeOptions,
): readonly TngFlowPort[] {
  const creatorId = creatorIdFor(options, port.direction);
  const creatorIndex = ports.findIndex((candidate) => candidate.id === creatorId);
  if (creatorIndex < 0) {
    return [...ports, port];
  }
  return [...ports.slice(0, creatorIndex), port, ...ports.slice(creatorIndex)];
}

/**
 * When `endpoint.portId` is a creator port, inserts a unique connection port and
 * returns the updated endpoint. Otherwise returns the endpoint unchanged.
 */
export function materializeTngFlowEndpoint<TNodeData = unknown>(
  nodes: readonly TngFlowNode<TNodeData>[],
  endpoint: TngFlowEndpoint,
  direction: TngFlowPortDirection,
  options: TngFlowEndpointMaterializeOptions,
): TngFlowMaterializedEndpointResult<TNodeData> {
  const creatorId = creatorIdFor(options, direction);
  if (endpoint.portId !== creatorId) {
    return { endpoint, nodes };
  }

  const node = nodes.find((candidate) => candidate.id === endpoint.nodeId);
  if (node === undefined) {
    return { endpoint, nodes };
  }

  const portNumber = nextConnectionPortNumber(node, direction, options);
  const portId = `${options.connectionPortPrefix}${direction}-${portNumber}`;
  const createPort = options.createPort ?? defaultCreatePort;
  const port = createPort(portId, direction, portNumber, node);

  return {
    endpoint: { nodeId: endpoint.nodeId, portId },
    nodes: nodes.map((candidate) =>
      candidate.id === endpoint.nodeId
        ? {
            ...candidate,
            ports: insertBeforeCreator(getTngFlowNodePorts(candidate), port, options),
          }
        : candidate,
    ),
  };
}

/**
 * Removes materialized connection ports that are not referenced by any connection.
 * Creator ports and non-prefixed ports are retained.
 */
export function pruneUnusedTngFlowConnectionPorts<
  TNodeData = unknown,
  TConnectionData = unknown,
>(
  definition: TngFlowDefinition<TNodeData, TConnectionData>,
  options: Pick<TngFlowEndpointMaterializeOptions, 'connectionPortPrefix'>,
): TngFlowDefinition<TNodeData, TConnectionData> {
  const usedPorts = new Set(
    definition.connections.flatMap((connection) => [
      `${connection.source.nodeId}:${connection.source.portId}`,
      `${connection.target.nodeId}:${connection.target.portId}`,
    ]),
  );

  return {
    ...definition,
    nodes: definition.nodes.map((node) => ({
      ...node,
      ports: getTngFlowNodePorts(node).filter(
        (port) =>
          !isMaterializedConnectionPort(port.id, options.connectionPortPrefix) ||
          usedPorts.has(`${node.id}:${port.id}`),
      ),
    })),
  };
}

/**
 * Materializes both endpoints of a create/reconnect request, returning updated nodes
 * and concrete endpoints.
 */
export function materializeTngFlowConnectionEndpoints<TNodeData = unknown>(
  nodes: readonly TngFlowNode<TNodeData>[],
  source: TngFlowEndpoint,
  target: TngFlowEndpoint,
  options: TngFlowEndpointMaterializeOptions,
): Readonly<{
  source: TngFlowEndpoint;
  target: TngFlowEndpoint;
  nodes: readonly TngFlowNode<TNodeData>[];
}> {
  const materializedSource = materializeTngFlowEndpoint(nodes, source, 'output', options);
  const materializedTarget = materializeTngFlowEndpoint(
    materializedSource.nodes,
    target,
    'input',
    options,
  );
  return {
    source: materializedSource.endpoint,
    target: materializedTarget.endpoint,
    nodes: materializedTarget.nodes,
  };
}

export function isTngFlowCreatorPort(
  portId: string,
  options: Pick<TngFlowEndpointMaterializeOptions, 'creatorPortIds'>,
): boolean {
  return (
    portId === options.creatorPortIds.input || portId === options.creatorPortIds.output
  );
}
