import { snapTngFlowCoordinate } from '../geometry/tng-flow-position';
import type {
  TngFlowArrangementOptions,
  TngFlowDistributionAxis,
  TngFlowNodeAlignment,
} from '../types/tng-flow-arrangement.types';
import type { TngFlowNodeBounds } from '../types/tng-flow-geometry.types';
import type { TngFlowNodeMove, TngFlowPoint } from '../types/tng-flow.types';

const POSITION_EPSILON = 0.001;

type ArrangementAxis = 'x' | 'y';

type ArrangementEntry = Readonly<{
  bounds: TngFlowNodeBounds;
  start: number;
  end: number;
  size: number;
  locked: boolean;
}>;
type AxisMoveRequest = Readonly<{
  axis: ArrangementAxis;
  coordinate: number;
  gridSize?: number;
}>;
type DistributionRun = Readonly<{
  entries: readonly ArrangementEntry[];
  startIndex: number;
  endIndex: number;
  axis: TngFlowDistributionAxis;
  gridSize?: number;
}>;
type AxisUnionBounds = Readonly<{
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}>;

/**
 * Aligns measured node bounds and returns position-only moves.
 *
 * Disabled nodes are ignored. Locked nodes are fixed anchors by default and can be excluded with
 * `lockedNodes: 'ignore'`.
 */
export function alignTngFlowNodes(
  bounds: readonly TngFlowNodeBounds[],
  alignment: TngFlowNodeAlignment,
  options: TngFlowArrangementOptions = {},
): readonly TngFlowNodeMove[] {
  validateBounds(bounds);
  const axis = alignmentAxis(alignment);
  const participants = arrangementParticipants(
    bounds,
    options,
    axis === 'x' ? 'horizontal' : 'vertical',
  );
  if (participants.length < 2) {
    return [];
  }

  const lockedAnchors = participants.filter((entry) => entry.locked);
  const reference = unionAxisBounds(lockedAnchors.length > 0 ? lockedAnchors : participants);
  const target = alignmentTarget(reference, alignment);

  return participants
    .filter((entry) => !entry.locked)
    .map((entry) => {
      const coordinate = alignedStart(entry, alignment, target);
      return moveAlongAxis(entry.bounds, { axis, coordinate, gridSize: options.gridSize });
    })
    .filter((move): move is TngFlowNodeMove => move !== null)
    .sort(compareMovesById);
}

/**
 * Distributes measured node bounds with equal edge-to-edge gaps and returns position-only moves.
 *
 * The spatially first and last participants remain fixed. Locked anchors partition the sequence
 * into independently distributed runs and are never returned as moves.
 */
export function distributeTngFlowNodes(
  bounds: readonly TngFlowNodeBounds[],
  axis: TngFlowDistributionAxis,
  options: TngFlowArrangementOptions = {},
): readonly TngFlowNodeMove[] {
  validateBounds(bounds);
  const participants = [...arrangementParticipants(bounds, options, axis)].sort(compareAxisEntries);
  if (participants.length < 3) {
    return [];
  }

  const anchorIndices = distributionAnchorIndices(participants);
  const moves: TngFlowNodeMove[] = [];
  for (let index = 0; index < anchorIndices.length - 1; index += 1) {
    moves.push(
      ...distributeBetweenAnchors({
        entries: participants,
        startIndex: anchorIndices[index],
        endIndex: anchorIndices[index + 1],
        axis,
        gridSize: options.gridSize,
      }),
    );
  }
  return moves.sort(compareMovesById);
}

function arrangementParticipants(
  bounds: readonly TngFlowNodeBounds[],
  options: TngFlowArrangementOptions,
  axis: TngFlowDistributionAxis,
): readonly ArrangementEntry[] {
  const includeLocked = (options.lockedNodes ?? 'anchor') === 'anchor';
  return bounds
    .filter((entry) => entry.disabled !== true)
    .filter((entry) => includeLocked || entry.locked !== true)
    .map((entry) => toAxisEntry(entry, axis));
}

function toAxisEntry(bounds: TngFlowNodeBounds, axis: TngFlowDistributionAxis): ArrangementEntry {
  const horizontal = axis === 'horizontal';
  const start = horizontal ? bounds.position.x : bounds.position.y;
  const size = horizontal ? bounds.size.width : bounds.size.height;
  return {
    bounds,
    start,
    end: start + size,
    size,
    locked: bounds.locked === true,
  };
}

function unionAxisBounds(entries: readonly ArrangementEntry[]): AxisUnionBounds {
  return entries.reduce(
    (union: AxisUnionBounds, entry: ArrangementEntry) => ({
      xStart: Math.min(union.xStart, entry.bounds.position.x),
      xEnd: Math.max(union.xEnd, entry.bounds.position.x + entry.bounds.size.width),
      yStart: Math.min(union.yStart, entry.bounds.position.y),
      yEnd: Math.max(union.yEnd, entry.bounds.position.y + entry.bounds.size.height),
    }),
    {
      xStart: Number.POSITIVE_INFINITY,
      xEnd: Number.NEGATIVE_INFINITY,
      yStart: Number.POSITIVE_INFINITY,
      yEnd: Number.NEGATIVE_INFINITY,
    },
  );
}

function alignmentTarget(
  reference: AxisUnionBounds,
  alignment: TngFlowNodeAlignment,
): number {
  switch (alignment) {
    case 'left':
      return reference.xStart;
    case 'horizontal-center':
      return (reference.xStart + reference.xEnd) / 2;
    case 'right':
      return reference.xEnd;
    case 'top':
      return reference.yStart;
    case 'vertical-center':
      return (reference.yStart + reference.yEnd) / 2;
    case 'bottom':
      return reference.yEnd;
  }
}

function alignedStart(
  entry: ArrangementEntry,
  alignment: TngFlowNodeAlignment,
  target: number,
): number {
  switch (alignment) {
    case 'left':
    case 'top':
      return target;
    case 'horizontal-center':
    case 'vertical-center':
      return target - entry.size / 2;
    case 'right':
    case 'bottom':
      return target - entry.size;
  }
}

function alignmentAxis(alignment: TngFlowNodeAlignment): ArrangementAxis {
  return alignment === 'left' || alignment === 'horizontal-center' || alignment === 'right'
    ? 'x'
    : 'y';
}

function distributionAnchorIndices(entries: readonly ArrangementEntry[]): readonly number[] {
  const indices = new Set<number>([0, entries.length - 1]);
  entries.forEach((entry, index) => {
    if (entry.locked) {
      indices.add(index);
    }
  });
  return [...indices].sort((left, right) => left - right);
}

function distributeBetweenAnchors(request: DistributionRun): readonly TngFlowNodeMove[] {
  const { entries, startIndex, endIndex, axis, gridSize } = request;
  const interior = entries.slice(startIndex + 1, endIndex);
  if (interior.length === 0) {
    return [];
  }
  const moves: TngFlowNodeMove[] = [];
  const leftAnchor = entries[startIndex];
  const rightAnchor = entries[endIndex];
  const interiorSize = interior.reduce((total, entry) => total + entry.size, 0);
  const gap = (rightAnchor.start - leftAnchor.end - interiorSize) / (interior.length + 1);
  let cursor = leftAnchor.end;
  for (const entry of interior) {
    const start = cursor + gap;
    if (!entry.locked) {
      const move = moveAlongAxis(entry.bounds, {
        axis: axis === 'horizontal' ? 'x' : 'y',
        coordinate: start,
        gridSize,
      });
      if (move !== null) {
        moves.push(move);
      }
    }
    cursor = start + entry.size;
  }
  return moves;
}

function moveAlongAxis(
  bounds: TngFlowNodeBounds,
  request: AxisMoveRequest,
): TngFlowNodeMove | null {
  const { axis, coordinate, gridSize } = request;
  const normalizedCoordinate = snapTngFlowCoordinate(coordinate, gridSize);
  const position: TngFlowPoint =
    axis === 'x'
      ? { x: normalizedCoordinate, y: bounds.position.y }
      : { x: bounds.position.x, y: normalizedCoordinate };
  return positionsMatch(bounds.position, position) ? null : { id: bounds.id, position };
}

function positionsMatch(left: TngFlowPoint, right: TngFlowPoint): boolean {
  return (
    Math.abs(left.x - right.x) < POSITION_EPSILON && Math.abs(left.y - right.y) < POSITION_EPSILON
  );
}

function compareAxisEntries(left: ArrangementEntry, right: ArrangementEntry): number {
  return (
    left.start - right.start ||
    left.end - right.end ||
    left.bounds.id.localeCompare(right.bounds.id)
  );
}

function compareMovesById(left: TngFlowNodeMove, right: TngFlowNodeMove): number {
  return left.id.localeCompare(right.id);
}

function validateBounds(bounds: readonly TngFlowNodeBounds[]): void {
  const ids = new Set<string>();
  for (const entry of bounds) {
    if (ids.has(entry.id)) {
      throw new Error(`Flow arrangement received duplicate node bounds for "${entry.id}".`);
    }
    ids.add(entry.id);
    if (hasInvalidGeometry(entry)) {
      throw new Error(`Flow arrangement received invalid bounds for node "${entry.id}".`);
    }
  }
}

function hasInvalidGeometry(entry: TngFlowNodeBounds): boolean {
  return (
    !Number.isFinite(entry.position.x) ||
    !Number.isFinite(entry.position.y) ||
    !Number.isFinite(entry.size.width) ||
    !Number.isFinite(entry.size.height) ||
    entry.size.width < 0 ||
    entry.size.height < 0
  );
}
