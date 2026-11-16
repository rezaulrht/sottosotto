/**
 * Open Graph image (ARCHITECTURE §10.1, M8): one 1200 × 630 JPEG shared by every page,
 * cut from the Cicchetti della casa photo (also the booking band's photo, D58). No text is
 * drawn on it: the page title travels in og:title. Originals live outside git (ASSET_SRC);
 * the output is committed.
 *
 *   npm run og
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import menu from '../data/menu.json';

const root = fileURLToPath(new URL('..', import.meta.url));
const assetDir = resolve(root, process.env.ASSET_SRC ?? '../sotto sotto assets/');
const outDir = join(root, 'public', 'og');

const dish = menu.sections
  .flatMap((s) => s.items as Array<{ id: string; image?: string | null }>)
  .find((d) => d.id === 'cicchetti-della-casa');
if (!dish?.image) throw new Error('cicchetti-della-casa has no image in menu.json');

mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'default.jpg');
const info = await sharp(join(assetDir, dish.image))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .modulate({ brightness: 0.92 })
  .jpeg({ quality: 82, mozjpeg: true, progressive: true })
  .toFile(out);
console.log(`✓ ${out} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
