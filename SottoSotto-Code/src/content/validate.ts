/**
 * Parses every data file with its schema, then runs cross-file checks (ARCHITECTURE §5.1).
 * Any problem throws a ContentError listing every issue as `file → path: message`,
 * so a broken data file fails the build with a readable message.
 */
import type { z } from 'zod';
import type { RawFiles } from './raw';
import {
  allergensSchema,
  dessertsSchema,
  manifestSchema,
  menuSchema,
  privacySchema,
  seoSchema,
  siteSchema,
  venueSchema,
  wineSchema,
  type Allergens,
  type Desserts,
  type ImageManifest,
  type Menu,
  type Privacy,
  type Seo,
  type Site,
  type Venue,
  type Wine,
} from './schemas';

export interface Content {
  site: Site;
  allergens: Allergens;
  menu: Menu;
  desserts: Desserts;
  wine: Wine;
  venue: Venue;
  seo: Seo;
  privacy: Privacy;
  manifest: ImageManifest;
}

export interface ContentIssue {
  file: string;
  path: string;
  message: string;
}

export class ContentError extends Error {
  constructor(readonly issues: ContentIssue[]) {
    super(
      `Invalid content (${issues.length} ${issues.length === 1 ? 'problem' : 'problems'}):\n` +
        issues.map((i) => `  ✗ ${i.file} → ${i.path || '(root)'}: ${i.message}`).join('\n'),
    );
    this.name = 'ContentError';
  }
}

/** Removes every key that starts with `_` (notes for humans), at any depth. */
export function stripNotes<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripNotes) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => [k, stripNotes(v)]),
    ) as T;
  }
  return value;
}

export function formatPath(path: ReadonlyArray<PropertyKey>): string {
  return path
    .map((p, i) => (typeof p === 'number' ? `[${p}]` : `${i ? '.' : ''}${String(p)}`))
    .join('');
}

export function validateContent(raw: RawFiles): Content {
  const issues: ContentIssue[] = [];

  function parse<S extends z.ZodType>(file: keyof RawFiles, schema: S): z.output<S> | undefined {
    const result = schema.safeParse(stripNotes(raw[file]));
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      issues.push({ file, path: formatPath(issue.path), message: issue.message });
    }
    return undefined;
  }

  const site = parse('site.json', siteSchema);
  const allergens = parse('allergens.json', allergensSchema);
  const menu = parse('menu.json', menuSchema);
  const desserts = parse('desserts.json', dessertsSchema);
  const wine = parse('wine.json', wineSchema);
  const venue = parse('venue.json', venueSchema);
  const seo = parse('seo.json', seoSchema);
  const privacy = parse('privacy.json', privacySchema);
  const manifest = parse('image-manifest.json', manifestSchema);

  // ---- Cross-file checks (only on files that parsed)

  const categories = new Set(allergens?.categories ?? []);
  type Named = { name: string };
  const checkAllergenNames = (
    file: string,
    path: string,
    item: { allergens: Named[] | null; allergenVariants?: Array<{ allergens: Named[] }> },
  ) => {
    if (!allergens) return;
    const lists = [
      ...(item.allergens ? [{ at: `${path}.allergens`, list: item.allergens }] : []),
      ...(item.allergenVariants ?? []).map((v, i) => ({
        at: `${path}.allergenVariants[${i}].allergens`,
        list: v.allergens,
      })),
    ];
    for (const { at, list } of lists) {
      const seen = new Set<string>();
      list.forEach((a, i) => {
        if (!categories.has(a.name)) {
          issues.push({
            file,
            path: `${at}[${i}].name`,
            message: `Unknown allergen "${a.name}". Use one of allergens.json categories: ${[...categories].join(', ')}`,
          });
        }
        if (seen.has(a.name)) {
          issues.push({
            file,
            path: `${at}[${i}].name`,
            message: `Duplicate allergen "${a.name}"`,
          });
        }
        seen.add(a.name);
      });
    }
  };

  const dishIds = new Map<string, string>();
  for (const [file, data] of [
    ['menu.json', menu],
    ['desserts.json', desserts],
  ] as const) {
    data?.sections.forEach((section, si) =>
      section.items.forEach((item, ii) => {
        const path = `sections[${si}].items[${ii}]`;
        const other = dishIds.get(item.id);
        if (other) {
          issues.push({
            file,
            path: `${path}.id`,
            message: `Duplicate dish id "${item.id}" (also in ${other})`,
          });
        }
        dishIds.set(item.id, `${file} ${path}`);
        checkAllergenNames(file, path, item);
        if (item.image !== null && manifest) {
          const entry = manifest[item.id];
          if (!entry) {
            issues.push({
              file,
              path: `${path}.image`,
              message: `No generated image for "${item.id}". Run \`npm run images\` (source: ${item.image}).`,
            });
          } else if (entry.source !== item.image) {
            issues.push({
              file,
              path: `${path}.image`,
              message: `Image manifest has "${entry.source}" for "${item.id}" but the data says "${item.image}". Run \`npm run images\`.`,
            });
          }
        }
      }),
    );
  }

  const drinkIds = new Set<string>();
  wine?.drinks.forEach((section, si) => {
    const items =
      section.shape === 'priceColumns'
        ? [
            ...(section.items ?? []).map((item, ii) => ({
              item,
              path: `drinks[${si}].items[${ii}]`,
            })),
            ...(section.groups ?? []).flatMap((g, gi) =>
              g.items.map((item, ii) => ({
                item,
                path: `drinks[${si}].groups[${gi}].items[${ii}]`,
              })),
            ),
          ]
        : section.items.map((item, ii) => ({ item, path: `drinks[${si}].items[${ii}]` }));
    for (const { item, path } of items) {
      checkAllergenNames('wine.json', path, item);
      if (drinkIds.has(item.id)) {
        issues.push({
          file: 'wine.json',
          path: `${path}.id`,
          message: `Duplicate drink id "${item.id}"`,
        });
      }
      drinkIds.add(item.id);
    }
  });

  if (issues.length) throw new ContentError(issues);

  return {
    site: site!,
    allergens: allergens!,
    menu: menu!,
    desserts: desserts!,
    wine: wine!,
    venue: venue!,
    seo: seo!,
    privacy: privacy!,
    manifest: manifest!,
  };
}
