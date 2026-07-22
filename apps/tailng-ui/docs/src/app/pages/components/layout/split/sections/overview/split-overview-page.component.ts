import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  TngCodeBlockComponent,
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';
import {
  splitOverviewPlainCodeTabs,
  splitOverviewTailwindCodeTabs,
} from './split-overview-code.data';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';

@Component({
  selector: 'app-split-overview-page',
  imports: [
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
    TngCodeBlockComponent,
    TngSplitGroupComponent,
    TngSplitHandleComponent,
    TngSplitPaneDirective,
  ],
  templateUrl: './split-overview-page.component.html',
  styleUrl: './split-overview-page.component.css',
})
export class SplitOverviewPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly plainPaletteCollapsed = signal(false);
  protected readonly plainInspectorCollapsed = signal(false);
  protected readonly plainJsonCollapsed = signal(false);
  protected readonly tailwindPaletteCollapsed = signal(false);
  protected readonly tailwindInspectorCollapsed = signal(false);
  protected readonly tailwindJsonCollapsed = signal(false);

  protected readonly plainCodeTabs = splitOverviewPlainCodeTabs;
  protected readonly tailwindCodeTabs = splitOverviewTailwindCodeTabs;

  protected readonly importCode = [
    'import {',
    '  TngSplitGroupComponent,',
    '  TngSplitHandleComponent,',
    '  TngSplitPaneDirective,',
    '  type TngSplitResizeEvent,',
    "} from '@tailng-ui/components';",
  ].join('\n');

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
