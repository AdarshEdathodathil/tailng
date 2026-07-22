import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideTngFlowLayoutEngine, TNG_FLOW_LAYOUT_ENGINE } from './tng-flow-layout.provider';
import type { TngFlowLayoutEngine } from '../types/tng-flow-layout.types';

describe('TailNG flow layout provider', () => {
  it('provides an engine without coupling the core package to an algorithm', () => {
    const engine: TngFlowLayoutEngine = {
      calculate: () => Promise.resolve([]),
    };
    TestBed.configureTestingModule({ providers: [provideTngFlowLayoutEngine(engine)] });

    expect(TestBed.inject(TNG_FLOW_LAYOUT_ENGINE)).toBe(engine);
  });
});
