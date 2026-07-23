import { describe, expect, it } from 'vitest';
import { tooltipRegistryItem } from './tooltip.registry';

describe('tooltip registry item', () => {
  it('contains expected metadata', () => {
    expect(tooltipRegistryItem.name).toBe('tooltip');
    expect(tooltipRegistryItem.dependencies).toEqual([]);
    expect(tooltipRegistryItem.files).toHaveLength(5);
  });

  it('generates local tooltip source files', () => {
    const componentFile = tooltipRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/tooltip/tng-tooltip.ts'),
    );
    expect(componentFile).toBeDefined();
    expect(componentFile?.content).toContain("selector: 'tng-tooltip'");
    expect(componentFile?.content).toContain('normalizeTngTooltipDelay');
    expect(componentFile?.content).toContain("from './tng-tooltip-primitive';");

    const primitiveFile = tooltipRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/tooltip/tng-tooltip-primitive.ts'),
    );
    expect(primitiveFile).toBeDefined();
    expect(primitiveFile?.content).toContain("selector: '[tngTooltipTrigger]'");
    expect(primitiveFile?.content).toContain('createTooltipId');
  });

  it('generates tooltip CSS with the themed overlay z-index chain', () => {
    const cssFile = tooltipRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/tooltip/tng-tooltip.css'),
    );

    expect(cssFile).toBeDefined();
    expect(cssFile?.content).toContain(
      'z-index: var(--tng-tooltip-z-overlay, var(--tng-tooltip-overlay-z-index, var(--tng-z-overlay, 20)));',
    );
  });
});
