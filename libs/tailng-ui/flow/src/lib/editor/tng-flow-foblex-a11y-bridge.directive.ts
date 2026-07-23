import { Directive, inject } from '@angular/core';
import { FCreateConnectionSession } from '@foblex/flow';

/**
 * Makes Foblex's public connection session available to the TailNG editor from the
 * same element injector as `fDraggable`. Foblex intentionally scopes the session to
 * that injector, so the parent editor must not discover it through private stores or
 * internal DOM attributes.
 */
@Directive({
  selector: '[tngFlowFoblexA11yBridge]',
  exportAs: 'tngFlowFoblexA11yBridge',
})
export class TngFlowFoblexA11yBridgeDirective {
  public readonly connectionSession = inject(FCreateConnectionSession);
}
