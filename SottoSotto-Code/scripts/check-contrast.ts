/**
 * Recomputes the WCAG contrast of every body-text pair from tokens.css and fails
 * if any drops below 4.5:1 (ARCHITECTURE §2.2). Also fails if tokens.css and
 * src/lib/tokens.ts disagree on a colour.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cssColors } from '../src/lib/css-tokens';
import { bodyTextPairs, colors, contrastRatio } from '../src/lib/tokens';

const AA_BODY = 4.5;

const css = readFileSync(
  fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)),
  'utf8',
);
const fromCss = cssColors(css);
let failed = false;

for (const [token, hex] of Object.entries(colors)) {
  if (fromCss[token] !== hex) {
    console.error(
      `✗ ${token}: tokens.css has ${fromCss[token] ?? 'nothing'}, tokens.ts has ${hex}`,
    );
    failed = true;
  }
}

const rows = bodyTextPairs.map(([fg, bg]) => {
  const ratio = contrastRatio(fromCss[fg] ?? colors[fg], fromCss[bg] ?? colors[bg]);
  const pass = ratio >= AA_BODY;
  if (!pass) failed = true;
  return { text: fg, background: bg, ratio: Number(ratio.toFixed(2)), AA: pass ? 'pass' : 'FAIL' };
});

console.table(rows);

// The concrete wall must stay at or below concrete-500 behind body text (D55). Checked on
// the 99.9th percentile of the shipped WebP, so a few encoder speckles do not count.
const texture = fileURLToPath(new URL('../public/textures/concrete-1440.webp', import.meta.url));
const { data } = await sharp(texture).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum: number[] = [];
for (let i = 0; i < data.length; i += 3) {
  lum.push(0.2126 * lin(data[i]!) + 0.7152 * lin(data[i + 1]!) + 0.0722 * lin(data[i + 2]!));
}
lum.sort((a, b) => a - b);
const brightest = lum[Math.floor(lum.length * 0.999)]!;
const cap = 0.2126 * lin(0x55) + 0.7152 * lin(0x52) + 0.0722 * lin(0x4d);
console.log(
  `Concrete texture: brightest tone L=${brightest.toFixed(3)} (cap ${cap.toFixed(3)}, concrete-500).`,
);
if (brightest > cap) {
  console.error('✗ The concrete texture is lighter than concrete-500. Run `npm run images`.');
  failed = true;
}

if (failed) {
  console.error('Contrast check failed.');
  process.exit(1);
}
console.log(`Contrast check passed: ${rows.length} body-text pairs at ≥ ${AA_BODY}:1.`);
