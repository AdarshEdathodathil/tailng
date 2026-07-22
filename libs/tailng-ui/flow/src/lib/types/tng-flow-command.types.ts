import type { TngFlowPoint, TngFlowSelection } from './tng-flow.types';

export type TngFlowEditorCommand = 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'duplicate';

export type TngFlowEditorCommandSource = 'api' | 'keyboard' | 'context-menu';

/** `false` disables interception; `true` enables every mode-allowed command. */
export type TngFlowEditorCommandShortcuts = boolean | readonly TngFlowEditorCommand[];

export type TngFlowEditorCommandRequest = Readonly<{
  command: TngFlowEditorCommand;
  selection: TngFlowSelection;
  source: TngFlowEditorCommandSource;
  canvasPosition?: TngFlowPoint;
}>;
