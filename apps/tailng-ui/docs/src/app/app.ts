import { DOCUMENT } from '@angular/common';
import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {
  TngBreadcrumbComponent,
  TngBreadcrumbItemComponent,
  TngButtonComponent,
  TngCommandPaletteComponent,
  TngMenuComponent,
  TngMenuTriggerFor,
  type TngCommandPaletteOptionSelect,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { TngMenuItem, type TngMenuSelectEvent } from '@tailng-ui/primitives';
import { applyTailngTheme, type ThemeDefinition } from '@tailng-ui/theme';
import { filter } from 'rxjs/operators';
import { DocsRouteLoadingOutletComponent } from './shared/route-loading/docs-route-loading-outlet.component';
import {
  DocsSearchIndexService,
  type DocsSearchEntry,
  type DocsSearchIndex,
} from './shared/search/docs-search-index.service';
import {
  isDocsThemePresetId,
  readDocsThemeMode,
  readDocsThemePreset,
  resolveDocsTheme,
  writeDocsThemePreference,
  type DocsThemeModeId,
  type DocsThemePresetId,
} from './shared/theme/docs-theme-preference';

type ThemePresetOption = Readonly<{
  id: DocsThemePresetId;
  icon: string;
  label: string;
  description: string;
}>;

type NavItem = Readonly<{
  label: string;
  route: string;
}>;

type LinkItem = Readonly<{
  label: string;
  href: string;
}>;

type BreadcrumbItem = Readonly<{
  current: boolean;
  label: string;
  url: string | null;
}>;

const presetOptions: readonly ThemePresetOption[] = [
  {
    id: 'default',
    icon: 'palette',
    label: 'Default',
    description: 'Balanced spacing and expressive accents.',
  },
  {
    id: 'minimal',
    icon: 'swatch-book',
    label: 'Minimal',
    description: 'Low-contrast, compact, content-first.',
  },
  {
    id: 'slate',
    icon: 'square',
    label: 'Slate',
    description:
      'Clean and understated, ideal for a polished interface with timeless neutral character.',
  },
  {
    id: 'nexus',
    icon: 'palette',
    label: 'Nexus',
    description:
      'Modern and dynamic, perfect for a connected design language across product experiences.',
  },
  {
    id: 'prism',
    icon: 'swatch-book',
    label: 'Prism',
    description:
      'Crisp and expressive, suited for a theme that balances clarity with visual sophistication.',
  },
  {
    id: 'atlas',
    icon: 'square',
    label: 'Atlas',
    description: 'Solid and confident, fitting for a reliable theme with strong product presence.',
  },
  {
    id: 'sterling',
    icon: 'palette',
    label: 'Sterling',
    description:
      'Sophisticated and premium, great for a theme that emphasizes excellence and trust.',
  },
  {
    id: 'daybook-classic',
    icon: 'book-open',
    label: 'Daybook Classic',
    description: 'Classic ledger tones for dense finance and back-office interfaces.',
  },
];

const primaryNavigation: readonly NavItem[] = [
  { label: 'Components', route: '/components' },
  { label: 'Charts', route: '/charts' },
  { label: 'Ownable', route: '/ownable' },
  { label: 'Headless', route: '/headless' },
  { label: 'CDK', route: '/cdk' },
  { label: 'Theme', route: '/theme' },
  { label: 'Icons', route: '/icons' },
];

const npmPackageLinks: readonly LinkItem[] = [
  { label: '@tailng-ui/cdk', href: 'https://www.npmjs.com/package/@tailng-ui/cdk' },
  { label: '@tailng-ui/charts', href: 'https://www.npmjs.com/package/@tailng-ui/charts' },
  { label: '@tailng-ui/primitives', href: 'https://www.npmjs.com/package/@tailng-ui/primitives' },
  { label: '@tailng-ui/components', href: 'https://www.npmjs.com/package/@tailng-ui/components' },
  { label: '@tailng-ui/registry', href: 'https://www.npmjs.com/package/@tailng-ui/registry' },
  { label: '@tailng-ui/theme', href: 'https://www.npmjs.com/package/@tailng-ui/theme' },
  { label: '@tailng-ui/icons', href: 'https://www.npmjs.com/package/@tailng-ui/icons' },
  { label: 'tailng', href: 'https://www.npmjs.com/package/tailng' },
];

const githubRepositoryUrl = 'https://github.com/tailng/tailng-ui';

const footerResourceLinks: readonly LinkItem[] = [
  { label: 'GitHub Repository', href: githubRepositoryUrl },
  { label: 'Issue Tracker', href: 'https://github.com/tailng/tailng-ui/issues' },
  { label: 'Project README', href: 'https://github.com/tailng/tailng-ui/blob/main/README.md' },
  { label: 'MIT License', href: 'https://opensource.org/license/mit' },
];

@Component({
  imports: [
    RouterOutlet,
    TngBreadcrumbComponent,
    TngBreadcrumbItemComponent,
    TngButtonComponent,
    TngCommandPaletteComponent,
    TngMenuComponent,
    TngMenuTriggerFor,
    TngMenuItem,
    TngIcon,
    DocsRouteLoadingOutletComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly documentRef = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly searchIndexService = inject(DocsSearchIndexService);
  private readonly searchIndex = signal<DocsSearchIndex | undefined>(undefined);
  private searchIndexLoadStarted = false;

  public readonly darkMode = signal(readDocsThemeMode() === 'dark');
  public readonly presetOptions = presetOptions;
  public readonly selectedPreset = signal<DocsThemePresetId>(readDocsThemePreset());
  public readonly primaryNavigation = primaryNavigation;
  public readonly npmPackageLinks = npmPackageLinks;
  public readonly footerResourceLinks = footerResourceLinks;
  public readonly currentYear = new Date().getFullYear();
  public readonly currentUrl = signal<string>(this.router.url);
  public readonly breadcrumbs = signal<readonly BreadcrumbItem[]>(
    this.buildBreadcrumbs(this.router.url),
  );
  public readonly componentsDocsLayout = computed<boolean>(
    () =>
      this.currentUrl().startsWith('/components') ||
      this.currentUrl().startsWith('/charts') ||
      this.currentUrl().startsWith('/ownable') ||
      this.currentUrl().startsWith('/headless') ||
      this.currentUrl().startsWith('/theme'),
  );

  public readonly effectiveMode = computed<DocsThemeModeId>(() =>
    this.darkMode() ? 'dark' : 'light',
  );
  public readonly searchOpen = signal(false);
  public readonly searchInitialValue = signal('');
  public readonly searchQuery = signal('');
  public readonly searchOptions = signal<readonly DocsSearchEntry[]>([]);
  public readonly searchShortcutHint = computed<string>(() =>
    this.isMacPlatform() ? '⌘K' : 'Ctrl K',
  );
  public readonly mobileMenuOpen = signal(false);
  public readonly getSearchOptionValue = (item: DocsSearchEntry): string => item.url;
  public readonly getSearchOptionLabel = (item: DocsSearchEntry): string => item.title;
  public readonly getSearchOptionDescription = (item: DocsSearchEntry): string =>
    item.description ?? item.section ?? '';

  private readonly activeTheme = computed<ThemeDefinition>(() => {
    return resolveDocsTheme(this.selectedPreset(), this.effectiveMode());
  });

  public constructor() {
    effect((): void => {
      applyTailngTheme(this.activeTheme());
    });
    effect((): void => {
      writeDocsThemePreference({
        mode: this.effectiveMode(),
        preset: this.selectedPreset(),
      });
    });
    effect((): void => this.updateSearchOptions());
    effect((): void => {
      if (!this.searchOpen()) {
        return;
      }

      this.searchQuery.set(this.searchInitialValue());
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.breadcrumbs.set(this.buildBreadcrumbs(event.urlAfterRedirects));
        this.documentRef.documentElement.dataset['docsRouteReady'] =
          this.documentRef.defaultView?.location.pathname ??
          event.urlAfterRedirects.split(/[?#]/, 1)[0] ??
          '/';
      });
  }

  public onPresetSelect(preset: DocsThemePresetId): void {
    this.selectedPreset.set(preset);
  }

  public onThemePresetMenuSelect(event: TngMenuSelectEvent): void {
    if (isDocsThemePresetId(event.value)) {
      this.onPresetSelect(event.value);
    }
  }

  public toggleMode(): void {
    this.darkMode.update((current) => !current);
  }

  public toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  public closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  public onPrimaryNavigationSelect(route: string): void {
    this.closeMobileMenu();
    void this.router.navigateByUrl(route);
  }

  @HostListener('document:keydown', ['$event'])
  public onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.mobileMenuOpen()) {
      this.closeMobileMenu();
      return;
    }

    const shortcutPressed = this.isMacPlatform() ? event.metaKey : event.ctrlKey;
    if (event.key.toLowerCase() !== 'k' || !shortcutPressed) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.openSearch();
  }

  public openGithubRepository(): void {
    this.documentRef.defaultView?.open(githubRepositoryUrl, '_blank', 'noopener,noreferrer');
  }

  public onNpmMenuSelect(event: TngMenuSelectEvent): void {
    if (event.trigger !== 'keyboard') {
      return;
    }

    if (typeof event.value !== 'string') {
      return;
    }

    const selectedPackage = this.npmPackageLinks.find((pkg) => pkg.label === event.value);
    if (selectedPackage === undefined) {
      return;
    }

    this.documentRef.defaultView?.open(selectedPackage.href, '_blank', 'noopener,noreferrer');
  }

  public isPresetSelected(preset: DocsThemePresetId): boolean {
    return this.selectedPreset() === preset;
  }

  public openSearch(initialValue = ''): void {
    this.loadSearchIndex();
    this.searchInitialValue.set(initialValue);
    this.searchOpen.set(true);
  }

  public onSearchButtonKeydown(event: KeyboardEvent): void {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    event.preventDefault();
    this.openSearch(event.key.trim());
  }

  public onSearchOpenChange(open: boolean): void {
    this.searchOpen.set(open);
    if (!open) {
      this.searchInitialValue.set('');
      this.searchQuery.set('');
    }
  }

  public onSearchOptionSelect(
    event: TngCommandPaletteOptionSelect<DocsSearchEntry, unknown>,
  ): void {
    this.searchOpen.set(false);
    this.searchInitialValue.set('');
    this.searchQuery.set('');
    void this.router.navigateByUrl(event.option.url);
  }

  private loadSearchIndex(): void {
    if (this.searchIndexLoadStarted) {
      return;
    }

    this.searchIndexLoadStarted = true;
    void this.searchIndexService
      .load()
      .then((index) => this.searchIndex.set(index))
      .catch(() => {
        this.searchIndexLoadStarted = false;
      });
  }

  private updateSearchOptions(): void {
    const index = this.searchIndex();
    const query = this.searchQuery().trim();

    if (index === undefined) {
      this.searchOptions.set([]);
      return;
    }

    if (query.length === 0) {
      this.searchOptions.set(index.entries.slice(0, 8));
      return;
    }

    this.searchOptions.set(
      index.fuse
        .search(query)
        .slice(0, 10)
        .map((result) => result.item),
    );
  }

  private isMacPlatform(): boolean {
    const navigatorRef = this.documentRef.defaultView?.navigator;
    return navigatorRef?.platform.toLowerCase().includes('mac') ?? false;
  }

  private buildBreadcrumbs(rawUrl: string): readonly BreadcrumbItem[] {
    const urlTree = this.router.parseUrl(rawUrl);
    const primarySegments = urlTree.root.children['primary']?.segments ?? [];
    if (primarySegments.length === 0) {
      return [{ current: true, label: 'Home', url: null }];
    }

    const crumbs: BreadcrumbItem[] = [{ current: false, label: 'Home', url: '/' }];
    let currentPath = '';
    for (const segment of primarySegments) {
      if (segment.path.length === 0) {
        continue;
      }

      currentPath = `${currentPath}/${segment.path}`;
      crumbs.push({
        current: false,
        label: this.formatSegmentLabel(segment.path),
        url: currentPath,
      });
    }

    if (crumbs.length > 0) {
      const lastCrumb = crumbs[crumbs.length - 1];
      crumbs[crumbs.length - 1] = {
        ...lastCrumb,
        current: true,
        url: null,
      };
    }

    return crumbs;
  }

  private formatSegmentLabel(rawSegment: string): string {
    const decodedSegment = decodeURIComponent(rawSegment);
    const normalized = decodedSegment.replace(/[-_]+/g, ' ').trim();
    if (normalized.length === 0) {
      return decodedSegment;
    }

    return normalized
      .split(/\s+/g)
      .filter((word) => word.length > 0)
      .map((word) => this.toTitleWord(word))
      .join(' ');
  }

  private toTitleWord(word: string): string {
    const uppercaseTokenWords = new Set([
      'api',
      'cdk',
      'css',
      'html',
      'http',
      'id',
      'json',
      'ui',
      'url',
    ]);
    const lowerWord = word.toLowerCase();
    if (uppercaseTokenWords.has(lowerWord)) {
      return lowerWord.toUpperCase();
    }

    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  }
}
