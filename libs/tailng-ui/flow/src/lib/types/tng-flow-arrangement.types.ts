import type { TngFlowNodeMove } from './tng-flow.types';

export type TngFlowNodeAlignment =
  | 'left'
  | 'horizontal-center'
  | 'right'
  | 'top'
  | 'vertical-center'
  | 'bottom';

export type TngFlowDistributionAxis = 'horizontal' | 'vertical';
export type TngFlowLockedNodeArrangement = 'anchor' | 'ignore';
export type TngFlowArrangementRequestSource = 'api' | 'context-menu' | 'controls' | 'keyboard';
export type TngFlowSmartGuideModifier = 'alt' | 'control' | 'meta' | 'shift';

export type TngFlowArrangementOperation =
  | Readonly<{ kind: 'align'; alignment: TngFlowNodeAlignment }>
  | Readonly<{ kind: 'distribute'; axis: TngFlowDistributionAxis }>;

export type TngFlowArrangementOptions = Readonly<{
  gridSize?: number;
  lockedNodes?: TngFlowLockedNodeArrangement;
}>;

export type TngFlowSmartGuidesOptions = Readonly<{
  enabled?: boolean;
  alignmentThreshold?: number;
  spacingThreshold?: number;
  disableModifier?: TngFlowSmartGuideModifier;
}>;

export type TngFlowNodesArrangementRequest = Readonly<{
  nodes: readonly TngFlowNodeMove[];
  operation: TngFlowArrangementOperation;
  source: TngFlowArrangementRequestSource;
}>;
