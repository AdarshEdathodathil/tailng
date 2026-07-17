import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  TngCardComponent,
  TngCardContentComponent,
  TngCardDescriptionComponent,
  TngCardHeaderComponent,
  TngCardTitleComponent,
} from '@tailng-ui/components';
import {
  TngFlowEditorComponent,
  TngFlowNodeTemplateDirective,
  type TngFlowNodesMovedEvent,
  type TngFlowNodeViews,
} from '@tailng-ui/flow';
import {
  customNodePlainCssCodeTabs,
  customNodeTailwindCodeTabs,
  monitorPlainCssCodeTabs,
  monitorTailwindCodeTabs,
} from './flow-editor-examples-code.data';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';
import {
  applyFlowNodeMoves,
  flowEditorDemoConnections,
  flowEditorDemoNodes,
} from '../../flow-editor-demo.data';

type CustomNodeExampleVariant = 'plain-css' | 'tailwind-css';

@Component({
  selector: 'app-flow-editor-examples-page',
  imports: [
    TngCardComponent,
    TngCardContentComponent,
    TngCardDescriptionComponent,
    TngCardHeaderComponent,
    TngCardTitleComponent,
    TngFlowEditorComponent,
    TngFlowNodeTemplateDirective,
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
  ],
  templateUrl: './flow-editor-examples-page.component.html',
  styleUrl: './flow-editor-examples-page.component.css',
})
export class FlowEditorExamplesPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly customPlainCssNodes = signal(flowEditorDemoNodes);
  protected readonly customTailwindNodes = signal(flowEditorDemoNodes);
  protected readonly monitorNodes = flowEditorDemoNodes;
  protected readonly connections = flowEditorDemoConnections;
  protected readonly customViews: TngFlowNodeViews = Object.freeze({
    model: { status: 'running', progress: 52, message: 'Calling retrieval tools' },
    prompt: { status: 'completed' },
    response: { status: 'waiting' },
  });
  protected readonly monitorViews: TngFlowNodeViews = Object.freeze({
    model: { status: 'completed', progress: 100, message: 'Finished in 1.8 seconds' },
    prompt: { status: 'completed', progress: 100 },
    response: { status: 'completed', progress: 100, message: 'Delivered to the user' },
  });
  protected readonly customNodePlainCssCodeTabs = customNodePlainCssCodeTabs;
  protected readonly customNodeTailwindCodeTabs = customNodeTailwindCodeTabs;
  protected readonly monitorPlainCssCodeTabs = monitorPlainCssCodeTabs;
  protected readonly monitorTailwindCodeTabs = monitorTailwindCodeTabs;

  protected onNodesMoved(event: TngFlowNodesMovedEvent, variant: CustomNodeExampleVariant): void {
    const nodes = variant === 'plain-css' ? this.customPlainCssNodes : this.customTailwindNodes;
    nodes.update((currentNodes) => applyFlowNodeMoves(currentNodes, event));
  }

  protected nodeDetail(data: unknown): string {
    if (typeof data !== 'object' || data === null || !('detail' in data)) {
      return '';
    }
    return typeof data.detail === 'string' ? data.detail : '';
  }

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
