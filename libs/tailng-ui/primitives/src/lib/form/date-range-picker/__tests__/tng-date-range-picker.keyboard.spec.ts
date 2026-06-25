import { afterEach, describe, expect, it } from 'vitest';
import type { TngDateRangePickerController } from '../date-range-picker.types';
import type { TngDateRangeValue } from '../tng-date-range-picker';
import {
  cleanupDom,
  collectEvents,
  createController,
  d,
  dateKey,
  keyboardEvent,
} from './tng-date-range-picker.test-helpers';

function asRange(value: unknown): TngDateRangeValue<Date> {
  return value as TngDateRangeValue<Date>;
}

const constrainedBeyondMaxConfig = {
  max: '2025-03-31',
  min: '2024-04-01',
  today: d('2026-06-24'),
  value: null,
  yearPageSize: 24,
} as const;

function getActiveYear(controller: TngDateRangePickerController<Date>): number | undefined {
  return controller.getOutputs().yearOptions.find((option) => option.active)?.year;
}

function getActiveMonthLabel(
  controller: TngDateRangePickerController<Date>,
): string | undefined {
  return controller.getOutputs().monthOptions.find((option) => option.active)?.label;
}

function navigateYearGridTo(
  controller: TngDateRangePickerController<Date>,
  targetYear: number,
): void {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (getActiveYear(controller) === targetYear) {
      return;
    }

    const activeYear = getActiveYear(controller);
    if (activeYear === undefined) {
      throw new Error('Expected an active year option while navigating the year grid.');
    }

    controller.handleYearGridKeyDown(
      keyboardEvent(targetYear < activeYear ? 'ArrowUp' : 'ArrowDown'),
    );
  }

  throw new Error(`Could not navigate the year grid to ${targetYear}.`);
}

function navigateMonthGridTo(
  controller: TngDateRangePickerController<Date>,
  targetLabel: string,
): void {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (getActiveMonthLabel(controller) === targetLabel) {
      return;
    }

    const activeLabel = getActiveMonthLabel(controller);
    if (activeLabel === undefined) {
      throw new Error('Expected an active month option while navigating the month grid.');
    }

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeIndex = monthOrder.indexOf(activeLabel);
    const targetIndex = monthOrder.indexOf(targetLabel);
    if (activeIndex === -1 || targetIndex === -1) {
      throw new Error(`Unknown month label while navigating: ${activeLabel} -> ${targetLabel}`);
    }

    controller.handleMonthGridKeyDown(
      keyboardEvent(targetIndex < activeIndex ? 'ArrowLeft' : 'ArrowRight'),
    );
  }

  throw new Error(`Could not navigate the month grid to ${targetLabel}.`);
}

function navigateDayGridTo(
  controller: TngDateRangePickerController<Date>,
  targetDate: string,
): void {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (dateKey(controller.getOutputs().activeDate) === targetDate) {
      return;
    }

    const activeDate = controller.getOutputs().activeDate;
    const activeKey = dateKey(activeDate);
    const activeTime = activeDate.getTime();
    const targetTime = d(targetDate).getTime();

    if (targetTime < activeTime) {
      controller.handleGridKeyDown(keyboardEvent('ArrowLeft'));
      continue;
    }

    if (targetTime > activeTime) {
      controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
      continue;
    }

    throw new Error(`Could not navigate the day grid from ${activeKey} to ${targetDate}.`);
  }

  throw new Error(`Could not navigate the day grid to ${targetDate}.`);
}

afterEach(() => {
  cleanupDom();
});

describe('tng-date-range-picker keyboard support', () => {
  it('opens from the trigger with Enter and closes the grid with Escape', () => {
    const controller = createController();
    const openEvent = keyboardEvent('Enter');
    controller.handleTriggerKeyDown(openEvent);

    expect(openEvent.preventDefault).toHaveBeenCalled();
    expect(controller.getOutputs().open).toBe(true);

    const closeEvent = keyboardEvent('Escape');
    controller.handleGridKeyDown(closeEvent);

    expect(closeEvent.preventDefault).toHaveBeenCalled();
    expect(controller.getOutputs().open).toBe(false);
  });

  it('selects start and end dates with Enter', () => {
    const controller = createController();

    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent('Enter'));
    controller.setActiveDate('2024-04-24');
    controller.handleGridKeyDown(keyboardEvent('Enter'));

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-04-20');
    expect(dateKey(range.end as Date)).toBe('2024-04-24');
  });

  it('updates preview range while keyboard focus moves after selecting a start date', () => {
    const controller = createController();

    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent('Enter'));
    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));

    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-22');
    expect(dateKey(controller.getOutputs().previewEndDate as Date)).toBe('2024-04-22');
  });

  it('supports reverse keyboard selection', () => {
    const controller = createController();

    controller.setActiveDate('2024-04-24');
    controller.handleGridKeyDown(keyboardEvent('Enter'));
    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent(' '));

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-04-20');
    expect(dateKey(range.end as Date)).toBe('2024-04-24');
  });

  it('opens from the trigger with Space and lets Tab move naturally', () => {
    const controller = createController();
    const spaceEvent = keyboardEvent(' ');
    controller.handleTriggerKeyDown(spaceEvent);

    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(controller.getOutputs().open).toBe(true);

    const tabEvent = keyboardEvent('Tab');
    controller.handleGridKeyDown(tabEvent);
    expect(tabEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('starts a new range with keyboard when range is already complete', () => {
    const controller = createController({
      value: {
        end: '2024-04-24',
        start: '2024-04-20',
      },
    });

    controller.setActiveDate('2024-04-28');
    controller.handleGridKeyDown(keyboardEvent('Enter'));

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-04-28');
    expect(range.end).toBeNull();
  });

  it('moves active focus by day, week, month, and year keyboard commands', () => {
    const controller = createController();

    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent('ArrowLeft'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-19');

    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-20');

    controller.handleGridKeyDown(keyboardEvent('ArrowUp'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-13');

    controller.handleGridKeyDown(keyboardEvent('ArrowDown'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-20');

    controller.handleGridKeyDown(keyboardEvent('PageUp'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-03-20');

    controller.handleGridKeyDown(keyboardEvent('PageDown'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-20');

    controller.handleGridKeyDown(keyboardEvent('PageUp', { shiftKey: true }));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2023-04-20');

    controller.handleGridKeyDown(keyboardEvent('PageDown', { shiftKey: true }));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-20');
  });

  it('uses RTL horizontal navigation when configured', () => {
    const controller = createController({
      direction: 'rtl',
    });

    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent('ArrowLeft'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-21');

    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-20');
  });

  it('moves to week boundaries with Home and End', () => {
    const controller = createController();

    controller.setActiveDate('2024-04-24');
    controller.handleGridKeyDown(keyboardEvent('Home'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-21');

    controller.handleGridKeyDown(keyboardEvent('End'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-27');
  });

  it('updates visible month and keeps preview across keyboard month navigation', () => {
    const controller = createController();

    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent('Enter'));
    controller.handleGridKeyDown(keyboardEvent('PageDown'));

    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-05-20');
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2024-05-01');
    expect(dateKey(controller.getOutputs().previewEndDate as Date)).toBe('2024-05-20');
  });

  it('does not emit valueChange from focus movement alone and tolerates unknown keys', () => {
    const controller = createController();
    const events = collectEvents(controller);

    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
    controller.handleGridKeyDown(keyboardEvent('Unidentified'));

    expect(events.filter((event) => event.type === 'valueChange')).toHaveLength(0);
  });

  it('skips disabled dates and clamps keyboard navigation to min and max', () => {
    const controller = createController({
      disableDate: (date) => dateKey(date) === '2024-04-21',
      max: '2024-04-24',
      min: '2024-04-20',
    });

    controller.setActiveDate('2024-04-20');
    controller.handleGridKeyDown(keyboardEvent('ArrowLeft'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-20');

    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-22');

    controller.setActiveDate('2024-04-24');
    controller.handleGridKeyDown(keyboardEvent('ArrowRight'));
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-24');
  });

  it('anchors to maxDate when today is beyond maxDate', () => {
    const controller = createController(constrainedBeyondMaxConfig);

    controller.open();

    expect(dateKey(controller.getOutputs().activeDate)).toBe('2025-03-31');
    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2025-03-01');

    controller.showYearsPanel();
    controller.setFocusedSection('year');

    expect(getActiveYear(controller)).toBe(2025);

    navigateYearGridTo(controller, 2024);
    controller.handleYearGridKeyDown(keyboardEvent('Enter'));
    controller.setFocusedSection('month');

    const monthOptions = controller.getOutputs().monthOptions;
    expect(monthOptions.find((option) => option.label === 'Mar')?.disabled).toBe(true);
    expect(monthOptions.find((option) => option.label === 'Apr')?.disabled).toBe(false);
    expect(getActiveMonthLabel(controller)).toBe('Apr');
  });

  it('keeps month-grid focus on enabled April after selecting a bounded 2024 year', () => {
    const controller = createController({
      max: '2025-03-31',
      min: '2024-04-01',
      today: d('2025-03-31'),
      value: null,
      yearPageSize: 24,
    });

    controller.open();
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2025-03-31');

    controller.showYearsPanel();
    controller.setFocusedSection('year');

    navigateYearGridTo(controller, 2024);
    controller.handleYearGridKeyDown(keyboardEvent('Enter'));
    controller.setFocusedSection('month');

    let activeMonth = controller.getOutputs().monthOptions.find((option) => option.active);
    expect(activeMonth?.label).toBe('Apr');
    expect(activeMonth?.disabled).toBe(false);
    expect(
      controller.getOutputs().monthOptions.find((option) => option.label === 'Mar')?.disabled,
    ).toBe(true);

    controller.handleMonthGridKeyDown(keyboardEvent('ArrowLeft'));
    activeMonth = controller.getOutputs().monthOptions.find((option) => option.active);
    expect(activeMonth?.label).toBe('Apr');
    expect(activeMonth?.disabled).toBe(false);
  });

  it('keeps month-grid focus on enabled March after selecting bounded 2025 from April 2024', () => {
    const controller = createController({
      max: '2025-03-31',
      min: '2024-04-01',
      today: d('2024-04-18'),
      value: {
        end: '2024-04-24',
        start: '2024-04-22',
      },
      yearPageSize: 24,
    });

    controller.open();
    expect(dateKey(controller.getOutputs().activeDate)).toBe('2024-04-24');

    controller.showYearsPanel();
    controller.setFocusedSection('year');
    expect(getActiveYear(controller)).toBe(2024);

    controller.handleYearGridKeyDown(keyboardEvent('ArrowRight'));
    expect(getActiveYear(controller)).toBe(2025);

    controller.handleYearGridKeyDown(keyboardEvent('Enter'));
    controller.setFocusedSection('month');

    let activeMonth = controller.getOutputs().monthOptions.find((option) => option.active);
    expect(activeMonth?.label).toBe('Mar');
    expect(activeMonth?.disabled).toBe(false);
    expect(
      controller.getOutputs().monthOptions.find((option) => option.label === 'Apr')?.disabled,
    ).toBe(true);

    controller.handleMonthGridKeyDown(keyboardEvent('ArrowLeft'));
    activeMonth = controller.getOutputs().monthOptions.find((option) => option.active);
    expect(activeMonth?.label).toBe('Feb');
    expect(activeMonth?.disabled).toBe(false);
  });

  it('selects an earlier in-range month range by keyboard when today exceeds maxDate', () => {
    const controller = createController({
      ...constrainedBeyondMaxConfig,
      closeOnSelect: false,
    });

    controller.handleTriggerKeyDown(keyboardEvent('Enter'));
    expect(controller.getOutputs().open).toBe(true);

    controller.showYearsPanel();
    controller.setFocusedSection('year');

    navigateYearGridTo(controller, 2024);
    controller.handleYearGridKeyDown(keyboardEvent('Enter'));
    controller.setFocusedSection('month');

    navigateMonthGridTo(controller, 'Apr');
    controller.handleMonthGridKeyDown(keyboardEvent('Enter'));

    expect(dateKey(controller.getOutputs().visibleMonth)).toBe('2024-04-01');

    navigateDayGridTo(controller, '2024-04-01');
    controller.handleGridKeyDown(keyboardEvent('Enter'));

    navigateDayGridTo(controller, '2024-04-30');
    controller.handleGridKeyDown(keyboardEvent('Enter'));

    const range = asRange(controller.getOutputs().value);
    expect(dateKey(range.start as Date)).toBe('2024-04-01');
    expect(dateKey(range.end as Date)).toBe('2024-04-30');
  });
});
