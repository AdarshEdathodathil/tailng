import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FExternalItemService } from '@foblex/flow';
import { describe, expect, it } from 'vitest';
import {
  TngFlowPaletteItemDirective,
  readTngFlowPaletteItemEnvelope,
} from './tng-flow-palette-item.directive';
import type { TngFlowPaletteItem, TngFlowPaletteItemActivation } from '../types/tng-flow.types';

type PaletteData = Readonly<{ model: string }>;

const paletteItem: TngFlowPaletteItem<PaletteData> = {
  id: 'reasoning-model',
  type: 'model',
  name: 'Reasoning model',
  data: { model: 'gpt' },
};

@Component({
  imports: [TngFlowPaletteItemDirective],
  template: `
    <button
      type="button"
      [tngFlowPaletteItem]="item()"
      [tngFlowPaletteItemDisabled]="disabled()"
      (tngFlowPaletteItemActivate)="activation.set($event)"
    >
      Add reasoning model
    </button>
  `,
})
class PaletteItemHost {
  public readonly item = signal(paletteItem);
  public readonly disabled = signal(false);
  public readonly activation = signal<TngFlowPaletteItemActivation<PaletteData> | null>(null);
}

function dispatchPointerEvent(
  target: EventTarget,
  type: 'pointercancel' | 'pointerdown' | 'pointermove' | 'pointerup',
  position: Readonly<{ x: number; y: number }>,
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    button: 0,
    clientX: position.x,
    clientY: position.y,
  });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: 1 },
  });
  target.dispatchEvent(event);
}

describe('TngFlowPaletteItemDirective', () => {
  it('registers a private typed external-item payload and emits activation', () => {
    const fixture = TestBed.createComponent(PaletteItemHost);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    const service = TestBed.inject(FExternalItemService);
    const externalItem = button === null ? undefined : service.getByHost(button);
    const envelope = readTngFlowPaletteItemEnvelope<PaletteData>(externalItem?.data());

    expect(button?.hasAttribute('fexternalitem')).toBe(true);
    expect(envelope?.item).toBe(paletteItem);

    button?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.activation()).toEqual({
      item: paletteItem,
      source: 'pointer',
    });
  });

  it('blocks disabled activation and unregisters on destroy', () => {
    const fixture = TestBed.createComponent(PaletteItemHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    const service = TestBed.inject(FExternalItemService);

    expect(button?.getAttribute('aria-disabled')).toBe('true');
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(fixture.componentInstance.activation()).toBeNull();

    fixture.destroy();
    expect(button === null ? undefined : service.getByHost(button)).toBeUndefined();
  });

  it('suppresses the click generated after a drag without blocking keyboard activation', () => {
    const fixture = TestBed.createComponent(PaletteItemHost);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button).not.toBeNull();
    if (button === null) {
      return;
    }

    dispatchPointerEvent(button, 'pointerdown', { x: 10, y: 10 });
    dispatchPointerEvent(button.ownerDocument, 'pointermove', { x: 30, y: 10 });
    dispatchPointerEvent(button.ownerDocument, 'pointerup', { x: 30, y: 10 });
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));

    expect(fixture.componentInstance.activation()).toBeNull();

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activation()?.source).toBe('keyboard');
  });
});
