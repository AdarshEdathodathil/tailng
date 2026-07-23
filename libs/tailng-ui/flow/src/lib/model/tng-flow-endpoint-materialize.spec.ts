import { describe, expect, it } from 'vitest';
import type { TngFlowDefinition, TngFlowNode } from '../types/tng-flow.types';
import {
  isTngFlowCreatorPort,
  materializeTngFlowConnectionEndpoints,
  materializeTngFlowEndpoint,
  pruneUnusedTngFlowConnectionPorts,
  type TngFlowEndpointMaterializeOptions,
} from './tng-flow-endpoint-materialize';

const options: TngFlowEndpointMaterializeOptions = {
  creatorPortIds: {
    input: '__create-input__',
    output: '__create-output__',
  },
  connectionPortPrefix: 'connection-',
};

function node(
  id: string,
  ports: TngFlowNode['ports'] = [
    {
      id: '__create-input__',
      direction: 'input',
      kind: 'data',
      multiple: true,
    },
    {
      id: '__create-output__',
      direction: 'output',
      kind: 'data',
      multiple: true,
    },
  ],
): TngFlowNode {
  return {
    id,
    type: 'step',
    name: id,
    position: { x: 0, y: 0 },
    ports,
  };
}

describe('materializeTngFlowEndpoint', () => {
  it('materializes a unique output port from a creator endpoint', () => {
    const nodes = [node('a')];
    const result = materializeTngFlowEndpoint(
      nodes,
      { nodeId: 'a', portId: '__create-output__' },
      'output',
      options,
    );

    expect(result.endpoint).toEqual({ nodeId: 'a', portId: 'connection-output-1' });
    expect(result.nodes[0].ports?.map((port) => port.id)).toEqual([
      '__create-input__',
      'connection-output-1',
      '__create-output__',
    ]);
    expect(result.nodes[0].ports?.[1]).toMatchObject({
      id: 'connection-output-1',
      direction: 'output',
      name: 'Output',
    });
  });

  it('leaves non-creator endpoints unchanged', () => {
    const nodes = [
      node('a', [
        { id: 'connection-output-1', direction: 'output', kind: 'data' },
        { id: '__create-output__', direction: 'output', kind: 'data', multiple: true },
      ]),
    ];
    const endpoint = { nodeId: 'a', portId: 'connection-output-1' };
    const result = materializeTngFlowEndpoint(nodes, endpoint, 'output', options);
    expect(result.endpoint).toEqual(endpoint);
    expect(result.nodes).toBe(nodes);
  });

  it('materializes both ends of a connection request', () => {
    const result = materializeTngFlowConnectionEndpoints(
      [node('a'), node('b')],
      { nodeId: 'a', portId: '__create-output__' },
      { nodeId: 'b', portId: '__create-input__' },
      options,
    );

    expect(result.source).toEqual({ nodeId: 'a', portId: 'connection-output-1' });
    expect(result.target).toEqual({ nodeId: 'b', portId: 'connection-input-1' });
    expect(result.nodes.find((candidate) => candidate.id === 'a')?.ports?.map((p) => p.id)).toEqual(
      ['__create-input__', 'connection-output-1', '__create-output__'],
    );
    expect(result.nodes.find((candidate) => candidate.id === 'b')?.ports?.map((p) => p.id)).toEqual(
      ['connection-input-1', '__create-input__', '__create-output__'],
    );
  });

  it('increments port numbers for a second connection', () => {
    const nodes = [
      node('a', [
        { id: 'connection-output-1', direction: 'output', kind: 'data' },
        { id: '__create-output__', direction: 'output', kind: 'data', multiple: true },
      ]),
    ];
    const result = materializeTngFlowEndpoint(
      nodes,
      { nodeId: 'a', portId: '__create-output__' },
      'output',
      options,
    );
    expect(result.endpoint.portId).toBe('connection-output-2');
  });
});

describe('pruneUnusedTngFlowConnectionPorts', () => {
  it('removes unused materialized ports and keeps creator ports', () => {
    const definition: TngFlowDefinition = {
      id: 'flow',
      nodes: [
        node('a', [
          { id: 'connection-output-1', direction: 'output', kind: 'data' },
          { id: 'connection-output-2', direction: 'output', kind: 'data' },
          { id: '__create-output__', direction: 'output', kind: 'data', multiple: true },
        ]),
        node('b', [
          { id: 'connection-input-1', direction: 'input', kind: 'data' },
          { id: '__create-input__', direction: 'input', kind: 'data', multiple: true },
        ]),
      ],
      connections: [
        {
          id: 'a-to-b',
          source: { nodeId: 'a', portId: 'connection-output-1' },
          target: { nodeId: 'b', portId: 'connection-input-1' },
        },
      ],
    };

    const pruned = pruneUnusedTngFlowConnectionPorts(definition, options);
    expect(pruned.nodes[0].ports?.map((port) => port.id)).toEqual([
      'connection-output-1',
      '__create-output__',
    ]);
    expect(pruned.nodes[1].ports?.map((port) => port.id)).toEqual([
      'connection-input-1',
      '__create-input__',
    ]);
  });
});

describe('isTngFlowCreatorPort', () => {
  it('recognizes configured creator port ids', () => {
    expect(isTngFlowCreatorPort('__create-input__', options)).toBe(true);
    expect(isTngFlowCreatorPort('__create-output__', options)).toBe(true);
    expect(isTngFlowCreatorPort('connection-output-1', options)).toBe(false);
  });
});
