import { Component } from '@angular/core';
import { TngCodeBlockComponent } from '@tailng-ui/components';

@Component({
  selector: 'app-split-styling-page',
  imports: [TngCodeBlockComponent],
  templateUrl: './split-styling-page.component.html',
})
export class SplitStylingPageComponent {
  protected readonly tokenCode = [
    'tng-split-group.workspace-split {',
    '  --tng-split-handle-width: 1px;',
    '  --tng-split-handle-hit-area: 10px;',
    '  --tng-split-separator-color: var(--tng-semantic-border-default);',
    '  --tng-split-separator-hover-color: var(--tng-semantic-accent-brand);',
    '  --tng-split-separator-active-color: var(--tng-semantic-accent-brand);',
    '  --tng-split-focus-ring: 0 0 0 3px var(--tng-semantic-focus-ring);',
    '  --tng-split-pane-background: var(--tng-semantic-background-surface);',
    '  --tng-split-disabled-opacity: 0.65;',
    '  --tng-split-handle-indicator-display: block;',
    '}',
  ].join('\n');
}
