import type { Routes } from '@angular/router';
import { COMPONENTS_LAYOUT_GROUP, toComponentsDocsRouteData } from '../../component-docs.data';

const group = COMPONENTS_LAYOUT_GROUP;
const splitItem = group.items.find((item) => item.slug === 'split');
if (splitItem === undefined) {
  throw new Error('Missing "split" in components layout docs group.');
}

export const COMPONENTS_LAYOUT_SPLIT_ROUTES: Routes = [
  {
    path: '',
    data: toComponentsDocsRouteData(group, splitItem),
    loadComponent: () =>
      import('./split-page.component').then((module) => module.SplitPageComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./sections/overview/split-overview-page.component').then(
            (module) => module.SplitOverviewPageComponent,
          ),
      },
      {
        path: 'api',
        loadComponent: () =>
          import('./sections/api/split-api-page.component').then(
            (module) => module.SplitApiPageComponent,
          ),
      },
      {
        path: 'styling',
        loadComponent: () =>
          import('./sections/styling/split-styling-page.component').then(
            (module) => module.SplitStylingPageComponent,
          ),
      },
      {
        path: 'examples',
        loadComponent: () =>
          import('./sections/examples/split-examples-page.component').then(
            (module) => module.SplitExamplesPageComponent,
          ),
      },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];
