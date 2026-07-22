import type { TngFlowNodeBounds } from './tng-flow-geometry.types';
import type { TngFlowConnection, TngFlowNode, TngFlowNodeMove } from './tng-flow.types';

export type TngFlowLayoutDirection =
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top';

export type TngFlowLayoutRequestSource = 'api' | 'controls' | 'keyboard';

/** Caller-supplied calculation options. TailNG resolves omitted values before invoking an engine. */
export type TngFlowLayoutOptions = Readonly<{
  direction?: TngFlowLayoutDirection;
  nodeSpacing?: number;
  levelSpacing?: number;
  componentSpacing?: number;
  preserveLockedNodes?: boolean;
  includeDisconnectedNodes?: boolean;
}>;

export type TngResolvedFlowLayoutOptions = Readonly<{
  direction: TngFlowLayoutDirection;
  nodeSpacing: number;
  levelSpacing: number;
  componentSpacing: number;
  preserveLockedNodes: boolean;
  includeDisconnectedNodes: boolean;
}>;

/** Viewport effects applied only after the consumer writes the controlled positions back. */
export type TngFlowLayoutViewportOptions = Readonly<{
  fit?: boolean;
  animated?: boolean;
  padding?: number;
}>;

export type TngResolvedFlowLayoutViewportOptions = Readonly<{
  fit: boolean;
  animated: boolean;
  padding: number;
}>;

export type TngFlowAutoLayoutOptions = TngFlowLayoutOptions &
  Readonly<{
    viewport?: TngFlowLayoutViewportOptions;
  }>;

export type TngFlowLayoutNode<TData = unknown> = Readonly<{
  node: TngFlowNode<TData>;
  bounds: TngFlowNodeBounds;
}>;

export type TngFlowLayoutConnection<TData = unknown> = Readonly<{
  connection: TngFlowConnection<TData>;
}>;

/** Engine-neutral graph snapshot. Public layout adapters must not expose renderer-specific types. */
export type TngFlowLayoutGraph<TNodeData = unknown, TConnectionData = unknown> = Readonly<{
  nodes: readonly TngFlowLayoutNode<TNodeData>[];
  connections: readonly TngFlowLayoutConnection<TConnectionData>[];
}>;

export type TngFlowLayoutEngine<TNodeData = unknown, TConnectionData = unknown> = Readonly<{
  calculate: (
    graph: TngFlowLayoutGraph<TNodeData, TConnectionData>,
    options: TngResolvedFlowLayoutOptions,
  ) => Promise<readonly TngFlowNodeMove[]>;
}>;

/** One application-owned position update for a complete automatic-layout operation. */
export type TngFlowNodesLayoutRequest = Readonly<{
  nodes: readonly TngFlowNodeMove[];
  options: TngResolvedFlowLayoutOptions;
  viewport: TngResolvedFlowLayoutViewportOptions;
  source: TngFlowLayoutRequestSource;
}>;
