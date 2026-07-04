import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { DocsComponentSectionTabsComponent } from '../../../../shared/component-section-tabs/docs-component-section-tabs.component';
import {
  getDocsComponentSectionOutlineAriaLabel,
  getDocsComponentSectionOutlineItems,
  getDocsComponentSectionOutlineTitle,
} from '../../../../shared/section-outline/component-section-outline.data';
import { DocsComponentSectionOutlineComponent } from '../../../../shared/section-outline/docs-component-section-outline.component';
type Section = 'overview' | 'api' | 'styling' | 'examples';
@Component({
  selector: 'app-confetti-page',
  imports: [RouterOutlet, DocsComponentSectionTabsComponent, DocsComponentSectionOutlineComponent],
  templateUrl: './confetti-page.component.html',
})
export class ConfettiPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  private readonly item = this.route.snapshot.data['item'] as
    | { slug?: string; title?: string }
    | undefined;
  public readonly activeSection = computed<Section>(() => {
    const value = this.url().split(/[?#]/)[0].split('/').filter(Boolean)[3];
    return value === 'api' || value === 'styling' || value === 'examples' ? value : 'overview';
  });
  public readonly outlineItems = computed(() =>
    getDocsComponentSectionOutlineItems(this.item?.slug ?? 'confetti', this.activeSection()),
  );
  public readonly outlineTitle = computed(() => getDocsComponentSectionOutlineTitle(this.activeSection()));
  public readonly outlineAriaLabel = computed(() =>
    getDocsComponentSectionOutlineAriaLabel(this.item?.title ?? 'Confetti', this.activeSection()),
  );
}
