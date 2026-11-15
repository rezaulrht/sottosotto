/**
 * The three motion modes (ARCHITECTURE §7.1, D33). One source for the media queries used
 * by the registry, the provider (Lenis) and CSS-only effects.
 */
export const MOTION_QUERIES = {
  desktop: '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  mobile: '((max-width: 1023px) or (pointer: coarse)) and (prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const;

export type MotionMode = keyof typeof MOTION_QUERIES;
