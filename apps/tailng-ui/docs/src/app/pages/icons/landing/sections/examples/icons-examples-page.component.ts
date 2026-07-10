import { DOCUMENT } from '@angular/common';
import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  TngCardComponent,
  TngCardContentComponent,
  TngCardDescriptionComponent,
  TngCardHeaderComponent,
  TngCardTitleComponent,
  TngCodeBlockComponent,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { observeDocsCodeThemeChanges, resolveDocsCodeBlockTheme } from '../../../../../shared/util';

@Component({
  selector: 'app-icons-examples-page',
  imports: [
    TngCardComponent,
    TngCardHeaderComponent,
    TngCardTitleComponent,
    TngCardDescriptionComponent,
    TngCardContentComponent,
    TngCodeBlockComponent,
    TngIcon,
  ],
  templateUrl: './icons-examples-page.component.html',
  styleUrl: './icons-examples-page.component.css',
})
export class IconsExamplesPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );

  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly accessibilityCode = `<!-- Decorative icon: aria-hidden by default -->
<tng-icon icon="home" />

<!-- Labelled standalone icon: role="img" with aria-label -->
<tng-icon icon="search" label="Search" />`;

  protected readonly sizeExamplesCode = `<tng-icon icon="bell" size="1rem" />
<tng-icon icon="bell" size="1.25rem" />
<tng-icon icon="bell" [size]="24" />`;

  protected readonly cssVariableExampleCode = `<tng-icon icon="settings" class="settings-icon" />

.settings-icon {
  --tng-icon-size: 1.5rem;
}`;

  protected readonly packReferenceCode = `<!-- Uses the configured default pack, lucide by default -->
<tng-icon icon="home" />

<!-- Uses an explicit pack prefix -->
<tng-icon icon="lucide:home" />`;

  protected readonly customPackCode = `import { createTngIconPack, provideTngIcons } from '@tailng-ui/icons';

const brandPack = createTngIconPack('brand', {
  logo: async () =>
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2Z"/></svg>',
});

export const appConfig = {
  providers: [
    provideTngIcons({
      packs: [brandPack],
    }),
  ],
};

// Later in a template:
// <tng-icon icon="brand:logo" label="Brand" size="1.5rem" />`;

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
