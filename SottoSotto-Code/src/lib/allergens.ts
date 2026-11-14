/**
 * What the allergen toggle shows for one item (PAGES.md "Allergens", D20, D21).
 *
 * - Only the client's data is shown: `allergenSource` must be "client". Estimated values
 *   (Q29) and missing data (`allergens: null`) show nothing — never "none".
 * - Names are ordered as in allergens.json `categories`.
 * - An empty set means the client's form lists none of their allergens for the item; the
 *   wording for that ("None of our listed allergens") is a proposal (Q35).
 */
export interface AllergenEntry {
  name: string;
  canBeOmitted: boolean;
}

export interface AllergenItem {
  allergens: AllergenEntry[] | null;
  allergenSource: 'client' | 'estimated' | null;
  allergenVariants?: Array<{ label: string; allergens: AllergenEntry[] }>;
}

export interface AllergenSet {
  /** Variant label, e.g. "Gelato"; null for a single set. */
  label: string | null;
  contains: string[];
  canBeOmitted: string[];
}

export function allergenSets(
  item: AllergenItem,
  categories: readonly string[],
): AllergenSet[] | null {
  if (item.allergenSource !== 'client') return null;
  const order = (names: string[]) =>
    names.sort((a, b) => categories.indexOf(a) - categories.indexOf(b));
  const toSet = (label: string | null, list: AllergenEntry[]): AllergenSet => ({
    label,
    contains: order(list.filter((a) => !a.canBeOmitted).map((a) => a.name)),
    canBeOmitted: order(list.filter((a) => a.canBeOmitted).map((a) => a.name)),
  });
  if (item.allergenVariants) return item.allergenVariants.map((v) => toSet(v.label, v.allergens));
  if (item.allergens === null) return null;
  return [toSet(null, item.allergens)];
}

export function isEmptySet(set: AllergenSet): boolean {
  return set.contains.length === 0 && set.canBeOmitted.length === 0;
}
