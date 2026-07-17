import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TngFlowPortComponent } from './tng-flow-port.component';

describe('TngFlowPortComponent', () => {
  it('renders direction, kind, label, required, and disabled state', () => {
    const fixture = TestBed.createComponent(TngFlowPortComponent);
    fixture.componentRef.setInput('direction', 'input');
    fixture.componentRef.setInput('kind', 'error');
    fixture.componentRef.setInput('label', 'Failure');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-direction')).toBe('input');
    expect(host.getAttribute('data-kind')).toBe('error');
    expect(host.hasAttribute('data-disabled')).toBe(true);
    expect(host.querySelector('.tng-flow-port__label')?.textContent).toContain('Failure');
    expect(host.querySelector('.tng-flow-port__required')).not.toBeNull();
  });
});
