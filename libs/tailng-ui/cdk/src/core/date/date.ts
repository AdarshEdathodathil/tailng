import type {
  TngCalendarView,
  TngDateAdapter,
  TngDateCell,
  TngDateFormatToken,
  TngDateInputValue,
  TngDateRange,
  TngDateRangeInput,
  TngDateSelectionInput,
  TngDateSelectionMode,
  TngDateSelectionNormalization,
  TngDateValue,
  TngMonthGridOptions,
  TngMonthOption,
  TngMonthOptionsConfig,
  TngMoveDateOptions,
  TngWeekBoundary,
  TngWeekdayIndex,
  TngYearOption,
  TngYearOptionsConfig,
} from './date.types';

function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0, 0);
}

function normalizeDateInstance(date: Date): Date {
  return createLocalDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function toComparableNumber(date: Date): number {
  return Number(
    `${date.getFullYear().toString().padStart(4, '0')}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`,
  );
}

function parseIsoDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match === null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = createLocalDate(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

function parseMonthDayYearDateOnly(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (match === null) {
    return null;
  }

  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = createLocalDate(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

function createFormatter(
  locale: string | undefined,
  options: Readonly<Intl.DateTimeFormatOptions>,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale ?? 'en-US', options);
}

const DATE_FORMAT_OPTIONS: Readonly<Record<Exclude<TngDateFormatToken, 'input'>, Intl.DateTimeFormatOptions>> =
  Object.freeze({
    'day-number': { day: 'numeric' },
    label: { day: 'numeric', month: 'long', year: 'numeric' },
    'month-long': { month: 'long' },
    'month-short': { month: 'short' },
    'month-year': { month: 'long', year: 'numeric' },
    'weekday-narrow': { weekday: 'narrow' },
    'weekday-short': { weekday: 'short' },
    'year-label': { year: 'numeric' },
  });

function resolveDateFormatter(date: Date, format: string, locale?: string): string {
  if (format === 'input') {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');
    return `${month}-${day}-${year}`;
  }

  const options =
    DATE_FORMAT_OPTIONS[format as Exclude<TngDateFormatToken, 'input'>] ??
    DATE_FORMAT_OPTIONS.label;
  return createFormatter(locale, options).format(date);
}

function isRangeInput<TDate>(
  value: TngDateSelectionInput<TDate>,
): value is Readonly<TngDateRangeInput<TDate>> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'start' in value &&
    'end' in value
  );
}

function deserializeStringDate(value: string): Date | null {
  const monthDayYearDate = parseMonthDayYearDateOnly(value);
  if (monthDayYearDate !== null) {
    return monthDayYearDate;
  }

  const isoDate = parseIsoDateOnly(value);
  if (isoDate !== null) {
    return isoDate;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : normalizeDateInstance(parsed);
}

function deserializeDateValue(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : normalizeDateInstance(value);
  }

  return typeof value === 'string' ? deserializeStringDate(value) : null;
}

export function isTngDateRangeValue<TDate>(
  value: TngDateValue<TDate>,
): value is TngDateRange<TDate> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'start' in value &&
    'end' in value
  );
}

export const defaultTngDateAdapter: TngDateAdapter<Date> = Object.freeze({
  addDays: (date, amount) => {
    const next = createLocalDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);
    return next;
  },
  addMonths: (date, amount) => {
    const targetMonth = date.getMonth() + amount;
    const result = createLocalDate(date.getFullYear(), targetMonth, 1);
    const lastDay = createLocalDate(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    return createLocalDate(
      result.getFullYear(),
      result.getMonth(),
      Math.min(date.getDate(), lastDay),
    );
  },
  addYears: (date, amount) => {
    const result = createLocalDate(date.getFullYear() + amount, date.getMonth(), 1);
    const lastDay = createLocalDate(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    return createLocalDate(
      result.getFullYear(),
      result.getMonth(),
      Math.min(date.getDate(), lastDay),
    );
  },
  compare: (left, right) => {
    const leftValue = toComparableNumber(left);
    const rightValue = toComparableNumber(right);
    if (leftValue < rightValue) return -1;
    if (leftValue > rightValue) return 1;
    return 0;
  },
  createDate: (year, month, day) => createLocalDate(year, month, day),
  deserialize: deserializeDateValue,
  endOfMonth: (date) => createLocalDate(date.getFullYear(), date.getMonth() + 1, 0),
  format: (date, format, locale) => resolveDateFormatter(date, format, locale),
  getDate: (date) => date.getDate(),
  getDay: (date) => date.getDay(),
  getMonth: (date) => date.getMonth(),
  getYear: (date) => date.getFullYear(),
  isValid: (date) => Number.isFinite(date.getTime()),
  parse: (text, locale) => {
    const monthDayYearDate = parseMonthDayYearDateOnly(text);
    if (monthDayYearDate !== null) {
      return monthDayYearDate;
    }

    const isoDate = parseIsoDateOnly(text);
    if (isoDate !== null) {
      return isoDate;
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const formatted = resolveDateFormatter(parsed, 'label', locale);
    if (formatted.trim().length === 0) {
      return null;
    }

    return normalizeDateInstance(parsed);
  },
  startOfMonth: (date) => createLocalDate(date.getFullYear(), date.getMonth(), 1),
  startOfWeek: (date, weekStartsOn) => {
    const diff = (date.getDay() - weekStartsOn + 7) % 7;
    return createLocalDate(date.getFullYear(), date.getMonth(), date.getDate() - diff);
  },
  today: () => normalizeDateInstance(new Date()),
});

export function normalizeTngDateInput<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  value: TngDateInputValue<TDate>,
  locale?: string,
): TDate | null {
  if (value === null || value === undefined) {
    return null;
  }

  const deserialized = normalizeDeserializedInput(adapter, value, locale);
  if (deserialized !== null) {
    return deserialized;
  }

  if (typeof value === 'string') {
    return normalizeStringInput(adapter, value, locale);
  }

  return normalizeDateLikeInput(adapter, value);
}

function normalizeDeserializedInput<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  value: TngDateInputValue<TDate>,
  locale?: string,
): TDate | null {
  if (adapter.deserialize !== undefined) {
    const normalized = adapter.deserialize(value, locale);
    if (normalized !== null && adapter.isValid(normalized)) {
      return normalized;
    }
  }

  return null;
}

function normalizeStringInput<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  value: TngDateInputValue<TDate>,
  locale?: string,
): TDate | null {
  if (typeof value === 'string') {
    const parsed = adapter.parse(value, locale);
    return parsed !== null && adapter.isValid(parsed) ? parsed : null;
  }

  return null;
}

function normalizeDateLikeInput<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  value: TngDateInputValue<TDate>,
): TDate | null {
  if (value instanceof Date && adapter.isValid(value as TDate)) {
    return value as TDate;
  }

  if (adapter.isValid(value as TDate)) {
    return value as TDate;
  }

  return null;
}

export function coerceTngWeekStartsOn(value: number): TngWeekdayIndex {
  const normalized = Number.isFinite(value) ? Math.trunc(value) : 0;
  const wrapped = ((normalized % 7) + 7) % 7;
  return wrapped as TngWeekdayIndex;
}

export function resolveLocaleWeekStartsOn(locale?: string): TngWeekdayIndex {
  if (typeof Intl === 'undefined' || typeof Intl.Locale === 'undefined' || locale === undefined) {
    return 0;
  }

  try {
    const localeWithWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => Readonly<{ firstDay: number }>;
      weekInfo?: Readonly<{ firstDay: number }>;
    };
    const getWeekInfo = localeWithWeekInfo.getWeekInfo;
    const weekInfo =
      typeof getWeekInfo === 'function'
        ? getWeekInfo.call(localeWithWeekInfo)
        : localeWithWeekInfo.weekInfo;
    if (weekInfo === undefined) {
      return 0;
    }

    return (weekInfo.firstDay % 7) as TngWeekdayIndex;
  } catch {
    return 0;
  }
}

export function toDateKey<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  date: TDate,
): string {
  const year = adapter.getYear(date).toString().padStart(4, '0');
  const month = (adapter.getMonth(date) + 1).toString().padStart(2, '0');
  const day = adapter.getDate(date).toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function datesEqual<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  left: TDate | null,
  right: TDate | null,
): boolean {
  if (left === null || right === null) {
    return left === right;
  }

  return adapter.compare(left, right) === 0;
}

export function isSameDate(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) {
    return false;
  }

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isDateBefore(a: Date, b: Date): boolean {
  return startOfDate(a).getTime() < startOfDate(b).getTime();
}

export function isDateAfter(a: Date, b: Date): boolean {
  return startOfDate(a).getTime() > startOfDate(b).getTime();
}

export function isDateBetween(date: Date, start: Date, end: Date): boolean {
  const valueTime = startOfDate(date).getTime();
  const startTime = startOfDate(start).getTime();
  const endTime = startOfDate(end).getTime();

  return valueTime > startTime && valueTime < endTime;
}

export function normalizeDateRange(start: Date, end: Date): { end: Date; start: Date } {
  return isDateBefore(end, start) ? { end: start, start: end } : { end, start };
}

export function hasCompleteRange<TDate>(
  value: TngDateRange<TDate> | null | undefined,
): boolean {
  return !!value?.start && !!value?.end;
}

export function hasPartialRange<TDate>(
  value: TngDateRange<TDate> | null | undefined,
): boolean {
  return !!value?.start && !value?.end;
}

export function compareMonthIdentity<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  left: TDate,
  right: TDate,
): number {
  const yearDiff = adapter.getYear(left) - adapter.getYear(right);
  if (yearDiff !== 0) {
    return yearDiff;
  }

  return adapter.getMonth(left) - adapter.getMonth(right);
}

export function compareYearIdentity<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  left: TDate,
  right: TDate,
): number {
  return adapter.getYear(left) - adapter.getYear(right);
}

export function normalizeRangeOrder<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  range: Readonly<TngDateRange<TDate>>,
): TngDateRange<TDate> {
  if (range.start === null || range.end === null) {
    return range;
  }

  if (adapter.compare(range.start, range.end) <= 0) {
    return range;
  }

  return Object.freeze({
    end: range.start,
    start: range.end,
  });
}

export function sortAndUniqueDates<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  dates: readonly TDate[],
): readonly TDate[] {
  const sorted = [...dates].sort((left, right) => adapter.compare(left, right));
  const unique: TDate[] = [];
  for (const date of sorted) {
    const last = unique.length > 0 ? unique[unique.length - 1] : null;
    if (last !== null && adapter.compare(last, date) === 0) {
      continue;
    }
    unique.push(date);
  }
  return Object.freeze(unique);
}

export function isDateValueInMonth<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  value: TDate,
  visibleMonth: TDate,
): boolean {
  return (
    adapter.getYear(value) === adapter.getYear(visibleMonth) &&
    adapter.getMonth(value) === adapter.getMonth(visibleMonth)
  );
}

export function clampDateToMonth<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  date: TDate,
  monthDate: TDate,
): TDate {
  const lastDate = adapter.getDate(adapter.endOfMonth(monthDate));
  return adapter.createDate(
    adapter.getYear(monthDate),
    adapter.getMonth(monthDate),
    Math.min(adapter.getDate(date), lastDate),
  );
}

export function moveDateSkippingDisabled<TDate>(
  options: Readonly<TngMoveDateOptions<TDate>>,
): TDate {
  const allowCrossView = options.allowCrossView ?? true;
  const maxIterations = 400;
  let next = options.adapter.addDays(options.start, options.delta);
  let remaining = maxIterations;
  while (remaining > 0 && options.isDisabled(next)) {
    const currentMonth = options.adapter.getMonth(options.start);
    const nextMonth = options.adapter.getMonth(next);
    if (!allowCrossView && currentMonth !== nextMonth) {
      return options.start;
    }
    next = options.adapter.addDays(next, options.delta);
    remaining -= 1;
  }

  return remaining === 0 ? options.start : next;
}

export function resolveWeekBoundaryDate<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    boundary: TngWeekBoundary;
    date: TDate;
    weekStartsOn: TngWeekdayIndex;
  }>,
): TDate {
  const start = options.adapter.startOfWeek(options.date, options.weekStartsOn);
  return options.boundary === 'start' ? start : options.adapter.addDays(start, 6);
}

export function isValueSelected<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    date: TDate;
    selectionMode: TngDateSelectionMode;
    value: Readonly<TngDateValue<TDate>>;
  }>,
): boolean {
  if (options.value === null) {
    return false;
  }

  if (options.selectionMode === 'single') {
    return options.adapter.compare(options.value as TDate, options.date) === 0;
  }

  if (options.selectionMode === 'multiple') {
    return (options.value as readonly TDate[]).some(
      (selected) => options.adapter.compare(selected, options.date) === 0,
    );
  }

  const range = options.value as TngDateRange<TDate>;
  if (range.start === null || range.end === null) {
    return range.start !== null && options.adapter.compare(range.start, options.date) === 0;
  }

  return (
    options.adapter.compare(range.start, options.date) <= 0 &&
    options.adapter.compare(range.end, options.date) >= 0
  );
}

export function isDateInRange<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    date: TDate;
    includeEndpoints?: boolean;
    value: Readonly<TngDateValue<TDate>>;
  }>,
): boolean {
  if (!isTngDateRangeValue(options.value)) {
    return false;
  }

  if (options.value.start === null || options.value.end === null) {
    return false;
  }

  const startComparison = options.adapter.compare(options.value.start, options.date);
  const endComparison = options.adapter.compare(options.value.end, options.date);
  return options.includeEndpoints === false
    ? startComparison < 0 && endComparison > 0
    : startComparison <= 0 && endComparison >= 0;
}

export function hasSelectableDateInMonth<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  monthDate: TDate,
  isDisabled: (date: TDate) => boolean,
): boolean {
  const start = adapter.startOfMonth(monthDate);
  const totalDays = adapter.getDate(adapter.endOfMonth(monthDate));
  for (let day = 0; day < totalDays; day += 1) {
    const candidate = adapter.addDays(start, day);
    if (!isDisabled(candidate)) {
      return true;
    }
  }

  return false;
}

export function hasSelectableDateInYear<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    isDisabled: (date: TDate) => boolean;
    year: number;
  }>,
): boolean {
  for (let month = 0; month < 12; month += 1) {
    const monthDate = options.adapter.createDate(options.year, month, 1);
    if (hasSelectableDateInMonth(options.adapter, monthDate, options.isDisabled)) {
      return true;
    }
  }

  return false;
}

export function findFirstEnabledDateInMonth<TDate>(
  adapter: Readonly<TngDateAdapter<TDate>>,
  monthDate: TDate,
  isDisabled: (date: TDate) => boolean,
): TDate | null {
  const start = adapter.startOfMonth(monthDate);
  const totalDays = adapter.getDate(adapter.endOfMonth(monthDate));
  for (let day = 0; day < totalDays; day += 1) {
    const candidate = adapter.addDays(start, day);
    if (!isDisabled(candidate)) {
      return candidate;
    }
  }

  return null;
}

function buildMonthCell<TDate, TExtraCellState extends object>(
  options: Readonly<TngMonthGridOptions<TDate, TExtraCellState>>,
  index: number,
  firstVisibleDate: TDate,
): Readonly<TngDateCell<TDate> & TExtraCellState> {
  const date = options.adapter.addDays(firstVisibleDate, index);
  const inMonth = isDateValueInMonth(options.adapter, date, options.visibleMonth);
  const hidden = !inMonth && !options.showOutsideDays;
  const active = datesEqual(options.adapter, date, options.activeDate);
  const focusVisible =
    options.focusedDate !== null && datesEqual(options.adapter, date, options.focusedDate);

  return Object.freeze({
    active,
    colIndex: index % 7,
    date,
    disabled: resolveMonthCellDisabled(options, date, inMonth),
    focusVisible,
    hidden,
    id: options.createCellId(date),
    inMonth,
    inRange: options.inRange(date),
    label: resolveMonthCellLabel(options, date, hidden),
    rangeEnd: options.isRangeEnd(date),
    rangeStart: options.isRangeStart(date),
    rowIndex: Math.floor(index / 7),
    selected: options.isSelected(date),
    tabindex: resolveMonthCellTabindex(options, active),
    today: datesEqual(options.adapter, date, options.today),
    ...resolveMonthCellExtraState(options, { date, hidden, inMonth, index }),
  });
}

function resolveMonthCellDisabled<TDate>(
  options: Readonly<TngMonthGridOptions<TDate>>,
  date: TDate,
  inMonth: boolean,
): boolean {
  return !inMonth || options.isDisabled(date);
}

function resolveMonthCellLabel<TDate>(
  options: Readonly<TngMonthGridOptions<TDate>>,
  date: TDate,
  hidden: boolean,
): string {
  return hidden ? '' : options.adapter.format(date, 'day-number', options.locale);
}

function resolveMonthCellTabindex<TDate>(
  options: Readonly<TngMonthGridOptions<TDate>>,
  active: boolean,
): -1 | 0 {
  return active && options.focusStrategy === 'roving' ? 0 : -1;
}

function resolveMonthCellExtraState<TDate, TExtraCellState extends object>(
  options: Readonly<TngMonthGridOptions<TDate, TExtraCellState>>,
  context: Readonly<{
    date: TDate;
    hidden: boolean;
    inMonth: boolean;
    index: number;
  }>,
): TExtraCellState {
  if (options.getCellState === undefined) {
    return {} as TExtraCellState;
  }

  return options.getCellState(context);
}

export function buildMonthGrid<TDate, TExtraCellState extends object = object>(
  options: Readonly<TngMonthGridOptions<TDate, TExtraCellState>>,
): readonly Readonly<TngDateCell<TDate> & TExtraCellState>[] {
  const firstOfMonth = options.adapter.startOfMonth(options.visibleMonth);
  const firstVisibleDate = options.adapter.startOfWeek(firstOfMonth, options.weekStartsOn);
  const daysInMonth = options.adapter.getDate(options.adapter.endOfMonth(options.visibleMonth));
  const leadingOffset = (options.adapter.getDay(firstOfMonth) - options.weekStartsOn + 7) % 7;
  const weekCount = options.fixedWeeks ? 6 : Math.ceil((leadingOffset + daysInMonth) / 7);
  const totalCells = weekCount * 7;
  const cells: Readonly<TngDateCell<TDate> & TExtraCellState>[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    cells.push(buildMonthCell(options, index, firstVisibleDate));
  }

  return Object.freeze(cells);
}

export function buildMonthOptions<TDate>(
  options: Readonly<TngMonthOptionsConfig<TDate>>,
): readonly TngMonthOption<TDate>[] {
  const year = options.adapter.getYear(options.visibleMonth);
  const monthOptions: TngMonthOption<TDate>[] = [];
  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const date = options.adapter.createDate(year, monthIndex, 1);
    const active =
      options.focusedSection === 'month' &&
      options.adapter.getYear(options.activeDate) === year &&
      options.adapter.getMonth(options.activeDate) === monthIndex;
    const focusVisible =
      options.focusedSection === 'month' &&
      options.focusedDate !== null &&
      compareMonthIdentity(options.adapter, date, options.focusedDate) === 0;
    monthOptions.push(
      Object.freeze({
        active,
        date,
        disabled: options.disabledMonth(monthIndex),
        focusVisible,
        id: options.createId(monthIndex),
        index: monthIndex,
        label: options.adapter.format(date, 'month-short', options.locale),
        selected: options.selectedMonth(monthIndex),
        tabindex: active ? 0 : -1,
      }),
    );
  }

  return Object.freeze(monthOptions);
}

export function buildYearOptions<TDate>(
  options: Readonly<TngYearOptionsConfig<TDate>>,
): readonly TngYearOption<TDate>[] {
  const yearOptions: TngYearOption<TDate>[] = [];
  for (let offset = 0; offset < options.totalYears; offset += 1) {
    const year = options.startYear + offset;
    const date = options.adapter.createDate(
      year,
      options.adapter.getMonth(options.visibleMonth),
      1,
    );
    const active =
      options.focusedSection === 'year' && options.adapter.getYear(options.activeDate) === year;
    const focusVisible =
      options.focusedSection === 'year' &&
      options.focusedDate !== null &&
      compareYearIdentity(options.adapter, date, options.focusedDate) === 0;
    yearOptions.push(
      Object.freeze({
        active,
        date,
        disabled: options.disabledYear(year),
        focusVisible,
        id: options.createId(year),
        label: options.adapter.format(date, 'year-label', options.locale),
        selected: options.selectedYear(year),
        tabindex: active ? 0 : -1,
        year,
      }),
    );
  }

  return Object.freeze(yearOptions);
}

export function resolveInitialFocusedSection(view: TngCalendarView): TngCalendarView {
  return view;
}

export function resolveViewForEscape(currentView: TngCalendarView): TngCalendarView | null {
  return currentView === 'day' ? null : 'day';
}

export function includesView(views: readonly TngCalendarView[], view: TngCalendarView): boolean {
  return views.includes(view);
}

function normalizeRangeSelectionInput<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    locale?: string;
    value: TngDateSelectionInput<TDate>;
  }>,
): TngDateSelectionNormalization<TDate> {
  if (!isRangeInput(options.value)) {
    return normalizePartialRangeSelectionInput(options);
  }

  return normalizeExplicitRangeSelectionInput({
    adapter: options.adapter,
    locale: options.locale,
    value: options.value,
  });
}

function normalizePartialRangeSelectionInput<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    locale?: string;
    value: TngDateSelectionInput<TDate>;
  }>,
): TngDateSelectionNormalization<TDate> {
  const singleDate = normalizeTngDateInput(
    options.adapter,
    options.value as TngDateInputValue<TDate>,
    options.locale,
  );
  return singleDate === null
    ? Object.freeze({ validationError: 'invalid-value', value: null })
    : Object.freeze({
        validationError: null,
        value: Object.freeze({ end: null, start: singleDate }),
      });
}

function normalizeExplicitRangeSelectionInput<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    locale?: string;
    value: Readonly<TngDateRangeInput<TDate>>;
  }>,
): TngDateSelectionNormalization<TDate> {
  const start = normalizeTngDateInput(options.adapter, options.value.start, options.locale);
  const end = normalizeTngDateInput(options.adapter, options.value.end, options.locale);
  if (options.value.start !== null && options.value.start !== undefined && start === null) {
    return Object.freeze({ validationError: 'invalid-value', value: null });
  }
  if (options.value.end !== null && options.value.end !== undefined && end === null) {
    return Object.freeze({ validationError: 'invalid-value', value: null });
  }

  return Object.freeze({
    validationError: null,
    value: normalizeRangeOrder(options.adapter, Object.freeze({ end, start })),
  });
}

function normalizeMultipleSelectionInput<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    locale?: string;
    value: TngDateSelectionInput<TDate>;
  }>,
): TngDateSelectionNormalization<TDate> {
  const list = Array.isArray(options.value) ? options.value : [options.value];
  const normalized = list
    .map((item) =>
      normalizeTngDateInput(options.adapter, item as TngDateInputValue<TDate>, options.locale),
    )
    .filter((item): item is TDate => item !== null);
  const validationError = normalized.length === list.length ? null : 'invalid-value';

  return Object.freeze({
    validationError,
    value: Object.freeze(sortAndUniqueDates(options.adapter, normalized)),
  });
}

export function normalizeDateSelectionInput<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    locale?: string;
    selectionMode: TngDateSelectionMode;
    value: TngDateSelectionInput<TDate>;
  }>,
): TngDateSelectionNormalization<TDate> {
  if (options.value === null || options.value === undefined) {
    return Object.freeze({ validationError: null, value: null });
  }

  if (options.selectionMode === 'range') {
    return normalizeRangeSelectionInput(options);
  }

  if (options.selectionMode === 'multiple') {
    return normalizeMultipleSelectionInput(options);
  }

  const date = normalizeTngDateInput(
    options.adapter,
    options.value as TngDateInputValue<TDate>,
    options.locale,
  );
  return Object.freeze({
    validationError: date === null ? 'invalid-value' : null,
    value: date,
  });
}

export function dateSelectionValuesEqual<TDate>(
  options: Readonly<{
    adapter: Readonly<TngDateAdapter<TDate>>;
    left: TngDateValue<TDate>;
    right: TngDateValue<TDate>;
    selectionMode: TngDateSelectionMode;
  }>,
): boolean {
  if (options.left === options.right) {
    return true;
  }

  if (options.left === null || options.right === null) {
    return options.left === options.right;
  }

  if (options.selectionMode === 'single') {
    return datesEqual(options.adapter, options.left as TDate, options.right as TDate);
  }

  if (options.selectionMode === 'multiple') {
    const leftDates = options.left as readonly TDate[];
    const rightDates = options.right as readonly TDate[];
    if (leftDates.length !== rightDates.length) {
      return false;
    }

    return leftDates.every((date, index) =>
      datesEqual(options.adapter, date, rightDates[index] ?? null),
    );
  }

  const leftRange = options.left as TngDateRange<TDate>;
  const rightRange = options.right as TngDateRange<TDate>;
  return (
    datesEqual(options.adapter, leftRange.start, rightRange.start) &&
    datesEqual(options.adapter, leftRange.end, rightRange.end)
  );
}

export function clearDateSelectionForMode<TDate>(
  selectionMode: TngDateSelectionMode,
): TngDateValue<TDate> {
  if (selectionMode === 'range') {
    return Object.freeze({ end: null, start: null });
  }

  if (selectionMode === 'multiple') {
    return Object.freeze([]);
  }

  return null;
}
