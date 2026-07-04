import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveTngProgressBarRange,
  TngProgressBar,
  TngProgressBarIndicator,
} from '../tng-progress-bar';

function getByTestId<T extends Element>(
  fixture: { nativeElement: HTMLElement },
  testId: string,
): T {
  const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  if (element === null) {
    throw new Error(`Expected element for data-testid="${testId}".`);
  }

  return element as T;
}

@Component({
  imports: [TngProgressBar, TngProgressBarIndicator],
  template: `
    <div
      tngProgressBar
      data-testid="progress-bar"
      [ariaValueText]="ariaValueText()"
      [indeterminate]="indeterminate()"
      [max]="max()"
      [min]="min()"
      [value]="value()"
    >
      <span tngProgressBarIndicator data-testid="progress-indicator"></span>
    </div>
  `,
})
class ProgressBarPrimitivesHostComponent {
  public readonly ariaValueText = signal<string | null>(null);
  public readonly indeterminate = signal(false);
  public readonly max = signal<number | string>(100);
  public readonly min = signal<number | string>(0);
  public readonly value = signal<number | string>(0);
}

describe('tng-progress-bar primitives', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('exports public progress bar directives', () => {
    expect(typeof TngProgressBar).toBe('function');
    expect(typeof TngProgressBarIndicator).toBe('function');
  });

  it('normalizes progress range boundaries', () => {
    expect(resolveTngProgressBarRange(0, 100, 24)).toEqual({
      max: 100,
      min: 0,
      value: 24,
    });
    expect(resolveTngProgressBarRange(80, 20, 120)).toEqual({
      max: 80,
      min: 80,
      value: 80,
    });
    expect(resolveTngProgressBarRange(Number.NaN, Number.NaN, Number.NaN)).toEqual({
      max: 100,
      min: 0,
      value: 0,
    });
  });

  it('applies role and aria range attributes for determinate state', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ProgressBarPrimitivesHostComponent],
    }).createComponent(ProgressBarPrimitivesHostComponent);
    fixture.componentInstance.min.set('10');
    fixture.componentInstance.max.set('210');
    fixture.componentInstance.value.set('85');
    fixture.detectChanges();

    const progressBar = getByTestId<HTMLElement>(fixture, 'progress-bar');
    expect(progressBar.getAttribute('data-slot')).toBe('progress-bar');
    expect(progressBar.getAttribute('data-state')).toBe('determinate');
    expect(progressBar.getAttribute('role')).toBe('progressbar');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('10');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('210');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('85');
    expect(progressBar.hasAttribute('data-indeterminate')).toBe(false);

    const indicator = getByTestId<HTMLElement>(fixture, 'progress-indicator');
    expect(indicator.getAttribute('data-state')).toBe('determinate');
    expect(indicator.hasAttribute('data-indeterminate')).toBe(false);
  });

  it('clamps invalid range/value combinations to a safe progress range', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ProgressBarPrimitivesHostComponent],
    }).createComponent(ProgressBarPrimitivesHostComponent);
    fixture.componentInstance.min.set(80);
    fixture.componentInstance.max.set(20);
    fixture.componentInstance.value.set(120);
    fixture.detectChanges();

    const progressBar = getByTestId<HTMLElement>(fixture, 'progress-bar');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('80');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('80');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('80');
  });

  it('removes aria range attributes and exposes indeterminate hook when indeterminate=true', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ProgressBarPrimitivesHostComponent],
    }).createComponent(ProgressBarPrimitivesHostComponent);
    fixture.componentInstance.indeterminate.set(true);
    fixture.detectChanges();

    const progressBar = getByTestId<HTMLElement>(fixture, 'progress-bar');
    expect(progressBar.getAttribute('role')).toBe('progressbar');
    expect(progressBar.getAttribute('aria-valuemin')).toBeNull();
    expect(progressBar.getAttribute('aria-valuemax')).toBeNull();
    expect(progressBar.getAttribute('aria-valuenow')).toBeNull();
    expect(progressBar.hasAttribute('data-indeterminate')).toBe(true);

    const indicator = getByTestId<HTMLElement>(fixture, 'progress-indicator');
    expect(progressBar.getAttribute('data-state')).toBe('indeterminate');
    expect(indicator.getAttribute('data-state')).toBe('indeterminate');
    expect(indicator.hasAttribute('data-indeterminate')).toBe(true);
  });

  it('exposes normalized range and percent and forwards aria-valuetext', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ProgressBarPrimitivesHostComponent],
    }).createComponent(ProgressBarPrimitivesHostComponent);
    fixture.componentInstance.min.set(50);
    fixture.componentInstance.max.set(150);
    fixture.componentInstance.value.set(75);
    fixture.componentInstance.ariaValueText.set('One quarter complete');
    fixture.detectChanges();

    const progressBar = getByTestId<HTMLElement>(fixture, 'progress-bar');
    const indicator = getByTestId<HTMLElement>(fixture, 'progress-indicator');
    expect(indicator.getAttribute('data-slot')).toBe('progress-bar-indicator');
    expect(progressBar.getAttribute('aria-valuetext')).toBe('One quarter complete');

    const directive = fixture.debugElement.children[0].injector.get(TngProgressBar);
    expect(directive.range()).toEqual({ min: 50, max: 150, value: 75 });
    expect(directive.percent()).toBe(25);

    fixture.componentInstance.value.set(200);
    fixture.detectChanges();
    expect(directive.range()).toEqual({ min: 50, max: 150, value: 150 });
    expect(directive.percent()).toBe(100);
  });
});
