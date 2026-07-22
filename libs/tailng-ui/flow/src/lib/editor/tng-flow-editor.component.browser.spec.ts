import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { TngFlowEditorComponent } from './tng-flow-editor.component';
import type {
  TngFlowLayoutEngine,
  TngFlowLayoutGraph,
  TngFlowNodesLayoutRequest,
} from '../types/tng-flow-layout.types';
import type { TngFlowDefinition } from '../types/tng-flow.types';

const definition: TngFlowDefinition = Object.freeze({
  id: 'browser-contract',
  nodes: Object.freeze([
    Object.freeze({
      id: 'start',
      type: 'start',
      name: 'Start',
      position: Object.freeze({ x: 40, y: 80 }),
      ports: Object.freeze([Object.freeze({ id: 'next', direction: 'output', kind: 'control' })]),
    }),
    Object.freeze({
      id: 'finish',
      type: 'finish',
      name: 'Finish',
      position: Object.freeze({ x: 440, y: 80 }),
      ports: Object.freeze([
        Object.freeze({ id: 'previous', direction: 'input', kind: 'control' }),
      ]),
    }),
  ]),
  connections: Object.freeze([
    Object.freeze({
      id: 'start-to-finish',
      source: Object.freeze({ nodeId: 'start', portId: 'next' }),
      target: Object.freeze({ nodeId: 'finish', portId: 'previous' }),
    }),
  ]),
});

function nextPaint(): Promise<void> {
  return new Promise((resolvePaint) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolvePaint()));
  });
}

describe('TngFlowEditorComponent browser contracts', () => {
  it('renders measurable nodes and a keyboard entry point from a frozen snapshot', async () => {
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('definition', definition);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.detectChanges();
    await fixture.whenStable();
    await nextPaint();

    const host = fixture.nativeElement as HTMLElement;
    const flow = host.querySelector<HTMLElement>('f-flow');
    const start = host.querySelector<HTMLElement>('[data-node-id="start"]');
    const bounds = start?.getBoundingClientRect();

    expect(bounds?.width).toBeGreaterThan(0);
    expect(bounds?.height).toBeGreaterThan(0);
    expect(flow?.getAttribute('role')).toBe('application');
    expect(flow?.getAttribute('tabindex')).toBe('0');
    expect(definition.nodes[0].position).toEqual({ x: 40, y: 80 });
    expect(Object.isFrozen(definition.connections[0].source)).toBe(true);
  });

  it('measures rendered geometry and emits one controlled layout request', async () => {
    let measuredGraph: TngFlowLayoutGraph | undefined;
    const calculate = vi.fn<TngFlowLayoutEngine['calculate']>((graph) => {
      measuredGraph = graph;
      return Promise.resolve([
        { id: 'finish', position: { x: 520, y: 96 } },
        { id: 'start', position: { x: 40, y: 80 } },
      ]);
    });
    const fixture = TestBed.createComponent(TngFlowEditorComponent);
    fixture.componentRef.setInput('definition', definition);
    fixture.componentRef.setInput('fitOnInit', false);
    fixture.componentRef.setInput('layoutEngine', { calculate });
    const ready = new Promise<void>((resolveReady) => {
      fixture.componentInstance.ready.subscribe(() => resolveReady());
    });
    fixture.detectChanges();
    await fixture.whenStable();
    await ready;
    await nextPaint();
    const finish = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-node-id="finish"]',
    );
    if (finish !== null) {
      finish.style.width = '420px';
    }
    await nextPaint();
    const requested = vi.fn<(event: TngFlowNodesLayoutRequest) => void>();
    fixture.componentInstance.nodesLayoutRequested.subscribe(requested);
    const fitToScreen = vi.spyOn(fixture.componentInstance, 'fitToScreen');

    const accepted = await fixture.componentInstance.requestAutoLayout({
      direction: 'top-to-bottom',
      viewport: { fit: true, animated: false, padding: 32 },
    });

    expect(accepted).toBe(true);
    expect(calculate).toHaveBeenCalledOnce();
    expect(measuredGraph?.nodes.map((entry) => entry.node.id)).toEqual(['finish', 'start']);
    expect(measuredGraph?.nodes[0].bounds.size.width).toBeGreaterThan(400);
    expect(measuredGraph?.nodes.every((entry) => entry.bounds.size.height > 0)).toBe(true);
    expect(requested).toHaveBeenCalledOnce();
    expect(requested).toHaveBeenCalledWith({
      nodes: [{ id: 'finish', position: { x: 520, y: 96 } }],
      options: {
        direction: 'top-to-bottom',
        nodeSpacing: 48,
        levelSpacing: 120,
        componentSpacing: 64,
        preserveLockedNodes: true,
        includeDisconnectedNodes: true,
      },
      viewport: { fit: true, animated: false, padding: 32 },
      source: 'api',
    });
    expect(fitToScreen).not.toHaveBeenCalled();

    fixture.componentRef.setInput('definition', {
      ...definition,
      nodes: definition.nodes.map((node) =>
        node.id === 'finish' ? { ...node, position: { x: 520, y: 96 } } : node,
      ),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    await nextPaint();

    expect(fitToScreen).toHaveBeenCalledWith(false, 32);
    expect(definition.nodes[1].position).toEqual({ x: 440, y: 80 });
  });
});
