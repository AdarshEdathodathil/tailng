import { Component, HostBinding, ViewChild, input, model, output, signal } from '@angular/core';
import { booleanAttribute } from '@angular/core';
import type { ElementRef, InputSignalWithTransform } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

import {
  coerceTngInputNullableBoolean,
  TngInput,
  TngInputFieldSuffix,
  type TngInputType,
} from '@tailng-ui/primitives';

import {
  TngInputFieldComponent,
  type TngInputFieldAppearance,
  type TngInputFieldSize,
  type TngInputFieldTone,
} from '../input-field/tng-input-field.component';

type NullableBooleanInput = boolean | null | string | undefined;
type NumberTextMode = 'complete' | 'partial';
type NumberRange = { readonly end: number; readonly start: number };

type ClipboardDataLike = {
  getData: (type: string) => string;
};

function normalizeAttr(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')
    return null;

  const v = String(value).trim();
  return v.length > 0 ? v : null;
}

function readInputElement(event: unknown): HTMLInputElement | null {
  if (!(event instanceof Event)) return null;
  const target = event.target;
  return target instanceof HTMLInputElement ? target : null;
}

function readInputValue(event: unknown): string | null {
  return readInputElement(event)?.value ?? null;
}

function normalizeNumberAttr(value: number | string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalNumberInput(
  value: number | string | null | undefined,
): number | string | null {
  return value ?? null;
}

function normalizePatternInput(value: unknown): readonly RegExp[] {
  if (value === undefined || value === null) return [];

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? [new RegExp(normalized)] : [];
  }

  if (value instanceof RegExp) return [value];

  if (Array.isArray(value) && value.every((item: unknown) => item instanceof RegExp)) {
    return value as readonly RegExp[];
  }

  return [];
}

function formatPatternAttr(patterns: readonly Readonly<RegExp>[]): string | null {
  return patterns[0]?.source ?? null;
}

function formatNullableBooleanAttr(value: boolean | null): 'false' | 'true' | null {
  if (value === null) return null;
  return value ? 'true' : 'false';
}

function readFiniteNumber(value: number | string | null | undefined): number | null {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatNumberValue(value: number): string {
  return Number.parseFloat(value.toPrecision(12)).toString();
}

function isDigit(value: string): boolean {
  return value >= '0' && value <= '9';
}

function extractNumberChars(value: string): { sanitized: string; hasDigit: boolean } {
  let sanitized = '';
  let hasDecimal = false;
  let hasDigit = false;
  let hasMinus = false;

  for (const char of value) {
    if (isDigit(char)) {
      sanitized += char;
      hasDigit = true;
      continue;
    }

    if (char === '-' && !hasMinus && sanitized.length === 0) {
      sanitized += char;
      hasMinus = true;
      continue;
    }

    if (char === '.' && !hasDecimal) {
      sanitized += char;
      hasDecimal = true;
    }
  }

  return { sanitized, hasDigit };
}

function sanitizeNumberText(value: string, mode: NumberTextMode): string {
  const { sanitized, hasDigit } = extractNumberChars(value);
  if (mode === 'partial') return sanitized;
  return formatCompleteNumberText(sanitized, hasDigit);
}

function formatCompleteNumberText(sanitized: string, hasDigit: boolean): string {
  if (!hasDigit) return '';

  let result = sanitized;
  if (result.startsWith('-.')) {
    result = `-0.${result.slice(2)}`;
  } else if (result.startsWith('.')) {
    result = `0${result}`;
  }

  if (result.endsWith('.')) {
    result = result.slice(0, -1);
  }

  return result === '-' ? '' : result;
}

function isValidPartialNumberText(value: string): boolean {
  return sanitizeNumberText(value, 'partial') === value;
}

function createInputEvent(inputElement: Readonly<HTMLInputElement>): Event {
  const event = new Event('input', { bubbles: true });
  Object.defineProperty(event, 'target', {
    configurable: true,
    value: inputElement,
  });
  return event;
}

function readBeforeInputText(event: Readonly<Event>): string | null {
  const data = (event as Readonly<Event> & { data?: unknown }).data;
  return typeof data === 'string' ? data : null;
}

function readClipboardText(event: Readonly<Event>): string | null {
  const clipboardData = (event as Readonly<Event> & { clipboardData?: unknown }).clipboardData;
  if (
    clipboardData === null ||
    typeof clipboardData !== 'object' ||
    !('getData' in clipboardData) ||
    typeof (clipboardData as ClipboardDataLike).getData !== 'function'
  ) {
    return null;
  }

  const textPlain = (clipboardData as ClipboardDataLike).getData('text/plain');
  return textPlain.length > 0 ? textPlain : (clipboardData as ClipboardDataLike).getData('text');
}

function clampSelectionIndex(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function clampSelectionRange(range: Readonly<NumberRange>, max: number): NumberRange {
  return {
    start: clampSelectionIndex(range.start, max),
    end: clampSelectionIndex(range.end, max),
  };
}

function readSelectionRange(
  inputElement: Readonly<HTMLInputElement>,
  fallbackRange: Readonly<NumberRange> | null = null,): NumberRange {
  const fallback = inputElement.value.length;

  try {
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    if (typeof start === 'number' && typeof end === 'number') {
      return {
        start: clampSelectionIndex(start, fallback),
        end: clampSelectionIndex(end, fallback),
      };
    }
  } catch {
    // Native number inputs do not expose text selection APIs in every browser.
  }

  if (fallbackRange !== null) {
    return {
      start: clampSelectionIndex(fallbackRange.start, fallback),
      end: clampSelectionIndex(fallbackRange.end, fallback),
    };
  }

  return { start: fallback, end: fallback };
}

function replaceNumberTextRange(
  currentValue: string,
  insertion: string,
  range: Readonly<NumberRange>,
): string {
  const start = Math.min(range.start, range.end);
  const end = Math.max(range.start, range.end);
  return `${currentValue.slice(0, start)}${insertion}${currentValue.slice(end)}`;
}

function restoreCaret(inputElement: Readonly<HTMLInputElement>, index: number): void {
  try {
    inputElement.setSelectionRange(index, index);
  } catch {
    // Native number inputs may reject setSelectionRange.
  }
}

function isSelectAllShortcut(event: Readonly<KeyboardEvent>): boolean {
  return event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey) && !event.altKey;
}

function isClipboardShortcut(event: Readonly<KeyboardEvent>): boolean {
  const key = event.key.toLowerCase();
  return (
    (event.ctrlKey || event.metaKey) && !event.altKey && (key === 'c' || key === 'v' || key === 'x')
  );
}

@Component({
  selector: 'tng-input',
  standalone: true,
  imports: [TngInputFieldComponent, TngInput, TngInputFieldSuffix],
  templateUrl: './tng-input.component.html',
  styleUrl: './tng-input.component.css',
})
export class TngInputComponent implements FormValueControl<string | null> {
  // ---- Wrapper (input-field) appearance knobs ----
  public readonly appearance = input<TngInputFieldAppearance>('outline');
  public readonly size = input<TngInputFieldSize>('md');
  public readonly tone = input<TngInputFieldTone>('neutral');
  public readonly fullWidth = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  // ---- Input API passthrough ----
  public readonly ariaDescribedBy = input<string | null>(null);
  public readonly ariaInvalid = input<boolean | null, NullableBooleanInput>(null, {
    transform: coerceTngInputNullableBoolean,
  });
  public readonly ariaLabel = input<string | null>(null);
  public readonly ariaLabelledby = input<string | null>(null);
  public readonly ariaErrormessage = input<string | null>(null);
  public readonly ariaRequired = input<boolean | null, NullableBooleanInput>(null, {
    transform: coerceTngInputNullableBoolean,
  });

  public readonly autocapitalize = input<string | null>(null);
  public readonly autocomplete = input<string | null>(null);
  public readonly disabled = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  public readonly enterkeyhint = input<string | null>(null);
  public readonly formAttr = input<string | null>(null, { alias: 'form' });
  public readonly id = input<string | null>(null);
  public readonly inputmode = input<string | null>(null);
  public readonly list = input<string | null>(null);
  public readonly inputName = input<string | null>(null, { alias: 'name' });
  public readonly pattern: InputSignalWithTransform<readonly RegExp[], unknown> = input<
    readonly RegExp[],
    unknown
  >([], {
    transform: normalizePatternInput,
  });
  public readonly placeholder = input<string | null>(null);
  public readonly readonly = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  public readonly required = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });
  public readonly maxValue = input<number | string | null, number | string | null | undefined>(
    null,
    {
      alias: 'max',
      transform: normalizeOptionalNumberInput,
    },
  );
  public readonly maxlength = input<number | string | null, number | string | null | undefined>(
    null,
    {
      transform: normalizeOptionalNumberInput,
    },
  );
  public readonly minValue = input<number | string | null, number | string | null | undefined>(
    null,
    {
      alias: 'min',
      transform: normalizeOptionalNumberInput,
    },
  );
  public readonly minlength = input<number | string | null, number | string | null | undefined>(
    null,
    {
      transform: normalizeOptionalNumberInput,
    },
  );
  public readonly spellcheck = input<boolean | null, NullableBooleanInput>(null, {
    transform: coerceTngInputNullableBoolean,
  });
  public readonly step = input<number | string | null, number | string | null | undefined>(null, {
    transform: normalizeOptionalNumberInput,
  });
  public readonly type = input<TngInputType>('text');

  public readonly value = model<string | null>(null);

  // ---- Outputs ----
  public readonly touchedChange = output<void>();
  public readonly inputEvent = output<Event>({ alias: 'input' });
  public readonly changeEvent = output<Event>({ alias: 'change' });
  public readonly focusEvent = output<FocusEvent>({ alias: 'focus' });
  public readonly blurEvent = output<FocusEvent>({ alias: 'blur' });
  public readonly keydownEvent = output<KeyboardEvent>({ alias: 'keydown' });
  public readonly keyupEvent = output<KeyboardEvent>({ alias: 'keyup' });

  // ---- Signal forms adapter state ----
  @ViewChild('inputControl')
  private readonly inputControl: ElementRef<HTMLInputElement> | undefined;

  private readonly formDisabled = signal(false);
  private numberSelectionRange: NumberRange | null = null;
  private numberPointerFocusPending = false;

  // ---- Host attrs (optional, useful for styling/debug) ----
  @HostBinding('attr.data-slot')
  protected readonly dataSlot = 'input-component' as const;

  @HostBinding('attr.data-appearance')
  protected get dataAppearance(): TngInputFieldAppearance {
    return this.appearance();
  }

  @HostBinding('attr.data-size')
  protected get dataSize(): TngInputFieldSize {
    return this.size();
  }

  @HostBinding('attr.data-tone')
  protected get dataTone(): TngInputFieldTone {
    return this.tone();
  }

  @HostBinding('attr.data-type')
  protected get dataType(): TngInputType {
    return this.type();
  }

  @HostBinding('attr.data-full-width')
  protected get dataFullWidth(): '' | null {
    return this.fullWidth() ? '' : null;
  }

  // ---- Derived values for template ----
  protected get effectiveValue(): string {
    return this.value() ?? '';
  }

  protected get effectiveDisabled(): boolean {
    return this.formDisabled() || this.disabled();
  }

  protected get nativeInputType(): TngInputType {
    return this.isNumberInput ? 'text' : this.type();
  }

  protected get nativeInputMode(): string | null {
    return normalizeAttr(this.inputmode()) ?? (this.isNumberInput ? 'decimal' : null);
  }

  protected get isNumberInput(): boolean {
    return this.type() === 'number';
  }

  private get isEditableNumberInput(): boolean {
    return this.isNumberInput && !this.effectiveDisabled && !this.readonly();
  }

  public setFormDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // ---- DOM handlers ----
  public onInput(event: unknown): void {
    if (event instanceof Event) {
      event.stopPropagation();
    }

    let next = readInputValue(event);
    if (next === null) return;

    // If disabled, ignore (optional safety)
    if (this.effectiveDisabled) return;

    if (this.isNumberInput) {
      this.numberSelectionRange = null;
      this.numberPointerFocusPending = false;
      const sanitized = sanitizeNumberText(next, 'partial');
      if (sanitized !== next) {
        next = sanitized;
        const inputElement = readInputElement(event);
        if (inputElement !== null) {
          inputElement.value = sanitized;
        }
      }
    }

    this.commitValue(next, event);
  }

  public onBeforeInput(event: unknown): void {
    if (!(event instanceof Event) || !this.isEditableNumberInput) return;

    const inputElement = readInputElement(event);
    const text = readBeforeInputText(event);
    if (inputElement === null || text === null || text.length === 0) return;

    const next = replaceNumberTextRange(inputElement.value, text, readSelectionRange(inputElement));
    if (!isValidPartialNumberText(next)) {
      event.preventDefault();
    }
  }

  public onPaste(event: unknown): void {
    if (!(event instanceof Event) || !this.isEditableNumberInput) return;

    const inputElement = readInputElement(event);
    const clipboardText = readClipboardText(event);
    if (inputElement === null || clipboardText === null) return;

    event.preventDefault();

    const insertion = sanitizeNumberText(clipboardText, 'partial');
    const range =
      this.numberSelectionRange === null
        ? readSelectionRange(inputElement)
        : clampSelectionRange(this.numberSelectionRange, inputElement.value.length);
    const next = sanitizeNumberText(
      replaceNumberTextRange(inputElement.value, insertion, range),
      'complete',
    );

    this.numberSelectionRange = null;
    this.numberPointerFocusPending = false;
    inputElement.value = next;
    restoreCaret(inputElement, next.length);
    this.commitValue(next, createInputEvent(inputElement));
  }

  public onKeydown(event: unknown): void {
    if (!(event instanceof KeyboardEvent)) return;

    event.stopPropagation();
    this.keydownEvent.emit(event);

    if (!this.isNumberInput || this.effectiveDisabled) return;

    this.updateNumberSelectionRange(event);

    this.handleNumberKeydown(event);
  }

  private updateNumberSelectionRange(event: Readonly<KeyboardEvent>): void {
    const inputElement = readInputElement(event);
    if (inputElement !== null && this.isEditableNumberInput && isSelectAllShortcut(event)) {
      this.numberSelectionRange = { start: 0, end: inputElement.value.length };
    } else if (this.isEditableNumberInput && !isClipboardShortcut(event)) {
      this.numberSelectionRange = null;
    }
  }

  private handleNumberKeydown(event: Readonly<KeyboardEvent>): void {
    switch (event.key) {
      case 'ArrowUp':
        this.stepNumberFromKey(event, 1);
        break;
      case 'ArrowDown':
        this.stepNumberFromKey(event, -1);
        break;
      case 'PageUp':
        this.stepNumberFromKey(event, 1, 10);
        break;
      case 'PageDown':
        this.stepNumberFromKey(event, -1, 10);
        break;
      case 'Home':
        this.setNumberBoundaryFromKey(event, 'min');
        break;
      case 'End':
        this.setNumberBoundaryFromKey(event, 'max');
        break;
    }
  }

  public onKeyup(event: unknown): void {
    if (!(event instanceof KeyboardEvent)) return;

    event.stopPropagation();
    this.keyupEvent.emit(event);
  }

  public stepNumber(delta: -1 | 1, stepCount = 1): void {
    if (!this.isNumberInput || this.effectiveDisabled || this.readonly()) return;

    const inputElement = this.inputControl?.nativeElement;
    if (inputElement === undefined) return;

    this.numberSelectionRange = null;
    inputElement.focus();

    this.applyStepToInputElement(inputElement, delta, stepCount);

    this.numberSelectionRange = null;
    this.numberPointerFocusPending = false;
    this.commitValue(inputElement.value, createInputEvent(inputElement));
  }

  private applyStepToInputElement(
    inputElement: Readonly<HTMLInputElement>,
    delta: -1 | 1,
    stepCount: number,
  ): void {
    try {
      if (delta > 0) {
        inputElement.stepUp(stepCount);
      } else {
        inputElement.stepDown(stepCount);
      }
    } catch {
      (inputElement as HTMLInputElement).value = this.nextSteppedValue(
        inputElement.value,
        delta,
        stepCount,
      );
    }
  }

  private stepNumberFromKey(event: Readonly<KeyboardEvent>, delta: -1 | 1, stepCount = 1): void {
    event.preventDefault();
    this.stepNumber(delta, stepCount);
  }

  private setNumberBoundaryFromKey(event: Readonly<KeyboardEvent>, boundary: 'max' | 'min'): void {
    const boundaryValue = readFiniteNumber(boundary === 'min' ? this.minValue() : this.maxValue());
    if (boundaryValue === null) return;

    event.preventDefault();
    if (this.readonly()) return;

    const inputElement = this.inputControl?.nativeElement;
    if (inputElement === undefined) return;

    this.numberSelectionRange = null;
    this.numberPointerFocusPending = false;
    inputElement.value = formatNumberValue(boundaryValue);
    this.commitValue(inputElement.value, createInputEvent(inputElement));
  }

  private commitValue(next: string, event: unknown): void {
    this.value.set(next);

    if (event instanceof Event) {
      this.inputEvent.emit(event);
    }
  }

  private nextSteppedValue(currentValue: string, delta: -1 | 1, stepCount: number): string {
    const min = readFiniteNumber(this.minValue());
    const max = readFiniteNumber(this.maxValue());
    const step = readFiniteNumber(this.step()) ?? 1;
    const current = readFiniteNumber(currentValue) ?? min ?? 0;
    const nextStep = step > 0 ? step : 1;
    let next = current + delta * nextStep * stepCount;

    if (min !== null) next = Math.max(min, next);
    if (max !== null) next = Math.min(max, next);

    return formatNumberValue(next);
  }

  public onBlur(event: unknown): void {
    if (event instanceof Event) {
      event.stopPropagation();
    }

    if (this.isNumberInput) {
      this.numberSelectionRange = null;
      this.numberPointerFocusPending = false;
    }

    this.touchedChange.emit();
    if (event instanceof FocusEvent) {
      this.blurEvent.emit(event);
    }
  }

  public onFocus(event: unknown): void {
    if (!(event instanceof FocusEvent)) return;

    event.stopPropagation();
    this.focusEvent.emit(event);

    if (!this.isNumberInput) {
      this.numberSelectionRange = null;
      this.numberPointerFocusPending = false;
      return;
    }

    const inputElement = readInputElement(event);
    if (inputElement === null || !this.isEditableNumberInput || this.numberPointerFocusPending) {
      this.numberSelectionRange = null;
      this.numberPointerFocusPending = false;
      return;
    }

    this.numberSelectionRange = { start: 0, end: inputElement.value.length };
  }

  public onPointerDown(event: unknown): void {
    if (!(event instanceof Event) || !this.isNumberInput) return;

    this.numberSelectionRange = null;
    this.numberPointerFocusPending = this.isEditableNumberInput;
  }

  public onChangeEvent(event: unknown): void {
    if (!(event instanceof Event)) return;

    event.stopPropagation();
    this.changeEvent.emit(event);
  }

  protected normalizeAttrValue(value: unknown): string | null {
    return normalizeAttr(value);
  }

  protected normalizeNumberAttrValue(value: number | string | null | undefined): string | null {
    return normalizeNumberAttr(value);
  }

  protected formatPatternAttrValue(value: readonly Readonly<RegExp>[]): string | null {
    return formatPatternAttr(value);
  }

  protected formatNullableBooleanAttrValue(value: boolean | null): 'false' | 'true' | null {
    return formatNullableBooleanAttr(value);
  }
}
