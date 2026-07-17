export type TngFlowPoint = Readonly<{
  x: number;
  y: number;
}>;

export type TngFlowNodeStatus =
  | 'awaiting-input'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'idle'
  | 'paused'
  | 'queued'
  | 'retrying'
  | 'running'
  | 'skipped'
  | 'waiting';

export type TngFlowConnectionType = 'adaptive-curve' | 'bezier' | 'segment' | 'straight';

export type TngFlowPort = Readonly<{
  id: string;
  label?: string;
  category?: string;
  disabled?: boolean;
  multiple?: boolean;
  accepts?: readonly string[];
  allowSelfConnection?: boolean;
}>;

export type TngFlowNode<TData = unknown> = Readonly<{
  id: string;
  type: string;
  name: string;
  position: TngFlowPoint;
  data?: TData;
  description?: string;
  disabled?: boolean;
  icon?: string;
  inputs?: readonly TngFlowPort[];
  outputs?: readonly TngFlowPort[];
}>;

export type TngFlowConnection = Readonly<{
  id: string;
  sourcePortId: string;
  targetPortId: string;
  disabled?: boolean;
  reassignable?: boolean;
  selectable?: boolean;
  type?: TngFlowConnectionType;
}>;

export type TngFlowNodeView<TStatus extends string = TngFlowNodeStatus> = Readonly<{
  status?: TStatus;
  progress?: number | null;
  invalid?: boolean;
  message?: string | null;
}>;

export type TngFlowNodeViews<TStatus extends string = TngFlowNodeStatus> = Readonly<
  Record<string, TngFlowNodeView<TStatus>>
>;

export type TngFlowNodeMove = Readonly<{
  id: string;
  position: TngFlowPoint;
}>;

export type TngFlowNodesMovedEvent = Readonly<{
  nodes: readonly TngFlowNodeMove[];
}>;

export type TngFlowConnectionCreatedEvent = Readonly<{
  sourcePortId: string;
  targetPortId: string;
  dropPosition: TngFlowPoint;
}>;

export type TngFlowConnectionReassignedEvent = Readonly<{
  connectionId: string;
  endpoint: 'source' | 'target';
  previousSourcePortId: string;
  sourcePortId: string | undefined;
  previousTargetPortId: string;
  targetPortId: string | undefined;
  dropPosition: TngFlowPoint;
}>;

export type TngFlowSelectionChangedEvent = Readonly<{
  nodeIds: readonly string[];
  connectionIds: readonly string[];
}>;

export type TngFlowDeleteRequestedEvent = Readonly<{
  nodeIds: readonly string[];
  connectionIds: readonly string[];
}>;

export type TngFlowViewportChangedEvent = Readonly<{
  position: TngFlowPoint;
  scale: number;
}>;
