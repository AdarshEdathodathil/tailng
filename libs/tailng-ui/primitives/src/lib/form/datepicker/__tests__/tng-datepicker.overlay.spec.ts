import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDatepickerController } from '../tng-datepicker';
import { TngDatepickerOverlay } from '../tng-datepicker.overlay';

function createRect(top: number, bottom: number, width = 240): DOMRect {
  return {
    x: 0,
    y: top,
    width,
    height: bottom - top,
    top,
    right: width,
    bottom,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

async function settle(fixture: {
  detectChanges(): void;
  whenStable(): Promise<unknown>;
}): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

async function waitForAnimationFrame(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function getRequired<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector(selector) as T | null;
  if (element === null) {
    throw new Error(`Expected selector ${selector} to exist.`);
  }

  return element;
}

@Component({
  imports: [TngDatepickerOverlay],
  template: `
    <div
      #anchor
      data-slot="datepicker-input-shell"
      data-testid="anchor"
      style="
        width: 240px;
        min-height: 52px;
        --tng-datepicker-nav-size: 2.8rem;
        --tng-datepicker-surface: #f8fafc;
        --tng-datepicker-border: #d8e2ef;
        --tng-datepicker-fg: #0f172a;
        --tng-datepicker-brand: #2563eb;
        --tng-semantic-background-surface: #f8fafc;
        --tng-semantic-border-subtle: #d8e2ef;
        --tng-semantic-foreground-primary: #0f172a;
        --tng-semantic-accent-brand: #2563eb;
        color-scheme: light;
      "
    >
      <button
        #trigger
        type="button"
        data-slot="datepicker-trigger"
        data-testid="trigger"
        (click)="controller.open()"
      >
        Open
      </button>
    </div>

    <section
      [tngDatepickerOverlay]="controller"
      [tngDatepickerOverlayAnchor]="anchor"
      data-testid="overlay"
      style="display: block; min-height: 320px;"
    >
      Overlay
    </section>
  `,
})
class DatepickerOverlayHostComponent implements AfterViewInit {
  @ViewChild('trigger', { static: true })
  private readonly trigger!: ElementRef<HTMLElement>;

  public readonly controller = createDatepickerController<Date>({
    ownerDocument: document,
    trapFocus: true,
    value: '2024-04-22',
  });

  public ngAfterViewInit(): void {
    this.controller.registerTrigger(this.trigger.nativeElement);
  }
}

@Component({
  imports: [TngDatepickerOverlay],
  template: `
    <div data-testid="scroll-parent" style="overflow: auto; max-height: 120px;">
      <div
        #anchor
        data-slot="datepicker-input-shell"
        data-testid="scroll-anchor"
        style="width: 240px; min-height: 52px;"
      >
        <button
          #trigger
          type="button"
          data-slot="datepicker-trigger"
          data-testid="scroll-trigger"
          (click)="controller.open()"
        >
          Open
        </button>
      </div>

      <section
        [tngDatepickerOverlay]="controller"
        [tngDatepickerOverlayAnchor]="anchor"
        data-testid="scroll-overlay"
        style="display: block; min-height: 320px;"
      >
        Overlay
      </section>
    </div>
  `,
})
class DatepickerOverlayScrollableHostComponent implements AfterViewInit {
  @ViewChild('trigger', { static: true })
  private readonly trigger!: ElementRef<HTMLElement>;

  public readonly controller = createDatepickerController<Date>({
    ownerDocument: document,
    trapFocus: true,
    value: '2024-04-22',
  });

  public ngAfterViewInit(): void {
    this.controller.registerTrigger(this.trigger.nativeElement);
  }
}

describe('tng-datepicker.overlay', () => {
  afterEach(() => {
    document.body
      .querySelectorAll('[data-testid="overlay"], [data-testid="scroll-overlay"]')
      .forEach((element) => element.remove());
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('mounts the overlay into document.body while open and restores it when closed', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [DatepickerOverlayHostComponent],
    }).createComponent(DatepickerOverlayHostComponent);

    await settle(fixture);

    const trigger = getRequired<HTMLButtonElement>(
      fixture.nativeElement,
      '[data-testid="trigger"]',
    );
    const overlay = getRequired<HTMLElement>(fixture.nativeElement, '[data-testid="overlay"]');

    expect(overlay.getAttribute('hidden')).toBe('');

    trigger.click();
    await settle(fixture);

    const mountedOverlay = getRequired<HTMLElement>(document.body, '[data-testid="overlay"]');
    expect(mountedOverlay.parentNode).toBe(document.body);
    expect(mountedOverlay.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');
    expect(mountedOverlay.style.zIndex).toBe(
      'var(--tng-datepicker-z-overlay, var(--tng-z-overlay, 1000))',
    );
    expect(mountedOverlay.getAttribute('hidden')).toBeNull();
    expect(mountedOverlay.style.getPropertyValue('--tng-datepicker-surface').trim()).toBe(
      '#f8fafc',
    );
    expect(mountedOverlay.style.getPropertyValue('--tng-datepicker-border').trim()).toBe('#d8e2ef');
    expect(mountedOverlay.style.getPropertyValue('--tng-datepicker-fg').trim()).toBe('#0f172a');
    expect(mountedOverlay.style.getPropertyValue('--tng-datepicker-brand').trim()).toBe('#2563eb');
    expect(mountedOverlay.style.getPropertyValue('--tng-datepicker-nav-size').trim()).toBe(
      '2.8rem',
    );
    expect(mountedOverlay.style.colorScheme).toBe('light');

    fixture.componentInstance.controller.close();
    await settle(fixture);

    expect(overlay.parentNode).toBe(fixture.nativeElement);
    expect(overlay.getAttribute('hidden')).toBe('');
    expect(overlay.style.getPropertyValue('--tng-datepicker-surface').trim()).toBe('');
    expect(overlay.style.getPropertyValue('--tng-datepicker-border').trim()).toBe('');
    expect(overlay.style.getPropertyValue('--tng-datepicker-nav-size').trim()).toBe('');
    expect(overlay.style.zIndex).toBe('');
    expect(overlay.style.colorScheme).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('flips the overlay above the anchor when there is more available space above', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [DatepickerOverlayHostComponent],
    }).createComponent(DatepickerOverlayHostComponent);

    await settle(fixture);

    const trigger = getRequired<HTMLButtonElement>(
      fixture.nativeElement,
      '[data-testid="trigger"]',
    );
    const anchor = getRequired<HTMLElement>(fixture.nativeElement, '[data-testid="anchor"]');
    const originalInnerHeight = window.innerHeight;

    trigger.click();
    await settle(fixture);

    const overlay = getRequired<HTMLElement>(document.body, '[data-testid="overlay"]');
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue(createRect(700, 740));
    vi.spyOn(overlay, 'getBoundingClientRect').mockReturnValue(createRect(0, 320));
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 760 });

    window.dispatchEvent(new Event('resize'));
    await waitForAnimationFrame();
    await settle(fixture);

    expect(overlay.getAttribute('data-placement')).toBe('top');
    expect(overlay.style.maxHeight).not.toBe('');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('locks page scroll and does not reposition from scroll events while open', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [DatepickerOverlayHostComponent],
    }).createComponent(DatepickerOverlayHostComponent);

    await settle(fixture);

    const trigger = getRequired<HTMLButtonElement>(
      fixture.nativeElement,
      '[data-testid="trigger"]',
    );
    trigger.click();
    await settle(fixture);

    const overlay = getRequired<HTMLElement>(document.body, '[data-testid="overlay"]');
    const overlayTop = overlay.style.top;
    const overlayRectSpy = vi.spyOn(overlay, 'getBoundingClientRect');

    expect(document.body.style.overflow).toBe('hidden');

    window.dispatchEvent(new Event('scroll'));
    await waitForAnimationFrame();
    await settle(fixture);

    expect(fixture.componentInstance.controller.getOutputs().open).toBe(true);
    expect(overlay.parentNode).toBe(document.body);
    expect(overlay.getAttribute('hidden')).toBeNull();
    expect(overlay.style.top).toBe(overlayTop);
    expect(overlayRectSpy).not.toHaveBeenCalled();
  });

  it('locks scrollable ancestors while open and restores them on close', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [DatepickerOverlayScrollableHostComponent],
    }).createComponent(DatepickerOverlayScrollableHostComponent);

    await settle(fixture);

    const trigger = getRequired<HTMLButtonElement>(
      fixture.nativeElement,
      '[data-testid="scroll-trigger"]',
    );
    const scrollParent = getRequired<HTMLElement>(
      fixture.nativeElement,
      '[data-testid="scroll-parent"]',
    );

    expect(scrollParent.style.overflow).toBe('auto');

    trigger.click();
    await settle(fixture);

    expect(document.body.style.overflow).toBe('hidden');
    expect(scrollParent.style.overflow).toBe('hidden');

    fixture.componentInstance.controller.close();
    await settle(fixture);

    expect(document.body.style.overflow).toBe('');
    expect(scrollParent.style.overflow).toBe('auto');
  });
});
