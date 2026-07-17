import type { Routes } from '@angular/router';
import { COMPONENTS_LAYOUT_GROUP, toComponentsDocsRouteData } from '../../component-docs.data';

const group = COMPONENTS_LAYOUT_GROUP;
const flowEditorItem = group.items.find((item) => item.slug === 'flow-editor');
if (flowEditorItem === undefined) {
  throw new Error('Missing "flow-editor" in components layout docs group.');
}

export const COMPONENTS_LAYOUT_FLOW_EDITOR_ROUTES: Routes = [
  {
    path: '',
    data: toComponentsDocsRouteData(group, flowEditorItem),
    loadComponent: () =>
      import('./flow-editor-page.component').then((module) => module.FlowEditorPageComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./sections/overview/flow-editor-overview-page.component').then(
            (module) => module.FlowEditorOverviewPageComponent,
          ),
      },
      {
        path: 'api',
        loadComponent: () =>
          import('./sections/api/flow-editor-api-page.component').then(
            (module) => module.FlowEditorApiPageComponent,
          ),
      },
      {
        path: 'styling',
        loadComponent: () =>
          import('./sections/styling/flow-editor-styling-page.component').then(
            (module) => module.FlowEditorStylingPageComponent,
          ),
      },
      {
        path: 'examples',
        loadComponent: () =>
          import('./sections/examples/flow-editor-examples-page.component').then(
            (module) => module.FlowEditorExamplesPageComponent,
          ),
      },
      {
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
