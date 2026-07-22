export type TngFlowMinimapPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export type TngFlowMinimapOptions = Readonly<{
  position?: TngFlowMinimapPosition;
  width?: number;
  height?: number;
  minSize?: number;
  nodeRenderLimit?: number;
  interactive?: boolean;
  ariaLabel?: string;
}>;

export type TngResolvedFlowMinimapOptions = Readonly<{
  position: TngFlowMinimapPosition;
  width: number;
  height: number;
  minSize: number;
  nodeRenderLimit: number;
  interactive: boolean;
  ariaLabel: string;
}>;
