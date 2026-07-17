import { describe, expect, it } from 'vitest';
import { createTngFlowConnectorId, parseTngFlowConnectorId } from './tng-flow-connector-id';

describe('flow connector ids', () => {
  it.each([
    ['node::with::colons', 'port::with::colons'],
    ['node with spaces', '50% complete'],
    ['नोड', '出力'],
  ])('round-trips node %s and port %s', (nodeId, portId) => {
    const connectorId = createTngFlowConnectorId(nodeId, portId);

    expect(parseTngFlowConnectorId(connectorId)).toEqual({ nodeId, portId });
  });

  it('rejects malformed connector ids', () => {
    expect(parseTngFlowConnectorId('missing-separator')).toBeUndefined();
    expect(parseTngFlowConnectorId('one::two::three')).toBeUndefined();
    expect(parseTngFlowConnectorId('%invalid::port')).toBeUndefined();
  });
});
