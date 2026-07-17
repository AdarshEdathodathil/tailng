import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TngFlowNodeComponent, resolveTngFlowStatusTone } from './tng-flow-node.component';

describe('TngFlowNodeComponent', () => {
  it('maps agent execution states to semantic tones', () => {
    expect(resolveTngFlowStatusTone('completed')).toBe('success');
    expect(resolveTngFlowStatusTone('failed')).toBe('danger');
    expect(resolveTngFlowStatusTone('running')).toBe('info');
    expect(resolveTngFlowStatusTone('awaiting-input')).toBe('warning');
    expect(resolveTngFlowStatusTone('custom')).toBe('neutral');
  });

  it('renders status, progress, and validation presentation', () => {
    const fixture = TestBed.createComponent(TngFlowNodeComponent);
    fixture.componentRef.setInput('name', 'Research agent');
    fixture.componentRef.setInput('description', 'Collect relevant sources.');
    fixture.componentRef.setInput('status', 'failed');
    fixture.componentRef.setInput('progress', 140);
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('message', 'Missing credentials');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const card = host.querySelector('tng-card');
    const header = host.querySelector<HTMLElement>('.tng-flow-node__header');
    const status = host.querySelector<HTMLElement>('.tng-flow-node__status');
    const progress = host.querySelector('tng-progress-bar');

    expect(card?.hasAttribute('data-invalid')).toBe(true);
    expect(header?.hasAttribute('data-has-icon')).toBe(false);
    expect(status?.textContent?.trim()).toBe('failed');
    expect(status?.getAttribute('data-tone')).toBe('danger');
    expect(progress).not.toBeNull();
    expect(host.textContent).toContain('Missing credentials');
  });
});
