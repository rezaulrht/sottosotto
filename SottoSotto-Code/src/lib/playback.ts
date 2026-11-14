/**
 * When a background video may play (ARCHITECTURE §6.2, D37). Pure, so it is unit-tested.
 * Returns the reason to stay on the poster, or null when the video may play.
 */
export type PosterReason = 'reduced-motion' | 'save-data' | 'slow-connection';

export interface PlaybackEnv {
  reducedMotion: boolean;
  /** navigator.connection.saveData (Chromium only; undefined elsewhere). */
  saveData?: boolean;
  /** navigator.connection.effectiveType: 'slow-2g' | '2g' | '3g' | '4g' (Chromium only). */
  effectiveType?: string;
}

const SLOW = new Set(['slow-2g', '2g', '3g']);

export function posterReason(env: PlaybackEnv): PosterReason | null {
  if (env.reducedMotion) return 'reduced-motion';
  if (env.saveData) return 'save-data';
  if (env.effectiveType && SLOW.has(env.effectiveType)) return 'slow-connection';
  return null;
}

/** Phones and small windows get the 720p files; larger screens the biggest available. */
export const SMALL_SCREEN_MAX = 1023;

export function pickHeight(available: number[], viewportWidth: number): number {
  const sorted = [...available].sort((a, b) => b - a);
  if (!sorted.length) throw new Error('No video sources');
  if (viewportWidth > SMALL_SCREEN_MAX) return sorted[0]!;
  return sorted.find((h) => h <= 720) ?? sorted.at(-1)!;
}
