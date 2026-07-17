import type {
  TngFlowConnection,
  TngFlowDeleteRequestedEvent,
  TngFlowNode,
  TngFlowNodesMovedEvent,
  TngFlowNodeViews,
} from '@tailng-ui/flow';

export type FlowEditorDemoData = Readonly<{
  detail: string;
}>;

export type FlowEditorDemoState = Readonly<{
  connections: readonly TngFlowConnection[];
  nodes: readonly TngFlowNode<FlowEditorDemoData>[];
}>;

export const flowEditorDemoNodes: readonly TngFlowNode<FlowEditorDemoData>[] = Object.freeze([
  {
    id: 'prompt',
    type: 'prompt',
    name: 'Prompt builder',
    description: 'Assemble the system and user instructions.',
    position: { x: 80, y: 140 },
    data: { detail: 'Customer support policy' },
    outputs: [{ id: 'prompt-output', label: 'Prompt', category: 'text', multiple: true }],
  },
  {
    id: 'model',
    type: 'model',
    name: 'Reasoning model',
    description: 'Generate a grounded response.',
    position: { x: 430, y: 80 },
    data: { detail: 'GPT reasoning pass' },
    inputs: [{ id: 'model-input', label: 'Prompt', category: 'text', multiple: true }],
    outputs: [{ id: 'model-output', label: 'Answer', category: 'text', multiple: true }],
  },
  {
    id: 'response',
    type: 'response',
    name: 'Response',
    description: 'Return the final answer to the agent runtime.',
    position: { x: 780, y: 140 },
    data: { detail: 'Streaming response' },
    inputs: [{ id: 'response-input', label: 'Answer', category: 'text', multiple: true }],
  },
]);

export const flowEditorDemoConnections: readonly TngFlowConnection[] = Object.freeze([
  {
    id: 'prompt-to-model',
    sourcePortId: 'prompt-output',
    targetPortId: 'model-input',
    type: 'bezier',
  },
  {
    id: 'model-to-response',
    sourcePortId: 'model-output',
    targetPortId: 'response-input',
    type: 'bezier',
  },
]);

export const flowEditorDemoViews: TngFlowNodeViews = Object.freeze({
  model: { status: 'running', progress: 68, message: 'Generating the final response' },
  prompt: { status: 'completed', progress: 100 },
  response: { status: 'waiting', message: 'Waiting for model output' },
});

export function applyFlowNodeMoves(
  nodes: readonly TngFlowNode<FlowEditorDemoData>[],
  event: TngFlowNodesMovedEvent,
): readonly TngFlowNode<FlowEditorDemoData>[] {
  const positions = new Map(event.nodes.map((node) => [node.id, node.position]));
  return nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position }));
}

export function removeFlowItems(
  nodes: readonly TngFlowNode<FlowEditorDemoData>[],
  connections: readonly TngFlowConnection[],
  event: TngFlowDeleteRequestedEvent,
): FlowEditorDemoState {
  const nodeIds = new Set(event.nodeIds);
  const connectionIds = new Set(event.connectionIds);
  const removedPortIds = new Set(
    nodes
      .filter((node) => nodeIds.has(node.id))
      .flatMap((node) => [...(node.inputs ?? []), ...(node.outputs ?? [])].map((port) => port.id)),
  );
  return {
    nodes: nodes.filter((node) => !nodeIds.has(node.id)),
    connections: connections.filter(
      (connection) =>
        !connectionIds.has(connection.id) &&
        !removedPortIds.has(connection.sourcePortId) &&
        !removedPortIds.has(connection.targetPortId),
    ),
  };
}
