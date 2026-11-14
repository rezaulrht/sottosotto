import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cssColors, cssDurations } from '@/lib/css-tokens';
import { bodyTextPairs, colors, contrastRatio, duration, easing } from '@/lib/tokens';

const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');

describe('tokens.css and tokens.ts agree', () => {
  it('colours', () => {
    expect(cssColors(css)).toEqual(colors);
  });

  it('durations (first, non-reduced-motion declaration)', () => {
    expect(cssDurations(css)).toEqual(duration);
  });

  it('easings', () => {
    for (const [name, value] of Object.entries({
      out: easing.out,
      'in-out': easing.inOut,
      in: easing.in,
    })) {
      expect(css).toContain(`--ease-${name}: ${value};`);
    }
  });
});

describe('contrast', () => {
  it('matches the DESIGN_SYSTEM table', () => {
    expect(contrastRatio(colors['bone-100'], colors['ink-900'])).toBeCloseTo(15.46, 1);
    expect(contrastRatio(colors['bone-500'], colors['ink-900'])).toBeCloseTo(5.28, 1);
    expect(contrastRatio(colors['bone-100'], colors['concrete-400'])).toBeLessThan(4.5);
  });

  it.each(bodyTextPairs)('%s on %s passes AA for body text', (fg, bg) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
