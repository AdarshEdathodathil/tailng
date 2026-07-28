import { describe, expect, it } from 'vitest';
import { resolveTngFlowConnectionView } from './tng-flow-resolved-view';
import type { TngFlowConnection } from '../types/tng-flow.types';

const connection: TngFlowConnection = {
  id: 'source-to-target',
  source: { nodeId: 'source', portId: 'output' },
  target: { nodeId: 'target', portId: 'input' },
};

describe('resolveTngFlowConnectionView', () => {
  it('provides stable motion defaults', () => {
    expect(resolveTngFlowConnectionView(connection, false, undefined, [])).toMatchObject({
      motion: 'none',
      motionSpeed: 'normal',
      motionDirection: 'forward',
      message: null,
      animated: false,
    });
  });

  it('normalizes pulse motion and accessible runtime messages', () => {
    expect(
      resolveTngFlowConnectionView(
        connection,
        false,
        { motion: 'pulse', message: ' Waiting for approval ' },
        [],
      ),
    ).toMatchObject({
      motion: 'pulse',
      message: 'Waiting for approval',
      animated: true,
    });
  });

  it('maps the deprecated animated flag to flowing motion', () => {
    expect(resolveTngFlowConnectionView(connection, false, { animated: true }, [])).toMatchObject({
      motion: 'flow',
      motionSpeed: 'normal',
      motionDirection: 'forward',
      animated: true,
    });
  });

  it('gives explicit motion precedence over the deprecated animated flag', () => {
    expect(
      resolveTngFlowConnectionView(
        connection,
        false,
        {
          animated: true,
          motion: 'none',
          motionSpeed: 'fast',
          motionDirection: 'reverse',
        },
        [],
      ),
    ).toMatchObject({
      motion: 'none',
      motionSpeed: 'fast',
      motionDirection: 'reverse',
      animated: false,
    });
  });
});
