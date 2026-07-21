import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  resolveTngChartNotMerge,
  resolveTngChartRenderer,
  shouldAttachTngChartResizeObserver,
  shouldScheduleTngChartResizeFrame,
  TngChartSurfaceComponent,
} from './tng-chart-surface.component';
import type { TngChartOptionFactory } from '../../core/chart-context';
import { TNG_CHART_RENDERING_ENABLED } from '../../core/chart-context';
import type { TngChartLegendItem } from '../../core/chart-series.types';
import { TNG_CHART_THEME_CHANGE_EVENT } from '../../core/chart-theme-events';
import type { TngChartInstance, TngChartOption } from '../../core/chart.types';
import { TngChartRootComponent } from '../chart-root/tng-chart-root.component';
import { TngChartLegendComponent } from '../legend/tng-chart-legend.component';

@Component({
  imports: [TngChartLegendComponent, TngChartRootComponent, TngChartSurfaceComponent],
  template: `
    <tng-chart-root [legendItems]="legendItems" [optionFactory]="optionFactory">
      <tng-chart-surface [runtimeLoader]="runtimeLoader" />
      <tng-chart-legend />
    </tng-chart-root>
  `,
})
class ChartSurfaceContextHostComponent {
  public readonly chart: TngChartInstance = {
    dispose: vi.fn(),
    hideLoading: vi.fn(),
    resize: vi.fn(),
    setOption: vi.fn(),
    showLoading: vi.fn(),
  };
  public readonly init = vi.fn(() => this.chart);
  public readonly legendItems: readonly TngChartLegendItem[] = [
    {
      color: '#2563eb',
      key: 'revenue',
      label: 'Revenue',
    },
  ];
  public readonly optionFactory: TngChartOptionFactory = (
    hiddenSeries: ReadonlySet<string>,
  ): TngChartOption => ({
    hiddenSeries: [...hiddenSeries],
    series: [
      {
        name: 'Revenue',
        type: 'line',
      },
    ],
  });
  public readonly runtimeLoader = vi.fn(() =>
    Promise.resolve({
      init: this.init,
    }),
  );
}

async function flushChartSurfaceEffects(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('tng-chart-surface component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports the chart surface component', () => {
    expect(typeof TngChartSurfaceComponent).toBe('function');
  });

  it('normalizes chart renderer input', () => {
    expect(resolveTngChartRenderer('svg')).toBe('svg');
    expect(resolveTngChartRenderer('canvas')).toBe('canvas');
    expect(resolveTngChartRenderer('webgl')).toBe('canvas');
  });

  it('maps merge input into echarts notMerge option', () => {
    expect(resolveTngChartNotMerge(true)).toBe(false);
    expect(resolveTngChartNotMerge(false)).toBe(true);
  });

  it('attaches resize observer only when enabled and supported', () => {
    expect(shouldAttachTngChartResizeObserver(true, true)).toBe(true);
    expect(shouldAttachTngChartResizeObserver(false, true)).toBe(false);
    expect(shouldAttachTngChartResizeObserver(true, false)).toBe(false);
  });

  it('coalesces resize work into one animation frame', () => {
    expect(shouldScheduleTngChartResizeFrame(null)).toBe(true);
    expect(shouldScheduleTngChartResizeFrame(12)).toBe(false);
  });

  it('renders context options and updates without recreating the runtime', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ChartSurfaceContextHostComponent],
    }).createComponent(ChartSurfaceContextHostComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    await flushChartSurfaceEffects();

    expect(fixture.componentInstance.init).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.chart.setOption).toHaveBeenCalledTimes(1);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;
    button?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await flushChartSurfaceEffects();

    const setOption = vi.mocked(fixture.componentInstance.chart.setOption);
    const lastOption = setOption.mock.calls.at(-1)?.[0] as Readonly<Record<string, unknown>>;

    expect(fixture.componentInstance.init).toHaveBeenCalledTimes(1);
    expect(setOption).toHaveBeenCalledTimes(2);
    expect(lastOption['hiddenSeries']).toEqual(['revenue']);
  });

  it('skips runtime initialization when chart rendering is disabled', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ChartSurfaceContextHostComponent],
      providers: [{ provide: TNG_CHART_RENDERING_ENABLED, useValue: false }],
    }).createComponent(ChartSurfaceContextHostComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    await flushChartSurfaceEffects();

    expect(fixture.componentInstance.runtimeLoader).not.toHaveBeenCalled();
    expect(fixture.componentInstance.init).not.toHaveBeenCalled();
  });

  it('refreshes TailNG theme colors without recreating the ECharts instance', async () => {
    let values: Record<string, string> = {
      '--tng-semantic-accent-brand': '#2563eb',
    };

    vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string): string => values[name] ?? '',
    } as CSSStyleDeclaration);

    const fixture = TestBed.configureTestingModule({
      imports: [ChartSurfaceContextHostComponent],
    }).createComponent(ChartSurfaceContextHostComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    await flushChartSurfaceEffects();

    const setOption = vi.mocked(fixture.componentInstance.chart.setOption);
    const firstOption = setOption.mock.calls.at(-1)?.[0] as Readonly<Record<string, unknown>>;

    values = {
      '--tng-semantic-accent-brand': '#7c3aed',
    };
    globalThis.dispatchEvent(new Event(TNG_CHART_THEME_CHANGE_EVENT));
    await flushChartSurfaceEffects();

    const lastOption = setOption.mock.calls.at(-1)?.[0] as Readonly<Record<string, unknown>>;

    expect(fixture.componentInstance.init).toHaveBeenCalledTimes(1);
    expect(setOption).toHaveBeenCalledTimes(2);
    expect(firstOption['color']).toEqual(expect.arrayContaining(['#2563eb']));
    expect(lastOption['color']).toEqual(expect.arrayContaining(['#7c3aed']));
  });
});
