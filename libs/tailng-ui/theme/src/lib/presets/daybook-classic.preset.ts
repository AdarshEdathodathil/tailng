import type { ThemeDefinition } from '../contracts/theme.types';
import { createThemeTokens } from '../tokens';

export const daybookClassicThemePreset: ThemeDefinition = {
  meta: {
    name: 'tailng-daybook-classic',
    mode: 'light',
  },
  tokens: createThemeTokens({
    background: {
      base: '#f6edbd',
      canvas: '#f4e79f',
      muted: '#e7d989',
      surface: '#f7ecd0',
    },
    foreground: {
      primary: '#111827',
      secondary: '#26415c',
      muted: '#5f6b54',
      inverse: '#fff7cf',
    },
    border: {
      default: '#9b8e43',
      subtle: '#c9ba62',
      strong: '#174a78',
    },
    accent: {
      brand: '#104a7a',
      brandHover: '#07375d',
      danger: '#b42318',
      success: '#0f7b35',
      warning: '#b86800',
    },
    focus: {
      ring: '#174a78',
    },
  }),
};
