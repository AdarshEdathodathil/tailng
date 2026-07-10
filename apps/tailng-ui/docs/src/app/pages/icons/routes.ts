import type { Routes } from '@angular/router';

export const ICONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/icons-page.component').then((m) => m.IconsPageComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./landing/sections/overview/icons-overview-page.component').then(
            (m) => m.IconsOverviewPageComponent,
          ),
      },
      {
        path: 'api',
        loadComponent: () =>
          import('./landing/sections/api/icons-api-page.component').then(
            (m) => m.IconsApiPageComponent,
          ),
      },
      {
        path: 'styling',
        loadComponent: () =>
          import('./landing/sections/styling/icons-styling-page.component').then(
            (m) => m.IconsStylingPageComponent,
          ),
      },
      {
        path: 'examples',
        loadComponent: () =>
          import('./landing/sections/examples/icons-examples-page.component').then(
            (m) => m.IconsExamplesPageComponent,
          ),
      },
      {
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
