import type { TngFlowPoint } from './tng-flow.types';

export type TngFlowSize = Readonly<{
  width: number;
  height: number;
}>;

/** Measured node geometry in unscaled canvas coordinates. */
export type TngFlowNodeBounds = Readonly<{
  id: string;
  position: TngFlowPoint;
  size: TngFlowSize;
  disabled?: boolean;
  locked?: boolean;
}>;
