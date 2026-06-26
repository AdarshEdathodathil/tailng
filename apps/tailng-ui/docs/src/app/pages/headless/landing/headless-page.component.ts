import { DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, effect, ElementRef, inject } from '@angular/core';
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
import {
  TngDrawerContainer,
  TngDrawerContent,
} from '@tailng-ui/primitives';
import { filter, map, startWith } from 'rxjs/operators';
import { DocsRouteLoadingOutletComponent } from '../../../shared/route-loading/docs-route-loading-outlet.component';
import {
  buildHeadlessDocHref,
  HEADLESS_DOCS_GROUPS,
  type HeadlessDocsCategoryId,
  type HeadlessDocsGroup,
} from '../headless-docs.data';

@Component({
  selector: 'app-headless-page',
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
  templateUrl: './headless-page.component.html',
  styleUrls: ['../../components/landing/components-page.component.css'],
})
export class HeadlessPageComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private activeNavScrollFrame: number | null = null;

  public constructor() {
    effect(() => {
      this.currentUrl();
      this.scheduleActiveNavScroll();
    });

    this.destroyRef.onDestroy((): void => this.cancelActiveNavScroll());
  }

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  public readonly navGroups = HEADLESS_DOCS_GROUPS;
  public readonly defaultExpandedGroups = HEADLESS_DOCS_GROUPS.map((group) => group.id);
  public readonly filteredNavGroups = computed<readonly HeadlessDocsGroup[]>(() => this.navGroups);

  public readonly docsBreadcrumbs = computed<
    readonly { current: boolean; label: string; url: string | null }[]
  >(() => {
    const url = this.normalizeUrl(this.currentUrl());
    const segments = url.split('/').filter((segment) => segment.length > 0);

    const crumbs: { current: boolean; label: string; url: string | null }[] = [
      { current: false, label: 'Home', url: '/' },
      { current: false, label: 'Headless', url: '/headless' },
    ];

    if (segments.length < 2 || segments[0] !== 'headless') {
      crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], current: true, url: null };
      return crumbs;
    }

    const groupId = segments[1] as HeadlessDocsCategoryId | undefined;
    const group = HEADLESS_DOCS_GROUPS.find((candidate) => candidate.id === groupId);
    if (!group) {
      crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], current: true, url: null };
      return crumbs;
    }

    crumbs.push({
      current: false,
      label: group.title,
      url: `/headless/${group.id}`,
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

  public itemHref(groupId: HeadlessDocsCategoryId, itemSlug: string): string {
    return buildHeadlessDocHref(groupId, itemSlug);
  }

  public isItemActive(groupId: HeadlessDocsCategoryId, itemSlug: string): boolean {
    return this.isMatchingItemPath(
      this.normalizeUrl(this.currentUrl()),
      this.itemHref(groupId, itemSlug),
    );
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
