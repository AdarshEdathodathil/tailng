import { describe, expect, it } from 'vitest';
import { buttonRegistryItem } from './button.registry';

describe('button registry item', () => {
  it('contains expected metadata', () => {
    expect(buttonRegistryItem.name).toBe('button');
    expect(buttonRegistryItem.dependencies).toEqual([]);
    expect(buttonRegistryItem.files).toHaveLength(6);
  });

  it('generates local button source files', () => {
    const tsFile = buttonRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/button/tng-button.ts'),
    );
    expect(tsFile).toBeDefined();
    expect(tsFile?.content).toContain("from './tng-press-primitive';");
    expect(tsFile?.content).toContain('coerceTngPressAriaHasPopup');
    expect(tsFile?.content).toContain('coerceTngPressNullableBoolean');
    expect(tsFile?.content).toContain('TNG_TRIGGER_TARGET');
    expect(tsFile?.content).toContain('getTngTriggerElement');
    expect(tsFile?.content).toContain("selector: 'tng-button'");
    expect(tsFile?.content).not.toContain('triggerDataSlot');

    const triggerTargetFile = buttonRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/tng-trigger-target.ts'),
    );
    expect(triggerTargetFile).toBeDefined();
    expect(triggerTargetFile?.content).toContain('export const TNG_TRIGGER_TARGET');
    expect(triggerTargetFile?.content).not.toContain('dataSlot');

    const primitiveFile = buttonRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/button/tng-press-primitive.ts'),
    );
    expect(primitiveFile).toBeDefined();
    expect(primitiveFile?.content).toContain('export class TngPressPrimitive');

    const indexFile = buttonRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/button/index.ts'),
    );
    expect(indexFile).toBeDefined();
    expect(indexFile?.content).toContain("export * from './tng-button';");
  });
});
