import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TngFlowPortDirection, TngFlowPortKind } from '../types/tng-flow.types';

@Component({
  selector: 'tng-flow-port',
  templateUrl: './tng-flow-port.component.html',
  styleUrl: './tng-flow-port.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-direction]': 'direction()',
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[attr.data-kind]': 'kind()',
  },
})
export class TngFlowPortComponent {
  public readonly direction = input.required<TngFlowPortDirection>();
  public readonly kind = input<TngFlowPortKind>('data');
  public readonly label = input<string | null>(null);
  public readonly required = input(false);
  public readonly disabled = input(false);
}
