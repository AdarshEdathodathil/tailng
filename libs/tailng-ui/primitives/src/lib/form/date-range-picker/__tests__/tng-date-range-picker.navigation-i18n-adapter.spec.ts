import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TngDateAdapter, TngDateRangeValue } from '../date-range-picker.types';
import { defaultDateRangePickerDateAdapter } from '../tng-date-range-picker';
import {
  cleanupDom,
  collectEvents,
  createController,
  createOverlayMonthYearAdapter,
  dateKey,
} from './tng-date-range-picker.test-helpers';

function asRange(value: unknown): TngDateRangeValue<Date> {
  return value as TngDateRangeValue<Date>;
}

afterEach(() => {
  cleanupDom();
});

describe('tng-date-range-picker navigation, i18n, and adapter behavior', () => {
  it('navigates previous and next months and years across year boundaries', () => {
    const controller = createController();
    const events = collectEvents(controller);

    controller.setVisibleMonth('2024-01-01');
    controller.prevMonth();
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2023-12-01');

    controller.nextMonth();
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2024-01-01');

    controller.prevYear();
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2023-01-01');

    controller.nextYear();
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2024-01-01');

    expect(events.some((event) => event.type === 'monthChange')).toBe(true);
    expect(events.some((event) => event.type === 'yearChange')).toBe(true);
  });

  it('preserves selected range and popup state during month navigation without valueChange', () => {
    const controller = createController({
      value: {
        end: '2024-04-24',
        start: '2024-04-20',
      },
    });
    const events = collectEvents(controller);
    controller.open();

    controller.nextMonth();

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-04-20');
    expect(dateKey(range.end as Date)).toBe('2024-04-24');
    expect(controller.getOutputs().open).toBe(true);
    expect(events.filter((event) => event.type === 'valueChange')).toHaveLength(0);
  });

  it('preserves preview across month navigation when a partial range is active', () => {
    const controller = createController({
      value: {
        end: null,
        start: '2024-04-20',
      },
    });

    controller.handleCellPointerEnter('2024-04-24');
    controller.nextMonth();

    expect(dateKey(controller.getOutputs().previewEndDate as Date)).toBe('2024-05-20');
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2024-05-01');
  });

  it('updates calendar heading and active date after month navigation', () => {
    const controller = createController({
      adapter: createOverlayMonthYearAdapter(),
    });

    controller.setVisibleMonth('2024-04-01');
    expect(controller.getOutputs().labelMonthYear).toBe('04/2024');

    controller.nextMonth();
    expect(controller.getOutputs().labelMonthYear).toBe('05/2024');
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-05-18');
  });

  it('formats display value, accessible labels, and weekdays through configured locale or adapter', () => {
    const controller = createController({
      adapter: createOverlayMonthYearAdapter(),
      locale: 'fr-FR',
      value: {
        end: '2024-04-24',
        start: '2024-04-20',
      },
    });

    expect(controller.getOutputs().labelMonthYear).toBe('04/2024');
    expect(controller.getOutputs().weekdayLabels[0]).toBe('lun.');
    const startCell = controller
      .getOutputs()
      .cells.find((candidate) => dateKey(candidate.date) === '2024-04-20');
    expect(controller.getOutputs().getCellAttributes(startCell as NonNullable<typeof startCell>)['aria-label']).toContain(
      'selected start date',
    );
  });

  it('uses first-day-of-week configuration without changing the selected range', () => {
    const controller = createController({
      value: {
        end: '2024-04-24',
        start: '2024-04-20',
      },
      weekStartsOn: 1,
    });

    expect(dateKey(controller.getOutputs().cells[0]?.date as Date)).toBe('2024-04-01');

    controller.setConfig({
      weekStartsOn: 0,
    });

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-04-20');
    expect(dateKey(range.end as Date)).toBe('2024-04-24');
    expect(dateKey(controller.getOutputs().cells[0]?.date as Date)).toBe('2024-03-31');
  });

  it('uses adapter compare, createDate, and formatting hooks for range calculations', () => {
    const adapter: TngDateAdapter<Date> = {
      ...defaultDateRangePickerDateAdapter,
      compare: vi.fn(defaultDateRangePickerDateAdapter.compare),
      createDate: vi.fn(defaultDateRangePickerDateAdapter.createDate),
      format: vi.fn(defaultDateRangePickerDateAdapter.format),
    };
    const controller = createController({
      adapter,
    });

    controller.selectDate('2024-04-24');
    controller.selectDate('2024-04-20');
    const range = asRange(controller.getOutputs().value);

    expect(dateKey(range.start as Date)).toBe('2024-04-20');
    expect(dateKey(range.end as Date)).toBe('2024-04-24');
    expect(adapter.compare).toHaveBeenCalled();
    expect(adapter.createDate).toHaveBeenCalled();
    expect(adapter.format).toHaveBeenCalled();
  });

  it('normalizes time-of-day values and handles leap years with the adapter abstraction', () => {
    const controller = createController();

    controller.selectDate(new Date(2024, 1, 29, 23, 45));
    controller.selectDate(new Date(2024, 2, 1, 1, 15));

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-02-29');
    expect(dateKey(range.end as Date)).toBe('2024-03-01');
  });
});
