import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy, type WritableSignal } from '@angular/core';
import { TngCodeBlockComponent, TngConfetti } from '@tailng-ui/components';
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
  selector: 'app-confetti-overview-page',
  imports: [
    TngCodeBlockComponent,
    TngConfetti,
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
  ],
  templateUrl: './confetti-overview-page.component.html',
  styleUrls: ['../../confetti-docs.css', './confetti-overview-page.component.css'],
})
export class ConfettiOverviewPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly plainActive = signal(false);
  protected readonly tailwindActive = signal(false);
  protected readonly componentImportCode = [
    "import { TngConfetti } from '@tailng-ui/components';",
    '',
  ].join('\n');

  protected readonly plainCssCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'ts',
      label: 'TS',
      language: 'ts',
      title: 'confetti-overview-plain-css.component.ts',
      code: [
        "import { Component, signal } from '@angular/core';",
        "import { TngConfetti } from '@tailng-ui/components';",
        '',
        '@Component({',
        "  selector: 'app-confetti-overview-plain-css',",
        '  standalone: true,',
        '  imports: [TngConfetti],',
        "  templateUrl: './confetti-overview-plain-css.component.html',",
        "  styleUrl: './confetti-overview-plain-css.component.css',",
        '})',
        'export class ConfettiOverviewPlainCssComponent {',
        '  protected readonly active = signal(false);',
        '',
        '  protected launch(): void {',
        '    this.active.set(false);',
        '    queueMicrotask(() => this.active.set(true));',
        '  }',
        '',
        '  protected complete(): void {',
        '    this.active.set(false);',
        '  }',
        '}',
      ].join('\n'),
    },
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'confetti-overview-plain-css.component.html',
      code: [
        '<section class="celebration-shell">',
        '  <p>Invoice created successfully.</p>',
        '  <button type="button" (click)="launch()">Celebrate</button>',
        '</section>',
        '<tng-confetti [active]="active()" (completed)="complete()" />',
        '',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'confetti-overview-plain-css.component.css',
      code: [
        '.celebration-shell {',
        '  align-items: center;',
        '  border: 1px solid var(--tng-semantic-border-subtle);',
        '  border-radius: 0.9rem;',
        '  display: flex;',
        '  flex-wrap: wrap;',
        '  gap: 0.75rem;',
        '  justify-content: space-between;',
        '  padding: 1rem;',
        '}',
      ].join('\n'),
    },
  ]);

  protected readonly tailwindCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'ts',
      label: 'TS',
      language: 'ts',
      title: 'confetti-overview-tailwind.component.ts',
      code: [
        "import { Component, signal } from '@angular/core';",
        "import { TngConfetti } from '@tailng-ui/components';",
        '',
        '@Component({',
        "  selector: 'app-confetti-overview-tailwind',",
        '  standalone: true,',
        '  imports: [TngConfetti],',
        "  templateUrl: './confetti-overview-tailwind.component.html',",
        "  styleUrl: './confetti-overview-tailwind.component.css',",
        '})',
        'export class ConfettiOverviewTailwindComponent {',
        '  protected readonly active = signal(false);',
        '',
        '  protected launch(): void {',
        '    this.active.set(false);',
        '    queueMicrotask(() => this.active.set(true));',
        '  }',
        '',
        '  protected complete(): void {',
        '    this.active.set(false);',
        '  }',
        '}',
      ].join('\n'),
    },
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'confetti-overview-tailwind.component.html',
      code: [
        '<section class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--tng-semantic-border-subtle)] p-4">',
        '  <p>Invoice created successfully.</p>',
        '  <button class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white" type="button" (click)="launch()">Celebrate</button>',
        '</section>',
        '<tng-confetti [active]="active()" (completed)="complete()" />',
        '',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'confetti-overview-tailwind.component.css',
      code: '/* Tailwind utilities are applied directly in the template. */',
    },
  ]);

  protected launch(active: WritableSignal<boolean>): void {
    active.set(false);
    queueMicrotask(() => active.set(true));
  }

  protected complete(active: WritableSignal<boolean>): void {
    active.set(false);
  }

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
