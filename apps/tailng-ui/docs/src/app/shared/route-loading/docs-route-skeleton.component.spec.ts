import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DocsRouteSkeletonComponent } from './docs-route-skeleton.component';

@Component({
  selector: 'tng-skeleton',
  standalone: true,
  template: '<span class="stub-skeleton" [style.width]="width" [style.height]="height"></span>',
})
class StubSkeletonComponent {
  @Input() public width = '100%';
  @Input() public height = '1rem';
}

describe('DocsRouteSkeletonComponent', () => {
  it('renders animated page-shaped placeholder blocks with loading status text', async () => {
    TestBed.configureTestingModule({
      imports: [DocsRouteSkeletonComponent],
    });
    TestBed.overrideComponent(DocsRouteSkeletonComponent, {
      set: {
        imports: [StubSkeletonComponent],
      },
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(DocsRouteSkeletonComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector('[role="status"]');
    const blocks = element.querySelectorAll('.stub-skeleton');

    expect(status?.getAttribute('aria-label')).toBe('Loading page');
    expect(blocks.length).toBeGreaterThan(8);
  });
});

