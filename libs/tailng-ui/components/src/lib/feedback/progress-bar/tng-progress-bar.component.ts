import { booleanAttribute, Component, input } from '@angular/core';
import {
  normalizeTngProgressBarMax,
  normalizeTngProgressBarMin,
  resolveTngProgressBarRange,
  TngProgressBar as TngProgressBarPrimitive,
  TngProgressBarIndicator,
} from '@tailng-ui/primitives';

export function toTngProgressBarPercent(min: number, max: number, value: number): number {
  const range = resolveTngProgressBarRange(min, max, value);
  const denominator = range.max - range.min;
  if (denominator <= 0) {
    return 100;
  }

  return ((range.value - range.min) / denominator) * 100;
}

@Component({
  selector: 'tng-progress-bar',
  imports: [TngProgressBarPrimitive, TngProgressBarIndicator],
  templateUrl: './tng-progress-bar.component.html',
  styleUrl: './tng-progress-bar.component.css',
})
export class TngProgressBarComponent {
  public readonly ariaLabel = input<string | null>(null);
  public readonly ariaLabelledby = input<string | null>(null);
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
}
export { TngProgressBarComponent as TngProgressBar };
