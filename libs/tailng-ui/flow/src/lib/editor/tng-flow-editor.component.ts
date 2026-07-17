/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- Angular and Foblex callbacks use framework-owned mutable event types. */
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  output,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import {
  FCanvasComponent,
  FFlowComponent,
  FFlowModule,
  provideFFlow,
  withA11y,
} from '@foblex/flow';
import { TngButtonComponent } from '@tailng-ui/components';
import { createTngFlowConnectorId } from '../model/tng-flow-connector-id';
import {
  createTngFlowConnectionCandidate,
  createTngFlowGraphIndex,
  getTngFlowNodePorts,
  type TngFlowGraphIndex,
  type TngFlowPortRecord,
} from '../model/tng-flow-graph';
import { TngFlowNodeComponent } from '../node/tng-flow-node.component';
import {
  TngFlowNodeTemplateDirective,
  type TngFlowNodeTemplateContext,
} from '../node-template/tng-flow-node-template.directive';
import { TngFlowPortComponent } from '../port/tng-flow-port.component';
import type {
  TngFlowConnection,
  TngFlowConnectionCandidate,
  TngFlowConnectionCreatedEvent,
  TngFlowConnectionCreateRequest,
  TngFlowConnectionReconnectRequest,
  TngFlowConnectionReassignedEvent,
  TngFlowConnectionRejectedEvent,
  TngFlowConnectionsDeleteRequest,
  TngFlowConnectionValidation,
  TngFlowConnectionValidator,
  TngFlowDeleteRequestedEvent,
  TngFlowDefinition,
  TngFlowEditorMode,
  TngFlowEndpoint,
  TngFlowNode,
  TngFlowNodePositionChange,
  TngFlowNodesDeleteRequest,
  TngFlowNodeStatus,
  TngFlowNodeView,
  TngFlowNodeViews,
  TngFlowNodesMovedEvent,
  TngFlowPoint,
  TngFlowPort,
  TngFlowSelection,
  TngFlowSelectionChangedEvent,
  TngFlowViewportChangedEvent,
} from '../types/tng-flow.types';
import { EMPTY_TNG_FLOW_SELECTION } from '../types/tng-flow.types';
import { validateTngFlowConnectionCandidate } from '../validation/tng-flow-connection-validation';
import { validateTngFlow, type TngFlowValidationIssue } from '../validation/tng-flow-validation';

const emptyNodeView = Object.freeze({});
const noConnectableTargetId = '__tng-flow-no-connectable-target__';

type FoblexPointLike = Readonly<{ x: number; y: number }>;
type FoblexCanvasChangeLike = Readonly<{ position: FoblexPointLike; scale: number }>;
type FoblexCreateConnectionLike = Readonly<{
  sourceId: string;
  targetId: string | undefined;
  dropPosition: FoblexPointLike;
}>;
type FoblexDeleteSelectedLike = Readonly<{
  nodeIds: readonly string[];
  connectionIds: readonly string[];
}>;
type FoblexMoveNodesLike = Readonly<{
  nodes: readonly Readonly<{ id: string; position: FoblexPointLike }>[];
}>;
type FoblexReassignConnectionLike = Readonly<{
  connectionId: string;
  endpoint: 'source' | 'target';
  previousSourceId: string;
  nextSourceId: string | undefined;
  previousTargetId: string;
  nextTargetId: string | undefined;
  dropPosition: FoblexPointLike;
}>;
type FoblexSelectionChangeLike = Readonly<{
  nodeIds: readonly string[];
  connectionIds: readonly string[];
}>;
type MultiSelectEventLike = Readonly<{
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}>;
type NodePortGroups = Readonly<{
  inputs: readonly TngFlowPort[];
  outputs: readonly TngFlowPort[];
}>;

@Component({
  selector: 'tng-flow-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FFlowModule,
    NgTemplateOutlet,
    TngButtonComponent,
    TngFlowNodeComponent,
    TngFlowPortComponent,
  ],
  providers: provideFFlow(withA11y()),
  templateUrl: './tng-flow-editor.component.html',
  styleUrl: './tng-flow-editor.component.css',
  exportAs: 'tngFlowEditor',
})
export class TngFlowEditorComponent<
  TData = unknown,
  TStatus extends string = TngFlowNodeStatus,
  TConnectionData = unknown,
> {
  private readonly canvas = viewChild.required(FCanvasComponent);
  private readonly flow = viewChild(FFlowComponent);
  private readonly nodeTemplates = contentChildren(TngFlowNodeTemplateDirective<TData, TStatus>, {
    descendants: true,
  });
  private readonly documentRef = inject(DOCUMENT);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private hasFittedInitialNodes = false;

  public readonly definition = input<TngFlowDefinition<TData, TConnectionData> | null>(null);
  public readonly nodes = input<readonly TngFlowNode<TData>[] | null>(null);
  public readonly connections = input<readonly TngFlowConnection<TConnectionData>[] | null>(null);
  public readonly nodeViews = input<TngFlowNodeViews<TStatus>>({});
  public readonly mode = input<TngFlowEditorMode>('edit');
  public readonly selection = input<TngFlowSelection>(EMPTY_TNG_FLOW_SELECTION);
  public readonly connectionValidator = input<TngFlowConnectionValidator<TData> | null>(null);
  /** @deprecated Use `mode="readonly"`. When true, this input takes precedence over `mode`. */
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
  public readonly nodePositionChange = output<TngFlowNodePositionChange>();
  public readonly connectionCreateRequested = output<TngFlowConnectionCreateRequest>();
  public readonly connectionReconnectRequested = output<TngFlowConnectionReconnectRequest>();
  public readonly connectionsDeleteRequested = output<TngFlowConnectionsDeleteRequest>();
  public readonly nodesDeleteRequested = output<TngFlowNodesDeleteRequest>();
  public readonly selectionChange = output<TngFlowSelection>();
  public readonly connectionRejected = output<TngFlowConnectionRejectedEvent>();
  /** @deprecated Use `connectionCreateRequested`. */
  public readonly connectionCreated = output<TngFlowConnectionCreatedEvent>();
  /** @deprecated Use `connectionReconnectRequested`. */
  public readonly connectionReassigned = output<TngFlowConnectionReassignedEvent>();
  /** @deprecated Use `selectionChange`. */
  public readonly selectionChanged = output<TngFlowSelectionChangedEvent>();
  /** @deprecated Use the split node and connection delete outputs. */
  public readonly deleteRequested = output<TngFlowDeleteRequestedEvent>();
  public readonly viewportChanged = output<TngFlowViewportChangedEvent>();
  public readonly ready = output<void>();

  protected readonly graphNodes = computed<readonly TngFlowNode<TData>[]>(
    () => this.definition()?.nodes ?? this.nodes() ?? [],
  );
  protected readonly graphConnections = computed<readonly TngFlowConnection<TConnectionData>[]>(
    () => this.definition()?.connections ?? this.connections() ?? [],
  );
  protected readonly effectiveMode = computed<TngFlowEditorMode>(() =>
    this.readonly() ? 'readonly' : this.mode(),
  );
  protected readonly canEdit = computed(() => this.effectiveMode() === 'edit');
  protected readonly canSelect = computed(() => this.effectiveMode() !== 'readonly');
  public readonly validationIssues = computed<readonly TngFlowValidationIssue[]>(() =>
    validateTngFlow(this.graphNodes(), this.graphConnections()),
  );

  private readonly graphIndex = computed<TngFlowGraphIndex<TData, TConnectionData>>(() =>
    createTngFlowGraphIndex(this.graphNodes(), this.graphConnections()),
  );
  private readonly portGroupsByNodeId = computed<ReadonlyMap<string, NodePortGroups>>(() => {
    const entries = this.graphNodes().map((node) => {
      const ports = getTngFlowNodePorts(node);
      return [
        node.id,
        {
          inputs: ports.filter((port) => port.direction === 'input'),
          outputs: ports.filter((port) => port.direction === 'output'),
        },
      ] as const;
    });
    return new Map(entries);
  });
  private readonly connectableTargetsByConnectorId = computed<ReadonlyMap<string, string[]>>(() =>
    this.buildConnectableTargets(),
  );
  protected readonly renderableConnections = computed<
    readonly TngFlowConnection<TConnectionData>[]
  >(() => this.graphConnections().filter((connection) => this.isRenderable(connection)));
  protected readonly multiSelectTrigger = (event: MultiSelectEventLike): boolean =>
    event.shiftKey || event.metaKey || event.ctrlKey;

  private readonly selectionSyncEffect = afterRenderEffect(() => this.syncSelectionToFlow());
  private readonly keyboardGuardEffect = afterRenderEffect((onCleanup) => {
    const listener = (event: KeyboardEvent): void => this.guardKeyboardEvent(event);
    this.hostElement.nativeElement.addEventListener('keydown', listener, true);
    onCleanup(() => this.hostElement.nativeElement.removeEventListener('keydown', listener, true));
  });

  public connectorId(nodeId: string, portId: string): string {
    return createTngFlowConnectorId(nodeId, portId);
  }

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
    canvas.redraw();
    canvas.emitCanvasChangeEvent();
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
      mode: this.effectiveMode(),
      readonly: !this.canEdit(),
      selected: this.isNodeSelected(node.id),
    };
  }

  protected viewFor(nodeId: string): TngFlowNodeView<TStatus> {
    return this.nodeViews()[nodeId] ?? (emptyNodeView as TngFlowNodeView<TStatus>);
  }

  protected isNodeSelected(nodeId: string): boolean {
    return this.canSelect() && this.selection().nodeIds.has(nodeId);
  }

  protected inputPortsFor(nodeId: string): readonly TngFlowPort[] {
    return this.portGroupsByNodeId().get(nodeId)?.inputs ?? [];
  }

  protected outputPortsFor(nodeId: string): readonly TngFlowPort[] {
    return this.portGroupsByNodeId().get(nodeId)?.outputs ?? [];
  }

  protected nodeMinHeight(nodeId: string): number {
    const groups = this.portGroupsByNodeId().get(nodeId);
    const portCount = Math.max(groups?.inputs.length ?? 0, groups?.outputs.length ?? 0);
    return Math.max(112, 56 + portCount * 30);
  }

  protected portPositionPercent(index: number, count: number): number {
    return ((index + 1) / (count + 1)) * 100;
  }

  protected portLabel(port: TngFlowPort): string {
    const label = (port.name ?? port.label)?.trim();
    return label === undefined || label.length === 0 ? port.id : label;
  }

  protected acceptedTargets(nodeId: string, portId: string): string[] {
    const connectorId = createTngFlowConnectorId(nodeId, portId);
    return this.connectableTargetsByConnectorId().get(connectorId) ?? [noConnectableTargetId];
  }

  protected portAriaLabel(node: TngFlowNode<TData>, port: TngFlowPort): string {
    return `${node.name} ${port.direction} ${this.portLabel(port)}`;
  }

  protected onNodesRendered(): void {
    if (this.fitOnInit() && !this.hasFittedInitialNodes && this.graphNodes().length > 0) {
      this.hasFittedInitialNodes = true;
      this.fitToScreen(false);
    }
  }

  protected onReady(): void {
    this.runInAngular(() => this.ready.emit());
  }

  protected onMoveNodes(event: FoblexMoveNodesLike): void {
    if (!this.canEdit()) {
      return;
    }
    const nodesById = this.graphIndex().nodesById;
    const moves = event.nodes
      .filter((move) => this.isNodeMovable(nodesById.get(move.id)))
      .map((move) => ({ id: move.id, position: this.toPoint(move.position) }));
    if (moves.length > 0) {
      this.emitNodeMoves(moves, nodesById);
    }
  }

  protected onCreateConnection(event: FoblexCreateConnectionLike): void {
    if (!this.canEdit()) {
      return;
    }
    const sourceRecord = this.portRecordForConnectorId(event.sourceId);
    const targetRecord = this.resolveDroppedPort(event.targetId, event.dropPosition);
    if (sourceRecord === undefined || targetRecord === undefined) {
      return;
    }
    const candidate = createTngFlowConnectionCandidate(sourceRecord, targetRecord);
    const validation = this.validateCandidate(candidate);
    if (!validation.valid) {
      this.emitConnectionRejected(candidate, validation);
      return;
    }
    this.emitConnectionCreated(candidate, event.dropPosition);
  }

  protected onReassignConnection(event: FoblexReassignConnectionLike): void {
    if (!this.canEdit()) {
      return;
    }
    const connection = this.graphIndex().connectionsById.get(event.connectionId);
    if (!this.isConnectionReassignable(connection)) {
      return;
    }
    const candidate = this.reconnectCandidate(connection, event);
    if (candidate === undefined) {
      return;
    }
    const validation = this.validateCandidate(candidate, connection.id);
    if (!validation.valid) {
      this.emitConnectionRejected(candidate, validation);
      return;
    }
    this.emitConnectionReconnected(connection, candidate, event);
  }

  protected onSelectionChange(event: FoblexSelectionChangeLike): void {
    if (!this.canSelect()) {
      this.requestSelectionResync();
      return;
    }
    const selection = this.normalizeSelection(event.nodeIds, event.connectionIds);
    if (!this.selectionsEqual(selection, this.selection())) {
      this.emitSelection(selection);
    }
    this.requestSelectionResync();
  }

  protected onDeleteSelected(event: FoblexDeleteSelectedLike): void {
    if (!this.canEdit()) {
      return;
    }
    const nodeIds = event.nodeIds.filter((id) => this.isNodeDeletable(id));
    const connectionIds = event.connectionIds.filter((id) => this.isConnectionDeletable(id));
    this.runInAngular(() => this.emitDeleteRequests(nodeIds, connectionIds));
  }

  protected onViewportChange(event: FoblexCanvasChangeLike): void {
    this.runInAngular(() => {
      this.viewportChanged.emit({
        position: this.toPoint(event.position),
        scale: event.scale,
      });
    });
  }

  private buildConnectableTargets(): ReadonlyMap<string, string[]> {
    const index = this.graphIndex();
    const entries = index.portRecords.map((source) => {
      const targets = index.portRecords
        .filter((target) => target.connectorId !== source.connectorId)
        .filter((target) => {
          const candidate = createTngFlowConnectionCandidate(source, target);
          return this.validateCandidate(candidate).valid;
        })
        .map((target) => target.connectorId);
      return [source.connectorId, targets.length > 0 ? targets : [noConnectableTargetId]] as const;
    });
    return new Map(entries);
  }

  private validateCandidate(
    candidate: TngFlowConnectionCandidate<TData>,
    excludeConnectionId?: string,
  ): TngFlowConnectionValidation {
    const builtIn = validateTngFlowConnectionCandidate(
      candidate,
      this.graphConnections(),
      excludeConnectionId,
    );
    if (!builtIn.valid) {
      return builtIn;
    }
    return this.connectionValidator()?.(candidate) ?? { valid: true };
  }

  private isRenderable(connection: TngFlowConnection<TConnectionData>): boolean {
    const index = this.graphIndex();
    const source = index.portsByConnectorId.get(
      createTngFlowConnectorId(connection.source.nodeId, connection.source.portId),
    );
    const target = index.portsByConnectorId.get(
      createTngFlowConnectorId(connection.target.nodeId, connection.target.portId),
    );
    return source?.port.direction === 'output' && target?.port.direction === 'input';
  }

  private syncSelectionToFlow(): void {
    const flow = this.flow();
    if (flow === undefined) {
      return;
    }
    const selection = this.canSelect()
      ? this.normalizeSelection(this.selection().nodeIds, this.selection().connectionIds)
      : EMPTY_TNG_FLOW_SELECTION;
    flow.select([...selection.nodeIds], [...selection.connectionIds], false);
  }

  private normalizeSelection(
    nodeIds: Iterable<string>,
    connectionIds: Iterable<string>,
  ): TngFlowSelection {
    const index = this.graphIndex();
    return {
      nodeIds: new Set([...nodeIds].filter((id) => index.nodesById.has(id))),
      connectionIds: new Set([...connectionIds].filter((id) => index.connectionsById.has(id))),
    };
  }

  private selectionsEqual(first: TngFlowSelection, second: TngFlowSelection): boolean {
    return (
      this.setsEqual(first.nodeIds, second.nodeIds) &&
      this.setsEqual(first.connectionIds, second.connectionIds)
    );
  }

  private setsEqual(first: ReadonlySet<string>, second: ReadonlySet<string>): boolean {
    return first.size === second.size && [...first].every((id) => second.has(id));
  }

  private emitSelection(selection: TngFlowSelection): void {
    this.runInAngular(() => {
      this.selectionChange.emit(selection);
      this.selectionChanged.emit({
        nodeIds: [...selection.nodeIds],
        connectionIds: [...selection.connectionIds],
      });
    });
  }

  private requestSelectionResync(): void {
    queueMicrotask(() => this.syncSelectionToFlow());
  }

  private emitNodeMoves(
    moves: readonly Readonly<{ id: string; position: TngFlowPoint }>[],
    nodesById: ReadonlyMap<string, TngFlowNode<TData>>,
  ): void {
    this.runInAngular(() => {
      this.nodesMoved.emit({ nodes: moves });
      for (const move of moves) {
        const previousPosition = nodesById.get(move.id)?.position;
        if (previousPosition !== undefined) {
          this.nodePositionChange.emit({
            nodeId: move.id,
            previousPosition: this.toPoint(previousPosition),
            position: move.position,
          });
        }
      }
    });
  }

  private emitConnectionCreated(
    candidate: TngFlowConnectionCandidate<TData>,
    dropPosition: FoblexPointLike,
  ): void {
    this.runInAngular(() => {
      this.connectionCreateRequested.emit({
        source: candidate.source,
        target: candidate.target,
      });
      this.connectionCreated.emit({
        source: candidate.source,
        target: candidate.target,
        dropPosition: this.toPoint(dropPosition),
      });
    });
  }

  private emitConnectionRejected(
    candidate: TngFlowConnectionCandidate<TData>,
    validation: TngFlowConnectionValidation,
  ): void {
    this.runInAngular(() => {
      this.connectionRejected.emit({
        source: candidate.source,
        target: candidate.target,
        reason: validation.reason ?? 'The connection was rejected.',
      });
    });
  }

  private reconnectCandidate(
    connection: TngFlowConnection<TConnectionData>,
    event: FoblexReassignConnectionLike,
  ): TngFlowConnectionCandidate<TData> | undefined {
    const droppedId = event.endpoint === 'source' ? event.nextSourceId : event.nextTargetId;
    const dropped = this.resolveDroppedPort(droppedId, event.dropPosition);
    if (dropped === undefined) {
      return undefined;
    }
    const source =
      event.endpoint === 'source' ? dropped : this.portRecordForEndpoint(connection.source);
    const target =
      event.endpoint === 'target' ? dropped : this.portRecordForEndpoint(connection.target);
    return source === undefined || target === undefined
      ? undefined
      : createTngFlowConnectionCandidate(source, target);
  }

  private emitConnectionReconnected(
    connection: TngFlowConnection<TConnectionData>,
    candidate: TngFlowConnectionCandidate<TData>,
    event: FoblexReassignConnectionLike,
  ): void {
    this.runInAngular(() => {
      this.connectionReconnectRequested.emit({
        connectionId: connection.id,
        previousSource: connection.source,
        previousTarget: connection.target,
        source: candidate.source,
        target: candidate.target,
        changedEndpoint: event.endpoint,
      });
      this.connectionReassigned.emit({
        connectionId: connection.id,
        endpoint: event.endpoint,
        previousSource: connection.source,
        source: candidate.source,
        previousTarget: connection.target,
        target: candidate.target,
        dropPosition: this.toPoint(event.dropPosition),
      });
    });
  }

  private emitDeleteRequests(nodeIds: readonly string[], connectionIds: readonly string[]): void {
    if (connectionIds.length > 0) {
      this.connectionsDeleteRequested.emit({ connectionIds, source: 'keyboard' });
    }
    if (nodeIds.length > 0) {
      this.nodesDeleteRequested.emit({ nodeIds, source: 'keyboard' });
    }
    if (nodeIds.length > 0 || connectionIds.length > 0) {
      this.deleteRequested.emit({ nodeIds, connectionIds });
    }
  }

  private resolveDroppedPort(
    connectorId: string | undefined,
    dropPosition: FoblexPointLike,
  ): TngFlowPortRecord<TData> | undefined {
    return connectorId === undefined
      ? this.portRecordAtPoint(dropPosition)
      : this.portRecordForConnectorId(connectorId);
  }

  private portRecordAtPoint(point: FoblexPointLike): TngFlowPortRecord<TData> | undefined {
    if (typeof this.documentRef.elementsFromPoint !== 'function') {
      return undefined;
    }
    for (const element of this.documentRef.elementsFromPoint(point.x, point.y)) {
      const connector = element.closest<HTMLElement>('[data-f-connector-id]');
      const connectorId = connector?.getAttribute('data-f-connector-id');
      const record = this.portRecordForConnectorId(connectorId);
      if (record !== undefined) {
        return record;
      }
    }
    return undefined;
  }

  private portRecordForEndpoint(endpoint: TngFlowEndpoint): TngFlowPortRecord<TData> | undefined {
    return this.portRecordForConnectorId(
      createTngFlowConnectorId(endpoint.nodeId, endpoint.portId),
    );
  }

  private portRecordForConnectorId(
    connectorId: string | null | undefined,
  ): TngFlowPortRecord<TData> | undefined {
    return connectorId === null || connectorId === undefined
      ? undefined
      : this.graphIndex().portsByConnectorId.get(connectorId);
  }

  private isNodeMovable(node: TngFlowNode<TData> | undefined): boolean {
    return node !== undefined && node.disabled !== true && node.locked !== true;
  }

  private isNodeDeletable(nodeId: string): boolean {
    return this.isNodeMovable(this.graphIndex().nodesById.get(nodeId));
  }

  private isConnectionDeletable(connectionId: string): boolean {
    return this.graphIndex().connectionsById.get(connectionId)?.disabled !== true;
  }

  private isConnectionReassignable(
    connection: TngFlowConnection<TConnectionData> | undefined,
  ): connection is TngFlowConnection<TConnectionData> {
    return (
      connection !== undefined && connection.disabled !== true && connection.reassignable !== false
    );
  }

  private guardKeyboardEvent(event: KeyboardEvent): void {
    if (this.canEdit() || this.isInteractiveKeyboardTarget(event.target)) {
      return;
    }
    if (!this.shouldBlockKeyboardEvent(event)) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private shouldBlockKeyboardEvent(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    if (key === 'delete' || key === 'backspace' || key === 'c') {
      return true;
    }
    return key === 'a' && (event.ctrlKey || event.metaKey);
  }

  private isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return (
      target.closest(
        'input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"])',
      ) !== null
    );
  }

  private toPoint(point: FoblexPointLike): TngFlowPoint {
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
