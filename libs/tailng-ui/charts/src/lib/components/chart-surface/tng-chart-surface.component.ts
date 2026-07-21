import {
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { TNG_CHART_CONTEXT, TNG_CHART_RENDERING_ENABLED } from '../../core/chart-context';
import { resolveTngChartTheme } from '../../core/chart-theme';
import { TNG_CHART_THEME_CHANGE_EVENT } from '../../core/chart-theme-events';
import type {
  TngChartHeight,
  TngChartInitOptions,
  TngChartInstance,
  TngChartOption,
  TngChartPointEvent,
  TngChartRenderer,
  TngChartRuntime,
  TngChartRuntimeLoader,
  TngChartTheme,
} from '../../core/chart.types';
import { resolveTngChartHeight } from '../../core/chart.utils';
import { createTngChartPointEvent } from '../../echarts/echarts-event.adapter';
import { createTngEchartsOption } from '../../echarts/echarts-option.factory';
import { loadTngEchartsRuntime } from '../../echarts/echarts.loader';

function booleanAttributeOrNull(value: boolean | string | null): boolean | null {
  return value === null ? null : booleanAttribute(value);
}

export function resolveTngChartRenderer(renderer: string): TngChartRenderer {
  return renderer === 'svg' ? 'svg' : 'canvas';
}

export function resolveTngChartNotMerge(merge: boolean): boolean {
  return !merge;
}

export function shouldAttachTngChartResizeObserver(
  autoResize: boolean,
  hasResizeObserverApi: boolean,
): boolean {
  return autoResize && hasResizeObserverApi;
}

export function shouldScheduleTngChartResizeFrame(resizeFrameId: number | null): boolean {
  return resizeFrameId === null;
}

@Component({
  selector: 'tng-chart-surface',
  templateUrl: './tng-chart-surface.component.html',
  styleUrl: './tng-chart-surface.component.css',
  host: {
    '[style.height]': 'heightStyle()',
  },
})
export class TngChartSurfaceComponent implements AfterViewInit, OnDestroy {
  public readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  public readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  public readonly autoResize = input<boolean | null, boolean | string | null>(null, {
    transform: booleanAttributeOrNull,
  });
  public readonly height = input<TngChartHeight | null>(null);
  public readonly lazyUpdate = input<boolean | null, boolean | string | null>(null, {
    transform: booleanAttributeOrNull,
  });
  public readonly loading = input<boolean | null, boolean | string | null>(null, {
    transform: booleanAttributeOrNull,
  });
  public readonly merge = input<boolean | null, boolean | string | null>(null, {
    transform: booleanAttributeOrNull,
  });
  public readonly option = input<TngChartOption | null>(null);
  public readonly renderer = input<TngChartRenderer | null>(null);
  public readonly runtimeLoader = input<TngChartRuntimeLoader | null>(null);
  public readonly theme = input<TngChartTheme | undefined>(undefined);

  public readonly chartReady = output<unknown>();
  public readonly pointClick = output<TngChartPointEvent>();
  public readonly pointHover = output<TngChartPointEvent>();
  public readonly ready = output<void>();
  public readonly runtimeError = output<string>();

  private readonly chartContext = inject(TNG_CHART_CONTEXT, { optional: true });
  private readonly chartRenderingEnabled = inject(TNG_CHART_RENDERING_ENABLED);
  private readonly hostRef = viewChild<ElementRef<HTMLElement>>('hostRef');
  private chart: TngChartInstance | null = null;
  private clickHandler: ((event: unknown) => void) | null = null;
  private hoverHandler: ((event: unknown) => void) | null = null;
  private resizeFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private themeChangeHandler: (() => void) | null = null;
  private activeRenderer: TngChartRenderer | null = null;
  private readonly hasResizeObserverApi = typeof ResizeObserver !== 'undefined';

  protected readonly resolvedAriaLabel = computed<string | null>(
    () => this.ariaLabel() ?? this.chartContext?.ariaLabel() ?? null,
  );
  protected readonly resolvedAriaLabelledby = computed<string | null>(
    () => this.ariaLabelledby() ?? this.chartContext?.ariaLabelledby() ?? null,
  );
  protected readonly resolvedAutoResize = computed<boolean>(
    () => this.autoResize() ?? this.chartContext?.autoResize() ?? true,
  );
  protected readonly resolvedHeight = computed<TngChartHeight>(
    () => this.height() ?? this.chartContext?.height() ?? 320,
  );
  protected readonly resolvedLazyUpdate = computed<boolean>(
    () => this.lazyUpdate() ?? this.chartContext?.lazyUpdate() ?? false,
  );
  protected readonly resolvedLoading = computed<boolean>(
    () => this.loading() ?? this.chartContext?.loading() ?? false,
  );
  protected readonly resolvedMerge = computed<boolean>(
    () => this.merge() ?? this.chartContext?.merge() ?? false,
  );
  protected readonly resolvedOption = computed<TngChartOption | null>(
    () => this.option() ?? this.chartContext?.option() ?? null,
  );
  protected readonly resolvedRenderer = computed<TngChartRenderer>(() =>
    resolveTngChartRenderer(this.renderer() ?? this.chartContext?.renderer() ?? 'canvas'),
  );
  protected readonly resolvedRuntimeLoader = computed<TngChartRuntimeLoader | null>(
    () => this.runtimeLoader() ?? this.chartContext?.runtimeLoader() ?? null,
  );
  protected readonly resolvedTheme = computed<TngChartTheme>(
    () => this.theme() ?? this.chartContext?.theme() ?? null,
  );
  protected readonly heightStyle = computed<string>(() =>
    resolveTngChartHeight(this.resolvedHeight()),
  );

  private readonly syncOptionEffect = effect((): void => {
    const option = this.resolvedOption();
    const merge = this.resolvedMerge();
    const lazyUpdate = this.resolvedLazyUpdate();
    this.applyOption(option, merge, lazyUpdate);
  });

  private readonly syncLoadingEffect = effect((): void => {
    this.setLoading(this.resolvedLoading());
  });

  private readonly syncResizeEffect = effect((): void => {
    this.updateResizeObservation(this.resolvedAutoResize());
  });

  private readonly syncRendererEffect = effect((): void => {
    const renderer = this.resolvedRenderer();
    if (this.chart !== null && this.activeRenderer !== null && renderer !== this.activeRenderer) {
      void this.recreateChart();
    }
  });

  public ngAfterViewInit(): void {
    if (!this.chartRenderingEnabled) {
      this.ready.emit();
      return;
    }

    this.listenForThemeChanges();
    void this.initializeChart();
  }

  public ngOnDestroy(): void {
    this.syncOptionEffect.destroy();
    this.syncLoadingEffect.destroy();
    this.syncResizeEffect.destroy();
    this.syncRendererEffect.destroy();
    this.stopListeningForThemeChanges();
    this.disconnectResizeObserver();
    this.disposeChart();
  }

  private applyOption(option: TngChartOption | null, merge: boolean, lazyUpdate: boolean): void {
    if (this.chart === null || option === null) {
      return;
    }

    this.chart.setOption(this.createThemedOption(option), {
      lazyUpdate,
      notMerge: resolveTngChartNotMerge(merge),
    });
  }

  private attachPointEvents(): void {
    if (this.chart?.on === undefined) {
      return;
    }

    this.detachPointEvents();

    this.clickHandler = (event: unknown): void => {
      this.pointClick.emit(createTngChartPointEvent(event));
    };
    this.hoverHandler = (event: unknown): void => {
      this.pointHover.emit(createTngChartPointEvent(event));
    };

    this.chart.on('click', this.clickHandler);
    this.chart.on('mouseover', this.hoverHandler);
  }

  private cancelScheduledResize(): void {
    if (this.resizeFrameId === null) {
      return;
    }

    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.resizeFrameId);
    }

    this.resizeFrameId = null;
  }

  private createThemedOption(option: TngChartOption): TngChartOption {
    return createTngEchartsOption(option, resolveTngChartTheme(this.hostRef()?.nativeElement));
  }

  private detachPointEvents(): void {
    if (this.chart?.off === undefined) {
      this.clickHandler = null;
      this.hoverHandler = null;
      return;
    }

    if (this.clickHandler !== null) {
      this.chart.off('click', this.clickHandler);
      this.clickHandler = null;
    }

    if (this.hoverHandler !== null) {
      this.chart.off('mouseover', this.hoverHandler);
      this.hoverHandler = null;
    }
  }

  private disconnectResizeObserver(): void {
    this.cancelScheduledResize();

    if (this.resizeObserver === null) {
      return;
    }

    this.resizeObserver.disconnect();
    this.resizeObserver = null;
  }

  private disposeChart(): void {
    if (this.chart === null) {
      return;
    }

    this.cancelScheduledResize();
    this.detachPointEvents();
    this.chart.dispose();
    this.chart = null;
    this.activeRenderer = null;
  }

  private async initializeChart(): Promise<void> {
    const hostElement = this.hostRef()?.nativeElement;
    if (hostElement === undefined) {
      return;
    }

    try {
      const runtime = await loadTngEchartsRuntime(this.resolvedRuntimeLoader());
      this.chart = this.initChart(runtime);
      this.applyOption(this.resolvedOption(), this.resolvedMerge(), this.resolvedLazyUpdate());
      this.setLoading(this.resolvedLoading());
      this.updateResizeObservation(this.resolvedAutoResize());
      this.attachPointEvents();
      this.chartReady.emit(this.chart);
      this.ready.emit();
    } catch (error: unknown) {
      this.runtimeError.emit(this.toErrorMessage(error));
    }
  }

  private listenForThemeChanges(): void {
    if (this.themeChangeHandler !== null || typeof globalThis.addEventListener !== 'function') {
      return;
    }

    this.themeChangeHandler = (): void => {
      this.refreshTheme();
    };

    globalThis.addEventListener(TNG_CHART_THEME_CHANGE_EVENT, this.themeChangeHandler);
  }

  private refreshTheme(): void {
    this.applyOption(this.resolvedOption(), this.resolvedMerge(), this.resolvedLazyUpdate());

    if (this.chart !== null) {
      this.scheduleResize(this.chart);
    }
  }

  private initChart(runtime: TngChartRuntime): TngChartInstance {
    const hostElement = this.hostRef()?.nativeElement;
    if (hostElement === undefined) {
      throw new Error('Chart host element is not available.');
    }

    const initOptions: TngChartInitOptions = {
      renderer: this.resolvedRenderer(),
    };
    const chart = runtime.init(hostElement, this.resolvedTheme(), initOptions);
    this.activeRenderer = initOptions.renderer ?? 'canvas';
    return chart;
  }

  private async recreateChart(): Promise<void> {
    this.disconnectResizeObserver();
    this.disposeChart();
    await this.initializeChart();
  }

  private scheduleResize(chart: TngChartInstance): void {
    if (!shouldScheduleTngChartResizeFrame(this.resizeFrameId)) {
      return;
    }

    if (typeof requestAnimationFrame === 'undefined') {
      chart.resize();
      return;
    }

    this.resizeFrameId = requestAnimationFrame((): void => {
      this.resizeFrameId = null;
      chart.resize();
    });
  }

  private setLoading(loading: boolean): void {
    if (this.chart === null) {
      return;
    }

    if (loading) {
      this.chart.showLoading?.();
      return;
    }

    this.chart.hideLoading?.();
  }

  private stopListeningForThemeChanges(): void {
    if (this.themeChangeHandler === null || typeof globalThis.removeEventListener !== 'function') {
      this.themeChangeHandler = null;
      return;
    }

    globalThis.removeEventListener(TNG_CHART_THEME_CHANGE_EVENT, this.themeChangeHandler);
    this.themeChangeHandler = null;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown ECharts runtime error.';
  }

  private updateResizeObservation(autoResize: boolean): void {
    if (!shouldAttachTngChartResizeObserver(autoResize, this.hasResizeObserverApi)) {
      this.disconnectResizeObserver();
      return;
    }

    const chart = this.chart;
    const hostElement = this.hostRef()?.nativeElement;
    if (chart === null || hostElement === undefined) {
      return;
    }

    this.resizeObserver ??= new ResizeObserver((): void => {
      this.scheduleResize(chart);
    });

    this.resizeObserver.disconnect();
    this.resizeObserver.observe(hostElement);
  }
}
