import { Component, signal } from '@angular/core';
import { TngBadgeComponent } from '@tailng-ui/components';
import {
  TngFlowEditorComponent,
  TngFlowNodeComponent,
  TngFlowNodeTemplateDirective,
  TngFlowPaletteItemDirective,
  type TngFlowConnectionCandidate,
  type TngFlowConnectionCreateRequest,
  type TngFlowConnectionReconnectRequest,
  type TngFlowConnectionRejectedEvent,
  type TngFlowConnectionsDeleteRequest,
  type TngFlowConnectionValidation,
  type TngFlowDefinition,
  type TngFlowEditorMode,
  type TngFlowNodesDeleteRequest,
  type TngFlowNodeCreateRequest,
  type TngFlowNodePositionChange,
  type TngFlowNodeActivatedEvent,
  type TngFlowPaletteItem,
  type TngFlowPresentation,
  type TngFlowPort,
  type TngFlowSelection,
  type TngFlowValidation,
  type TngFlowValidationIssueActivatedEvent,
} from '@tailng-ui/flow';

type PlaygroundNodeData = Readonly<{
  summary: string;
}>;

const initialWorkflow: TngFlowDefinition<PlaygroundNodeData> = {
  id: 'milestone-three-workflow',
  name: 'Milestone three workflow',
  nodes: [
    {
      id: 'source',
      type: 'source',
      name: 'Receive request',
      description: 'Accept the incoming workflow payload.',
      position: { x: 60, y: 180 },
      data: { summary: 'Webhook request' },
      ports: [
        {
          id: 'payload',
          name: 'Payload',
          direction: 'output',
          kind: 'data',
          dataType: 'text',
          multiple: true,
        },
      ],
    },
    {
      id: 'parser',
      type: 'ai_parser',
      name: 'AI parser',
      description: 'Extract structured fields from the request.',
      position: { x: 390, y: 100 },
      data: { summary: 'Schema-aware parser · confidence 94%' },
      ports: [
        {
          id: 'payload',
          name: 'Payload',
          direction: 'input',
          kind: 'data',
          dataType: 'text',
          required: true,
        },
        {
          id: 'result',
          name: 'Result',
          direction: 'output',
          kind: 'data',
          dataType: 'json',
          multiple: true,
        },
      ],
    },
    {
      id: 'validator',
      type: 'validator',
      name: 'Validate result',
      description: 'Check the generated structure before publishing.',
      position: { x: 720, y: 100 },
      data: { summary: 'Locked layout node' },
      locked: true,
      ports: [
        {
          id: 'input',
          name: 'Input',
          direction: 'input',
          kind: 'data',
          dataType: 'json',
          required: true,
        },
        {
          id: 'output',
          name: 'Output',
          direction: 'output',
          kind: 'data',
          dataType: 'json',
          multiple: true,
        },
      ],
    },
    {
      id: 'response',
      type: 'response',
      name: 'Return response',
      description: 'Send the validated result to the caller.',
      position: { x: 1050, y: 180 },
      data: { summary: 'JSON response' },
      ports: [
        {
          id: 'result',
          name: 'Result',
          direction: 'input',
          kind: 'data',
          dataType: 'json',
          required: true,
        },
      ],
    },
  ],
  connections: [
    {
      id: 'source-to-parser',
      source: { nodeId: 'source', portId: 'payload' },
      target: { nodeId: 'parser', portId: 'payload' },
      type: 'bezier',
    },
    {
      id: 'parser-to-validator',
      source: { nodeId: 'parser', portId: 'result' },
      target: { nodeId: 'validator', portId: 'input' },
      type: 'bezier',
    },
    {
      id: 'validator-to-response',
      source: { nodeId: 'validator', portId: 'output' },
      target: { nodeId: 'response', portId: 'result' },
      type: 'bezier',
    },
  ],
};

const emptySelection = (): TngFlowSelection => ({
  nodeIds: new Set<string>(),
  connectionIds: new Set<string>(),
});

const paletteItems: readonly TngFlowPaletteItem<PlaygroundNodeData>[] = [
  {
    id: 'webhook-source',
    type: 'source',
    name: 'Webhook source',
    description: 'Receive a new external request.',
    data: { summary: 'External webhook payload' },
  },
  {
    id: 'ai-parser',
    type: 'ai_parser',
    name: 'AI parser',
    description: 'Extract structured data with a model.',
    data: { summary: 'New schema-aware parser' },
  },
  {
    id: 'response',
    type: 'response',
    name: 'Response',
    description: 'Return the final JSON payload.',
    data: { summary: 'New JSON response' },
  },
];

const sourcePalettePorts: readonly TngFlowPort[] = [
  {
    id: 'payload',
    name: 'Payload',
    direction: 'output',
    kind: 'data',
    dataType: 'text',
    multiple: true,
  },
];

const responsePalettePorts: readonly TngFlowPort[] = [
  {
    id: 'result',
    name: 'Result',
    direction: 'input',
    kind: 'data',
    dataType: 'json',
    required: true,
  },
];

const parserPalettePorts: readonly TngFlowPort[] = [
  {
    id: 'payload',
    name: 'Payload',
    direction: 'input',
    kind: 'data',
    dataType: 'text',
    required: true,
  },
  {
    id: 'result',
    name: 'Result',
    direction: 'output',
    kind: 'data',
    dataType: 'json',
    multiple: true,
  },
];

function palettePorts(type: string): readonly TngFlowPort[] {
  if (type === 'source') {
    return sourcePalettePorts;
  }
  if (type === 'response') {
    return responsePalettePorts;
  }
  return parserPalettePorts;
}

@Component({
  selector: 'app-flow-editor-playground-page',
  imports: [
    TngBadgeComponent,
    TngFlowEditorComponent,
    TngFlowNodeComponent,
    TngFlowNodeTemplateDirective,
    TngFlowPaletteItemDirective,
  ],
  templateUrl: './flow-editor-playground-page.component.html',
  host: {
    class: 'block',
  },
})
export class FlowEditorPlaygroundPageComponent {
  protected readonly editorModes: readonly TngFlowEditorMode[] = ['edit', 'inspect', 'readonly'];
  protected readonly workflow = signal(initialWorkflow);
  protected readonly paletteItems = paletteItems;
  protected readonly mode = signal<TngFlowEditorMode>('edit');
  protected readonly selection = signal<TngFlowSelection>(emptySelection());
  protected readonly validation = signal<TngFlowValidation>({
    issues: [
      {
        id: 'parser-review',
        code: 'review-recommended',
        severity: 'warning',
        message: 'Review the parser configuration before enabling this workflow.',
        target: { kind: 'node', nodeId: 'parser' },
      },
      {
        id: 'validator-required-input',
        code: 'required-input',
        severity: 'error',
        message: 'The validator input needs a verified schema mapping.',
        target: { kind: 'port', nodeId: 'validator', portId: 'input' },
      },
      {
        id: 'parser-validator-observation',
        code: 'execution-observation',
        severity: 'info',
        message: 'This connection carries the current execution payload.',
        target: { kind: 'connection', connectionId: 'parser-to-validator' },
      },
    ],
  });
  protected readonly presentation = signal<TngFlowPresentation>({
    nodes: {
      parser: {
        status: 'running',
        progress: 62,
        statusMessage: 'Parsing a sample payload',
        highlighted: true,
      },
      response: { status: 'waiting', dimmed: true },
    },
    connections: {
      'parser-to-validator': { status: 'active', animated: true, highlighted: true },
      'validator-to-response': { dimmed: true },
    },
  });
  protected readonly lastEvent = signal('Ready for an interaction.');
  protected readonly rejection = signal<string | null>(null);
  private connectionSequence = 1;
  private nodeSequence = 1;

  protected readonly validateConnection = (
    candidate: TngFlowConnectionCandidate<PlaygroundNodeData>,
  ): TngFlowConnectionValidation => {
    const sourceType = candidate.sourcePort.dataType;
    const targetType = candidate.targetPort.dataType;
    if (sourceType !== undefined && targetType !== undefined && sourceType !== targetType) {
      return {
        valid: false,
        code: 'incompatible-data-type',
        reason: 'Port data types are incompatible.',
      };
    }
    return { valid: true };
  };

  protected updateNodePosition(event: TngFlowNodePositionChange): void {
    this.workflow.update((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) =>
        node.id === event.nodeId ? { ...node, position: event.position } : node,
      ),
    }));
    this.recordEvent(`Moved ${event.nodeId}.`);
  }

  protected createConnection(request: TngFlowConnectionCreateRequest): void {
    const id = `playground-connection-${this.connectionSequence}`;
    this.connectionSequence += 1;
    this.workflow.update((workflow) => ({
      ...workflow,
      connections: [...workflow.connections, { id, ...request, type: 'bezier' }],
    }));
    this.recordEvent(`Created ${id}.`);
  }

  protected createNode(request: TngFlowNodeCreateRequest<PlaygroundNodeData>): void {
    const id = `${request.item.type}-${this.nodeSequence}`;
    this.nodeSequence += 1;
    this.workflow.update((workflow) => ({
      ...workflow,
      nodes: [
        ...workflow.nodes,
        {
          id,
          type: request.item.type,
          name: request.item.name,
          description: request.item.description,
          icon: request.item.icon,
          data: request.item.data,
          position: request.position,
          ports: palettePorts(request.item.type),
        },
      ],
    }));
    this.selection.set({ nodeIds: new Set([id]), connectionIds: new Set() });
    this.recordEvent(`Created ${id} from ${request.source} palette placement.`);
  }

  protected reconnectConnection(request: TngFlowConnectionReconnectRequest): void {
    this.workflow.update((workflow) => ({
      ...workflow,
      connections: workflow.connections.map((connection) =>
        connection.id === request.connectionId
          ? { ...connection, source: request.source, target: request.target }
          : connection,
      ),
    }));
    this.recordEvent(`Reconnected ${request.connectionId} ${request.changedEndpoint}.`);
  }

  protected deleteConnections(request: TngFlowConnectionsDeleteRequest): void {
    const deletedIds = new Set(request.connectionIds);
    this.workflow.update((workflow) => ({
      ...workflow,
      connections: workflow.connections.filter((connection) => !deletedIds.has(connection.id)),
    }));
    this.pruneSelection(new Set(), deletedIds);
    this.recordEvent(`Deleted ${request.connectionIds.length} connection(s).`);
  }

  protected deleteNodes(request: TngFlowNodesDeleteRequest): void {
    const deletedNodeIds = new Set(request.nodeIds);
    const deletedConnectionIds = new Set(
      this.workflow()
        .connections.filter(
          (connection) =>
            deletedNodeIds.has(connection.source.nodeId) ||
            deletedNodeIds.has(connection.target.nodeId),
        )
        .map((connection) => connection.id),
    );
    this.workflow.update((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.filter((node) => !deletedNodeIds.has(node.id)),
      connections: workflow.connections.filter(
        (connection) => !deletedConnectionIds.has(connection.id),
      ),
    }));
    this.pruneSelection(deletedNodeIds, deletedConnectionIds);
    this.recordEvent(`Deleted ${request.nodeIds.length} node(s).`);
  }

  protected showConnectionError(event: TngFlowConnectionRejectedEvent): void {
    this.rejection.set(event.reason);
    this.lastEvent.set(`Rejected connection: ${event.reason}`);
  }

  protected activateNode(event: TngFlowNodeActivatedEvent): void {
    this.recordEvent(`Activated ${event.nodeId} from ${event.source}.`);
  }

  protected activateValidationIssue(event: TngFlowValidationIssueActivatedEvent): void {
    this.recordEvent(`Activated validation issue ${event.issue.code} from ${event.source}.`);
  }

  protected revealFirstIssue(editor: TngFlowEditorComponent<PlaygroundNodeData>): void {
    const issue = this.validation().issues[0];
    if (issue !== undefined) {
      editor.revealTarget(issue.target, { animated: true, select: true });
      this.recordEvent(`Revealed ${issue.code}.`);
    }
  }

  protected setMode(mode: TngFlowEditorMode): void {
    this.mode.set(mode);
    this.rejection.set(null);
    this.lastEvent.set(`Changed mode to ${mode}.`);
  }

  protected nodeSummary(data: unknown): string {
    if (typeof data !== 'object' || data === null || !('summary' in data)) {
      return '';
    }
    return typeof data.summary === 'string' ? data.summary : '';
  }

  protected resetWorkflow(): void {
    this.workflow.set(initialWorkflow);
    this.selection.set(emptySelection());
    this.mode.set('edit');
    this.rejection.set(null);
    this.connectionSequence = 1;
    this.nodeSequence = 1;
    this.lastEvent.set('Workflow reset.');
  }

  private pruneSelection(
    deletedNodeIds: ReadonlySet<string>,
    deletedConnectionIds: ReadonlySet<string>,
  ): void {
    this.selection.update((selection) => ({
      nodeIds: new Set([...selection.nodeIds].filter((id) => !deletedNodeIds.has(id))),
      connectionIds: new Set(
        [...selection.connectionIds].filter((id) => !deletedConnectionIds.has(id)),
      ),
    }));
  }

  private recordEvent(message: string): void {
    this.rejection.set(null);
    this.lastEvent.set(message);
  }
}
