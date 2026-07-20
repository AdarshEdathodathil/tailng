import {
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';

export type TngIconSvg = string;
export type TngIconLoader = () => Promise<TngIconSvg>;
export type TngIconDefinition = TngIconSvg | TngIconLoader;
export type TngIconPackDefinitions = Readonly<Record<string, TngIconDefinition>>;
export type TngIconPackLoaders = Readonly<Record<string, TngIconLoader>>;

export type TngIconPack = Readonly<{
  icons: TngIconPackLoaders;
  name: string;
}>;

export type TngProvideIconsOptions = Readonly<{
  defaultPack?: string;
  packs: readonly TngIconPack[];
}>;

export type TngResolvedIconConfig = Readonly<{
  defaultPack: string;
  packs: Readonly<Record<string, TngIconPackLoaders>>;
}>;

export type TngParsedIconRef = Readonly<{
  name: string;
  pack: string;
}>;

type TngResolveIconConfigOptions = Readonly<{
  allowReservedPackOverride: boolean;
  basePacks: Readonly<Record<string, TngIconPackLoaders>>;
  defaultPack?: string;
  packs: readonly TngIconPack[];
  reservedPackNames: readonly string[];
}>;

type TngMergeIconPacksOptions = Readonly<{
  allowReservedPackOverride: boolean;
  basePacks: Readonly<Record<string, TngIconPackLoaders>>;
  customPacks: readonly TngIconPack[];
  reservedPackNames: readonly string[];
}>;

export const TNG_DEFAULT_ICON_PACK = 'lucide';

const CASE_INSENSITIVE_PACK_NAMES = new Set<string>([TNG_DEFAULT_ICON_PACK]);

function createIconLoader(definition: TngIconDefinition): TngIconLoader {
  if (typeof definition === 'string') {
    return (): Promise<TngIconSvg> => Promise.resolve(definition);
  }

  return definition;
}

function createReadonlyPackLoaders(icons: TngIconPackDefinitions): TngIconPackLoaders {
  const loaders: Record<string, TngIconLoader> = {};

  for (const [iconName, definition] of Object.entries(icons)) {
    loaders[iconName] = createIconLoader(definition);
  }

  return Object.freeze(loaders);
}

function hasPackName(
  packs: Readonly<Record<string, TngIconPackLoaders>>,
  packName: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(packs, packName);
}

function toEffectivePackName(packName: string): string {
  const normalizedPackName = packName.trim();
  const lowercasePackName = normalizedPackName.toLowerCase();

  return CASE_INSENSITIVE_PACK_NAMES.has(lowercasePackName)
    ? lowercasePackName
    : normalizedPackName;
}

function normalizeRequiredValue(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} cannot be empty.`);
  }

  return normalized;
}

function resolveDefaultPackName(
  defaultPack: string | undefined,
  packs: Readonly<Record<string, TngIconPackLoaders>>,
): string {
  const candidate = defaultPack ?? TNG_DEFAULT_ICON_PACK;
  const normalizedCandidate = normalizeRequiredValue(candidate, 'defaultPack');
  const effectiveCandidate = toEffectivePackName(normalizedCandidate);

  if (!hasPackName(packs, effectiveCandidate)) {
    const lucideHint =
      normalizedCandidate.toLowerCase() === 'lucid' && hasPackName(packs, 'lucide')
        ? ' Did you mean "lucide"?'
        : '';

    throw new Error(
      `Unknown defaultPack "${normalizedCandidate}".${lucideHint} Available packs: ${Object.keys(packs).join(', ')}`,
    );
  }

  return effectiveCandidate;
}

function withCustomPacks(options: TngMergeIconPacksOptions): Record<string, TngIconPackLoaders> {
  const mergedPacks: Record<string, TngIconPackLoaders> = { ...options.basePacks };
  const normalizedReservedPackNames = new Set(options.reservedPackNames.map(toEffectivePackName));
  const seenCustomPackNames = new Set<string>();

  for (const customPack of options.customPacks) {
    const normalizedPackName = normalizeRequiredValue(customPack.name, 'pack name');
    const effectivePackName = toEffectivePackName(normalizedPackName);

    if (seenCustomPackNames.has(effectivePackName)) {
      throw new Error(`Duplicate icon pack "${effectivePackName}" provided.`);
    }

    seenCustomPackNames.add(effectivePackName);
    if (normalizedReservedPackNames.has(effectivePackName) && !options.allowReservedPackOverride) {
      throw new Error(
        `Icon pack "${effectivePackName}" is reserved. Set allowBuiltinOverride to true to override it.`,
      );
    }

    mergedPacks[effectivePackName] = Object.freeze({ ...customPack.icons });
  }

  return mergedPacks;
}

function resolveLoaderByParsedRef(
  parsedRef: TngParsedIconRef,
  config: TngResolvedIconConfig,
): TngIconLoader | undefined {
  const pack = config.packs[parsedRef.pack];
  if (pack === undefined) {
    return undefined;
  }

  return pack[parsedRef.name];
}

export function createTngIconPack(name: string, icons: TngIconPackDefinitions): TngIconPack {
  return {
    icons: createReadonlyPackLoaders(icons),
    name: normalizeRequiredValue(name, 'pack name'),
  };
}

export function parseTngIconRef(iconRef: string, defaultPack: string): TngParsedIconRef {
  const normalizedIconRef = normalizeRequiredValue(iconRef, 'icon');
  const separatorIndex = normalizedIconRef.indexOf(':');

  if (separatorIndex < 0) {
    return {
      name: normalizedIconRef,
      pack: toEffectivePackName(normalizeRequiredValue(defaultPack, 'defaultPack')),
    };
  }

  return {
    name: normalizeRequiredValue(normalizedIconRef.slice(separatorIndex + 1), 'icon name'),
    pack: toEffectivePackName(
      normalizeRequiredValue(normalizedIconRef.slice(0, separatorIndex), 'icon pack'),
    ),
  };
}

export function resolveTngIconConfigFromPacks(
  options: TngResolveIconConfigOptions,
): TngResolvedIconConfig {
  const mergedPacks = withCustomPacks({
    allowReservedPackOverride: options.allowReservedPackOverride,
    basePacks: options.basePacks,
    customPacks: options.packs,
    reservedPackNames: options.reservedPackNames,
  });

  return {
    defaultPack: resolveDefaultPackName(options.defaultPack, mergedPacks),
    packs: Object.freeze(mergedPacks),
  };
}

export function resolveTngIconConfig(options: TngProvideIconsOptions): TngResolvedIconConfig {
  return resolveTngIconConfigFromPacks({
    allowReservedPackOverride: false,
    basePacks: {},
    defaultPack: options.defaultPack,
    packs: options.packs,
    reservedPackNames: [],
  });
}

function throwMissingIconConfig(): never {
  throw new Error(
    'TngIcon is not configured. Add provideTngIcons(...) to the application or route providers.',
  );
}

let defaultIconConfigFactory: () => TngResolvedIconConfig = throwMissingIconConfig;

export function configureTngDefaultIconConfigFactory(factory: () => TngResolvedIconConfig): void {
  defaultIconConfigFactory = factory;
}

export const TNG_ICON_CONFIG = new InjectionToken<TngResolvedIconConfig>('TNG_ICON_CONFIG', {
  providedIn: 'root',
  factory: (): TngResolvedIconConfig => defaultIconConfigFactory(),
});

export const TNG_ICON_RESOLVER = new InjectionToken<TngIconResolver>('TNG_ICON_RESOLVER', {
  providedIn: 'root',
  factory: (): TngIconResolver => new TngIconResolver(inject(TNG_ICON_CONFIG)),
});

export function provideResolvedTngIcons(config: TngResolvedIconConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TNG_ICON_CONFIG,
      useValue: config,
    },
    {
      deps: [TNG_ICON_CONFIG],
      provide: TNG_ICON_RESOLVER,
      useFactory: (resolvedConfig: TngResolvedIconConfig): TngIconResolver =>
        new TngIconResolver(resolvedConfig),
    },
  ]);
}

export function provideTngIcons(options: TngProvideIconsOptions): EnvironmentProviders {
  return provideResolvedTngIcons(resolveTngIconConfig(options));
}

export class TngIconResolver {
  private readonly loadCache = new Map<string, Promise<TngIconSvg>>();

  public constructor(private readonly config: TngResolvedIconConfig) {}

  public getAvailablePackNames(): readonly string[] {
    return Object.keys(this.config.packs);
  }

  public getDefaultPackName(): string {
    return this.config.defaultPack;
  }

  public resolveLoader(iconRef: string): TngIconLoader | undefined {
    const parsedRef = parseTngIconRef(iconRef, this.config.defaultPack);
    return resolveLoaderByParsedRef(parsedRef, this.config);
  }

  public async loadIcon(iconRef: string): Promise<TngIconSvg | undefined> {
    const parsedRef = parseTngIconRef(iconRef, this.config.defaultPack);
    const cacheKey = this.getCacheKey(parsedRef);
    const cachedIcon = this.loadCache.get(cacheKey);

    if (cachedIcon !== undefined) {
      return cachedIcon;
    }

    const loader = resolveLoaderByParsedRef(parsedRef, this.config);
    if (loader === undefined) {
      return undefined;
    }

    const iconPromise = loader();
    this.loadCache.set(cacheKey, iconPromise);

    return iconPromise;
  }

  private getCacheKey(parsedRef: TngParsedIconRef): string {
    return `${parsedRef.pack}:${parsedRef.name}`;
  }
}
