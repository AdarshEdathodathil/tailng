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
 * Picks attachment sides for a source→target pair from node centers.
 * Each endpoint independently uses the size-normalized exit side of the
 * center-to-center ray, so diagonal mixes (e.g. source `right` + target `top`)
 * are allowed. On equal normalized |Δx| and |Δy|, horizontal wins; coincident
 * centers default to source `right` / target `left`.
 */
export function resolveTngFlowFacingSides(
  source: TngFlowNearestBorderNode,
  target: TngFlowNearestBorderNode,
): TngFlowNearestBorderFacingSides {
  const sourceCenter = nodeCenter(source);
  const targetCenter = nodeCenter(target);

  if (sourceCenter.x === targetCenter.x && sourceCenter.y === targetCenter.y) {
    return { sourceSide: 'right', targetSide: 'left' };
  }

  return {
    sourceSide: exitSide(source, targetCenter),
    targetSide: exitSide(target, sourceCenter),
  };
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

/**
 * Border where the ray from the node's center toward `toward` exits the node rect.
 * Half-width / half-height normalize so wide and tall nodes pick the true exit edge.
 */
function exitSide(node: TngFlowNearestBorderNode, toward: TngFlowPoint): TngFlowPortSide {
  const center = nodeCenter(node);
  const size = node.size ?? DEFAULT_TNG_FLOW_NODE_SIZE;
  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;

  if (dx === 0 && dy === 0) {
    return 'right';
  }

  const tx = halfWidth === 0 ? Number.POSITIVE_INFINITY : Math.abs(dx) / halfWidth;
  const ty = halfHeight === 0 ? Number.POSITIVE_INFINITY : Math.abs(dy) / halfHeight;

  if (tx >= ty) {
    return dx >= 0 ? 'right' : 'left';
  }
  return dy >= 0 ? 'bottom' : 'top';
}

function nodeCenter(node: TngFlowNearestBorderNode): TngFlowPoint {
  const size = node.size ?? DEFAULT_TNG_FLOW_NODE_SIZE;
  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
}
