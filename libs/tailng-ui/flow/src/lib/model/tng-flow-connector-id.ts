import type { TngFlowEndpoint } from '../types/tng-flow.types';

const CONNECTOR_ID_SEPARATOR = '::';

export function createTngFlowConnectorId(nodeId: string, portId: string): string {
  return `${encodeURIComponent(nodeId)}${CONNECTOR_ID_SEPARATOR}${encodeURIComponent(portId)}`;
}

export function parseTngFlowConnectorId(connectorId: string): TngFlowEndpoint | undefined {
  const parts = connectorId.split(CONNECTOR_ID_SEPARATOR);
  if (parts.length !== 2) {
    return undefined;
  }

  try {
    return {
      nodeId: decodeURIComponent(parts[0]),
      portId: decodeURIComponent(parts[1]),
    };
  } catch {
    return undefined;
  }
}
