/**
 * Image pipeline (D36, ARCHITECTURE §6.1).
 *
 * Dish photos: every `image` in menu.json and desserts.json → AVIF + WebP at 480, 800,
 * 1200 and the source width (max 2400), named by dish id, plus a manifest with size,
 * a tiny blurred placeholder (LQIP) and the source hash. Unchanged sources are skipped.
 * Textures: concrete and grain placeholders until the real texture is made (ASSETS.md).
 *
 * Originals live outside git: ASSET_SRC (default ../sotto sotto assets/).
 * Generated files are committed.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import desserts from '../data/desserts.json';
import menu from '../data/menu.json';
import { manifestSchema, type ImageManifest, type ManifestEntry } from '../src/content/schemas';

const root = fileURLToPath(new URL('..', import.meta.url));
const assetDir = resolve(root, process.env.ASSET_SRC ?? '../sotto sotto assets/');
const publicDir = join(root, 'public');
const dishDir = join(publicDir, 'img', 'dishes');
const textureDir = join(publicDir, 'textures');
const manifestPath = join(root, 'src', 'content', 'image-manifest.json');

const WIDTHS = [480, 800, 1200];
const MAX_WIDTH = 2400;
const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 72, effort: 6 };
const WARN_BYTES_AT_1200 = 300 * 1024;

type Item = { id: string; image: string | null };
const items: Item[] = [...menu.sections, ...desserts.sections].flatMap((s) => s.items as Item[]);
const wanted = items.filter((i): i is Item & { image: string } => i.image !== null);

const previous: ImageManifest = manifestSchema.parse(
  JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown,
);
const next: ImageManifest = {};
const warnings: string[] = [];
const missing = wanted.filter((i) => !existsSync(join(assetDir, i.image)));

if (missing.length) {
  console.error(`✗ Source photos not found in ${assetDir}:`);
  for (const i of missing) console.error(`  ${i.id}: ${i.image}`);
  process.exit(1);
}

mkdirSync(dishDir, { recursive: true });

const outputPaths = (entry: ManifestEntry) =>
  [...entry.sources.avif, ...entry.sources.webp].map((s) => join(publicDir, s.src));

let built = 0;
for (const item of wanted) {
  const sourcePath = join(assetDir, item.image);
  const buffer = readFileSync(sourcePath);
  const sourceHash = createHash('sha256').update(buffer).digest('hex');
  const old = previous[item.id];

  if (
    old &&
    old.sourceHash === sourceHash &&
    old.source === item.image &&
    outputPaths(old).every(existsSync)
  ) {
    next[item.id] = old;
    continue;
  }
  if (old) for (const p of outputPaths(old)) rmSync(p, { force: true });

  const meta = await sharp(buffer).metadata();
  const srcWidth = meta.width;
  const srcHeight = meta.height;
  if (!srcWidth || !srcHeight) throw new Error(`Cannot read the size of ${item.image}`);

  const top = Math.min(srcWidth, MAX_WIDTH);
  const widths = [...WIDTHS.filter((w) => w < top), top];
  const sources: ManifestEntry['sources'] = { avif: [], webp: [] };

  for (const width of widths) {
    const resized = sharp(buffer).resize({ width, withoutEnlargement: true });
    for (const format of ['avif', 'webp'] as const) {
      const file = `${item.id}-${width}.${format}`;
      const out = join(dishDir, file);
      const pipeline = resized.clone();
      await (format === 'avif' ? pipeline.avif(AVIF) : pipeline.webp(WEBP)).toFile(out);
      sources[format].push({ width, src: `/img/dishes/${file}` });
      if (width === 1200 && statSync(out).size > WARN_BYTES_AT_1200) {
        warnings.push(`${file} is ${Math.round(statSync(out).size / 1024)} KB (over 300 KB)`);
      }
    }
  }

  const lqipBuffer = await sharp(buffer).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const height = Math.round((srcHeight * top) / srcWidth);

  next[item.id] = {
    source: item.image,
    sourceHash,
    width: top,
    height,
    lqip: `data:image/webp;base64,${lqipBuffer.toString('base64')}`,
    sources,
  };
  built++;
  console.log(`✓ ${item.id} (${widths.join(', ')})`);
}

// Remove images for dishes that no longer have one.
for (const [id, entry] of Object.entries(previous)) {
  if (!next[id]) {
    for (const p of outputPaths(entry)) rmSync(p, { force: true });
    console.log(`– removed ${id}`);
  }
}

const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n');

// ---- Texture placeholders (generated once; replace with the real texture later)

mkdirSync(textureDir, { recursive: true });

/** Seeded noise so the generated files are identical on every machine. */
function noise(width: number, height: number, channels: number, seed: number): Buffer {
  const data = Buffer.alloc(width * height * channels);
  let s = seed;
  for (let i = 0; i < data.length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    data[i] = s >>> 24;
  }
  return data;
}

const grainPath = join(textureDir, 'grain.png');
if (!existsSync(grainPath)) {
  // Grey noise with low alpha, tiled over the page.
  const size = 160;
  const grey = noise(size, size, 1, 7);
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = grey[i]!;
    rgba[i * 4] = v;
    rgba[i * 4 + 1] = v;
    rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = 18;
  }
  await sharp(rgba, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(grainPath);
  console.log('✓ textures/grain.png (placeholder)');
}

const concretePath = join(textureDir, 'concrete.webp');
if (!existsSync(concretePath)) {
  // Soft, blotchy noise tinted to concrete-600 (#3b3936), darkened so text contrast holds.
  const small = 96;
  const blotches = await sharp(noise(small, small, 1, 11), {
    raw: { width: small, height: small, channels: 1 },
  })
    .resize(1600, 1000, { kernel: 'cubic' })
    .blur(18)
    .linear(0.35, 20)
    .raw()
    .toBuffer();
  const fine = noise(1600, 1000, 1, 23);
  const rgb = Buffer.alloc(1600 * 1000 * 3);
  for (let i = 0; i < 1600 * 1000; i++) {
    const v = blotches[i]! + ((fine[i]! - 128) >> 4);
    // Stay at or below concrete-500 (#55524d), the lightest tone allowed behind body text.
    rgb[i * 3] = Math.min(0x55, Math.max(0x12, 0x2a + (v >> 3)));
    rgb[i * 3 + 1] = Math.min(0x52, Math.max(0x11, 0x28 + (v >> 3)));
    rgb[i * 3 + 2] = Math.min(0x4d, Math.max(0x10, 0x25 + (v >> 3)));
  }
  await sharp(rgb, { raw: { width: 1600, height: 1000, channels: 3 } })
    .webp({ quality: 60 })
    .toFile(concretePath);
  console.log(
    `✓ textures/concrete.webp (placeholder, ${Math.round(statSync(concretePath).size / 1024)} KB)`,
  );
}

for (const w of warnings) console.warn(`⚠ ${w}`);
console.log(
  `Images: ${wanted.length} dishes, ${built} rebuilt, ${wanted.length - built} unchanged.`,
);
