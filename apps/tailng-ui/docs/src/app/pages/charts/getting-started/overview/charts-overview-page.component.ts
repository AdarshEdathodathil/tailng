import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  TngAreaChartComponent,
  TngBarChartComponent,
  TngBasicBoxplotChartComponent,
  TngBasicCalendarChartComponent,
  TngBasicCandlestickChartComponent,
  TngBasicChordChartComponent,
  TngBasicFunnelChartComponent,
  TngBasicGaugeChartComponent,
  TngBasicGraphChartComponent,
  TngBasicMatrixChartComponent,
  TngBasicParallelChartComponent,
  TngBasicPictorialBarChartComponent,
  TngBasicRadarChartComponent,
  TngBasicSankeyChartComponent,
  TngBasicSunburstChartComponent,
  TngBasicThemeRiverChartComponent,
  TngBasicTreeChartComponent,
  TngBasicTreemapChartComponent,
  TngGeoMapChartComponent,
  TngHeatmapChartComponent,
  TngLineChartComponent,
  TngLinesGeoLinesChartComponent,
  TngPieChartComponent,
  TngScatterChartComponent,
  type TngChartData,
  type TngChartOptionOverride,
  type TngChartRuntimeLoader,
} from '@tailng-ui/charts';
import {
  TngCardComponent,
  TngCardContentComponent,
  TngCardDescriptionComponent,
  TngCardHeaderComponent,
  TngCardTitleComponent,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { map } from 'rxjs/operators';
import {
  CHARTS_GETTING_STARTED_GROUP,
  toChartsDocsRouteData,
  type ChartsDocsRouteData,
} from '../../chart-docs.data';
import {
  CHART_BOXPLOT_DATA,
  CHART_CANDLESTICK_DATA,
  CHART_CHORD_DATA,
  CHART_ENGAGEMENT_DATA,
  CHART_FUNNEL_DATA,
  CHART_GAUGE_DATA,
  CHART_GRAPH_DATA,
  CHART_HEATMAP_DATA,
  CHART_PICTORIAL_BAR_DATA,
  CHART_PRODUCT_MIX_DATA,
  CHART_REGION_DATA,
  CHART_REGION_SERIES,
  CHART_REVENUE_DATA,
  CHART_SANKEY_DATA,
} from '../../shared/chart-wrapper-docs.config';
import {
  DOCS_GEO_MAP_DATA,
  DOCS_GEO_MAP_NAME,
  loadDocsGeoRuntime,
} from '../../shared/docs-geo-runtime-loader';

const overviewItem = CHARTS_GETTING_STARTED_GROUP.items.find((item) => item.slug === 'overview');
if (!overviewItem) {
  throw new Error('Charts overview item not found.');
}
const fallbackData: ChartsDocsRouteData = toChartsDocsRouteData(
  CHARTS_GETTING_STARTED_GROUP,
  overviewItem,
);

type Capability = Readonly<{ label: string; value: string }>;

type ChartPreviewSlug =
  | 'line'
  | 'area'
  | 'bar'
  | 'pie'
  | 'scatter'
  | 'heatmap'
  | 'geo-map'
  | 'candlestick'
  | 'radar'
  | 'boxplot'
  | 'graph'
  | 'lines'
  | 'tree'
  | 'treemap'
  | 'sunburst'
  | 'parallel'
  | 'sankey'
  | 'chord'
  | 'funnel'
  | 'gauge'
  | 'pictorial-bar'
  | 'theme-river'
  | 'calendar'
  | 'matrix';

type ChartPreview = Readonly<{
  slug: ChartPreviewSlug;
  categorySlug: string;
  docSlug: string;
  title: string;
  description: string;
}>;

@Component({
  selector: 'app-charts-overview-page',
  imports: [
    TngCardComponent,
    TngCardHeaderComponent,
    TngCardTitleComponent,
    TngCardDescriptionComponent,
    TngCardContentComponent,
    TngLineChartComponent,
    TngBarChartComponent,
    TngAreaChartComponent,
    TngPieChartComponent,
    TngScatterChartComponent,
    TngHeatmapChartComponent,
    TngBasicFunnelChartComponent,
    TngGeoMapChartComponent,
    TngBasicCandlestickChartComponent,
    TngBasicRadarChartComponent,
    TngBasicBoxplotChartComponent,
    TngBasicGraphChartComponent,
    TngLinesGeoLinesChartComponent,
    TngBasicTreeChartComponent,
    TngBasicTreemapChartComponent,
    TngBasicSunburstChartComponent,
    TngBasicParallelChartComponent,
    TngBasicSankeyChartComponent,
    TngBasicChordChartComponent,
    TngBasicGaugeChartComponent,
    TngBasicPictorialBarChartComponent,
    TngBasicThemeRiverChartComponent,
    TngBasicCalendarChartComponent,
    TngBasicMatrixChartComponent,
    TngIcon,
    RouterLink,
  ],
  templateUrl: './charts-overview-page.component.html',
  styleUrl: './charts-overview-page.component.css',
})
export class ChartsOverviewPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(
    this.route.data.pipe(
      map((data) => (data as ChartsDocsRouteData | undefined) ?? fallbackData),
    ),
    { initialValue: fallbackData },
  );

  public readonly item = computed(() => this.routeData().item);
  public readonly groupTitle = computed(() => this.routeData().groupTitle);

  protected readonly capabilities: readonly Capability[] = [
    { label: 'Renderers', value: 'Canvas default, SVG opt-in' },
    { label: 'Categories', value: '24 chart categories, 143 components' },
    { label: 'Composition', value: 'Root, surface, legend context' },
    { label: 'Runtime', value: 'ECharts isolated internally' },
  ];

  protected readonly chartPreviews: readonly ChartPreview[] = [
    { slug: 'line', categorySlug: 'line', docSlug: 'line-chart', title: 'Line', description: 'Smoothed trend over categories.' },
    { slug: 'bar', categorySlug: 'bar', docSlug: 'bar-chart', title: 'Bar', description: 'Grouped comparison with legend toggles.' },
    { slug: 'area', categorySlug: 'area', docSlug: 'area-chart', title: 'Area', description: 'Filled cumulative or volume emphasis.' },
    { slug: 'pie', categorySlug: 'pie', docSlug: 'pie-chart', title: 'Pie', description: 'Part-to-whole with donut mode.' },
    { slug: 'scatter', categorySlug: 'scatter', docSlug: 'scatter-chart', title: 'Scatter', description: 'Correlation with sized symbols.' },
    { slug: 'heatmap', categorySlug: 'heatmap', docSlug: 'heatmap-chart', title: 'Heatmap', description: 'Matrix intensity by x/y pairs.' },
    { slug: 'funnel', categorySlug: 'funnel', docSlug: 'basic-funnel', title: 'Funnel', description: 'Stage-by-stage conversion or pipeline flow.' },
    { slug: 'gauge', categorySlug: 'gauge', docSlug: 'basic-gauge', title: 'Gauge', description: 'Single metric progress dial.' },
    { slug: 'candlestick', categorySlug: 'candlestick', docSlug: 'basic-candlestick', title: 'Candlestick', description: 'OHLC financial price chart.' },
    { slug: 'boxplot', categorySlug: 'boxplot', docSlug: 'basic-boxplot', title: 'Boxplot', description: 'Statistical distribution with quartiles.' },
    { slug: 'radar', categorySlug: 'radar', docSlug: 'basic-radar', title: 'Radar', description: 'Multi-axis spider web comparison.' },
    { slug: 'sankey', categorySlug: 'sankey', docSlug: 'basic-sankey', title: 'Sankey', description: 'Flow and energy transfer diagrams.' },
    { slug: 'chord', categorySlug: 'chord', docSlug: 'basic-chord', title: 'Chord', description: 'Circular inter-group relationship matrix.' },
    { slug: 'graph', categorySlug: 'graph', docSlug: 'basic-graph', title: 'Graph', description: 'Node and link network visualization.' },
    { slug: 'tree', categorySlug: 'tree', docSlug: 'basic-tree', title: 'Tree', description: 'Hierarchical parent-child structure.' },
    { slug: 'treemap', categorySlug: 'treemap', docSlug: 'basic-treemap', title: 'Treemap', description: 'Nested rectangles by proportion.' },
    { slug: 'sunburst', categorySlug: 'sunburst', docSlug: 'basic-sunburst', title: 'Sunburst', description: 'Radial hierarchy as concentric rings.' },
    { slug: 'parallel', categorySlug: 'parallel', docSlug: 'basic-parallel', title: 'Parallel', description: 'Multi-dimensional data on parallel axes.' },
    { slug: 'pictorial-bar', categorySlug: 'pictorial-bar', docSlug: 'basic-pictorial-bar', title: 'Pictorial Bar', description: 'Symbol-filled bar chart.' },
    { slug: 'theme-river', categorySlug: 'theme-river', docSlug: 'basic-theme-river', title: 'Theme River', description: 'Stacked stream over a time axis.' },
    { slug: 'calendar', categorySlug: 'calendar', docSlug: 'basic-calendar', title: 'Calendar', description: 'Day-level heatmap on a calendar grid.' },
    { slug: 'matrix', categorySlug: 'matrix', docSlug: 'basic-matrix', title: 'Matrix', description: 'Correlation and confusion matrix grids.' },
    { slug: 'lines', categorySlug: 'lines', docSlug: 'geo-lines', title: 'Lines', description: 'Curved geo connection lines on a map.' },
    { slug: 'geo-map', categorySlug: 'geo-map', docSlug: 'geo-map', title: 'GEO / Map', description: 'Geographic choropleth and overlay maps.' },
  ];
  protected readonly showAllChartPreviews = signal(false);
  protected readonly visibleChartPreviews = computed(() =>
    this.showAllChartPreviews() ? this.chartPreviews : this.chartPreviews.slice(0, 6),
  );

  protected docHref(categorySlug: string, docSlug: string): readonly string[] {
    return ['/charts', categorySlug, docSlug, 'overview'];
  }

  // ── wrapper chart data ─────────────────────────────────────────────────────
  protected readonly revenueData = CHART_REVENUE_DATA;
  protected readonly regionData = CHART_REGION_DATA;
  protected readonly regionSeries = CHART_REGION_SERIES;
  protected readonly productMixData = CHART_PRODUCT_MIX_DATA;
  protected readonly engagementData = CHART_ENGAGEMENT_DATA;
  protected readonly heatmapData = CHART_HEATMAP_DATA;

  // ── catalog chart data ─────────────────────────────────────────────────────
  protected readonly funnelData = CHART_FUNNEL_DATA;
  protected readonly gaugeData = CHART_GAUGE_DATA;
  protected readonly candlestickData = CHART_CANDLESTICK_DATA;
  protected readonly boxplotData = CHART_BOXPLOT_DATA;
  protected readonly sankeyData = CHART_SANKEY_DATA;
  protected readonly chordData = CHART_CHORD_DATA;
  protected readonly graphData = CHART_GRAPH_DATA;
  protected readonly pictorialBarData = CHART_PICTORIAL_BAR_DATA;
  protected readonly geoMapData: TngChartData = DOCS_GEO_MAP_DATA;
  protected readonly geoRuntimeLoader: TngChartRuntimeLoader = loadDocsGeoRuntime;

  // ── optionOverrides for charts needing structured ECharts options ──────────
  protected readonly radarOverride: TngChartOptionOverride = (_) => ({
    legend: { show: false },
    radar: {
      indicator: [
        { name: 'Design', max: 100 },
        { name: 'Perf', max: 100 },
        { name: 'A11y', max: 100 },
        { name: 'Docs', max: 100 },
        { name: 'Tests', max: 100 },
      ],
      radius: '65%',
    },
    series: [{ type: 'radar', data: [{ value: [80, 72, 90, 68, 85] }] }],
    tooltip: { trigger: 'item' },
  });

  protected readonly treeOverride: TngChartOptionOverride = (_) => ({
    series: [{
      type: 'tree',
      data: [{
        name: 'Root',
        children: [
          { name: 'Branch A', children: [{ name: 'Leaf 1' }, { name: 'Leaf 2' }] },
          { name: 'Branch B', children: [{ name: 'Leaf 3' }, { name: 'Leaf 4' }] },
          { name: 'Branch C', children: [{ name: 'Leaf 5' }] },
        ],
      }],
      initialTreeDepth: 2,
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '10%',
    }],
    tooltip: { trigger: 'item' },
  });

  protected readonly treemapOverride: TngChartOptionOverride = (_) => ({
    series: [{
      type: 'treemap',
      data: [
        { name: 'Core', value: 50 },
        { name: 'Pro', value: 30 },
        { name: 'Enterprise', value: 15 },
        { name: 'Services', value: 8 },
        { name: 'Support', value: 5 },
      ],
      label: { show: true, formatter: '{b}' },
      left: '2%',
      right: '2%',
      top: '5%',
      bottom: '5%',
    }],
    tooltip: { trigger: 'item' },
  });

  protected readonly sunburstOverride: TngChartOptionOverride = (_) => ({
    series: [{
      type: 'sunburst',
      data: [
        {
          name: 'Products',
          children: [{ name: 'Core', value: 35 }, { name: 'Pro', value: 25 }],
        },
        {
          name: 'Services',
          children: [{ name: 'Support', value: 20 }, { name: 'Training', value: 18 }],
        },
        { name: 'Other', value: 10 },
      ],
      radius: ['0%', '80%'],
      label: { rotate: 'radial' },
    }],
    tooltip: { trigger: 'item' },
  });

  protected readonly parallelOverride: TngChartOptionOverride = (_) => ({
    parallelAxis: [
      { dim: 0, name: 'Q1' },
      { dim: 1, name: 'Q2' },
      { dim: 2, name: 'Q3' },
      { dim: 3, name: 'Q4' },
    ],
    parallel: { left: '10%', right: '10%', top: '20%', bottom: '20%' },
    series: [{
      type: 'parallel',
      data: [
        [55, 60, 72, 85],
        [40, 55, 63, 70],
        [70, 68, 75, 90],
        [30, 45, 58, 65],
      ],
    }],
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
  });

  protected readonly themeRiverOverride: TngChartOptionOverride = (_) => ({
    legend: { show: true, data: ['Product A', 'Product B', 'Product C'] },
    singleAxis: { type: 'time', bottom: '15%', height: '65%' },
    series: [{
      type: 'themeRiver',
      data: [
        ['2024-01-01', 10, 'Product A'], ['2024-02-01', 15, 'Product A'],
        ['2024-03-01', 22, 'Product A'], ['2024-04-01', 18, 'Product A'],
        ['2024-01-01', 8,  'Product B'], ['2024-02-01', 12, 'Product B'],
        ['2024-03-01', 16, 'Product B'], ['2024-04-01', 20, 'Product B'],
        ['2024-01-01', 5,  'Product C'], ['2024-02-01', 9,  'Product C'],
        ['2024-03-01', 12, 'Product C'], ['2024-04-01', 14, 'Product C'],
      ],
    }],
    tooltip: { trigger: 'axis' },
  });

  protected readonly calendarOverride: TngChartOptionOverride = (_) => ({
    calendar: {
      range: '2024',
      cellSize: ['auto', 13],
      top: 30,
      left: 30,
      right: 30,
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: Array.from({ length: 60 }, (_, i) => {
        const d = new Date(2024, 0, 1 + i * 6);
        return [d.toISOString().slice(0, 10), Math.floor(Math.random() * 80) + 10];
      }),
    }],
    visualMap: { show: false, min: 0, max: 90 },
    tooltip: { trigger: 'item' },
  });

  protected readonly matrixOverride: TngChartOptionOverride = (_) => ({
    grid: { top: 30, left: 60, right: 20, bottom: 40, containLabel: true },
    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'] },
    yAxis: { type: 'category', data: ['W', 'X', 'Y', 'Z'] },
    series: [{
      type: 'heatmap',
      data: [
        [0, 0, 5], [0, 1, 8], [0, 2, 2], [0, 3, 9],
        [1, 0, 3], [1, 1, 7], [1, 2, 6], [1, 3, 4],
        [2, 0, 9], [2, 1, 1], [2, 2, 8], [2, 3, 3],
        [3, 0, 4], [3, 1, 6], [3, 2, 3], [3, 3, 7],
      ],
      label: { show: true },
    }],
    visualMap: { show: false, min: 0, max: 10 },
    tooltip: { trigger: 'item' },
  });

  protected readonly linesOverride: TngChartOptionOverride = (_) => ({
    grid: { top: 18, right: 18, bottom: 18, left: 18 },
    tooltip: { show: false },
    xAxis: { type: 'value', min: 0, max: 150, show: false },
    yAxis: { type: 'value', min: 0, max: 90, show: false },
    series: [{
      type: 'lines',
      coordinateSystem: 'cartesian2d',
      data: [
        { coords: [[18, 66], [132, 30]] },
        { coords: [[46, 20], [112, 74]] },
        { coords: [[10, 45], [140, 55]] },
        { coords: [[40, 76], [100, 14]] },
        { coords: [[6, 34], [126, 62]] },
      ],
      effect: { show: true, symbol: 'arrow', symbolSize: 6, period: 6 },
      lineStyle: { width: 1.5, opacity: 0.72, curveness: 0.24 },
    }],
  });

  protected readonly geoMapOverride: TngChartOptionOverride = (_) => ({
    geo: { map: DOCS_GEO_MAP_NAME, roam: false, silent: true },
    series: [{
      type: 'map',
      map: DOCS_GEO_MAP_NAME,
      data: this.geoMapData,
      itemStyle: { borderColor: '#ffffff', borderWidth: 1 },
      emphasis: { label: { show: false } },
    }],
    tooltip: { trigger: 'item' },
    visualMap: { show: false, min: 0, max: 100 },
  });
}
