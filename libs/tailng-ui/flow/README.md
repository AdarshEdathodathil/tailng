# @tailng-ui/flow

An Angular workflow editor for AI agents and automation applications. It wraps Foblex Flow with a controlled TailNG API: the application owns graph state and persistence, while the editor emits typed user intents.

## Install

```bash
pnpm add @tailng-ui/flow @tailng-ui/components @tailng-ui/icons @foblex/flow @foblex/platform @foblex/mediator @foblex/2d @foblex/utils
```

Add the global flow styles once in your application styles:

```css
@import '@tailng-ui/flow/styles.css';
```

The stylesheet maps Foblex surfaces, text, borders, connections, and interaction colors to TailNG
semantic tokens. Runtime TailNG preset and light/dark mode changes therefore update the editor
without an additional theme class.

## Basic editor

```ts
import { Component, signal } from '@angular/core';
import { TngFlowEditorComponent, type TngFlowConnection, type TngFlowNode } from '@tailng-ui/flow';

@Component({
  selector: 'app-agent-workflow',
  imports: [TngFlowEditorComponent],
  template: `
    <tng-flow-editor
      [nodes]="nodes()"
      [connections]="connections()"
      [nodeViews]="nodeViews()"
      (nodesMoved)="moveNodes($event.nodes)"
      (connectionCreated)="createConnection($event)"
      (deleteRequested)="deleteItems($event)"
    />
  `,
})
export class AgentWorkflowComponent {
  readonly nodes = signal<readonly TngFlowNode[]>([
    {
      id: 'prompt',
      type: 'prompt',
      name: 'Prompt',
      description: 'Prepare the model input.',
      icon: 'message-square',
      position: { x: 80, y: 120 },
      outputs: [{ id: 'prompt-output', label: 'Prompt' }],
    },
    {
      id: 'model',
      type: 'model',
      name: 'Model',
      description: 'Run the selected model.',
      icon: 'sparkles',
      position: { x: 440, y: 120 },
      inputs: [{ id: 'model-input', label: 'Prompt' }],
    },
  ]);

  readonly connections = signal<readonly TngFlowConnection[]>([
    {
      id: 'prompt-to-model',
      sourcePortId: 'prompt-output',
      targetPortId: 'model-input',
      type: 'bezier',
    },
  ]);

  readonly nodeViews = signal({
    model: { status: 'running' as const, progress: 42 },
  });

  moveNodes(moves: readonly { id: string; position: { x: number; y: number } }[]): void {
    const positions = new Map(moves.map((move) => [move.id, move.position]));
    this.nodes.update((nodes) =>
      nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position })),
    );
  }

  createConnection(event: { sourcePortId: string; targetPortId: string }): void {
    this.connections.update((connections) => [
      ...connections,
      {
        id: crypto.randomUUID(),
        sourcePortId: event.sourcePortId,
        targetPortId: event.targetPortId,
      },
    ]);
  }

  deleteItems(event: { nodeIds: readonly string[]; connectionIds: readonly string[] }): void {
    const nodeIds = new Set(event.nodeIds);
    const connectionIds = new Set(event.connectionIds);
    this.nodes.update((nodes) => nodes.filter((node) => !nodeIds.has(node.id)));
    this.connections.update((connections) =>
      connections.filter((connection) => !connectionIds.has(connection.id)),
    );
  }
}
```

The editor host has a default height of `36rem`. Override the host height from the consuming component when necessary.

## Custom node content

Custom templates replace only the node content. TailNG Flow retains the Foblex node host, drag handle, connector DOM, selection, and accessibility behavior.

```html
<tng-flow-editor [nodes]="nodes()" [connections]="connections()">
  <ng-template tngFlowNode="tool" let-node let-view="view" let-selected="selected">
    <app-tool-node [tool]="node.data" [status]="view.status" [selected]="selected" />
  </ng-template>
</tng-flow-editor>
```

Import `TngFlowNodeTemplateDirective` in the consuming component alongside `TngFlowEditorComponent`.

## State ownership

TailNG Flow does not mutate `nodes` or `connections`. Handle `nodesMoved`, `connectionCreated`, `connectionReassigned`, `selectionChanged`, and `deleteRequested`, update application state with new array/object references, and persist that state where appropriate.

Set `[readonly]="true"` for execution monitoring. Pan, zoom, selection, and viewport controls remain available while graph mutations are disabled.
