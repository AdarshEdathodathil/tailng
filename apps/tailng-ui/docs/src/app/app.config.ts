import { provideHttpClient } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTngCodeHighlighting } from '@tailng-ui/components';
import { provideTngIcons } from '@tailng-ui/icons';
import { defaultDarkThemePreset, provideTailngTheme } from '@tailng-ui/theme';
import { appRoutes } from './app.routes';
import { shikiCodeHighlighterAdapter } from './code-highlighting/shiki-code-highlighter.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(appRoutes),
    provideTailngTheme({ theme: defaultDarkThemePreset }),
    provideTngIcons(),
    provideTngCodeHighlighting({
      adapters: [shikiCodeHighlighterAdapter],
      defaultAdapter: 'shiki',
    }),
  ],
};
