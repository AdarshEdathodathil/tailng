import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  TngStepper,
  TngStepperConnector,
  TngStepperDescription,
  TngStepperItem,
  TngStepperLabel,
  TngStepperTrigger,
} from '@tailng-ui/primitives';
import type { DocsExampleCodeTab } from '../../../../../../shared/example-panel/docs-example-panel.component';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';

@Component({
  selector: 'app-headless-stepper-examples-page',
  imports: [
    TngStepper,
    TngStepperConnector,
    TngStepperDescription,
    TngStepperItem,
    TngStepperLabel,
    TngStepperTrigger,
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
  ],
  templateUrl: './stepper-examples-page.component.html',
  styleUrls: ['./stepper-examples-page.component.css'],
})
export class HeadlessStepperExamplesPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly horizontalPlainCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'headless-stepper-horizontal.component.html',
      code: [
        '<section tngStepper orientation="horizontal" defaultValue="plan" ariaLabel="Horizontal onboarding progress">',
        '  <ol class="headless-stepper-horizontal-list">',
        '    <li tngStepperItem value="account" label="Account" completed class="headless-stepper-horizontal-item">',
        '      <button tngStepperTrigger class="headless-stepper-horizontal-trigger">',
        '        <span class="dot">1</span><span tngStepperLabel>Account</span>',
        '      </button>',
        '      <span tngStepperConnector class="horizontal-connector"></span>',
        '    </li>',
        '    <li tngStepperItem value="plan" label="Plan" class="headless-stepper-horizontal-item">',
        '      <button tngStepperTrigger class="headless-stepper-horizontal-trigger">',
        '        <span class="dot">2</span>',
        '        <span tngStepperLabel>Plan</span>',
        '        <span tngStepperDescription>Choose workspace limits</span>',
        '      </button>',
        '      <span tngStepperConnector class="horizontal-connector"></span>',
        '    </li>',
        '    <li tngStepperItem value="invite" label="Invite" optional class="headless-stepper-horizontal-item">',
        '      <button tngStepperTrigger class="headless-stepper-horizontal-trigger">',
        '        <span class="dot">3</span>',
        '        <span tngStepperLabel>Invite</span>',
        '        <span tngStepperDescription>Optional team setup</span>',
        '      </button>',
        '    </li>',
        '  </ol>',
        '</section>',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'headless-stepper-horizontal.component.css',
      code: [
        '.headless-stepper-horizontal-list {',
        '  display: flex;',
        '  flex-wrap: wrap;',
        '  gap: 0.75rem;',
        '  list-style: none;',
        '  margin: 0;',
        '  padding: 0;',
        '}',
        '',
        '.headless-stepper-horizontal-item {',
        '  align-items: center;',
        '  border: 1px solid var(--tng-semantic-border-subtle);',
        '  border-radius: 0.7rem;',
        '  display: flex;',
        '  flex: 1 1 10rem;',
        '  gap: 0.65rem;',
        '  min-width: min(100%, 10rem);',
        '  padding: 0.45rem 0.75rem;',
        '}',
        '',
        '.horizontal-connector {',
        '  background: currentColor;',
        '  display: block;',
        '  flex: 1 1 2rem;',
        '  height: 1px;',
        '  opacity: 0.35;',
        '}',
      ].join('\n'),
    },
  ]);

  protected readonly horizontalTailwindCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'headless-stepper-horizontal-tailwind.component.html',
      code: [
        '<section tngStepper orientation="horizontal" defaultValue="plan" ariaLabel="Horizontal onboarding progress">',
        '  <ol class="flex flex-wrap items-start gap-3">',
        '    <li tngStepperItem value="account" label="Account" completed class="flex min-w-36 flex-1 items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">',
        '      <button tngStepperTrigger class="inline-flex items-center gap-2 text-left">',
        '        <span tngStepperLabel>Account</span>',
        '      </button>',
        '      <span tngStepperConnector class="h-px flex-1 bg-emerald-300"></span>',
        '    </li>',
        '    <li tngStepperItem value="plan" label="Plan" class="flex min-w-36 flex-1 items-center gap-3 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2">',
        '      <button tngStepperTrigger class="inline-flex flex-wrap items-center gap-2 text-left">',
        '        <span tngStepperLabel>Plan</span>',
        '        <span tngStepperDescription class="text-xs">Workspace limits</span>',
        '      </button>',
        '      <span tngStepperConnector class="h-px flex-1 bg-sky-300"></span>',
        '    </li>',
        '    <li tngStepperItem value="invite" label="Invite" optional class="min-w-36 flex-1 rounded-lg border border-slate-300 px-3 py-2">',
        '      <button tngStepperTrigger class="inline-flex flex-wrap items-center gap-2 text-left">',
        '        <span tngStepperLabel>Invite</span>',
        '        <span tngStepperDescription class="text-xs">Optional team setup</span>',
        '      </button>',
        '    </li>',
        '  </ol>',
        '</section>',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'headless-stepper-horizontal-tailwind.component.css',
      code: '/* Tailwind utilities are applied directly in the template. */',
    },
  ]);

  protected readonly checkoutPlainCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'headless-stepper-checkout.component.html',
      code: [
        '<section tngStepper defaultValue="shipping" ariaLabel="Checkout progress">',
        '  <ol class="headless-stepper-example-list">',
        '    <li tngStepperItem value="cart" label="Cart" completed class="headless-stepper-example-item">',
        '      <button tngStepperTrigger class="headless-stepper-example-trigger">',
        '        <span class="dot">1</span><span tngStepperLabel>Cart</span>',
        '      </button>',
        '    </li>',
        '    <li tngStepperItem value="shipping" label="Shipping" class="headless-stepper-example-item">',
        '      <button tngStepperTrigger class="headless-stepper-example-trigger">',
        '        <span class="dot">2</span><span tngStepperLabel>Shipping</span>',
        '      </button>',
        '    </li>',
        '  </ol>',
        '</section>',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'headless-stepper-checkout.component.css',
      code: '[data-slot="stepper-item"][data-state="current"] { border-color: var(--tng-semantic-accent-brand); }',
    },
  ]);

  protected readonly checkoutTailwindCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'headless-stepper-checkout-tailwind.component.html',
      code: [
        '<section tngStepper defaultValue="shipping" ariaLabel="Checkout progress">',
        '  <ol class="grid gap-3">',
        '    <li tngStepperItem value="cart" label="Cart" completed class="rounded-lg border border-emerald-300 p-3">',
        '      <button tngStepperTrigger class="inline-flex items-center gap-3"><span tngStepperLabel>Cart</span></button>',
        '    </li>',
        '    <li tngStepperItem value="shipping" label="Shipping" class="rounded-lg border border-sky-300 p-3">',
        '      <button tngStepperTrigger class="inline-flex items-center gap-3"><span tngStepperLabel>Shipping</span></button>',
        '    </li>',
        '  </ol>',
        '</section>',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'headless-stepper-checkout-tailwind.component.css',
      code: '/* Tailwind utilities are applied directly in the template. */',
    },
  ]);

  protected readonly releasePlainCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'headless-stepper-release.component.html',
      code: [
        '<section tngStepper defaultValue="publish" linear ariaLabel="Release flow">',
        '  <ol class="headless-stepper-example-list">',
        '    <li tngStepperItem value="draft" label="Draft" completed class="headless-stepper-example-item">...</li>',
        '    <li tngStepperItem value="review" label="Review" completed class="headless-stepper-example-item">...</li>',
        '    <li tngStepperItem value="publish" label="Publish" class="headless-stepper-example-item">...</li>',
        '  </ol>',
        '</section>',
      ].join('\n'),
    },
  ]);

  protected readonly releaseTailwindCodeTabs: readonly DocsExampleCodeTab[] = this.releasePlainCodeTabs;

  protected readonly errorPlainCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'headless-stepper-error.component.html',
      code: [
        '<li tngStepperItem value="billing" label="Billing" error class="headless-stepper-example-item">',
        '  <button tngStepperTrigger class="headless-stepper-example-trigger">',
        '    <span class="dot">2</span>',
        '    <span tngStepperLabel>Billing</span>',
        '    <span tngStepperDescription>Payment method needs attention</span>',
        '  </button>',
        '</li>',
      ].join('\n'),
    },
  ]);

  protected readonly errorTailwindCodeTabs: readonly DocsExampleCodeTab[] = this.errorPlainCodeTabs;

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
