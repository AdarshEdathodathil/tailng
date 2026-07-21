import type { Routes } from '@angular/router';
import { TNG_CHART_RENDERING_ENABLED } from '@tailng-ui/charts';
import { DEFAULT_CHARTS_DOCS_SEGMENT } from './chart-docs.data';

type DocsPrerenderGlobal = typeof globalThis & {
  readonly __TAILNG_DOCS_PRERENDER__?: boolean;
};

function shouldRenderDocsCharts(): boolean {
  return (globalThis as DocsPrerenderGlobal).__TAILNG_DOCS_PRERENDER__ !== true;
}

export const CHARTS_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: TNG_CHART_RENDERING_ENABLED, useFactory: shouldRenderDocsCharts }],
    loadComponent: () =>
      import('./landing/charts-page.component').then((module) => module.ChartsPageComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: DEFAULT_CHARTS_DOCS_SEGMENT,
      },
      {
        path: 'getting-started',
        loadChildren: () =>
          import('./getting-started/routes').then((module) => module.CHARTS_GETTING_STARTED_ROUTES),
      },
      {
        path: 'line',
        loadChildren: () => import('./line/routes').then((module) => module.CHARTS_LINE_ROUTES),
      },
      {
        path: 'area',
        loadChildren: () => import('./area/routes').then((module) => module.CHARTS_AREA_ROUTES),
      },
      {
        path: 'bar',
        loadChildren: () => import('./bar/routes').then((module) => module.CHARTS_BAR_ROUTES),
      },
      {
        path: 'pie',
        loadChildren: () => import('./pie/routes').then((module) => module.CHARTS_PIE_ROUTES),
      },
      {
        path: 'scatter',
        loadChildren: () =>
          import('./scatter/routes').then((module) => module.CHARTS_SCATTER_ROUTES),
      },
      {
        path: 'heatmap',
        loadChildren: () =>
          import('./heatmap/routes').then((module) => module.CHARTS_HEATMAP_ROUTES),
      },
      {
        path: 'boxplot',
        loadChildren: () =>
          import('./boxplot/routes').then((module) => module.CHARTS_BOXPLOT_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./calendar/routes').then((module) => module.CHARTS_CALENDAR_ROUTES),
      },
      {
        path: 'candlestick',
        loadChildren: () =>
          import('./candlestick/routes').then((module) => module.CHARTS_CANDLESTICK_ROUTES),
      },
      {
        path: 'chord',
        loadChildren: () => import('./chord/routes').then((module) => module.CHARTS_CHORD_ROUTES),
      },
      {
        path: 'funnel',
        loadChildren: () => import('./funnel/routes').then((module) => module.CHARTS_FUNNEL_ROUTES),
      },
      {
        path: 'gauge',
        loadChildren: () => import('./gauge/routes').then((module) => module.CHARTS_GAUGE_ROUTES),
      },
      {
        path: 'geo-map',
        loadChildren: () =>
          import('./geo-map/routes').then((module) => module.CHARTS_GEO_MAP_ROUTES),
      },
      {
        path: 'graph',
        loadChildren: () => import('./graph/routes').then((module) => module.CHARTS_GRAPH_ROUTES),
      },
      {
        path: 'lines',
        loadChildren: () => import('./lines/routes').then((module) => module.CHARTS_LINES_ROUTES),
      },
      {
        path: 'matrix',
        loadChildren: () => import('./matrix/routes').then((module) => module.CHARTS_MATRIX_ROUTES),
      },
      {
        path: 'parallel',
        loadChildren: () =>
          import('./parallel/routes').then((module) => module.CHARTS_PARALLEL_ROUTES),
      },
      {
        path: 'pictorial-bar',
        loadChildren: () =>
          import('./pictorial-bar/routes').then((module) => module.CHARTS_PICTORIAL_BAR_ROUTES),
      },
      {
        path: 'radar',
        loadChildren: () => import('./radar/routes').then((module) => module.CHARTS_RADAR_ROUTES),
      },
      {
        path: 'sankey',
        loadChildren: () => import('./sankey/routes').then((module) => module.CHARTS_SANKEY_ROUTES),
      },
      {
        path: 'sunburst',
        loadChildren: () =>
          import('./sunburst/routes').then((module) => module.CHARTS_SUNBURST_ROUTES),
      },
      {
        path: 'theme-river',
        loadChildren: () =>
          import('./theme-river/routes').then((module) => module.CHARTS_THEME_RIVER_ROUTES),
      },
      {
        path: 'tree',
        loadChildren: () => import('./tree/routes').then((module) => module.CHARTS_TREE_ROUTES),
      },
      {
        path: 'treemap',
        loadChildren: () =>
          import('./treemap/routes').then((module) => module.CHARTS_TREEMAP_ROUTES),
      },
      {
        path: 'composition',
        loadChildren: () =>
          import('./composition/routes').then((module) => module.CHARTS_COMPOSITION_ROUTES),
      },
      {
        path: '**',
        redirectTo: DEFAULT_CHARTS_DOCS_SEGMENT,
      },
    ],
  },
];
