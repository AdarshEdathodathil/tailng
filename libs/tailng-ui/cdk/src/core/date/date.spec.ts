import { describe, expect, it } from 'vitest';
import {
  buildMonthGrid,
  defaultTngDateAdapter,
  isDateInRange,
  normalizeDateSelectionInput,
  resolveLocaleWeekStartsOn,
} from './date';

const adapter = defaultTngDateAdapter;

function dateKey(date: Date): string {
  return adapter.format(date, 'input');
}

function withIntlLocale(localeConstructor: unknown, assertion: () => void): void {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Intl, 'Locale');
  Object.defineProperty(Intl, 'Locale', {
    configurable: true,
    value: localeConstructor,
    writable: true,
  });

  try {
    assertion();
  } finally {
    if (originalDescriptor === undefined) {
      Reflect.deleteProperty(Intl, 'Locale');
    } else {
      Object.defineProperty(Intl, 'Locale', originalDescriptor);
    }
  }
}

describe('defaultTngDateAdapter', () => {
  it('parses date-only strings into normalized local dates', () => {
    const parsed = adapter.parse('2026-05-15');

    expect(parsed).not.toBeNull();
    expect(dateKey(parsed!)).toBe('05-15-2026');
    expect(parsed!.getHours()).toBe(12);
  });

  it('clamps month arithmetic to the target month length', () => {
    const jan31 = adapter.createDate(2026, 0, 31);

    expect(dateKey(adapter.addMonths(jan31, 1))).toBe('02-28-2026');
  });
});

describe('normalizeDateSelectionInput', () => {
  it('normalizes range input and orders start/end', () => {
    const normalized = normalizeDateSelectionInput({
      adapter,
      selectionMode: 'range',
      value: {
        end: '2026-05-10',
        start: '2026-05-15',
      },
    });

    expect(normalized.validationError).toBeNull();
    const value = normalized.value as { end: Date; start: Date };
    expect(dateKey(value.start)).toBe('05-10-2026');
    expect(dateKey(value.end)).toBe('05-15-2026');
  });

  it('sorts and deduplicates multiple selection input', () => {
    const normalized = normalizeDateSelectionInput({
      adapter,
      selectionMode: 'multiple',
      value: ['2026-05-15', '2026-05-10', '2026-05-15'],
    });

    expect(normalized.validationError).toBeNull();
    expect((normalized.value as readonly Date[]).map(dateKey)).toEqual([
      '05-10-2026',
      '05-15-2026',
    ]);
  });
});

describe('resolveLocaleWeekStartsOn', () => {
  it('uses the standard getWeekInfo method when available', () => {
    withIntlLocale(
      class {
        public getWeekInfo(): Readonly<{ firstDay: number }> {
          return { firstDay: 1 };
        }
      },
      () => {
        expect(resolveLocaleWeekStartsOn('fr-FR')).toBe(1);
      },
    );
  });

  it('supports the legacy weekInfo property', () => {
    withIntlLocale(
      class {
        public readonly weekInfo = { firstDay: 6 };
      },
      () => {
        expect(resolveLocaleWeekStartsOn('ar-EG')).toBe(6);
      },
    );
  });

  it('falls back to Sunday when week information is unavailable', () => {
    withIntlLocale(class {}, () => {
      expect(resolveLocaleWeekStartsOn('fr-FR')).toBe(0);
    });
  });
});

describe('calendar grid helpers', () => {
  it('builds month grids and lets callers attach extra cell state', () => {
    const visibleMonth = adapter.createDate(2026, 4, 1);
    const cells = buildMonthGrid({
      activeDate: adapter.createDate(2026, 4, 15),
      adapter,
      createCellId: (date) => `cell-${dateKey(date)}`,
      fixedWeeks: true,
      focusStrategy: 'roving',
      focusedDate: null,
      getCellState: ({ date }) => ({ preview: adapter.getDate(date) === 16 }),
      inRange: () => false,
      isDisabled: () => false,
      isRangeEnd: () => false,
      isRangeStart: () => false,
      isSelected: (date) => adapter.getDate(date) === 15,
      showOutsideDays: false,
      today: adapter.createDate(2026, 4, 15),
      visibleMonth,
      weekStartsOn: 0,
    });

    expect(cells).toHaveLength(42);
    expect(cells.find((cell) => cell.selected)?.id).toBe('cell-05-15-2026');
    expect(cells.find((cell) => cell.preview)?.id).toBe('cell-05-16-2026');
    expect(cells[0].hidden).toBe(true);
  });

  it('can include or exclude range endpoints', () => {
    const range = {
      end: adapter.createDate(2026, 4, 15),
      start: adapter.createDate(2026, 4, 10),
    };

    expect(isDateInRange({ adapter, date: range.start, value: range })).toBe(true);
    expect(isDateInRange({
      adapter,
      date: range.start,
      includeEndpoints: false,
      value: range,
    })).toBe(false);
    expect(isDateInRange({
      adapter,
      date: adapter.createDate(2026, 4, 12),
      includeEndpoints: false,
      value: range,
    })).toBe(true);
  });
});
