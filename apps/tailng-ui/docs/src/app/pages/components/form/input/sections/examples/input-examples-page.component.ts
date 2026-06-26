import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal, type OnDestroy } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TngInputComponent } from '@tailng-ui/components';
import type { DocsExampleCodeTab } from '../../../../../../shared/example-panel/docs-example-panel.component';
import {
  DocsExampleTabsSectionComponent,
  DocsExampleVariantDirective,
} from '../../../../../../shared/example-tabs-section/docs-example-tabs-section.component';
import { DocsFormDemoShellComponent } from '../../../../../../shared/form-demo-shell/docs-form-demo-shell.component';
import {
  observeDocsCodeThemeChanges,
  resolveDocsCodeBlockTheme,
} from '../../../../../../shared/util';
import { stackblitzTailwindUrl, stackblitzVanillaUrl } from '../../input.util';

function createCodeTabs(options: {
  baseName: string;
  tsCode: string;
  htmlCode: string;
  cssCode: string;
}): readonly DocsExampleCodeTab[] {
  const { baseName, tsCode, htmlCode, cssCode } = options;
  return Object.freeze([
    {
      value: 'ts',
      label: 'TS',
      language: 'ts',
      title: `${baseName}.component.ts`,
      code: tsCode,
    },
    {
      value: 'html',
      label: 'HTML',
      language: 'html',
      title: `${baseName}.component.html`,
      code: htmlCode,
    },
    {
      value: 'css',
      label: 'CSS',
      language: 'css',
      title: `${baseName}.component.css`,
      code: cssCode,
    },
  ]);
}

@Component({
  selector: 'app-input-examples-page',
  imports: [
    DocsExampleTabsSectionComponent,
    DocsExampleVariantDirective,
    DocsFormDemoShellComponent,
    FormField,
    TngInputComponent,
  ],
  templateUrl: './input-examples-page.component.html',
  styleUrl: './input-examples-page.component.css',
})
export class InputExamplesPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );
  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly stackblitzVanillaUrl = stackblitzVanillaUrl;
  protected readonly stackblitzTailwindUrl = stackblitzTailwindUrl;
  protected readonly formDemoValue = signal('Nova workspace');
  protected readonly signalNumberModel = signal({
    quantity: '12',
    unitPrice: '49.99',
  });
  protected readonly signalNumberForm = form(this.signalNumberModel);
  protected readonly signalNumberTotal = computed(() => {
    const { quantity, unitPrice } = this.signalNumberModel();
    const quantityValue = Number(quantity);
    const unitPriceValue = Number(unitPrice);

    if (!Number.isFinite(quantityValue) || !Number.isFinite(unitPriceValue)) {
      return '—';
    }

    return (quantityValue * unitPriceValue).toFixed(2);
  });
  protected readonly taxGroupRate = signal('8.5');

  private readonly tsBasic = [
    "import { Component } from '@angular/core';",
    "import { TngInputComponent } from '@tailng-ui/components';",
    '',
    '@Component({',
    "  selector: 'app-doc-cmp-input-ex-basic',",
    '  standalone: true,',
    '  imports: [TngInputComponent],',
    "  templateUrl: './doc-cmp-input-ex-basic.component.html',",
    "  styleUrl: './doc-cmp-input-ex-basic.component.css',",
    '})',
    'export class DocCmpInputExBasicComponent {}',
    '',
  ].join('\n');

  private readonly tsTypes = [
    "import { Component } from '@angular/core';",
    "import { TngInputComponent } from '@tailng-ui/components';",
    '',
    '@Component({',
    "  selector: 'app-doc-cmp-input-ex-types',",
    '  standalone: true,',
    '  imports: [TngInputComponent],',
    "  templateUrl: './doc-cmp-input-ex-types.component.html',",
    "  styleUrl: './doc-cmp-input-ex-types.component.css',",
    '})',
    'export class DocCmpInputExTypesComponent {}',
    '',
  ].join('\n');

  private readonly tsSignalNumberForm = [
    "import { Component, computed, signal } from '@angular/core';",
    "import { FormField, form } from '@angular/forms/signals';",
    "import { TngInputComponent } from '@tailng-ui/components';",
    '',
    '@Component({',
    "  selector: 'app-doc-cmp-input-ex-signal-number-form',",
    '  standalone: true,',
    '  imports: [FormField, TngInputComponent],',
    "  templateUrl: './doc-cmp-input-ex-signal-number-form.component.html',",
    "  styleUrl: './doc-cmp-input-ex-signal-number-form.component.css',",
    '})',
    'export class DocCmpInputExSignalNumberFormComponent {',
    '  protected readonly orderModel = signal({',
    "    quantity: '12',",
    "    unitPrice: '49.99',",
    '  });',
    '  protected readonly orderForm = form(this.orderModel);',
    '  protected readonly total = computed(() => {',
    '    const { quantity, unitPrice } = this.orderModel();',
    '    const quantityValue = Number(quantity);',
    '    const unitPriceValue = Number(unitPrice);',
    '',
    '    if (!Number.isFinite(quantityValue) || !Number.isFinite(unitPriceValue)) {',
    "      return '—';",
    '    }',
    '',
    '    return (quantityValue * unitPriceValue).toFixed(2);',
    '  });',
    '}',
    '',
  ].join('\n');

  private readonly tsValidation = [
    "import { Component } from '@angular/core';",
    "import { TngInputComponent } from '@tailng-ui/components';",
    '',
    '@Component({',
    "  selector: 'app-doc-cmp-input-ex-validation',",
    '  standalone: true,',
    '  imports: [TngInputComponent],',
    "  templateUrl: './doc-cmp-input-ex-validation.component.html',",
    "  styleUrl: './doc-cmp-input-ex-validation.component.css',",
    '})',
    'export class DocCmpInputExValidationComponent {}',
    '',
  ].join('\n');

  private readonly tsNumber = [
    "import { Component, signal } from '@angular/core';",
    "import { TngInputComponent } from '@tailng-ui/components';",
    '',
    '@Component({',
    "  selector: 'app-doc-cmp-input-ex-number',",
    '  standalone: true,',
    '  imports: [TngInputComponent],',
    "  templateUrl: './doc-cmp-input-ex-number.component.html',",
    "  styleUrl: './doc-cmp-input-ex-number.component.css',",
    '})',
    'export class DocCmpInputExNumberComponent {',
    "  protected readonly taxGroupRate = signal('8.5');",
    '}',
    '',
  ].join('\n');

  private readonly tsStates = [
    "import { Component } from '@angular/core';",
    "import { TngInputComponent } from '@tailng-ui/components';",
    '',
    '@Component({',
    "  selector: 'app-doc-cmp-input-ex-states',",
    '  standalone: true,',
    '  imports: [TngInputComponent],',
    "  templateUrl: './doc-cmp-input-ex-states.component.html',",
    "  styleUrl: './doc-cmp-input-ex-states.component.css',",
    '})',
    'export class DocCmpInputExStatesComponent {}',
    '',
  ].join('\n');

  private readonly plainCssBasic = [
    '/*',
    ' * tng-input uses default component styles; keep local CSS for layout only.',
    ' */',
    '',
    '.doc-cmp-input-ex-basic-preview {',
    '  display: grid;',
    '  gap: 0.65rem;',
    '  width: min(100%, 32rem);',
    '}',
    '',
  ].join('\n');

  private readonly plainCssTypes = [
    '/* Layout only; tng-input styling comes from the component. */',
    '',
    '.doc-cmp-input-ex-types-preview.doc-cmp-input-ex-types-grid {',
    '  display: grid;',
    '  gap: 0.65rem;',
    '  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));',
    '  width: min(100%, 100%);',
    '}',
    '',
  ].join('\n');

  private readonly plainCssSignalNumberForm = [
    '/* Layout only; tng-input styling comes from the component. */',
    '',
    '.doc-cmp-input-ex-signal-number-form-preview {',
    '  display: grid;',
    '  gap: 0.75rem;',
    '  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));',
    '  width: min(100%, 40rem);',
    '}',
    '',
  ].join('\n');

  private readonly plainCssValidation = [
    '/*',
    ' * tng-input uses default invalid styling from tone/ariaInvalid;',
    ' * optional helper text styling below.',
    ' */',
    '',
    '.doc-cmp-input-ex-validation-preview.doc-cmp-input-ex-validation-stack {',
    '  display: grid;',
    '  gap: 0.5rem;',
    '  width: min(100%, 32rem);',
    '}',
    '',
    '.doc-cmp-input-ex-validation-helper--danger {',
    '  color: #dc2626;',
    '  font-size: 0.82rem;',
    '}',
    '',
  ].join('\n');

  private readonly plainCssNumber = [
    '/* Layout only; tng-input renders the number controls. */',
    '',
    '.doc-cmp-input-ex-number-preview {',
    '  display: grid;',
    '  gap: 0.65rem;',
    '  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));',
    '  width: min(100%, 40rem);',
    '}',
    '',
    '.doc-cmp-input-ex-number-hidden {',
    '  --tng-input-number-controls-display: none;',
    '}',
    '',
  ].join('\n');

  private readonly plainCssStates = [
    '/* Layout only; readonly/disabled visuals come from the component. */',
    '',
    '.doc-cmp-input-ex-states-preview.doc-cmp-input-ex-states-stack {',
    '  display: grid;',
    '  gap: 0.65rem;',
    '  width: min(100%, 32rem);',
    '}',
    '',
  ].join('\n');

  private readonly tailwindCssCode =
    '/* tng-input needs no CSS in this file; optional utilities belong on non-input wrappers only. */';

  protected readonly basicPlainCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-basic-plain',
    tsCode: this.tsBasic,
    htmlCode: [
      '<div class="doc-cmp-input-ex-basic-preview">',
      '  <tng-input',
      '    type="text"',
      '    placeholder="Project name"',
      '    ariaLabel="Project name"',
      '  ></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.plainCssBasic,
  });

  protected readonly basicTailwindCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-basic-tailwind',
    tsCode: this.tsBasic,
    htmlCode: [
      '<div class="doc-cmp-input-ex-basic-preview">',
      '  <tng-input',
      '    type="text"',
      '    placeholder="Project name"',
      '    ariaLabel="Project name"',
      '  ></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.tailwindCssCode,
  });

  protected readonly typePlainCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-types-plain',
    tsCode: this.tsTypes,
    htmlCode: [
      '<div class="doc-cmp-input-ex-types-preview doc-cmp-input-ex-types-grid">',
      '  <tng-input type="email" placeholder="team@tailng.dev" ariaLabel="Email" inputmode="email" autocomplete="email"></tng-input>',
      '  <tng-input type="search" placeholder="Search docs" ariaLabel="Search" inputmode="search" enterkeyhint="search"></tng-input>',
      '  <tng-input type="number" placeholder="42" ariaLabel="Number" [min]="0" [max]="100" [step]="1"></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.plainCssTypes,
  });

  protected readonly typeTailwindCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-types-tailwind',
    tsCode: this.tsTypes,
    htmlCode: [
      '<div class="doc-cmp-input-ex-types-preview doc-cmp-input-ex-types-grid">',
      '  <tng-input type="email" placeholder="team@tailng.dev" ariaLabel="Email" inputmode="email" autocomplete="email"></tng-input>',
      '  <tng-input type="search" placeholder="Search docs" ariaLabel="Search" inputmode="search" enterkeyhint="search"></tng-input>',
      '  <tng-input type="number" placeholder="42" ariaLabel="Number" [min]="0" [max]="100" [step]="1"></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.tailwindCssCode,
  });

  protected readonly signalNumberFormCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-signal-number-form',
    tsCode: this.tsSignalNumberForm,
    htmlCode: [
      '<div class="doc-cmp-input-ex-signal-number-form-preview">',
      '  <tng-input',
      '    type="number"',
      '    ariaLabel="Quantity"',
      '    [formField]="orderForm.quantity"',
      '  ></tng-input>',
      '',
      '  <tng-input',
      '    type="number"',
      '    ariaLabel="Unit price"',
      '    [formField]="orderForm.unitPrice"',
      '  ></tng-input>',
      '</div>',
      "<p>Quantity: {{ orderModel().quantity || '—' }} | Unit price: {{ orderModel().unitPrice || '—' }} | Total: {{ total() }}</p>",
      '',
    ].join('\n'),
    cssCode: this.plainCssSignalNumberForm,
  });

  protected readonly validationPlainCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-validation-plain',
    tsCode: this.tsValidation,
    htmlCode: [
      '<div class="doc-cmp-input-ex-validation-preview doc-cmp-input-ex-validation-stack">',
      '  <tng-input',
      '    tone="danger"',
      '    type="email"',
      '    value="team@tailng"',
      '    ariaDescribedBy="input-validation-helper"',
      '    ariaErrormessage="input-validation-helper"',
      '    [ariaInvalid]="true"',
      '  ></tng-input>',
      '  <p id="input-validation-helper" class="doc-cmp-input-ex-validation-helper doc-cmp-input-ex-validation-helper--danger">',
      '    Enter a valid email address in user@domain format.',
      '  </p>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.plainCssValidation,
  });

  protected readonly validationTailwindCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-validation-tailwind',
    tsCode: this.tsValidation,
    htmlCode: [
      '<div class="doc-cmp-input-ex-validation-preview doc-cmp-input-ex-validation-stack">',
      '  <tng-input',
      '    tone="danger"',
      '    type="email"',
      '    value="team@tailng"',
      '    ariaDescribedBy="input-validation-helper"',
      '    ariaErrormessage="input-validation-helper"',
      '    [ariaInvalid]="true"',
      '  ></tng-input>',
      '  <p id="input-validation-helper" class="doc-cmp-input-ex-validation-tw-helper text-xs font-medium text-red-600">Enter a valid email address in user@domain format.</p>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.tailwindCssCode,
  });

  protected readonly numberPlainCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-number-plain',
    tsCode: this.tsNumber,
    htmlCode: [
      '<div class="doc-cmp-input-ex-number-preview">',
      '  <tng-input',
      '    id="tax-group-rate"',
      '    type="number"',
      '    ariaLabel="Tax group rate"',
      '    [step]="0.5"',
      '    [min]="0"',
      '    [max]="100"',
      '    [value]="taxGroupRate()"',
      '    (valueChange)="taxGroupRate.set($event ?? \'\')"',
      '  ></tng-input>',
      '',
      '  <tng-input',
      '    class="doc-cmp-input-ex-number-hidden"',
      '    type="number"',
      '    ariaLabel="Tax group rate without controls"',
      '    value="8.5"',
      '    [step]="0.5"',
      '    [min]="0"',
      '    [max]="100"',
      '  ></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.plainCssNumber,
  });

  protected readonly numberTailwindCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-number-tailwind',
    tsCode: this.tsNumber,
    htmlCode: [
      '<div class="doc-cmp-input-ex-number-preview grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">',
      '  <tng-input',
      '    id="tax-group-rate"',
      '    type="number"',
      '    ariaLabel="Tax group rate"',
      '    [step]="0.5"',
      '    [min]="0"',
      '    [max]="100"',
      '    [value]="taxGroupRate()"',
      '    (valueChange)="taxGroupRate.set($event ?? \'\')"',
      '  ></tng-input>',
      '',
      '  <tng-input',
      '    class="doc-cmp-input-ex-number-hidden"',
      '    type="number"',
      '    ariaLabel="Tax group rate without controls"',
      '    value="8.5"',
      '    [step]="0.5"',
      '    [min]="0"',
      '    [max]="100"',
      '  ></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: [
      '.doc-cmp-input-ex-number-hidden {',
      '  --tng-input-number-controls-display: none;',
      '}',
      '',
    ].join('\n'),
  });

  protected readonly statesPlainCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-states-plain',
    tsCode: this.tsStates,
    htmlCode: [
      '<div class="doc-cmp-input-ex-states-preview doc-cmp-input-ex-states-stack">',
      '  <tng-input type="text" value="Readonly API key" readonly></tng-input>',
      '  <tng-input type="text" value="Disabled while syncing" disabled></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.plainCssStates,
  });

  protected readonly statesTailwindCodeTabs = createCodeTabs({
    baseName: 'doc-cmp-input-ex-states-tailwind',
    tsCode: this.tsStates,
    htmlCode: [
      '<div class="doc-cmp-input-ex-states-preview doc-cmp-input-ex-states-stack">',
      '  <tng-input type="text" value="Readonly API key" readonly></tng-input>',
      '  <tng-input type="text" value="Disabled while syncing" disabled></tng-input>',
      '</div>',
      '',
    ].join('\n'),
    cssCode: this.tailwindCssCode,
  });

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }

  protected focusProjectedInput(event: MouseEvent): void {
    const hostElement = event.currentTarget;
    if (!(hostElement instanceof HTMLElement)) {
      return;
    }

    const inputElement = hostElement.querySelector('[data-slot="input"]');
    if (!(inputElement instanceof HTMLInputElement) || inputElement.disabled) {
      return;
    }

    inputElement.focus({ preventScroll: true });
  }
}
