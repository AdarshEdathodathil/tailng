export type TngSplitOrientation = 'horizontal' | 'vertical';

export type TngSplitResizeSource = 'api' | 'keyboard' | 'pointer';

export type TngSplitPrimaryPane = 'next' | 'previous';

export type TngSplitResizeEvent = Readonly<{
  previousPaneId: string;
  nextPaneId: string;
  previousPaneSize: number;
  nextPaneSize: number;
  source: TngSplitResizeSource;
}>;

export type TngSplitPaneLayout = Readonly<{
  id: string;
  desiredSize: number;
  minSize: number;
  maxSize: number;
  grow: number;
  collapsed: boolean;
  collapsedSize: number;
}>;

export type TngSplitLayoutResult = Readonly<{
  sizes: ReadonlyMap<string, number>;
  constrained: boolean;
}>;

export type TngSplitPairConstraints = Readonly<{
  previousMin: number;
  previousMax: number;
  nextMin: number;
  nextMax: number;
}>;

export type TngSplitPairResult = Readonly<{
  previousSize: number;
  nextSize: number;
}>;
