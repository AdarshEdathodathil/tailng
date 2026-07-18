import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  TngCardActionsComponent,
  TngCardComponent,
  TngCardContentComponent,
  TngCardDescriptionComponent,
  TngCardDividerComponent,
  TngCardFooterComponent,
  TngCardHeaderComponent,
  TngCardLinkComponent,
  TngCardMediaComponent,
  TngCardTitleComponent,
} from './tng-card.component';

const specDirectory = dirname(fileURLToPath(import.meta.url));
const cardStyles = readFileSync(resolve(specDirectory, 'tng-card.component.css'), 'utf8');

describe('tng-card component', () => {
  it('exports all public card components', () => {
    expect(typeof TngCardComponent).toBe('function');
    expect(typeof TngCardHeaderComponent).toBe('function');
    expect(typeof TngCardTitleComponent).toBe('function');
    expect(typeof TngCardDescriptionComponent).toBe('function');
    expect(typeof TngCardContentComponent).toBe('function');
    expect(typeof TngCardFooterComponent).toBe('function');
    expect(typeof TngCardMediaComponent).toBe('function');
    expect(typeof TngCardActionsComponent).toBe('function');
    expect(typeof TngCardDividerComponent).toBe('function');
    expect(typeof TngCardLinkComponent).toBe('function');
  });

  it('lets the visual card surface inherit a consumer minimum height', () => {
    expect(cardStyles).toMatch(/\.tng-card\s*{[^}]*min-height:\s*inherit;/s);
    expect(cardStyles).toMatch(/\.tng-card\s*{[^}]*box-sizing:\s*border-box;/s);
  });
});
