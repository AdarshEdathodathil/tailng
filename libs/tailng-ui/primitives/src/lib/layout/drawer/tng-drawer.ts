import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  forwardRef,
  inject,
  input,
  output,
} from '@angular/core';
import { createScrollLockManager, createTngIdFactory } from '@tailng-ui/cdk';
import {
  isOwnedOverlayTarget,
  TNG_OVERLAY_LAYER_ID_ATTR,
} from '../../overlay/_shared/tng-overlay-ownership';

const createDrawerContainerId = createTngIdFactory('tng-drawer-container');
const createDrawerId = createTngIdFactory('tng-drawer');

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export type TngDrawerAutoBoolean = 'auto' | boolean;
export type TngDrawerDirection = 'ltr' | 'rtl' | 'auto';
export type TngDrawerMode = 'overlay' | 'push' | 'side';
export type TngDrawerPosition = 'start' | 'end';
export type TngDrawerRole = 'navigation' | 'dialog' | 'complementary' | 'region';
export type TngDrawerAutoFocus = 'drawer' | 'first-focusable' | 'none';
type TngResolvedDrawerSide = 'left' | 'right';
type TngDrawerLifecycleTransition = 'opening' | 'closing';
type TngDrawerOpenSource = 'external' | 'imperative' | 'interaction' | 'initial';
type TngDrawerCloseReason = 'imperative' | 'outside' | 'escape' | 'tab' | 'destroy' | 'external';

@Directive({
  selector: '[tngDrawerContainer]',
  exportAs: 'tngDrawerContainer',
})
export class TngDrawerContainer {
  private readonly documentRef = inject(DOCUMENT, { optional: true });
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly resolvedId =
    this.hostRef.nativeElement.getAttribute('id') ?? createDrawerContainerId();
  private readonly drawers = new Set<TngDrawer>();
  private readonly contentElements = new Set<TngDrawerContent>();
  private readonly scrollLockManager = createScrollLockManager({
    documentRef: this.documentRef ?? undefined,
    getScrollbarWidth: () => {
      if (this.documentRef === null) {
        return 0;
      }

      const windowRef = this.documentRef.defaultView;
      if (windowRef === null) {
        return 0;
      }

      const rootWidth = this.documentRef.documentElement?.clientWidth ?? 0;
      return Math.max(0, windowRef.innerWidth - rootWidth);
    },
  });

  readonly hasBackdrop = input<TngDrawerAutoBoolean, TngDrawerAutoBoolean | string | null | undefined>(
    'auto',
    { transform: normalizeAutoBooleanInput },
  );
  readonly closeOthersOnOpen = input<boolean, boolean | string | null | undefined>(true, {
    transform: normalizeBooleanInput,
  });
  readonly animate = input<boolean, boolean | string | null | undefined>(true, {
    transform: normalizeBooleanInput,
  });
  readonly lockScroll = input<TngDrawerAutoBoolean, TngDrawerAutoBoolean | string | null | undefined>(
    'auto',
    { transform: normalizeAutoBooleanInput },
  );
  readonly dir = input<TngDrawerDirection, TngDrawerDirection | string | null | undefined>('auto', {
    transform: normalizeDirectionInput,
  });

  @HostBinding('attr.data-slot')
  protected readonly dataSlot = 'drawer-container' as const;

  @HostBinding('attr.id')
  readonly id = this.resolvedId;

  @HostBinding('attr.data-content-count')
  protected get dataContentCount(): string {
    return String(this.contentElements.size);
  }

  @HostBinding('attr.data-content-conflict')
  protected get dataContentConflict(): 'true' | null {
    return this.contentElements.size > 1 ? 'true' : null;
  }

  @HostBinding('attr.data-direction')
  protected get dataDirection(): 'ltr' | 'rtl' {
    return this.resolveDirection();
  }

  ngDoCheck(): void {
    this.syncDerivedState();
  }

  ngOnDestroy(): void {
    this.scrollLockManager.clear();
  }

  registerDrawer(drawer: TngDrawer): void {
    this.drawers.add(drawer);
    this.syncDerivedState();
  }

  unregisterDrawer(drawer: TngDrawer): void {
    this.drawers.delete(drawer);
    this.syncDerivedState();
  }

  registerContent(content: TngDrawerContent): void {
    this.contentElements.add(content);
    this.syncDerivedState();
  }

  unregisterContent(content: TngDrawerContent): void {
    this.contentElements.delete(content);
    this.syncDerivedState();
  }

  getHostElement(): HTMLElement {
    return this.hostRef.nativeElement;
  }

  containsTarget(target: Node | null): boolean {
    if (target === null) {
      return false;
    }

    return this.hostRef.nativeElement.contains(target);
  }

  resolveDirection(): 'ltr' | 'rtl' {
    const configuredDirection = this.dir();
    if (configuredDirection !== 'auto') {
      return configuredDirection;
    }

    const host = this.hostRef.nativeElement;
    const nearestDirection =
      host.closest<HTMLElement>('[dir]')?.getAttribute('dir') ??
      host.ownerDocument?.documentElement?.getAttribute('dir');

    return nearestDirection?.toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
  }

  resolveSide(position: TngDrawerPosition): TngResolvedDrawerSide {
    return resolveSideFromDirection(position, this.resolveDirection());
  }

  shouldRenderBackdrop(drawer: TngDrawer): boolean {
    const drawerBackdrop = drawer.backdrop();
    if (drawerBackdrop !== 'auto') {
      return drawerBackdrop;
    }

    const containerBackdrop = this.hasBackdrop();
    if (containerBackdrop !== 'auto') {
      return containerBackdrop;
    }

    return drawer.mode() === 'overlay';
  }

  shouldLockScroll(drawer: TngDrawer): boolean {
    const lockPolicy = this.lockScroll();
    if (lockPolicy !== 'auto') {
      return lockPolicy;
    }

    return drawer.mode() === 'overlay' && !drawer.resolveAllowBodyScroll();
  }

  onDrawerOpenRequest(drawer: TngDrawer): void {
    if (!this.closeOthersOnOpen()) {
      return;
    }

    for (const registeredDrawer of this.drawers) {
      if (registeredDrawer === drawer || !registeredDrawer.isOpen()) {
        continue;
      }

      registeredDrawer.closeFromContainer();
    }
  }

  onDrawerStateChanged(): void {
    this.syncDerivedState();
  }

  private syncDerivedState(): void {
    this.syncContentOffsets();
    this.syncContentInertState();
    this.syncBodyScrollLock();
  }

  private getOpenDrawers(): readonly TngDrawer[] {
    return Array.from(this.drawers).filter((drawer) => drawer.isOpen());
  }

  private syncBodyScrollLock(): void {
    const shouldLock = this.getOpenDrawers().some((drawer) => this.shouldLockScroll(drawer));
    if (shouldLock) {
      this.scrollLockManager.acquire(this.id);
      return;
    }

    this.scrollLockManager.release(this.id);
  }

  private syncContentInertState(): void {
    const shouldInert = this.getOpenDrawers().some((drawer) => drawer.shouldInertContent());
    for (const content of this.contentElements) {
      content.setInert(shouldInert);
    }
  }

  private syncContentOffsets(): void {
    let leftOffset = 0;
    let rightOffset = 0;

    for (const drawer of this.getOpenDrawers()) {
      if (!drawer.participatesInContentOffset()) {
        continue;
      }

      const side = this.resolveSide(drawer.position());
      const width = drawer.getMeasuredWidth();

      if (side === 'left') {
        leftOffset += width;
      } else {
        rightOffset += width;
      }
    }

    for (const content of this.contentElements) {
      content.applyOffsets(leftOffset, rightOffset);
    }
  }
}

@Directive({
  selector: '[tngDrawer]',
  exportAs: 'tngDrawer',
})
export class TngDrawer {
  private readonly documentRef = inject(DOCUMENT, { optional: true });
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly container = inject(TngDrawerContainer, { optional: true, host: true });
  private readonly resolvedId = this.hostRef.nativeElement.getAttribute('id') ?? createDrawerId();
  private backdropElement: HTMLElement | null = null;
  private backdropPointerdownListener: ((event: PointerEvent) => void) | null = null;
  private globalPointerdownListener: ((event: PointerEvent) => void) | null = null;
  private globalKeydownListener: ((event: KeyboardEvent) => void) | null = null;
  private lifecycleFallbackHandle: ReturnType<typeof setTimeout> | null = null;
  private pendingLifecycle: TngDrawerLifecycleTransition | null = null;
  private openState = false;
  private lastKnownPosition: TngDrawerPosition = 'start';
  private lastKnownMode: TngDrawerMode = 'overlay';
  private restoreFocusTarget: HTMLElement | null = null;
  private restoreFocusFallback: HTMLElement | null = null;
  private swipeStartX: number | null = null;
  private swipeLastX: number | null = null;
  private swipeStartY: number | null = null;
  private swipeLastY: number | null = null;

  readonly openedInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
    alias: 'opened',
    transform: normalizeOptionalBooleanInput,
  });
  readonly defaultOpened = input<boolean, boolean | string | null | undefined>(false, {
    transform: normalizeBooleanInput,
  });
  readonly mode = input<TngDrawerMode, TngDrawerMode | string | null | undefined>('overlay', {
    transform: normalizeModeInput,
  });
  readonly position = input<TngDrawerPosition, TngDrawerPosition | string | null | undefined>('start', {
    transform: normalizePositionInput,
  });
  readonly disabled = input<boolean, boolean | string | null | undefined>(false, {
    transform: normalizeBooleanInput,
  });
  readonly backdrop = input<TngDrawerAutoBoolean, TngDrawerAutoBoolean | string | null | undefined>(
    'auto',
    { transform: normalizeAutoBooleanInput },
  );
  readonly closeOnOutsideClickInput = input<boolean | undefined, boolean | string | null | undefined>(
    undefined,
    {
      alias: 'closeOnOutsideClick',
      transform: normalizeOptionalBooleanInput,
    },
  );
  readonly closeOnEscape = input<boolean, boolean | string | null | undefined>(true, {
    transform: normalizeBooleanInput,
  });
  readonly restoreFocus = input<boolean, boolean | string | null | undefined>(true, {
    transform: normalizeBooleanInput,
  });
  readonly autoFocus = input<TngDrawerAutoFocus, TngDrawerAutoFocus | string | null | undefined>(
    'drawer',
    { transform: normalizeAutoFocusInput },
  );
  readonly trapFocus = input<TngDrawerAutoBoolean, TngDrawerAutoBoolean | string | null | undefined>(
    'auto',
    { transform: normalizeAutoBooleanInput },
  );
  readonly inertContent = input<TngDrawerAutoBoolean, TngDrawerAutoBoolean | string | null | undefined>(
    'auto',
    { transform: normalizeAutoBooleanInput },
  );
  readonly allowBodyScrollInput = input<boolean | undefined, boolean | string | null | undefined>(
    undefined,
    {
      alias: 'allowBodyScroll',
      transform: normalizeOptionalBooleanInput,
    },
  );
  readonly closeOnTab = input<boolean, boolean | string | null | undefined>(false, {
    transform: normalizeBooleanInput,
  });
  readonly role = input<TngDrawerRole, TngDrawerRole | string | null | undefined>('navigation', {
    transform: normalizeRoleInput,
  });
  readonly fixedInViewport = input<boolean, boolean | string | null | undefined>(false, {
    transform: normalizeBooleanInput,
  });
  readonly fixedTopGap = input<number, number | string | null | undefined>(0, {
    transform: normalizeNumberInput,
  });
  readonly fixedBottomGap = input<number, number | string | null | undefined>(0, {
    transform: normalizeNumberInput,
  });
  readonly swipeToClose = input<boolean, boolean | string | null | undefined>(false, {
    transform: normalizeBooleanInput,
  });
  readonly openedChange = output<boolean>();
  readonly tngDrawerOpened = output<void>();
  readonly tngDrawerClosed = output<void>();
  readonly openStart = output<void>();
  readonly closeStart = output<void>();
  readonly backdropClick = output<void>();
  readonly positionChange = output<TngDrawerPosition>();

  ngOnInit(): void {
    this.container?.registerDrawer(this);
    this.lastKnownPosition = this.position();
    this.lastKnownMode = this.mode();

    const controlledValue = this.openedInput();
    this.openState = controlledValue ?? this.defaultOpened();

    if (this.openState) {
      this.attachGlobalListeners();
      this.renderBackdropIfNeeded();
      this.container?.onDrawerStateChanged();
      this.queueLifecycleEnd('opening', false);
    }
  }

  ngAfterViewInit(): void {
    if (this.openState) {
      this.applyAutoFocus();
    }
  }

  ngDoCheck(): void {
    this.syncControlledState();
    this.syncPositionChange();
    this.syncModeChange();
    if (this.openState) {
      this.renderBackdropIfNeeded();
      this.container?.onDrawerStateChanged();
    }
  }

  ngOnDestroy(): void {
    if (this.openState) {
      this.performClose({
        emitOpenedChange: false,
        emitLifecycle: true,
        restoreFocus: false,
        reason: 'destroy',
      });
    }

    this.teardownInteractions();
    this.container?.unregisterDrawer(this);
  }

  isOpen(): boolean {
    return this.openState;
  }

  participatesInContentOffset(): boolean {
    const mode = this.mode();
    return mode === 'push' || mode === 'side';
  }

  shouldInertContent(): boolean {
    if (!this.openState) {
      return false;
    }

    return resolveAutoBoolean(this.inertContent(), this.mode() === 'overlay');
  }

  resolveAllowBodyScroll(): boolean {
    const configured = this.allowBodyScrollInput();
    if (configured !== undefined) {
      return configured;
    }

    return this.mode() !== 'overlay';
  }

  getMeasuredWidth(): number {
    const host = this.hostRef.nativeElement;
    const widthAttr = Number.parseFloat(host.getAttribute('data-width') ?? '');
    if (Number.isFinite(widthAttr) && widthAttr > 0) {
      return widthAttr;
    }

    const rectWidth = host.getBoundingClientRect().width;
    if (rectWidth > 0) {
      return rectWidth;
    }

    const inlineWidth = Number.parseFloat(host.style.width);
    if (Number.isFinite(inlineWidth) && inlineWidth > 0) {
      return inlineWidth;
    }

    return 0;
  }

  closeFromContainer(): void {
    this.requestOpenState(false, 'interaction', 'outside');
  }

  setRestoreFocusFallback(target: HTMLElement | null): void {
    this.restoreFocusFallback = target;
  }

  setRestoreFocusTarget(target: HTMLElement | null): void {
    this.restoreFocusTarget = target;
  }

  open(): void {
    this.requestOpenState(true, 'imperative', 'imperative');
  }

  close(): void {
    this.requestOpenState(false, 'imperative', 'imperative');
  }

  toggle(force?: boolean): void {
    if (force === undefined) {
      this.requestOpenState(!this.openState, 'imperative', 'imperative');
      return;
    }

    this.requestOpenState(force, 'imperative', 'imperative');
  }

  @HostListener('transitionend', ['$event'])
  protected onTransitionEnd(event: Event): void {
    if (event.target !== this.hostRef.nativeElement) {
      return;
    }

    this.flushPendingLifecycle();
  }

  @HostListener('pointerdown', ['$event'])
  protected onHostPointerDown(event: PointerEvent): void {
    if (!this.openState || !this.swipeToClose() || this.mode() !== 'overlay') {
      return;
    }

    this.swipeStartX = event.clientX;
    this.swipeLastX = event.clientX;
    this.swipeStartY = event.clientY;
    this.swipeLastY = event.clientY;
  }

  @HostListener('pointermove', ['$event'])
  protected onHostPointerMove(event: PointerEvent): void {
    if (this.swipeStartX === null) {
      return;
    }

    this.swipeLastX = event.clientX;
    this.swipeLastY = event.clientY;
  }

  @HostListener('pointerup')
  protected onHostPointerUp(): void {
    if (
      this.swipeStartX === null ||
      this.swipeLastX === null ||
      this.swipeStartY === null ||
      this.swipeLastY === null
    ) {
      this.resetSwipeState();
      return;
    }

    const deltaX = this.swipeLastX - this.swipeStartX;
    const deltaY = this.swipeLastY - this.swipeStartY;
    const side = this.resolveEffectiveSide();
    const isHorizontalGesture = Math.abs(deltaX) >= Math.abs(deltaY);
    const shouldClose =
      isHorizontalGesture && ((side === 'left' && deltaX <= -40) || (side === 'right' && deltaX >= 40));

    this.resetSwipeState();

    if (shouldClose) {
      this.requestOpenState(false, 'interaction', 'outside');
    }
  }

  @HostBinding('attr.data-slot')
  protected readonly dataSlot = 'drawer' as const;

  @HostBinding('attr.id')
  protected readonly id = this.resolvedId;

  @HostBinding(`attr.${TNG_OVERLAY_LAYER_ID_ATTR}`)
  protected readonly overlayLayerIdAttr = this.resolvedId;

  @HostBinding('attr.role')
  protected get roleAttr(): TngDrawerRole {
    return this.role();
  }

  @HostBinding('attr.tabindex')
  protected get tabIndexAttr(): string {
    return this.hostRef.nativeElement.getAttribute('tabindex') ?? '-1';
  }

  @HostBinding('attr.data-mode')
  protected get dataMode(): TngDrawerMode {
    return this.mode();
  }

  @HostBinding('attr.data-state')
  protected get dataState(): 'open' | 'closed' {
    return this.openState ? 'open' : 'closed';
  }

  @HostBinding('attr.data-open')
  protected get dataOpen(): 'true' | 'false' {
    return this.openState ? 'true' : 'false';
  }

  @HostBinding('attr.data-position')
  protected get dataPosition(): TngDrawerPosition {
    return this.position();
  }

  @HostBinding('attr.data-effective-position')
  protected get dataEffectivePosition(): TngResolvedDrawerSide {
    return this.resolveEffectiveSide();
  }

  @HostBinding('attr.data-disabled')
  protected get dataDisabled(): 'true' | 'false' {
    return this.disabled() ? 'true' : 'false';
  }

  @HostBinding('attr.aria-disabled')
  protected get ariaDisabled(): 'true' | null {
    return this.disabled() ? 'true' : null;
  }

  @HostBinding('attr.data-container-id')
  protected get dataContainerId(): string | null {
    return this.container?.id ?? null;
  }

  @HostBinding('attr.data-container-missing')
  protected get dataContainerMissing(): 'true' | null {
    return this.container === null ? 'true' : null;
  }

  @HostBinding('attr.hidden')
  protected get hiddenAttr(): '' | null {
    return this.openState ? null : '';
  }

  @HostBinding('attr.aria-modal')
  protected get ariaModal(): 'true' | null {
    if (this.role() !== 'dialog' || this.mode() !== 'overlay' || !this.openState) {
      return null;
    }

    return 'true';
  }

  @HostBinding('style.position')
  protected get positionStyle(): 'fixed' | null {
    return this.fixedInViewport() ? 'fixed' : null;
  }

  @HostBinding('style.top')
  protected get topStyle(): string | null {
    if (!this.fixedInViewport()) {
      return null;
    }

    return `${Math.max(0, this.fixedTopGap())}px`;
  }

  @HostBinding('style.bottom')
  protected get bottomStyle(): string | null {
    if (!this.fixedInViewport()) {
      return null;
    }

    return `${Math.max(0, this.fixedBottomGap())}px`;
  }

  @HostBinding('style.left')
  protected get leftStyle(): string | null {
    if (!this.fixedInViewport() || this.resolveEffectiveSide() !== 'left') {
      return null;
    }

    return '0px';
  }

  @HostBinding('style.right')
  protected get rightStyle(): string | null {
    if (!this.fixedInViewport() || this.resolveEffectiveSide() !== 'right') {
      return null;
    }

    return '0px';
  }

  private syncControlledState(): void {
    const controlledValue = this.openedInput();
    if (controlledValue === undefined || controlledValue === this.openState) {
      return;
    }

    if (controlledValue) {
      this.performOpen({
        emitOpenedChange: false,
        emitLifecycle: true,
        source: 'external',
      });
      return;
    }

    this.performClose({
      emitOpenedChange: false,
      emitLifecycle: true,
      restoreFocus: false,
      reason: 'external',
    });
  }

  private syncPositionChange(): void {
    const currentPosition = this.position();
    if (currentPosition === this.lastKnownPosition) {
      return;
    }

    this.lastKnownPosition = currentPosition;
    this.positionChange.emit(currentPosition);
    this.container?.onDrawerStateChanged();
  }

  private syncModeChange(): void {
    const currentMode = this.mode();
    if (currentMode === this.lastKnownMode) {
      return;
    }

    this.lastKnownMode = currentMode;
    if (this.openState) {
      this.renderBackdropIfNeeded();
    }
    this.container?.onDrawerStateChanged();
  }

  private requestOpenState(nextOpen: boolean, source: TngDrawerOpenSource, reason: TngDrawerCloseReason): void {
    if (nextOpen && this.disabled()) {
      return;
    }

    if (this.openedInput() !== undefined) {
      const currentControlledValue = this.openedInput() ?? false;
      if (source !== 'external' && currentControlledValue !== nextOpen) {
        this.openedChange.emit(nextOpen);
      }
      return;
    }

    if (nextOpen === this.openState) {
      return;
    }

    if (nextOpen) {
      this.performOpen({
        emitOpenedChange: source !== 'initial' && source !== 'external',
        emitLifecycle: source !== 'initial',
        source,
      });
      return;
    }

    this.performClose({
      emitOpenedChange: source !== 'initial' && source !== 'external',
      emitLifecycle: source !== 'initial',
      restoreFocus: reason !== 'tab',
      reason,
    });
  }

  private performOpen(options: Readonly<{
    emitOpenedChange: boolean;
    emitLifecycle: boolean;
    source: TngDrawerOpenSource;
  }>): void {
    if (this.openState) {
      return;
    }

    this.container?.onDrawerOpenRequest(this);

    this.captureRestoreFocusTarget();
    this.openState = true;
    this.attachGlobalListeners();
    this.renderBackdropIfNeeded();
    this.container?.onDrawerStateChanged();

    if (options.emitOpenedChange) {
      this.openedChange.emit(true);
    }

    if (options.emitLifecycle) {
      this.startLifecycle('opening');
    }

    if (options.source !== 'external') {
      this.applyAutoFocus();
    }
  }

  private performClose(options: Readonly<{
    emitOpenedChange: boolean;
    emitLifecycle: boolean;
    restoreFocus: boolean;
    reason: TngDrawerCloseReason;
  }>): void {
    if (!this.openState) {
      return;
    }

    this.openState = false;
    this.teardownInteractions();
    this.container?.onDrawerStateChanged();

    if (options.emitOpenedChange) {
      this.openedChange.emit(false);
    }

    if (options.emitLifecycle) {
      this.startLifecycle('closing');
    }

    if (options.restoreFocus && this.restoreFocus()) {
      this.restoreFocusToTarget();
    }
  }

  private captureRestoreFocusTarget(): void {
    const activeElement = this.documentRef?.activeElement;
    this.restoreFocusTarget = activeElement instanceof HTMLElement ? activeElement : null;
  }

  private restoreFocusToTarget(): void {
    if (this.restoreFocusTarget?.isConnected) {
      this.restoreFocusTarget.focus();
      return;
    }

    if (this.restoreFocusFallback?.isConnected) {
      this.restoreFocusFallback.focus();
      return;
    }

    this.documentRef?.body?.focus?.();
  }

  private applyAutoFocus(): void {
    const strategy = this.autoFocus();
    if (strategy === 'none') {
      return;
    }

    if (strategy === 'first-focusable') {
      const firstFocusable = this.getFocusableElements()[0];
      if (firstFocusable !== undefined) {
        firstFocusable.focus();
        return;
      }
    }

    this.hostRef.nativeElement.focus();
  }

  private getFocusableElements(): readonly HTMLElement[] {
    const host = this.hostRef.nativeElement;
    const candidates = Array.from(host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    return candidates.filter((element) => !element.hasAttribute('disabled') && element.tabIndex >= 0);
  }

  private resolveEffectiveSide(): TngResolvedDrawerSide {
    return this.container?.resolveSide(this.position()) ?? resolveSideFromDirection(this.position(), 'ltr');
  }

  private startLifecycle(transition: TngDrawerLifecycleTransition): void {
    this.clearPendingLifecycle();

    if (transition === 'opening') {
      this.openStart.emit();
    } else {
      this.closeStart.emit();
    }

    if (!this.container?.animate()) {
      if (transition === 'opening') {
        this.tngDrawerOpened.emit();
      } else {
        this.tngDrawerClosed.emit();
      }
      return;
    }

    this.queueLifecycleEnd(transition, true);
  }

  private queueLifecycleEnd(transition: TngDrawerLifecycleTransition, withFallback: boolean): void {
    this.pendingLifecycle = transition;

    if (!withFallback) {
      return;
    }

    this.lifecycleFallbackHandle = setTimeout(() => {
      this.flushPendingLifecycle();
    }, 60);
  }

  private flushPendingLifecycle(): void {
    if (this.pendingLifecycle === null) {
      return;
    }

    const transition = this.pendingLifecycle;
    this.clearPendingLifecycle();

    if (transition === 'opening') {
      this.tngDrawerOpened.emit();
      return;
    }

    this.tngDrawerClosed.emit();
  }

  private clearPendingLifecycle(): void {
    this.pendingLifecycle = null;

    if (this.lifecycleFallbackHandle !== null) {
      clearTimeout(this.lifecycleFallbackHandle);
      this.lifecycleFallbackHandle = null;
    }
  }

  private attachGlobalListeners(): void {
    if (this.documentRef === null) {
      return;
    }

    if (this.globalPointerdownListener === null) {
      this.globalPointerdownListener = (event: PointerEvent): void => this.handleDocumentPointerDown(event);
      this.documentRef.addEventListener('pointerdown', this.globalPointerdownListener, true);
    }

    if (this.globalKeydownListener === null) {
      this.globalKeydownListener = (event: KeyboardEvent): void => this.handleDocumentKeydown(event);
      this.documentRef.addEventListener('keydown', this.globalKeydownListener, true);
    }
  }

  private teardownInteractions(): void {
    this.detachGlobalListeners();
    this.destroyBackdrop();
    this.clearPendingLifecycle();
    this.resetSwipeState();
  }

  private detachGlobalListeners(): void {
    if (this.documentRef === null) {
      return;
    }

    if (this.globalPointerdownListener !== null) {
      this.documentRef.removeEventListener('pointerdown', this.globalPointerdownListener, true);
      this.globalPointerdownListener = null;
    }

    if (this.globalKeydownListener !== null) {
      this.documentRef.removeEventListener('keydown', this.globalKeydownListener, true);
      this.globalKeydownListener = null;
    }
  }

  private renderBackdropIfNeeded(): void {
    if (!this.openState || !this.resolveBackdropEnabled()) {
      this.destroyBackdrop();
      return;
    }

    if (this.backdropElement !== null) {
      return;
    }

    const targetHost = this.container?.getHostElement() ?? this.hostRef.nativeElement.parentElement;
    if (targetHost === null) {
      return;
    }

    const backdrop = this.documentRef?.createElement('div');
    if (backdrop === undefined || backdrop === null) {
      return;
    }

    backdrop.setAttribute('data-slot', 'drawer-backdrop');
    backdrop.setAttribute('data-owner', this.id);
    backdrop.setAttribute('role', 'presentation');
    backdrop.setAttribute('tabindex', '-1');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('data-open', 'true');

    this.backdropPointerdownListener = (event: PointerEvent): void => {
      this.backdropClick.emit();

      if (this.resolveCloseOnOutsideClick()) {
        this.requestOpenState(false, 'interaction', 'outside');
      }

      event.preventDefault();
      event.stopPropagation();
    };
    backdrop.addEventListener('pointerdown', this.backdropPointerdownListener);

    targetHost.insertBefore(backdrop, this.hostRef.nativeElement);
    this.backdropElement = backdrop;
  }

  private destroyBackdrop(): void {
    if (this.backdropElement === null) {
      return;
    }

    if (this.backdropPointerdownListener !== null) {
      this.backdropElement.removeEventListener('pointerdown', this.backdropPointerdownListener);
      this.backdropPointerdownListener = null;
    }

    this.backdropElement.remove();
    this.backdropElement = null;
  }

  private resolveBackdropEnabled(): boolean {
    if (this.container !== null) {
      return this.container.shouldRenderBackdrop(this);
    }

    return resolveAutoBoolean(this.backdrop(), this.mode() === 'overlay');
  }

  private resolveCloseOnOutsideClick(): boolean {
    const configured = this.closeOnOutsideClickInput();
    if (configured !== undefined) {
      return configured;
    }

    return this.mode() === 'overlay';
  }

  private resolveTrapFocus(): boolean {
    return resolveAutoBoolean(this.trapFocus(), this.mode() === 'overlay');
  }

  private handleDocumentPointerDown(event: PointerEvent): void {
    if (!this.openState || !this.resolveCloseOnOutsideClick()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (this.hostRef.nativeElement.contains(target)) {
      return;
    }

    if (this.backdropElement?.contains(target) === true) {
      return;
    }

    if (this.container?.containsTarget(target) === true) {
      return;
    }

    if (this.isScrollbarPointerDown(event, target)) {
      return;
    }

    if (isOwnedOverlayTarget(event.target, this.resolvedId, event.composedPath())) {
      return;
    }

    this.requestOpenState(false, 'interaction', 'outside');
  }

  private handleDocumentKeydown(event: KeyboardEvent): void {
    if (!this.openState) {
      return;
    }

    if (event.key === 'Escape') {
      if (!this.closeOnEscape()) {
        return;
      }

      event.preventDefault();
      this.requestOpenState(false, 'interaction', 'escape');
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    if (this.resolveTrapFocus()) {
      this.handleTrappedTab(event);
      return;
    }

    if (this.closeOnTab()) {
      this.requestOpenState(false, 'interaction', 'tab');
    }
  }

  private handleTrappedTab(event: KeyboardEvent): void {
    const focusable = this.getFocusableElements();
    const host = this.hostRef.nativeElement;
    if (focusable.length === 0) {
      event.preventDefault();
      host.focus();
      return;
    }

    const currentActive = this.documentRef?.activeElement;
    const currentIndex = currentActive instanceof HTMLElement ? focusable.indexOf(currentActive) : -1;

    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusable.length - 1
        : currentIndex - 1
      : currentIndex < 0 || currentIndex >= focusable.length - 1
        ? 0
        : currentIndex + 1;

    event.preventDefault();
    focusable[nextIndex]?.focus();
  }

  private resetSwipeState(): void {
    this.swipeStartX = null;
    this.swipeLastX = null;
    this.swipeStartY = null;
    this.swipeLastY = null;
  }

  private isScrollbarPointerDown(event: PointerEvent, target: Node): boolean {
    if (this.documentRef === null) {
      return false;
    }

    const root = this.documentRef.documentElement;
    if (target !== root && target !== this.documentRef.body) {
      return false;
    }

    const viewportWidth = root.clientWidth;
    const viewportHeight = root.clientHeight;
    const onVerticalScrollbar = event.clientX >= viewportWidth && event.clientX > 0;
    const onHorizontalScrollbar = event.clientY >= viewportHeight && event.clientY > 0;

    return onVerticalScrollbar || onHorizontalScrollbar;
  }
}

@Directive({
  selector: '[tngDrawerContent]',
  exportAs: 'tngDrawerContent',
})
export class TngDrawerContent {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly container = inject(TngDrawerContainer, { optional: true, host: true });

  ngOnInit(): void {
    this.container?.registerContent(this);
  }

  ngOnDestroy(): void {
    this.container?.unregisterContent(this);
  }

  @HostBinding('attr.data-slot')
  protected readonly dataSlot = 'drawer-content' as const;

  @HostBinding('attr.data-container-id')
  protected get dataContainerId(): string | null {
    return this.container?.id ?? null;
  }

  @HostBinding('attr.data-container-missing')
  protected get dataContainerMissing(): 'true' | null {
    return this.container === null ? 'true' : null;
  }

  applyOffsets(leftOffset: number, rightOffset: number): void {
    const host = this.hostRef.nativeElement;
    host.style.marginLeft = leftOffset > 0 ? `${leftOffset}px` : '';
    host.style.marginRight = rightOffset > 0 ? `${rightOffset}px` : '';
    host.setAttribute('data-offset-left', String(leftOffset));
    host.setAttribute('data-offset-right', String(rightOffset));
    host.setAttribute('data-shifted', leftOffset > 0 || rightOffset > 0 ? 'true' : 'false');
  }

  setInert(nextInert: boolean): void {
    const host = this.hostRef.nativeElement;
    if (nextInert) {
      host.setAttribute('inert', '');
      host.setAttribute('aria-hidden', 'true');
      try {
        (host as HTMLElement & { inert?: boolean }).inert = true;
      } catch {
        // noop: inert is not writable in some environments.
      }
      return;
    }

    host.removeAttribute('inert');
    host.removeAttribute('aria-hidden');
    try {
      (host as HTMLElement & { inert?: boolean }).inert = false;
    } catch {
      // noop: inert is not writable in some environments.
    }
  }
}

@Directive({
  selector: '[tngSidenavContainer]',
  exportAs: 'tngSidenavContainer',
  providers: [
    {
      provide: TngDrawerContainer,
      useExisting: forwardRef(() => TngSidenavContainer),
    },
  ],
})
export class TngSidenavContainer extends TngDrawerContainer {}

@Directive({
  selector: '[tngSidenav]',
  exportAs: 'tngSidenav',
  providers: [
    {
      provide: TngDrawer,
      useExisting: forwardRef(() => TngSidenav),
    },
  ],
})
export class TngSidenav extends TngDrawer {}

@Directive({
  selector: '[tngSidenavContent]',
  exportAs: 'tngSidenavContent',
  providers: [
    {
      provide: TngDrawerContent,
      useExisting: forwardRef(() => TngSidenavContent),
    },
  ],
})
export class TngSidenavContent extends TngDrawerContent {}

function normalizeBooleanInput(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '' || normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return Boolean(value);
}

function normalizeOptionalBooleanInput(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return normalizeBooleanInput(value);
}

function normalizeAutoBooleanInput(value: unknown): TngDrawerAutoBoolean {
  if (typeof value === 'string' && value.trim().toLowerCase() === 'auto') {
    return 'auto';
  }

  if (value === undefined || value === null) {
    return 'auto';
  }

  return normalizeBooleanInput(value);
}

function resolveAutoBoolean(value: TngDrawerAutoBoolean, fallbackWhenAuto: boolean): boolean {
  return value === 'auto' ? fallbackWhenAuto : value;
}

function normalizeModeInput(value: unknown): TngDrawerMode {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'push' || normalized === 'side' || normalized === 'overlay') {
      return normalized;
    }
  }

  return 'overlay';
}

function normalizePositionInput(value: unknown): TngDrawerPosition {
  if (typeof value === 'string' && value.trim().toLowerCase() === 'end') {
    return 'end';
  }

  return 'start';
}

function normalizeDirectionInput(value: unknown): TngDrawerDirection {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'rtl' || normalized === 'ltr' || normalized === 'auto') {
      return normalized;
    }
  }

  return 'auto';
}

function normalizeRoleInput(value: unknown): TngDrawerRole {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === 'dialog' ||
      normalized === 'complementary' ||
      normalized === 'navigation' ||
      normalized === 'region'
    ) {
      return normalized;
    }
  }

  return 'navigation';
}

function normalizeAutoFocusInput(value: unknown): TngDrawerAutoFocus {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'first-focusable') {
      return 'first-focusable';
    }
    if (normalized === 'none') {
      return 'none';
    }
  }

  return 'drawer';
}

function normalizeNumberInput(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function resolveSideFromDirection(position: TngDrawerPosition, direction: 'ltr' | 'rtl'): TngResolvedDrawerSide {
  if (position === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }

  return direction === 'rtl' ? 'left' : 'right';
}
