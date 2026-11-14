import { describe, expect, it } from 'vitest';
import allergenData from '../../data/allergens.json';
import { allergenSets, isEmptySet, type AllergenItem } from '@/lib/allergens';

const categories = allergenData.categories;

describe('allergenSets (PAGES.md Allergens, D20, D21)', () => {
  it('splits "contains" and "can be made without", in the client category order', () => {
    const item: AllergenItem = {
      allergenSource: 'client',
      allergens: [
        { name: 'Lactose', canBeOmitted: false },
        { name: 'Garlic/Onion', canBeOmitted: true },
        { name: 'Gluten', canBeOmitted: false },
        { name: 'Celery', canBeOmitted: true },
      ],
    };
    expect(allergenSets(item, categories)).toEqual([
      { label: null, contains: ['Gluten', 'Lactose'], canBeOmitted: ['Celery', 'Garlic/Onion'] },
    ]);
  });

  it('shows nothing when there is no data — never "none"', () => {
    expect(allergenSets({ allergenSource: null, allergens: null }, categories)).toBeNull();
  });

  it('shows nothing for estimated values (Q29)', () => {
    const item: AllergenItem = {
      allergenSource: 'estimated',
      allergens: [{ name: 'Citrus', canBeOmitted: false }],
    };
    expect(allergenSets(item, categories)).toBeNull();
  });

  it('keeps an empty client list as an empty set (worded by Q35)', () => {
    const sets = allergenSets({ allergenSource: 'client', allergens: [] }, categories);
    expect(sets).toHaveLength(1);
    expect(isEmptySet(sets![0]!)).toBe(true);
  });

  it('returns one labelled set per variant (Gelato / Sorbetto)', () => {
    const item: AllergenItem = {
      allergenSource: 'client',
      allergens: null,
      allergenVariants: [
        { label: 'Gelato', allergens: [{ name: 'Lactose', canBeOmitted: false }] },
        { label: 'Sorbetto', allergens: [] },
      ],
    };
    const sets = allergenSets(item, categories)!;
    expect(sets.map((s) => s.label)).toEqual(['Gelato', 'Sorbetto']);
    expect(sets[0]!.contains).toEqual(['Lactose']);
    expect(isEmptySet(sets[1]!)).toBe(true);
  });

  it('does not mutate the source data', () => {
    const allergens = [
      { name: 'Lactose', canBeOmitted: false },
      { name: 'Gluten', canBeOmitted: false },
    ];
    allergenSets({ allergenSource: 'client', allergens }, categories);
    expect(allergens.map((a) => a.name)).toEqual(['Lactose', 'Gluten']);
  });
});
