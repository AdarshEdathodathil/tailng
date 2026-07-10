import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { createTngIconPack, provideTngIcons } from './icons';
import { TngIcon } from './tng-icon';

const testIconPack = createTngIconPack('test', {
  bell: async (): Promise<string> => '<svg viewBox="0 0 24 24"><path d="M12 2v2"></path></svg>',
});

function getByTestId<TElement extends HTMLElement>(
  fixture: { nativeElement: HTMLElement },
  testId: string,
): TElement {
  const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  expect(element).not.toBeNull();
  return element as TElement;
}

async function render<TComponent>(component: new (...args: never[]) => TComponent) {
  const fixture = TestBed.configureTestingModule({
    imports: [component],
    providers: [
      provideTngIcons({
        defaultPack: 'test',
        packs: [testIconPack],
      }),
    ],
  }).createComponent(component);

  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return fixture;
}

@Component({
  imports: [TngIcon],
  template: `<tng-icon data-testid="icon" icon="bell" size="24" />`,
})
class StaticSizeHostComponent {}

@Component({
  imports: [TngIcon],
  template: `<tng-icon data-testid="icon" icon="bell" [size]="size()" />`,
})
class DynamicSizeHostComponent {
  public readonly size = signal<string | number | null | undefined>('1.25rem');
}

@Component({
  imports: [TngIcon],
  template: `<tng-icon data-testid="icon" icon="missing" size="2rem" />`,
})
class FallbackSizeHostComponent {}

@Component({
  imports: [TngIcon],
  template: `
    <tng-icon data-testid="decorative" icon="bell" />
    <tng-icon data-testid="labelled" icon="bell" label="Search" />
  `,
})
class AccessibilityHostComponent {}

describe('tng-icon component', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('sets numeric string size values as pixel custom properties', async () => {
    const fixture = await render(StaticSizeHostComponent);
    const host = getByTestId<HTMLElement>(fixture, 'icon');
    const renderedIcon = host.querySelector('ng-icon');

    expect(host.style.getPropertyValue('--tng-icon-size')).toBe('24px');
    expect(renderedIcon?.getAttribute('size')).toBe('var(--tng-icon-size, 1em)');
  });

  it('updates and clears dynamic size values', async () => {
    const fixture = await render(DynamicSizeHostComponent);
    const host = getByTestId<HTMLElement>(fixture, 'icon');

    expect(host.style.getPropertyValue('--tng-icon-size')).toBe('1.25rem');

    fixture.componentInstance.size.set(32);
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--tng-icon-size')).toBe('32px');

    fixture.componentInstance.size.set(null);
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--tng-icon-size')).toBe('');
  });

  it('uses the same custom property for the fallback icon', async () => {
    const fixture = await render(FallbackSizeHostComponent);
    const host = getByTestId<HTMLElement>(fixture, 'icon');
    const fallback = host.querySelector<HTMLElement>('.tng-icon__fallback');

    expect(host.style.getPropertyValue('--tng-icon-size')).toBe('2rem');
    expect(fallback).not.toBeNull();
    expect(fallback?.classList.contains('tng-icon__fallback')).toBe(true);
    expect(host.querySelector('ng-icon')).toBeNull();
  });

  it('keeps decorative and labelled accessibility attributes unchanged', async () => {
    const fixture = await render(AccessibilityHostComponent);
    const decorativeIcon = getByTestId<HTMLElement>(fixture, 'decorative').querySelector('ng-icon');
    const labelledIcon = getByTestId<HTMLElement>(fixture, 'labelled').querySelector('ng-icon');

    expect(decorativeIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(decorativeIcon?.getAttribute('aria-label')).toBeNull();
    expect(labelledIcon?.getAttribute('aria-hidden')).toBeNull();
    expect(labelledIcon?.getAttribute('aria-label')).toBe('Search');
    expect(labelledIcon?.getAttribute('role')).toBe('img');
  });
});
