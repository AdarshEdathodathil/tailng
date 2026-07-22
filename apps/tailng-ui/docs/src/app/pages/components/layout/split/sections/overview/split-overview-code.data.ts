import type { DocsExampleCodeTab } from '../../../../../../shared/example-panel/docs-example-panel.component';

type SplitOverviewCodeExample = Readonly<{
  baseName: string;
  ts: string;
  html: string;
  css: string;
}>;

function createCodeTabs(example: SplitOverviewCodeExample): readonly DocsExampleCodeTab[] {
  return Object.freeze([
    {
      value: 'ts',
      label: 'TS',
      language: 'ts',
      title: `${example.baseName}.component.ts`,
      code: example.ts.trim(),
    },
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: `${example.baseName}.component.html`,
      code: example.html.trim(),
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: `${example.baseName}.component.css`,
      code: example.css.trim(),
    },
  ]);
}

export const splitOverviewPlainCodeTabs = createCodeTabs({
  baseName: 'split-workspace-plain',
  ts: `
import { Component, signal } from '@angular/core';
import {
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';

@Component({
  selector: 'app-split-workspace-plain',
  standalone: true,
  imports: [TngSplitGroupComponent, TngSplitHandleComponent, TngSplitPaneDirective],
  templateUrl: './split-workspace-plain.component.html',
  styleUrl: './split-workspace-plain.component.css',
})
export class SplitWorkspacePlainComponent {
  protected readonly paletteCollapsed = signal(false);
  protected readonly inspectorCollapsed = signal(false);
  protected readonly jsonCollapsed = signal(false);
}
  `,
  html: `
<tng-split-group class="workspace" orientation="horizontal">
  <aside
    tngSplitPane
    paneId="palette"
    [defaultSize]="272"
    [minSize]="224"
    [maxSize]="360"
    collapsible
    [collapsed]="paletteCollapsed()"
    [collapsedSize]="56"
    (collapsedChange)="paletteCollapsed.set($event)"
  >
    <span class="workspace__icon" aria-hidden="true">＋</span>
    <strong class="workspace__palette-label">Node palette</strong>
  </aside>

  <tng-split-handle ariaLabel="Resize node palette" />

  <main tngSplitPane paneId="workspace" [grow]="1" [minSize]="480">
    <tng-split-group orientation="vertical">
      <section tngSplitPane paneId="canvas" [grow]="1" [minSize]="240">
        <strong>Workflow canvas</strong>
        <span>Flexible center workspace</span>
      </section>

      <tng-split-handle ariaLabel="Resize JSON preview" primaryPane="next" />

      <section
        tngSplitPane
        paneId="json"
        [defaultSize]="160"
        [minSize]="120"
        [maxSize]="240"
        collapsible
        [collapsed]="jsonCollapsed()"
        (collapsedChange)="jsonCollapsed.set($event)"
      >
        <strong>JSON preview</strong>
        <code>&#123; "workflow": "ready" &#125;</code>
      </section>
    </tng-split-group>
  </main>

  <tng-split-handle ariaLabel="Resize node inspector" primaryPane="next" />

  <aside
    tngSplitPane
    paneId="inspector"
    [defaultSize]="352"
    [minSize]="288"
    [maxSize]="480"
    collapsible
    [collapsed]="inspectorCollapsed()"
    (collapsedChange)="inspectorCollapsed.set($event)"
  >
    <strong>Node inspector</strong>
    <span>Controlled properties</span>
  </aside>
</tng-split-group>
  `,
  css: `
.workspace {
  height: 32rem;
  overflow: hidden;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 0.9rem;
  background: var(--tng-semantic-background-canvas);
}

.workspace [tngSplitPane] {
  display: grid;
  align-content: start;
  gap: 0.45rem;
  padding: 1rem;
}

.workspace [paneId='palette'],
.workspace [paneId='inspector'] {
  background: var(--tng-semantic-background-surface);
}

.workspace [paneId='canvas'] {
  place-content: center;
  text-align: center;
}

.workspace [paneId='json'] {
  border-top: 1px solid var(--tng-semantic-border-subtle);
  background: var(--tng-semantic-background-muted);
}

.workspace__icon {
  font-size: 1.25rem;
}

.workspace [paneId='palette'][data-collapsed] {
  justify-items: center;
  padding-inline: 0;
}

.workspace [paneId='palette'][data-collapsed] .workspace__palette-label {
  display: none;
}
  `,
});

export const splitOverviewTailwindCodeTabs = createCodeTabs({
  baseName: 'split-workspace-tailwind',
  ts: `
import { Component, signal } from '@angular/core';
import {
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';

@Component({
  selector: 'app-split-workspace-tailwind',
  standalone: true,
  imports: [TngSplitGroupComponent, TngSplitHandleComponent, TngSplitPaneDirective],
  templateUrl: './split-workspace-tailwind.component.html',
  styleUrl: './split-workspace-tailwind.component.css',
})
export class SplitWorkspaceTailwindComponent {
  protected readonly paletteCollapsed = signal(false);
  protected readonly inspectorCollapsed = signal(false);
  protected readonly jsonCollapsed = signal(false);
}
  `,
  html: `
<div
  class="h-[31rem] overflow-hidden rounded-xl border border-tng-border-subtle bg-tng-bg-base text-tng-fg-primary"
>
<tng-split-group class="overflow-hidden bg-tng-bg-base" orientation="horizontal">
  <aside
    tngSplitPane
    paneId="palette"
    [defaultSize]="272"
    [minSize]="224"
    [maxSize]="360"
    collapsible
    [collapsed]="paletteCollapsed()"
    [collapsedSize]="56"
    (collapsedChange)="paletteCollapsed.set($event)"
    class="grid content-start gap-2 bg-tng-bg-surface p-4"
  >
    <span class="text-xl" aria-hidden="true">＋</span>
    @if (!paletteCollapsed()) {
      <strong>Node palette</strong>
    }
  </aside>

  <tng-split-handle ariaLabel="Resize node palette" />

  <main tngSplitPane paneId="workspace" [grow]="1" [minSize]="480">
    <tng-split-group orientation="vertical">
      <section
        tngSplitPane
        paneId="canvas"
        [grow]="1"
        [minSize]="240"
        class="grid place-content-center gap-2 p-4 text-center"
      >
        <strong>Workflow canvas</strong>
        <span class="text-sm text-tng-fg-secondary">Flexible center workspace</span>
      </section>

      <tng-split-handle ariaLabel="Resize JSON preview" primaryPane="next" />

      <section
        tngSplitPane
        paneId="json"
        [defaultSize]="160"
        [minSize]="120"
        [maxSize]="240"
        collapsible
        [collapsed]="jsonCollapsed()"
        (collapsedChange)="jsonCollapsed.set($event)"
        class="grid content-start gap-2 border-t border-tng-border-subtle bg-tng-bg-muted p-4"
      >
        <strong>JSON preview</strong>
        <code class="text-sm text-tng-fg-secondary">&#123; "workflow": "ready" &#125;</code>
      </section>
    </tng-split-group>
  </main>

  <tng-split-handle ariaLabel="Resize node inspector" primaryPane="next" />

  <aside
    tngSplitPane
    paneId="inspector"
    [defaultSize]="352"
    [minSize]="288"
    [maxSize]="480"
    collapsible
    [collapsed]="inspectorCollapsed()"
    (collapsedChange)="inspectorCollapsed.set($event)"
    class="grid content-start gap-2 bg-tng-bg-surface p-4"
  >
    <strong>Node inspector</strong>
    <span class="text-sm text-tng-fg-secondary">Controlled properties</span>
  </aside>
</tng-split-group>
</div>
  `,
  css: '/* Tailwind utilities are applied directly in the template. */',
});
