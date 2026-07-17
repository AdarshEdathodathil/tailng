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
import type { TngFlowNode, TngFlowNodesMovedEvent } from '../types/tng-flow.types';

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

@Component({
  imports: [TngFlowEditorComponent, TngFlowNodeTemplateDirective],
  template: `
    <tng-flow-editor [nodes]="nodes()" [connections]="[]" [fitOnInit]="false">
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
}

type EditorEventHarness = Readonly<{
  onMoveNodes: (event: FMoveNodesEvent) => void;
  onCreateConnection: (event: FCreateConnectionEvent) => void;
  onSelectionChange: (event: FSelectionChangeEvent) => void;
  onDeleteSelected: (event: FDeleteSelectedEvent) => void;
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

  it('translates Foblex gestures into controlled TailNG events', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const moved = vi.fn<(event: TngFlowNodesMovedEvent) => void>();
    const created = vi.fn();
    const selected = vi.fn();
    const deleted = vi.fn();

    editor.nodesMoved.subscribe(moved);
    editor.connectionCreated.subscribe(created);
    editor.selectionChanged.subscribe(selected);
    editor.deleteRequested.subscribe(deleted);

    harness.onMoveNodes(new FMoveNodesEvent([{ id: 'custom', position: { x: 120, y: 160 } }]));
    harness.onCreateConnection(
      new FCreateConnectionEvent('custom-output', 'default-input', { x: 240, y: 160 }),
    );
    harness.onSelectionChange(new FSelectionChangeEvent(['custom'], [], []));
    harness.onDeleteSelected(new FDeleteSelectedEvent(['custom'], [], []));

    expect(moved).toHaveBeenCalledWith({
      nodes: [{ id: 'custom', position: { x: 120, y: 160 } }],
    });
    expect(created).toHaveBeenCalledWith({
      sourcePortId: 'custom-output',
      targetPortId: 'default-input',
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

    editor.connectionCreated.subscribe(created);
    editor.deleteRequested.subscribe(deleted);
    harness.onCreateConnection(
      new FCreateConnectionEvent('custom-output', 'default-input', { x: 0, y: 0 }),
    );
    harness.onDeleteSelected(new FDeleteSelectedEvent(['custom'], [], []));

    expect(created).not.toHaveBeenCalled();
    expect(deleted).not.toHaveBeenCalled();
  });
});
