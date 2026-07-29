import { Directive, inject } from '@angular/core';
import {
  ECanvasRedrawContext,
  FComponentsStore,
  FCreateConnectionSession,
  RedrawCanvasWithAnimationRequest,
} from '@foblex/flow';
import { FMediator } from '@foblex/mediator';

/**
 * Makes flow-scoped Foblex APIs available to the TailNG editor from the same element
 * injector as `fDraggable`. Foblex intentionally scopes these APIs to that injector,
 * so the parent editor must not discover them through private stores or DOM attributes.
 */
@Directive({
  selector: '[tngFlowFoblexBridge]',
  exportAs: 'tngFlowFoblexBridge',
})
export class TngFlowFoblexBridgeDirective {
  private readonly mediator = inject(FMediator);
  private readonly componentsStore = inject(FComponentsStore);

  /**
   * Typed as `object` so Foblex does not leak into published `.d.ts` files.
   * The editor unwraps this to `FCreateConnectionSession` privately.
   */
  public readonly connectionSession: object = inject(FCreateConnectionSession);

  public get isViewportAnimating(): boolean {
    return this.componentsStore.isViewportAnimating;
  }

  public redrawCanvas(animated: boolean): void {
    this.mediator.execute(
      new RedrawCanvasWithAnimationRequest(
        animated,
        ECanvasRedrawContext.WITH_CONNECTION_CHANGES,
        true,
      ),
    );
  }
}
