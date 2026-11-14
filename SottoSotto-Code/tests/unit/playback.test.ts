import { describe, expect, it } from 'vitest';
import { pickHeight, posterReason } from '@/lib/playback';

describe('posterReason (ARCHITECTURE §6.2)', () => {
  it('plays on a normal connection with motion allowed', () => {
    expect(posterReason({ reducedMotion: false })).toBeNull();
    expect(posterReason({ reducedMotion: false, saveData: false, effectiveType: '4g' })).toBeNull();
  });

  it('keeps the poster under reduced motion, whatever the connection', () => {
    expect(posterReason({ reducedMotion: true, effectiveType: '4g' })).toBe('reduced-motion');
  });

  it('keeps the poster with Save-Data on', () => {
    expect(posterReason({ reducedMotion: false, saveData: true, effectiveType: '4g' })).toBe(
      'save-data',
    );
  });

  it.each(['slow-2g', '2g', '3g'])('keeps the poster on %s', (effectiveType) => {
    expect(posterReason({ reducedMotion: false, effectiveType })).toBe('slow-connection');
  });
});

describe('pickHeight', () => {
  it('gives large screens the biggest file and small screens 720p', () => {
    expect(pickHeight([720, 1080], 1440)).toBe(1080);
    expect(pickHeight([1080, 720], 1024)).toBe(1080);
    expect(pickHeight([1080, 720], 1023)).toBe(720);
    expect(pickHeight([1080, 720], 390)).toBe(720);
  });

  it('falls back to the smallest file when there is no 720p', () => {
    expect(pickHeight([1080], 390)).toBe(1080);
  });
});
