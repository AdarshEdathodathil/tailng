import { InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';
import type { TngChartLegendItem } from './chart-series.types';
import type {
  TngChartHeight,
  TngChartOption,
  TngChartRenderer,
  TngChartRuntimeLoader,
  TngChartTheme,
} from './chart.types';

export type TngChartOptionFactory = (hiddenSeries: ReadonlySet<string>) => TngChartOption;

export type TngChartContext = Readonly<{
  ariaLabel: Signal<string | null>;
  ariaLabelledby: Signal<string | null>;
  autoResize: Signal<boolean>;
  height: Signal<TngChartHeight>;
  hiddenSeries: Signal<ReadonlySet<string>>;
  lazyUpdate: Signal<boolean>;
  legendItems: Signal<readonly TngChartLegendItem[]>;
  loading: Signal<boolean>;
  merge: Signal<boolean>;
  option: Signal<TngChartOption | null>;
  renderer: Signal<TngChartRenderer>;
  runtimeLoader: Signal<TngChartRuntimeLoader | null>;
  theme: Signal<TngChartTheme>;
  isSeriesVisible: (seriesKey: string) => boolean;
  setSeriesVisible: (seriesKey: string, visible: boolean) => void;
  toggleSeries: (seriesKey: string) => void;
}>;

export const TNG_CHART_CONTEXT = new InjectionToken<TngChartContext>('TNG_CHART_CONTEXT');

export const TNG_CHART_RENDERING_ENABLED = new InjectionToken<boolean>(
  'TNG_CHART_RENDERING_ENABLED',
  {
    factory: () => true,
  },
);
