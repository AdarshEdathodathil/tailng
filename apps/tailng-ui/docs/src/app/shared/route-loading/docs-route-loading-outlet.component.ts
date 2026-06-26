import { Component, computed, inject, input } from '@angular/core';
import { DocsRouteLoadingService } from './docs-route-loading.service';
import { DocsRouteSkeletonComponent } from './docs-route-skeleton.component';

@Component({
  selector: 'app-docs-route-loading-outlet',
  imports: [DocsRouteSkeletonComponent],
  templateUrl: './docs-route-loading-outlet.component.html',
  styleUrl: './docs-route-loading-outlet.component.css',
})
export class DocsRouteLoadingOutletComponent {
  private readonly routeLoading = inject(DocsRouteLoadingService);

  public readonly active = input<boolean>(true);
  protected readonly loading = computed(() => this.active() && this.routeLoading.isLoading());
}

