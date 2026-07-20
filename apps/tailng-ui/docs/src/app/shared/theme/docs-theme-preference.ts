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

export type DocsThemePresetId =
  | 'default'
  | 'minimal'
  | 'slate'
  | 'nexus'
  | 'prism'
  | 'atlas'
  | 'sterling'
  | 'daybook-classic';

export type DocsThemeModeId = 'light' | 'dark';

export type DocsThemePreference = Readonly<{
  mode: DocsThemeModeId;
  preset: DocsThemePresetId;
}>;

export const DOCS_THEME_PRESET_STORAGE_KEY = 'tailng.docs.themePreset';
export const DOCS_THEME_MODE_STORAGE_KEY = 'tailng.docs.themeMode';

export const DEFAULT_DOCS_THEME_PRESET: DocsThemePresetId = 'default';
export const DEFAULT_DOCS_THEME_MODE: DocsThemeModeId = 'light';

const docsThemePresets: Readonly<
  Record<DocsThemePresetId, { light: ThemeDefinition; dark: ThemeDefinition }>
> = {
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
};

export function isDocsThemePresetId(value: unknown): value is DocsThemePresetId {
  return typeof value === 'string' && value in docsThemePresets;
}

export function isDocsThemeModeId(value: unknown): value is DocsThemeModeId {
  return value === 'light' || value === 'dark';
}

function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStorageValue(key: string): string | null {
  try {
    return getLocalStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorageValue(key: string, value: string): void {
  try {
    getLocalStorage()?.setItem(key, value);
  } catch {
    // Local storage can be unavailable in private or restricted browser contexts.
  }
}

export function readDocsThemePreset(): DocsThemePresetId {
  const storedPreset = readStorageValue(DOCS_THEME_PRESET_STORAGE_KEY);
  return isDocsThemePresetId(storedPreset) ? storedPreset : DEFAULT_DOCS_THEME_PRESET;
}

export function readDocsThemeMode(): DocsThemeModeId {
  const storedMode = readStorageValue(DOCS_THEME_MODE_STORAGE_KEY);
  return isDocsThemeModeId(storedMode) ? storedMode : DEFAULT_DOCS_THEME_MODE;
}

export function readDocsThemePreference(): DocsThemePreference {
  return {
    mode: readDocsThemeMode(),
    preset: readDocsThemePreset(),
  };
}

export function writeDocsThemePreference(preference: DocsThemePreference): void {
  writeStorageValue(DOCS_THEME_PRESET_STORAGE_KEY, preference.preset);
  writeStorageValue(DOCS_THEME_MODE_STORAGE_KEY, preference.mode);
}

export function resolveDocsTheme(
  preset: DocsThemePresetId,
  mode: DocsThemeModeId,
): ThemeDefinition {
  return docsThemePresets[preset][mode];
}

export function resolveStoredDocsTheme(): ThemeDefinition {
  const preference = readDocsThemePreference();
  return resolveDocsTheme(preference.preset, preference.mode);
}
