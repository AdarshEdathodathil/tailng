import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy, type WritableSignal } from '@angular/core';
import { TngConfetti, type TngConfettiOrigin } from '@tailng-ui/components';
import type { DocsExampleCodeTab } from '../../../../../../shared/example-panel/docs-example-panel.component';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';

type ConfettiExampleState = Readonly<{
  active: WritableSignal<boolean>;
  colors: WritableSignal<string[] | null>;
  completions: WritableSignal<number>;
  origin: WritableSignal<TngConfettiOrigin>;
}>;

type CodeTabsOptions = Readonly<{
  className: string;
  css: readonly string[];
  html: readonly string[];
  slug: string;
  tsBody: readonly string[];
}>;

function createExampleState(): ConfettiExampleState {
  return Object.freeze({
    active: signal(false),
    colors: signal<string[] | null>(null),
    completions: signal(0),
    origin: signal<TngConfettiOrigin>('bottom'),
  });
}

function createTypeScriptTab(options: CodeTabsOptions): DocsExampleCodeTab {
  return {
    value: 'ts',
    label: 'TS',
    language: 'ts',
    title: `${options.slug}.component.ts`,
    code: [
      "import { Component, signal } from '@angular/core';",
      "import { TngConfetti, type TngConfettiOrigin } from '@tailng-ui/components';",
      '',
      '@Component({',
      `  selector: 'app-${options.slug}',`,
      '  standalone: true,',
      '  imports: [TngConfetti],',
      `  templateUrl: './${options.slug}.component.html',`,
      `  styleUrl: './${options.slug}.component.css',`,
      '})',
      `export class ${options.className} {`,
      ...options.tsBody.map((line) => (line === '' ? '' : `  ${line}`)),
      '}',
    ].join('\n'),
  };
}

function createCodeTabs(options: CodeTabsOptions): readonly DocsExampleCodeTab[] {
  return Object.freeze([
    createTypeScriptTab(options),
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: `${options.slug}.component.html`,
      code: [...options.html, ''].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: `${options.slug}.component.css`,
      code: options.css.join('\n'),
    },
  ]);
}

const successTsBody = [
  'protected readonly active = signal(false);',
  'protected readonly colors = signal<string[] | null>(null);',
  "protected readonly origin = signal<TngConfettiOrigin>('bottom');",
  '',
  'protected launch(origin: TngConfettiOrigin, colors: string[] | null = null): void {',
  '  this.active.set(false);',
  '  this.origin.set(origin);',
  '  this.colors.set(colors);',
  '  queueMicrotask(() => this.active.set(true));',
  '}',
  '',
  'protected complete(): void {',
  '  this.active.set(false);',
  '}',
] as const;

const containedTsBody = [
  'protected readonly active = signal(false);',
  '',
  'protected launch(): void {',
  '  this.active.set(false);',
  '  queueMicrotask(() => this.active.set(true));',
  '}',
  '',
  'protected complete(): void {',
  '  this.active.set(false);',
  '}',
] as const;

const resetTsBody = [
  'protected readonly active = signal(false);',
  'protected readonly completions = signal(0);',
  '',
  'protected launch(): void {',
  '  this.active.set(true);',
  '}',
  '',
  'protected complete(): void {',
  '  this.active.set(false);',
  '  this.completions.update((value) => value + 1);',
  '}',
] as const;

@Component({
  selector: 'app-confetti-examples-page',
  imports: [TngConfetti, DocsExampleTabsSectionComponent, DocsExampleVariantDirective],
  templateUrl: './confetti-examples-page.component.html',
  styleUrls: ['../../confetti-docs.css', './confetti-examples-page.component.css'],
})
export class ConfettiExamplesPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly successPlain = createExampleState();
  protected readonly successTailwind = createExampleState();
  protected readonly containedPlain = createExampleState();
  protected readonly containedTailwind = createExampleState();
  protected readonly resetPlain = createExampleState();
  protected readonly resetTailwind = createExampleState();

  protected readonly successPlainTabs = createCodeTabs({
    className: 'ConfettiSuccessPlainCssComponent',
    slug: 'confetti-success-plain-css',
    tsBody: successTsBody,
    html: [
      '<section class="success-actions">',
      '  <button type="button" (click)="launch(\'bottom\')">Payment received</button>',
      "  <button type=\"button\" (click)=\"launch('center', ['#14b8a6', '#f59e0b', '#8b5cf6'])\">GST reconciled</button>",
      '</section>',
      '<tng-confetti [active]="active()" [origin]="origin()" [colors]="colors()" (completed)="complete()" />',
    ],
    css: [
      '.success-actions {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.75rem;',
      '}',
      '.success-actions button {',
      '  background: var(--tng-semantic-accent-brand);',
      '  border: 0;',
      '  border-radius: 0.65rem;',
      '  color: white;',
      '  padding: 0.65rem 1rem;',
      '}',
    ],
  });

  protected readonly successTailwindTabs = createCodeTabs({
    className: 'ConfettiSuccessTailwindComponent',
    slug: 'confetti-success-tailwind',
    tsBody: successTsBody,
    html: [
      '<section class="flex flex-wrap gap-3 rounded-xl border border-[var(--tng-semantic-border-subtle)] p-4">',
      '  <button class="rounded-lg bg-blue-600 px-4 py-2 text-white" type="button" (click)="launch(\'bottom\')">Payment received</button>',
      "  <button class=\"rounded-lg bg-violet-600 px-4 py-2 text-white\" type=\"button\" (click)=\"launch('center', ['#14b8a6', '#f59e0b', '#8b5cf6'])\">GST reconciled</button>",
      '</section>',
      '<tng-confetti [active]="active()" [origin]="origin()" [colors]="colors()" (completed)="complete()" />',
    ],
    css: ['/* Tailwind utilities are applied directly in the template. */'],
  });

  protected readonly containedPlainTabs = createCodeTabs({
    className: 'ConfettiContainedPlainCssComponent',
    slug: 'confetti-contained-plain-css',
    tsBody: containedTsBody,
    html: [
      '<section class="confetti-card">',
      '  <strong>Quarterly close complete</strong>',
      '  <button type="button" (click)="launch()">Celebrate this card</button>',
      '  <tng-confetti [active]="active()" [fullscreen]="false" [pieces]="90" (completed)="complete()" />',
      '</section>',
    ],
    css: [
      '.confetti-card {',
      '  border: 1px solid var(--tng-semantic-border-subtle);',
      '  border-radius: 1rem;',
      '  display: grid;',
      '  gap: 1rem;',
      '  min-height: 14rem;',
      '  overflow: hidden;',
      '  padding: 1rem;',
      '  position: relative;',
      '}',
    ],
  });

  protected readonly containedTailwindTabs = createCodeTabs({
    className: 'ConfettiContainedTailwindComponent',
    slug: 'confetti-contained-tailwind',
    tsBody: containedTsBody,
    html: [
      '<section class="relative grid min-h-56 gap-4 overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 p-4">',
      '  <strong>Quarterly close complete</strong>',
      '  <button class="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-white" type="button" (click)="launch()">Celebrate this card</button>',
      '  <tng-confetti [active]="active()" [fullscreen]="false" [pieces]="90" (completed)="complete()" />',
      '</section>',
    ],
    css: ['/* Tailwind utilities are applied directly in the template. */'],
  });

  protected readonly resetPlainTabs = createCodeTabs({
    className: 'ConfettiResetPlainCssComponent',
    slug: 'confetti-reset-plain-css',
    tsBody: resetTsBody,
    html: [
      '<section class="reset-example">',
      '  <button type="button" [disabled]="active()" (click)="launch()">Celebrate again</button>',
      '  <span>Completed bursts: {{ completions() }}</span>',
      '</section>',
      '<tng-confetti [active]="active()" [duration]="1800" (completed)="complete()" />',
    ],
    css: [
      '.reset-example {',
      '  align-items: center;',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.75rem;',
      '}',
    ],
  });

  protected readonly resetTailwindTabs = createCodeTabs({
    className: 'ConfettiResetTailwindComponent',
    slug: 'confetti-reset-tailwind',
    tsBody: resetTsBody,
    html: [
      '<section class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--tng-semantic-border-subtle)] p-4">',
      '  <button class="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50" type="button" [disabled]="active()" (click)="launch()">Celebrate again</button>',
      '  <span>Completed bursts: {{ completions() }}</span>',
      '</section>',
      '<tng-confetti [active]="active()" [duration]="1800" (completed)="complete()" />',
    ],
    css: ['/* Tailwind utilities are applied directly in the template. */'],
  });

  protected launch(
    state: ConfettiExampleState,
    origin: TngConfettiOrigin = 'bottom',
    colors: string[] | null = null,
  ): void {
    state.active.set(false);
    state.origin.set(origin);
    state.colors.set(colors);
    queueMicrotask(() => state.active.set(true));
  }

  protected complete(state: ConfettiExampleState): void {
    state.active.set(false);
    state.completions.update((value) => value + 1);
  }

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
