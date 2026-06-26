import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TngTabsComponent } from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { TngTab, TngTabList, TngTabsScrollButtonNext, TngTabsScrollButtonPrev } from '@tailng-ui/primitives';

export type DocsComponentSectionTab = {
  value: string;
  label: string;
};

const defaultTabs: readonly DocsComponentSectionTab[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'api', label: 'API' },
  { value: 'styling', label: 'Styling' },
  { value: 'examples', label: 'Examples' },
] as const;

@Component({
  selector: 'app-docs-component-section-tabs',
  imports: [TngTabsComponent, TngTabList, TngTab, TngTabsScrollButtonPrev, TngTabsScrollButtonNext, TngIcon, RouterLink],
  templateUrl: './docs-component-section-tabs.component.html',
  styleUrl: './docs-component-section-tabs.component.css',
})
export class DocsComponentSectionTabsComponent {
  private readonly router = inject(Router);
  public readonly sectionName = input<string>('Component');
  public readonly value = input.required<string>();
  public readonly tabs = input<readonly DocsComponentSectionTab[]>(defaultTabs);
  protected readonly tabHrefs = computed<Record<string, string>>(() => {
    const basePath = this.resolveBasePath(this.router.url);
    const hrefs: Record<string, string> = {};
    for (const tab of this.tabs()) {
      hrefs[tab.value] = `${basePath}/${tab.value}`;
    }
    return hrefs;
  });

  private resolveBasePath(rawUrl: string): string {
    const cleanPath = this.normalizeUrl(rawUrl);
    const segments = cleanPath.split('/').filter((segment) => segment.length > 0);
    if (segments.length === 0) {
      return '';
    }

    const activeSection = this.value();
    if (segments[segments.length - 1] === activeSection) {
      segments.pop();
    }

    return `/${segments.join('/')}`;
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
