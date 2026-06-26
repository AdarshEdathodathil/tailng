import { DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, effect, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  TngAccordionComponent,
  TngAccordionItemComponent,
  TngAccordionPanelComponent,
  TngAccordionTriggerComponent,
  TngBreadcrumbComponent,
  TngBreadcrumbItemComponent,
  TngDrawerComponent,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { TngDrawerContainer, TngDrawerContent } from '@tailng-ui/primitives';
import { filter, map, startWith, tap } from 'rxjs/operators';
import { DocsRouteLoadingOutletComponent } from '../../../shared/route-loading/docs-route-loading-outlet.component';
import {
  buildChartsDocHref,
  CHARTS_DOCS_GROUPS,
  type ChartsDocsCategoryId,
  type ChartsDocsGroup,
  type ChartsDocsItem,
} from '../chart-docs.data';

@Component({
  selector: 'app-charts-page',
  imports: [
    RouterOutlet,
    RouterLink,
    TngAccordionComponent,
    TngAccordionItemComponent,
    TngAccordionTriggerComponent,
    TngAccordionPanelComponent,
    TngBreadcrumbComponent,
    TngBreadcrumbItemComponent,
    TngDrawerContainer,
    TngDrawerContent,
    TngDrawerComponent,
    TngIcon,
    DocsRouteLoadingOutletComponent,
  ],
  templateUrl: './charts-page.component.html',
  styleUrl: './charts-page.component.css',
})
export class ChartsPageComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly mobileQuery =
    this.document.defaultView?.matchMedia('(max-width: 768px)') ?? null;
  private activeNavScrollFrame: number | null = null;

  public readonly isMobile = signal(this.mobileQuery?.matches ?? false);

  public constructor() {
    const mobileQuery = this.mobileQuery;
    if (mobileQuery) {
      const handler = (e: MediaQueryListEvent): void => this.isMobile.set(e.matches);
      mobileQuery.addEventListener('change', handler);
      this.destroyRef.onDestroy((): void => mobileQuery.removeEventListener('change', handler));
    }

    effect(() => {
      this.currentUrl();

      if (!this.drawerOpened()) {
        this.cancelActiveNavScroll();
        return;
      }

      this.scheduleActiveNavScroll();
    });

    this.destroyRef.onDestroy((): void => this.cancelActiveNavScroll());
  }

  public readonly mobileNavOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap(() => {
        if (this.isMobile()) {
          this.mobileNavOpen.set(false);
        }
      }),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  public readonly drawerOpened = computed(() => !this.isMobile() || this.mobileNavOpen());

  public readonly navGroups = CHARTS_DOCS_GROUPS;
  public readonly defaultExpandedGroups = CHARTS_DOCS_GROUPS.map((group) => group.id);

  public readonly filteredNavGroups = computed<readonly ChartsDocsGroup[]>(() => this.navGroups);

  public readonly currentPageLabel = computed(
    () => this.docsBreadcrumbs().find((crumb) => crumb.current)?.label ?? '',
  );

  public readonly docsBreadcrumbs = computed<
    readonly { current: boolean; label: string; url: string | null }[]
  >(() => {
    const url = this.normalizeUrl(this.currentUrl());
    const segments = url.split('/').filter((segment) => segment.length > 0);

    const crumbs: { current: boolean; label: string; url: string | null }[] = [
      { current: false, label: 'Home', url: '/' },
      { current: false, label: 'Charts', url: '/charts' },
    ];

    if (segments.length < 2 || segments[0] !== 'charts') {
      crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], current: true, url: null };
      return crumbs;
    }

    const groupId = segments[1] as ChartsDocsCategoryId | undefined;
    const group = CHARTS_DOCS_GROUPS.find((candidate) => candidate.id === groupId);
    if (!group) {
      crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], current: true, url: null };
      return crumbs;
    }

    crumbs.push({
      current: false,
      label: group.title,
      url: `/charts/${group.id}`,
    });

    const itemSlug = segments[2];
    const item = group.items.find((candidate) => candidate.slug === itemSlug);
    if (!item) {
      crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], current: true, url: null };
      return crumbs;
    }

    crumbs.push({
      current: true,
      label: item.title,
      url: null,
    });

    return crumbs;
  });

  public onDrawerOpenedChange(opened: boolean): void {
    if (!opened) {
      this.mobileNavOpen.set(false);
    }
  }

  public toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  public itemHref(groupId: ChartsDocsCategoryId, itemSlug: string): string {
    return buildChartsDocHref(groupId, itemSlug);
  }

  public isNavItemActive(group: ChartsDocsGroup, item: ChartsDocsItem): boolean {
    const current = this.normalizeUrl(this.currentUrl());
    return this.isMatchingItemPath(current, this.itemHref(group.id, item.slug));
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

  private isMatchingItemPath(currentUrl: string, itemUrl: string): boolean {
    if (currentUrl === itemUrl) {
      return true;
    }

    return currentUrl.startsWith(`${itemUrl}/`);
  }

  private scheduleActiveNavScroll(): void {
    const ownerWindow = this.document.defaultView;
    if (ownerWindow === null) {
      return;
    }

    this.cancelActiveNavScroll();
    this.activeNavScrollFrame = ownerWindow.requestAnimationFrame(() => {
      this.activeNavScrollFrame = ownerWindow.requestAnimationFrame(() => {
        this.activeNavScrollFrame = null;
        this.scrollActiveNavItemIntoView();
      });
    });
  }

  private cancelActiveNavScroll(): void {
    const ownerWindow = this.document.defaultView;
    if (ownerWindow === null || this.activeNavScrollFrame === null) {
      this.activeNavScrollFrame = null;
      return;
    }

    ownerWindow.cancelAnimationFrame(this.activeNavScrollFrame);
    this.activeNavScrollFrame = null;
  }

  private scrollActiveNavItemIntoView(): void {
    const selectedLink = this.hostElement.querySelector<HTMLElement>(
      '.components-docs-nav-link--selected',
    );
    const navScroller = selectedLink?.closest<HTMLElement>('tng-accordion') ?? null;
    if (selectedLink === null || navScroller === null) {
      return;
    }

    const selectedRect = selectedLink.getBoundingClientRect();
    const scrollerRect = navScroller.getBoundingClientRect();
    const selectedCenter = selectedRect.top - scrollerRect.top + selectedRect.height / 2;
    const scrollerCenter = navScroller.clientHeight / 2;
    navScroller.scrollBy({ top: selectedCenter - scrollerCenter, behavior: 'auto' });
  }
}
