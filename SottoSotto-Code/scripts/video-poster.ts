/**
 * Hero poster (ARCHITECTURE §6.2), called by scripts/video.sh with the first frame of the
 * loop. Writes AVIF/WebP posters at several widths (warns over 200 KB) and
 * src/content/video-manifest.json: the poster (same shape as an image-manifest entry, so
 * <Picture> renders it) and the encoded video files, largest first.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { videoManifestSchema, type VideoManifest } from '../src/content/schemas';

const [posterPng] = process.argv.slice(2);
if (!posterPng) {
  console.error('Usage: tsx scripts/video-poster.ts <poster.png>');
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const videoDir = join(root, 'public', 'video');
const manifestPath = join(root, 'src', 'content', 'video-manifest.json');
const WIDTHS = [640, 1280, 1920];
const MAX_POSTER_BYTES = 200 * 1024;

mkdirSync(videoDir, { recursive: true });
const { width = 1920, height = 1080 } = await sharp(posterPng).metadata();

const avif: Array<{ src: string; width: number }> = [];
const webp: Array<{ src: string; width: number }> = [];
const warnings: string[] = [];
for (const w of WIDTHS) {
  const base = `hero-poster-${w}`;
  await sharp(posterPng)
    .resize(w)
    .avif({ quality: 50, effort: 6 })
    .toFile(join(videoDir, `${base}.avif`));
  await sharp(posterPng)
    .resize(w)
    .webp({ quality: 72, effort: 6 })
    .toFile(join(videoDir, `${base}.webp`));
  avif.push({ src: `/video/${base}.avif`, width: w });
  webp.push({ src: `/video/${base}.webp`, width: w });
  for (const ext of ['avif', 'webp']) {
    const bytes = statSync(join(videoDir, `${base}.${ext}`)).size;
    if (bytes > MAX_POSTER_BYTES) warnings.push(`${base}.${ext} is ${Math.round(bytes / 1024)} KB`);
  }
}
const lqip = await sharp(posterPng).resize(24).blur(1).webp({ quality: 40 }).toBuffer();

const files = readdirSync(videoDir).filter((f) => /^hero-\d+\.(mp4|webm)$/.test(f));
const sources = (ext: 'mp4' | 'webm') =>
  files
    .filter((f) => f.endsWith(`.${ext}`))
    .map((f) => ({ src: `/video/${f}`, height: Number(/\d+/.exec(f)![0]) }))
    .sort((a, b) => b.height - a.height);

const manifest: VideoManifest = videoManifestSchema.parse({
  hero: {
    poster: {
      source: 'hero-video',
      width,
      height,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
      sourceHash: createHash('sha256').update(readFileSync(posterPng)).digest('hex'),
      sources: { avif, webp },
    },
    webm: sources('webm'),
    mp4: sources('mp4'),
  },
});
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

for (const w of warnings) console.warn(`⚠ Poster over 200 KB: ${w}`);
console.log(`✓ Poster ${width}×${height} at ${WIDTHS.join(', ')} px; manifest written`);
