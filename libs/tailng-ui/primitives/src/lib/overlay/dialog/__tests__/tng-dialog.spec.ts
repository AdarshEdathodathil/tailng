import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  TngDialog,
  TngDialogActions,
  TngDialogBackdrop,
  TngDialogClose,
  TngDialogContent,
  TngDialogDescription,
  TngDialogPanel,
  TngDialogTitle,
  TngDialogTrigger,
  type TngDialogAutoFocus,
  type TngDialogCloseReason,
} from '../tng-dialog';

function getByTestId<T extends Element>(fixture: { nativeElement: HTMLElement }, testId: string): T {
  const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
  if (element === null) {
    throw new Error(`Expected element [data-testid="${testId}"] to exist.`);
  }

  return element;
}

function keydown(target: EventTarget, key: string, init: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    shiftKey: init.shiftKey ?? false,
  });
  target.dispatchEvent(event);
  return event;
}

function pointerdown(target: EventTarget): PointerEvent {
  const event = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  target.dispatchEvent(event);
  return event;
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

@Component({
  imports: [
    TngDialog,
    TngDialogBackdrop,
    TngDialogPanel,
    TngDialogTrigger,
    TngDialogTitle,
    TngDialogDescription,
    TngDialogActions,
    TngDialogClose,
    TngDialogContent,
  ],
  template: `
    <button type="button" data-testid="before">Before</button>

    <section
      tngDialog
      #dialog="tngDialog"
      data-testid="root"
      [defaultOpen]="defaultOpen()"
      [disabled]="disabled()"
      [dismissible]="dismissible()"
      [closeOnEscape]="closeOnEscape()"
      [closeOnBackdropClick]="closeOnBackdropClick()"
      [restoreFocus]="restoreFocus()"
      [autoFocus]="autoFocus()"
      [trapFocus]="trapFocus()"
      [ariaLabel]="ariaLabel()"
      [ariaLabelledby]="ariaLabelledby()"
      [ariaDescribedby]="ariaDescribedby()"
      (openChange)="openChanges.push($event)"
      (closed)="closeReasons.push($event)"
    >
      <div tngDialogBackdrop data-testid="backdrop">
        <section tngDialogPanel data-testid="panel">
          <h2 tngDialogTitle data-testid="title">Dialog title</h2>
          <p tngDialogDescription data-testid="description">Dialog description</p>

          <div tngDialogContent data-testid="content">
            <button type="button" data-testid="inside-first" data-tng-dialog-initial-focus>
              First action
            </button>
            <button type="button" data-testid="inside-last">Last action</button>
          </div>

          <div tngDialogActions>
            <button type="button" tngDialogClose data-testid="close">Close</button>
          </div>
        </section>
      </div>
    </section>

    <button type="button" [tngDialogTrigger]="dialog" data-testid="trigger">Open</button>
    <button type="button" data-testid="after">After</button>
  `,
})
class UncontrolledDialogHarnessComponent {
  readonly defaultOpen = signal(false);
  readonly disabled = signal(false);
  readonly dismissible = signal(true);
  readonly closeOnEscape = signal(true);
  readonly closeOnBackdropClick = signal(true);
  readonly restoreFocus = signal(true);
  readonly autoFocus = signal<TngDialogAutoFocus>('first-focusable');
  readonly trapFocus = signal(true);
  readonly ariaLabel = signal<string | null>(null);
  readonly ariaLabelledby = signal<string | null>(null);
  readonly ariaDescribedby = signal<string | null>(null);

  readonly openChanges: boolean[] = [];
  readonly closeReasons: TngDialogCloseReason[] = [];
}

@Component({
  imports: [TngDialog, TngDialogBackdrop, TngDialogPanel, TngDialogClose],
  template: `
    <section
      tngDialog
      data-testid="root"
      [open]="open()"
      (openChange)="openChanges.push($event)"
      (closed)="closeReasons.push($event)"
    >
      <div tngDialogBackdrop data-testid="backdrop">
        <section tngDialogPanel data-testid="panel">
          <button type="button" tngDialogClose data-testid="close">Close</button>
        </section>
      </div>
    </section>
  `,
})
class ControlledDialogHarnessComponent {
  readonly open = signal(true);
  readonly openChanges: boolean[] = [];
  readonly closeReasons: TngDialogCloseReason[] = [];
}

describe('tng-dialog primitive behavior', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders closed by default and exposes data-state hooks', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);

    await settle(fixture);

    const root = getByTestId<HTMLElement>(fixture, 'root');
    const backdrop = getByTestId<HTMLElement>(fixture, 'backdrop');
    const panel = getByTestId<HTMLElement>(fixture, 'panel');

    expect(root.getAttribute('data-open')).toBe('false');
    expect(root.getAttribute('data-state')).toBe('closed');
    expect(backdrop.getAttribute('hidden')).toBe('');
    expect(panel.getAttribute('hidden')).toBe('');
    expect(panel.getAttribute('data-slot')).toBe('dialog-panel');
  });

  it('exposes data-slot="dialog-content" on tngDialogContent', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    const content = getByTestId<HTMLElement>(fixture, 'content');
    expect(content.getAttribute('data-slot')).toBe('dialog-content');
    expect(content.contains(getByTestId<HTMLElement>(fixture, 'inside-first'))).toBe(true);
    expect(content.contains(getByTestId<HTMLElement>(fixture, 'inside-last'))).toBe(true);
  });

  it('supports defaultOpen and wires dialog accessibility attributes', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    const panel = getByTestId<HTMLElement>(fixture, 'panel');
    const title = getByTestId<HTMLElement>(fixture, 'title');
    const description = getByTestId<HTMLElement>(fixture, 'description');

    expect(panel.getAttribute('hidden')).toBeNull();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-labelledby')).toBe(title.id);
    expect(panel.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('trigger opens uncontrolled dialog and auto-focuses initial element', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);

    await settle(fixture);

    const trigger = getByTestId<HTMLButtonElement>(fixture, 'trigger');
    trigger.focus();
    trigger.click();

    await settle(fixture);

    const host = fixture.componentInstance;
    const panel = getByTestId<HTMLElement>(fixture, 'panel');
    const first = getByTestId<HTMLButtonElement>(fixture, 'inside-first');

    expect(host.openChanges).toEqual([true]);
    expect(panel.getAttribute('hidden')).toBeNull();
    expect(document.activeElement).toBe(first);
  });

  it('close button closes with close-button reason', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    getByTestId<HTMLButtonElement>(fixture, 'close').click();
    await settle(fixture);

    const host = fixture.componentInstance;
    const panel = getByTestId<HTMLElement>(fixture, 'panel');

    expect(host.closeReasons).toEqual(['close-button']);
    expect(host.openChanges).toContain(false);
    expect(panel.getAttribute('hidden')).toBe('');
  });

  it('backdrop pointerdown closes with backdrop reason', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    const backdrop = getByTestId<HTMLElement>(fixture, 'backdrop');
    pointerdown(backdrop);
    await settle(fixture);

    expect(fixture.componentInstance.closeReasons).toEqual(['backdrop']);
  });

  it('Escape closes when enabled and restores focus to trigger', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);

    await settle(fixture);

    const trigger = getByTestId<HTMLButtonElement>(fixture, 'trigger');
    trigger.focus();
    trigger.click();
    await settle(fixture);

    const event = keydown(document, 'Escape');
    await settle(fixture);

    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.closeReasons).toEqual(['escape']);
    expect(document.activeElement).toBe(trigger);
  });

  it('does not close on Escape when closeOnEscape is false', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);

    fixture.componentInstance.defaultOpen.set(true);
    fixture.componentInstance.closeOnEscape.set(false);
    await settle(fixture);

    keydown(document, 'Escape');
    await settle(fixture);

    const panel = getByTestId<HTMLElement>(fixture, 'panel');
    expect(fixture.componentInstance.closeReasons).toEqual([]);
    expect(panel.getAttribute('hidden')).toBeNull();
  });

  it('traps Tab focus inside the panel when open', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    const first = getByTestId<HTMLButtonElement>(fixture, 'inside-first');
    const close = getByTestId<HTMLButtonElement>(fixture, 'close');

    close.focus();
    const tabForward = keydown(close, 'Tab');
    await settle(fixture);
    expect(tabForward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);

    first.focus();
    const tabBackward = keydown(first, 'Tab', { shiftKey: true });
    await settle(fixture);
    expect(tabBackward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
  });

  it('isolates nested background content while open', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    const before = getByTestId<HTMLButtonElement>(fixture, 'before');
    const root = getByTestId<HTMLElement>(fixture, 'root');
    const after = getByTestId<HTMLButtonElement>(fixture, 'after');
    const panel = getByTestId<HTMLElement>(fixture, 'panel');

    expect(root.getAttribute('aria-hidden')).toBeNull();
    expect(panel.getAttribute('aria-hidden')).toBeNull();
    expect(before.getAttribute('aria-hidden')).toBe('true');
    expect(before.getAttribute('inert')).toBe('');
    expect(after.getAttribute('aria-hidden')).toBe('true');
    expect(after.getAttribute('inert')).toBe('');

    getByTestId<HTMLButtonElement>(fixture, 'close').click();
    await settle(fixture);

    expect(before.getAttribute('aria-hidden')).toBeNull();
    expect(before.getAttribute('inert')).toBeNull();
    expect(after.getAttribute('aria-hidden')).toBeNull();
    expect(after.getAttribute('inert')).toBeNull();
  });

  it('redirects document Tab back into the dialog when focus escapes to background content', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.defaultOpen.set(true);

    await settle(fixture);

    const before = getByTestId<HTMLButtonElement>(fixture, 'before');
    const first = getByTestId<HTMLButtonElement>(fixture, 'inside-first');
    const after = getByTestId<HTMLButtonElement>(fixture, 'after');
    const close = getByTestId<HTMLButtonElement>(fixture, 'close');

    before.focus();
    const tabForward = keydown(document, 'Tab');
    await settle(fixture);
    expect(tabForward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);

    after.focus();
    const tabBackward = keydown(document, 'Tab', { shiftKey: true });
    await settle(fixture);
    expect(tabBackward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
  });

  it('disabled prevents opening via trigger', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [UncontrolledDialogHarnessComponent],
    }).createComponent(UncontrolledDialogHarnessComponent);
    fixture.componentInstance.disabled.set(true);

    await settle(fixture);

    getByTestId<HTMLButtonElement>(fixture, 'trigger').click();
    await settle(fixture);

    const panel = getByTestId<HTMLElement>(fixture, 'panel');
    expect(panel.getAttribute('hidden')).toBe('');
    expect(fixture.componentInstance.openChanges).toEqual([]);
  });

  it('controlled mode emits openChange/closed without mutating host state', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ControlledDialogHarnessComponent],
    }).createComponent(ControlledDialogHarnessComponent);

    await settle(fixture);

    getByTestId<HTMLButtonElement>(fixture, 'close').click();
    await settle(fixture);

    const host = fixture.componentInstance;
    const panel = getByTestId<HTMLElement>(fixture, 'panel');

    expect(host.closeReasons).toEqual(['close-button']);
    expect(host.openChanges).toEqual([false]);
    expect(host.open()).toBe(true);
    expect(panel.getAttribute('hidden')).toBeNull();
  });
});
