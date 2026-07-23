export type TngFlowKeyboardOptions = Readonly<{
  /** Defaults to `gridSize` when snapping, otherwise one canvas unit. */
  moveStep?: number;
  /** Defaults to ten times the normal movement step. */
  largeMoveStep?: number;
  /** Defaults to `['c']`; Enter and Escape remain structural keys. */
  connectKeys?: readonly string[];
}>;
