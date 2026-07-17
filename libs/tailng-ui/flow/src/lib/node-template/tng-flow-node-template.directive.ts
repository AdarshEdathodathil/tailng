/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- Angular template guards receive directive instances. */
import { Directive, TemplateRef, inject, input } from '@angular/core';
import type {
  TngFlowEditorMode,
  TngFlowNode,
  TngFlowNodeStatus,
  TngFlowNodeView,
} from '../types/tng-flow.types';

export type TngFlowNodeTemplateContext<
  TData = unknown,
  TStatus extends string = TngFlowNodeStatus,
> = Readonly<{
  $implicit: TngFlowNode<TData>;
  node: TngFlowNode<TData>;
  view: TngFlowNodeView<TStatus>;
  mode: TngFlowEditorMode;
  /** @deprecated Use `mode`. */
  readonly: boolean;
  selected: boolean;
}>;

@Directive({
  selector: 'ng-template[tngFlowNode]',
  exportAs: 'tngFlowNodeTemplate',
})
export class TngFlowNodeTemplateDirective<
  TData = unknown,
  TStatus extends string = TngFlowNodeStatus,
> {
  public readonly nodeType = input.required<string>({ alias: 'tngFlowNode' });
  public readonly templateRef =
    inject<TemplateRef<TngFlowNodeTemplateContext<TData, TStatus>>>(TemplateRef);

  public static ngTemplateContextGuard<TData, TStatus extends string>(
    _directive: TngFlowNodeTemplateDirective<TData, TStatus>,
    _context: unknown,
  ): _context is TngFlowNodeTemplateContext<TData, TStatus> {
    return true;
  }
}
