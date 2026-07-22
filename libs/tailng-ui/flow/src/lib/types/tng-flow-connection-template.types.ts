import type { TngFlowResolvedConnectionView } from './tng-flow-presentation.types';
import type { TngFlowValidationIssue } from './tng-flow-validation.types';
import type { TngFlowConnection, TngFlowEditorMode } from './tng-flow.types';

/** Context supplied to geometry-preserving custom connection content. */
export type TngFlowConnectionTemplateContext<TData = unknown> = Readonly<{
  $implicit: TngFlowConnection<TData>;
  connection: TngFlowConnection<TData>;
  view: TngFlowResolvedConnectionView;
  issues: readonly TngFlowValidationIssue[];
  mode: TngFlowEditorMode;
  readonly: boolean;
  selected: boolean;
}>;
