// vitest.config.ts (at the ROOT)
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    angular({
      // Point this to your actual base tsconfig or tsconfig.base.json
      tsconfig: resolve(__dirname, 'tsconfig.base.json'),
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: [
      {
        find: '@foblex/2d',
        replacement: resolve(__dirname, 'node_modules/@foblex/2d/fesm2015/foblex-2d.js'),
      },
      {
        find: '@foblex/mediator',
        replacement: resolve(
          __dirname,
          'node_modules/@foblex/mediator/fesm2015/foblex-mediator.js',
        ),
      },
      {
        find: '@foblex/utils',
        replacement: resolve(__dirname, 'node_modules/@foblex/utils/fesm2015/foblex-utils.js'),
      },
      {
        find: '@tailng-ui/primitives',
        replacement: resolve(__dirname, 'libs/tailng-ui/primitives/src/index.ts'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'src/test-setup.ts')],
    // Important: Ensure Vitest picks up files in libs/
    include: ['libs/**/*.{test,spec}.ts', 'apps/**/*.{test,spec}.ts'],
    // Add this to prevent Vitest from hanging on large monorepos
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**'],
    // Angular compilation can briefly saturate workers in the full 450+ file run.
    testTimeout: 10_000,
    server: {
      deps: {
        inline: [
          '@foblex/2d',
          '@foblex/flow',
          '@foblex/mediator',
          '@foblex/platform',
          '@foblex/utils',
        ],
      },
    },
  },
});
