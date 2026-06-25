import { booleanAttribute, Component, HostBinding, contentChildren, inject, input } from '@angular/core';
import {
  TngStepper as TngStepperPrimitive,
  TngStepperDescription,
  TngStepperItem as TngStepperItemPrimitive,
  TngStepperLabel,
  TngStepperTrigger,
  type TngStepperValue,
} from '@tailng-ui/primitives';

export type TngStepperStep = Readonly<{
  value: TngStepperValue;
  label: string;
  description?: string | null;
  completed?: boolean;
  optional?: boolean;
  disabled?: boolean;
  error?: boolean;
}>;

@Component({
  selector: 'tng-stepper-item',
  hostDirectives: [
    {
      directive: TngStepperItemPrimitive,
      inputs: ['value', 'completed', 'optional', 'disabled', 'error', 'label', 'description'],
    },
  ],
  imports: [TngStepperDescription, TngStepperLabel, TngStepperTrigger],
  template: `
    <button tngStepperTrigger class="tng-stepper__trigger">
      <span class="tng-stepper__marker" aria-hidden="true">
        @if (item.completed()) {
          <span class="tng-stepper__check">✓</span>
        }
      </span>
      <span class="tng-stepper__copy">
        <span tngStepperLabel class="tng-stepper__label">{{ item.label() }}</span>
        @if (item.description() !== null && item.description() !== undefined) {
          <span tngStepperDescription class="tng-stepper__description">{{ item.description() }}</span>
        }
      </span>
    </button>
    <ng-content />
  `,
  styles: `
    :host {
      background: var(--tng-semantic-background-surface);
      border: 1px solid var(--tng-semantic-border-subtle);
      border-radius: var(--tng-radius-panel, 0.75rem);
      color: var(--tng-semantic-foreground-primary);
      counter-increment: tng-stepper-item;
      display: block;
      min-height: var(--tng-control-height-md, 2.5rem);
      min-width: 0;
      transition:
        background-color var(--tng-duration-normal, 150ms) var(--tng-easing, ease),
        border-color     var(--tng-duration-normal, 150ms) var(--tng-easing, ease),
        color            var(--tng-duration-normal, 150ms) var(--tng-easing, ease),
        opacity          var(--tng-duration-normal, 150ms) var(--tng-easing, ease);
    }

    :host-context(tng-stepper[data-orientation='horizontal']) {
      flex: 1 1 8.5rem;
      min-width: min(100%, 8.5rem);
    }

    :host([data-state='current']) {
      background: color-mix(in srgb, var(--tng-semantic-accent-brand) 12%, var(--tng-semantic-background-surface));
      border-color: var(--tng-semantic-accent-brand);
    }

    :host([data-state='completed']) {
      background: color-mix(in srgb, var(--tng-semantic-accent-success) 10%, var(--tng-semantic-background-surface));
      border-color: var(--tng-semantic-accent-success);
    }

    :host([data-state='error']) {
      background: color-mix(in srgb, var(--tng-semantic-accent-danger) 10%, var(--tng-semantic-background-surface));
      border-color: var(--tng-semantic-accent-danger);
    }

    :host([data-state='disabled']) {
      opacity: var(--tng-disabled-opacity, 0.55);
    }

    .tng-stepper__trigger {
      align-items: center;
      background: transparent;
      border: 0;
      color: inherit;
      cursor: pointer;
      display: flex;
      font: inherit;
      gap: 0.65rem;
      min-height: var(--tng-control-height-md, 2.5rem);
      padding: 0.55rem 0.75rem;
      text-align: start;
      width: 100%;
    }

    .tng-stepper__trigger[aria-disabled='true'] {
      cursor: not-allowed;
    }

    .tng-stepper__trigger:focus-visible {
      border-radius: 0.55rem;
      box-shadow: var(--tng-focus-ring, 0 0 0 3px var(--tng-semantic-focus-ring));
      outline: none;
    }

    .tng-stepper__marker {
      align-items: center;
      border: 1px solid var(--tng-semantic-border-subtle);
      border-radius: 999px;
      color: var(--tng-semantic-foreground-secondary);
      display: inline-flex;
      flex: 0 0 auto;
      font-size: 0.75rem;
      font-weight: 700;
      height: 1.45rem;
      justify-content: center;
      min-width: 1.45rem;
      padding-inline: 0.3rem;
    }

    .tng-stepper__marker::before {
      content: counter(tng-stepper-item);
    }

    :host([data-state='completed']) .tng-stepper__marker::before {
      content: '';
    }

    :host([data-state='current']) .tng-stepper__marker {
      border-color: var(--tng-semantic-accent-brand);
      color: var(--tng-semantic-accent-brand);
    }

    :host([data-state='completed']) .tng-stepper__marker {
      border-color: var(--tng-semantic-accent-success);
      color: var(--tng-semantic-accent-success);
    }

    :host([data-state='error']) .tng-stepper__marker {
      border-color: var(--tng-semantic-accent-danger);
      color: var(--tng-semantic-accent-danger);
    }

    .tng-stepper__copy {
      display: grid;
      gap: 0.1rem;
      min-width: 0;
    }

    .tng-stepper__label {
      font-weight: 600;
      line-height: 1.25;
    }

    .tng-stepper__description {
      color: var(--tng-semantic-foreground-secondary);
      font-size: var(--tng-text-sm, 0.8125rem);
      line-height: 1.35;
    }
  `,
  exportAs: 'tngStepperItemComponent',
})
export class TngStepperItemComponent {
  protected readonly item = inject(TngStepperItemPrimitive);
}

@Component({
  selector: 'tng-stepper',
  host: {
    class: 'tng-stepper',
  },
  imports: [TngStepperItemComponent],
  hostDirectives: [
    {
      directive: TngStepperPrimitive,
      inputs: ['value', 'defaultValue', 'orientation', 'linear', 'loopFocus'],
      outputs: ['valueChange', 'stepChange'],
    },
  ],
  templateUrl: './tng-stepper.component.html',
  styleUrl: './tng-stepper.component.css',
})
export class TngStepperComponent {
  private readonly projectedItems = contentChildren(TngStepperItemComponent, { descendants: false });

  public readonly steps = input<readonly TngStepperStep[] | null>(null);
  public readonly ariaLabel = input<string | null>('Stepper');
  public readonly ariaLabelledby = input<string | null>(null);
  public readonly ordered = input(true, { transform: booleanAttribute });

  @HostBinding('attr.aria-label')
  protected get hostAriaLabel(): string | null {
    return this.ariaLabelledby() === null ? this.ariaLabel() : null;
  }

  @HostBinding('attr.aria-labelledby')
  protected get hostAriaLabelledby(): string | null {
    return this.ariaLabelledby();
  }

  @HostBinding('class.tng-stepper--projected-items')
  protected get hasProjectedItems(): boolean {
    return this.renderedSteps.length === 0 && this.projectedItems().length > 0;
  }

  protected get renderedSteps(): readonly TngStepperStep[] {
    return this.steps() ?? [];
  }

}
