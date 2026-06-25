import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TngStepperItem,
  TngStepperLabel,
  TngStepperTrigger,
} from '@tailng-ui/primitives';
import { describe, expect, it } from 'vitest';
import {
  TngStepperComponent,
  TngStepperItemComponent,
  type TngStepperStep,
} from '../tng-stepper.component';

@Component({
  imports: [TngStepperComponent],
  template: `
    <tng-stepper [ariaLabel]="ariaLabel()" data-testid="wrapper">
      <ol data-testid="projected-list">
        <li>Draft</li>
        <li>Review</li>
      </ol>
    </tng-stepper>
  `,
})
class StepperWrapperHostComponent {
  public readonly ariaLabel = signal('Release flow');
}

@Component({
  imports: [TngStepperComponent],
  template: `
    <h2 id="release-heading">Release flow</h2>
    <tng-stepper [ariaLabelledby]="labelledby()" data-testid="wrapper-labelled">
      <ol>
        <li>Draft</li>
      </ol>
    </tng-stepper>
  `,
})
class StepperWrapperLabelledbyHostComponent {
  public readonly labelledby = signal('release-heading');
}

@Component({
  imports: [TngStepperComponent],
  template: `
    <tng-stepper data-testid="wrapper-default">
      <ol>
        <li>One</li>
      </ol>
    </tng-stepper>
  `,
})
class StepperWrapperDefaultHostComponent {}

@Component({
  imports: [TngStepperComponent, TngStepperItem, TngStepperLabel, TngStepperTrigger],
  template: `
    <tng-stepper
      data-testid="wrapper-headless"
      defaultValue="review"
      linear
      (valueChange)="valueChanges.push($event)"
    >
      <ol>
        <li tngStepperItem value="draft" label="Draft" completed>
          <button tngStepperTrigger data-testid="trigger-draft">
            <span tngStepperLabel>Draft</span>
          </button>
        </li>
        <li tngStepperItem value="review" label="Review">
          <button tngStepperTrigger data-testid="trigger-review">
            <span tngStepperLabel>Review</span>
          </button>
        </li>
        <li tngStepperItem value="publish" label="Publish">
          <button tngStepperTrigger data-testid="trigger-publish">
            <span tngStepperLabel>Publish</span>
          </button>
        </li>
      </ol>
    </tng-stepper>
  `,
})
class StepperWrapperHeadlessHostComponent {
  public readonly valueChanges: unknown[] = [];
}

@Component({
  imports: [TngStepperComponent],
  template: `
    <tng-stepper
      data-testid="wrapper-steps"
      defaultValue="shipping"
      linear
      [steps]="steps()"
      (valueChange)="valueChanges.push($event)"
    />
  `,
})
class StepperWrapperStepsHostComponent {
  public readonly steps = signal<readonly TngStepperStep[]>([
    { value: 'cart', label: 'Cart', completed: true },
    { value: 'shipping', label: 'Shipping', description: 'Choose a delivery address' },
    { value: 'payment', label: 'Payment' },
  ]);
  public readonly valueChanges: unknown[] = [];
}

@Component({
  imports: [TngStepperComponent],
  template: `
    <tng-stepper
      data-testid="wrapper-horizontal-steps"
      orientation="horizontal"
      defaultValue="shipping"
      [steps]="steps()"
    />
  `,
})
class StepperWrapperHorizontalStepsHostComponent {
  public readonly steps = signal<readonly TngStepperStep[]>([
    { value: 'cart', label: 'Cart', completed: true },
    { value: 'shipping', label: 'Shipping', description: 'Choose a delivery address' },
    { value: 'payment', label: 'Payment' },
  ]);
}

@Component({
  imports: [TngStepperComponent, TngStepperItemComponent],
  template: `
    <tng-stepper data-testid="wrapper-items" defaultValue="shipping">
      <tng-stepper-item value="cart" label="Cart" completed />
      <tng-stepper-item value="shipping" label="Shipping" />
      <tng-stepper-item value="payment" label="Payment" />
    </tng-stepper>
  `,
})
class StepperWrapperItemsHostComponent {}

@Component({
  imports: [TngStepperComponent, TngStepperItemComponent],
  template: `
    <tng-stepper data-testid="wrapper-horizontal-items" orientation="horizontal" defaultValue="shipping">
      <tng-stepper-item value="cart" label="Cart" completed />
      <tng-stepper-item value="shipping" label="Shipping" />
      <tng-stepper-item value="payment" label="Payment" optional />
    </tng-stepper>
  `,
})
class StepperWrapperHorizontalItemsHostComponent {}

function click(el: HTMLElement): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
}

describe('tng-stepper component', () => {
  it('exports the stepper component', () => {
    expect(typeof TngStepperComponent).toBe('function');
  });

  it('exports the stepper item component', () => {
    expect(typeof TngStepperItemComponent).toBe('function');
  });

  it('applies wrapper class and primitive root hooks on the host', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperHostComponent],
    }).createComponent(StepperWrapperHostComponent);
    fixture.detectChanges();

    const stepper = fixture.nativeElement.querySelector('[data-testid="wrapper"]') as HTMLElement | null;

    expect(stepper).toBeTruthy();
    expect(stepper?.classList.contains('tng-stepper')).toBe(true);
    expect(stepper?.getAttribute('data-slot')).toBe('stepper');
    expect(stepper?.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('uses "Stepper" as the default aria-label', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperDefaultHostComponent],
    }).createComponent(StepperWrapperDefaultHostComponent);
    fixture.detectChanges();

    const stepper = fixture.nativeElement.querySelector('[data-testid="wrapper-default"]') as HTMLElement | null;

    expect(stepper).toBeTruthy();
    expect(stepper?.getAttribute('aria-label')).toBe('Stepper');
  });

  it('forwards ariaLabel input and updates when input signal changes', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperHostComponent],
    }).createComponent(StepperWrapperHostComponent);
    fixture.detectChanges();

    const stepper = fixture.nativeElement.querySelector('[data-testid="wrapper"]') as HTMLElement | null;
    expect(stepper).toBeTruthy();
    expect(stepper?.getAttribute('aria-label')).toBe('Release flow');

    fixture.componentInstance.ariaLabel.set('Checkout steps');
    fixture.detectChanges();

    expect(stepper?.getAttribute('aria-label')).toBe('Checkout steps');
  });

  it('forwards ariaLabelledby and suppresses default aria-label', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperLabelledbyHostComponent],
    }).createComponent(StepperWrapperLabelledbyHostComponent);
    fixture.detectChanges();

    const stepper = fixture.nativeElement.querySelector('[data-testid="wrapper-labelled"]') as HTMLElement | null;
    expect(stepper).toBeTruthy();
    expect(stepper?.getAttribute('aria-labelledby')).toBe('release-heading');
    expect(stepper?.hasAttribute('aria-label')).toBe(false);
  });

  it('projects inner step markup into the wrapper', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperHostComponent],
    }).createComponent(StepperWrapperHostComponent);
    fixture.detectChanges();

    const projectedList = fixture.nativeElement.querySelector(
      '[data-testid="wrapper"] [data-testid="projected-list"]',
    ) as HTMLOListElement | null;

    expect(projectedList).toBeTruthy();
    expect(projectedList?.querySelectorAll('li').length).toBe(2);
    expect(projectedList?.textContent).toContain('Draft');
    expect(projectedList?.textContent).toContain('Review');
  });

  it('uses the headless stepper primitive for projected step items', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperHeadlessHostComponent],
    }).createComponent(StepperWrapperHeadlessHostComponent);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('[data-testid="wrapper-headless"]') as HTMLElement | null;
    const draft = fixture.nativeElement.querySelector('[data-testid="trigger-draft"]') as HTMLButtonElement | null;
    const review = fixture.nativeElement.querySelector('[data-testid="trigger-review"]') as HTMLButtonElement | null;
    const publish = fixture.nativeElement.querySelector('[data-testid="trigger-publish"]') as HTMLButtonElement | null;

    expect(wrapper?.getAttribute('data-linear')).toBe('');
    expect(draft?.getAttribute('data-state')).toBe('completed');
    expect(review?.getAttribute('aria-current')).toBe('step');
    expect(review?.getAttribute('tabindex')).toBe('0');
    expect(publish?.getAttribute('aria-disabled')).toBe('true');

    click(publish!);
    fixture.detectChanges();
    expect(fixture.componentInstance.valueChanges).toEqual([]);

    click(draft!);
    fixture.detectChanges();
    expect(fixture.componentInstance.valueChanges).toEqual(['draft']);
  });

  it('renders styled headless items from the steps input', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperStepsHostComponent],
    }).createComponent(StepperWrapperStepsHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const wrapper = host.querySelector('[data-testid="wrapper-steps"]');
    const items = Array.from(
      host.querySelectorAll<HTMLElement>('[data-testid="wrapper-steps"] tng-stepper-item'),
    );
    const triggers = Array.from(
      host.querySelectorAll<HTMLButtonElement>('[data-testid="wrapper-steps"] [data-slot="stepper-trigger"]'),
    );
    const paymentTrigger = triggers[2];

    expect(wrapper?.getAttribute('data-linear')).toBe('');
    expect(items.length).toBe(3);
    expect(items[0]?.getAttribute('data-state')).toBe('completed');
    expect(items[1]?.getAttribute('data-state')).toBe('current');
    expect(items[1]?.textContent).toContain('Choose a delivery address');
    expect(triggers[1]?.getAttribute('aria-current')).toBe('step');
    expect(paymentTrigger?.getAttribute('aria-disabled')).toBe('true');

    click(paymentTrigger);
    fixture.detectChanges();

    expect(fixture.componentInstance.valueChanges).toEqual([]);
  });

  it('applies horizontal orientation hooks to generated styled steps', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperHorizontalStepsHostComponent],
    }).createComponent(StepperWrapperHorizontalStepsHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const wrapper = host.querySelector('[data-testid="wrapper-horizontal-steps"]');
    const list = host.querySelector('[data-testid="wrapper-horizontal-steps"] .tng-stepper__list');
    const items = Array.from(
      host.querySelectorAll<HTMLElement>('[data-testid="wrapper-horizontal-steps"] tng-stepper-item'),
    );

    expect(wrapper?.getAttribute('data-orientation')).toBe('horizontal');
    expect(wrapper?.classList.contains('tng-stepper--projected-items')).toBe(false);
    expect(list).toBeTruthy();
    expect(items.length).toBe(3);
    expect(items[0]?.getAttribute('data-state')).toBe('completed');
    expect(items[1]?.getAttribute('data-state')).toBe('current');
    expect(items[2]?.getAttribute('data-state')).toBe('upcoming');
  });

  it('supports declarative styled stepper item children', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperItemsHostComponent],
    }).createComponent(StepperWrapperItemsHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const items = Array.from(
      host.querySelectorAll<HTMLElement>('[data-testid="wrapper-items"] tng-stepper-item'),
    );
    const triggers = Array.from(
      host.querySelectorAll<HTMLButtonElement>('[data-testid="wrapper-items"] [data-slot="stepper-trigger"]'),
    );

    expect(items.length).toBe(3);
    expect(items[0]?.getAttribute('data-state')).toBe('completed');
    expect(items[1]?.getAttribute('data-state')).toBe('current');
    expect(items[2]?.getAttribute('data-state')).toBe('upcoming');
    expect(triggers[1]?.getAttribute('aria-current')).toBe('step');
    expect(
      triggers.map((trigger) => trigger.querySelector('[data-slot="stepper-label"]')?.textContent?.trim()),
    ).toEqual(['Cart', 'Shipping', 'Payment']);
  });

  it('marks direct projected styled item children for horizontal host layout', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [StepperWrapperHorizontalItemsHostComponent],
    }).createComponent(StepperWrapperHorizontalItemsHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const wrapper = host.querySelector('[data-testid="wrapper-horizontal-items"]');
    const items = Array.from(
      host.querySelectorAll<HTMLElement>('[data-testid="wrapper-horizontal-items"] tng-stepper-item'),
    );
    const triggers = Array.from(
      host.querySelectorAll<HTMLButtonElement>('[data-testid="wrapper-horizontal-items"] [data-slot="stepper-trigger"]'),
    );

    expect(wrapper?.getAttribute('data-orientation')).toBe('horizontal');
    expect(wrapper?.classList.contains('tng-stepper--projected-items')).toBe(true);
    expect(items.length).toBe(3);
    expect(items[0]?.getAttribute('data-state')).toBe('completed');
    expect(items[1]?.getAttribute('data-state')).toBe('current');
    expect(items[2]?.getAttribute('data-state')).toBe('upcoming');
    expect(items[2]?.hasAttribute('data-optional')).toBe(true);
    expect(triggers[1]?.getAttribute('aria-current')).toBe('step');
  });
});
