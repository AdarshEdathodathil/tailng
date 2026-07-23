import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import { TngCodeBlockComponent } from '@tailng-ui/components';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';

@Component({
  selector: 'app-headless-tooltip-styling-page',
  imports: [TngCodeBlockComponent],
  templateUrl: './tooltip-styling-page.component.html',
  styleUrl: './tooltip-styling-page.component.css',
})
export class HeadlessTooltipStylingPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );
  protected readonly stylingContractCode = [
    '[tngTooltip] {',
    '  --tng-tooltip-z-overlay: 1100;',
    '}',
    '',
    '/* or app-wide */',
    ':root {',
    '  --tng-z-overlay: 1100;',
    '}',
    '',
    '[data-slot="tooltip-trigger"] {',
    '  border-radius: 0.7rem;',
    '  min-height: 2.1rem;',
    '  padding-inline: 0.9rem;',
    '}',
    '',
    '[data-slot="tooltip-trigger"][data-state="open"] {',
    '  border-color: var(--tng-semantic-accent-brand);',
    '}',
    '',
    '[data-slot="tooltip-content"] {',
    '  border: 1px solid var(--tng-semantic-border-subtle);',
    '  border-radius: 0.7rem;',
    '  box-shadow: 0 20px 36px color-mix(in srgb, #020617 24%, transparent);',
    '  max-width: min(22rem, calc(100vw - 2rem));',
    '  padding: 0.45rem 0.62rem;',
    '  pointer-events: none;',
    '  white-space: nowrap;',
    '}',
    '',
    '[data-slot="tooltip-content"][data-side="top"] {',
    '  transform-origin: bottom center;',
    '}',
    '',
    '[data-slot="tooltip-content"][data-side="right"] {',
    '  transform-origin: center left;',
    '}',
    '',
    '[data-slot="tooltip-content"][hidden] {',
    '  display: none !important;',
    '}',
  ].join('\n');

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
