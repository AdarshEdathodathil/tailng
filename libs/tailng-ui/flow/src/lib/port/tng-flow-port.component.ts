import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { resolveTngFlowValidationSeverity } from '../model/tng-flow-issue-index';
import type {
  TngFlowValidationIssue,
  TngFlowValidationSeverity,
} from '../types/tng-flow-validation.types';
import type { TngFlowPortDirection, TngFlowPortKind } from '../types/tng-flow.types';
import { TngFlowValidationBadgeComponent } from '../validation-badge/tng-flow-validation-badge.component';

@Component({
  selector: 'tng-flow-port',
  imports: [TngFlowValidationBadgeComponent],
  templateUrl: './tng-flow-port.component.html',
  styleUrl: './tng-flow-port.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-direction]': 'direction()',
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[attr.data-kind]': 'kind()',
    '[attr.data-validation]': 'resolvedValidationSeverity()',
    '[attr.aria-invalid]': "resolvedValidationSeverity() === 'error' ? 'true' : null",
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
  },
})
export class TngFlowPortComponent {
  public readonly direction = input.required<TngFlowPortDirection>();
  public readonly kind = input<TngFlowPortKind>('data');
  public readonly label = input<string | null>(null);
  public readonly required = input(false);
  public readonly disabled = input(false);
  public readonly validationSeverity = input<TngFlowValidationSeverity | null>(null);
  public readonly validationIssues = input<readonly TngFlowValidationIssue[]>([]);
  public readonly issueActivated = output<TngFlowValidationIssue>();

  protected readonly resolvedValidationSeverity = computed(() =>
    resolveTngFlowValidationSeverity(this.validationIssues()) ?? this.validationSeverity(),
  );

  protected activateIssue(issue: TngFlowValidationIssue): void {
    this.issueActivated.emit(issue);
  }
}
