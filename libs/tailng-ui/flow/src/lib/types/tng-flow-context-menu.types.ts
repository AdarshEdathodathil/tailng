import type { TngFlowPoint, TngFlowSelection } from './tng-flow.types';

export type TngFlowContextMenuTarget =
  | Readonly<{ kind: 'canvas' }>
  | Readonly<{ kind: 'node'; nodeId: string }>
  | Readonly<{ kind: 'connection'; connectionId: string }>
  | Readonly<{ kind: 'port'; nodeId: string; portId: string }>;

export type TngFlowContextMenuSource = 'keyboard' | 'pointer';

export type TngFlowContextMenuRequest = Readonly<{
  target: TngFlowContextMenuTarget;
  source: TngFlowContextMenuSource;
  /** Browser client coordinates suitable for anchoring an overlay. */
  clientPosition: TngFlowPoint;
  canvasPosition: TngFlowPoint;
  /** The proposed controlled selection after applying target-selection rules. */
  selection: TngFlowSelection;
}>;
