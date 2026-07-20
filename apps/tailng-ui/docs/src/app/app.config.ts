import { provideHttpClient } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TNG_CHART_RENDERING_ENABLED } from '@tailng-ui/charts';
import { provideTngCodeHighlighting } from '@tailng-ui/components';
import { provideTngIcons } from '@tailng-ui/icons';
import { provideTailngTheme } from '@tailng-ui/theme';
import { appRoutes } from './app.routes';
import { shikiCodeHighlighterAdapter } from './code-highlighting/shiki-code-highlighter.adapter';
import { resolveStoredDocsTheme } from './shared/theme/docs-theme-preference';

type DocsPrerenderGlobal = typeof globalThis & {
  readonly __TAILNG_DOCS_PRERENDER__?: boolean;
};

function shouldRenderDocsCharts(): boolean {
  return (globalThis as DocsPrerenderGlobal).__TAILNG_DOCS_PRERENDER__ !== true;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(appRoutes),
    { provide: TNG_CHART_RENDERING_ENABLED, useFactory: shouldRenderDocsCharts },
    provideTailngTheme({ theme: resolveStoredDocsTheme() }),
    provideTngIcons(),
    provideTngCodeHighlighting({
      adapters: [shikiCodeHighlighterAdapter],
      defaultAdapter: 'shiki',
    }),
  ],
};
