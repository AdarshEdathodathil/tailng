import { Component } from '@angular/core';
import { TngCodeBlockComponent } from '@tailng-ui/components';

@Component({
  selector: 'app-flow-editor-styling-page',
  imports: [TngCodeBlockComponent],
  templateUrl: './flow-editor-styling-page.component.html',
})
export class FlowEditorStylingPageComponent {
  protected readonly requiredStylesCode = [
    '/* Add once to the application global stylesheet. */',
    "@import '@tailng-ui/flow/styles.css';",
  ].join('\n');
  protected readonly sizingCode = [
    'tng-flow-editor.agent-builder {',
    '  display: block;',
    '  height: min(70vh, 48rem);',
    '  min-height: 30rem;',
    '}',
  ].join('\n');
  protected readonly variablesCode = [
    'tng-flow-editor.agent-builder {',
    '  --tng-flow-background: var(--tng-semantic-background-canvas);',
    '  --tng-flow-border-color: var(--tng-semantic-border-subtle);',
    '  --tng-flow-border-radius: 1rem;',
    '  --tng-flow-grid-color: color-mix(',
    '    in srgb,',
    '    var(--tng-semantic-foreground-secondary) 22%,',
    '    transparent',
    '  );',
    '  --tng-flow-selection-color: var(--tng-semantic-accent-brand);',
    '  --tng-flow-node-error-border: var(--tng-semantic-accent-danger);',
    '  --tng-flow-node-warning-border: var(--tng-semantic-accent-warning);',
    '  --tng-flow-node-info-border: var(--tng-semantic-accent-info);',
    '  --tng-flow-port-error-color: var(--tng-semantic-accent-danger);',
    '  --tng-flow-connection-error-color: var(--tng-semantic-accent-danger);',
    '  --tng-flow-validation-badge-size: 1.25rem;',
    '  --tng-flow-port-border: var(--tng-semantic-foreground-secondary);',
    '  --tng-flow-port-background: var(--tng-semantic-background-surface);',
    '  --tng-flow-port-label-color: var(--tng-semantic-foreground-secondary);',
    '  --tng-flow-controls-background: var(--tng-semantic-background-surface);',
    '  --tng-flow-controls-border: var(--tng-semantic-border-subtle);',
    '}',
  ].join('\n');
  protected readonly templateCode = [
    '<tng-flow-editor [nodes]="nodes()" [connections]="connections()">',
    '  <ng-template tngFlowNode="tool" let-node let-view="view" let-issues="issues">',
    '    <tng-card',
    '      class="tool-node"',
    '      [interactive]="true"',
    "      [tone]=\"view.status === 'failed' ? 'danger' : 'neutral'\"",
    '      [attr.data-selected]="view.selected ? \'\' : null"',
    '      [attr.data-validation]="view.validationSeverity"',
    '    >',
    '      <strong>{{ node.name }}</strong>',
    '      <p>{{ node.data.summary }}</p>',
    '      <span>{{ issues.length }} issue(s)</span>',
    '    </tng-card>',
    '  </ng-template>',
    '</tng-flow-editor>',
  ].join('\n');
}
