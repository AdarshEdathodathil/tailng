import type { DocsExampleCodeTab } from '../../../../../../shared/example-panel/docs-example-panel.component';

type SplitCodeExample = Readonly<{
  baseName: string;
  ts: string;
  html: string;
  css: string;
}>;

function createCodeTabs(example: SplitCodeExample): readonly DocsExampleCodeTab[] {
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

export const splitVerticalPlainCodeTabs = createCodeTabs({
  baseName: 'split-json-preview-plain',
  ts: `
import { Component, signal } from '@angular/core';
import {
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';

@Component({
  selector: 'app-split-json-preview-plain',
  standalone: true,
  imports: [TngSplitGroupComponent, TngSplitHandleComponent, TngSplitPaneDirective],
  templateUrl: './split-json-preview-plain.component.html',
  styleUrl: './split-json-preview-plain.component.css',
})
export class SplitJsonPreviewPlainComponent {
  protected readonly jsonCollapsed = signal(false);
}
  `,
  html: `
<tng-split-group class="json-layout" orientation="vertical">
  <section tngSplitPane paneId="editor" [grow]="1" [minSize]="180">
    <strong>Workflow editor</strong>
    <span>Build and connect automation steps.</span>
  </section>

  <tng-split-handle ariaLabel="Resize JSON preview" primaryPane="next" />

  <section
    tngSplitPane
    paneId="json"
    [defaultSize]="180"
    [minSize]="120"
    [maxSize]="260"
    collapsible
    [collapsed]="jsonCollapsed()"
    (collapsedChange)="jsonCollapsed.set($event)"
  >
    <strong>JSON preview</strong>
    <code>&#123; "nodes": 4, "connections": 3 &#125;</code>
  </section>
</tng-split-group>
  `,
  css: `
.json-layout {
  height: 28rem;
  overflow: hidden;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 0.875rem;
  background: var(--tng-semantic-background-canvas);
}

.json-layout [tngSplitPane] {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  padding: 1rem;
}

.json-layout [paneId='editor'] {
  place-content: center;
}

.json-layout [paneId='json'] {
  background: var(--tng-semantic-background-muted);
}
  `,
});

export const splitVerticalTailwindCodeTabs = createCodeTabs({
  baseName: 'split-json-preview-tailwind',
  ts: `
import { Component, signal } from '@angular/core';
import {
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';

@Component({
  selector: 'app-split-json-preview-tailwind',
  standalone: true,
  imports: [TngSplitGroupComponent, TngSplitHandleComponent, TngSplitPaneDirective],
  templateUrl: './split-json-preview-tailwind.component.html',
  styleUrl: './split-json-preview-tailwind.component.css',
})
export class SplitJsonPreviewTailwindComponent {
  protected readonly jsonCollapsed = signal(false);
}
  `,
  html: `
<tng-split-group
  class="h-[28rem] overflow-hidden rounded-xl border border-tng-border-subtle bg-tng-bg-base"
  orientation="vertical"
>
  <section
    tngSplitPane
    paneId="editor"
    [grow]="1"
    [minSize]="180"
    class="grid place-content-center gap-2 p-4 text-tng-fg-primary"
  >
    <strong>Workflow editor</strong>
    <span class="text-sm text-tng-fg-secondary">Build and connect automation steps.</span>
  </section>

  <tng-split-handle ariaLabel="Resize JSON preview" primaryPane="next" />

  <section
    tngSplitPane
    paneId="json"
    [defaultSize]="180"
    [minSize]="120"
    [maxSize]="260"
    collapsible
    [collapsed]="jsonCollapsed()"
    (collapsedChange)="jsonCollapsed.set($event)"
    class="grid content-start gap-2 bg-tng-bg-muted p-4 text-tng-fg-primary"
  >
    <strong>JSON preview</strong>
    <code class="text-sm text-tng-fg-secondary">&#123; "nodes": 4, "connections": 3 &#125;</code>
  </section>
</tng-split-group>
  `,
  css: '/* Tailwind utilities are applied directly in the template. */',
});

export const splitWorkspacePlainCodeTabs = createCodeTabs({
  baseName: 'split-app-workspace-plain',
  ts: `
import { Component, signal } from '@angular/core';
import {
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';

@Component({
  selector: 'app-split-app-workspace-plain',
  standalone: true,
  imports: [
    TngIcon,
    TngSplitGroupComponent,
    TngSplitHandleComponent,
    TngSplitPaneDirective,
  ],
  templateUrl: './split-app-workspace-plain.component.html',
  styleUrl: './split-app-workspace-plain.component.css',
})
export class SplitAppWorkspacePlainComponent {
  protected readonly projectCollapsed = signal(false);
  protected readonly inspectorCollapsed = signal(false);

  protected toggleProject(): void {
    this.projectCollapsed.update((collapsed) => !collapsed);
  }

  protected toggleInspector(): void {
    this.inspectorCollapsed.update((collapsed) => !collapsed);
  }
}
  `,
  html: `
<div class="app-workspace">
  <header class="app-workspace__toolbar">
    <strong>Customer portal</strong>
    <div class="app-workspace__actions">
      <button
        type="button"
        aria-controls="project-panel"
        [attr.aria-expanded]="!projectCollapsed()"
        [attr.aria-label]="projectCollapsed() ? 'Show project navigator' : 'Hide project navigator'"
        (click)="toggleProject()"
      >
        <tng-icon [icon]="projectCollapsed() ? 'panel-left-open' : 'panel-left-close'" />
      </button>
      <button
        type="button"
        aria-controls="inspector-panel"
        [attr.aria-expanded]="!inspectorCollapsed()"
        [attr.aria-label]="inspectorCollapsed() ? 'Show inspector' : 'Hide inspector'"
        (click)="toggleInspector()"
      >
        <tng-icon [icon]="inspectorCollapsed() ? 'panel-right-open' : 'panel-right-close'" />
      </button>
    </div>
  </header>

  <div class="app-workspace__viewport">
    <tng-split-group class="app-workspace__layout" orientation="horizontal">
      <aside
        id="project-panel"
        tngSplitPane
        paneId="project"
        [defaultSize]="220"
        [minSize]="160"
        [maxSize]="300"
        collapsible
        [collapsed]="projectCollapsed()"
        (collapsedChange)="projectCollapsed.set($event)"
        class="app-workspace__project"
      >
        <strong>Project</strong>
        <nav aria-label="Project files">
          <span>⌄ src</span>
          <span>&nbsp;&nbsp;customer-profile.component.ts</span>
          <span>&nbsp;&nbsp;customer-profile.component.html</span>
          <span>&nbsp;&nbsp;customer-profile.component.css</span>
        </nav>
      </aside>

      <tng-split-handle ariaLabel="Resize project navigator" />

      <main tngSplitPane paneId="editor" [grow]="1" [minSize]="280" class="app-workspace__editor">
        <div class="app-workspace__tab">customer-profile.component.ts</div>
        <pre><code>export class CustomerProfileComponent
  readonly customer = input.required&lt;Customer&gt;();</code></pre>
      </main>

      <tng-split-handle ariaLabel="Resize inspector" primaryPane="next" />

      <aside
        id="inspector-panel"
        tngSplitPane
        paneId="inspector"
        [defaultSize]="260"
        [minSize]="200"
        [maxSize]="340"
        collapsible
        [collapsed]="inspectorCollapsed()"
        (collapsedChange)="inspectorCollapsed.set($event)"
        class="app-workspace__inspector"
      >
        <strong>Properties</strong>
        <label>Name <input value="Customer profile" /></label>
        <label>Route <input value="/customers/:id" /></label>
      </aside>
    </tng-split-group>
  </div>
</div>
  `,
  css: `
.app-workspace {
  overflow: hidden;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 0.875rem;
  background: var(--tng-semantic-background-surface);
}

.app-workspace__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  padding-inline: 0.75rem;
  border-bottom: 1px solid var(--tng-semantic-border-default);
}

.app-workspace__actions {
  display: flex;
  gap: 0.35rem;
}

.app-workspace__actions button {
  display: inline-grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 0.5rem;
  background: var(--tng-semantic-background-canvas);
  color: var(--tng-semantic-foreground-secondary);
  cursor: pointer;
}

.app-workspace__actions button:hover {
  background: var(--tng-semantic-background-muted);
  color: var(--tng-semantic-foreground-primary);
}

.app-workspace__actions button:focus-visible {
  outline: 2px solid var(--tng-semantic-focus-ring);
  outline-offset: 2px;
}

.app-workspace__viewport {
  overflow-x: auto;
}

.app-workspace__layout {
  min-width: 46rem;
  height: 30rem;
}

.app-workspace__project,
.app-workspace__inspector {
  display: grid;
  align-content: start;
  gap: 1rem;
  padding: 1rem;
  background: var(--tng-semantic-background-muted);
}

.app-workspace__project nav {
  display: grid;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--tng-semantic-foreground-secondary);
}

.app-workspace__editor {
  background: var(--tng-semantic-background-canvas);
}

.app-workspace__tab {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--tng-semantic-border-default);
  font-size: 0.8rem;
}

.app-workspace__editor pre {
  margin: 0;
  padding: 1.5rem;
  color: var(--tng-semantic-foreground-primary);
  line-height: 1.8;
}

.app-workspace__inspector label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--tng-semantic-foreground-secondary);
}

.app-workspace__inspector input {
  min-width: 0;
  border: 1px solid var(--tng-semantic-border-default);
  border-radius: 0.45rem;
  padding: 0.55rem 0.65rem;
  background: var(--tng-semantic-background-canvas);
  color: var(--tng-semantic-foreground-primary);
}
  `,
});

export const splitWorkspaceTailwindCodeTabs = createCodeTabs({
  baseName: 'split-app-workspace-tailwind',
  ts: `
import { Component, signal } from '@angular/core';
import {
  TngSplitGroupComponent,
  TngSplitHandleComponent,
  TngSplitPaneDirective,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';

@Component({
  selector: 'app-split-app-workspace-tailwind',
  standalone: true,
  imports: [
    TngIcon,
    TngSplitGroupComponent,
    TngSplitHandleComponent,
    TngSplitPaneDirective,
  ],
  templateUrl: './split-app-workspace-tailwind.component.html',
  styleUrl: './split-app-workspace-tailwind.component.css',
})
export class SplitAppWorkspaceTailwindComponent {
  protected readonly projectCollapsed = signal(false);
  protected readonly inspectorCollapsed = signal(false);

  protected toggleProject(): void {
    this.projectCollapsed.update((collapsed) => !collapsed);
  }

  protected toggleInspector(): void {
    this.inspectorCollapsed.update((collapsed) => !collapsed);
  }
}
  `,
  html: `
<div class="overflow-hidden rounded-xl border border-tng-border-subtle bg-tng-bg-surface text-tng-fg-primary">
  <header class="flex min-h-12 items-center justify-between border-b border-tng-border-subtle px-3">
    <strong>Customer portal</strong>
    <div class="flex gap-1.5">
      <button
        type="button"
        class="grid size-8 place-items-center rounded-lg border border-tng-border-subtle bg-tng-bg-base text-tng-fg-secondary transition hover:bg-tng-bg-muted hover:text-tng-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tng-focus-ring"
        aria-controls="project-panel"
        [attr.aria-expanded]="!projectCollapsed()"
        [attr.aria-label]="projectCollapsed() ? 'Show project navigator' : 'Hide project navigator'"
        (click)="toggleProject()"
      >
        <tng-icon [icon]="projectCollapsed() ? 'panel-left-open' : 'panel-left-close'" class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="grid size-8 place-items-center rounded-lg border border-tng-border-subtle bg-tng-bg-base text-tng-fg-secondary transition hover:bg-tng-bg-muted hover:text-tng-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tng-focus-ring"
        aria-controls="inspector-panel"
        [attr.aria-expanded]="!inspectorCollapsed()"
        [attr.aria-label]="inspectorCollapsed() ? 'Show inspector' : 'Hide inspector'"
        (click)="toggleInspector()"
      >
        <tng-icon [icon]="inspectorCollapsed() ? 'panel-right-open' : 'panel-right-close'" class="h-4 w-4" />
      </button>
    </div>
  </header>

  <div class="overflow-x-auto">
    <tng-split-group class="h-[30rem] min-w-[46rem]" orientation="horizontal">
      <aside
        id="project-panel"
        tngSplitPane
        paneId="project"
        [defaultSize]="220"
        [minSize]="160"
        [maxSize]="300"
        collapsible
        [collapsed]="projectCollapsed()"
        (collapsedChange)="projectCollapsed.set($event)"
        class="grid content-start gap-4 bg-tng-bg-muted p-4"
      >
        <strong>Project</strong>
        <nav aria-label="Project files" class="grid gap-2.5 text-xs text-tng-fg-secondary">
          <span>⌄ src</span>
          <span>&nbsp;&nbsp;customer-profile.component.ts</span>
          <span>&nbsp;&nbsp;customer-profile.component.html</span>
          <span>&nbsp;&nbsp;customer-profile.component.css</span>
        </nav>
      </aside>

      <tng-split-handle ariaLabel="Resize project navigator" />

      <main tngSplitPane paneId="editor" [grow]="1" [minSize]="280" class="bg-tng-bg-base">
        <div class="border-b border-tng-border-subtle px-4 py-3 text-xs">customer-profile.component.ts</div>
        <pre class="m-0 p-6 leading-7 text-tng-fg-primary"><code>export class CustomerProfileComponent
  readonly customer = input.required&lt;Customer&gt;();</code></pre>
      </main>

      <tng-split-handle ariaLabel="Resize inspector" primaryPane="next" />

      <aside
        id="inspector-panel"
        tngSplitPane
        paneId="inspector"
        [defaultSize]="260"
        [minSize]="200"
        [maxSize]="340"
        collapsible
        [collapsed]="inspectorCollapsed()"
        (collapsedChange)="inspectorCollapsed.set($event)"
        class="grid content-start gap-4 bg-tng-bg-muted p-4"
      >
        <strong>Properties</strong>
        <label class="grid gap-1.5 text-xs text-tng-fg-secondary">
          Name
          <input class="min-w-0 rounded-lg border border-tng-border-subtle bg-tng-bg-base px-2.5 py-2 text-tng-fg-primary" value="Customer profile" />
        </label>
        <label class="grid gap-1.5 text-xs text-tng-fg-secondary">
          Route
          <input class="min-w-0 rounded-lg border border-tng-border-subtle bg-tng-bg-base px-2.5 py-2 text-tng-fg-primary" value="/customers/:id" />
        </label>
      </aside>
    </tng-split-group>
  </div>
</div>
  `,
  css: '/* Tailwind utilities are applied directly in the template. */',
});
