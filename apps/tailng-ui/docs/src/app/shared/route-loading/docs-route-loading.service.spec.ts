import { TestBed } from '@angular/core/testing';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsRouteLoadingService } from './docs-route-loading.service';

describe('DocsRouteLoadingService', () => {
  let events: Subject<unknown>;
  let service: DocsRouteLoadingService;
  let now: number;

  beforeEach(() => {
    events = new Subject<unknown>();
    now = 1_000;
    vi.useFakeTimers();
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    TestBed.configureTestingModule({
      providers: [
        DocsRouteLoadingService,
        {
          provide: Router,
          useValue: {
            events: events.asObservable(),
          },
        },
      ],
    });

    service = TestBed.inject(DocsRouteLoadingService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts loading on navigation start', () => {
    events.next(new NavigationStart(1, '/components'));

    expect(service.isLoading()).toBe(true);
  });

  it('keeps loading visible for at least 250ms after navigation end', () => {
    events.next(new NavigationStart(1, '/components'));
    now += 80;
    events.next(new NavigationEnd(1, '/components', '/components'));

    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(169);
    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(service.isLoading()).toBe(false);
  });

  it('clears loading after navigation cancel', () => {
    events.next(new NavigationStart(1, '/components'));
    events.next(new NavigationCancel(1, '/components', 'guard rejected'));

    expect(service.isLoading()).toBe(false);
  });

  it('clears loading after navigation error', () => {
    events.next(new NavigationStart(1, '/components'));
    events.next(new NavigationError(1, '/components', new Error('route failed')));

    expect(service.isLoading()).toBe(false);
  });

  it('does not let an older navigation hide a newer navigation loader', () => {
    events.next(new NavigationStart(1, '/components/button'));
    now += 100;
    events.next(new NavigationStart(2, '/components/input'));
    now += 30;
    events.next(new NavigationEnd(1, '/components/button', '/components/button'));

    vi.advanceTimersByTime(500);
    expect(service.isLoading()).toBe(true);

    now += 120;
    events.next(new NavigationEnd(2, '/components/input', '/components/input'));
    vi.advanceTimersByTime(99);
    expect(service.isLoading()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(service.isLoading()).toBe(false);
  });
});

