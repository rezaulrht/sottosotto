/**
 * Zod schemas for every data file (D35, ARCHITECTURE §5.1). All objects are strict:
 * an unknown or misspelt key fails the build. Keys starting with `_` are notes for
 * humans and are stripped before parsing (see validate.ts).
 * Cross-file rules (allergen names, unique ids, image keys) live in validate.ts.
 */
import { z } from 'zod';
import { WEEKDAYS } from '../lib/hours';

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour)');
const monthDay = z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Use MM-DD');
const nonEmpty = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use a lower-case slug id');
const httpsUrl = z.url({ protocol: /^https$/ });

/** A price in pounds: positive, at most 2 decimals. */
export const price = z
  .number()
  .positive()
  .refine((n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6, 'At most 2 decimals');

// ---------------------------------------------------------------- site.json

const session = z
  .strictObject({ open: hhmm, close: hhmm })
  .refine((s) => s.close > s.open, 'close must be after open');

const weekly = z.strictObject(
  Object.fromEntries(WEEKDAYS.map((d) => [d, z.array(session)])) as Record<
    (typeof WEEKDAYS)[number],
    z.ZodArray<typeof session>
  >,
);

const flagged = { mock: z.boolean().optional(), confirmed: z.boolean().optional() };

export const siteSchema = z.strictObject({
  name: nonEmpty,
  tagline: nonEmpty,
  website: httpsUrl,
  copy: z.strictObject({
    philosophyShort: nonEmpty,
    philosophyHeading: nonEmpty,
    philosophyFull: z.array(nonEmpty).min(1),
    homeIntro: nonEmpty,
    bookingNote: nonEmpty,
    emailResponseNote: nonEmpty,
    enquiriesHeading: nonEmpty,
    careers: z.strictObject({
      heading: nonEmpty,
      paragraphs: z.array(nonEmpty).min(1),
      applyText: nonEmpty,
      button: nonEmpty,
    }),
  }),
  hours: z.strictObject({
    timezone: z.literal('Europe/London'),
    weekly,
    closures: z.array(
      z.strictObject({
        label: nonEmpty,
        from: monthDay,
        to: monthDay,
        recurring: z.literal('yearly'),
        ...flagged,
      }),
    ),
  }),
  contact: z.strictObject({
    phone: nonEmpty,
    phoneE164: z.string().regex(/^\+44\d{9,10}$/, 'Use E.164, e.g. +441225000000'),
    phoneLabel: nonEmpty,
    email: z.email(),
    emailLabel: nonEmpty,
    careersEmail: z.email(),
    toConfirm: z.boolean().optional(),
  }),
  address: z.strictObject({
    mock: z.boolean().optional(),
    line1: nonEmpty,
    city: nonEmpty,
    postcode: nonEmpty,
    country: nonEmpty,
  }),
  geo: z.strictObject({
    mock: z.boolean().optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  parking: z.array(
    z
      .strictObject({
        name: nonEmpty,
        address: nonEmpty.nullable(),
        addressMissing: z.boolean().optional(),
        note: nonEmpty.nullable(),
        walkingMinutes: z.strictObject({
          value: z.number().int().positive(),
          mock: z.boolean().optional(),
        }),
      })
      .refine(
        (p) => (p.address === null) === (p.addressMissing === true),
        'address: null must go with addressMissing: true (and only then)',
      ),
  ),
  gettingHere: z.array(
    z.strictObject({ mock: z.boolean().optional(), mode: nonEmpty, text: nonEmpty }),
  ),
  social: z.array(z.strictObject({ platform: nonEmpty, url: httpsUrl, ...flagged })),
  booking: z.strictObject({
    page: z.literal('/book/'),
    maxPartySize: z.number().int().min(1).max(20),
    rules: z.strictObject({
      ...flagged,
      slotMinutes: z.number().int().min(5).max(60),
      lastSeatingMinutesBeforeClose: z.number().int().min(0).max(180),
      bookingWindowDays: z.number().int().min(1).max(365),
      minNoticeMinutes: z.number().int().min(0).max(2880),
    }),
    availability: z.strictObject({ ...flagged, source: z.literal('generated') }),
  }),
  analytics: z.strictObject({
    ga4MeasurementId: z.string().regex(/^G-[A-Z0-9]+$/),
    requiresConsent: z.literal(true),
  }),
  legal: z.strictObject({ privacyPolicyLastUpdated: nonEmpty }),
  brand: z.strictObject({
    mock: z.boolean().optional(),
    logo: nonEmpty.nullable(),
    colours: z.unknown().nullable(),
    fonts: z.unknown().nullable(),
  }),
  media: z.strictObject({
    heroVideo: z.strictObject({
      mock: z.boolean().optional(),
      src: nonEmpty.nullable(),
      poster: nonEmpty.nullable(),
    }),
    bookingVideo: z.strictObject({
      mock: z.boolean().optional(),
      src: nonEmpty.nullable(),
      poster: nonEmpty.nullable(),
    }),
  }),
  allergensFile: z.literal('allergens.json'),
});

// ---------------------------------------------------------------- allergens.json

export const allergensSchema = z.strictObject({
  source: z.array(nonEmpty).min(1),
  categories: z.array(nonEmpty).length(14),
  key: z.strictObject({
    contains: z.strictObject({ mark: nonEmpty, label: nonEmpty }),
    canBeOmitted: z.strictObject({ mark: nonEmpty, label: nonEmpty }),
  }),
  generalNote: nonEmpty,
  itemSchema: z.record(z.string(), z.string()),
});

// ---------------------------------------------------------------- allergen fields on items

const allergenEntry = z.strictObject({ name: nonEmpty, canBeOmitted: z.boolean() });
const allergenList = z.array(allergenEntry);

export const allergenFields = {
  allergens: allergenList.nullable(),
  allergenSource: z.enum(['client', 'estimated']).nullable(),
  allergenVariants: z
    .array(z.strictObject({ label: nonEmpty, allergens: allergenList }))
    .min(2)
    .optional(),
};

type AllergenFields = {
  allergens: z.infer<typeof allergenList> | null;
  allergenSource: 'client' | 'estimated' | null;
  allergenVariants?: Array<{ label: string; allergens: z.infer<typeof allergenList> }>;
};

/** Rules shared by every item that carries allergens (ARCHITECTURE §5.1). */
export function checkAllergenFields(item: AllergenFields, ctx: z.RefinementCtx): void {
  if (item.allergenVariants && item.allergens !== null) {
    ctx.addIssue({
      code: 'custom',
      path: ['allergenVariants'],
      message: 'allergenVariants is only allowed when allergens is null',
    });
  }
  const hasData = item.allergens !== null || !!item.allergenVariants;
  if (item.allergenSource === null && hasData) {
    ctx.addIssue({
      code: 'custom',
      path: ['allergenSource'],
      message: 'allergenSource: null requires allergens: null and no allergenVariants',
    });
  }
  if (item.allergenSource !== null && !hasData) {
    ctx.addIssue({
      code: 'custom',
      path: ['allergenSource'],
      message: `allergenSource "${item.allergenSource}" needs allergens or allergenVariants`,
    });
  }
}

// ---------------------------------------------------------------- menu.json, desserts.json

const tagLegend = z.strictObject({ v: nonEmpty, n: nonEmpty });

const dish = z
  .strictObject({
    id,
    name: nonEmpty,
    description: nonEmpty.nullable(),
    price,
    tags: z.array(z.enum(['v', 'n'])),
    image: nonEmpty.nullable(),
    photoMatch: z.enum(['clear', 'likely', 'none']),
    ...allergenFields,
  })
  .superRefine((item, ctx) => {
    checkAllergenFields(item, ctx);
    if (new Set(item.tags).size !== item.tags.length) {
      ctx.addIssue({ code: 'custom', path: ['tags'], message: 'Duplicate tag' });
    }
    if ((item.image === null) !== (item.photoMatch === 'none')) {
      ctx.addIssue({
        code: 'custom',
        path: ['photoMatch'],
        message: 'photoMatch must be "none" exactly when image is null',
      });
    }
  });

const dishSection = z.strictObject({
  id,
  nameIt: nonEmpty,
  nameEn: nonEmpty,
  textOnly: z.boolean().optional(),
  items: z.array(dish).min(1),
});

export const menuSchema = z.strictObject({
  currency: z.literal('GBP'),
  imageSourceDir: nonEmpty,
  tagLegend,
  notes: z.strictObject({ verbatim: z.boolean(), allergy: nonEmpty, sourcing: nonEmpty }),
  sections: z.array(dishSection).min(1),
  source: nonEmpty,
});

export const dessertsSchema = z.strictObject({
  currency: z.literal('GBP'),
  imageSourceDir: nonEmpty,
  tagLegend,
  sections: z.array(dishSection).min(1),
});

// ---------------------------------------------------------------- wine.json

const wine = z.strictObject({
  id,
  name: nonEmpty,
  producer: nonEmpty.nullable(),
  region: nonEmpty.nullable(),
  vintage: nonEmpty.nullable(),
  glass: price.nullable(),
  bottle: price,
  note: nonEmpty.nullable(),
});

const sectionBase = {
  id,
  name: nonEmpty,
  nameIt: nonEmpty.optional(),
  note: nonEmpty.nullable().optional(),
};

const pricedDrink = z
  .strictObject({
    id,
    name: nonEmpty,
    description: nonEmpty.nullable().optional(),
    details: nonEmpty.nullable().optional(),
    abv: z.number().positive().max(100).nullable().optional(),
    price,
    ...allergenFields,
  })
  .superRefine(checkAllergenFields);

const columnDrink = z
  .strictObject({
    id,
    name: nonEmpty,
    abv: z.number().positive().max(100).nullable(),
    prices: z.record(z.string(), price),
    ...allergenFields,
  })
  .superRefine(checkAllergenFields);

const uniformSection = z
  .strictObject({ ...sectionBase, uniformPrice: price, items: z.array(pricedDrink).min(1) })
  .superRefine((s, ctx) => {
    s.items.forEach((item, i) => {
      if (item.price !== s.uniformPrice) {
        ctx.addIssue({
          code: 'custom',
          path: ['items', i, 'price'],
          message: `price ${item.price} differs from the section's uniformPrice ${s.uniformPrice}`,
        });
      }
    });
  });

const perItemSection = z.strictObject({ ...sectionBase, items: z.array(pricedDrink).min(1) });

const columnsSection = z
  .strictObject({
    ...sectionBase,
    priceColumns: z.array(z.strictObject({ id: nonEmpty, label: nonEmpty })).min(1),
    mixerSurcharge: price.optional(),
    items: z.array(columnDrink).min(1).optional(),
    groups: z
      .array(z.strictObject({ name: nonEmpty, items: z.array(columnDrink).min(1) }))
      .min(1)
      .optional(),
  })
  .superRefine((s, ctx) => {
    if (!s.items === !s.groups) {
      ctx.addIssue({ code: 'custom', message: 'Use either items or groups, not both' });
    }
    const columns = new Set(s.priceColumns.map((c) => c.id));
    const check = (items: Array<z.infer<typeof columnDrink>>, path: Array<string | number>) =>
      items.forEach((item, i) => {
        for (const key of Object.keys(item.prices)) {
          if (!columns.has(key)) {
            ctx.addIssue({
              code: 'custom',
              path: [...path, i, 'prices', key],
              message: `Unknown price column "${key}"`,
            });
          }
        }
      });
    if (s.items) check(s.items, ['items']);
    s.groups?.forEach((g, gi) => check(g.items, ['groups', gi, 'items']));
  });

export type UniformSection = z.infer<typeof uniformSection> & { shape: 'uniformPrice' };
export type PerItemSection = z.infer<typeof perItemSection> & { shape: 'price' };
export type ColumnsSection = z.infer<typeof columnsSection> & { shape: 'priceColumns' };
export type DrinkSection = UniformSection | PerItemSection | ColumnsSection;

/**
 * The three bar-menu shapes. Picked by key (priceColumns, uniformPrice, else per item)
 * so a mistake is reported against the intended shape instead of as a vague union error.
 * The parsed value gets a `shape` tag for rendering.
 */
const drinkSection = z.unknown().transform((value, ctx): DrinkSection => {
  const has = (key: string) => typeof value === 'object' && value !== null && key in value;
  const [schema, shape] = has('priceColumns')
    ? ([columnsSection, 'priceColumns'] as const)
    : has('uniformPrice')
      ? ([uniformSection, 'uniformPrice'] as const)
      : ([perItemSection, 'price'] as const);
  const result = schema.safeParse(value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message });
    }
    return z.NEVER;
  }
  return { ...result.data, shape } as DrinkSection;
});

export const wineSchema = z.strictObject({
  tab: z.strictObject({ id: z.literal('wine'), label: nonEmpty }),
  currency: z.literal('GBP'),
  notes: z.strictObject({ glassSizes: nonEmpty, smallGlass: nonEmpty, vat: nonEmpty }),
  groups: z
    .array(
      z.strictObject({
        id,
        name: nonEmpty,
        glassMl: z.number().int().positive(),
        wines: z.array(wine).min(1),
      }),
    )
    .min(1),
  drinks: z.array(drinkSection).min(1),
});

// ---------------------------------------------------------------- venue.json

const venueImage = z.strictObject({
  mock: z.boolean(),
  src: nonEmpty.nullable(),
  alt: nonEmpty,
  caption: nonEmpty.nullable(),
});

export const venueSchema = z.strictObject({
  opening: z.strictObject({ image: venueImage }),
  descent: z.strictObject({ images: z.array(venueImage).min(1) }),
  setting: z.strictObject({
    eyebrow: nonEmpty,
    heading: nonEmpty,
    lead: nonEmpty,
    fact: z.strictObject({ text: nonEmpty, needsVerification: z.boolean(), source: nonEmpty }),
    close: nonEmpty,
    image: venueImage,
  }),
  story: z.strictObject({
    mock: z.boolean().optional(),
    heading: nonEmpty,
    text: nonEmpty,
    image: venueImage,
  }),
  rooms: z.strictObject({ images: z.array(venueImage).min(1) }),
  details: z.strictObject({ images: z.array(venueImage).min(1) }),
  bookingPrompt: z.strictObject({ heading: nonEmpty, button: nonEmpty }),
});

// ---------------------------------------------------------------- seo.json

const seoPage = z.strictObject({
  title: nonEmpty,
  description: z.string().trim().min(10).max(170),
  mock: z.boolean().optional(),
});

export const seoSchema = z.strictObject({
  titleTemplate: z.string().includes('%s'),
  pages: z.strictObject({
    home: seoPage,
    menu: seoPage,
    venue: seoPage,
    findUs: seoPage,
    book: seoPage,
    privacy: seoPage,
    notFound: seoPage,
  }),
});

// ---------------------------------------------------------------- privacy.json

export const privacySchema = z.strictObject({
  title: nonEmpty,
  lastUpdated: nonEmpty,
  blocks: z
    .array(
      z.discriminatedUnion('type', [
        z.strictObject({ type: z.literal('heading'), text: nonEmpty }),
        z.strictObject({ type: z.literal('paragraph'), text: nonEmpty }),
        z.strictObject({ type: z.literal('list'), items: z.array(nonEmpty).min(1) }),
      ]),
    )
    .min(1),
});

// ---------------------------------------------------------------- image-manifest.json

const imageSource = z.strictObject({ width: z.number().int().positive(), src: nonEmpty });

export const manifestEntry = z.strictObject({
  source: nonEmpty,
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  lqip: z.string().startsWith('data:image/'),
  sources: z.strictObject({
    avif: z.array(imageSource).min(1),
    webp: z.array(imageSource).min(1),
  }),
});

export const manifestSchema = z.record(z.string(), manifestEntry);

/** One encoded file of a background video, e.g. /video/hero-1080.webm (ARCHITECTURE §6.2). */
const videoSource = z.strictObject({
  src: nonEmpty.regex(/^\/video\/[\w-]+\.(mp4|webm)$/),
  height: z.number().int().positive(),
});

/** src/content/video-manifest.json, written by scripts/video.sh. Sources are largest first. */
export const videoManifestSchema = z.record(
  z.string(),
  z.strictObject({
    poster: manifestEntry,
    webm: z.array(videoSource).min(1),
    mp4: z.array(videoSource).min(1),
  }),
);

export type Site = z.infer<typeof siteSchema>;
export type Allergens = z.infer<typeof allergensSchema>;
export type Menu = z.infer<typeof menuSchema>;
export type Desserts = z.infer<typeof dessertsSchema>;
export type Dish = z.infer<typeof dish>;
export type DishSection = z.infer<typeof dishSection>;
export type Wine = z.infer<typeof wineSchema>;
export type Venue = z.infer<typeof venueSchema>;
export type Seo = z.infer<typeof seoSchema>;
export type SeoPageKey = keyof Seo['pages'];
export type Privacy = z.infer<typeof privacySchema>;
export type ImageManifest = z.infer<typeof manifestSchema>;
export type ManifestEntry = z.infer<typeof manifestEntry>;
export type VideoManifest = z.infer<typeof videoManifestSchema>;
export type VideoEntry = VideoManifest[string];
