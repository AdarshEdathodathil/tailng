import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { DocsComponentSectionTabsComponent } from '../../../shared/component-section-tabs/docs-component-section-tabs.component';
import { DocsComponentSectionOutlineComponent } from '../../../shared/section-outline/docs-component-section-outline.component';
import type { DocsSectionRailItem } from '../../../shared/section-rail/docs-section-rail.component';

type IconsDocSectionId = 'api' | 'examples' | 'overview' | 'styling';

const iconsDocSectionIds: readonly IconsDocSectionId[] = [
  'overview',
  'api',
  'styling',
  'examples',
] as const;

const defaultIconsDocSection: IconsDocSectionId = 'overview';

const iconsSectionTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'api', label: 'API' },
  { value: 'styling', label: 'Styling' },
  { value: 'examples', label: 'Examples' },
] as const;

const iconsOutlineItemsBySection: Readonly<
  Record<IconsDocSectionId, readonly DocsSectionRailItem[]>
> = {
  overview: [
    { id: 'installation', label: 'Installation' },
    { id: 'default-setup', label: 'Default setup' },
    { id: 'basic-usage', label: 'Basic usage' },
    { id: 'icon-reference-syntax', label: 'Icon reference syntax' },
  ],
  api: [
    { id: 'provide-tng-icons', label: 'provideTngIcons' },
    { id: 'create-tng-icon-pack', label: 'createTngIconPack' },
    { id: 'tng-icon-inputs', label: 'TngIcon inputs' },
  ],
  styling: [
    { id: 'size-input', label: 'Size input' },
    { id: 'css-variable-sizing', label: 'CSS variable sizing' },
    { id: 'color-inheritance', label: 'Color inheritance' },
    { id: 'accessibility-styling', label: 'Accessibility styling' },
  ],
  examples: [
    { id: 'accessibility-examples', label: 'Accessibility' },
    { id: 'size-examples', label: 'Size input' },
    { id: 'css-variable-example', label: 'CSS variable sizing' },
    { id: 'pack-reference-examples', label: 'Pack references' },
    { id: 'custom-pack-example', label: 'Custom pack API' },
  ],
} as const;

function isIconsDocSectionId(value: string): value is IconsDocSectionId {
  return iconsDocSectionIds.includes(value as IconsDocSectionId);
}

@Component({
  selector: 'app-icons-page',
  imports: [RouterOutlet, DocsComponentSectionTabsComponent, DocsComponentSectionOutlineComponent],
  templateUrl: './icons-page.component.html',
})
export class IconsPageComponent {
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  public readonly tabs = iconsSectionTabs;
  public readonly activeSection = computed<IconsDocSectionId>(() => {
    const section = this.resolveSectionFromUrl(this.currentUrl());
    return section ?? defaultIconsDocSection;
  });
  public readonly outlineItems = computed<readonly DocsSectionRailItem[]>(() => {
    return iconsOutlineItemsBySection[this.activeSection()];
  });
  public readonly outlineTitle = computed<string>(() => {
    switch (this.activeSection()) {
      case 'api':
        return 'API content';
      case 'styling':
        return 'Styling content';
      case 'examples':
        return 'Examples content';
      case 'overview':
      default:
        return 'Overview content';
    }
  });
  public readonly outlineAriaLabel = computed<string>(() => {
    return `Icons ${this.activeSection()} section navigation`;
  });

  private resolveSectionFromUrl(rawUrl: string): IconsDocSectionId | null {
    const path = this.normalizeUrl(rawUrl);
    const segments = path.split('/').filter((segment) => segment.length > 0);
    const section = segments[segments.length - 1];

    if (section === undefined || !isIconsDocSectionId(section)) {
      return null;
    }

    return section;
  }

  private normalizeUrl(rawUrl: string): string {
    const queryIndex = rawUrl.indexOf('?');
    const hashIndex = rawUrl.indexOf('#');
    let endIndex = rawUrl.length;

    if (queryIndex >= 0) {
      endIndex = Math.min(endIndex, queryIndex);
    }

    if (hashIndex >= 0) {
      endIndex = Math.min(endIndex, hashIndex);
    }

    const normalized = rawUrl.slice(0, endIndex);
    if (normalized.length > 1 && normalized.endsWith('/')) {
      return normalized.slice(0, -1);
    }

    return normalized;
  }
}
