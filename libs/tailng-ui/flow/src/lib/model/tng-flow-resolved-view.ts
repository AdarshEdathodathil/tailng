/* eslint-disable complexity, max-params -- The resolver intentionally expresses precedence across controlled, compatibility, and structural state. */
import { resolveTngFlowValidationSeverity } from './tng-flow-issue-index';
import type {
  TngFlowConnectionPresentation,
  TngFlowNodePresentation,
  TngFlowResolvedConnectionView,
  TngFlowResolvedNodeView,
} from '../types/tng-flow-presentation.types';
import type { TngFlowValidationIssue } from '../types/tng-flow-validation.types';
import type {
  TngFlowConnection,
  TngFlowNode,
  TngFlowNodeStatus,
  TngFlowNodeView,
} from '../types/tng-flow.types';

export function resolveTngFlowNodeView<
  TNodeData,
  TStatus extends string = TngFlowNodeStatus,
>(
  node: TngFlowNode<TNodeData>,
  selected: boolean,
  presentation: TngFlowNodePresentation<TStatus> | undefined,
  legacyView: TngFlowNodeView<TStatus> | undefined,
  issues: readonly TngFlowValidationIssue[],
): TngFlowResolvedNodeView<TStatus> {
  const issueSeverity = resolveTngFlowValidationSeverity(issues);
  const validationSeverity = issueSeverity ?? (legacyView?.invalid === true ? 'error' : null);
  return {
    selected,
    disabled: node.disabled === true,
    locked: node.locked === true,
    status: (presentation?.status ?? legacyView?.status ?? 'idle') as TStatus,
    progress: presentation?.progress ?? legacyView?.progress ?? null,
    statusMessage: presentation?.statusMessage ?? legacyView?.message ?? null,
    validationSeverity,
    invalid: validationSeverity === 'error',
    highlighted: presentation?.highlighted === true,
    dimmed: presentation?.dimmed === true,
  };
}

export function resolveTngFlowConnectionView<TConnectionData>(
  connection: TngFlowConnection<TConnectionData>,
  selected: boolean,
  presentation: TngFlowConnectionPresentation | undefined,
  issues: readonly TngFlowValidationIssue[],
): TngFlowResolvedConnectionView {
  return {
    selected,
    disabled: connection.disabled === true,
    status: presentation?.status ?? (connection.disabled === true ? 'disabled' : 'idle'),
    validationSeverity: resolveTngFlowValidationSeverity(issues),
    issues,
    highlighted: presentation?.highlighted === true,
    dimmed: presentation?.dimmed === true,
    animated: presentation?.animated === true,
  };
}
