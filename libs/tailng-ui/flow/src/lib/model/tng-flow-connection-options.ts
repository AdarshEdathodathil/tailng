/* eslint-disable complexity, max-lines-per-function -- The resolver intentionally encodes compatibility and field-level precedence. */
import {
  DEFAULT_TNG_FLOW_CONNECTION_OPTIONS,
  type TngFlowConnectionLabelPlacement,
  type TngFlowConnectionMarker,
  type TngFlowConnectionPathType,
  type TngFlowDefaultConnectionOptions,
  type TngFlowEditorConnectionOptions,
} from '../types/tng-flow-connection.types';
import type {
  TngFlowConnection,
  TngFlowConnectionType,
  TngFlowPoint,
} from '../types/tng-flow.types';

const PATH_TYPES = new Set<TngFlowConnectionPathType>([
  'adaptive',
  'bezier',
  'orthogonal',
  'orthogonal-rounded',
  'straight',
]);
const MARKERS = new Set<TngFlowConnectionMarker>(['arrow', 'circle', 'diamond', 'none']);
const LABEL_PLACEMENTS = new Set<TngFlowConnectionLabelPlacement>(['center', 'end', 'start']);

export type TngResolvedFlowConnectionOptions = Readonly<{
  routing: Readonly<{
    type: TngFlowConnectionPathType;
    offset: number;
    radius: number;
    waypoints: readonly TngFlowPoint[];
  }>;
  sourceMarker: TngFlowConnectionMarker;
  targetMarker: TngFlowConnectionMarker;
  labelPlacement: TngFlowConnectionLabelPlacement;
  labelOffset: number;
  labelOffsetX: number;
  labelOffsetY: number;
}>;

function finiteNonNegative(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function legacyPathType(
  value: TngFlowConnectionType | undefined,
): TngFlowConnectionPathType | null {
  switch (value) {
    case 'adaptive-curve':
      return 'adaptive';
    case 'segment':
      return 'orthogonal-rounded';
    case 'bezier':
    case 'straight':
      return value;
    case undefined:
      return null;
  }
}

function pathType(value: unknown): TngFlowConnectionPathType | null {
  return typeof value === 'string' && PATH_TYPES.has(value as TngFlowConnectionPathType)
    ? (value as TngFlowConnectionPathType)
    : null;
}

function marker(value: unknown): TngFlowConnectionMarker | null {
  return typeof value === 'string' && MARKERS.has(value as TngFlowConnectionMarker)
    ? (value as TngFlowConnectionMarker)
    : null;
}

function labelPlacement(value: unknown): TngFlowConnectionLabelPlacement | null {
  return typeof value === 'string' && LABEL_PLACEMENTS.has(value as TngFlowConnectionLabelPlacement)
    ? (value as TngFlowConnectionLabelPlacement)
    : null;
}

function copyWaypoints(value: readonly TngFlowPoint[] | undefined): readonly TngFlowPoint[] {
  if (value === undefined) {
    return Object.freeze([]);
  }
  return Object.freeze(
    value
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
      .map((point) => Object.freeze({ x: point.x, y: point.y })),
  );
}

export function resolveTngFlowConnectionOptions<TData>(
  connection: TngFlowConnection<TData>,
  editorOptions?: TngFlowEditorConnectionOptions | null,
  compatibilityDefaults: TngFlowDefaultConnectionOptions = DEFAULT_TNG_FLOW_CONNECTION_OPTIONS,
): TngResolvedFlowConnectionOptions {
  const editorDefaults = editorOptions?.defaultConnection;
  const legacyType = legacyPathType(connection.type);
  const resolvedType =
    pathType(connection.routing?.type) ??
    legacyType ??
    pathType(editorDefaults?.routing?.type) ??
    compatibilityDefaults.routing.type;
  const legacySegment = connection.routing?.type === undefined && connection.type === 'segment';
  const resolvedRadius =
    resolvedType === 'orthogonal'
      ? 0
      : finiteNonNegative(
          connection.routing?.radius,
          legacySegment
            ? 8
            : finiteNonNegative(
                editorDefaults?.routing?.radius,
                compatibilityDefaults.routing.radius,
              ),
        );

  return Object.freeze({
    routing: Object.freeze({
      type: resolvedType,
      offset: finiteNonNegative(
        connection.routing?.offset,
        finiteNonNegative(editorDefaults?.routing?.offset, compatibilityDefaults.routing.offset),
      ),
      radius: resolvedRadius,
      waypoints: copyWaypoints(connection.routing?.waypoints),
    }),
    sourceMarker:
      marker(connection.sourceMarker) ??
      marker(editorDefaults?.sourceMarker) ??
      compatibilityDefaults.sourceMarker,
    targetMarker:
      marker(connection.targetMarker) ??
      marker(editorDefaults?.targetMarker) ??
      marker(editorDefaults?.marker) ??
      compatibilityDefaults.targetMarker,
    labelPlacement:
      labelPlacement(connection.labelOptions?.placement) ??
      labelPlacement(editorDefaults?.labelPlacement) ??
      compatibilityDefaults.labelPlacement,
    labelOffset: finiteNumber(
      connection.labelOptions?.offset,
      finiteNumber(editorDefaults?.labelOffset, compatibilityDefaults.labelOffset ?? 0),
    ),
    labelOffsetX: finiteNumber(
      connection.labelOptions?.offsetX,
      finiteNumber(editorDefaults?.labelOffsetX, compatibilityDefaults.labelOffsetX ?? 0),
    ),
    labelOffsetY: finiteNumber(
      connection.labelOptions?.offsetY,
      finiteNumber(editorDefaults?.labelOffsetY, compatibilityDefaults.labelOffsetY ?? 0),
    ),
  });
}

export function tngFlowPathTypeToRendererType(
  type: TngFlowConnectionPathType,
): TngFlowConnectionType {
  switch (type) {
    case 'adaptive':
      return 'adaptive-curve';
    case 'orthogonal':
    case 'orthogonal-rounded':
      return 'segment';
    case 'bezier':
    case 'straight':
      return type;
  }
}

export function tngFlowLabelPlacementPosition(placement: TngFlowConnectionLabelPlacement): number {
  switch (placement) {
    case 'start':
      return 0.2;
    case 'center':
      return 0.5;
    case 'end':
      return 0.8;
  }
}
