import { booleanAttribute, computed, Directive, HostBinding, inject, input } from '@angular/core';

function normalizeFiniteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function normalizeTngProgressBarMin(value: number): number {
  return normalizeFiniteNumber(value, 0);
}

export function normalizeTngProgressBarMax(value: number): number {
  return normalizeFiniteNumber(value, 100);
}

export function resolveTngProgressBarRange(
  min: number,
  max: number,
  value: number,
): Readonly<{
  max: number;
  min: number;
  value: number;
}> {
  const resolvedMin = normalizeTngProgressBarMin(min);
  const resolvedMax = Math.max(normalizeTngProgressBarMax(max), resolvedMin);
  const normalizedValue = normalizeFiniteNumber(value, resolvedMin);
  const resolvedValue = Math.min(Math.max(normalizedValue, resolvedMin), resolvedMax);

  return Object.freeze({
    max: resolvedMax,
    min: resolvedMin,
    value: resolvedValue,
  });
}

@Directive({
  selector: '[tngProgressBar]',
  exportAs: 'tngProgressBar',
})
export class TngProgressBar {
  public readonly ariaValueText = input<string | null>(null);
  public readonly indeterminate = input<boolean, boolean | string>(false, {
    transform: booleanAttribute,
  });
  public readonly max = input<number, number | string>(100, {
    transform: (value: number | string): number =>
      normalizeTngProgressBarMax(typeof value === 'number' ? value : Number(value)),
  });
  public readonly min = input<number, number | string>(0, {
    transform: (value: number | string): number =>
      normalizeTngProgressBarMin(typeof value === 'number' ? value : Number(value)),
  });
  public readonly value = input<number, number | string>(0, {
    transform: (value: number | string): number =>
      typeof value === 'number' ? value : Number(value),
  });

  public readonly range = computed(() =>
    resolveTngProgressBarRange(this.min(), this.max(), this.value()),
  );

  public readonly percent = computed(() => {
    const range = this.range();
    const denominator = range.max - range.min;
    return denominator <= 0 ? 100 : ((range.value - range.min) / denominator) * 100;
  });

  @HostBinding('attr.aria-valuemax')
  protected get ariaValueMaxAttr(): string | null {
    if (this.indeterminate()) {
      return null;
    }

    return String(this.range().max);
  }

  @HostBinding('attr.aria-valuemin')
  protected get ariaValueMinAttr(): string | null {
    if (this.indeterminate()) {
      return null;
    }

    return String(this.range().min);
  }

  @HostBinding('attr.aria-valuenow')
  protected get ariaValueNowAttr(): string | null {
    if (this.indeterminate()) {
      return null;
    }

    return String(this.range().value);
  }

  @HostBinding('attr.aria-valuetext')
  protected get ariaValueTextAttr(): string | null {
    return this.ariaValueText();
  }

  @HostBinding('attr.data-indeterminate')
  protected get dataIndeterminateAttr(): '' | null {
    return this.indeterminate() ? '' : null;
  }

  @HostBinding('attr.data-state')
  protected get dataStateAttr(): 'determinate' | 'indeterminate' {
    return this.indeterminate() ? 'indeterminate' : 'determinate';
  }

  @HostBinding('attr.data-slot')
  protected readonly dataSlot = 'progress-bar' as const;

  @HostBinding('attr.role')
  protected readonly roleAttr = 'progressbar' as const;
}

@Directive({
  selector: '[tngProgressBarIndicator]',
  exportAs: 'tngProgressBarIndicator',
})
export class TngProgressBarIndicator {
  private readonly progressBar = inject(TngProgressBar, { optional: true, skipSelf: true });

  @HostBinding('attr.data-indeterminate')
  protected get dataIndeterminateAttr(): '' | null {
    return this.progressBar?.indeterminate() ? '' : null;
  }

  @HostBinding('attr.data-slot')
  protected readonly dataSlot = 'progress-bar-indicator' as const;

  @HostBinding('attr.data-state')
  protected get dataStateAttr(): 'determinate' | 'indeterminate' | null {
    if (this.progressBar === null) {
      return null;
    }

    return this.progressBar.indeterminate() ? 'indeterminate' : 'determinate';
  }
}
