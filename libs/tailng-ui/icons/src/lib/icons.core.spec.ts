import { describe, expect, it, vi } from 'vitest';
import {
  TngIconResolver,
  createTngIconPack,
  resolveTngIconConfig,
  type TngIconLoader,
} from './icons.core';

describe('core icon configuration', () => {
  it('requires applications to register at least the default pack', () => {
    expect(() => resolveTngIconConfig({ packs: [] })).toThrow('Unknown defaultPack');
  });

  it('allows lucide to be explicitly registered without an override flag', async () => {
    const config = resolveTngIconConfig({
      packs: [
        createTngIconPack('lucide', {
          search: '<svg id="search"/>',
        }),
      ],
    });
    const resolver = new TngIconResolver(config);

    expect(config.defaultPack).toBe('lucide');
    expect(await resolver.loadIcon('search')).toBe('<svg id="search"/>');
  });

  it('normalizes direct SVG strings while preserving async loaders', async () => {
    const asyncLoader = vi.fn<TngIconLoader>(() => Promise.resolve('<svg id="async"/>'));
    const config = resolveTngIconConfig({
      defaultPack: 'admin',
      packs: [
        createTngIconPack('admin', {
          direct: '<svg id="direct"/>',
          lazy: asyncLoader,
        }),
      ],
    });
    const resolver = new TngIconResolver(config);

    expect(await resolver.loadIcon('direct')).toBe('<svg id="direct"/>');
    expect(await resolver.loadIcon('lazy')).toBe('<svg id="async"/>');
    expect(await resolver.loadIcon('lazy')).toBe('<svg id="async"/>');
    expect(asyncLoader).toHaveBeenCalledTimes(1);
  });
});
