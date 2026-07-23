import { InjectionToken, type Provider } from '@angular/core';
import type { TngFlowLayoutEngine } from '../types/tng-flow-layout.types';

export const TNG_FLOW_LAYOUT_ENGINE: InjectionToken<TngFlowLayoutEngine> =
  new InjectionToken<TngFlowLayoutEngine>('TNG_FLOW_LAYOUT_ENGINE');

/** Configures the default automatic-layout engine for TailNG flow editors. */
export function provideTngFlowLayoutEngine<TNodeData = unknown, TConnectionData = unknown>(
  engine: TngFlowLayoutEngine<TNodeData, TConnectionData>,
): Provider {
  return {
    provide: TNG_FLOW_LAYOUT_ENGINE,
    useValue: engine,
  };
}
