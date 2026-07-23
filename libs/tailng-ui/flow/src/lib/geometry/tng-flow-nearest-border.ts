import { createTngFlowConnectorId } from '../model/tng-flow-connector-id';
import type { TngFlowNodeBounds, TngFlowSize } from '../types/tng-flow-geometry.types';
import type {
  TngFlowConnection,
  TngFlowPoint,
  TngFlowPortSide,
} from '../types/tng-flow.types';

/** Default size used when a node has not been measured yet. */
export const DEFAULT_TNG_FLOW_NODE_SIZE: TngFlowSize = Object.freeze({
  width: 280,
  height: 112,
});

export type TngFlowNearestBorderNode = Readonly<{
  id: string;
  position: TngFlowPoint;
  size?: TngFlowSize;
}>;

export type TngFlowNearestBorderFacingSides = Readonly<{
  sourceSide: TngFlowPortSide;
  targetSide: TngFlowPortSide;
}>;

/**
 * Picks facing borders for a source→target pair from node centers.
 * Dominant axis wins; on equal |Δx| and |Δy|, horizontal wins; on a zero delta,
 * the pair defaults to source `right` / target `left`.
 */
export function resolveTngFlowFacingSides(
  source: TngFlowNearestBorderNode,
  target: TngFlowNearestBorderNode,
): TngFlowNearestBorderFacingSides {
  const sourceCenter = nodeCenter(source);
  const targetCenter = nodeCenter(target);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx === 0 && absDy === 0) {
    return { sourceSide: 'right', targetSide: 'left' };
  }

  if (absDx >= absDy) {
    return dx >= 0
      ? { sourceSide: 'right', targetSide: 'left' }
      : { sourceSide: 'left', targetSide: 'right' };
  }

  return dy >= 0
    ? { sourceSide: 'bottom', targetSide: 'top' }
    : { sourceSide: 'top', targetSide: 'bottom' };
}

/**
 * Resolves connectable sides for every connected endpoint. Unconnected ports are
 * omitted so callers can keep declared/default sides for creator sockets.
 */
export function resolveTngFlowNearestBorderSides<TConnectionData>(
  nodes: readonly TngFlowNearestBorderNode[],
  connections: readonly TngFlowConnection<TConnectionData>[],
): ReadonlyMap<string, TngFlowPortSide> {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const sides = new Map<string, TngFlowPortSide>();

  for (const connection of connections) {
    const source = nodesById.get(connection.source.nodeId);
    const target = nodesById.get(connection.target.nodeId);
    if (source === undefined || target === undefined) {
      continue;
    }
    const facing = resolveTngFlowFacingSides(source, target);
    sides.set(
      createTngFlowConnectorId(connection.source.nodeId, connection.source.portId),
      facing.sourceSide,
    );
    sides.set(
      createTngFlowConnectorId(connection.target.nodeId, connection.target.portId),
      facing.targetSide,
    );
  }

  return sides;
}

export function tngFlowBoundsToNearestBorderNode(
  bounds: TngFlowNodeBounds,
): TngFlowNearestBorderNode {
  return {
    id: bounds.id,
    position: bounds.position,
    size: bounds.size,
  };
}

function nodeCenter(node: TngFlowNearestBorderNode): TngFlowPoint {
  const size = node.size ?? DEFAULT_TNG_FLOW_NODE_SIZE;
  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
}
