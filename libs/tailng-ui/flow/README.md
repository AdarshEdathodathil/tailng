# @tailng-ui/flow

An Angular workflow editor for AI agents and automation applications. It wraps Foblex Flow with a controlled TailNG API: the application owns graph state, selection, identity, and persistence, while the editor emits typed user requests.

## Install

```bash
pnpm add @tailng-ui/flow @tailng-ui/components @tailng-ui/icons \
  @foblex/flow @foblex/platform @foblex/mediator @foblex/2d @foblex/utils
```

Add the global flow styles once:

```css
@import '@tailng-ui/flow/styles.css';
```

## Controlled editor

```ts
import { Component, signal } from '@angular/core';
import {
  TngFlowEditorComponent,
  type TngFlowConnectionCreateRequest,
  type TngFlowConnectionValidator,
  type TngFlowConnectionsDeleteRequest,
  type TngFlowDefinition,
  type TngFlowNodesDeleteRequest,
  type TngFlowPresentation,
  type TngFlowSelection,
  type TngFlowValidation,
} from '@tailng-ui/flow';

const initialWorkflow: TngFlowDefinition = {
  id: 'agent-workflow',
  nodes: [
    {
      id: 'prompt',
      type: 'prompt',
      name: 'Prompt',
      position: { x: 80, y: 120 },
      ports: [
        {
          id: 'result',
          direction: 'output',
          kind: 'data',
          dataType: 'text',
          multiple: true,
        },
      ],
    },
    {
      id: 'model',
      type: 'model',
      name: 'Model',
      position: { x: 440, y: 120 },
      ports: [
        {
          id: 'prompt',
          direction: 'input',
          kind: 'data',
          dataType: 'text',
        },
      ],
    },
  ],
  connections: [],
};

const emptySelection = (): TngFlowSelection => ({
  nodeIds: new Set(),
  connectionIds: new Set(),
});

@Component({
  imports: [TngFlowEditorComponent],
  template: `
    <tng-flow-editor
      [definition]="workflow()"
      [selection]="selection()"
      [presentation]="presentation"
      [validation]="validation"
      (connectionCreateRequested)="createConnection($event)"
      (connectionsDeleteRequested)="deleteConnections($event)"
      (nodesDeleteRequested)="deleteNodes($event)"
      (selectionChange)="selection.set($event)"
    />
  `,
})
export class AgentWorkflowComponent {
  readonly workflow = signal(initialWorkflow);
  readonly selection = signal(emptySelection());
  readonly presentation: TngFlowPresentation = {
    nodes: { model: { status: 'running', progress: 60 } },
  };
  readonly validation: TngFlowValidation = { issues: [] };

  createConnection(request: TngFlowConnectionCreateRequest): void {
    this.workflow.update((workflow) => ({
      ...workflow,
      connections: [
        ...workflow.connections,
        { id: crypto.randomUUID(), ...request, type: 'bezier' },
      ],
    }));
  }

  deleteConnections(request: TngFlowConnectionsDeleteRequest): void {
    const ids = new Set(request.connectionIds);
    this.workflow.update((workflow) => ({
      ...workflow,
      connections: workflow.connections.filter((connection) => !ids.has(connection.id)),
    }));
  }

  deleteNodes(request: TngFlowNodesDeleteRequest): void {
    const ids = new Set(request.nodeIds);
    this.workflow.update((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.filter((node) => !ids.has(node.id)),
      connections: workflow.connections.filter(
        (connection) => !ids.has(connection.source.nodeId) && !ids.has(connection.target.nodeId),
      ),
    }));
  }
}
```

The editor never mutates `definition` or creates node or connection IDs. Event handlers update the application signal or store and pass a new snapshot back.

## Port sides

Ports default to the horizontal layout: inputs on `left` and outputs on `right`. Set `side` on
individual ports when a workflow runs vertically or mixes layout directions:

```ts
ports: [
  { id: 'input', direction: 'input', kind: 'data', side: 'top' },
  { id: 'output', direction: 'output', kind: 'data', side: 'bottom' },
];
```

The supported sides are `top`, `right`, `bottom`, and `left`. Ports sharing a side are distributed
evenly along that border.

## Palette and node creation

Use the headless `TngFlowPaletteItemDirective` on native buttons. A drag emits a controlled
`nodeCreateRequested` event at the dropped canvas position; activation can call
`requestNodeCreate()` to use the visible viewport center.

```html
<aside aria-label="Workflow node palette">
  @for (item of paletteItems; track item.id) {
  <button
    type="button"
    [tngFlowPaletteItem]="item"
    (tngFlowPaletteItemActivate)="
        editor.requestNodeCreate($event.item, undefined, $event.source)
      "
  >
    {{ item.name }}
  </button>
  }
</aside>

<tng-flow-editor
  #editor="tngFlowEditor"
  [definition]="workflow()"
  (nodeCreateRequested)="createNode($event)"
/>
```

```ts
readonly paletteItems: readonly TngFlowPaletteItem<NodeData>[] = [
  {
    id: 'model-catalog-item',
    type: 'model',
    name: 'Model',
    data: { model: 'reasoning' },
  },
];

createNode(request: TngFlowNodeCreateRequest<NodeData>): void {
  const node: TngFlowNode<NodeData> = {
    id: crypto.randomUUID(),
    type: request.item.type,
    name: request.item.name,
    data: request.item.data,
    position: request.position,
    ports: [],
  };
  this.workflow.update((workflow) => ({
    ...workflow,
    nodes: [...workflow.nodes, node],
  }));
}
```

Palette item ids identify catalog entries; the consumer still creates the workflow node id. The
directive supports disabled state plus optional preview and placeholder `TemplateRef` inputs.

## Modes

| Mode       | Select | Activate | Move | Connect | Delete | Pan/zoom |
| ---------- | -----: | -------: | ---: | ------: | -----: | -------: |
| `edit`     |    Yes |      Yes |  Yes |     Yes |    Yes |      Yes |
| `inspect`  |    Yes |      Yes |   No |      No |     No |      Yes |
| `readonly` |     No |       No |   No |      No |     No |      Yes |

Use `[mode]="'inspect'"` for an interactive execution view and `[mode]="'readonly'"` for a non-selectable viewer.

## Connection validation

The editor validates direction, disabled state, self-connections, port kind, duplicates, and port multiplicity before calling the optional consumer validator.

```ts
readonly validateConnection: TngFlowConnectionValidator = (candidate) => {
  return candidate.sourcePort.dataType === candidate.targetPort.dataType
    ? { valid: true }
    : {
        valid: false,
        code: 'incompatible-data-type',
        reason: 'Port data types are incompatible.',
      };
};
```

Invalid port drops emit `connectionRejected`; dropping on empty canvas is treated as cancellation.

## Custom node content

Custom templates replace only the node body. TailNG retains geometry, connectors, controlled selection, and accessibility behavior.

```html
<tng-flow-editor [definition]="workflow()" [selection]="selection()">
  <ng-template tngFlowNode="tool" let-node let-view="view" let-issues="issues">
    <app-tool-node
      [tool]="node.data"
      [status]="view.status"
      [selected]="view.selected"
      [validationSeverity]="view.validationSeverity"
      [validationIssues]="issues"
    />
  </ng-template>
</tng-flow-editor>
```

Validation and presentation are independent controlled projections. Validation uses stable issue
ids and discriminated flow, node, port, or connection targets. Presentation adds transient runtime
status, progress, emphasis, and connection motion without changing graph data or selection.

Connection motion communicates active execution without changing the connection geometry or the
persisted flow definition:

```ts
readonly presentation: TngFlowPresentation = {
  connections: {
    'validate-to-review': {
      status: 'active',
      motion: 'flow',
      motionSpeed: 'normal',
      motionDirection: 'forward',
    },
  },
};
```

`motion` defaults to `none`, `motionSpeed` to `normal`, and `motionDirection` to `forward`.
Slow, normal, and fast duration tokens can be overridden on an individual editor. When the user
prefers reduced motion, the animated dash becomes a static emphasized path.

Use `revealTarget(target, { select: true })` to navigate to a known validation target. Node and
connection double-clicks emit generic activation events in edit and inspect modes; the consuming
application decides whether to open an inspector or take another action.

The editor host has a default height of `36rem`; override the host height in the consuming component when needed.

## Keyboard interaction

- `Delete` / `Backspace`: request deletion of editable selected elements.
- `Escape`: clear selection or cancel connection creation.
- `Command/Ctrl + A`: select all in edit mode.
- `Enter`: activate the focused or sole selected node/connection in edit and inspect modes.
- Shift, Command, or Ctrl while clicking: toggle multi-selection.

Palette buttons use their native Enter and Space activation. The example above routes that
activation through the editor's controlled node-creation request.

Keyboard commands only act while the flow has focus and never intercept text editing inside custom nodes.

## Compatibility

The `inputs`/`outputs`, `nodeViews`, `readonly`, connection-presentation `animated`,
`connectionCreated`, `connectionReassigned`, `selectionChanged`, and combined `deleteRequested`
APIs remain available as deprecated aliases for one compatibility cycle. New code should use
`ports`, `presentation` with `motion`, `mode`, controlled `selection`, and the request outputs
documented above.
