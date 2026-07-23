import type { TngFlowPoint } from '../types/tng-flow.types';

const COORDINATE_PRECISION = 1000;

export function isTngFlowGridEnabled(gridSize: number | undefined): gridSize is number {
  return gridSize !== undefined && Number.isFinite(gridSize) && gridSize > 0;
}

export function normalizeTngFlowCoordinate(value: number): number {
  const normalized = Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function snapTngFlowCoordinate(value: number, gridSize: number | undefined): number {
  return normalizeTngFlowCoordinate(
    isTngFlowGridEnabled(gridSize) ? Math.round(value / gridSize) * gridSize : value,
  );
}

export function snapTngFlowPoint(point: TngFlowPoint, gridSize: number | undefined): TngFlowPoint {
  return {
    x: snapTngFlowCoordinate(point.x, gridSize),
    y: snapTngFlowCoordinate(point.y, gridSize),
  };
}
