import { describe, expect, it } from 'vitest';
import { rawFiles } from '@/content/raw';
import { countByReason, flaggedValues, flagsInFile } from '@/content/report';

describe('mock guard report', () => {
  it('finds every kind of flag, with paths and labels', () => {
    const flags = flagsInFile('x.json', {
      address: { mock: true, line1: 'A' },
      contact: { toConfirm: true },
      fact: { needsVerification: true },
      parking: [{ name: 'P', addressMissing: true }],
      social: [{ platform: 'facebook', confirmed: false, mock: true }],
      drinks: [{ items: [{ id: 'bellini', allergenSource: 'estimated' }] }],
      ok: { mock: false, confirmed: true, allergenSource: 'client' },
      _notes: { mock: true },
    });
    expect(flags).toEqual([
      { file: 'x.json', path: 'address', reasons: ['mock'] },
      { file: 'x.json', path: 'contact', reasons: ['toConfirm'] },
      { file: 'x.json', path: 'fact', reasons: ['needsVerification'] },
      { file: 'x.json', path: 'parking[0]', reasons: ['addressMissing'], label: 'P' },
      { file: 'x.json', path: 'social[0]', reasons: ['mock', 'unconfirmed'], label: 'facebook' },
      {
        file: 'x.json',
        path: 'drinks[0].items[0]',
        reasons: ['estimatedAllergens'],
        label: 'bellini',
      },
    ]);
  });

  it('flags the known placeholders in the real data', () => {
    const flags = flaggedValues(rawFiles);
    const paths = flags.map((f) => `${f.file}:${f.path}`);
    expect(paths).toEqual(
      expect.arrayContaining([
        'site.json:address',
        'site.json:geo',
        'site.json:contact',
        'site.json:parking[2]',
        'venue.json:setting.fact',
        'venue.json:story',
        'seo.json:pages.home',
      ]),
    );
    // The three estimated bar allergen sets (D22).
    expect(countByReason(flags).estimatedAllergens).toBe(3);
  });
});
