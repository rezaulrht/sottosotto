/**
 * Token values that JavaScript needs (GSAP easing, durations, breakpoints).
 * Must match src/styles/tokens.css — tests/unit/tokens.test.ts checks it.
 */
export const colors = {
  'ink-950': '#0c0b0a',
  'ink-900': '#121110',
  'ink-800': '#1b1a18',
  'ink-700': '#262422',
  'concrete-600': '#3b3936',
  'concrete-500': '#55524d',
  'concrete-400': '#6e6a64',
  'concrete-300': '#a39f97',
  'bone-100': '#ede8df',
  'bone-300': '#b9b3a8',
  'bone-500': '#8c877e',
  'amber-500': '#e3a54b',
  'amber-300': '#f2c985',
  'amber-700': '#8a5a1c',
} as const;

export type ColorToken = keyof typeof colors;

export const easing = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  in: 'cubic-bezier(0.5, 0, 0.75, 0)',
} as const;

/** Durations in milliseconds. */
export const duration = {
  micro: 150,
  hover: 300,
  base: 600,
  slow: 1000,
} as const;

/** Breakpoints in px (DESIGN_SYSTEM §3). */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Contrast pairs that must pass WCAG AA for body text (4.5:1).
 * Checked by scripts/check-contrast.ts.
 */
export const bodyTextPairs: ReadonlyArray<[ColorToken, ColorToken]> = [
  ['bone-100', 'ink-950'],
  ['bone-100', 'ink-900'],
  ['bone-100', 'ink-800'],
  ['bone-100', 'ink-700'],
  ['bone-100', 'concrete-600'],
  ['bone-100', 'concrete-500'],
  ['bone-300', 'ink-900'],
  ['bone-300', 'ink-800'],
  ['bone-300', 'ink-700'],
  ['bone-300', 'concrete-600'],
  ['bone-500', 'ink-900'],
  ['bone-500', 'ink-800'],
  ['amber-500', 'ink-900'],
  ['amber-500', 'ink-800'],
  ['amber-500', 'ink-700'],
  ['amber-500', 'concrete-600'],
  ['ink-900', 'amber-500'],
  ['amber-300', 'ink-800'],
  ['ink-800', 'concrete-300'],
  ['amber-700', 'bone-100'],
];

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two hex colours. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
