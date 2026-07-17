import { tngFlowConnectionPairKey } from '../model/tng-flow-graph';
import type {
  TngFlowConnection,
  TngFlowConnectionCandidate,
  TngFlowConnectionValidation,
  TngFlowEndpoint,
  TngFlowPort,
} from '../types/tng-flow.types';

const VALID_CONNECTION: TngFlowConnectionValidation = Object.freeze({ valid: true });

function invalid(reason: string): TngFlowConnectionValidation {
  return { valid: false, reason };
}

function validateDirection(candidate: TngFlowConnectionCandidate): TngFlowConnectionValidation {
  if (candidate.sourcePort.direction !== 'output') {
    return invalid('Connections must start from an output port.');
  }
  if (candidate.targetPort.direction !== 'input') {
    return invalid('Connections must end at an input port.');
  }
  return VALID_CONNECTION;
}

function validateAvailability(candidate: TngFlowConnectionCandidate): TngFlowConnectionValidation {
  if (candidate.sourceNode.disabled === true || candidate.targetNode.disabled === true) {
    return invalid('Disabled nodes cannot accept new connections.');
  }
  if (candidate.sourcePort.disabled === true || candidate.targetPort.disabled === true) {
    return invalid('Disabled ports cannot accept new connections.');
  }
  return VALID_CONNECTION;
}

function validateRelationship(candidate: TngFlowConnectionCandidate): TngFlowConnectionValidation {
  const isSelfConnection = candidate.source.nodeId === candidate.target.nodeId;
  if (isSelfConnection && candidate.sourcePort.allowSelfConnection !== true) {
    return invalid('Connections to the same node are not allowed for this port.');
  }
  if (candidate.sourcePort.kind !== candidate.targetPort.kind) {
    return invalid('Source and target port kinds are incompatible.');
  }
  return VALID_CONNECTION;
}

function relevantConnections<TConnectionData>(
  connections: readonly TngFlowConnection<TConnectionData>[],
  excludeConnectionId: string | undefined,
): readonly TngFlowConnection<TConnectionData>[] {
  return connections.filter((connection) => connection.id !== excludeConnectionId);
}

function hasDuplicate<TConnectionData>(
  candidate: TngFlowConnectionCandidate,
  connections: readonly TngFlowConnection<TConnectionData>[],
): boolean {
  const candidateKey = tngFlowConnectionPairKey(candidate.source, candidate.target);
  return connections.some(
    (connection) => tngFlowConnectionPairKey(connection.source, connection.target) === candidateKey,
  );
}

function isSameEndpoint(first: TngFlowEndpoint, second: TngFlowEndpoint): boolean {
  return first.nodeId === second.nodeId && first.portId === second.portId;
}

function connectionCount<TConnectionData>(
  endpoint: TngFlowEndpoint,
  connections: readonly TngFlowConnection<TConnectionData>[],
): number {
  return connections.filter(
    (connection) =>
      isSameEndpoint(connection.source, endpoint) || isSameEndpoint(connection.target, endpoint),
  ).length;
}

function validatePortCapacity<TConnectionData>(
  endpoint: TngFlowEndpoint,
  port: TngFlowPort,
  connections: readonly TngFlowConnection<TConnectionData>[],
): TngFlowConnectionValidation {
  if (port.multiple === true || connectionCount(endpoint, connections) === 0) {
    return VALID_CONNECTION;
  }
  return invalid(`Port "${port.name ?? port.label ?? port.id}" accepts only one connection.`);
}

function validateMultiplicity<TConnectionData>(
  candidate: TngFlowConnectionCandidate,
  connections: readonly TngFlowConnection<TConnectionData>[],
): TngFlowConnectionValidation {
  const sourceResult = validatePortCapacity(candidate.source, candidate.sourcePort, connections);
  if (!sourceResult.valid) {
    return sourceResult;
  }
  return validatePortCapacity(candidate.target, candidate.targetPort, connections);
}

export function validateTngFlowConnectionCandidate<TConnectionData>(
  candidate: TngFlowConnectionCandidate,
  connections: readonly TngFlowConnection<TConnectionData>[],
  excludeConnectionId?: string,
): TngFlowConnectionValidation {
  const validators = [validateDirection, validateAvailability, validateRelationship] as const;
  for (const validator of validators) {
    const result = validator(candidate);
    if (!result.valid) {
      return result;
    }
  }

  const relevant = relevantConnections(connections, excludeConnectionId);
  if (hasDuplicate(candidate, relevant)) {
    return invalid('This connection already exists.');
  }
  return validateMultiplicity(candidate, relevant);
}
