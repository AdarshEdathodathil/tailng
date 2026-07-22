import type { WritableSignal } from '@angular/core';
import type {
  TngFlowConnectionCreateRequest,
  TngFlowConnectionsDeleteRequest,
  TngFlowDefinition,
  TngFlowNode,
  TngFlowPort,
} from '@tailng-ui/flow';
import { describe, expect, it } from 'vitest';
import { ProfessionalFlowBuilderDemoComponent } from './professional-flow-builder-demo.component';

type DemoHarness = Readonly<{
  definition: WritableSignal<TngFlowDefinition>;
  connectedPorts: (node: TngFlowNode) => readonly TngFlowPort[];
  createConnection: (request: TngFlowConnectionCreateRequest) => void;
  deleteConnections: (request: TngFlowConnectionsDeleteRequest) => void;
}>;

function createHarness(): DemoHarness {
  return new ProfessionalFlowBuilderDemoComponent() as unknown as DemoHarness;
}

describe('ProfessionalFlowBuilderDemoComponent', () => {
  it('materializes dedicated ports when a connection is created', () => {
    const harness = createHarness();

    harness.createConnection({
      source: { nodeId: 'welcome-email', portId: '__builder-create-output__' },
      target: {
        nodeId: 'manual-review-notification',
        portId: '__builder-create-input__',
      },
    });

    const definition = harness.definition();
    const connection = definition.connections.at(-1);
    const sourceNode = definition.nodes.find((node) => node.id === 'welcome-email');
    const targetNode = definition.nodes.find((node) => node.id === 'manual-review-notification');

    expect(connection).toMatchObject({
      source: { nodeId: 'welcome-email', portId: 'connection-output-1' },
      target: {
        nodeId: 'manual-review-notification',
        portId: 'connection-input-2',
      },
    });
    expect(sourceNode && harness.connectedPorts(sourceNode).map((port) => port.id)).toContain(
      'connection-output-1',
    );
    expect(targetNode && harness.connectedPorts(targetNode).map((port) => port.id)).toContain(
      'connection-input-2',
    );
  });

  it('removes automatically-created ports when their connection is deleted', () => {
    const harness = createHarness();
    harness.createConnection({
      source: { nodeId: 'welcome-email', portId: '__builder-create-output__' },
      target: {
        nodeId: 'manual-review-notification',
        portId: '__builder-create-input__',
      },
    });
    const connectionId = harness.definition().connections.at(-1)?.id;

    harness.deleteConnections({
      connectionIds: connectionId === undefined ? [] : [connectionId],
      source: 'api',
    });

    const definition = harness.definition();
    const sourceNode = definition.nodes.find((node) => node.id === 'welcome-email');
    const targetNode = definition.nodes.find((node) => node.id === 'manual-review-notification');

    expect(definition.connections).toHaveLength(4);
    expect(sourceNode && harness.connectedPorts(sourceNode).map((port) => port.id)).not.toContain(
      'connection-output-1',
    );
    expect(targetNode && harness.connectedPorts(targetNode).map((port) => port.id)).not.toContain(
      'connection-input-2',
    );
  });
});
