import { describe, expect, it } from 'vitest';
import { menuRegistryItem } from './menu.registry';

describe('menu registry item', () => {
  it('contains expected metadata', () => {
    expect(menuRegistryItem.name).toBe('menu');
    expect(menuRegistryItem.dependencies).toEqual([]);
    expect(menuRegistryItem.files).toHaveLength(7);
  });

  it('generates local menu source files', () => {
    const menuFile = menuRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/menu/tng-menu.ts'),
    );
    expect(menuFile).toBeDefined();
    expect(menuFile?.content).toContain("selector: 'tng-menu'");

    const primitiveFile = menuRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/menu/tng-menu-primitive.ts'),
    );
    expect(primitiveFile).toBeDefined();
    expect(primitiveFile?.content).toContain("selector: '[tngMenu]'");

    const triggerFile = menuRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/menu/tng-menu-trigger-for.ts'),
    );
    expect(triggerFile).toBeDefined();
    expect(triggerFile?.content).toContain("selector: '[tngMenuTriggerFor]'");
    expect(triggerFile?.content).toContain('TNG_TRIGGER_TARGET');
    expect(triggerFile?.content).not.toContain("dataSlot: 'menu-trigger'");
    expect(triggerFile?.content).not.toContain("setOrRemoveAttribute(trigger, 'data-slot'");
    expect(triggerFile?.content).toContain('setTngTriggerAttributes');
    expect(triggerFile?.content).toContain('ensureTriggerId');
    expect(triggerFile?.content).toContain('createMenuTriggerId');

    const triggerTargetFile = menuRegistryItem.files.find((file) =>
      file.path.endsWith('tailng-ui/tng-trigger-target.ts'),
    );
    expect(triggerTargetFile).toBeDefined();
    expect(triggerTargetFile?.content).toContain('export const TNG_TRIGGER_TARGET');
    expect(triggerTargetFile?.content).not.toContain('dataSlot');
  });
});
