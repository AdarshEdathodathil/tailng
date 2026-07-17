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
  type TngFlowSelection,
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

The editor never mutates `definition` or creates connection IDs. Event handlers update the application signal or store and pass a new snapshot back.

## Modes

| Mode       | Select | Move | Connect | Delete | Pan/zoom |
| ---------- | -----: | ---: | ------: | -----: | -------: |
| `edit`     |    Yes |  Yes |     Yes |    Yes |      Yes |
| `inspect`  |    Yes |   No |      No |     No |      Yes |
| `readonly` |     No |   No |      No |     No |      Yes |

Use `[mode]="'inspect'"` for an interactive execution view and `[mode]="'readonly'"` for a non-selectable viewer.

## Connection validation

The editor validates direction, disabled state, self-connections, port kind, duplicates, and port multiplicity before calling the optional consumer validator.

```ts
readonly validateConnection: TngFlowConnectionValidator = (candidate) => {
  return candidate.sourcePort.dataType === candidate.targetPort.dataType
    ? { valid: true }
    : { valid: false, reason: 'Port data types are incompatible.' };
};
```

Invalid port drops emit `connectionRejected`; dropping on empty canvas is treated as cancellation.

## Custom node content

Custom templates replace only the node body. TailNG retains geometry, connectors, controlled selection, and accessibility behavior.

```html
<tng-flow-editor [definition]="workflow()" [selection]="selection()">
  <ng-template tngFlowNode="tool" let-node let-view="view" let-mode="mode" let-selected="selected">
    <app-tool-node [tool]="node.data" [status]="view.status" [mode]="mode" [selected]="selected" />
  </ng-template>
</tng-flow-editor>
```

The editor host has a default height of `36rem`; override the host height in the consuming component when needed.

## Keyboard interaction

- `Delete` / `Backspace`: request deletion of editable selected elements.
- `Escape`: clear selection or cancel connection creation.
- `Command/Ctrl + A`: select all in edit mode.
- Shift, Command, or Ctrl while clicking: toggle multi-selection.

Keyboard commands only act while the flow has focus and never intercept text editing inside custom nodes.

## Compatibility

The Milestone 1 `inputs`/`outputs`, `readonly`, `connectionCreated`, `connectionReassigned`, `selectionChanged`, and combined `deleteRequested` APIs remain available as deprecated aliases for one compatibility cycle. New code should use `ports`, `mode`, controlled `selection`, and the request outputs documented above.
