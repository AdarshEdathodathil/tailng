import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  TngCardComponent,
  TngCardContentComponent,
  TngCardDescriptionComponent,
  TngCardHeaderComponent,
  TngCardTitleComponent,
  TngCodeBlockComponent,
  TngTabsComponent,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { TngTab, TngTabList, TngTabPanel } from '@tailng-ui/primitives';
import { observeDocsCodeThemeChanges, resolveDocsCodeBlockTheme } from '../../../../../shared/util';

@Component({
  selector: 'app-icons-api-page',
  imports: [
    TngCardComponent,
    TngCardHeaderComponent,
    TngCardTitleComponent,
    TngCardDescriptionComponent,
    TngCardContentComponent,
    TngCodeBlockComponent,
    TngTabsComponent,
    TngTabList,
    TngTab,
    TngTabPanel,
    TngIcon,
  ],
  templateUrl: './icons-api-page.component.html',
})
export class IconsApiPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );

  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly bootstrapInstallPnpmCode = 'pnpm add @ng-icons/bootstrap-icons';
  protected readonly bootstrapInstallNpmCode = 'npm install @ng-icons/bootstrap-icons';
  protected readonly bootstrapInstallYarnCode = 'yarn add @ng-icons/bootstrap-icons';

  protected readonly bootstrapProviderCode = `// icons.provider.ts
import { createTngIconPack, provideTngIcons, type TngIconLoader } from '@tailng-ui/icons';

function createBootstrapLoader(exportName: string): TngIconLoader {
  return async () => {
    const mod = await import('@ng-icons/bootstrap-icons') as Record<string, unknown>;
    const svg = mod[exportName];
    if (typeof svg !== 'string') {
      throw new Error(\`Bootstrap icon "\${exportName}" not found.\`);
    }
    return svg;
  };
}

const bootstrapPack = createTngIconPack('bootstrap', {
  'star-fill': createBootstrapLoader('bootstrapStarFill'),
  'bell':      createBootstrapLoader('bootstrapBell'),
  'x-circle':  createBootstrapLoader('bootstrapXCircle'),
});

export const tngIconProviders = provideTngIcons({
  packs: [bootstrapPack],
});`;

  protected readonly multiplePacksCode = `export const tngIconProviders = provideTngIcons({
  defaultPack: 'lucide',          // default pack when no prefix is given
  packs: [bootstrapPack, brandPack],
});`;

  protected readonly bootstrapUsageCode = `<!-- explicit pack prefix -->
<tng-icon icon="bootstrap:star-fill" size="1.25rem" />
<tng-icon icon="bootstrap:bell" size="1.25rem" />

<!-- when bootstrap is set as defaultPack, prefix is optional -->
<tng-icon icon="star-fill" size="1.25rem" />`;

  protected readonly staticSvgPackCode = `import { createTngIconPack, provideTngIcons, type TngIconLoader } from '@tailng-ui/icons';

function staticSvg(svg: string): TngIconLoader {
  return () => Promise.resolve(svg);
}

const brandPack = createTngIconPack('brand', {
  logo: staticSvg(
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2Z"/></svg>',
  ),
});

export const tngIconProviders = provideTngIcons({ packs: [brandPack] });`;

  protected readonly urlFetchPackCode = `import { createTngIconPack, provideTngIcons, type TngIconLoader } from '@tailng-ui/icons';

const CDN = 'https://cdn.example.com/icons';

function remoteSvg(path: string): TngIconLoader {
  return async () => {
    const res = await fetch(\`\${CDN}/\${path}.svg\`);
    if (!res.ok) throw new Error(\`Failed to load icon: \${path}\`);
    return res.text();
  };
}

const remoteIconPack = createTngIconPack('remote', {
  avatar: remoteSvg('avatar'),
  dashboard: remoteSvg('dashboard'),
});

export const tngIconProviders = provideTngIcons({ packs: [remoteIconPack] });`;

  protected readonly overrideBuiltinCode = `provideTngIcons({
  allowBuiltinOverride: true,
  packs: [
    createTngIconPack('lucide', {
      home: () => Promise.resolve('<svg viewBox="0 0 24 24"><!-- custom --></svg>'),
    }),
  ],
})`;

  protected readonly apiProvideTngIconsCode = `interface TngProvideIconsOptions {
  /** Additional icon packs to register alongside the built-in Lucide pack. */
  packs?: TngIconPack[];

  /**
   * Pack used when no prefix is given in an icon ref.
   * Defaults to 'lucide'.
   */
  defaultPack?: string;

  /**
   * Allow a custom pack to shadow a built-in pack name (e.g. 'lucide').
   * Defaults to false.
   */
  allowBuiltinOverride?: boolean;
}`;

  protected readonly apiCreateTngIconPackCode = `function createTngIconPack(
  name: string,
  icons: Record<string, TngIconLoader>,
): TngIconPack;

// TngIconLoader: a function that returns the SVG markup as a string
type TngIconLoader = () => Promise<string>;`;

  protected readonly apiTngIconInputsCode = `// <tng-icon> component inputs
icon: string;          // required - icon name or "pack:name" ref
label?: string | null; // accessible label; omit for decorative icons
size?: string | number | null; // CSS size; numeric values become px`;

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
