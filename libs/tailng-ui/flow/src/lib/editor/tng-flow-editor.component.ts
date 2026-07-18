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
  calculatePointerInFlow,
  provideFFlow,
  withA11y,
} from '@foblex/flow';
import { TngButtonComponent } from '@tailng-ui/components';
import { resolveTngFlowCapabilities } from '../model/tng-flow-capabilities';
import { createTngFlowConnectorId } from '../model/tng-flow-connector-id';
import {
  createTngFlowConnectionCandidate,
  getTngFlowNodePorts,
  type TngFlowGraphIndex,
  type TngFlowPortRecord,
} from '../model/tng-flow-graph';
import {
  createTngFlowIssueIndex,
  resolveTngFlowValidationSeverity,
} from '../model/tng-flow-issue-index';
import {
  resolveTngFlowConnectionView,
  resolveTngFlowNodeView,
} from '../model/tng-flow-resolved-view';
import {
  areTngFlowSelectionsEqual,
  sanitizeTngFlowSelection,
} from '../model/tng-flow-selection';
import { TngFlowNodeComponent } from '../node/tng-flow-node.component';
import {
  TngFlowNodeTemplateDirective,
  type TngFlowNodeTemplateContext,
} from '../node-template/tng-flow-node-template.directive';
import { readTngFlowPaletteItemEnvelope } from '../palette-item/tng-flow-palette-item.directive';
import { TngFlowPortComponent } from '../port/tng-flow-port.component';
import type {
  TngFlowActivationSource,
  TngFlowConnectionActivatedEvent,
  TngFlowNodeActivatedEvent,
  TngFlowValidationIssueActivatedEvent,
  TngFlowValidationIssueActivationSource,
} from '../types/tng-flow-events.types';
import type { TngFlowRevealOptions } from '../types/tng-flow-navigation.types';
import {
  EMPTY_TNG_FLOW_PRESENTATION,
  type TngFlowPresentation,
  type TngFlowResolvedConnectionView,
  type TngFlowResolvedNodeView,
} from '../types/tng-flow-presentation.types';
import {
  EMPTY_TNG_FLOW_VALIDATION,
  type TngFlowValidation,
  type TngFlowValidationIssue,
  type TngFlowValidationTarget,
} from '../types/tng-flow-validation.types';
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
  TngFlowNodeCreateRequest,
  TngFlowNodeCreateSource,
  TngFlowNodePositionChange,
  TngFlowNodesDeleteRequest,
  TngFlowNodeStatus,
  TngFlowNodeViews,
  TngFlowNodesMovedEvent,
  TngFlowPoint,
  TngFlowPaletteItem,
  TngFlowPort,
  TngFlowSelection,
  TngFlowSelectionChangedEvent,
  TngFlowViewport,
  TngFlowViewportChangedEvent,
} from '../types/tng-flow.types';
import { EMPTY_TNG_FLOW_SELECTION } from '../types/tng-flow.types';
import {
  createTngFlowConnectionValidationIndex,
  validateTngFlowConnectionCandidate,
} from '../validation/tng-flow-connection-validation';
import { analyzeTngFlow } from '../validation/tng-flow-validation';
import { TngFlowValidationBadgeComponent } from '../validation-badge/tng-flow-validation-badge.component';

const EMPTY_ISSUES = Object.freeze([]) as readonly TngFlowValidationIssue[];
const emptyResolvedNodeView = Object.freeze({
  selected: false,
  disabled: false,
  locked: false,
  status: 'idle',
  progress: null,
  statusMessage: null,
  validationSeverity: null,
  invalid: false,
  highlighted: false,
  dimmed: false,
});
const noConnectableTargetId = '__tng-flow-no-connectable-target__';
const NON_EDIT_BLOCKED_KEYS = new Set([' ', 'backspace', 'c', 'delete']);
const READONLY_BLOCKED_KEYS = new Set([
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowup',
  'end',
  'home',
]);

type FoblexPointLike = Readonly<{ x: number; y: number }>;
type FoblexCanvasChangeLike = Readonly<{ position: FoblexPointLike; scale: number }>;
type FoblexCreateConnectionLike = Readonly<{
  sourceId: string;
  targetId: string | undefined;
  dropPosition: FoblexPointLike;
}>;
type FoblexCreateNodeLike = Readonly<{
  data: unknown;
  externalItemRect: Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
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
type ValidatedConnection = Readonly<{
  validation: TngFlowConnectionValidation;
  origin: 'tailng' | 'consumer';
}>;
type PendingReveal = Readonly<{
  target: TngFlowValidationTarget;
  options: TngFlowRevealOptions;
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
    TngFlowValidationBadgeComponent,
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
  private isFullyRendered = false;
  private pendingReveal: PendingReveal | null = null;

  public readonly definition = input<TngFlowDefinition<TData, TConnectionData> | null>(null);
  public readonly nodes = input<readonly TngFlowNode<TData>[] | null>(null);
  public readonly connections = input<readonly TngFlowConnection<TConnectionData>[] | null>(null);
  public readonly validation = input<TngFlowValidation>(EMPTY_TNG_FLOW_VALIDATION);
  public readonly presentation = input<TngFlowPresentation<TStatus>>(
    EMPTY_TNG_FLOW_PRESENTATION as TngFlowPresentation<TStatus>,
  );
  /** @deprecated Use `presentation.nodes`. */
  public readonly nodeViews = input<TngFlowNodeViews<TStatus>>({});
  public readonly mode = input<TngFlowEditorMode>('edit');
  public readonly selection = input<TngFlowSelection>(EMPTY_TNG_FLOW_SELECTION);
  public readonly viewport = input<TngFlowViewport | null>(null);
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
  public readonly nodeCreateRequested = output<TngFlowNodeCreateRequest<TData>>();
  public readonly connectionCreateRequested = output<TngFlowConnectionCreateRequest>();
  public readonly connectionReconnectRequested = output<TngFlowConnectionReconnectRequest>();
  public readonly connectionsDeleteRequested = output<TngFlowConnectionsDeleteRequest>();
  public readonly nodesDeleteRequested = output<TngFlowNodesDeleteRequest>();
  public readonly selectionChange = output<TngFlowSelection>();
  public readonly connectionRejected = output<TngFlowConnectionRejectedEvent>();
  public readonly nodeActivated = output<TngFlowNodeActivatedEvent>();
  public readonly connectionActivated = output<TngFlowConnectionActivatedEvent>();
  public readonly validationIssueActivated = output<TngFlowValidationIssueActivatedEvent>();
  /** @deprecated Use `connectionCreateRequested`. */
  public readonly connectionCreated = output<TngFlowConnectionCreatedEvent>();
  /** @deprecated Use `connectionReconnectRequested`. */
  public readonly connectionReassigned = output<TngFlowConnectionReassignedEvent>();
  /** @deprecated Use `selectionChange`. */
  public readonly selectionChanged = output<TngFlowSelectionChangedEvent>();
  /** @deprecated Use the split node and connection delete outputs. */
  public readonly deleteRequested = output<TngFlowDeleteRequestedEvent>();
  public readonly viewportChange = output<TngFlowViewport>();
  /** @deprecated Use `viewportChange`. */
  public readonly viewportChanged = output<TngFlowViewportChangedEvent>();
  public readonly ready = output<void>();

  private readonly analysis = computed(() => {
    const definition = this.definition();
    return analyzeTngFlow<TData, TConnectionData>(
      definition?.nodes ?? this.nodes() ?? [],
      definition?.connections ?? this.connections() ?? [],
    );
  });
  protected readonly graphNodes = computed(() => this.analysis().nodes);
  protected readonly graphConnections = computed(() => this.analysis().connections);
  protected readonly effectiveMode = computed<TngFlowEditorMode>(() =>
    this.readonly() ? 'readonly' : this.mode(),
  );
  protected readonly capabilities = computed(() =>
    resolveTngFlowCapabilities(this.effectiveMode()),
  );
  protected readonly canEdit = computed(() => this.capabilities().move);
  protected readonly canSelect = computed(() => this.capabilities().select);
  public readonly resolvedValidation = computed<TngFlowValidation>(() => ({
    issues: [...this.analysis().issues, ...this.validation().issues],
  }));
  public readonly validationIssues = computed(() => this.resolvedValidation().issues);
  protected readonly validationSeverity = computed(() =>
    resolveTngFlowValidationSeverity(this.validationIssues()),
  );

  private readonly graphIndex = computed<TngFlowGraphIndex<TData, TConnectionData>>(
    () => this.analysis().index,
  );
  private readonly issueIndex = computed(() =>
    createTngFlowIssueIndex(this.resolvedValidation()),
  );
  private readonly sanitizedSelection = computed(() =>
    this.canSelect()
      ? sanitizeTngFlowSelection(this.selection(), this.graphIndex())
      : EMPTY_TNG_FLOW_SELECTION,
  );
  private readonly resolvedNodeViews = computed(() => {
    const presentation = this.presentation().nodes;
    const legacyViews = this.nodeViews();
    const issues = this.issueIndex().nodeIssues;
    const selection = this.sanitizedSelection();
    return new Map(
      this.graphNodes().map((node) => [
        node.id,
        resolveTngFlowNodeView(
          node,
          selection.nodeIds.has(node.id),
          presentation?.[node.id],
          legacyViews[node.id],
          issues.get(node.id) ?? EMPTY_ISSUES,
        ),
      ]),
    );
  });
  private readonly resolvedConnectionViews = computed(() => {
    const presentation = this.presentation().connections;
    const issues = this.issueIndex().connectionIssues;
    const selection = this.sanitizedSelection();
    return new Map(
      this.graphConnections().map((connection) => [
        connection.id,
        resolveTngFlowConnectionView(
          connection,
          selection.connectionIds.has(connection.id),
          presentation?.[connection.id],
          issues.get(connection.id) ?? EMPTY_ISSUES,
        ),
      ]),
    );
  });
  private readonly connectionValidationIndex = computed(() =>
    createTngFlowConnectionValidationIndex(this.graphConnections()),
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
  protected readonly renderableConnections = this.graphConnections;
  protected readonly summaryIssues = computed(() =>
    this.validationIssues().filter((issue) => !this.hasRenderableTarget(issue.target)),
  );
  protected readonly multiSelectTrigger = (event: MultiSelectEventLike): boolean =>
    event.shiftKey || event.metaKey || event.ctrlKey;

  private readonly selectionSyncEffect = afterRenderEffect(() => this.syncSelectionToFlow());
  private readonly keyboardGuardEffect = afterRenderEffect((onCleanup) => {
    const listener = (event: KeyboardEvent): void => this.onHostKeydown(event);
    this.hostElement.nativeElement.addEventListener('keydown', listener, true);
    onCleanup(() => this.hostElement.nativeElement.removeEventListener('keydown', listener, true));
  });

  public connectorId(nodeId: string, portId: string): string {
    return createTngFlowConnectorId(nodeId, portId);
  }

  public fitToScreen(animated = true, padding = 48): void {
    const normalizedPadding = Number.isFinite(padding) ? Math.max(0, padding) : 48;
    this.canvas().fitToScreen({ x: normalizedPadding, y: normalizedPadding }, animated);
  }

  public resetViewport(animated = true): void {
    this.canvas().resetScaleAndCenter(animated);
  }

  public centerNode(nodeId: string, animated = true): boolean {
    if (!this.graphIndex().nodesById.has(nodeId)) {
      return false;
    }
    this.canvas().centerGroupOrNode(nodeId, animated);
    return true;
  }

  public activateNode(nodeId: string, source: 'api' = 'api'): boolean {
    return this.emitNodeActivated(nodeId, source);
  }

  public activateConnection(connectionId: string, source: 'api' = 'api'): boolean {
    return this.emitConnectionActivated(connectionId, source);
  }

  public activateValidationIssue(issueId: string): boolean {
    const issue = this.validationIssues().find((candidate) => candidate.id === issueId);
    if (issue === undefined) {
      return false;
    }
    this.onValidationIssueActivated(issue, 'api');
    return true;
  }

  public revealTarget(
    target: TngFlowValidationTarget,
    options: TngFlowRevealOptions = {},
  ): boolean {
    if (!this.hasRenderableTarget(target)) {
      return false;
    }
    if (!this.isFullyRendered) {
      this.pendingReveal = { target, options };
      return true;
    }
    this.performReveal(target, options);
    return true;
  }

  public zoomIn(): void {
    this.zoomBy(this.zoomStep());
  }

  public zoomOut(): void {
    this.zoomBy(-this.zoomStep());
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

  public screenToCanvas(point: TngFlowPoint): TngFlowPoint {
    const flowHost = this.hostElement.nativeElement.querySelector<HTMLElement>('f-flow');
    if (flowHost === null) {
      return this.toPoint(point);
    }
    return this.toPoint(calculatePointerInFlow(point, flowHost, this.canvas().transform));
  }

  public requestNodeCreate(
    item: TngFlowPaletteItem<TData>,
    position?: TngFlowPoint,
    source: TngFlowNodeCreateSource = 'api',
  ): void {
    if (!this.canEdit() || item.disabled === true) {
      return;
    }
    const normalized = this.normalizeCreatePosition(position ?? this.viewportCenter());
    if (normalized !== undefined) {
      this.emitNodeCreateRequest(item, normalized, source);
    }
  }

  protected templateFor(
    nodeType: string,
  ): TemplateRef<TngFlowNodeTemplateContext<TData, TStatus>> | null {
    return (
      this.nodeTemplates().find((template) => template.nodeType() === nodeType)?.templateRef ?? null
    );
  }

  protected templateContext(node: TngFlowNode<TData>): TngFlowNodeTemplateContext<TData, TStatus> {
    const issues = this.nodeIssues(node.id);
    return {
      $implicit: node,
      node,
      view: this.viewFor(node.id),
      issues,
      mode: this.effectiveMode(),
      readonly: !this.canEdit(),
      selected: this.isNodeSelected(node.id),
    };
  }

  protected viewFor(nodeId: string): TngFlowResolvedNodeView<TStatus> {
    return (
      this.resolvedNodeViews().get(nodeId) ??
      (emptyResolvedNodeView as TngFlowResolvedNodeView<TStatus>)
    );
  }

  protected connectionViewFor(connectionId: string): TngFlowResolvedConnectionView {
    const view = this.resolvedConnectionViews().get(connectionId);
    if (view === undefined) {
      throw new Error(`Unknown TailNG flow connection "${connectionId}".`);
    }
    return view;
  }

  protected isNodeSelected(nodeId: string): boolean {
    return this.sanitizedSelection().nodeIds.has(nodeId);
  }

  protected nodeIssues(nodeId: string): readonly TngFlowValidationIssue[] {
    return this.issueIndex().nodeIssues.get(nodeId) ?? EMPTY_ISSUES;
  }

  protected portIssues(nodeId: string, portId: string): readonly TngFlowValidationIssue[] {
    return (
      this.issueIndex().portIssues.get(createTngFlowConnectorId(nodeId, portId)) ?? EMPTY_ISSUES
    );
  }

  protected connectionIssues(connectionId: string): readonly TngFlowValidationIssue[] {
    return this.issueIndex().connectionIssues.get(connectionId) ?? EMPTY_ISSUES;
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
    this.isFullyRendered = true;
    const pendingReveal = this.pendingReveal;
    this.pendingReveal = null;
    if (pendingReveal !== null) {
      queueMicrotask(() => this.performReveal(pendingReveal.target, pendingReveal.options));
    }
    this.runInAngular(() => this.ready.emit());
  }

  protected onNodeDoubleClick(event: MouseEvent, nodeId: string): void {
    if (!this.isInteractiveActivationTarget(event.target)) {
      this.emitNodeActivated(nodeId, 'pointer');
    }
  }

  protected onConnectionDoubleClick(event: MouseEvent, connectionId: string): void {
    if (!this.isInteractiveActivationTarget(event.target)) {
      this.emitConnectionActivated(connectionId, 'pointer');
    }
  }

  protected onValidationIssueActivated(
    issue: TngFlowValidationIssue,
    source: TngFlowValidationIssueActivationSource,
  ): void {
    this.revealTarget(issue.target, { animated: true, select: true });
    this.runInAngular(() => this.validationIssueActivated.emit({ issue, source }));
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

  protected onCreateNode(event: FoblexCreateNodeLike): void {
    if (!this.canEdit()) {
      return;
    }
    const envelope = readTngFlowPaletteItemEnvelope<TData>(event.data);
    if (envelope === undefined || envelope.item.disabled === true) {
      return;
    }
    const position = this.normalizeCreatePosition({
      x: event.externalItemRect.x,
      y: event.externalItemRect.y,
    });
    if (position !== undefined) {
      this.emitNodeCreateRequest(envelope.item, position, 'pointer');
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
    const result = this.validateCandidate(candidate);
    if (!result.validation.valid) {
      this.emitConnectionRejected(candidate, result);
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
    const result = this.validateCandidate(candidate, connection.id);
    if (!result.validation.valid) {
      this.emitConnectionRejected(candidate, result);
      return;
    }
    this.emitConnectionReconnected(connection, candidate, event);
  }

  protected onSelectionChange(event: FoblexSelectionChangeLike): void {
    if (!this.canSelect()) {
      this.requestSelectionResync();
      return;
    }
    const selection = sanitizeTngFlowSelection(
      {
        nodeIds: new Set(event.nodeIds),
        connectionIds: new Set(event.connectionIds),
      },
      this.graphIndex(),
    );
    if (!areTngFlowSelectionsEqual(selection, this.sanitizedSelection())) {
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
      const viewport = {
        position: this.toPoint(event.position),
        scale: event.scale,
      };
      this.viewportChange.emit(viewport);
      this.viewportChanged.emit(viewport);
    });
  }

  private buildConnectableTargets(): ReadonlyMap<string, string[]> {
    const index = this.graphIndex();
    const entries = index.portRecords.map((source) => {
      const targets = index.portRecords
        .filter((target) => target.connectorId !== source.connectorId)
        .filter((target) => {
          const candidate = createTngFlowConnectionCandidate(source, target);
          return this.validateCandidate(candidate).validation.valid;
        })
        .map((target) => target.connectorId);
      return [source.connectorId, targets.length > 0 ? targets : [noConnectableTargetId]] as const;
    });
    return new Map(entries);
  }

  private validateCandidate(
    candidate: TngFlowConnectionCandidate<TData>,
    excludeConnectionId?: string,
  ): ValidatedConnection {
    const builtIn = validateTngFlowConnectionCandidate(
      candidate,
      this.graphConnections(),
      excludeConnectionId,
      this.connectionValidationIndex(),
    );
    if (!builtIn.valid) {
      return { validation: builtIn, origin: 'tailng' };
    }
    const consumer = this.connectionValidator()?.(candidate);
    return consumer === undefined
      ? { validation: builtIn, origin: 'tailng' }
      : { validation: consumer, origin: 'consumer' };
  }

  private syncSelectionToFlow(): void {
    const flow = this.flow();
    if (flow === undefined) {
      return;
    }
    const selection = this.sanitizedSelection();
    flow.select([...selection.nodeIds], [...selection.connectionIds], false);
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

  private emitNodeCreateRequest(
    item: TngFlowPaletteItem<TData>,
    position: TngFlowPoint,
    source: TngFlowNodeCreateSource,
  ): void {
    this.runInAngular(() => this.nodeCreateRequested.emit({ item, position, source }));
  }

  private normalizeCreatePosition(point: TngFlowPoint): TngFlowPoint | undefined {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      return undefined;
    }
    const gridSize = this.gridSize();
    if (!this.snapToGrid() || !Number.isFinite(gridSize) || gridSize <= 0) {
      return this.toPoint(point);
    }
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }

  private viewportCenter(): TngFlowPoint {
    const flowHost = this.hostElement.nativeElement.querySelector<HTMLElement>('f-flow');
    if (flowHost === null) {
      return { x: 0, y: 0 };
    }
    const bounds = flowHost.getBoundingClientRect();
    return this.screenToCanvas({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
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
    result: ValidatedConnection,
  ): void {
    if (result.validation.valid) {
      return;
    }
    const rejection = result.validation;
    this.runInAngular(() => {
      this.connectionRejected.emit({
        source: candidate.source,
        target: candidate.target,
        code: rejection.code,
        reason: rejection.reason,
        origin: result.origin,
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

  private hasRenderableTarget(target: TngFlowValidationTarget): boolean {
    switch (target.kind) {
      case 'flow':
        return true;
      case 'node':
        return this.graphIndex().nodesById.has(target.nodeId);
      case 'port':
        return this.graphIndex().portsByConnectorId.has(
          createTngFlowConnectorId(target.nodeId, target.portId),
        );
      case 'connection':
        return this.graphIndex().connectionsById.has(target.connectionId);
    }
  }

  private performReveal(target: TngFlowValidationTarget, options: TngFlowRevealOptions): void {
    const animated = options.animated ?? true;
    switch (target.kind) {
      case 'flow':
        this.fitToScreen(animated, options.padding);
        return;
      case 'node':
        this.centerNode(target.nodeId, animated);
        this.selectRevealedTarget(new Set([target.nodeId]), new Set(), options);
        return;
      case 'port':
        this.centerNode(target.nodeId, animated);
        this.selectRevealedTarget(new Set([target.nodeId]), new Set(), options);
        return;
      case 'connection': {
        const connection = this.graphIndex().connectionsById.get(target.connectionId);
        if (connection === undefined) {
          return;
        }
        this.centerNode(connection.target.nodeId, animated);
        this.selectRevealedTarget(new Set(), new Set([target.connectionId]), options);
      }
    }
  }

  private selectRevealedTarget(
    nodeIds: ReadonlySet<string>,
    connectionIds: ReadonlySet<string>,
    options: TngFlowRevealOptions,
  ): void {
    if (options.select !== true || !this.capabilities().select) {
      return;
    }
    const selection = { nodeIds, connectionIds };
    if (!areTngFlowSelectionsEqual(selection, this.sanitizedSelection())) {
      this.emitSelection(selection);
    }
  }

  private emitNodeActivated(nodeId: string, source: TngFlowActivationSource): boolean {
    if (!this.capabilities().activate || !this.graphIndex().nodesById.has(nodeId)) {
      return false;
    }
    this.runInAngular(() => this.nodeActivated.emit({ nodeId, source }));
    return true;
  }

  private emitConnectionActivated(
    connectionId: string,
    source: TngFlowActivationSource,
  ): boolean {
    if (!this.capabilities().activate || !this.graphIndex().connectionsById.has(connectionId)) {
      return false;
    }
    this.runInAngular(() => this.connectionActivated.emit({ connectionId, source }));
    return true;
  }

  private onHostKeydown(event: KeyboardEvent): void {
    this.guardKeyboardEvent(event);
    if (!this.canHandleActivationKey(event)) {
      return;
    }

    if (this.activateKeyboardTarget(event.target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  private canHandleActivationKey(event: KeyboardEvent): boolean {
    return (
      !event.defaultPrevented &&
      event.key === 'Enter' &&
      this.capabilities().activate &&
      !this.isInteractiveActivationTarget(event.target)
    );
  }

  private activateKeyboardTarget(eventTarget: EventTarget | null): boolean {
    return this.activateKeyboardElement(eventTarget) ?? this.activateSelectedElement();
  }

  private activateKeyboardElement(eventTarget: EventTarget | null): boolean | undefined {
    const target = eventTarget instanceof Element ? eventTarget : null;
    const nodeId = target?.closest<HTMLElement>('[data-node-id]')?.dataset['nodeId'];
    if (nodeId !== undefined) {
      return this.emitNodeActivated(nodeId, 'keyboard');
    }
    const connectionId = target?.closest<HTMLElement>('[data-connection-id]')?.dataset[
      'connectionId'
    ];
    if (connectionId !== undefined) {
      return this.emitConnectionActivated(connectionId, 'keyboard');
    }
    return undefined;
  }

  private activateSelectedElement(): boolean {
    const selection = this.sanitizedSelection();
    const selectedNodeId = selection.nodeIds.size === 1 ? [...selection.nodeIds][0] : undefined;
    if (selectedNodeId !== undefined) {
      return this.emitNodeActivated(selectedNodeId, 'keyboard');
    }
    const selectedConnectionId =
      selection.connectionIds.size === 1 ? [...selection.connectionIds][0] : undefined;
    return (
      selectedConnectionId !== undefined &&
      this.emitConnectionActivated(selectedConnectionId, 'keyboard')
    );
  }

  private guardKeyboardEvent(event: KeyboardEvent): void {
    if (this.capabilities().delete || this.isInteractiveKeyboardTarget(event.target)) {
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
    if (NON_EDIT_BLOCKED_KEYS.has(key)) {
      return true;
    }
    if (this.capabilities().select) {
      return false;
    }
    return READONLY_BLOCKED_KEYS.has(key) || (key === 'a' && (event.ctrlKey || event.metaKey));
  }

  private isInteractiveActivationTarget(target: EventTarget | null): boolean {
    return this.isInteractiveKeyboardTarget(target);
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
