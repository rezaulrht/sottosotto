/**
 * Recomputes the WCAG contrast of every body-text pair from tokens.css and fails
 * if any drops below 4.5:1 (ARCHITECTURE §2.2). Also fails if tokens.css and
 * src/lib/tokens.ts disagree on a colour.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

if (failed) {
  console.error('Contrast check failed.');
  process.exit(1);
}
console.log(`Contrast check passed: ${rows.length} body-text pairs at ≥ ${AA_BODY}:1.`);
