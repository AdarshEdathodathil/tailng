import type { TngFlowEditorMode } from '../types/tng-flow.types';

export type TngFlowCapabilities = Readonly<{
  select: boolean;
  activate: boolean;
  move: boolean;
  connect: boolean;
  delete: boolean;
  panZoom: boolean;
  navigate: boolean;
}>;

const EDIT_CAPABILITIES: TngFlowCapabilities = Object.freeze({
  select: true,
  activate: true,
  move: true,
  connect: true,
  delete: true,
  panZoom: true,
  navigate: true,
});

const INSPECT_CAPABILITIES: TngFlowCapabilities = Object.freeze({
  select: true,
  activate: true,
  move: false,
  connect: false,
  delete: false,
  panZoom: true,
  navigate: true,
});

const READONLY_CAPABILITIES: TngFlowCapabilities = Object.freeze({
  select: false,
  activate: false,
  move: false,
  connect: false,
  delete: false,
  panZoom: true,
  navigate: true,
});

export function resolveTngFlowCapabilities(mode: TngFlowEditorMode): TngFlowCapabilities {
  switch (mode) {
    case 'edit':
      return EDIT_CAPABILITIES;
    case 'inspect':
      return INSPECT_CAPABILITIES;
    case 'readonly':
      return READONLY_CAPABILITIES;
  }
}
