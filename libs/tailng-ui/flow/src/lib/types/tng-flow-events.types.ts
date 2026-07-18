import type { TngFlowValidationIssue } from './tng-flow-validation.types';

export type TngFlowActivationSource = 'pointer' | 'keyboard' | 'api';

export type TngFlowNodeActivatedEvent = Readonly<{
  nodeId: string;
  source: TngFlowActivationSource;
}>;

export type TngFlowConnectionActivatedEvent = Readonly<{
  connectionId: string;
  source: TngFlowActivationSource;
}>;

export type TngFlowValidationIssueActivationSource =
  | 'flow-badge'
  | 'node-badge'
  | 'port-badge'
  | 'connection'
  | 'api';

export type TngFlowValidationIssueActivatedEvent = Readonly<{
  issue: TngFlowValidationIssue;
  source: TngFlowValidationIssueActivationSource;
}>;
