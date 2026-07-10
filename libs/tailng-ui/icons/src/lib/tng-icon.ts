import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TNG_ICON_RESOLVER, type TngIconResolver } from './icons';
import { bindIconSvgEffect } from './tng-icon.loader-effect';
import { normalizeIconSize, normalizeOptionalString } from './tng-icon.normalizers';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--tng-icon-size]': 'size()',
    class: 'tng-icon',
  },
  imports: [NgIcon],
  selector: 'tng-icon',
  standalone: true,
  styleUrl: './tng-icon.css',
  templateUrl: './tng-icon.html',
})
export class TngIcon {
  public readonly icon = input.required<string>();
  public readonly label = input<string | null, string | null | undefined>(null, {
    transform: normalizeOptionalString,
  });
  public readonly size = input<string | null, string | number | null | undefined>(null, {
    transform: normalizeIconSize,
  });
  private readonly iconResolver: TngIconResolver = inject(TNG_ICON_RESOLVER);
  private readonly svgSignal = signal<string | null>(null);

  public constructor() {
    bindIconSvgEffect(this.icon, this.iconResolver, (value): void => {
      this.svgSignal.set(value);
    });
  }

  protected readonly iconAriaHidden = computed<'true' | null>(() =>
    this.label() === null ? 'true' : null,
  );

  protected readonly iconAriaLabel = computed<string | null>(() => this.label());

  protected readonly iconRole = computed<'img' | null>(() =>
    this.label() === null ? null : 'img',
  );

  protected readonly hasSvg = computed<boolean>(() => this.svgSignal() !== null);
  protected readonly svg = computed<string>(() => this.svgSignal() ?? '');
}
