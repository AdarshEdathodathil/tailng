export type TngFlowValidationSeverity = 'error' | 'warning' | 'info';

export type TngFlowValidationTarget =
  | Readonly<{ kind: 'flow' }>
  | Readonly<{ kind: 'node'; nodeId: string }>
  | Readonly<{ kind: 'port'; nodeId: string; portId: string }>
  | Readonly<{ kind: 'connection'; connectionId: string }>;

export type TngFlowValidationIssue = Readonly<{
  /** Stable identity used for rendering, activation, and application-side tracking. */
  id: string;
  /** Consumer-extensible machine-readable code. */
  code: string;
  severity: TngFlowValidationSeverity;
  message: string;
  target: TngFlowValidationTarget;
  /** Opaque consumer data. TailNG never interprets this value. */
  data?: Readonly<Record<string, unknown>>;
}>;

export type TngFlowValidation = Readonly<{
  issues: readonly TngFlowValidationIssue[];
}>;

const EMPTY_TNG_FLOW_VALIDATION_ISSUES = Object.freeze([]) as readonly TngFlowValidationIssue[];

export const EMPTY_TNG_FLOW_VALIDATION: TngFlowValidation = Object.freeze({
  issues: EMPTY_TNG_FLOW_VALIDATION_ISSUES,
});

export type TngFlowStructuralIssueCode =
  | 'duplicate-connection-id'
  | 'duplicate-connection'
  | 'duplicate-node-id'
  | 'duplicate-port-id'
  | 'empty-connection-id'
  | 'empty-node-id'
  | 'empty-port-id'
  | 'incompatible-ports'
  | 'incompatible-port-kind'
  | 'invalid-connections'
  | 'invalid-node-position'
  | 'invalid-node-record'
  | 'invalid-nodes'
  | 'invalid-port-direction'
  | 'invalid-port-record'
  | 'invalid-source-port'
  | 'invalid-target-port'
  | 'missing-source-node'
  | 'missing-source-port'
  | 'missing-target-node'
  | 'missing-target-port'
  | 'mixed-port-model'
  | 'port-connection-limit'
  | 'self-connection-disabled';
