import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, ViewEncapsulation, type OnDestroy } from '@angular/core';
import {
  TngButtonComponent,
  TngCodeBlockComponent,
  TngMenuComponent,
  TngMenuTriggerFor,
} from '@tailng-ui/components';
import { TngMenuGroupLabel, TngMenuItem, type TngMenuSelectEvent } from '@tailng-ui/primitives';
import { type DocsExampleCodeTab } from '../../../../../../shared/example-panel/docs-example-panel.component';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import { observeDocsCodeThemeChanges, resolveDocsCodeBlockTheme } from '../../../../../../shared/util';

@Component({
  selector: 'app-menu-overview-page',
  encapsulation: ViewEncapsulation.None,
  imports: [
    TngCodeBlockComponent,
    TngButtonComponent,
    TngMenuComponent,
    TngMenuGroupLabel,
    TngMenuItem,
    TngMenuTriggerFor,
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
  ],
  templateUrl: './menu-overview-page.component.html',
})
export class MenuOverviewPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(this.documentRef, this.codeBlockTheme);

  protected readonly plainCommand = signal('No command yet');
  protected readonly tailwindCommand = signal('No command yet');

  protected readonly componentImportCode = [
    "import { TngButtonComponent, TngMenuComponent, TngMenuTriggerFor } from '@tailng-ui/components';",
    "import { TngMenuGroupLabel, TngMenuItem, TngMenuSeparator } from '@tailng-ui/primitives';",
  ].join('\n');

  protected readonly componentUsageCode = [
    '<tng-button',
    '  type="button"',
    '  id="actions-menu-trigger"',
    '  appearance="outline"',
    '  tone="neutral"',
    '  [tngMenuTriggerFor]="actionsMenu"',
    '>',
    '  Open menu',
    '</tng-button>',
    '<tng-menu #actionsMenu="tngMenu" ariaLabel="Actions menu">',
    '  <div tngMenuGroupLabel>Actions</div>',
    '  <button type="button" tngMenuItem tngMenuItemValue="Export report">Export report</button>',
    '  <div tngMenuSeparator></div>',
    '  <button type="button" tngMenuItem tngMenuItemValue="Copy path">Copy path</button>',
    '</tng-menu>',
  ].join('\n');

  protected readonly plainCssCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'ts',
      label: 'TS',
      language: 'ts',
      title: 'menu-overview-plain-css.component.ts',
      code: [
        "import { Component, signal } from '@angular/core';",
        "import { TngButtonComponent, TngMenuComponent, TngMenuTriggerFor } from '@tailng-ui/components';",
        "import type { TngMenuSelectEvent } from '@tailng-ui/primitives';",
        "import { TngMenuGroupLabel, TngMenuItem } from '@tailng-ui/primitives';",
        '',
        '@Component({',
        "  selector: 'app-menu-overview-plain-example',",
        '  standalone: true,',
        '  imports: [TngButtonComponent, TngMenuComponent, TngMenuTriggerFor, TngMenuGroupLabel, TngMenuItem],',
        "  templateUrl: './menu-overview-plain-css.component.html',",
        "  styleUrl: './menu-overview-plain-css.component.css',",
        '})',
        'export class MenuOverviewPlainExampleComponent {',
        "  protected readonly menuOverviewPlainLastCommand = signal('No command yet');",
        '',
        '  protected onMenuOverviewPlainSelect(event: TngMenuSelectEvent): void {',
        '    this.menuOverviewPlainLastCommand.set(String(event.value));',
        '  }',
        '}',
      ].join('\n'),
    },
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'menu-overview-plain-css.component.html',
      code: [
        '<tng-button',
        '  type="button"',
        '  id="menu-overview-plain-trigger"',
        '  appearance="outline"',
        '  tone="neutral"',
        '  [tngMenuTriggerFor]="menuOverviewPlainMenu"',
        '>',
        '  Options',
        '</tng-button>',
        '<tng-menu',
        '  #menuOverviewPlainMenu="tngMenu"',
        '  ariaLabel="Options menu"',
        '  (tngMenuSelect)="onMenuOverviewPlainSelect($event)"',
        '>',
        '  <div tngMenuGroupLabel>Options</div>',
        '  <button type="button" tngMenuItem tngMenuItemValue="Pin item">Pin</button>',
        '  <button type="button" tngMenuItem tngMenuItemValue="Mute notifications">Mute</button>',
        '  <button type="button" tngMenuItem tngMenuItemValue="Remove item">Remove</button>',
        '</tng-menu>',
        '<p>last command: {{ menuOverviewPlainLastCommand() }}</p>',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'menu-overview-plain-css.component.css',
      code: [
        '/*',
        ' * tng-menu, labels, and items need no local CSS — the component',
        ' * implementation applies menu styles. Use tng-button or your own',
        ' * control styles for triggers, then this file for non-menu chrome',
        ' * (e.g. the "last command" line below).',
        ' */',
        '',
        ':host {',
        '  display: block;',
        '}',
        '',
        '.menu-example-state {',
        '  color: var(--tng-semantic-foreground-secondary, #64748b);',
        '  font-size: 0.9rem;',
        '  margin: 0.68rem 0 0;',
        '}',
      ].join('\n'),
    },
  ]);

  protected readonly tailwindCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
    {
      value: 'ts',
      label: 'TS',
      language: 'ts',
      title: 'menu-overview-tailwind.component.ts',
      code: [
        "import { Component, signal } from '@angular/core';",
        "import { TngButtonComponent, TngMenuComponent, TngMenuTriggerFor } from '@tailng-ui/components';",
        "import type { TngMenuSelectEvent } from '@tailng-ui/primitives';",
        "import { TngMenuGroupLabel, TngMenuItem } from '@tailng-ui/primitives';",
        '',
        '@Component({',
        "  selector: 'app-menu-overview-tailwind-example',",
        '  standalone: true,',
        '  imports: [TngButtonComponent, TngMenuComponent, TngMenuTriggerFor, TngMenuGroupLabel, TngMenuItem],',
        "  templateUrl: './menu-overview-tailwind.component.html',",
        '})',
        'export class MenuOverviewTailwindExampleComponent {',
        "  protected readonly menuOverviewTailwindLastCommand = signal('No command yet');",
        '',
        '  protected onMenuOverviewTailwindSelect(event: TngMenuSelectEvent): void {',
        '    this.menuOverviewTailwindLastCommand.set(String(event.value));',
        '  }',
        '}',
      ].join('\n'),
    },
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: 'menu-overview-tailwind.component.html',
      code: [
        '<div class="rounded-xl border border-[var(--tng-semantic-border-subtle)] bg-[color-mix(in_srgb,var(--tng-semantic-background-surface)_88%,transparent)] p-4">',
        '  <tng-button',
        '    type="button"',
        '    id="menu-overview-tailwind-trigger"',
        '    appearance="outline"',
        '    tone="neutral"',
        '    [tngMenuTriggerFor]="menuOverviewTailwindMenu"',
        '  >',
        '    Open menu',
        '  </tng-button>',
        '  <tng-menu',
        '    #menuOverviewTailwindMenu="tngMenu"',
        '    ariaLabel="Tailwind menu"',
        '    (tngMenuSelect)="onMenuOverviewTailwindSelect($event)"',
        '  >',
        '    <div tngMenuGroupLabel>Actions</div>',
        '    <button type="button" tngMenuItem tngMenuItemValue="Export report">Export report</button>',
        '    <button type="button" tngMenuItem tngMenuItemValue="Share link">Share link</button>',
        '    <button type="button" tngMenuItem tngMenuItemValue="Copy path">Copy path</button>',
        '  </tng-menu>',
        '</div>',
        '<p>last command: {{ menuOverviewTailwindLastCommand() }}</p>',
      ].join('\n'),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: 'menu-overview-tailwind.component.css',
      code: [
        '/*',
        ' * No CSS is required for tng-menu internals. Use tng-button or your own',
        ' * control styles for triggers; wrapper utilities are optional page chrome.',
        ' */',
      ].join('\n'),
    },
  ]);

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }

  protected onPlainSelect(event: TngMenuSelectEvent): void {
    this.plainCommand.set(String(event.value));
  }

  protected onTailwindSelect(event: TngMenuSelectEvent): void {
    this.tailwindCommand.set(String(event.value));
  }
}
