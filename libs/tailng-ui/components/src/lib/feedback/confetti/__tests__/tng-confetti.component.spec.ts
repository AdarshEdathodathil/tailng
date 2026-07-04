import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TngConfettiComponent } from '../tng-confetti.component';

@Component({
  imports: [TngConfettiComponent],
  template: `<tng-confetti
    [active]="active()"
    [duration]="duration()"
    [pieces]="pieces()"
    [origin]="origin()"
    [fullscreen]="fullscreen()"
    [reducedMotion]="reducedMotion()"
    [colors]="colors()"
    [zIndex]="zIndex()"
    (completed)="onCompleted()"
  />`,
})
class Host {
  public readonly active = signal(false);
  public readonly duration = signal(1000);
  public readonly pieces = signal(5);
  public readonly origin = signal<'bottom' | 'center'>('bottom');
  public readonly fullscreen = signal(true);
  public readonly reducedMotion = signal<boolean | 'auto'>(false);
  public readonly colors = signal<string[] | null>(null);
  public readonly zIndex = signal<number | null>(null);
  public readonly completions = signal(0);
  public onCompleted(): void {
    this.completions.update((value) => value + 1);
  }
}

describe('tng-confetti component', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function create() {
    const fixture = TestBed.configureTestingModule({ imports: [Host] }).createComponent(Host);
    fixture.detectChanges();
    return fixture;
  }

  it('renders only during a launch and emits once at completion', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelectorAll('.tng-confetti-piece')).toHaveLength(0);
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tng-confetti-piece')).toHaveLength(5);
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(fixture.componentInstance.completions()).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-slot="confetti"]')).toBeNull();
    vi.advanceTimersByTime(1000);
    expect(fixture.componentInstance.completions()).toBe(1);
  });

  it('snapshots launch inputs and requires a false-to-true transition to relaunch', () => {
    const fixture = create();
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    fixture.componentInstance.pieces.set(2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tng-confetti-piece')).toHaveLength(5);
    fixture.componentInstance.active.set(false);
    fixture.detectChanges();
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tng-confetti-piece')).toHaveLength(2);
  });

  it('cancels without completion when deactivated or destroyed', () => {
    const fixture = create();
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    fixture.componentInstance.active.set(false);
    fixture.detectChanges();
    vi.runAllTimers();
    expect(fixture.componentInstance.completions()).toBe(0);
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    fixture.destroy();
    vi.runAllTimers();
    expect(fixture.componentInstance.completions()).toBe(0);
  });

  it('applies decorative, container and customization contracts', () => {
    const fixture = create();
    fixture.componentInstance.fullscreen.set(false);
    fixture.componentInstance.origin.set('center');
    fixture.componentInstance.colors.set(['rgb(1, 2, 3)']);
    fixture.componentInstance.zIndex.set(42);
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('[data-slot="confetti"]') as HTMLElement;
    const piece = fixture.nativeElement.querySelector('.tng-confetti-piece') as HTMLElement;
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    expect(overlay.dataset['fullscreen']).toBe('false');
    expect(overlay.dataset['origin']).toBe('center');
    expect(overlay.style.getPropertyValue('--tng-confetti-z-index')).toBe('42');
    expect(piece.style.getPropertyValue('--tng-confetti-piece-color')).toBe('rgb(1, 2, 3)');
  });

  it('skips particles and completes asynchronously for reduced motion', () => {
    const fixture = create();
    fixture.componentInstance.reducedMotion.set(true);
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tng-confetti-piece')).toHaveLength(0);
    expect(fixture.componentInstance.completions()).toBe(0);
    vi.runAllTimers();
    expect(fixture.componentInstance.completions()).toBe(1);
  });

  it('honors automatic system reduced motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true }) as MediaQueryList),
    });
    const fixture = create();
    fixture.componentInstance.reducedMotion.set('auto');
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tng-confetti-piece')).toHaveLength(0);
  });
});
