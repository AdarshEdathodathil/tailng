/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- Angular and Foblex callbacks use framework-owned mutable event types. */
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import {
  FCanvasComponent,
  FFlowModule,
  provideFFlow,
  withA11y,
  type FCanvasChangeEvent,
  type FCreateConnectionEvent,
  type FDeleteSelectedEvent,
  type FMoveNodesEvent,
  type FReassignConnectionEvent,
  type FSelectionChangeEvent,
} from '@foblex/flow';
import { TngButtonComponent } from '@tailng-ui/components';
import { TngFlowNodeComponent } from '../node/tng-flow-node.component';
import {
  TngFlowNodeTemplateDirective,
  type TngFlowNodeTemplateContext,
} from '../node-template/tng-flow-node-template.directive';
import type {
  TngFlowConnection,
  TngFlowConnectionCreatedEvent,
  TngFlowConnectionReassignedEvent,
  TngFlowDeleteRequestedEvent,
  TngFlowNode,
  TngFlowNodeStatus,
  TngFlowNodeView,
  TngFlowNodeViews,
  TngFlowNodesMovedEvent,
  TngFlowPoint,
  TngFlowPort,
  TngFlowSelectionChangedEvent,
  TngFlowViewportChangedEvent,
} from '../types/tng-flow.types';
import { validateTngFlow, type TngFlowValidationIssue } from '../validation/tng-flow-validation';

const emptyNodeView = Object.freeze({});

@Component({
  selector: 'tng-flow-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, NgTemplateOutlet, TngButtonComponent, TngFlowNodeComponent],
  providers: provideFFlow(withA11y()),
  templateUrl: './tng-flow-editor.component.html',
  styleUrl: './tng-flow-editor.component.css',
  exportAs: 'tngFlowEditor',
})
export class TngFlowEditorComponent<TData = unknown, TStatus extends string = TngFlowNodeStatus> {
  private readonly canvas = viewChild.required(FCanvasComponent);
  private readonly nodeTemplates = contentChildren(TngFlowNodeTemplateDirective<TData, TStatus>, {
    descendants: true,
  });
  private readonly ngZone = inject(NgZone);
  private readonly selectedNodeIds = signal<ReadonlySet<string>>(new Set());
  private hasFittedInitialNodes = false;

  public readonly nodes = input.required<readonly TngFlowNode<TData>[]>();
  public readonly connections = input<readonly TngFlowConnection[]>([]);
  public readonly nodeViews = input<TngFlowNodeViews<TStatus>>({});
  public readonly readonly = input<boolean, boolean | string>(false, {
    transform: booleanAttribute,
  });
  public readonly ariaLabel = input<string>('Workflow editor');
  public readonly flowId = input<string>('tng-flow-editor');
  public readonly fitOnInit = input<boolean, boolean | string>(true, {
    transform: booleanAttribute,
  });
  public readonly showBackground = input<boolean, boolean | string>(true, {
    transform: booleanAttribute,
  });
  public readonly showControls = input<boolean, boolean | string>(true, {
    transform: booleanAttribute,
  });
  public readonly showSelectionArea = input<boolean, boolean | string>(true, {
    transform: booleanAttribute,
  });
  public readonly snapToGrid = input<boolean, boolean | string>(false, {
    transform: booleanAttribute,
  });
  public readonly gridSize = input<number>(16);
  public readonly zoomMinimum = input<number>(0.35);
  public readonly zoomMaximum = input<number>(2);
  public readonly zoomStep = input<number>(0.15);

  public readonly nodesMoved = output<TngFlowNodesMovedEvent>();
  public readonly connectionCreated = output<TngFlowConnectionCreatedEvent>();
  public readonly connectionReassigned = output<TngFlowConnectionReassignedEvent>();
  public readonly selectionChanged = output<TngFlowSelectionChangedEvent>();
  public readonly deleteRequested = output<TngFlowDeleteRequestedEvent>();
  public readonly viewportChanged = output<TngFlowViewportChangedEvent>();
  public readonly ready = output<void>();

  public readonly validationIssues = computed<readonly TngFlowValidationIssue[]>(() =>
    validateTngFlow(this.nodes(), this.connections()),
  );

  private readonly portDirections = computed<ReadonlyMap<string, 'input' | 'output'>>(() => {
    const result = new Map<string, 'input' | 'output'>();
    for (const node of this.nodes()) {
      for (const port of node.inputs ?? []) {
        if (!result.has(port.id)) {
          result.set(port.id, 'input');
        }
      }
      for (const port of node.outputs ?? []) {
        if (!result.has(port.id)) {
          result.set(port.id, 'output');
        }
      }
    }
    return result;
  });

  protected readonly renderableConnections = computed<readonly TngFlowConnection[]>(() => {
    const portDirections = this.portDirections();
    return this.connections().filter(
      (connection) =>
        portDirections.get(connection.sourcePortId) === 'output' &&
        portDirections.get(connection.targetPortId) === 'input',
    );
  });

  public fitToScreen(animated = true): void {
    this.canvas().fitToScreen({ x: 48, y: 48 }, animated);
  }

  public resetViewport(animated = true): void {
    this.canvas().resetScaleAndCenter(animated);
  }

  public centerNode(nodeId: string, animated = true): void {
    this.canvas().centerGroupOrNode(nodeId, animated);
  }

  public zoomBy(delta: number): void {
    const canvas = this.canvas();
    const nextScale = Math.min(
      this.zoomMaximum(),
      Math.max(this.zoomMinimum(), canvas.getScale() + delta),
    );
    canvas.setScale(nextScale);
  }

  protected templateFor(
    nodeType: string,
  ): TemplateRef<TngFlowNodeTemplateContext<TData, TStatus>> | null {
    return (
      this.nodeTemplates().find((template) => template.nodeType() === nodeType)?.templateRef ?? null
    );
  }

  protected templateContext(node: TngFlowNode<TData>): TngFlowNodeTemplateContext<TData, TStatus> {
    return {
      $implicit: node,
      node,
      view: this.viewFor(node.id),
      readonly: this.readonly(),
      selected: this.isNodeSelected(node.id),
    };
  }

  protected viewFor(nodeId: string): TngFlowNodeView<TStatus> {
    return this.nodeViews()[nodeId] ?? (emptyNodeView as TngFlowNodeView<TStatus>);
  }

  protected isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeIds().has(nodeId);
  }

  protected nodeMinHeight(node: TngFlowNode<TData>): number {
    const portCount = Math.max(node.inputs?.length ?? 0, node.outputs?.length ?? 0);
    return Math.max(112, 56 + portCount * 30);
  }

  protected portTop(index: number): number {
    return 52 + index * 30;
  }

  protected portLabel(port: TngFlowPort): string {
    const label = port.label?.trim();
    return label === undefined || label.length === 0 ? port.id : label;
  }

  protected acceptedTargets(port: TngFlowPort): string[] {
    return [...(port.accepts ?? [])];
  }

  protected portAriaLabel(
    node: TngFlowNode<TData>,
    port: TngFlowPort,
    direction: 'input' | 'output',
  ): string {
    return `${node.name} ${direction} ${this.portLabel(port)}`;
  }

  protected onNodesRendered(): void {
    if (this.fitOnInit() && !this.hasFittedInitialNodes && this.nodes().length > 0) {
      this.hasFittedInitialNodes = true;
      this.fitToScreen(false);
    }
  }

  protected onReady(): void {
    this.runInAngular(() => this.ready.emit());
  }

  protected onMoveNodes(event: FMoveNodesEvent): void {
    this.runInAngular(() => {
      this.nodesMoved.emit({
        nodes: event.nodes.map((node) => ({
          id: node.id,
          position: this.toPoint(node.position),
        })),
      });
    });
  }

  protected onCreateConnection(event: FCreateConnectionEvent): void {
    const targetPortId = event.targetId;
    if (this.readonly() || targetPortId === undefined) {
      return;
    }

    this.runInAngular(() => {
      this.connectionCreated.emit({
        sourcePortId: event.sourceId,
        targetPortId,
        dropPosition: this.toPoint(event.dropPosition),
      });
    });
  }

  protected onReassignConnection(event: FReassignConnectionEvent): void {
    if (this.readonly()) {
      return;
    }

    this.runInAngular(() => {
      this.connectionReassigned.emit({
        connectionId: event.connectionId,
        endpoint: event.endpoint,
        previousSourcePortId: event.previousSourceId,
        sourcePortId: event.nextSourceId,
        previousTargetPortId: event.previousTargetId,
        targetPortId: event.nextTargetId,
        dropPosition: this.toPoint(event.dropPosition),
      });
    });
  }

  protected onSelectionChange(event: FSelectionChangeEvent): void {
    this.runInAngular(() => {
      this.selectedNodeIds.set(new Set(event.nodeIds));
      this.selectionChanged.emit({
        nodeIds: [...event.nodeIds],
        connectionIds: [...event.connectionIds],
      });
    });
  }

  protected onDeleteSelected(event: FDeleteSelectedEvent): void {
    if (this.readonly()) {
      return;
    }

    this.runInAngular(() => {
      this.deleteRequested.emit({
        nodeIds: [...event.nodeIds],
        connectionIds: [...event.connectionIds],
      });
    });
  }

  protected onViewportChange(event: FCanvasChangeEvent): void {
    this.runInAngular(() => {
      this.viewportChanged.emit({
        position: this.toPoint(event.position),
        scale: event.scale,
      });
    });
  }

  private toPoint(point: { x: number; y: number }): TngFlowPoint {
    return { x: point.x, y: point.y };
  }

  private runInAngular(action: () => void): void {
    if (NgZone.isInAngularZone()) {
      action();
      return;
    }

    this.ngZone.run(action);
  }
}
