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
    '  --tng-flow-danger-color: var(--tng-semantic-accent-danger);',
    '  --tng-flow-port-border: var(--tng-semantic-foreground-secondary);',
    '  --tng-flow-port-background: var(--tng-semantic-background-surface);',
    '  --tng-flow-port-label-color: var(--tng-semantic-foreground-secondary);',
    '  --tng-flow-controls-background: var(--tng-semantic-background-surface);',
    '  --tng-flow-controls-border: var(--tng-semantic-border-subtle);',
    '}',
  ].join('\n');
  protected readonly templateCode = [
    '<tng-flow-editor [nodes]="nodes()" [connections]="connections()">',
    '  <ng-template tngFlowNode="tool" let-node let-view="view" let-selected="selected">',
    '    <tng-card',
    '      class="tool-node"',
    '      [interactive]="true"',
    "      [tone]=\"view.status === 'failed' ? 'danger' : 'neutral'\"",
    '      [attr.data-selected]="selected ? \'\' : null"',
    '    >',
    '      <strong>{{ node.name }}</strong>',
    '      <p>{{ node.data.summary }}</p>',
    '    </tng-card>',
    '  </ng-template>',
    '</tng-flow-editor>',
  ].join('\n');
}
