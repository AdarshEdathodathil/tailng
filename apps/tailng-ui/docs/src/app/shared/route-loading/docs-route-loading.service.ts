import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

const minimumRouteLoadingMs = 250;

@Injectable({ providedIn: 'root' })
export class DocsRouteLoadingService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loading = signal(false);
  private activeNavigationId: number | null = null;
  private loadingStartedAt = 0;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly isLoading = this.loading.asReadonly();

  public constructor() {
    const subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.startLoading(event.id);
        return;
      }

      if (event instanceof NavigationEnd) {
        this.finishLoading(event.id);
        return;
      }

      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.clearLoading(event.id);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
      this.clearHideTimer();
    });
  }

  private startLoading(navigationId: number): void {
    this.clearHideTimer();
    this.activeNavigationId = navigationId;
    this.loadingStartedAt = Date.now();
    this.loading.set(true);
  }

  private finishLoading(navigationId: number): void {
    if (this.activeNavigationId !== navigationId) {
      return;
    }

    const elapsedMs = Date.now() - this.loadingStartedAt;
    const remainingMs = Math.max(minimumRouteLoadingMs - elapsedMs, 0);

    if (remainingMs === 0) {
      this.setIdle();
      return;
    }

    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.setIdle();
    }, remainingMs);
  }

  private clearLoading(navigationId: number): void {
    if (this.activeNavigationId !== navigationId) {
      return;
    }

    this.clearHideTimer();
    this.setIdle();
  }

  private setIdle(): void {
    this.activeNavigationId = null;
    this.loading.set(false);
  }

  private clearHideTimer(): void {
    if (this.hideTimer === null) {
      return;
    }

    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }
}

