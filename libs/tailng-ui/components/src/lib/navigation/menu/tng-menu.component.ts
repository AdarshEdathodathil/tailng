import {
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  NgZone,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import {
  computeOverlayPosition,
  createPortalManager,
  createTngIdFactory,
  getGlobalElementScrollLockManager,
  getGlobalScrollLockManager,
  isTngAnchorVisibleInScrollAncestors,
  resolveTngScrollableAncestors,
  type TngOverlayScrollStrategy,
  type TngPortalDocument,
} from '@tailng-ui/cdk';
import {
  TNG_MENU_DEFER_HOST_FOCUS_UNTIL_POSITIONED,
  TngMenu as TngMenuPrimitive,
} from '@tailng-ui/primitives';

const MAX_FOCUS_SYNC_ATTEMPTS = 4;
const MENU_Z_INDEX =
  'var(--tng-menu-z-overlay, var(--tng-menu-overlay-z-index, var(--tng-z-overlay, 50)))';
const PORTALLED_MENU_THEME_VARS = [
  '--tng-menu-radius',
  '--tng-menu-padding',
  '--tng-menu-item-py',
  '--tng-menu-item-px',
  '--tng-menu-item-radius',
  '--tng-menu-item-font-size',
  '--tng-menu-item-font-weight',
  '--tng-menu-item-font-weight-active',
  '--tng-menu-item-gap',
  '--tng-menu-item-min-height',
  '--tng-menu-item-disabled-opacity',
  '--tng-menu-item-bg-hover',
  '--tng-menu-item-bg-active',
  '--tng-menu-item-bg-selected',
  '--tng-menu-item-fg',
  '--tng-menu-item-fg-active',
  '--tng-menu-item-fg-selected',
  '--tng-menu-item-shadow-hover',
  '--tng-menu-item-shadow-active',
  '--tng-menu-border',
  '--tng-menu-border-strong',
  '--tng-menu-bg',
  '--tng-menu-surface',
  '--tng-menu-surface-muted',
  '--tng-menu-fg',
  '--tng-menu-muted',
  '--tng-menu-brand',
  '--tng-menu-focus-ring',
  '--tng-menu-shadow-ink',
  '--tng-menu-shadow',
  '--tng-menu-shadow-focus',
  '--tng-menu-panel-shadow-focus',
  '--tng-menu-z-overlay',
  '--tng-menu-overlay-z-index',
  '--tng-z-overlay',
  '--tng-menu-z-backdrop',
  '--tng-menu-backdrop-z-index',
  '--tng-z-backdrop',
  '--tng-menu-ease',
  '--tng-radius-panel',
  '--tng-radius-item',
  '--tng-control-height-md',
  '--tng-text-body',
  '--tng-font-weight-medium',
  '--tng-font-weight-semibold',
  '--tng-disabled-opacity',
  '--tng-duration-normal',
  '--tng-easing',
  '--tng-semantic-border-subtle',
  '--tng-semantic-border-strong',
  '--tng-semantic-background-canvas',
  '--tng-semantic-background-surface',
  '--tng-semantic-background-muted',
  '--tng-semantic-foreground-primary',
  '--tng-semantic-foreground-secondary',
  '--tng-semantic-accent-brand',
  '--tng-semantic-focus-ring',
] as const;

const createMenuOverlayLockId = createTngIdFactory('tng-menu-overlay-lock');

type InlineStyleSnapshot = Readonly<{
  priority: string;
  value: string;
}>;

function rectFromClientRect(r: DOMRect | ClientRect): { left: number; top: number; width: number; height: number } {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function viewportRect(win: Window): { left: number; top: number; width: number; height: number } {
  return { left: 0, top: 0, width: win.innerWidth || 1024, height: win.innerHeight || 768 };
}

function getOwnerWindow(documentRef: Document): Window {
  if (documentRef.defaultView !== null) {
    return documentRef.defaultView;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  return globalThis as unknown as Window;
}

function isInside(target: EventTarget | null, element: HTMLElement): boolean {
  return target instanceof Node && element.contains(target);
}

@Component({
  selector: 'tng-menu',
  providers: [{ provide: TNG_MENU_DEFER_HOST_FOCUS_UNTIL_POSITIONED, useValue: true }],
  hostDirectives: [
    {
      directive: TngMenuPrimitive,
      inputs: ['loop', 'disabled', 'closeOnSelect', 'dismissOnOutsideClick', 'dismissOnFocusout'],
      outputs: ['tngMenuOpened', 'tngMenuClosed', 'tngMenuSelect'],
    },
  ],
  templateUrl: './tng-menu.component.html',
  styleUrl: './tng-menu.component.css',
  encapsulation: ViewEncapsulation.None,
  exportAs: 'tngMenuComponent',
})
export class TngMenuComponent {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly primitive = inject<TngMenuPrimitive>(TngMenuPrimitive);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly ownerDocument = this.hostRef.nativeElement.ownerDocument;
  private readonly ownerWindow = getOwnerWindow(this.ownerDocument);
  private readonly instanceId = createMenuOverlayLockId();
  private readonly portalManager = createPortalManager({
    documentRef: this.ownerDocument as unknown as TngPortalDocument,
    isBrowser: this.ownerDocument.defaultView !== null,
  });
  private readonly scrollLock = getGlobalScrollLockManager({ documentRef: this.ownerDocument });
  private readonly elementScrollLock = getGlobalElementScrollLockManager({ documentRef: this.ownerDocument });
  private lastOpenState = false;
  private focusSyncQueued = false;
  private focusSyncAttempts = 0;

  private placeholder: Comment | null = null;
  private originalParent: Node | null = null;
  private removeResizeListener: (() => void) | null = null;
  private removeScrollListener: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollAncestors: readonly HTMLElement[] = [];
  private rafId: number | null = null;
  private portalled = false;
  private closeIfAnchorHiddenOnNextPosition = false;
  private inlineThemeSnapshots = new Map<string, InlineStyleSnapshot>();
  private inlineColorSchemeSnapshot: InlineStyleSnapshot | null = null;
  /** Retries when overlay rect is 0×0 before first placement (layout not ready yet). */
  private initialPlacementRetryCount = 0;

  public readonly ariaLabel = input<string>('Menu');
  public readonly scrollStrategy = input<TngOverlayScrollStrategy>('reposition');

  @HostBinding('attr.aria-label')
  protected get hostAriaLabel(): string {
    return this.ariaLabel();
  }

  public constructor() {
    const host = this.hostRef.nativeElement;
    this.placeholder = this.ownerDocument.createComment('tng-menu-anchor');
    this.captureOriginalLocation();

    this.destroyRef.onDestroy(() => {
      this.detachPositioningListeners();
      this.restoreToPlaceholder();
      this.placeholder = null;
      this.originalParent = null;
    });
  }

  public ngDoCheck(): void {
    const isOpen = this.primitive.isOpen();

    if (!this.lastOpenState && isOpen) {
      this.initialPlacementRetryCount = 0;
      this.setPositioningPending(true);
      this.mountToBody();
      this.attachPositioningListeners();
      this.queuePositioning();
    } else if (this.lastOpenState && !isOpen) {
      this.detachPositioningListeners();
      this.clearPositioningStyles();
      this.restoreToPlaceholder();
    }

    if (!isOpen) {
      this.lastOpenState = false;
      this.initialPlacementRetryCount = 0;
      this.setPositioningPending(false);
      this.focusSyncAttempts = 0;
      this.focusSyncQueued = false;
      return;
    }

    const justOpened = !this.lastOpenState && isOpen;
    this.lastOpenState = true;

    // Opening edge: primitive defers host focus until overlay placement runs in reposition();
    // skip queueFocusSync here so focus does not run before the first fixed-position pass.
    if (justOpened) {
      return;
    }

    const activeElement = this.ownerDocument.activeElement;
    const deepestOpenSubmenu = this.getDeepestOpenSubmenu();
    const hasFocusInDeepestOpenSubmenu =
      deepestOpenSubmenu !== null &&
      activeElement instanceof Node &&
      deepestOpenSubmenu.contains(activeElement);
    const host = this.hostRef.nativeElement;
    const hasFocusInsideHost = activeElement instanceof Node && host.contains(activeElement);

    const shouldSyncFocusToHostOrDeepestSubmenu =
      deepestOpenSubmenu !== null ? !hasFocusInDeepestOpenSubmenu : !hasFocusInsideHost;

    if (shouldSyncFocusToHostOrDeepestSubmenu && this.focusSyncAttempts < MAX_FOCUS_SYNC_ATTEMPTS) {
      this.queueFocusSync();
    }
  }

  private queuePositioning(): void {
    if (this.rafId !== null) return;
    this.ngZone.runOutsideAngular(() => {
      this.rafId = this.ownerWindow.requestAnimationFrame(() => {
        this.rafId = null;
        this.reposition();
      });
    });
  }

  private reposition(): void {
    if (!this.primitive.isOpen()) return;

    const host = this.hostRef.nativeElement;
    const trigger = this.primitive.getTriggerElement();
    if (!trigger) {
      this.clearPositioningPending();
      return;
    }

    if (
      this.closeIfAnchorHiddenOnNextPosition &&
      this.scrollStrategy() === 'reposition' &&
      !isTngAnchorVisibleInScrollAncestors(trigger, this.scrollAncestors)
    ) {
      this.closeIfAnchorHiddenOnNextPosition = false;
      this.ngZone.run((): void => this.primitive.close(true));
      return;
    }
    this.closeIfAnchorHiddenOnNextPosition = false;

    const isSubmenu = this.primitive.getParentMenu() !== null;

    // Default config: root menus drop down, submenus fly out to the right (same pipeline for every layer).
    let side: 'bottom' | 'right' = 'bottom';
    let align: 'start' | 'center' | 'end' = 'start';

    if (isSubmenu) {
      side = 'right';
      align = 'start';
    }

    const anchor = rectFromClientRect(trigger.getBoundingClientRect());
    let overlay = rectFromClientRect(host.getBoundingClientRect());

    const pendingInitial =
      host.getAttribute('data-positioning-state') === 'pending';
    if (
      pendingInitial &&
      (overlay.width < 0.5 || overlay.height < 0.5) &&
      this.initialPlacementRetryCount < 5
    ) {
      this.initialPlacementRetryCount += 1;
      this.ngZone.runOutsideAngular(() => {
        this.ownerWindow.requestAnimationFrame(() => {
          if (!this.primitive.isOpen()) {
            return;
          }
          this.reposition();
        });
      });
      return;
    }

    if (pendingInitial) {
      this.initialPlacementRetryCount = 0;
    }

    overlay = rectFromClientRect(host.getBoundingClientRect());

    const viewport = viewportRect(this.ownerWindow);

    const result = computeOverlayPosition({
      anchorRect: anchor,
      overlayRect: overlay,
      viewportRect: viewport,
      placement: { side, align },
      offset: { side: isSubmenu ? -4 : 4, align: 0 },
      collision: { padding: 8, flip: true, shift: true },
    });

    host.style.position = 'fixed';
    host.style.zIndex = MENU_Z_INDEX;
    host.style.margin = '0';
    host.style.left = `${result.x}px`;
    host.style.top = `${result.y}px`;
    host.style.right = 'auto';
    host.style.bottom = 'auto';

    this.clearPositioningPending();
    this.scheduleFocusAfterReposition();
  }

  /**
   * Hide the panel until the first fixed placement is applied so theme CSS (absolute) does not
   * flash before JS overlay coordinates (all levels use the same reposition path).
   */
  private setPositioningPending(pending: boolean): void {
    const host = this.hostRef.nativeElement;
    if (pending) {
      host.setAttribute('data-positioning-state', 'pending');
    } else {
      host.removeAttribute('data-positioning-state');
    }
  }

  private clearPositioningPending(): void {
    this.hostRef.nativeElement.removeAttribute('data-positioning-state');
  }

  private clearPositioningStyles(): void {
    const host = this.hostRef.nativeElement;
    host.style.position = '';
    host.style.zIndex = '';
    host.style.margin = '';
    host.style.left = '';
    host.style.top = '';
    host.style.right = '';
    host.style.bottom = '';
    host.removeAttribute('data-positioning-state');
  }

  private mountToBody(): void {
    const host = this.hostRef.nativeElement;
    const body = this.ownerDocument.body;
    if (body === null || host.parentNode === body) {
      return;
    }

    this.captureOriginalLocation();
    this.syncPortalledThemeVars();
    this.portalled = this.portalManager.mount({
      node: host,
      portalId: this.instanceId,
    });
  }

  private captureOriginalLocation(): void {
    const host = this.hostRef.nativeElement;
    if (this.placeholder === null || this.placeholder.parentNode !== null) {
      return;
    }

    const parent = host.parentNode;
    if (parent === null) {
      return;
    }

    this.originalParent = parent;
    parent.insertBefore(this.placeholder, host);
  }

  private restoreToPlaceholder(): void {
    const host = this.hostRef.nativeElement;

    if (this.portalled) {
      this.portalManager.unmount(this.instanceId);
      this.portalled = false;
    }

    if (this.placeholder?.parentNode !== null && this.placeholder?.parentNode !== undefined) {
      this.placeholder.parentNode.insertBefore(host, this.placeholder);
    } else if (this.originalParent !== null) {
      this.originalParent.appendChild(host);
    }

    this.restorePortalledThemeVars();
  }

  private syncPortalledThemeVars(): void {
    const host = this.hostRef.nativeElement;
    const hostStyles = host.style;
    const computedStyles = this.ownerWindow.getComputedStyle(host);

    this.inlineThemeSnapshots.clear();
    for (const cssVar of PORTALLED_MENU_THEME_VARS) {
      this.inlineThemeSnapshots.set(cssVar, {
        value: hostStyles.getPropertyValue(cssVar),
        priority: hostStyles.getPropertyPriority(cssVar),
      });

      const value = computedStyles.getPropertyValue(cssVar).trim();
      if (value !== '') {
        hostStyles.setProperty(cssVar, value);
      } else {
        hostStyles.removeProperty(cssVar);
      }
    }

    this.inlineColorSchemeSnapshot = {
      value: hostStyles.getPropertyValue('color-scheme'),
      priority: hostStyles.getPropertyPriority('color-scheme'),
    };

    const colorScheme = computedStyles.colorScheme?.trim();
    if (colorScheme !== '' && colorScheme !== 'normal') {
      hostStyles.colorScheme = colorScheme;
    } else {
      hostStyles.removeProperty('color-scheme');
    }
  }

  private restorePortalledThemeVars(): void {
    const hostStyles = this.hostRef.nativeElement.style;

    for (const [cssVar, snapshot] of this.inlineThemeSnapshots) {
      if (snapshot.value !== '') {
        hostStyles.setProperty(cssVar, snapshot.value, snapshot.priority);
      } else {
        hostStyles.removeProperty(cssVar);
      }
    }

    if (this.inlineColorSchemeSnapshot !== null) {
      if (this.inlineColorSchemeSnapshot.value !== '') {
        hostStyles.setProperty(
          'color-scheme',
          this.inlineColorSchemeSnapshot.value,
          this.inlineColorSchemeSnapshot.priority,
        );
      } else {
        hostStyles.removeProperty('color-scheme');
      }
    }

    this.inlineThemeSnapshots.clear();
    this.inlineColorSchemeSnapshot = null;
  }

  private attachPositioningListeners(): void {
    if (this.removeResizeListener) return;

    const trigger = this.primitive.getTriggerElement();
    this.scrollAncestors = trigger !== null ? resolveTngScrollableAncestors(trigger) : [];

    if (this.scrollStrategy() === 'block') {
      this.scrollLock.acquire(this.instanceId);
      this.elementScrollLock.acquire(this.instanceId, this.scrollAncestors);
    }

    const schedule = (): void => this.queuePositioning();
    this.ngZone.runOutsideAngular(() => {
      this.ownerWindow.addEventListener('resize', schedule);
      this.removeResizeListener = (): void => this.ownerWindow.removeEventListener('resize', schedule);
      this.removeScrollListener = null;

      if (this.scrollStrategy() !== 'block') {
        const onScroll = (event: Event): void => {
          if (isInside(event.target, this.hostRef.nativeElement)) {
            return;
          }

          if (this.scrollStrategy() === 'close') {
            this.ngZone.run((): void => this.primitive.close(true));
            return;
          }

          this.closeIfAnchorHiddenOnNextPosition = true;
          schedule();
        };
        this.ownerWindow.addEventListener('scroll', onScroll, true);
        this.removeScrollListener = (): void => this.ownerWindow.removeEventListener('scroll', onScroll, true);
      }

      if ('ResizeObserver' in this.ownerWindow) {
        const resizeObserver = new ResizeObserver(() => schedule());
        if (trigger) resizeObserver.observe(trigger);
        resizeObserver.observe(this.hostRef.nativeElement);
        this.resizeObserver = resizeObserver;
      }
    });
  }

  /**
   * After fixed placement is applied, run the same focus sync previously scheduled from ngDoCheck
   * so assistive tech sees the panel in its final coordinates (position → then focus).
   */
  private scheduleFocusAfterReposition(): void {
    if (!this.primitive.isOpen()) {
      return;
    }
    this.ngZone.run(() => {
      queueMicrotask(() => this.runFocusSyncIfNeeded());
    });
  }

  private detachPositioningListeners(): void {
    this.removeResizeListener?.();
    this.removeScrollListener?.();
    this.removeResizeListener = null;
    this.removeScrollListener = null;
    this.scrollLock.release(this.instanceId);
    this.elementScrollLock.release(this.instanceId);
    this.scrollAncestors = [];
    this.closeIfAnchorHiddenOnNextPosition = false;

    if (this.rafId !== null) {
      this.ownerWindow.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private queueFocusSync(): void {
    if (this.focusSyncQueued) {
      return;
    }

    this.focusSyncQueued = true;
    queueMicrotask((): void => {
      this.focusSyncQueued = false;
      this.runFocusSyncIfNeeded();
    });
  }

  private runFocusSyncIfNeeded(): void {
    if (!this.primitive.isOpen()) {
      return;
    }

    const host = this.hostRef.nativeElement;
    const activeElement = this.ownerDocument.activeElement;
    const focusMenuHost =
      activeElement instanceof Element
        ? (activeElement.closest('[data-slot="menu"][data-state="open"]') as HTMLElement | null)
        : null;

    // Cascaded level-2+ panels are often siblings under one root menu, not nested in DOM. Do not
    // call host.focus() on a shallower panel while a deeper sibling panel should keep focus.
    if (this.shouldDeferFocusToDeeperCascadePanel(host, focusMenuHost)) {
      return;
    }

    const deepestOpenSubmenu = this.getDeepestOpenSubmenu();

    if (deepestOpenSubmenu !== null) {
      if (deepestOpenSubmenu.getAttribute('data-positioning-state') === 'pending') {
        return;
      }

      if (!(activeElement instanceof Node) || !deepestOpenSubmenu.contains(activeElement)) {
        this.focusSyncAttempts += 1;
        deepestOpenSubmenu.focus({ preventScroll: true });
      }
      return;
    }

    if (activeElement instanceof Node && host.contains(activeElement)) {
      return;
    }

    this.focusSyncAttempts += 1;
    host.focus({ preventScroll: true });
  }

  private shouldDeferFocusToDeeperCascadePanel(host: HTMLElement, focusMenuHost: HTMLElement | null): boolean {
    if (!(focusMenuHost instanceof HTMLElement) || focusMenuHost === host) {
      return false;
    }

    let openSubmenu = this.primitive.getOpenSubmenu();
    while (openSubmenu !== null) {
      const openSubmenuHost = openSubmenu.getHostElement();
      if (openSubmenuHost === focusMenuHost || openSubmenuHost.contains(focusMenuHost)) {
        return true;
      }
      openSubmenu = openSubmenu.getOpenSubmenu();
    }
    return false;
  }

  private getDeepestOpenSubmenu(): HTMLElement | null {
    let deepestOpenSubmenu: HTMLElement | null = null;
    let openSubmenu = this.primitive.getOpenSubmenu();
    while (openSubmenu !== null) {
      deepestOpenSubmenu = openSubmenu.getHostElement();
      openSubmenu = openSubmenu.getOpenSubmenu();
    }
    return deepestOpenSubmenu;
  }
}
export { TngMenuComponent as TngMenu };
