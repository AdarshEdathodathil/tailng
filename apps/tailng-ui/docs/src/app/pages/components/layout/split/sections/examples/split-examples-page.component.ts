import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  TngCodeBlockComponent,
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
  type TngSplitResizeEvent,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import {
  splitVerticalPlainCodeTabs,
  splitVerticalTailwindCodeTabs,
  splitWorkspacePlainCodeTabs,
  splitWorkspaceTailwindCodeTabs,
} from './split-examples-code.data';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';

@Component({
  selector: 'app-split-examples-page',
  imports: [
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
    TngCodeBlockComponent,
    TngIcon,
    TngSplitGroupComponent,
    TngSplitHandleComponent,
    TngSplitPaneDirective,
  ],
  templateUrl: './split-examples-page.component.html',
  styleUrl: './split-examples-page.component.css',
})
export class SplitExamplesPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly plainJsonCollapsed = signal(false);
  protected readonly tailwindJsonCollapsed = signal(false);
  protected readonly plainLastResize = signal<TngSplitResizeEvent | null>(null);
  protected readonly tailwindLastResize = signal<TngSplitResizeEvent | null>(null);
  protected readonly plainProjectCollapsed = signal(false);
  protected readonly plainInspectorCollapsed = signal(false);
  protected readonly tailwindProjectCollapsed = signal(false);
  protected readonly tailwindInspectorCollapsed = signal(false);

  protected readonly verticalPlainCodeTabs = splitVerticalPlainCodeTabs;
  protected readonly verticalTailwindCodeTabs = splitVerticalTailwindCodeTabs;
  protected readonly workspacePlainCodeTabs = splitWorkspacePlainCodeTabs;
  protected readonly workspaceTailwindCodeTabs = splitWorkspaceTailwindCodeTabs;

  protected readonly persistenceCode = [
    'readonly panelSizes = signal<Record<string, number>>(loadPanelSizes());',
    '',
    'saveLayout(event: TngSplitResizeEvent): void {',
    '  this.panelSizes.update((sizes) => ({',
    '    ...sizes,',
    '    [event.previousPaneId]: event.previousPaneSize,',
    '    [event.nextPaneId]: event.nextPaneSize,',
    '  }));',
    '  this.preferences.savePanelSizes(this.panelSizes());',
    '}',
  ].join('\n');

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
