import type { Routes } from '@angular/router';
import { COMPONENTS_FEEDBACK_GROUP, toComponentsDocsRouteData } from '../component-docs.data';

const group = COMPONENTS_FEEDBACK_GROUP;
const defaultItem = group.items[0];
if (defaultItem === undefined) {
  throw new Error('Components feedback docs are empty.');
}

const toastItem = group.items.find((item) => item.slug === 'toast');
if (toastItem === undefined) {
  throw new Error('Missing "toast" in components feedback docs group.');
}
const emptyItem = group.items.find((item) => item.slug === 'empty');
if (emptyItem === undefined) {
  throw new Error('Missing "empty" in components feedback docs group.');
}
const progressBarItem = group.items.find((item) => item.slug === 'progress-bar');
if (progressBarItem === undefined) {
  throw new Error('Missing "progress-bar" in components feedback docs group.');
}
const progressSpinnerItem = group.items.find((item) => item.slug === 'progress-spinner');
if (progressSpinnerItem === undefined) {
  throw new Error('Missing "progress-spinner" in components feedback docs group.');
}
const confettiItem = group.items.find((item) => item.slug === 'confetti');
if (confettiItem === undefined) {
  throw new Error('Missing "confetti" in components feedback docs group.');
}
const skeletonItem = group.items.find((item) => item.slug === 'skeleton');
if (skeletonItem === undefined) {
  throw new Error('Missing "skeleton" in components feedback docs group.');
}

const feedbackLandingSlugs = new Set([
  toastItem.slug,
  emptyItem.slug,
  progressBarItem.slug,
  progressSpinnerItem.slug,
  confettiItem.slug,
  skeletonItem.slug,
]);

export const COMPONENTS_FEEDBACK_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: defaultItem.slug,
  },
  {
    path: toastItem.slug,
    loadChildren: () =>
      import('./toast/routes').then((module) => module.COMPONENTS_FEEDBACK_TOAST_ROUTES),
  },
  {
    path: emptyItem.slug,
    loadChildren: () =>
      import('./empty/routes').then((module) => module.COMPONENTS_FEEDBACK_EMPTY_ROUTES),
  },
  {
    path: progressBarItem.slug,
    loadChildren: () =>
      import('./progress-bar/routes').then(
        (module) => module.COMPONENTS_FEEDBACK_PROGRESS_BAR_ROUTES,
      ),
  },
  {
    path: progressSpinnerItem.slug,
    loadChildren: () =>
      import('./progress-spinner/routes').then(
        (module) => module.COMPONENTS_FEEDBACK_PROGRESS_SPINNER_ROUTES,
      ),
  },
  {
    path: confettiItem.slug,
    loadChildren: () =>
      import('./confetti/routes').then((module) => module.COMPONENTS_FEEDBACK_CONFETTI_ROUTES),
  },
  {
    path: skeletonItem.slug,
    loadChildren: () =>
      import('./skeleton/routes').then((module) => module.COMPONENTS_FEEDBACK_SKELETON_ROUTES),
  },
  ...group.items
    .filter((item) => !feedbackLandingSlugs.has(item.slug))
    .map((item) => ({
      path: item.slug,
      data: toComponentsDocsRouteData(group, item),
      loadComponent: () =>
        import('./landing/feedback-landing-page.component').then(
          (module) => module.FeedbackLandingPageComponent,
        ),
    })),
];
