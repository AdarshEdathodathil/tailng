import type { DocsExampleCodeTab } from '../../../../../../../shared/example-panel/docs-example-panel.component';

const componentCode = `import { Component, signal } from '@angular/core';
import {
  TngFlowEditorComponent,
  TngFlowPaletteItemDirective,
  type TngFlowConnectionCreateRequest,
  type TngFlowDefinition,
  type TngFlowEndpoint,
  type TngFlowNode,
  type TngFlowNodeCreateRequest,
  type TngFlowNodePositionChange,
  type TngFlowPaletteItem,
  type TngFlowPort,
  type TngFlowSelection,
} from '@tailng-ui/flow';

type NodeData = Readonly<{
  acceptsInput: boolean;
  createsOutput: boolean;
}>;

const CREATE_INPUT = '__create-input__';
const CREATE_OUTPUT = '__create-output__';

function creatorPorts(data: NodeData): readonly TngFlowPort[] {
  return [
    ...(data.acceptsInput
      ? [{
          id: CREATE_INPUT,
          name: 'Connect to node',
          direction: 'input' as const,
          kind: 'data' as const,
          multiple: true,
        }]
      : []),
    ...(data.createsOutput
      ? [{
          id: CREATE_OUTPUT,
          name: 'Create connection',
          direction: 'output' as const,
          kind: 'data' as const,
          multiple: true,
        }]
      : []),
  ];
}

const palette: readonly TngFlowPaletteItem<NodeData>[] = [
  {
    id: 'webhook',
    type: 'trigger',
    name: 'Webhook',
    data: { acceptsInput: false, createsOutput: true },
  },
  {
    id: 'request',
    type: 'action',
    name: 'HTTP request',
    data: { acceptsInput: true, createsOutput: true },
  },
  {
    id: 'condition',
    type: 'logic',
    name: 'Condition',
    data: { acceptsInput: true, createsOutput: true },
  },
];

@Component({
  selector: 'app-flow-builder',
  imports: [TngFlowEditorComponent, TngFlowPaletteItemDirective],
  templateUrl: './flow-builder.component.html',
  styleUrl: './flow-builder.component.css',
})
export class FlowBuilderComponent {
  readonly palette = palette;
  readonly definition = signal<TngFlowDefinition<NodeData>>({
    id: 'new-workflow',
    name: 'Untitled workflow',
    nodes: [],
    connections: [],
  });
  readonly selection = signal<TngFlowSelection>({
    nodeIds: new Set(),
    connectionIds: new Set(),
  });
  private sequence = 1;

  createNode(request: TngFlowNodeCreateRequest<NodeData>): void {
    const data = request.item.data!;
    const id = request.item.type + '-' + this.sequence++;
    this.definition.update((flow) => ({
      ...flow,
      nodes: [
        ...flow.nodes,
        {
          id,
          type: request.item.type,
          name: request.item.name,
          position: request.position,
          data,
          ports: creatorPorts(data),
        },
      ],
    }));
  }

  moveNode(event: TngFlowNodePositionChange): void {
    this.definition.update((flow) => ({
      ...flow,
      nodes: flow.nodes.map((node) =>
        node.id === event.nodeId ? { ...node, position: event.position } : node,
      ),
    }));
  }

  connect(request: TngFlowConnectionCreateRequest): void {
    const flow = this.definition();
    const source = this.materializePort(flow.nodes, request.source, 'output');
    const target = this.materializePort(source.nodes, request.target, 'input');
    this.definition.set({
      ...flow,
      nodes: target.nodes,
      connections: [
        ...flow.connections,
        {
          id: 'connection-' + this.sequence++,
          source: source.endpoint,
          target: target.endpoint,
          type: 'bezier',
        },
      ],
    });
  }

  private materializePort(
    nodes: readonly TngFlowNode<NodeData>[],
    endpoint: TngFlowEndpoint,
    direction: 'input' | 'output',
  ): Readonly<{ endpoint: TngFlowEndpoint; nodes: readonly TngFlowNode<NodeData>[] }> {
    const creatorId = direction === 'input' ? CREATE_INPUT : CREATE_OUTPUT;
    if (endpoint.portId !== creatorId) {
      return { endpoint, nodes };
    }
    const portId = direction + '-' + crypto.randomUUID();
    const port: TngFlowPort = {
      id: portId,
      name: direction === 'input' ? 'Input' : 'Output',
      direction,
      kind: 'data',
    };
    return {
      endpoint: { nodeId: endpoint.nodeId, portId },
      nodes: nodes.map((node) =>
        node.id === endpoint.nodeId
          ? { ...node, ports: [port, ...(node.ports ?? [])] }
          : node,
      ),
    };
  }
}`;

const markupCode = `<div class="flow-builder">
  <aside class="flow-builder__palette">
    <h3>Step library</h3>
    @for (item of palette; track item.id) {
      <button
        type="button"
        [tngFlowPaletteItem]="item"
        (tngFlowPaletteItemActivate)="
          editor.requestNodeCreate($event.item, undefined, $event.source)
        "
      >
        <strong>{{ item.name }}</strong>
        <span>{{ item.description }}</span>
      </button>
    }
  </aside>

  <tng-flow-editor
    #editor="tngFlowEditor"
    flowId="professional-flow-builder"
    attachmentLayout="nearest-border"
    [definition]="definition()"
    [selection]="selection()"
    [snapToGrid]="true"
    (nodeCreateRequested)="createNode($event)"
    (nodePositionChange)="moveNode($event)"
    (connectionCreateRequested)="connect($event)"
    (selectionChange)="selection.set($event)"
  />
</div>`;

const cssCode = `.flow-builder {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  min-height: 38rem;
  overflow: hidden;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 1rem;
}

.flow-builder__palette {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  padding: 1rem;
  border-right: 1px solid var(--tng-semantic-border-default);
}

.flow-builder__palette button {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 0.75rem;
  background: var(--tng-semantic-background-surface);
  cursor: grab;
  text-align: left;
}

tng-flow-editor {
  display: block;
  min-height: 38rem;
}

/* Put these creator-port rules in global styles.css because the sockets are
   rendered inside tng-flow-editor. */
.flow-builder .tng-flow-editor__port[data-port-id='__create-input__'],
.flow-builder .tng-flow-editor__port[data-port-id='__create-output__'] {
  opacity: 0;
}

.flow-builder
  .tng-flow-editor__node:hover
  .tng-flow-editor__port[data-port-id='__create-output__'],
.flow-builder
  .tng-flow-editor__port[data-port-id='__create-input__']:has(.f-connector-connectable) {
  opacity: 1;
}

.flow-builder
  .tng-flow-editor__port[data-port-id^='__create-']
  .tng-flow-port__socket::after {
  content: '+';
}`;

export const professionalFlowBuilderDemoCodeTabs: readonly DocsExampleCodeTab[] = Object.freeze([
  {
    value: 'ts',
    label: 'TS',
    language: 'ts',
    title: 'flow-builder.component.ts',
    code: componentCode,
  },
  {
    value: 'html',
    label: 'HTML',
    language: 'html',
    title: 'flow-builder.component.html',
    code: markupCode,
  },
  {
    value: 'css',
    label: 'CSS',
    language: 'css',
    title: 'styles.css',
    code: cssCode,
  },
]);
