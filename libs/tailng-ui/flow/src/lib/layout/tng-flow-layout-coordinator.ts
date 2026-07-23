import {
  isTngFlowGridEnabled,
  normalizeTngFlowCoordinate,
  snapTngFlowPoint,
} from '../geometry/tng-flow-position';
import type {
  TngFlowAutoLayoutOptions,
  TngFlowLayoutEngine,
  TngFlowLayoutGraph,
  TngResolvedFlowLayoutOptions,
  TngResolvedFlowLayoutViewportOptions,
} from '../types/tng-flow-layout.types';
import type { TngFlowNodeMove, TngFlowPoint } from '../types/tng-flow.types';

const DEFAULT_LAYOUT_OPTIONS: TngResolvedFlowLayoutOptions = Object.freeze({
  direction: 'left-to-right',
  nodeSpacing: 48,
  levelSpacing: 120,
  componentSpacing: 64,
  preserveLockedNodes: true,
  includeDisconnectedNodes: true,
});
const DEFAULT_VIEWPORT_OPTIONS: TngResolvedFlowLayoutViewportOptions = Object.freeze({
  fit: false,
  animated: false,
  padding: 48,
});
const POSITION_TOLERANCE = 0.5;

export type TngFlowLayoutCalculation = Readonly<{
  nodes: readonly TngFlowNodeMove[];
  options: TngResolvedFlowLayoutOptions;
  viewport: TngResolvedFlowLayoutViewportOptions;
}>;

export type TngFlowLayoutPolicy = Readonly<{
  snapToGrid: boolean;
  gridSize: number;
}>;

export type TngFlowLayoutCalculationRequest<TNodeData, TConnectionData> = Readonly<{
  engine: TngFlowLayoutEngine<TNodeData, TConnectionData>;
  graph: TngFlowLayoutGraph<TNodeData, TConnectionData>;
  autoLayout: TngFlowAutoLayoutOptions;
  policy: TngFlowLayoutPolicy;
}>;

export async function calculateTngFlowLayout<TNodeData, TConnectionData>(
  request: TngFlowLayoutCalculationRequest<TNodeData, TConnectionData>,
): Promise<TngFlowLayoutCalculation> {
  const options = resolveTngFlowLayoutOptions(request.autoLayout);
  const viewport = resolveTngFlowLayoutViewportOptions(request.autoLayout);
  const calculated = await request.engine.calculate(request.graph, options);
  const nodes = normalizeCalculatedMoves(request.graph, calculated, {
    options,
    policy: request.policy,
  });
  return { nodes, options, viewport };
}

export function resolveTngFlowLayoutOptions(
  options: TngFlowAutoLayoutOptions,
): TngResolvedFlowLayoutOptions {
  return {
    direction: options.direction ?? DEFAULT_LAYOUT_OPTIONS.direction,
    nodeSpacing: nonNegative(options.nodeSpacing, DEFAULT_LAYOUT_OPTIONS.nodeSpacing),
    levelSpacing: nonNegative(options.levelSpacing, DEFAULT_LAYOUT_OPTIONS.levelSpacing),
    componentSpacing: nonNegative(
      options.componentSpacing,
      DEFAULT_LAYOUT_OPTIONS.componentSpacing,
    ),
    preserveLockedNodes: options.preserveLockedNodes ?? DEFAULT_LAYOUT_OPTIONS.preserveLockedNodes,
    includeDisconnectedNodes:
      options.includeDisconnectedNodes ?? DEFAULT_LAYOUT_OPTIONS.includeDisconnectedNodes,
  };
}

export function resolveTngFlowLayoutViewportOptions(
  options: TngFlowAutoLayoutOptions,
): TngResolvedFlowLayoutViewportOptions {
  return {
    fit: options.viewport?.fit ?? DEFAULT_VIEWPORT_OPTIONS.fit,
    animated: options.viewport?.animated ?? DEFAULT_VIEWPORT_OPTIONS.animated,
    padding: nonNegative(options.viewport?.padding, DEFAULT_VIEWPORT_OPTIONS.padding),
  };
}

function normalizeCalculatedMoves<TNodeData, TConnectionData>(
  graph: TngFlowLayoutGraph<TNodeData, TConnectionData>,
  moves: readonly TngFlowNodeMove[],
  context: Readonly<{
    options: TngResolvedFlowLayoutOptions;
    policy: TngFlowLayoutPolicy;
  }>,
): readonly TngFlowNodeMove[] {
  const nodesById = new Map(graph.nodes.map((entry) => [entry.node.id, entry]));
  const movesById = indexCalculatedMoves(moves, nodesById);
  const anchorOffset = findLockedAnchorOffset(graph, movesById, context.options);
  return [...nodesById.keys()].sort().flatMap((id) => {
    const entry = nodesById.get(id);
    const move = movesById.get(id);
    if (
      entry === undefined ||
      move === undefined ||
      isPreserved(entry.bounds.locked, context.options)
    ) {
      return [];
    }
    const translated = translatePoint(move.position, anchorOffset);
    const position = normalizePosition(translated, context.policy);
    return positionsMatch(entry.node.position, position) ? [] : [{ id, position }];
  });
}

function indexCalculatedMoves<TNodeData, TConnectionData>(
  moves: readonly TngFlowNodeMove[],
  nodesById: Readonly<
    ReadonlyMap<string, TngFlowLayoutGraph<TNodeData, TConnectionData>['nodes'][number]>
  >,
): ReadonlyMap<string, TngFlowNodeMove> {
  const indexed = new Map<string, TngFlowNodeMove>();
  for (const move of moves) {
    if (!nodesById.has(move.id) || indexed.has(move.id) || !isFinitePoint(move.position)) {
      throw new Error(`Layout engine returned an invalid move for node "${move.id}".`);
    }
    indexed.set(move.id, move);
  }
  return indexed;
}

function findLockedAnchorOffset<TNodeData, TConnectionData>(
  graph: TngFlowLayoutGraph<TNodeData, TConnectionData>,
  movesById: Readonly<ReadonlyMap<string, TngFlowNodeMove>>,
  options: TngResolvedFlowLayoutOptions,
): TngFlowPoint {
  if (!options.preserveLockedNodes) {
    return { x: 0, y: 0 };
  }
  const anchor = [...graph.nodes]
    .filter((entry) => entry.bounds.locked === true && movesById.has(entry.node.id))
    .sort((left, right) => left.node.id.localeCompare(right.node.id))[0];
  const calculated = anchor === undefined ? undefined : movesById.get(anchor.node.id);
  return anchor === undefined || calculated === undefined
    ? { x: 0, y: 0 }
    : {
        x: anchor.node.position.x - calculated.position.x,
        y: anchor.node.position.y - calculated.position.y,
      };
}

function normalizePosition(point: TngFlowPoint, policy: TngFlowLayoutPolicy): TngFlowPoint {
  return policy.snapToGrid && isTngFlowGridEnabled(policy.gridSize)
    ? snapTngFlowPoint(point, policy.gridSize)
    : {
        x: normalizeTngFlowCoordinate(point.x),
        y: normalizeTngFlowCoordinate(point.y),
      };
}

function translatePoint(point: TngFlowPoint, offset: TngFlowPoint): TngFlowPoint {
  return { x: point.x + offset.x, y: point.y + offset.y };
}

function isFinitePoint(point: TngFlowPoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function isPreserved(locked: boolean | undefined, options: TngResolvedFlowLayoutOptions): boolean {
  return options.preserveLockedNodes && locked === true;
}

function positionsMatch(left: TngFlowPoint, right: TngFlowPoint): boolean {
  return (
    Math.abs(left.x - right.x) <= POSITION_TOLERANCE &&
    Math.abs(left.y - right.y) <= POSITION_TOLERANCE
  );
}

function nonNegative(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}
