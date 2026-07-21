export type {
  TngChartData,
  TngChartDatum,
  TngChartHeight,
  TngChartInitOptions,
  TngChartInstance,
  TngChartOption,
  TngChartOptionOverride,
  TngChartPointEvent,
  TngChartRenderer,
  TngChartRuntime,
  TngChartRuntimeLoader,
  TngChartSetOptionOptions,
  TngChartTheme,
} from './lib/core/chart.types';
export type { TngChartContext, TngChartOptionFactory } from './lib/core/chart-context';
export { TNG_CHART_CONTEXT, TNG_CHART_RENDERING_ENABLED } from './lib/core/chart-context';
export type {
  TngChartLegendItem,
  TngChartSeries,
  TngChartSeriesType,
} from './lib/core/chart-series.types';

export { loadTngEchartsRuntime, resolveTngEchartsModule } from './lib/echarts/echarts.loader';

export {
  resolveTngChartNotMerge,
  resolveTngChartRenderer,
  shouldAttachTngChartResizeObserver,
  shouldScheduleTngChartResizeFrame,
  TngChartComponent,
  TngChartComponent as TngChart,
} from './lib/components/chart/tng-chart.component';
export { TngChartRootComponent } from './lib/components/chart-root/tng-chart-root.component';
export { TngChartSurfaceComponent } from './lib/components/chart-surface/tng-chart-surface.component';
export { TngChartLegendComponent } from './lib/components/legend/tng-chart-legend.component';
export { TngChartEmptyStateComponent } from './lib/components/empty-state/tng-chart-empty-state.component';
export { TngChartLoadingStateComponent } from './lib/components/loading-state/tng-chart-loading-state.component';

export type { TngAreaChartOptionInput } from './lib/series/area/area-chart.types';
export { createTngAreaChartOption } from './lib/series/area/area-option.factory';
export {
  TngAreaChartComponent,
  TngAreaChartComponent as TngAreaChart,
} from './lib/series/area/tng-area-chart.component';

export type {
  TngBarChartInput,
  TngBarChartKind,
  TngBarChartOptionInput,
  TngBarChartOrientation,
  TngBarSeriesInput,
} from './lib/series/bar/bar.types';
export { createTngBarChartOption } from './lib/series/bar/bar-option.factory';
export {
  TngBarChartComponent,
  TngBarChartComponent as TngBarChart,
} from './lib/series/bar/tng-bar-chart.component';

export type { TngHeatmapChartOptionInput } from './lib/series/heatmap/heatmap-chart.types';
export { createTngHeatmapChartOption } from './lib/series/heatmap/heatmap-option.factory';
export {
  TngHeatmapChartComponent,
  TngHeatmapChartComponent as TngHeatmapChart,
} from './lib/series/heatmap/tng-heatmap-chart.component';

export type {
  TngLineChartInput,
  TngLineChartOptionInput,
  TngLineSeriesInput,
} from './lib/series/line/line.types';
export { createTngLineChartOption } from './lib/series/line/line-option.factory';
export {
  TngLineChartComponent,
  TngLineChartComponent as TngLineChart,
} from './lib/series/line/tng-line-chart.component';

export type {
  TngPieChartInput,
  TngPieChartOptionInput,
  TngPieSliceInput,
} from './lib/series/pie/pie.types';
export { createTngPieChartOption } from './lib/series/pie/pie-option.factory';
export {
  TngPieChartComponent,
  TngPieChartComponent as TngPieChart,
} from './lib/series/pie/tng-pie-chart.component';

export type { TngScatterChartOptionInput } from './lib/series/scatter/scatter-chart.types';
export { createTngScatterChartOption } from './lib/series/scatter/scatter-option.factory';
export {
  TngScatterChartComponent,
  TngScatterChartComponent as TngScatterChart,
} from './lib/series/scatter/tng-scatter-chart.component';

// Catalog chart exports generated from plan/charts/echarts.json
export type {
  TngCatalogChartOptionInput,
  TngCatalogChartPreset,
} from './lib/series/catalog/catalog-chart.types';
export { TNG_CATALOG_CHART_PRESETS } from './lib/series/catalog/catalog-registry';
export { createTngBasicLineChartOption } from './lib/series/line/basic-line/basic-line-option.factory';
export type { TngBasicLineChartOptionInput } from './lib/series/line/basic-line/basic-line-option.factory';
export {
  TngBasicLineChartComponent,
  TngBasicLineChartComponent as TngBasicLineChart,
} from './lib/series/line/basic-line/tng-basic-line-chart.component';
export { createTngSmoothedLineChartOption } from './lib/series/line/smoothed-line/smoothed-line-option.factory';
export type { TngSmoothedLineChartOptionInput } from './lib/series/line/smoothed-line/smoothed-line-option.factory';
export {
  TngSmoothedLineChartComponent,
  TngSmoothedLineChartComponent as TngSmoothedLineChart,
} from './lib/series/line/smoothed-line/tng-smoothed-line-chart.component';
export { createTngStackedLineChartOption } from './lib/series/line/stacked-line/stacked-line-option.factory';
export type { TngStackedLineChartOptionInput } from './lib/series/line/stacked-line/stacked-line-option.factory';
export {
  TngStackedLineChartComponent,
  TngStackedLineChartComponent as TngStackedLineChart,
} from './lib/series/line/stacked-line/tng-stacked-line-chart.component';
export { createTngStepLineChartOption } from './lib/series/line/step-line/step-line-option.factory';
export type { TngStepLineChartOptionInput } from './lib/series/line/step-line/step-line-option.factory';
export {
  TngStepLineChartComponent,
  TngStepLineChartComponent as TngStepLineChart,
} from './lib/series/line/step-line/tng-step-line-chart.component';
export { createTngLogAxisLineChartOption } from './lib/series/line/log-axis-line/log-axis-line-option.factory';
export type { TngLogAxisLineChartOptionInput } from './lib/series/line/log-axis-line/log-axis-line-option.factory';
export {
  TngLogAxisLineChartComponent,
  TngLogAxisLineChartComponent as TngLogAxisLineChart,
} from './lib/series/line/log-axis-line/tng-log-axis-line-chart.component';
export { createTngTimeSeriesLineChartOption } from './lib/series/line/time-series-line/time-series-line-option.factory';
export type { TngTimeSeriesLineChartOptionInput } from './lib/series/line/time-series-line/time-series-line-option.factory';
export {
  TngTimeSeriesLineChartComponent,
  TngTimeSeriesLineChartComponent as TngTimeSeriesLineChart,
} from './lib/series/line/time-series-line/tng-time-series-line-chart.component';
export { createTngDynamicLineChartOption } from './lib/series/line/dynamic-line/dynamic-line-option.factory';
export type { TngDynamicLineChartOptionInput } from './lib/series/line/dynamic-line/dynamic-line-option.factory';
export {
  TngDynamicLineChartComponent,
  TngDynamicLineChartComponent as TngDynamicLineChart,
} from './lib/series/line/dynamic-line/tng-dynamic-line-chart.component';
export { createTngLineRaceChartOption } from './lib/series/line/line-race/line-race-option.factory';
export type { TngLineRaceChartOptionInput } from './lib/series/line/line-race/line-race-option.factory';
export {
  TngLineRaceChartComponent,
  TngLineRaceChartComponent as TngLineRaceChart,
} from './lib/series/line/line-race/tng-line-race-chart.component';
export { createTngLineWithMarkLinesChartOption } from './lib/series/line/line-with-mark-lines/line-with-mark-lines-option.factory';
export type { TngLineWithMarkLinesChartOptionInput } from './lib/series/line/line-with-mark-lines/line-with-mark-lines-option.factory';
export {
  TngLineWithMarkLinesChartComponent,
  TngLineWithMarkLinesChartComponent as TngLineWithMarkLinesChart,
} from './lib/series/line/line-with-mark-lines/tng-line-with-mark-lines-chart.component';
export { createTngMultiAxisLineChartOption } from './lib/series/line/multi-axis-line/multi-axis-line-option.factory';
export type { TngMultiAxisLineChartOptionInput } from './lib/series/line/multi-axis-line/multi-axis-line-option.factory';
export {
  TngMultiAxisLineChartComponent,
  TngMultiAxisLineChartComponent as TngMultiAxisLineChart,
} from './lib/series/line/multi-axis-line/tng-multi-axis-line-chart.component';
export { createTngPolarLineChartOption } from './lib/series/line/polar-line/polar-line-option.factory';
export type { TngPolarLineChartOptionInput } from './lib/series/line/polar-line/polar-line-option.factory';
export {
  TngPolarLineChartComponent,
  TngPolarLineChartComponent as TngPolarLineChart,
} from './lib/series/line/polar-line/tng-polar-line-chart.component';
export { createTngInteractiveLineChartOption } from './lib/series/line/interactive-line/interactive-line-option.factory';
export type { TngInteractiveLineChartOptionInput } from './lib/series/line/interactive-line/interactive-line-option.factory';
export {
  TngInteractiveLineChartComponent,
  TngInteractiveLineChartComponent as TngInteractiveLineChart,
} from './lib/series/line/interactive-line/tng-interactive-line-chart.component';
export { createTngLargeScaleLineChartOption } from './lib/series/line/large-scale-line/large-scale-line-option.factory';
export type { TngLargeScaleLineChartOptionInput } from './lib/series/line/large-scale-line/large-scale-line-option.factory';
export {
  TngLargeScaleLineChartComponent,
  TngLargeScaleLineChartComponent as TngLargeScaleLineChart,
} from './lib/series/line/large-scale-line/tng-large-scale-line-chart.component';
export { createTngSparklineChartOption } from './lib/series/line/sparkline/sparkline-option.factory';
export type { TngSparklineChartOptionInput } from './lib/series/line/sparkline/sparkline-option.factory';
export {
  TngSparklineChartComponent,
  TngSparklineChartComponent as TngSparklineChart,
} from './lib/series/line/sparkline/tng-sparkline-chart.component';
export { createTngBasicAreaChartOption } from './lib/series/area/basic-area/basic-area-option.factory';
export type { TngBasicAreaChartOptionInput } from './lib/series/area/basic-area/basic-area-option.factory';
export {
  TngBasicAreaChartComponent,
  TngBasicAreaChartComponent as TngBasicAreaChart,
} from './lib/series/area/basic-area/tng-basic-area-chart.component';
export { createTngStackedAreaChartOption } from './lib/series/area/stacked-area/stacked-area-option.factory';
export type { TngStackedAreaChartOptionInput } from './lib/series/area/stacked-area/stacked-area-option.factory';
export {
  TngStackedAreaChartComponent,
  TngStackedAreaChartComponent as TngStackedAreaChart,
} from './lib/series/area/stacked-area/tng-stacked-area-chart.component';
export { createTngGradientAreaChartOption } from './lib/series/area/gradient-area/gradient-area-option.factory';
export type { TngGradientAreaChartOptionInput } from './lib/series/area/gradient-area/gradient-area-option.factory';
export {
  TngGradientAreaChartComponent,
  TngGradientAreaChartComponent as TngGradientAreaChart,
} from './lib/series/area/gradient-area/tng-gradient-area-chart.component';
export { createTngLargeScaleAreaChartOption } from './lib/series/area/large-scale-area/large-scale-area-option.factory';
export type { TngLargeScaleAreaChartOptionInput } from './lib/series/area/large-scale-area/large-scale-area-option.factory';
export {
  TngLargeScaleAreaChartComponent,
  TngLargeScaleAreaChartComponent as TngLargeScaleAreaChart,
} from './lib/series/area/large-scale-area/tng-large-scale-area-chart.component';
export { createTngConfidenceBandChartOption } from './lib/series/area/confidence-band/confidence-band-option.factory';
export type { TngConfidenceBandChartOptionInput } from './lib/series/area/confidence-band/confidence-band-option.factory';
export {
  TngConfidenceBandChartComponent,
  TngConfidenceBandChartComponent as TngConfidenceBandChart,
} from './lib/series/area/confidence-band/tng-confidence-band-chart.component';
export { createTngAreaPiecesChartOption } from './lib/series/area/area-pieces/area-pieces-option.factory';
export type { TngAreaPiecesChartOptionInput } from './lib/series/area/area-pieces/area-pieces-option.factory';
export {
  TngAreaPiecesChartComponent,
  TngAreaPiecesChartComponent as TngAreaPiecesChart,
} from './lib/series/area/area-pieces/tng-area-pieces-chart.component';
export { createTngTimeSeriesAreaChartOption } from './lib/series/area/time-series-area/time-series-area-option.factory';
export type { TngTimeSeriesAreaChartOptionInput } from './lib/series/area/time-series-area/time-series-area-option.factory';
export {
  TngTimeSeriesAreaChartComponent,
  TngTimeSeriesAreaChartComponent as TngTimeSeriesAreaChart,
} from './lib/series/area/time-series-area/tng-time-series-area-chart.component';
export { createTngBasicBarChartOption } from './lib/series/bar/basic-bar/basic-bar-option.factory';
export type { TngBasicBarChartOptionInput } from './lib/series/bar/basic-bar/basic-bar-option.factory';
export {
  TngBasicBarChartComponent,
  TngBasicBarChartComponent as TngBasicBarChart,
} from './lib/series/bar/basic-bar/tng-basic-bar-chart.component';
export { createTngHorizontalBarChartOption } from './lib/series/bar/horizontal-bar/horizontal-bar-option.factory';
export type { TngHorizontalBarChartOptionInput } from './lib/series/bar/horizontal-bar/horizontal-bar-option.factory';
export {
  TngHorizontalBarChartComponent,
  TngHorizontalBarChartComponent as TngHorizontalBarChart,
} from './lib/series/bar/horizontal-bar/tng-horizontal-bar-chart.component';
export { createTngStackedBarChartOption } from './lib/series/bar/stacked-bar/stacked-bar-option.factory';
export type { TngStackedBarChartOptionInput } from './lib/series/bar/stacked-bar/stacked-bar-option.factory';
export {
  TngStackedBarChartComponent,
  TngStackedBarChartComponent as TngStackedBarChart,
} from './lib/series/bar/stacked-bar/tng-stacked-bar-chart.component';
export { createTngNormalizedStackedBarChartOption } from './lib/series/bar/normalized-stacked-bar/normalized-stacked-bar-option.factory';
export type { TngNormalizedStackedBarChartOptionInput } from './lib/series/bar/normalized-stacked-bar/normalized-stacked-bar-option.factory';
export {
  TngNormalizedStackedBarChartComponent,
  TngNormalizedStackedBarChartComponent as TngNormalizedStackedBarChart,
} from './lib/series/bar/normalized-stacked-bar/tng-normalized-stacked-bar-chart.component';
export { createTngGroupedBarChartOption } from './lib/series/bar/grouped-bar/grouped-bar-option.factory';
export type { TngGroupedBarChartOptionInput } from './lib/series/bar/grouped-bar/grouped-bar-option.factory';
export {
  TngGroupedBarChartComponent,
  TngGroupedBarChartComponent as TngGroupedBarChart,
} from './lib/series/bar/grouped-bar/tng-grouped-bar-chart.component';
export { createTngRoundedBarChartOption } from './lib/series/bar/rounded-bar/rounded-bar-option.factory';
export type { TngRoundedBarChartOptionInput } from './lib/series/bar/rounded-bar/rounded-bar-option.factory';
export {
  TngRoundedBarChartComponent,
  TngRoundedBarChartComponent as TngRoundedBarChart,
} from './lib/series/bar/rounded-bar/tng-rounded-bar-chart.component';
export { createTngNegativeBarChartOption } from './lib/series/bar/negative-bar/negative-bar-option.factory';
export type { TngNegativeBarChartOptionInput } from './lib/series/bar/negative-bar/negative-bar-option.factory';
export {
  TngNegativeBarChartComponent,
  TngNegativeBarChartComponent as TngNegativeBarChart,
} from './lib/series/bar/negative-bar/tng-negative-bar-chart.component';
export { createTngWaterfallBarChartOption } from './lib/series/bar/waterfall-bar/waterfall-bar-option.factory';
export type { TngWaterfallBarChartOptionInput } from './lib/series/bar/waterfall-bar/waterfall-bar-option.factory';
export {
  TngWaterfallBarChartComponent,
  TngWaterfallBarChartComponent as TngWaterfallBarChart,
} from './lib/series/bar/waterfall-bar/tng-waterfall-bar-chart.component';
export { createTngLargeScaleBarChartOption } from './lib/series/bar/large-scale-bar/large-scale-bar-option.factory';
export type { TngLargeScaleBarChartOptionInput } from './lib/series/bar/large-scale-bar/large-scale-bar-option.factory';
export {
  TngLargeScaleBarChartComponent,
  TngLargeScaleBarChartComponent as TngLargeScaleBarChart,
} from './lib/series/bar/large-scale-bar/tng-large-scale-bar-chart.component';
export { createTngDynamicBarChartOption } from './lib/series/bar/dynamic-bar/dynamic-bar-option.factory';
export type { TngDynamicBarChartOptionInput } from './lib/series/bar/dynamic-bar/dynamic-bar-option.factory';
export {
  TngDynamicBarChartComponent,
  TngDynamicBarChartComponent as TngDynamicBarChart,
} from './lib/series/bar/dynamic-bar/tng-dynamic-bar-chart.component';
export { createTngBarRaceChartOption } from './lib/series/bar/bar-race/bar-race-option.factory';
export type { TngBarRaceChartOptionInput } from './lib/series/bar/bar-race/bar-race-option.factory';
export {
  TngBarRaceChartComponent,
  TngBarRaceChartComponent as TngBarRaceChart,
} from './lib/series/bar/bar-race/tng-bar-race-chart.component';
export { createTngDrilldownBarChartOption } from './lib/series/bar/drilldown-bar/drilldown-bar-option.factory';
export type { TngDrilldownBarChartOptionInput } from './lib/series/bar/drilldown-bar/drilldown-bar-option.factory';
export {
  TngDrilldownBarChartComponent,
  TngDrilldownBarChartComponent as TngDrilldownBarChart,
} from './lib/series/bar/drilldown-bar/tng-drilldown-bar-chart.component';
export { createTngPolarBarChartOption } from './lib/series/bar/polar-bar/polar-bar-option.factory';
export type { TngPolarBarChartOptionInput } from './lib/series/bar/polar-bar/polar-bar-option.factory';
export {
  TngPolarBarChartComponent,
  TngPolarBarChartComponent as TngPolarBarChart,
} from './lib/series/bar/polar-bar/tng-polar-bar-chart.component';
export { createTngRadialBarChartOption } from './lib/series/bar/radial-bar/radial-bar-option.factory';
export type { TngRadialBarChartOptionInput } from './lib/series/bar/radial-bar/radial-bar-option.factory';
export {
  TngRadialBarChartComponent,
  TngRadialBarChartComponent as TngRadialBarChart,
} from './lib/series/bar/radial-bar/tng-radial-bar-chart.component';
export { createTngSortedBarChartOption } from './lib/series/bar/sorted-bar/sorted-bar-option.factory';
export type { TngSortedBarChartOptionInput } from './lib/series/bar/sorted-bar/sorted-bar-option.factory';
export {
  TngSortedBarChartComponent,
  TngSortedBarChartComponent as TngSortedBarChart,
} from './lib/series/bar/sorted-bar/tng-sorted-bar-chart.component';
export { createTngBasicPieChartOption } from './lib/series/pie/basic-pie/basic-pie-option.factory';
export type { TngBasicPieChartOptionInput } from './lib/series/pie/basic-pie/basic-pie-option.factory';
export {
  TngBasicPieChartComponent,
  TngBasicPieChartComponent as TngBasicPieChart,
} from './lib/series/pie/basic-pie/tng-basic-pie-chart.component';
export { createTngDonutChartOption } from './lib/series/pie/donut/donut-option.factory';
export type { TngDonutChartOptionInput } from './lib/series/pie/donut/donut-option.factory';
export {
  TngDonutChartComponent,
  TngDonutChartComponent as TngDonutChart,
} from './lib/series/pie/donut/tng-donut-chart.component';
export { createTngHalfDonutChartOption } from './lib/series/pie/half-donut/half-donut-option.factory';
export type { TngHalfDonutChartOptionInput } from './lib/series/pie/half-donut/half-donut-option.factory';
export {
  TngHalfDonutChartComponent,
  TngHalfDonutChartComponent as TngHalfDonutChart,
} from './lib/series/pie/half-donut/tng-half-donut-chart.component';
export { createTngRoundedDonutChartOption } from './lib/series/pie/rounded-donut/rounded-donut-option.factory';
export type { TngRoundedDonutChartOptionInput } from './lib/series/pie/rounded-donut/rounded-donut-option.factory';
export {
  TngRoundedDonutChartComponent,
  TngRoundedDonutChartComponent as TngRoundedDonutChart,
} from './lib/series/pie/rounded-donut/tng-rounded-donut-chart.component';
export { createTngNightingaleChartOption } from './lib/series/pie/nightingale/nightingale-option.factory';
export type { TngNightingaleChartOptionInput } from './lib/series/pie/nightingale/nightingale-option.factory';
export {
  TngNightingaleChartComponent,
  TngNightingaleChartComponent as TngNightingaleChart,
} from './lib/series/pie/nightingale/tng-nightingale-chart.component';
export { createTngNestedPieChartOption } from './lib/series/pie/nested-pie/nested-pie-option.factory';
export type { TngNestedPieChartOptionInput } from './lib/series/pie/nested-pie/nested-pie-option.factory';
export {
  TngNestedPieChartComponent,
  TngNestedPieChartComponent as TngNestedPieChart,
} from './lib/series/pie/nested-pie/tng-nested-pie-chart.component';
export { createTngScrollableLegendPieChartOption } from './lib/series/pie/scrollable-legend-pie/scrollable-legend-pie-option.factory';
export type { TngScrollableLegendPieChartOptionInput } from './lib/series/pie/scrollable-legend-pie/scrollable-legend-pie-option.factory';
export {
  TngScrollableLegendPieChartComponent,
  TngScrollableLegendPieChartComponent as TngScrollableLegendPieChart,
} from './lib/series/pie/scrollable-legend-pie/tng-scrollable-legend-pie-chart.component';
export { createTngPieOnCalendarChartOption } from './lib/series/pie/pie-on-calendar/pie-on-calendar-option.factory';
export type { TngPieOnCalendarChartOptionInput } from './lib/series/pie/pie-on-calendar/pie-on-calendar-option.factory';
export {
  TngPieOnCalendarChartComponent,
  TngPieOnCalendarChartComponent as TngPieOnCalendarChart,
} from './lib/series/pie/pie-on-calendar/tng-pie-on-calendar-chart.component';
export { createTngPieOnGeoMapChartOption } from './lib/series/pie/pie-on-geo-map/pie-on-geo-map-option.factory';
export type { TngPieOnGeoMapChartOptionInput } from './lib/series/pie/pie-on-geo-map/pie-on-geo-map-option.factory';
export {
  TngPieOnGeoMapChartComponent,
  TngPieOnGeoMapChartComponent as TngPieOnGeoMapChart,
} from './lib/series/pie/pie-on-geo-map/tng-pie-on-geo-map-chart.component';
export { createTngBasicScatterChartOption } from './lib/series/scatter/basic-scatter/basic-scatter-option.factory';
export type { TngBasicScatterChartOptionInput } from './lib/series/scatter/basic-scatter/basic-scatter-option.factory';
export {
  TngBasicScatterChartComponent,
  TngBasicScatterChartComponent as TngBasicScatterChart,
} from './lib/series/scatter/basic-scatter/tng-basic-scatter-chart.component';
export { createTngEffectScatterChartOption } from './lib/series/scatter/effect-scatter/effect-scatter-option.factory';
export type { TngEffectScatterChartOptionInput } from './lib/series/scatter/effect-scatter/effect-scatter-option.factory';
export {
  TngEffectScatterChartComponent,
  TngEffectScatterChartComponent as TngEffectScatterChart,
} from './lib/series/scatter/effect-scatter/tng-effect-scatter-chart.component';
export { createTngBubbleChartChartOption } from './lib/series/scatter/bubble-chart/bubble-chart-option.factory';
export type { TngBubbleChartChartOptionInput } from './lib/series/scatter/bubble-chart/bubble-chart-option.factory';
export {
  TngBubbleChartChartComponent,
  TngBubbleChartChartComponent as TngBubbleChartChart,
} from './lib/series/scatter/bubble-chart/tng-bubble-chart-chart.component';
export { createTngLargeScatterChartOption } from './lib/series/scatter/large-scatter/large-scatter-option.factory';
export type { TngLargeScatterChartOptionInput } from './lib/series/scatter/large-scatter/large-scatter-option.factory';
export {
  TngLargeScatterChartComponent,
  TngLargeScatterChartComponent as TngLargeScatterChart,
} from './lib/series/scatter/large-scatter/tng-large-scatter-chart.component';
export { createTngJitterScatterChartOption } from './lib/series/scatter/jitter-scatter/jitter-scatter-option.factory';
export type { TngJitterScatterChartOptionInput } from './lib/series/scatter/jitter-scatter/jitter-scatter-option.factory';
export {
  TngJitterScatterChartComponent,
  TngJitterScatterChartComponent as TngJitterScatterChart,
} from './lib/series/scatter/jitter-scatter/tng-jitter-scatter-chart.component';
export { createTngRegressionScatterChartOption } from './lib/series/scatter/regression-scatter/regression-scatter-option.factory';
export type { TngRegressionScatterChartOptionInput } from './lib/series/scatter/regression-scatter/regression-scatter-option.factory';
export {
  TngRegressionScatterChartComponent,
  TngRegressionScatterChartComponent as TngRegressionScatterChart,
} from './lib/series/scatter/regression-scatter/tng-regression-scatter-chart.component';
export { createTngScatterMatrixChartOption } from './lib/series/scatter/scatter-matrix/scatter-matrix-option.factory';
export type { TngScatterMatrixChartOptionInput } from './lib/series/scatter/scatter-matrix/scatter-matrix-option.factory';
export {
  TngScatterMatrixChartComponent,
  TngScatterMatrixChartComponent as TngScatterMatrixChart,
} from './lib/series/scatter/scatter-matrix/tng-scatter-matrix-chart.component';
export { createTngCalendarScatterChartOption } from './lib/series/scatter/calendar-scatter/calendar-scatter-option.factory';
export type { TngCalendarScatterChartOptionInput } from './lib/series/scatter/calendar-scatter/calendar-scatter-option.factory';
export {
  TngCalendarScatterChartComponent,
  TngCalendarScatterChartComponent as TngCalendarScatterChart,
} from './lib/series/scatter/calendar-scatter/tng-calendar-scatter-chart.component';
export { createTngScatterGeoScatterChartOption } from './lib/series/scatter/geo-scatter/geo-scatter-option.factory';
export type { TngScatterGeoScatterChartOptionInput } from './lib/series/scatter/geo-scatter/geo-scatter-option.factory';
export {
  TngScatterGeoScatterChartComponent,
  TngScatterGeoScatterChartComponent as TngScatterGeoScatterChart,
} from './lib/series/scatter/geo-scatter/tng-geo-scatter-chart.component';
export { createTngSingleAxisScatterChartOption } from './lib/series/scatter/single-axis-scatter/single-axis-scatter-option.factory';
export type { TngSingleAxisScatterChartOptionInput } from './lib/series/scatter/single-axis-scatter/single-axis-scatter-option.factory';
export {
  TngSingleAxisScatterChartComponent,
  TngSingleAxisScatterChartComponent as TngSingleAxisScatterChart,
} from './lib/series/scatter/single-axis-scatter/tng-single-axis-scatter-chart.component';
export { createTngCartesianHeatmapChartOption } from './lib/series/heatmap/cartesian-heatmap/cartesian-heatmap-option.factory';
export type { TngCartesianHeatmapChartOptionInput } from './lib/series/heatmap/cartesian-heatmap/cartesian-heatmap-option.factory';
export {
  TngCartesianHeatmapChartComponent,
  TngCartesianHeatmapChartComponent as TngCartesianHeatmapChart,
} from './lib/series/heatmap/cartesian-heatmap/tng-cartesian-heatmap-chart.component';
export { createTngLargeHeatmapChartOption } from './lib/series/heatmap/large-heatmap/large-heatmap-option.factory';
export type { TngLargeHeatmapChartOptionInput } from './lib/series/heatmap/large-heatmap/large-heatmap-option.factory';
export {
  TngLargeHeatmapChartComponent,
  TngLargeHeatmapChartComponent as TngLargeHeatmapChart,
} from './lib/series/heatmap/large-heatmap/tng-large-heatmap-chart.component';
export { createTngDiscreteColorHeatmapChartOption } from './lib/series/heatmap/discrete-color-heatmap/discrete-color-heatmap-option.factory';
export type { TngDiscreteColorHeatmapChartOptionInput } from './lib/series/heatmap/discrete-color-heatmap/discrete-color-heatmap-option.factory';
export {
  TngDiscreteColorHeatmapChartComponent,
  TngDiscreteColorHeatmapChartComponent as TngDiscreteColorHeatmapChart,
} from './lib/series/heatmap/discrete-color-heatmap/tng-discrete-color-heatmap-chart.component';
export { createTngHeatmapCalendarHeatmapChartOption } from './lib/series/heatmap/calendar-heatmap/calendar-heatmap-option.factory';
export type { TngHeatmapCalendarHeatmapChartOptionInput } from './lib/series/heatmap/calendar-heatmap/calendar-heatmap-option.factory';
export {
  TngHeatmapCalendarHeatmapChartComponent,
  TngHeatmapCalendarHeatmapChartComponent as TngHeatmapCalendarHeatmapChart,
} from './lib/series/heatmap/calendar-heatmap/tng-calendar-heatmap-chart.component';
export { createTngMatrixHeatmapChartOption } from './lib/series/heatmap/matrix-heatmap/matrix-heatmap-option.factory';
export type { TngMatrixHeatmapChartOptionInput } from './lib/series/heatmap/matrix-heatmap/matrix-heatmap-option.factory';
export {
  TngMatrixHeatmapChartComponent,
  TngMatrixHeatmapChartComponent as TngMatrixHeatmapChart,
} from './lib/series/heatmap/matrix-heatmap/tng-matrix-heatmap-chart.component';
export { createTngGeoMapChartOption } from './lib/series/geo-map/geo-map/geo-map-option.factory';
export type { TngGeoMapChartOptionInput } from './lib/series/geo-map/geo-map/geo-map-option.factory';
export {
  TngGeoMapChartComponent,
  TngGeoMapChartComponent as TngGeoMapChart,
} from './lib/series/geo-map/geo-map/tng-geo-map-chart.component';
export { createTngChoroplethMapChartOption } from './lib/series/geo-map/choropleth-map/choropleth-map-option.factory';
export type { TngChoroplethMapChartOptionInput } from './lib/series/geo-map/choropleth-map/choropleth-map-option.factory';
export {
  TngChoroplethMapChartComponent,
  TngChoroplethMapChartComponent as TngChoroplethMapChart,
} from './lib/series/geo-map/choropleth-map/tng-choropleth-map-chart.component';
export { createTngSvgMapChartOption } from './lib/series/geo-map/svg-map/svg-map-option.factory';
export type { TngSvgMapChartOptionInput } from './lib/series/geo-map/svg-map/svg-map-option.factory';
export {
  TngSvgMapChartComponent,
  TngSvgMapChartComponent as TngSvgMapChart,
} from './lib/series/geo-map/svg-map/tng-svg-map-chart.component';
export { createTngGeoMapGeoScatterChartOption } from './lib/series/geo-map/geo-scatter/geo-scatter-option.factory';
export type { TngGeoMapGeoScatterChartOptionInput } from './lib/series/geo-map/geo-scatter/geo-scatter-option.factory';
export {
  TngGeoMapGeoScatterChartComponent,
  TngGeoMapGeoScatterChartComponent as TngGeoMapGeoScatterChart,
} from './lib/series/geo-map/geo-scatter/tng-geo-scatter-chart.component';
export { createTngGeoMapGeoLinesChartOption } from './lib/series/geo-map/geo-lines/geo-lines-option.factory';
export type { TngGeoMapGeoLinesChartOptionInput } from './lib/series/geo-map/geo-lines/geo-lines-option.factory';
export {
  TngGeoMapGeoLinesChartComponent,
  TngGeoMapGeoLinesChartComponent as TngGeoMapGeoLinesChart,
} from './lib/series/geo-map/geo-lines/tng-geo-lines-chart.component';
export { createTngMapToBarMorphChartOption } from './lib/series/geo-map/map-to-bar-morph/map-to-bar-morph-option.factory';
export type { TngMapToBarMorphChartOptionInput } from './lib/series/geo-map/map-to-bar-morph/map-to-bar-morph-option.factory';
export {
  TngMapToBarMorphChartComponent,
  TngMapToBarMorphChartComponent as TngMapToBarMorphChart,
} from './lib/series/geo-map/map-to-bar-morph/tng-map-to-bar-morph-chart.component';
export { createTngHexagonalBinningChartOption } from './lib/series/geo-map/hexagonal-binning/hexagonal-binning-option.factory';
export type { TngHexagonalBinningChartOptionInput } from './lib/series/geo-map/hexagonal-binning/hexagonal-binning-option.factory';
export {
  TngHexagonalBinningChartComponent,
  TngHexagonalBinningChartComponent as TngHexagonalBinningChart,
} from './lib/series/geo-map/hexagonal-binning/tng-hexagonal-binning-chart.component';
export { createTngBasicCandlestickChartOption } from './lib/series/candlestick/basic-candlestick/basic-candlestick-option.factory';
export type { TngBasicCandlestickChartOptionInput } from './lib/series/candlestick/basic-candlestick/basic-candlestick-option.factory';
export {
  TngBasicCandlestickChartComponent,
  TngBasicCandlestickChartComponent as TngBasicCandlestickChart,
} from './lib/series/candlestick/basic-candlestick/tng-basic-candlestick-chart.component';
export { createTngOhlcChartOption } from './lib/series/candlestick/ohlc/ohlc-option.factory';
export type { TngOhlcChartOptionInput } from './lib/series/candlestick/ohlc/ohlc-option.factory';
export {
  TngOhlcChartComponent,
  TngOhlcChartComponent as TngOhlcChart,
} from './lib/series/candlestick/ohlc/tng-ohlc-chart.component';
export { createTngLargeScaleCandlestickChartOption } from './lib/series/candlestick/large-scale-candlestick/large-scale-candlestick-option.factory';
export type { TngLargeScaleCandlestickChartOptionInput } from './lib/series/candlestick/large-scale-candlestick/large-scale-candlestick-option.factory';
export {
  TngLargeScaleCandlestickChartComponent,
  TngLargeScaleCandlestickChartComponent as TngLargeScaleCandlestickChart,
} from './lib/series/candlestick/large-scale-candlestick/tng-large-scale-candlestick-chart.component';
export { createTngCandlestickWithBrushChartOption } from './lib/series/candlestick/candlestick-with-brush/candlestick-with-brush-option.factory';
export type { TngCandlestickWithBrushChartOptionInput } from './lib/series/candlestick/candlestick-with-brush/candlestick-with-brush-option.factory';
export {
  TngCandlestickWithBrushChartComponent,
  TngCandlestickWithBrushChartComponent as TngCandlestickWithBrushChart,
} from './lib/series/candlestick/candlestick-with-brush/tng-candlestick-with-brush-chart.component';
export { createTngIntradayCandlestickChartOption } from './lib/series/candlestick/intraday-candlestick/intraday-candlestick-option.factory';
export type { TngIntradayCandlestickChartOptionInput } from './lib/series/candlestick/intraday-candlestick/intraday-candlestick-option.factory';
export {
  TngIntradayCandlestickChartComponent,
  TngIntradayCandlestickChartComponent as TngIntradayCandlestickChart,
} from './lib/series/candlestick/intraday-candlestick/tng-intraday-candlestick-chart.component';
export { createTngBasicRadarChartOption } from './lib/series/radar/basic-radar/basic-radar-option.factory';
export type { TngBasicRadarChartOptionInput } from './lib/series/radar/basic-radar/basic-radar-option.factory';
export {
  TngBasicRadarChartComponent,
  TngBasicRadarChartComponent as TngBasicRadarChart,
} from './lib/series/radar/basic-radar/tng-basic-radar-chart.component';
export { createTngCustomizedRadarChartOption } from './lib/series/radar/customized-radar/customized-radar-option.factory';
export type { TngCustomizedRadarChartOptionInput } from './lib/series/radar/customized-radar/customized-radar-option.factory';
export {
  TngCustomizedRadarChartComponent,
  TngCustomizedRadarChartComponent as TngCustomizedRadarChart,
} from './lib/series/radar/customized-radar/tng-customized-radar-chart.component';
export { createTngMultipleRadarChartOption } from './lib/series/radar/multiple-radar/multiple-radar-option.factory';
export type { TngMultipleRadarChartOptionInput } from './lib/series/radar/multiple-radar/multiple-radar-option.factory';
export {
  TngMultipleRadarChartComponent,
  TngMultipleRadarChartComponent as TngMultipleRadarChart,
} from './lib/series/radar/multiple-radar/tng-multiple-radar-chart.component';
export { createTngBasicBoxplotChartOption } from './lib/series/boxplot/basic-boxplot/basic-boxplot-option.factory';
export type { TngBasicBoxplotChartOptionInput } from './lib/series/boxplot/basic-boxplot/basic-boxplot-option.factory';
export {
  TngBasicBoxplotChartComponent,
  TngBasicBoxplotChartComponent as TngBasicBoxplotChart,
} from './lib/series/boxplot/basic-boxplot/tng-basic-boxplot-chart.component';
export { createTngAggregatedBoxplotChartOption } from './lib/series/boxplot/aggregated-boxplot/aggregated-boxplot-option.factory';
export type { TngAggregatedBoxplotChartOptionInput } from './lib/series/boxplot/aggregated-boxplot/aggregated-boxplot-option.factory';
export {
  TngAggregatedBoxplotChartComponent,
  TngAggregatedBoxplotChartComponent as TngAggregatedBoxplotChart,
} from './lib/series/boxplot/aggregated-boxplot/tng-aggregated-boxplot-chart.component';
export { createTngMultiCategoryBoxplotChartOption } from './lib/series/boxplot/multi-category-boxplot/multi-category-boxplot-option.factory';
export type { TngMultiCategoryBoxplotChartOptionInput } from './lib/series/boxplot/multi-category-boxplot/multi-category-boxplot-option.factory';
export {
  TngMultiCategoryBoxplotChartComponent,
  TngMultiCategoryBoxplotChartComponent as TngMultiCategoryBoxplotChart,
} from './lib/series/boxplot/multi-category-boxplot/tng-multi-category-boxplot-chart.component';
export { createTngBasicGraphChartOption } from './lib/series/graph/basic-graph/basic-graph-option.factory';
export type { TngBasicGraphChartOptionInput } from './lib/series/graph/basic-graph/basic-graph-option.factory';
export {
  TngBasicGraphChartComponent,
  TngBasicGraphChartComponent as TngBasicGraphChart,
} from './lib/series/graph/basic-graph/tng-basic-graph-chart.component';
export { createTngForceGraphChartOption } from './lib/series/graph/force-graph/force-graph-option.factory';
export type { TngForceGraphChartOptionInput } from './lib/series/graph/force-graph/force-graph-option.factory';
export {
  TngForceGraphChartComponent,
  TngForceGraphChartComponent as TngForceGraphChart,
} from './lib/series/graph/force-graph/tng-force-graph-chart.component';
export { createTngGraphOnCartesianChartOption } from './lib/series/graph/graph-on-cartesian/graph-on-cartesian-option.factory';
export type { TngGraphOnCartesianChartOptionInput } from './lib/series/graph/graph-on-cartesian/graph-on-cartesian-option.factory';
export {
  TngGraphOnCartesianChartComponent,
  TngGraphOnCartesianChartComponent as TngGraphOnCartesianChart,
} from './lib/series/graph/graph-on-cartesian/tng-graph-on-cartesian-chart.component';
export { createTngDynamicGraphChartOption } from './lib/series/graph/dynamic-graph/dynamic-graph-option.factory';
export type { TngDynamicGraphChartOptionInput } from './lib/series/graph/dynamic-graph/dynamic-graph-option.factory';
export {
  TngDynamicGraphChartComponent,
  TngDynamicGraphChartComponent as TngDynamicGraphChart,
} from './lib/series/graph/dynamic-graph/tng-dynamic-graph-chart.component';
export { createTngGeoGraphChartOption } from './lib/series/graph/geo-graph/geo-graph-option.factory';
export type { TngGeoGraphChartOptionInput } from './lib/series/graph/geo-graph/geo-graph-option.factory';
export {
  TngGeoGraphChartComponent,
  TngGeoGraphChartComponent as TngGeoGraphChart,
} from './lib/series/graph/geo-graph/tng-geo-graph-chart.component';
export { createTngGraphCalendarGraphChartOption } from './lib/series/graph/calendar-graph/calendar-graph-option.factory';
export type { TngGraphCalendarGraphChartOptionInput } from './lib/series/graph/calendar-graph/calendar-graph-option.factory';
export {
  TngGraphCalendarGraphChartComponent,
  TngGraphCalendarGraphChartComponent as TngGraphCalendarGraphChart,
} from './lib/series/graph/calendar-graph/tng-calendar-graph-chart.component';
export { createTngLinesGeoLinesChartOption } from './lib/series/lines/geo-lines/geo-lines-option.factory';
export type { TngLinesGeoLinesChartOptionInput } from './lib/series/lines/geo-lines/geo-lines-option.factory';
export {
  TngLinesGeoLinesChartComponent,
  TngLinesGeoLinesChartComponent as TngLinesGeoLinesChart,
} from './lib/series/lines/geo-lines/tng-geo-lines-chart.component';
export { createTngLargeScaleLinesChartOption } from './lib/series/lines/large-scale-lines/large-scale-lines-option.factory';
export type { TngLargeScaleLinesChartOptionInput } from './lib/series/lines/large-scale-lines/large-scale-lines-option.factory';
export {
  TngLargeScaleLinesChartComponent,
  TngLargeScaleLinesChartComponent as TngLargeScaleLinesChart,
} from './lib/series/lines/large-scale-lines/tng-large-scale-lines-chart.component';
export { createTngBasicTreeChartOption } from './lib/series/tree/basic-tree/basic-tree-option.factory';
export type { TngBasicTreeChartOptionInput } from './lib/series/tree/basic-tree/basic-tree-option.factory';
export {
  TngBasicTreeChartComponent,
  TngBasicTreeChartComponent as TngBasicTreeChart,
} from './lib/series/tree/basic-tree/tng-basic-tree-chart.component';
export { createTngHorizontalTreeChartOption } from './lib/series/tree/horizontal-tree/horizontal-tree-option.factory';
export type { TngHorizontalTreeChartOptionInput } from './lib/series/tree/horizontal-tree/horizontal-tree-option.factory';
export {
  TngHorizontalTreeChartComponent,
  TngHorizontalTreeChartComponent as TngHorizontalTreeChart,
} from './lib/series/tree/horizontal-tree/tng-horizontal-tree-chart.component';
export { createTngVerticalTreeChartOption } from './lib/series/tree/vertical-tree/vertical-tree-option.factory';
export type { TngVerticalTreeChartOptionInput } from './lib/series/tree/vertical-tree/vertical-tree-option.factory';
export {
  TngVerticalTreeChartComponent,
  TngVerticalTreeChartComponent as TngVerticalTreeChart,
} from './lib/series/tree/vertical-tree/tng-vertical-tree-chart.component';
export { createTngRadialTreeChartOption } from './lib/series/tree/radial-tree/radial-tree-option.factory';
export type { TngRadialTreeChartOptionInput } from './lib/series/tree/radial-tree/radial-tree-option.factory';
export {
  TngRadialTreeChartComponent,
  TngRadialTreeChartComponent as TngRadialTreeChart,
} from './lib/series/tree/radial-tree/tng-radial-tree-chart.component';
export { createTngPolylineTreeChartOption } from './lib/series/tree/polyline-tree/polyline-tree-option.factory';
export type { TngPolylineTreeChartOptionInput } from './lib/series/tree/polyline-tree/polyline-tree-option.factory';
export {
  TngPolylineTreeChartComponent,
  TngPolylineTreeChartComponent as TngPolylineTreeChart,
} from './lib/series/tree/polyline-tree/tng-polyline-tree-chart.component';
export { createTngBasicTreemapChartOption } from './lib/series/treemap/basic-treemap/basic-treemap-option.factory';
export type { TngBasicTreemapChartOptionInput } from './lib/series/treemap/basic-treemap/basic-treemap-option.factory';
export {
  TngBasicTreemapChartComponent,
  TngBasicTreemapChartComponent as TngBasicTreemapChart,
} from './lib/series/treemap/basic-treemap/tng-basic-treemap-chart.component';
export { createTngDiskUsageTreemapChartOption } from './lib/series/treemap/disk-usage-treemap/disk-usage-treemap-option.factory';
export type { TngDiskUsageTreemapChartOptionInput } from './lib/series/treemap/disk-usage-treemap/disk-usage-treemap-option.factory';
export {
  TngDiskUsageTreemapChartComponent,
  TngDiskUsageTreemapChartComponent as TngDiskUsageTreemapChart,
} from './lib/series/treemap/disk-usage-treemap/tng-disk-usage-treemap-chart.component';
export { createTngParentLabelTreemapChartOption } from './lib/series/treemap/parent-label-treemap/parent-label-treemap-option.factory';
export type { TngParentLabelTreemapChartOptionInput } from './lib/series/treemap/parent-label-treemap/parent-label-treemap-option.factory';
export {
  TngParentLabelTreemapChartComponent,
  TngParentLabelTreemapChartComponent as TngParentLabelTreemapChart,
} from './lib/series/treemap/parent-label-treemap/tng-parent-label-treemap-chart.component';
export { createTngGradientTreemapChartOption } from './lib/series/treemap/gradient-treemap/gradient-treemap-option.factory';
export type { TngGradientTreemapChartOptionInput } from './lib/series/treemap/gradient-treemap/gradient-treemap-option.factory';
export {
  TngGradientTreemapChartComponent,
  TngGradientTreemapChartComponent as TngGradientTreemapChart,
} from './lib/series/treemap/gradient-treemap/tng-gradient-treemap-chart.component';
export { createTngBasicSunburstChartOption } from './lib/series/sunburst/basic-sunburst/basic-sunburst-option.factory';
export type { TngBasicSunburstChartOptionInput } from './lib/series/sunburst/basic-sunburst/basic-sunburst-option.factory';
export {
  TngBasicSunburstChartComponent,
  TngBasicSunburstChartComponent as TngBasicSunburstChart,
} from './lib/series/sunburst/basic-sunburst/tng-basic-sunburst-chart.component';
export { createTngRoundedSunburstChartOption } from './lib/series/sunburst/rounded-sunburst/rounded-sunburst-option.factory';
export type { TngRoundedSunburstChartOptionInput } from './lib/series/sunburst/rounded-sunburst/rounded-sunburst-option.factory';
export {
  TngRoundedSunburstChartComponent,
  TngRoundedSunburstChartComponent as TngRoundedSunburstChart,
} from './lib/series/sunburst/rounded-sunburst/tng-rounded-sunburst-chart.component';
export { createTngRotatedLabelSunburstChartOption } from './lib/series/sunburst/rotated-label-sunburst/rotated-label-sunburst-option.factory';
export type { TngRotatedLabelSunburstChartOptionInput } from './lib/series/sunburst/rotated-label-sunburst/rotated-label-sunburst-option.factory';
export {
  TngRotatedLabelSunburstChartComponent,
  TngRotatedLabelSunburstChartComponent as TngRotatedLabelSunburstChart,
} from './lib/series/sunburst/rotated-label-sunburst/tng-rotated-label-sunburst-chart.component';
export { createTngMonochromeSunburstChartOption } from './lib/series/sunburst/monochrome-sunburst/monochrome-sunburst-option.factory';
export type { TngMonochromeSunburstChartOptionInput } from './lib/series/sunburst/monochrome-sunburst/monochrome-sunburst-option.factory';
export {
  TngMonochromeSunburstChartComponent,
  TngMonochromeSunburstChartComponent as TngMonochromeSunburstChart,
} from './lib/series/sunburst/monochrome-sunburst/tng-monochrome-sunburst-chart.component';
export { createTngVisualMapSunburstChartOption } from './lib/series/sunburst/visual-map-sunburst/visual-map-sunburst-option.factory';
export type { TngVisualMapSunburstChartOptionInput } from './lib/series/sunburst/visual-map-sunburst/visual-map-sunburst-option.factory';
export {
  TngVisualMapSunburstChartComponent,
  TngVisualMapSunburstChartComponent as TngVisualMapSunburstChart,
} from './lib/series/sunburst/visual-map-sunburst/tng-visual-map-sunburst-chart.component';
export { createTngBasicParallelChartOption } from './lib/series/parallel/basic-parallel/basic-parallel-option.factory';
export type { TngBasicParallelChartOptionInput } from './lib/series/parallel/basic-parallel/basic-parallel-option.factory';
export {
  TngBasicParallelChartComponent,
  TngBasicParallelChartComponent as TngBasicParallelChart,
} from './lib/series/parallel/basic-parallel/tng-basic-parallel-chart.component';
export { createTngAqiParallelChartOption } from './lib/series/parallel/aqi-parallel/aqi-parallel-option.factory';
export type { TngAqiParallelChartOptionInput } from './lib/series/parallel/aqi-parallel/aqi-parallel-option.factory';
export {
  TngAqiParallelChartComponent,
  TngAqiParallelChartComponent as TngAqiParallelChart,
} from './lib/series/parallel/aqi-parallel/tng-aqi-parallel-chart.component';
export { createTngNutrientsParallelChartOption } from './lib/series/parallel/nutrients-parallel/nutrients-parallel-option.factory';
export type { TngNutrientsParallelChartOptionInput } from './lib/series/parallel/nutrients-parallel/nutrients-parallel-option.factory';
export {
  TngNutrientsParallelChartComponent,
  TngNutrientsParallelChartComponent as TngNutrientsParallelChart,
} from './lib/series/parallel/nutrients-parallel/tng-nutrients-parallel-chart.component';
export { createTngBasicSankeyChartOption } from './lib/series/sankey/basic-sankey/basic-sankey-option.factory';
export type { TngBasicSankeyChartOptionInput } from './lib/series/sankey/basic-sankey/basic-sankey-option.factory';
export {
  TngBasicSankeyChartComponent,
  TngBasicSankeyChartComponent as TngBasicSankeyChart,
} from './lib/series/sankey/basic-sankey/tng-basic-sankey-chart.component';
export { createTngVerticalSankeyChartOption } from './lib/series/sankey/vertical-sankey/vertical-sankey-option.factory';
export type { TngVerticalSankeyChartOptionInput } from './lib/series/sankey/vertical-sankey/vertical-sankey-option.factory';
export {
  TngVerticalSankeyChartComponent,
  TngVerticalSankeyChartComponent as TngVerticalSankeyChart,
} from './lib/series/sankey/vertical-sankey/tng-vertical-sankey-chart.component';
export { createTngStyledSankeyChartOption } from './lib/series/sankey/styled-sankey/styled-sankey-option.factory';
export type { TngStyledSankeyChartOptionInput } from './lib/series/sankey/styled-sankey/styled-sankey-option.factory';
export {
  TngStyledSankeyChartComponent,
  TngStyledSankeyChartComponent as TngStyledSankeyChart,
} from './lib/series/sankey/styled-sankey/tng-styled-sankey-chart.component';
export { createTngLevelSankeyChartOption } from './lib/series/sankey/level-sankey/level-sankey-option.factory';
export type { TngLevelSankeyChartOptionInput } from './lib/series/sankey/level-sankey/level-sankey-option.factory';
export {
  TngLevelSankeyChartComponent,
  TngLevelSankeyChartComponent as TngLevelSankeyChart,
} from './lib/series/sankey/level-sankey/tng-level-sankey-chart.component';
export { createTngGradientEdgeSankeyChartOption } from './lib/series/sankey/gradient-edge-sankey/gradient-edge-sankey-option.factory';
export type { TngGradientEdgeSankeyChartOptionInput } from './lib/series/sankey/gradient-edge-sankey/gradient-edge-sankey-option.factory';
export {
  TngGradientEdgeSankeyChartComponent,
  TngGradientEdgeSankeyChartComponent as TngGradientEdgeSankeyChart,
} from './lib/series/sankey/gradient-edge-sankey/tng-gradient-edge-sankey-chart.component';
export { createTngNodeAlignedSankeyChartOption } from './lib/series/sankey/node-aligned-sankey/node-aligned-sankey-option.factory';
export type { TngNodeAlignedSankeyChartOptionInput } from './lib/series/sankey/node-aligned-sankey/node-aligned-sankey-option.factory';
export {
  TngNodeAlignedSankeyChartComponent,
  TngNodeAlignedSankeyChartComponent as TngNodeAlignedSankeyChart,
} from './lib/series/sankey/node-aligned-sankey/tng-node-aligned-sankey-chart.component';
export { createTngBasicChordChartOption } from './lib/series/chord/basic-chord/basic-chord-option.factory';
export type { TngBasicChordChartOptionInput } from './lib/series/chord/basic-chord/basic-chord-option.factory';
export {
  TngBasicChordChartComponent,
  TngBasicChordChartComponent as TngBasicChordChart,
} from './lib/series/chord/basic-chord/tng-basic-chord-chart.component';
export { createTngChordMinAngleChartOption } from './lib/series/chord/chord-min-angle/chord-min-angle-option.factory';
export type { TngChordMinAngleChartOptionInput } from './lib/series/chord/chord-min-angle/chord-min-angle-option.factory';
export {
  TngChordMinAngleChartComponent,
  TngChordMinAngleChartComponent as TngChordMinAngleChart,
} from './lib/series/chord/chord-min-angle/tng-chord-min-angle-chart.component';
export { createTngChordLineStyleColorChartOption } from './lib/series/chord/chord-line-style-color/chord-line-style-color-option.factory';
export type { TngChordLineStyleColorChartOptionInput } from './lib/series/chord/chord-line-style-color/chord-line-style-color-option.factory';
export {
  TngChordLineStyleColorChartComponent,
  TngChordLineStyleColorChartComponent as TngChordLineStyleColorChart,
} from './lib/series/chord/chord-line-style-color/tng-chord-line-style-color-chart.component';
export { createTngStyledChordChartOption } from './lib/series/chord/styled-chord/styled-chord-option.factory';
export type { TngStyledChordChartOptionInput } from './lib/series/chord/styled-chord/styled-chord-option.factory';
export {
  TngStyledChordChartComponent,
  TngStyledChordChartComponent as TngStyledChordChart,
} from './lib/series/chord/styled-chord/tng-styled-chord-chart.component';
export { createTngBasicFunnelChartOption } from './lib/series/funnel/basic-funnel/basic-funnel-option.factory';
export type { TngBasicFunnelChartOptionInput } from './lib/series/funnel/basic-funnel/basic-funnel-option.factory';
export {
  TngBasicFunnelChartComponent,
  TngBasicFunnelChartComponent as TngBasicFunnelChart,
} from './lib/series/funnel/basic-funnel/tng-basic-funnel-chart.component';
export { createTngCompareFunnelChartOption } from './lib/series/funnel/compare-funnel/compare-funnel-option.factory';
export type { TngCompareFunnelChartOptionInput } from './lib/series/funnel/compare-funnel/compare-funnel-option.factory';
export {
  TngCompareFunnelChartComponent,
  TngCompareFunnelChartComponent as TngCompareFunnelChart,
} from './lib/series/funnel/compare-funnel/tng-compare-funnel-chart.component';
export { createTngCustomizedFunnelChartOption } from './lib/series/funnel/customized-funnel/customized-funnel-option.factory';
export type { TngCustomizedFunnelChartOptionInput } from './lib/series/funnel/customized-funnel/customized-funnel-option.factory';
export {
  TngCustomizedFunnelChartComponent,
  TngCustomizedFunnelChartComponent as TngCustomizedFunnelChart,
} from './lib/series/funnel/customized-funnel/tng-customized-funnel-chart.component';
export { createTngMultipleFunnelChartOption } from './lib/series/funnel/multiple-funnel/multiple-funnel-option.factory';
export type { TngMultipleFunnelChartOptionInput } from './lib/series/funnel/multiple-funnel/multiple-funnel-option.factory';
export {
  TngMultipleFunnelChartComponent,
  TngMultipleFunnelChartComponent as TngMultipleFunnelChart,
} from './lib/series/funnel/multiple-funnel/tng-multiple-funnel-chart.component';
export { createTngBasicGaugeChartOption } from './lib/series/gauge/basic-gauge/basic-gauge-option.factory';
export type { TngBasicGaugeChartOptionInput } from './lib/series/gauge/basic-gauge/basic-gauge-option.factory';
export {
  TngBasicGaugeChartComponent,
  TngBasicGaugeChartComponent as TngBasicGaugeChart,
} from './lib/series/gauge/basic-gauge/tng-basic-gauge-chart.component';
export { createTngSpeedGaugeChartOption } from './lib/series/gauge/speed-gauge/speed-gauge-option.factory';
export type { TngSpeedGaugeChartOptionInput } from './lib/series/gauge/speed-gauge/speed-gauge-option.factory';
export {
  TngSpeedGaugeChartComponent,
  TngSpeedGaugeChartComponent as TngSpeedGaugeChart,
} from './lib/series/gauge/speed-gauge/tng-speed-gauge-chart.component';
export { createTngProgressGaugeChartOption } from './lib/series/gauge/progress-gauge/progress-gauge-option.factory';
export type { TngProgressGaugeChartOptionInput } from './lib/series/gauge/progress-gauge/progress-gauge-option.factory';
export {
  TngProgressGaugeChartComponent,
  TngProgressGaugeChartComponent as TngProgressGaugeChart,
} from './lib/series/gauge/progress-gauge/tng-progress-gauge-chart.component';
export { createTngGradeGaugeChartOption } from './lib/series/gauge/grade-gauge/grade-gauge-option.factory';
export type { TngGradeGaugeChartOptionInput } from './lib/series/gauge/grade-gauge/grade-gauge-option.factory';
export {
  TngGradeGaugeChartComponent,
  TngGradeGaugeChartComponent as TngGradeGaugeChart,
} from './lib/series/gauge/grade-gauge/tng-grade-gauge-chart.component';
export { createTngMultiTitleGaugeChartOption } from './lib/series/gauge/multi-title-gauge/multi-title-gauge-option.factory';
export type { TngMultiTitleGaugeChartOptionInput } from './lib/series/gauge/multi-title-gauge/multi-title-gauge-option.factory';
export {
  TngMultiTitleGaugeChartComponent,
  TngMultiTitleGaugeChartComponent as TngMultiTitleGaugeChart,
} from './lib/series/gauge/multi-title-gauge/tng-multi-title-gauge-chart.component';
export { createTngTemperatureGaugeChartOption } from './lib/series/gauge/temperature-gauge/temperature-gauge-option.factory';
export type { TngTemperatureGaugeChartOptionInput } from './lib/series/gauge/temperature-gauge/temperature-gauge-option.factory';
export {
  TngTemperatureGaugeChartComponent,
  TngTemperatureGaugeChartComponent as TngTemperatureGaugeChart,
} from './lib/series/gauge/temperature-gauge/tng-temperature-gauge-chart.component';
export { createTngRingGaugeChartOption } from './lib/series/gauge/ring-gauge/ring-gauge-option.factory';
export type { TngRingGaugeChartOptionInput } from './lib/series/gauge/ring-gauge/ring-gauge-option.factory';
export {
  TngRingGaugeChartComponent,
  TngRingGaugeChartComponent as TngRingGaugeChart,
} from './lib/series/gauge/ring-gauge/tng-ring-gauge-chart.component';
export { createTngBarometerGaugeChartOption } from './lib/series/gauge/barometer-gauge/barometer-gauge-option.factory';
export type { TngBarometerGaugeChartOptionInput } from './lib/series/gauge/barometer-gauge/barometer-gauge-option.factory';
export {
  TngBarometerGaugeChartComponent,
  TngBarometerGaugeChartComponent as TngBarometerGaugeChart,
} from './lib/series/gauge/barometer-gauge/tng-barometer-gauge-chart.component';
export { createTngClockGaugeChartOption } from './lib/series/gauge/clock-gauge/clock-gauge-option.factory';
export type { TngClockGaugeChartOptionInput } from './lib/series/gauge/clock-gauge/clock-gauge-option.factory';
export {
  TngClockGaugeChartComponent,
  TngClockGaugeChartComponent as TngClockGaugeChart,
} from './lib/series/gauge/clock-gauge/tng-clock-gauge-chart.component';
export { createTngBasicPictorialBarChartOption } from './lib/series/pictorial-bar/basic-pictorial-bar/basic-pictorial-bar-option.factory';
export type { TngBasicPictorialBarChartOptionInput } from './lib/series/pictorial-bar/basic-pictorial-bar/basic-pictorial-bar-option.factory';
export {
  TngBasicPictorialBarChartComponent,
  TngBasicPictorialBarChartComponent as TngBasicPictorialBarChart,
} from './lib/series/pictorial-bar/basic-pictorial-bar/tng-basic-pictorial-bar-chart.component';
export { createTngSymbolPictorialBarChartOption } from './lib/series/pictorial-bar/symbol-pictorial-bar/symbol-pictorial-bar-option.factory';
export type { TngSymbolPictorialBarChartOptionInput } from './lib/series/pictorial-bar/symbol-pictorial-bar/symbol-pictorial-bar-option.factory';
export {
  TngSymbolPictorialBarChartComponent,
  TngSymbolPictorialBarChartComponent as TngSymbolPictorialBarChart,
} from './lib/series/pictorial-bar/symbol-pictorial-bar/tng-symbol-pictorial-bar-chart.component';
export { createTngDottedPictorialBarChartOption } from './lib/series/pictorial-bar/dotted-pictorial-bar/dotted-pictorial-bar-option.factory';
export type { TngDottedPictorialBarChartOptionInput } from './lib/series/pictorial-bar/dotted-pictorial-bar/dotted-pictorial-bar-option.factory';
export {
  TngDottedPictorialBarChartComponent,
  TngDottedPictorialBarChartComponent as TngDottedPictorialBarChart,
} from './lib/series/pictorial-bar/dotted-pictorial-bar/tng-dotted-pictorial-bar-chart.component';
export { createTngImageSvgPictorialBarChartOption } from './lib/series/pictorial-bar/image-svg-pictorial-bar/image-svg-pictorial-bar-option.factory';
export type { TngImageSvgPictorialBarChartOptionInput } from './lib/series/pictorial-bar/image-svg-pictorial-bar/image-svg-pictorial-bar-option.factory';
export {
  TngImageSvgPictorialBarChartComponent,
  TngImageSvgPictorialBarChartComponent as TngImageSvgPictorialBarChart,
} from './lib/series/pictorial-bar/image-svg-pictorial-bar/tng-image-svg-pictorial-bar-chart.component';
export { createTngBasicThemeRiverChartOption } from './lib/series/theme-river/basic-theme-river/basic-theme-river-option.factory';
export type { TngBasicThemeRiverChartOptionInput } from './lib/series/theme-river/basic-theme-river/basic-theme-river-option.factory';
export {
  TngBasicThemeRiverChartComponent,
  TngBasicThemeRiverChartComponent as TngBasicThemeRiverChart,
} from './lib/series/theme-river/basic-theme-river/tng-basic-theme-river-chart.component';
export { createTngBasicCalendarChartOption } from './lib/series/calendar/basic-calendar/basic-calendar-option.factory';
export type { TngBasicCalendarChartOptionInput } from './lib/series/calendar/basic-calendar/basic-calendar-option.factory';
export {
  TngBasicCalendarChartComponent,
  TngBasicCalendarChartComponent as TngBasicCalendarChart,
} from './lib/series/calendar/basic-calendar/tng-basic-calendar-chart.component';
export { createTngCalendarCalendarHeatmapChartOption } from './lib/series/calendar/calendar-heatmap/calendar-heatmap-option.factory';
export type { TngCalendarCalendarHeatmapChartOptionInput } from './lib/series/calendar/calendar-heatmap/calendar-heatmap-option.factory';
export {
  TngCalendarCalendarHeatmapChartComponent,
  TngCalendarCalendarHeatmapChartComponent as TngCalendarCalendarHeatmapChart,
} from './lib/series/calendar/calendar-heatmap/tng-calendar-heatmap-chart.component';
export { createTngCalendarCalendarGraphChartOption } from './lib/series/calendar/calendar-graph/calendar-graph-option.factory';
export type { TngCalendarCalendarGraphChartOptionInput } from './lib/series/calendar/calendar-graph/calendar-graph-option.factory';
export {
  TngCalendarCalendarGraphChartComponent,
  TngCalendarCalendarGraphChartComponent as TngCalendarCalendarGraphChart,
} from './lib/series/calendar/calendar-graph/tng-calendar-graph-chart.component';
export { createTngCalendarPieChartOption } from './lib/series/calendar/calendar-pie/calendar-pie-option.factory';
export type { TngCalendarPieChartOptionInput } from './lib/series/calendar/calendar-pie/calendar-pie-option.factory';
export {
  TngCalendarPieChartComponent,
  TngCalendarPieChartComponent as TngCalendarPieChart,
} from './lib/series/calendar/calendar-pie/tng-calendar-pie-chart.component';
export { createTngCalendarIconChartOption } from './lib/series/calendar/calendar-icon/calendar-icon-option.factory';
export type { TngCalendarIconChartOptionInput } from './lib/series/calendar/calendar-icon/calendar-icon-option.factory';
export {
  TngCalendarIconChartComponent,
  TngCalendarIconChartComponent as TngCalendarIconChart,
} from './lib/series/calendar/calendar-icon/tng-calendar-icon-chart.component';
export { createTngBasicMatrixChartOption } from './lib/series/matrix/basic-matrix/basic-matrix-option.factory';
export type { TngBasicMatrixChartOptionInput } from './lib/series/matrix/basic-matrix/basic-matrix-option.factory';
export {
  TngBasicMatrixChartComponent,
  TngBasicMatrixChartComponent as TngBasicMatrixChart,
} from './lib/series/matrix/basic-matrix/tng-basic-matrix-chart.component';
export { createTngCorrelationMatrixChartOption } from './lib/series/matrix/correlation-matrix/correlation-matrix-option.factory';
export type { TngCorrelationMatrixChartOptionInput } from './lib/series/matrix/correlation-matrix/correlation-matrix-option.factory';
export {
  TngCorrelationMatrixChartComponent,
  TngCorrelationMatrixChartComponent as TngCorrelationMatrixChart,
} from './lib/series/matrix/correlation-matrix/tng-correlation-matrix-chart.component';
export { createTngCovarianceMatrixChartOption } from './lib/series/matrix/covariance-matrix/covariance-matrix-option.factory';
export type { TngCovarianceMatrixChartOptionInput } from './lib/series/matrix/covariance-matrix/covariance-matrix-option.factory';
export {
  TngCovarianceMatrixChartComponent,
  TngCovarianceMatrixChartComponent as TngCovarianceMatrixChart,
} from './lib/series/matrix/covariance-matrix/tng-covariance-matrix-chart.component';
export { createTngConfusionMatrixChartOption } from './lib/series/matrix/confusion-matrix/confusion-matrix-option.factory';
export type { TngConfusionMatrixChartOptionInput } from './lib/series/matrix/confusion-matrix/confusion-matrix-option.factory';
export {
  TngConfusionMatrixChartComponent,
  TngConfusionMatrixChartComponent as TngConfusionMatrixChart,
} from './lib/series/matrix/confusion-matrix/tng-confusion-matrix-chart.component';
export { createTngGraphMatrixChartOption } from './lib/series/matrix/graph-matrix/graph-matrix-option.factory';
export type { TngGraphMatrixChartOptionInput } from './lib/series/matrix/graph-matrix/graph-matrix-option.factory';
export {
  TngGraphMatrixChartComponent,
  TngGraphMatrixChartComponent as TngGraphMatrixChart,
} from './lib/series/matrix/graph-matrix/tng-graph-matrix-chart.component';
export { createTngPieMatrixChartOption } from './lib/series/matrix/pie-matrix/pie-matrix-option.factory';
export type { TngPieMatrixChartOptionInput } from './lib/series/matrix/pie-matrix/pie-matrix-option.factory';
export {
  TngPieMatrixChartComponent,
  TngPieMatrixChartComponent as TngPieMatrixChart,
} from './lib/series/matrix/pie-matrix/tng-pie-matrix-chart.component';
export { createTngResponsiveMatrixLayoutChartOption } from './lib/series/matrix/responsive-matrix-layout/responsive-matrix-layout-option.factory';
export type { TngResponsiveMatrixLayoutChartOptionInput } from './lib/series/matrix/responsive-matrix-layout/responsive-matrix-layout-option.factory';
export {
  TngResponsiveMatrixLayoutChartComponent,
  TngResponsiveMatrixLayoutChartComponent as TngResponsiveMatrixLayoutChart,
} from './lib/series/matrix/responsive-matrix-layout/tng-responsive-matrix-layout-chart.component';
