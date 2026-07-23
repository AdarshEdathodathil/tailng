import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tooltipContractCss = readFileSync(
  join(process.cwd(), 'libs/tailng-ui/theme/src/lib/component-contracts/utility/tooltip.css'),
  'utf8',
);

describe('tooltip theme contract', () => {
  it('defines the overlay z-index token chain', () => {
    expect(tooltipContractCss).toContain(
      '--tng-tooltip-z-overlay:        var(--tng-tooltip-overlay-z-index, var(--tng-z-overlay, 20));',
    );
  });
});
