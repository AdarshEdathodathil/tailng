import { Component, computed, input } from '@angular/core';
import { TngProgressBarComponent, TngCardComponent } from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';

export type TngFlowStatusTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

const statusTones: Readonly<Record<string, TngFlowStatusTone>> = {
  'awaiting-input': 'warning',
  cancelled: 'danger',
  completed: 'success',
  failed: 'danger',
  paused: 'warning',
  retrying: 'info',
  running: 'info',
  waiting: 'warning',
};

export function resolveTngFlowStatusTone(status: string): TngFlowStatusTone {
  return statusTones[status] ?? 'neutral';
}

@Component({
  selector: 'tng-flow-node',
  imports: [TngCardComponent, TngIcon, TngProgressBarComponent],
  templateUrl: './tng-flow-node.component.html',
  styleUrl: './tng-flow-node.component.css',
})
export class TngFlowNodeComponent {
  public readonly name = input.required<string>();
  public readonly description = input<string | null>(null);
  public readonly icon = input<string | null>(null);
  public readonly status = input<string>('idle');
  public readonly progress = input<number | null>(null);
  public readonly invalid = input(false);
  public readonly message = input<string | null>(null);

  protected readonly statusTone = computed<TngFlowStatusTone>(() =>
    resolveTngFlowStatusTone(this.status()),
  );
  protected readonly cardTone = computed<'danger' | 'neutral'>(() =>
    this.invalid() || this.status() === 'failed' ? 'danger' : 'neutral',
  );
  protected readonly showProgress = computed<boolean>(
    () => this.progress() !== null || this.status() === 'running' || this.status() === 'retrying',
  );
  protected readonly normalizedProgress = computed<number>(() => {
    const value = this.progress();
    if (value === null || !Number.isFinite(value)) {
      return 0;
    }

    return Math.min(100, Math.max(0, value));
  });
}
