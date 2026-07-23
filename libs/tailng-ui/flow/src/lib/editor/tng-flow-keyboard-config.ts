import { Injectable } from '@angular/core';
import {
  F_DEFAULT_A11Y_KEYS,
  F_DEFAULT_A11Y_MESSAGES,
  type IFA11yResolvedConfig,
} from '@foblex/flow';

export type TngResolvedFlowKeyboardOptions = Readonly<{
  moveStep: number;
  largeMoveStep: number;
  connectKeys: readonly string[];
}>;

const DEFAULT_OPTIONS: TngResolvedFlowKeyboardOptions = Object.freeze({
  moveStep: 1,
  largeMoveStep: 10,
  connectKeys: Object.freeze(['c']),
});

const TNG_FLOW_A11Y_MESSAGES: IFA11yResolvedConfig['messages'] = {
  ...F_DEFAULT_A11Y_MESSAGES,
  instructions:
    'Use arrow keys to navigate, and Control or Command with an arrow key to follow connections. ' +
    'Hold Shift while navigating to extend the selection. Press Space to grab selected nodes, ' +
    'then use arrows to move and Space or Enter to drop. Press C to choose ports for a connection. ' +
    'Delete or Backspace requests deletion; Escape cancels the active operation.',
  connectStarted: (sourceLabel: string): string =>
    `Connecting from ${sourceLabel}. Use arrow keys to choose a target, Enter or Space to request the connection, Escape to cancel`,
  connected: (sourceLabel: string, targetLabel: string): string =>
    `Connection requested from ${sourceLabel} to ${targetLabel}`,
};

/**
 * Editor-scoped bridge between signal inputs and Foblex's injected accessibility config.
 * Foblex reads these getters at interaction time, so changing an editor input never
 * requires recreating the flow or sharing keyboard state between editor instances.
 */
@Injectable()
export class TngFlowKeyboardConfig {
  private options = DEFAULT_OPTIONS;

  public readonly foblexConfig: IFA11yResolvedConfig;

  public constructor() {
    const readOptions = (): TngResolvedFlowKeyboardOptions => this.options;
    this.foblexConfig = {
      keyboard: true,
      get moveStep(): number {
        return readOptions().moveStep;
      },
      get coarseMoveStep(): number {
        return readOptions().largeMoveStep;
      },
      messages: TNG_FLOW_A11Y_MESSAGES,
      get keys(): IFA11yResolvedConfig['keys'] {
        return {
          ...F_DEFAULT_A11Y_KEYS,
          connect: [...readOptions().connectKeys],
        };
      },
    };
  }

  public configure(options: TngResolvedFlowKeyboardOptions): void {
    this.options = options;
  }
}
