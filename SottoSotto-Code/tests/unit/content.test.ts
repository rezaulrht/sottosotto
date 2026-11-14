import { describe, expect, it } from 'vitest';
import { rawFiles, type RawFiles } from '@/content/raw';
import { ContentError, stripNotes, validateContent } from '@/content/validate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mutable = Record<string, any>;

/** A deep copy of the real data with one change applied. */
function withChange(mutate: (raw: Mutable) => void): RawFiles {
  const copy = structuredClone(rawFiles) as unknown as Mutable;
  mutate(copy);
  return copy as RawFiles;
}

function issuesFor(raw: RawFiles): string[] {
  try {
    validateContent(raw);
  } catch (error) {
    expect(error).toBeInstanceOf(ContentError);
    return (error as ContentError).issues.map((i) => `${i.file} → ${i.path}: ${i.message}`);
  }
  return [];
}

describe('real data', () => {
  it('validates', () => {
    const content = validateContent(rawFiles);
    expect(content.menu.sections.length).toBeGreaterThan(0);
    expect(content.allergens.categories).toHaveLength(14);
  });

  it('tags drink sections with their shape', () => {
    const { wine } = validateContent(rawFiles);
    const shapes = Object.fromEntries(wine.drinks.map((d) => [d.id, d.shape]));
    expect(shapes).toMatchObject({
      martinis: 'uniformPrice',
      'beer-cider': 'price',
      spirits: 'priceColumns',
      liqueurs: 'priceColumns',
    });
  });

  it('has a generated image for every dish that names one', () => {
    const { menu, desserts, manifest } = validateContent(rawFiles);
    for (const item of [...menu.sections, ...desserts.sections].flatMap((s) => s.items)) {
      if (item.image) expect(manifest[item.id]?.source).toBe(item.image);
    }
  });
});

describe('broken data fails with a readable message', () => {
  it('wrong type', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['menu.json'].sections[0].items[0].price = '12.95';
      }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/^menu\.json → sections\[0\]\.items\[0\]\.price: .*number/i);
  });

  it('more than 2 decimals in a price', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['desserts.json'].sections[0].items[0].price = 9.755;
      }),
    );
    expect(issues.join('\n')).toMatch(/price: At most 2 decimals/);
  });

  it('unknown allergen', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['menu.json'].sections[0].items[0].allergens[0].name = 'Peanuts';
      }),
    );
    expect(issues).toEqual([
      expect.stringMatching(
        /^menu\.json → sections\[0\]\.items\[0\]\.allergens\[0\]\.name: Unknown allergen "Peanuts"/,
      ),
    ]);
  });

  it('unknown allergen in a bar item', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['wine.json'].drinks[0].items[0].allergens[0].name = 'Sulphites';
      }),
    );
    expect(issues.join('\n')).toMatch(
      /wine\.json → drinks\[0\]\.items\[0\]\.allergens\[0\]\.name: Unknown allergen "Sulphites"/,
    );
  });

  it('missing image key', () => {
    const issues = issuesFor(
      withChange((raw) => {
        delete raw['image-manifest.json']['tiramisu'];
      }),
    );
    expect(issues.join('\n')).toMatch(
      /desserts\.json → .*\.image: No generated image for "tiramisu"/,
    );
  });

  it('image changed in the data but not regenerated', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['desserts.json'].sections[0].items[2].image = 'Another Photo.png';
      }),
    );
    expect(issues.join('\n')).toMatch(
      /Image manifest has ".*" for "tiramisu" but the data says "Another Photo\.png"/,
    );
  });

  it('misspelt key (strict objects)', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['site.json'].contact.emial = 'x@example.com';
      }),
    );
    expect(issues.join('\n')).toMatch(/site\.json → contact: .*emial/);
  });

  it('allergenSource null with allergen data', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['menu.json'].sections[0].items[0].allergenSource = null;
      }),
    );
    expect(issues.join('\n')).toMatch(
      /allergenSource: allergenSource: null requires allergens: null/,
    );
  });

  it('duplicate dish id across menu and desserts', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['desserts.json'].sections[0].items[0].id = raw['menu.json'].sections[0].items[0].id;
      }),
    );
    expect(issues.join('\n')).toMatch(/Duplicate dish id "bruschetta-ai-gamberoni"/);
  });

  it('bar price column that does not exist', () => {
    const issues = issuesFor(
      withChange((raw) => {
        const liqueurs = raw['wine.json'].drinks.find((d: Mutable) => d.id === 'liqueurs');
        liqueurs.items[0].prices['35ml'] = 6;
      }),
    );
    expect(issues.join('\n')).toMatch(/Unknown price column "35ml"/);
  });

  it('hours: close before open', () => {
    const issues = issuesFor(
      withChange((raw) => {
        raw['site.json'].hours.weekly.tuesday[0] = { open: '14:00', close: '12:00' };
      }),
    );
    expect(issues.join('\n')).toMatch(
      /site\.json → hours\.weekly\.tuesday\[0\]: close must be after open/,
    );
  });
});

describe('stripNotes', () => {
  it('removes `_` keys at any depth', () => {
    expect(stripNotes({ a: 1, _note: 'x', b: [{ _c: 1, d: 2 }] })).toEqual({ a: 1, b: [{ d: 2 }] });
  });
});
