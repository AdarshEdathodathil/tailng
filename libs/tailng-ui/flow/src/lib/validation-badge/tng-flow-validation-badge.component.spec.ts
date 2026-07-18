import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { TngFlowValidationBadgeComponent } from './tng-flow-validation-badge.component';

describe('TngFlowValidationBadgeComponent', () => {
  it('announces issue counts and emits a selected issue', () => {
    const fixture = TestBed.createComponent(TngFlowValidationBadgeComponent);
    const issues = [
      {
        id: 'first',
        code: 'required',
        severity: 'error' as const,
        message: 'A value is required.',
        target: { kind: 'flow' as const },
      },
      {
        id: 'second',
        code: 'review',
        severity: 'warning' as const,
        message: 'Review this value.',
        target: { kind: 'flow' as const },
      },
    ];
    const activated = vi.fn();
    fixture.componentRef.setInput('issues', issues);
    fixture.componentInstance.issueActivated.subscribe(activated);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-severity')).toBe('error');
    expect(host.querySelector('summary')?.getAttribute('aria-label')).toContain(
      '1 validation error',
    );
    expect(host.querySelector('.tng-flow-validation-badge__count')?.textContent).toContain('2');

    host.querySelector<HTMLButtonElement>('.tng-flow-validation-badge__issue')?.click();
    expect(activated).toHaveBeenCalledWith(issues[0]);
  });
});
