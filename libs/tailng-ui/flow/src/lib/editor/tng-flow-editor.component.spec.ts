import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FCreateConnectionEvent,
  FDeleteSelectedEvent,
  FMinimapComponent,
  FMoveNodesEvent,
  FSelectionChangeEvent,
} from '@foblex/flow';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { TngFlowEditorComponent } from './tng-flow-editor.component';
import { TngFlowNodeTemplateDirective } from '../node-template/tng-flow-node-template.directive';
import { createTngFlowPaletteItemEnvelope } from '../palette-item/tng-flow-palette-item.directive';
import type { TngFlowValidationIssueActivatedEvent } from '../types/tng-flow-events.types';
import type { TngFlowPresentation } from '../types/tng-flow-presentation.types';
import type { TngFlowValidation } from '../types/tng-flow-validation.types';
import type {
  TngFlowDefinition,
  TngFlowConnectionRejectedEvent,
  TngFlowNode,
  TngFlowNodeCreateRequest,
  TngFlowNodePositionChange,
  TngFlowNodesMovedEvent,
  TngFlowPaletteItem,
} from '../types/tng-flow.types';

const specDirectory = dirname(fileURLToPath(import.meta.url));
const editorStyles = readFileSync(resolve(specDirectory, 'tng-flow-editor.component.css'), 'utf8');

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
      [presentation]="presentation()"
      [validation]="validation()"
      [fitOnInit]="false"
    >
      <ng-template tngFlowNode="tool" let-node let-view="view" let-issues="issues">
        <article
          data-testid="custom-node"
          [attr.data-validation]="view.validationSeverity"
          [attr.data-issue-count]="issues.length"
        >
          {{ node.data.summary }} / {{ view.selected ? 'selected' : 'idle' }}
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
  public readonly presentation = signal<TngFlowPresentation>({});
  public readonly validation = signal<TngFlowValidation>({ issues: [] });
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
  onCreateNode: (event: {
    data: unknown;
    externalItemRect: { x: number; y: number; width: number; height: number };
  }) => void;
  onSelectionChange: (event: FSelectionChangeEvent) => void;
  onDeleteSelected: (event: FDeleteSelectedEvent) => void;
  onViewportChange: (event: { position: { x: number; y: number }; scale: number }) => void;
  onReassignConnection: (event: {
    connectionId: string;
    endpoint: 'source' | 'target';
    previousSourceId: string;
    nextSourceId: string | undefined;
    previousTargetId: string;
    nextTargetId: string | undefined;
    dropPosition: { x: number; y: number };
  }) => void;
  onReady: () => void;
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

  it('uses the editor selection ring without duplicating the default-node outline', () => {
    const fixture = TestBed.createComponent(FlowEditorHost);
    fixture.componentInstance.selection.set({
      nodeIds: new Set(['custom', 'default']),
      connectionIds: new Set(),
    });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const defaultNode = host.querySelector<HTMLElement>('[data-node-id="default"] tng-flow-node');
    expect(host.querySelector('[data-testid="custom-node"]')?.textContent).toContain('selected');
    expect(editorStyles).toMatch(
      /\.tng-flow-editor__node--selected \.tng-flow-editor__node-content\s*\{/,
    );
    expect(editorStyles).toMatch(
      /\.tng-flow-editor__node-content > tng-flow-node\s*\{[^}]*--tng-flow-node-selection-outline:\s*none;/s,
    );
    expect(defaultNode?.hasAttribute('data-selected')).toBe(true);
  });

  it('provides resolved presentation and indexed issues to custom node templates', () => {
    const fixture = TestBed.createComponent(FlowEditorHost);
    fixture.componentInstance.presentation.set({
      nodes: { custom: { status: 'running', highlighted: true } },
    });
    fixture.componentInstance.validation.set({
      issues: [
        {
          id: 'custom-warning',
          code: 'review',
          severity: 'warning',
          message: 'Review the custom node.',
          target: { kind: 'node', nodeId: 'custom' },
        },
      ],
    });
    fixture.detectChanges();

    const customNode = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="custom-node"]',
    );
    expect(customNode?.getAttribute('data-validation')).toBe('warning');
    expect(customNode?.getAttribute('data-issue-count')).toBe('1');
  });

  it('keeps runtime status separate from node and port validation', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('presentation', {
      nodes: { default: { status: 'running', progress: 40 } },
    });
    fixture.componentRef.setInput('validation', {
      issues: [
        {
          id: 'node-warning',
          code: 'review',
          severity: 'warning',
          message: 'Review the node.',
          target: { kind: 'node', nodeId: 'default' },
        },
        {
          id: 'port-error',
          code: 'required-input',
          severity: 'error',
          message: 'Connect this input.',
          target: { kind: 'port', nodeId: 'default', portId: 'default-input' },
        },
      ],
    });
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const visibleNode = host.querySelector('[data-node-id="default"] tng-flow-node');
    const port = host.querySelector('[data-node-id="default"] tng-flow-port');
    const portFrame = host.querySelector('[data-port-id="default-input"]');
    expect(visibleNode?.getAttribute('data-status')).toBe('running');
    expect(visibleNode?.getAttribute('data-validation')).toBe('warning');
    expect(visibleNode?.hasAttribute('aria-invalid')).toBe(false);
    expect(port?.getAttribute('data-validation')).toBe('error');
    expect(port?.getAttribute('aria-invalid')).toBe('true');
    expect(portFrame?.getAttribute('data-direction')).toBe('input');
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

  it('projects connection motion and validation onto TailNG data attributes', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('definition', definition);
    fixture.componentRef.setInput('presentation', {
      connections: {
        'custom-to-default': {
          status: 'active',
          motion: 'flow',
          motionSpeed: 'fast',
          motionDirection: 'reverse',
          highlighted: true,
        },
        'custom-to-locked': {
          status: 'active',
          motion: 'flow',
          motionSpeed: 'slow',
        },
      },
    });
    fixture.componentRef.setInput('validation', {
      issues: [
        {
          id: 'connection-warning',
          code: 'review-path',
          severity: 'warning',
          message: 'Review this connection.',
          target: { kind: 'connection', connectionId: 'custom-to-default' },
        },
      ],
    });
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const connection = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-connection-id="custom-to-default"]',
    );
    expect(connection?.getAttribute('data-status')).toBe('active');
    expect(connection?.getAttribute('data-validation')).toBe('warning');
    expect(connection?.getAttribute('data-motion')).toBe('flow');
    expect(connection?.getAttribute('data-motion-speed')).toBe('fast');
    expect(connection?.getAttribute('data-motion-direction')).toBe('reverse');
    expect(connection?.hasAttribute('data-animated')).toBe(true);
    expect(connection?.hasAttribute('data-highlighted')).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[data-motion="flow"]'),
    ).toHaveLength(2);

    fixture.componentRef.setInput('presentation', {
      connections: { 'custom-to-default': { motion: 'none' } },
    });
    fixture.detectChanges();

    expect(connection?.getAttribute('data-motion')).toBe('none');
    expect(connection?.getAttribute('data-motion-speed')).toBe('normal');
    expect(connection?.getAttribute('data-motion-direction')).toBe('forward');
    expect(connection?.hasAttribute('data-animated')).toBe(false);
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

  it('places ports on explicitly selected top and bottom borders', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', [
      {
        id: 'vertical',
        type: 'step',
        name: 'Vertical step',
        position: { x: 40, y: 80 },
        ports: [
          { id: 'first-in', direction: 'input', kind: 'data', side: 'top' },
          { id: 'second-in', direction: 'input', kind: 'data', side: 'top' },
          { id: 'out', direction: 'output', kind: 'data', side: 'bottom' },
        ],
      },
    ]);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const topPorts = host.querySelectorAll<HTMLElement>(
      '[data-node-id="vertical"] > [data-side="top"]',
    );
    const bottomPort = host.querySelector<HTMLElement>(
      '[data-node-id="vertical"] > [data-side="bottom"]',
    );

    expect(topPorts).toHaveLength(2);
    expect(Number.parseFloat(topPorts[0].style.left)).toBeCloseTo(100 / 3);
    expect(Number.parseFloat(topPorts[1].style.left)).toBeCloseTo(200 / 3);
    expect(topPorts[0].style.top).toBe('-0.375rem');
    expect(Number.parseFloat(bottomPort?.style.left ?? '')).toBe(50);
    expect(bottomPort?.style.top).toBe('');
    expect(bottomPort?.style.bottom).toBe('-0.375rem');
    expect(bottomPort?.querySelector('tng-flow-port')?.getAttribute('data-side')).toBe('bottom');
  });

  it('uses the same minimum height for port positioning and the visible default node', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', [
      {
        id: 'merge',
        type: 'merge',
        name: 'Merge decision',
        position: { x: 40, y: 80 },
        inputs: [
          { id: 'assessment', direction: 'input', label: 'Assessment' },
          { id: 'review', direction: 'input', label: 'Review' },
        ],
        outputs: [{ id: 'decision', direction: 'output', label: 'Decision' }],
      },
    ]);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const node = host.querySelector<HTMLElement>('[data-node-id="merge"]');
    const nodeContent = node?.querySelector<HTMLElement>('.tng-flow-editor__node-content');
    const visibleNode = nodeContent?.querySelector<HTMLElement>('tng-flow-node');
    const inputPorts = node?.querySelectorAll<HTMLElement>('.tng-flow-editor__port--input');
    const outputPort = node?.querySelector<HTMLElement>('.tng-flow-editor__port--output');

    expect(node?.style.minHeight).toBe('116px');
    expect(nodeContent?.style.minHeight).toBe('116px');
    expect(visibleNode?.style.minHeight).toBe('116px');
    expect(Number.parseFloat(inputPorts?.[0]?.style.top ?? '')).toBeCloseTo(100 / 3);
    expect(Number.parseFloat(inputPorts?.[1]?.style.top ?? '')).toBeCloseTo(200 / 3);
    expect(Number.parseFloat(outputPort?.style.top ?? '')).toBe(50);
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

  it('emits controlled node-create requests for branded palette drops', () => {
    const fixture = TestBed.createComponent(
      TngFlowEditorComponent<{
        summary: string;
      }>,
    );
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.componentRef.setInput('snapToGrid', true);
    fixture.componentRef.setInput('gridSize', 16);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const created = vi.fn<(event: TngFlowNodeCreateRequest<{ summary: string }>) => void>();
    const item: TngFlowPaletteItem<{ summary: string }> = {
      id: 'model-palette-item',
      type: 'model',
      name: 'Model',
      data: { summary: 'New model' },
    };
    editor.nodeCreateRequested.subscribe(created);

    harness.onCreateNode({
      data: createTngFlowPaletteItemEnvelope(item),
      externalItemRect: { x: 103, y: 73, width: 280, height: 112 },
    });
    harness.onCreateNode({
      data: item,
      externalItemRect: { x: 200, y: 200, width: 280, height: 112 },
    });

    expect(created).toHaveBeenCalledOnce();
    expect(created).toHaveBeenCalledWith({
      item,
      position: { x: 96, y: 80 },
      source: 'pointer',
    });
    expect(nodes[0].position).toEqual({ x: 40, y: 80 });
  });

  it('supports explicit keyboard/API placement and blocks creation outside edit mode', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent<{ summary: string }>);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const created = vi.fn<(event: TngFlowNodeCreateRequest<{ summary: string }>) => void>();
    const item: TngFlowPaletteItem<{ summary: string }> = {
      id: 'tool-palette-item',
      type: 'tool',
      name: 'Tool',
    };
    editor.nodeCreateRequested.subscribe(created);

    editor.requestNodeCreate(item, { x: 120, y: 144 }, 'keyboard');
    fixture.componentRef.setInput('mode', 'inspect');
    fixture.detectChanges();
    editor.requestNodeCreate(item, { x: 300, y: 300 }, 'api');

    expect(created).toHaveBeenCalledOnce();
    expect(created).toHaveBeenCalledWith({
      item,
      position: { x: 120, y: 144 },
      source: 'keyboard',
    });
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

  it('activates nodes by double click and Enter only in edit and inspect modes', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('selection', {
      nodeIds: new Set(['custom']),
      connectionIds: new Set(),
    });
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const activated = vi.fn();
    editor.nodeActivated.subscribe(activated);
    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector('[data-node-id="custom"]')
      ?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.componentRef.setInput('mode', 'inspect');
    fixture.detectChanges();
    host.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    fixture.componentRef.setInput('mode', 'readonly');
    fixture.detectChanges();
    host
      .querySelector('[data-node-id="custom"]')
      ?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    expect(activated.mock.calls).toEqual([
      [{ nodeId: 'custom', source: 'pointer' }],
      [{ nodeId: 'custom', source: 'keyboard' }],
    ]);
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
    expect(rejected.mock.calls[0]?.[0]).toMatchObject({
      code: 'invalid-source-direction',
      origin: 'tailng',
    });
  });

  it('skips malformed persisted connections and reports their structural issue safely', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('definition', {
      id: 'malformed',
      nodes,
      connections: [
        {
          id: 'broken',
          source: { nodeId: 'missing', portId: 'output' },
          target: { nodeId: 'default', portId: 'default-input' },
        },
      ],
    });
    fixture.componentRef.setInput('fitOnInit', false);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('f-connection')).toHaveLength(0);
    expect(fixture.componentInstance.validationIssues().map((issue) => issue.code)).toContain(
      'missing-source-node',
    );
  });

  it('reveals a target, requests controlled selection, and activates issues by stable id', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('validation', {
      issues: [
        {
          id: 'reveal-node',
          code: 'review',
          severity: 'warning',
          message: 'Review this node.',
          target: { kind: 'node', nodeId: 'default' },
        },
      ],
    });
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const selected = vi.fn();
    const issueActivated = vi.fn<(event: TngFlowValidationIssueActivatedEvent) => void>();
    const centerNode = vi.spyOn(editor, 'centerNode').mockReturnValue(true);
    editor.selectionChange.subscribe(selected);
    editor.validationIssueActivated.subscribe(issueActivated);
    harness.onReady();

    expect(editor.revealTarget({ kind: 'node', nodeId: 'default' }, { select: true })).toBe(true);
    expect(centerNode).toHaveBeenCalledWith('default', true);
    expect(selected).toHaveBeenCalledWith({
      nodeIds: new Set(['default']),
      connectionIds: new Set(),
    });
    expect(editor.activateValidationIssue('reveal-node')).toBe(true);
    expect(issueActivated.mock.calls[0]?.[0]).toMatchObject({
      source: 'api',
      issue: { id: 'reveal-node' },
    });
  });

  it('runs the consumer validator after built-in validation', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    const validator = vi.fn(() => ({
      valid: false as const,
      code: 'consumer-rule',
      reason: 'Consumer rejected this pair.',
    }));
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
    expect(rejected.mock.calls[0]?.[0]).toMatchObject({
      code: 'consumer-rule',
      origin: 'consumer',
    });
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

  it('emits the canonical viewport output together with its deprecated alias', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const editor = fixture.componentInstance;
    const harness = editor as unknown as EditorEventHarness;
    const canonical = vi.fn();
    const legacy = vi.fn();
    editor.viewportChange.subscribe(canonical);
    editor.viewportChanged.subscribe(legacy);

    harness.onViewportChange({ position: { x: -24, y: 32 }, scale: 1.15 });

    expect(canonical).toHaveBeenCalledWith({ position: { x: -24, y: 32 }, scale: 1.15 });
    expect(legacy).toHaveBeenCalledWith({ position: { x: -24, y: 32 }, scale: 1.15 });
  });

  it('keeps the minimap opt-in and applies accessible default options', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.tng-flow-editor__minimap-shell'),
    ).toBeNull();

    fixture.componentRef.setInput('showMinimap', true);
    fixture.detectChanges();

    const shell = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tng-flow-editor__minimap-shell',
    );
    const minimap = fixture.debugElement.query(
      (debugElement) => debugElement.componentInstance instanceof FMinimapComponent,
    ).componentInstance as FMinimapComponent;
    expect(shell?.getAttribute('data-position')).toBe('bottom-left');
    expect(shell?.getAttribute('role')).toBe('group');
    expect(shell?.getAttribute('tabindex')).toBe('0');
    expect(shell?.getAttribute('aria-label')).toBe('Workflow overview');
    expect(shell?.style.width).toBe('140px');
    expect(shell?.style.height).toBe('120px');
    expect(minimap.fMinSize()).toBe(1000);
    expect(minimap.fNodeRenderLimit()).toBe(10000);
  });

  it('normalizes custom minimap options and hides non-interactive overviews from assistive tech', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('showMinimap', true);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.componentRef.setInput('minimapOptions', {
      position: 'top-right',
      width: 196,
      height: 108,
      minSize: 720,
      nodeRenderLimit: 12,
      interactive: false,
      ariaLabel: 'Process map',
    });
    fixture.detectChanges();

    const shell = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tng-flow-editor__minimap-shell',
    );
    const minimapElement = shell?.querySelector<HTMLElement>('f-minimap');
    const minimap = fixture.debugElement.query(
      (debugElement) => debugElement.componentInstance instanceof FMinimapComponent,
    ).componentInstance as FMinimapComponent;
    expect(shell?.getAttribute('data-position')).toBe('top-right');
    expect(shell?.getAttribute('aria-hidden')).toBe('true');
    expect(shell?.hasAttribute('tabindex')).toBe(false);
    expect(shell?.hasAttribute('role')).toBe(false);
    expect(shell?.style.width).toBe('196px');
    expect(shell?.style.height).toBe('108px');
    expect(minimapElement?.style.pointerEvents).toBe('none');
    expect(minimap.fMinSize()).toBe(720);
    expect(minimap.fNodeRenderLimit()).toBe(12);
  });

  it('maps TailNG node presentation and validation states to minimap classes', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', [nodes[0], { ...nodes[1], disabled: true }]);
    fixture.componentRef.setInput('selection', {
      nodeIds: new Set(['custom']),
      connectionIds: new Set(),
    });
    fixture.componentRef.setInput('presentation', {
      nodes: { custom: { highlighted: true } },
    });
    fixture.componentRef.setInput('validation', {
      issues: [
        {
          id: 'invalid-default',
          code: 'invalid',
          severity: 'error',
          message: 'Default node is invalid.',
          target: { kind: 'node', nodeId: 'default' },
        },
      ],
    });
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const harness = fixture.componentInstance as unknown as {
      minimapClassesFor: (nodeId: string) => string[];
    };
    expect(harness.minimapClassesFor('custom')).toEqual([
      'tng-flow-minimap__node',
      'tng-flow-minimap__node--selected',
      'tng-flow-minimap__node--highlighted',
    ]);
    expect(harness.minimapClassesFor('default')).toEqual([
      'tng-flow-minimap__node',
      'tng-flow-minimap__node--disabled',
      'tng-flow-minimap__node--error',
    ]);
  });

  it('keeps minimap viewport navigation active in readonly mode without graph mutations', async () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('showMinimap', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();

    const viewportChanged = vi.fn();
    const nodesMoved = vi.fn();
    const fitToScreen = vi.spyOn(fixture.componentInstance, 'fitToScreen');
    fixture.componentInstance.viewportChange.subscribe(viewportChanged);
    fixture.componentInstance.nodesMoved.subscribe(nodesMoved);
    const shell = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tng-flow-editor__minimap-shell',
    );
    const arrowEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowRight',
    });
    shell?.dispatchEvent(arrowEvent);
    await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));

    expect(arrowEvent.defaultPrevented).toBe(true);
    expect(viewportChanged).toHaveBeenCalledWith({ position: { x: -40, y: 0 }, scale: 1 });
    expect(nodesMoved).not.toHaveBeenCalled();

    shell?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Home' }),
    );
    expect(fitToScreen).toHaveBeenCalledOnce();
  });

  it('keeps navigation available and reports when node rectangles exceed the render limit', () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('showMinimap', true);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.componentRef.setInput('minimapOptions', { nodeRenderLimit: 1 });
    fixture.detectChanges();

    const shell = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tng-flow-editor__minimap-shell',
    );
    expect(shell?.hasAttribute('data-limited')).toBe(true);
    expect(shell?.querySelector('.tng-flow-editor__minimap-limit')?.textContent).toContain(
      'Overview simplified',
    );
    expect(shell?.querySelector<HTMLElement>('f-minimap')?.style.pointerEvents).toBe('auto');
  });
});
