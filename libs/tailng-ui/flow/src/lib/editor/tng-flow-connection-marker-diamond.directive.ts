import { DOCUMENT } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Internal marker adapter. It keeps the renderer-supported marker host while
 * replacing its circle glyph with a TailNG diamond glyph.
 */
@Directive({
  selector: 'f-connection-marker-circle[tngFlowConnectionMarkerDiamond]',
  host: {
    class: 'tng-flow-editor__connection-marker-diamond',
  },
})
export class TngFlowConnectionMarkerDiamondDirective implements AfterViewInit {
  private readonly documentRef = inject(DOCUMENT);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  public ngAfterViewInit(): void {
    const marker = this.hostElement.nativeElement.querySelector<SVGSVGElement>('svg.f-marker');
    if (marker === null) {
      return;
    }
    const diamond = this.documentRef.createElementNS('http://www.w3.org/2000/svg', 'path');
    diamond.setAttribute('d', 'M 1 5 L 5 1 L 9 5 L 5 9 Z');
    marker.replaceChildren(diamond);
    marker.classList.add('tng-flow-editor__connection-marker');
  }
}
