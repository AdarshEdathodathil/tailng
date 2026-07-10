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
  selector: 'app-icons-styling-page',
  imports: [
    TngCardComponent,
    TngCardHeaderComponent,
    TngCardTitleComponent,
    TngCardDescriptionComponent,
    TngCardContentComponent,
    TngCodeBlockComponent,
    TngIcon,
  ],
  templateUrl: './icons-styling-page.component.html',
})
export class IconsStylingPageComponent implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);

  public readonly codeBlockTheme = signal<'github-dark' | 'github-light'>(
    resolveDocsCodeBlockTheme(this.documentRef),
  );

  private readonly colorSchemeObserver = observeDocsCodeThemeChanges(
    this.documentRef,
    this.codeBlockTheme,
  );

  protected readonly sizeInputCode = `<tng-icon icon="home" size="1rem" />
<tng-icon icon="home" size="1.25rem" />
<tng-icon icon="home" [size]="24" />`;

  protected readonly cssVariableCode = `<tng-icon icon="home" class="nav-icon" />

.nav-icon {
  --tng-icon-size: 1.25rem;
}`;

  protected readonly colorInheritanceCode = `<button class="icon-button">
  <tng-icon icon="settings" />
</button>

.icon-button {
  color: var(--tng-fg-secondary);
}

.icon-button:hover {
  color: var(--tng-accent-brand);
}`;

  protected readonly accessibilityStylingCode = `<!-- Decorative icon: hidden from assistive tech -->
<tng-icon icon="chevron-right" />

<!-- Meaningful standalone icon: expose a label -->
<tng-icon icon="search" label="Search" />`;

  public ngOnDestroy(): void {
    this.colorSchemeObserver?.disconnect();
  }
}
