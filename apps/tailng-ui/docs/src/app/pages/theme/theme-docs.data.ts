import {
  atlasDarkThemePreset,
  atlasThemePreset,
  daybookClassicDarkThemePreset,
  daybookClassicThemePreset,
  defaultDarkThemePreset,
  defaultThemePreset,
  minimalDarkThemePreset,
  minimalThemePreset,
  nexusDarkThemePreset,
  nexusThemePreset,
  prismDarkThemePreset,
  prismThemePreset,
  slateDarkThemePreset,
  slateThemePreset,
  sterlingDarkThemePreset,
  sterlingThemePreset,
  type ThemeDefinition,
} from '@tailng-ui/theme';

export type ThemeDocsCategoryId = 'guides' | 'reference' | 'tools';

export type ThemeDocsItem = Readonly<{
  description: string;
  /** Optional full href override. When set, the item links directly to this URL instead of the default `/theme/{group}/{slug}` path. */
  href?: string;
  id: string;
  slug: string;
  title: string;
}>;

export type ThemeDocsGroup = Readonly<{
  id: ThemeDocsCategoryId;
  items: readonly ThemeDocsItem[];
  subtitle: string;
  title: string;
}>;

export type ThemeDocsPresetId =
  | 'default'
  | 'minimal'
  | 'slate'
  | 'nexus'
  | 'prism'
  | 'atlas'
  | 'sterling'
  | 'daybook-classic';

export type ThemeDocsModeId = 'light' | 'dark';

export type ThemeDocsPresetOption = Readonly<{
  darkExport: string;
  description: string;
  id: ThemeDocsPresetId;
  label: string;
  lightExport: string;
}>;

export type ThemeDocsModeOption = Readonly<{
  id: ThemeDocsModeId;
  label: string;
}>;

type ThemeDocsPresetRecord = Readonly<{
  dark: ThemeDefinition;
  light: ThemeDefinition;
}>;

export const THEME_GUIDES_GROUP: ThemeDocsGroup = {
  id: 'guides',
  title: 'Getting Started',
  subtitle: 'Setup and authoring guides',
  items: [
    {
      id: 'getting-started',
      slug: 'getting-started',
      title: 'Getting Started',
      description: 'Install the package, register a preset, and understand the main theme workflow.',
    },
    {
      id: 'creating-a-new-theme',
      slug: 'creating-a-new-theme',
      title: 'Creating a New Theme',
      description: 'Compose a product theme from a preset and override semantic scales safely.',
    },
    {
      id: 'configure-default-theme',
      slug: 'configure-default-theme',
      title: 'Configure Default Theme',
      description: 'Set up and configure the default theme for your Angular application.',
      href: '/components/getting-started/configure-theme',
    },
  ],
};

export const THEME_TOOLS_GROUP: ThemeDocsGroup = {
  id: 'tools',
  title: 'Tools',
  subtitle: 'Starters and interactive helpers',
  items: [
    {
      id: 'download-example-theme',
      slug: 'download-example-theme',
      title: 'Download Example Theme',
      description: 'Grab a starter theme file you can drop into an app and customize.',
    },
    {
      id: 'theme-builder',
      slug: 'theme-builder',
      title: 'Theme Builder',
      description: 'Preview presets, modes, generated CSS variables, and resolved semantic tokens.',
    },
  ],
};

export const THEME_REFERENCE_GROUP: ThemeDocsGroup = {
  id: 'reference',
  title: 'Reference',
  subtitle: 'APIs, styling contracts, and runnable examples',
  items: [
    {
      id: 'api',
      slug: 'api',
      title: 'API',
      description: 'Public types, helpers, runtime adapters, and preset exports.',
    },
    {
      id: 'styling',
      slug: 'styling',
      title: 'Styling Tokens',
      description: 'Primitive and semantic token collections, CSS vars, and Tailwind adapter output.',
    },
    {
      id: 'examples',
      slug: 'examples',
      title: 'Examples',
      description: 'Provider, scoped CSS variable, and Tailwind integration patterns.',
    },
  ],
};

export const THEME_DOCS_GROUPS: readonly ThemeDocsGroup[] = [
  THEME_GUIDES_GROUP,
  THEME_TOOLS_GROUP,
  THEME_REFERENCE_GROUP,
] as const;

export const DEFAULT_THEME_DOCS_PRESET: ThemeDocsPresetId = 'default';
export const DEFAULT_THEME_DOCS_MODE: ThemeDocsModeId = 'light';
export const DEFAULT_THEME_DOCS_SEGMENT = `${THEME_GUIDES_GROUP.id}/${THEME_GUIDES_GROUP.items[0]?.slug ?? 'getting-started'}`;

export const THEME_DOCS_PRESET_OPTIONS: readonly ThemeDocsPresetOption[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Balanced spacing and expressive accents for general product interfaces.',
    lightExport: 'defaultThemePreset',
    darkExport: 'defaultDarkThemePreset',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Compact and low-contrast when content density matters more than decoration.',
    lightExport: 'minimalThemePreset',
    darkExport: 'minimalDarkThemePreset',
  },
  {
    id: 'slate',
    label: 'Slate',
    description: 'Quiet neutrals for polished dashboards and dense application shells.',
    lightExport: 'slateThemePreset',
    darkExport: 'slateDarkThemePreset',
  },
  {
    id: 'nexus',
    label: 'Nexus',
    description: 'Modern accent balance suited to product surfaces with a little more energy.',
    lightExport: 'nexusThemePreset',
    darkExport: 'nexusDarkThemePreset',
  },
  {
    id: 'prism',
    label: 'Prism',
    description: 'Sharper contrast and brighter accents for expressive product moments.',
    lightExport: 'prismThemePreset',
    darkExport: 'prismDarkThemePreset',
  },
  {
    id: 'atlas',
    label: 'Atlas',
    description: 'Confident teal-led tones that feel grounded across operational tools.',
    lightExport: 'atlasThemePreset',
    darkExport: 'atlasDarkThemePreset',
  },
  {
    id: 'sterling',
    label: 'Sterling',
    description: 'Premium contrast and refined accents for more editorial or branded experiences.',
    lightExport: 'sterlingThemePreset',
    darkExport: 'sterlingDarkThemePreset',
  },
  {
    id: 'daybook-classic',
    label: 'Daybook Classic',
    description: 'Ledger-toned paper, navy, and signal colors for dense finance workflows.',
    lightExport: 'daybookClassicThemePreset',
    darkExport: 'daybookClassicDarkThemePreset',
  },
] as const;

export const THEME_DOCS_MODE_OPTIONS: readonly ThemeDocsModeOption[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const;

const themeDocsPresetMap: Readonly<Record<ThemeDocsPresetId, ThemeDocsPresetRecord>> = {
  default: {
    light: defaultThemePreset,
    dark: defaultDarkThemePreset,
  },
  minimal: {
    light: minimalThemePreset,
    dark: minimalDarkThemePreset,
  },
  slate: {
    light: slateThemePreset,
    dark: slateDarkThemePreset,
  },
  nexus: {
    light: nexusThemePreset,
    dark: nexusDarkThemePreset,
  },
  prism: {
    light: prismThemePreset,
    dark: prismDarkThemePreset,
  },
  atlas: {
    light: atlasThemePreset,
    dark: atlasDarkThemePreset,
  },
  sterling: {
    light: sterlingThemePreset,
    dark: sterlingDarkThemePreset,
  },
  'daybook-classic': {
    light: daybookClassicThemePreset,
    dark: daybookClassicDarkThemePreset,
  },
} as const;

export function isThemeDocsPresetId(value: string): value is ThemeDocsPresetId {
  return THEME_DOCS_PRESET_OPTIONS.some((option) => option.id === value);
}

export function isThemeDocsModeId(value: string): value is ThemeDocsModeId {
  return THEME_DOCS_MODE_OPTIONS.some((option) => option.id === value);
}

export function buildThemeDocHref(
  groupId: ThemeDocsCategoryId,
  itemSlug: string,
): string {
  return `/theme/${groupId}/${itemSlug}`;
}

export function getThemeDocsPresetOption(
  preset: ThemeDocsPresetId,
): ThemeDocsPresetOption {
  const matchedOption = THEME_DOCS_PRESET_OPTIONS.find((option) => option.id === preset);
  return matchedOption ?? THEME_DOCS_PRESET_OPTIONS[0];
}

export function getThemeDocsTheme(
  preset: ThemeDocsPresetId,
  mode: ThemeDocsModeId,
): ThemeDefinition {
  return themeDocsPresetMap[preset][mode];
}

export function getThemeDocsPresetExportName(
  preset: ThemeDocsPresetId,
  mode: ThemeDocsModeId,
): string {
  const presetOption = getThemeDocsPresetOption(preset);
  return mode === 'dark' ? presetOption.darkExport : presetOption.lightExport;
}
