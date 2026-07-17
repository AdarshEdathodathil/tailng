import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import { TngButtonComponent, TngCodeBlockComponent } from '@tailng-ui/components';
import {
  TngFlowEditorComponent,
  type TngFlowConnectionCreatedEvent,
  type TngFlowDeleteRequestedEvent,
  type TngFlowNodesMovedEvent,
} from '@tailng-ui/flow';
import {
  flowEditorOverviewPlainCssCodeTabs,
  flowEditorOverviewTailwindCodeTabs,
} from './flow-editor-overview-code.data';
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
  flowEditorDemoViews,
  removeFlowItems,
} from '../../flow-editor-demo.data';

type FlowEditorOverviewVariant = 'plain-css' | 'tailwind-css';

@Component({
  selector: 'app-flow-editor-overview-page',
  imports: [
    TngButtonComponent,
    TngCodeBlockComponent,
    TngFlowEditorComponent,
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
  ],
  templateUrl: './flow-editor-overview-page.component.html',
  styleUrl: './flow-editor-overview-page.component.css',
})
export class FlowEditorOverviewPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  private readonly connectionSequence = signal(0);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly plainCssNodes = signal(flowEditorDemoNodes);
  protected readonly plainCssConnections = signal(flowEditorDemoConnections);
  protected readonly tailwindNodes = signal(flowEditorDemoNodes);
  protected readonly tailwindConnections = signal(flowEditorDemoConnections);
  protected readonly nodeViews = flowEditorDemoViews;
  protected readonly plainCssCodeTabs = flowEditorOverviewPlainCssCodeTabs;
  protected readonly tailwindCodeTabs = flowEditorOverviewTailwindCodeTabs;

  protected readonly installCode = [
    'pnpm add @tailng-ui/flow @tailng-ui/components @tailng-ui/icons \\',
    '  @foblex/flow @foblex/2d @foblex/mediator @foblex/platform @foblex/utils',
  ].join('\n');
  protected readonly stylesCode = "@import '@tailng-ui/flow/styles.css';";
  protected readonly controlledCode = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  TngFlowEditorComponent,',
    '  type TngFlowConnection,',
    '  type TngFlowConnectionCreatedEvent,',
    '  type TngFlowNode,',
    '  type TngFlowNodesMovedEvent,',
    "} from '@tailng-ui/flow';",
    '',
    '@Component({',
    '  imports: [TngFlowEditorComponent],',
    '  template: `',
    '    <tng-flow-editor',
    '      [nodes]="nodes()"',
    '      [connections]="connections()"',
    '      [nodeViews]="nodeViews"',
    '      (nodesMoved)="moveNodes($event)"',
    '      (connectionCreated)="createConnection($event)"',
    '    />',
    '  `,',
    '})',
    'export class AgentFlowComponent {',
    '  readonly nodes = signal<readonly TngFlowNode[]>(initialNodes);',
    '  readonly connections = signal<readonly TngFlowConnection[]>(initialConnections);',
    "  readonly nodeViews = { model: { status: 'running' as const, progress: 68 } };",
    '',
    '  moveNodes(event: TngFlowNodesMovedEvent): void {',
    '    const positions = new Map(event.nodes.map((node) => [node.id, node.position]));',
    '    this.nodes.update((nodes) =>',
    '      nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position })),',
    '    );',
    '  }',
    '',
    '  createConnection(event: TngFlowConnectionCreatedEvent): void {',
    '    this.connections.update((connections) => [',
    '      ...connections,',
    '      {',
    '        id: crypto.randomUUID(),',
    '        sourcePortId: event.sourcePortId,',
    '        targetPortId: event.targetPortId,',
    "        type: 'bezier',",
    '      },',
    '    ]);',
    '  }',
    '}',
  ].join('\n');

  protected onNodesMoved(event: TngFlowNodesMovedEvent, variant: FlowEditorOverviewVariant): void {
    const nodes = variant === 'plain-css' ? this.plainCssNodes : this.tailwindNodes;
    nodes.update((currentNodes) => applyFlowNodeMoves(currentNodes, event));
  }

  protected onConnectionCreated(
    event: TngFlowConnectionCreatedEvent,
    variant: FlowEditorOverviewVariant,
  ): void {
    const connections =
      variant === 'plain-css' ? this.plainCssConnections : this.tailwindConnections;
    const id = `docs-connection-${this.connectionSequence()}`;
    this.connectionSequence.update((sequence) => sequence + 1);
    connections.update((currentConnections) => [
      ...currentConnections,
      {
        id,
        sourcePortId: event.sourcePortId,
        targetPortId: event.targetPortId,
        type: 'bezier',
      },
    ]);
  }

  protected onDeleteRequested(
    event: TngFlowDeleteRequestedEvent,
    variant: FlowEditorOverviewVariant,
  ): void {
    const nodes = variant === 'plain-css' ? this.plainCssNodes : this.tailwindNodes;
    const connections =
      variant === 'plain-css' ? this.plainCssConnections : this.tailwindConnections;
    const next = removeFlowItems(nodes(), connections(), event);
    nodes.set(next.nodes);
    connections.set(next.connections);
  }

  protected resetDemo(variant: FlowEditorOverviewVariant): void {
    const nodes = variant === 'plain-css' ? this.plainCssNodes : this.tailwindNodes;
    const connections =
      variant === 'plain-css' ? this.plainCssConnections : this.tailwindConnections;
    nodes.set(flowEditorDemoNodes);
    connections.set(flowEditorDemoConnections);
  }

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
