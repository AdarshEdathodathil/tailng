import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FCreateConnectionEvent,
  FDeleteSelectedEvent,
  FMoveNodesEvent,
  FSelectionChangeEvent,
} from '@foblex/flow';
import { describe, expect, it, vi } from 'vitest';
import { TngFlowEditorComponent } from './tng-flow-editor.component';
import { TngFlowNodeTemplateDirective } from '../node-template/tng-flow-node-template.directive';
import type {
  TngFlowDefinition,
  TngFlowConnectionRejectedEvent,
  TngFlowNode,
  TngFlowNodePositionChange,
  TngFlowNodesMovedEvent,
} from '../types/tng-flow.types';

const nodes: readonly TngFlowNode<{ summary: string }>[] = [
  {
    id: 'custom',
    type: 'tool',
    name: 'Custom tool',
    position: { x: 40, y: 80 },
    data: { summary: 'Custom template content' },
    outputs: [{ id: 'custom-output', label: 'Result' }],
  },
  {
    id: 'default',
    type: 'model',
    name: 'Default model',
    position: { x: 360, y: 80 },
    data: { summary: 'Default template content' },
    inputs: [{ id: 'default-input', label: 'Prompt' }],
  },
];

const definition: TngFlowDefinition<{ summary: string }> = {
  id: 'milestone-one',
  name: 'Milestone one workflow',
  nodes: [
    nodes[0],
    nodes[1],
    {
      id: 'locked',
      type: 'response',
      name: 'Locked response',
      position: { x: 680, y: 80 },
      data: { summary: 'Cannot be dragged' },
      inputs: [{ id: 'locked-input', name: 'Answer', kind: 'control', required: true }],
      locked: true,
    },
  ],
  connections: [
    {
      id: 'custom-to-default',
      source: { nodeId: 'custom', portId: 'custom-output' },
      target: { nodeId: 'default', portId: 'default-input' },
    },
    {
      id: 'custom-to-locked',
      source: { nodeId: 'custom', portId: 'custom-output' },
      target: { nodeId: 'locked', portId: 'locked-input' },
      reassignable: false,
    },
  ],
};

@Component({
  imports: [TngFlowEditorComponent, TngFlowNodeTemplateDirective],
  template: `
    <tng-flow-editor
      [nodes]="nodes()"
      [connections]="[]"
      [selection]="selection()"
      [fitOnInit]="false"
    >
      <ng-template tngFlowNode="tool" let-node let-selected="selected">
        <article data-testid="custom-node">
          {{ node.data.summary }} / {{ selected ? 'selected' : 'idle' }}
        </article>
      </ng-template>
    </tng-flow-editor>
  `,
})
class FlowEditorHost {
  public readonly nodes = signal(nodes);
  public readonly selection = signal({
    nodeIds: new Set<string>(),
    connectionIds: new Set<string>(),
  });
}

@Component({
  imports: [TngFlowEditorComponent, TngFlowNodeTemplateDirective],
  template: `
    <tng-flow-editor [definition]="definition" [fitOnInit]="false">
      <ng-template tngFlowNode="tool" let-node>
        <article data-testid="definition-custom-node">{{ node.data.summary }}</article>
      </ng-template>
    </tng-flow-editor>
  `,
})
class FlowDefinitionHost {
  protected readonly definition = definition;
}

type EditorEventHarness = Readonly<{
  onMoveNodes: (event: FMoveNodesEvent) => void;
  onCreateConnection: (event: FCreateConnectionEvent) => void;
  onSelectionChange: (event: FSelectionChangeEvent) => void;
  onDeleteSelected: (event: FDeleteSelectedEvent) => void;
  onReassignConnection: (event: {
    connectionId: string;
    endpoint: 'source' | 'target';
    previousSourceId: string;
    nextSourceId: string | undefined;
    previousTargetId: string;
    nextTargetId: string | undefined;
    dropPosition: { x: number; y: number };
  }) => void;
  portPositionPercent: (index: number, count: number) => number;
}>;

describe('TngFlowEditorComponent', () => {
  it('renders default nodes, consumer templates, and editor-owned ports', () => {
    const fixture = TestBed.createComponent(FlowEditorHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[data-testid="custom-node"]')?.textContent).toContain(
      'Custom template content',
    );
    expect(host.textContent).toContain('Default model');
    expect(host.querySelectorAll('[fconnector]')).toHaveLength(2);
    expect(host.querySelector('[data-node-id="custom"]')).not.toBeNull();
  });

  it('renders custom-template selection from the controlled selection input', () => {
    const fixture = TestBed.createComponent(FlowEditorHost);
    fixture.componentInstance.selection.set({
      nodeIds: new Set(['custom']),
      connectionIds: new Set(),
    });
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="custom-node"]')
        ?.textContent,
    ).toContain('selected');
  });

  it('renders a complete definition with exact connections and locked nodes', () => {
    const fixture = TestBed.createComponent(FlowDefinitionHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('[data-node-id]')).toHaveLength(3);
    expect(host.querySelectorAll('f-connection')).toHaveLength(2);
    expect(host.querySelectorAll('tng-flow-port')).toHaveLength(3);
    expect(host.querySelector('[data-testid="definition-custom-node"]')?.textContent).toContain(
      'Custom template content',
    );
    expect(host.querySelector('[data-node-id="locked"] .tng-flow-editor__drag-handle')).toBeNull();
    expect(host.querySelector('#custom-to-default')?.classList).not.toContain(
      'f-connection-reassign-disabled',
    );
    expect(host.querySelector('#custom-to-locked')?.classList).toContain(
      'f-connection-reassign-disabled',
    );
  });

  it('distributes ports evenly across each node side', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance as unknown as EditorEventHarness;

    expect(editor.portPositionPercent(0, 1)).toBe(50);
    expect(editor.portPositionPercent(0, 2)).toBeCloseTo(100 / 3);
    expect(editor.portPositionPercent(1, 2)).toBeCloseTo(200 / 3);
    expect([
      editor.portPositionPercent(0, 3),
      editor.portPositionPercent(1, 3),
      editor.portPositionPercent(2, 3),
    ]).toEqual([25, 50, 75]);
  });

  it('translates Foblex gestures into controlled TailNG events', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const moved = vi.fn<(event: TngFlowNodesMovedEvent) => void>();
    const positionChanged = vi.fn<(event: TngFlowNodePositionChange) => void>();
    const created = vi.fn();
    const selected = vi.fn();
    const deleted = vi.fn();

    editor.nodesMoved.subscribe(moved);
    editor.nodePositionChange.subscribe(positionChanged);
    editor.connectionCreated.subscribe(created);
    editor.selectionChanged.subscribe(selected);
    editor.deleteRequested.subscribe(deleted);

    harness.onMoveNodes(new FMoveNodesEvent([{ id: 'custom', position: { x: 120, y: 160 } }]));
    harness.onCreateConnection(
      new FCreateConnectionEvent('custom::custom-output', 'default::default-input', {
        x: 240,
        y: 160,
      }),
    );
    harness.onSelectionChange(new FSelectionChangeEvent(['custom'], [], []));
    harness.onDeleteSelected(new FDeleteSelectedEvent(['custom'], [], []));

    expect(moved).toHaveBeenCalledWith({
      nodes: [{ id: 'custom', position: { x: 120, y: 160 } }],
    });
    expect(positionChanged).toHaveBeenCalledWith({
      nodeId: 'custom',
      previousPosition: { x: 40, y: 80 },
      position: { x: 120, y: 160 },
    });
    expect(nodes[0].position).toEqual({ x: 40, y: 80 });
    expect(created).toHaveBeenCalledWith({
      source: { nodeId: 'custom', portId: 'custom-output' },
      target: { nodeId: 'default', portId: 'default-input' },
      dropPosition: { x: 240, y: 160 },
    });
    expect(selected).toHaveBeenCalledWith({ nodeIds: ['custom'], connectionIds: [] });
    expect(deleted).toHaveBeenCalledWith({ nodeIds: ['custom'], connectionIds: [] });
  });

  it('blocks graph mutation events in read-only mode', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const created = vi.fn();
    const deleted = vi.fn();
    const selected = vi.fn();

    editor.connectionCreated.subscribe(created);
    editor.deleteRequested.subscribe(deleted);
    editor.selectionChange.subscribe(selected);
    harness.onCreateConnection(
      new FCreateConnectionEvent('custom::custom-output', 'default::default-input', { x: 0, y: 0 }),
    );
    harness.onDeleteSelected(new FDeleteSelectedEvent(['custom'], [], []));
    harness.onSelectionChange(new FSelectionChangeEvent(['custom'], [], []));

    expect(created).not.toHaveBeenCalled();
    expect(deleted).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
  });

  it('allows selection but blocks graph mutation requests in inspect mode', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('mode', 'inspect');
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const created = vi.fn();
    const deleted = vi.fn();
    const selected = vi.fn();
    editor.connectionCreateRequested.subscribe(created);
    editor.nodesDeleteRequested.subscribe(deleted);
    editor.selectionChange.subscribe(selected);

    harness.onCreateConnection(
      new FCreateConnectionEvent('custom::custom-output', 'default::default-input', { x: 0, y: 0 }),
    );
    harness.onDeleteSelected(new FDeleteSelectedEvent(['custom'], [], []));
    harness.onSelectionChange(new FSelectionChangeEvent(['custom'], [], []));

    expect(created).not.toHaveBeenCalled();
    expect(deleted).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledWith({
      nodeIds: new Set(['custom']),
      connectionIds: new Set(),
    });
  });

  it('emits canonical create requests and rejects invalid directions', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const created = vi.fn();
    const rejected = vi.fn<(event: TngFlowConnectionRejectedEvent) => void>();
    editor.connectionCreateRequested.subscribe(created);
    editor.connectionRejected.subscribe(rejected);

    harness.onCreateConnection(
      new FCreateConnectionEvent('default::default-input', 'custom::custom-output', { x: 0, y: 0 }),
    );
    harness.onCreateConnection(
      new FCreateConnectionEvent('default::default-input', 'default::default-input', {
        x: 0,
        y: 0,
      }),
    );

    expect(created).toHaveBeenCalledWith({
      source: { nodeId: 'custom', portId: 'custom-output' },
      target: { nodeId: 'default', portId: 'default-input' },
    });
    expect(rejected.mock.calls[0]?.[0].reason).toContain('output');
  });

  it('runs the consumer validator after built-in validation', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    const validator = vi.fn(() => ({ valid: false, reason: 'Consumer rejected this pair.' }));
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('connectionValidator', validator);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();
    validator.mockClear();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const created = vi.fn();
    const rejected = vi.fn<(event: TngFlowConnectionRejectedEvent) => void>();
    editor.connectionCreateRequested.subscribe(created);
    editor.connectionRejected.subscribe(rejected);

    harness.onCreateConnection(
      new FCreateConnectionEvent('custom::custom-output', 'default::default-input', {
        x: 0,
        y: 0,
      }),
    );

    expect(validator).toHaveBeenCalledOnce();
    expect(created).not.toHaveBeenCalled();
    expect(rejected.mock.calls[0]?.[0].reason).toBe('Consumer rejected this pair.');
  });

  it('validates reconnection and emits the complete controlled request', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('definition', {
      id: 'reconnect',
      nodes: [
        { ...nodes[0], outputs: [{ id: 'custom-output', multiple: true }] },
        {
          ...nodes[1],
          inputs: [{ id: 'default-input' }, { id: 'alternate-input' }],
        },
      ],
      connections: [definition.connections[0]],
    });
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const reconnected = vi.fn();
    editor.connectionReconnectRequested.subscribe(reconnected);

    harness.onReassignConnection({
      connectionId: 'custom-to-default',
      endpoint: 'target',
      previousSourceId: 'custom::custom-output',
      nextSourceId: undefined,
      previousTargetId: 'default::default-input',
      nextTargetId: 'default::alternate-input',
      dropPosition: { x: 0, y: 0 },
    });

    expect(reconnected).toHaveBeenCalledWith({
      connectionId: 'custom-to-default',
      previousSource: { nodeId: 'custom', portId: 'custom-output' },
      previousTarget: { nodeId: 'default', portId: 'default-input' },
      source: { nodeId: 'custom', portId: 'custom-output' },
      target: { nodeId: 'default', portId: 'alternate-input' },
      changedEndpoint: 'target',
    });
  });

  it('splits delete requests and protects locked nodes', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('definition', definition);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const nodesDeleted = vi.fn();
    const connectionsDeleted = vi.fn();
    editor.nodesDeleteRequested.subscribe(nodesDeleted);
    editor.connectionsDeleteRequested.subscribe(connectionsDeleted);

    harness.onDeleteSelected(
      new FDeleteSelectedEvent(['custom', 'locked'], [], ['custom-to-default']),
    );

    expect(nodesDeleted).toHaveBeenCalledWith({ nodeIds: ['custom'], source: 'keyboard' });
    expect(connectionsDeleted).toHaveBeenCalledWith({
      connectionIds: ['custom-to-default'],
      source: 'keyboard',
    });
  });

  it('redraws the canvas when a viewport control changes the scale', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const canvas = (fixture.nativeElement as HTMLElement).querySelector('f-canvas');
    fixture.componentInstance.zoomBy(0.15);

    expect(canvas?.style.transform).toContain('matrix(1.15');
  });
});
