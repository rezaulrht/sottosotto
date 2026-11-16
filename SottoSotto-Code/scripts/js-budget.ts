/**
 * First-load JavaScript budget per route (ARCHITECTURE §11.3), measured on the static export:
 * every module script a page's HTML loads, gzipped. The `noModule` polyfill chunk is left out
 * (modern browsers skip it). Run after a build:
 *
 *   npm run budget
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const out = fileURLToPath(new URL('../out', import.meta.url));

/**
 * KB gzip. React DOM and the Next.js runtime alone are about 127 KB, so §11.3's 110 KB for
 * Privacy cannot be met; budgets are the M8 measurement plus about 5 KB headroom (D66).
 */
export const BUDGETS: Record<string, number> = {
  '/': 148,
  '/menu/': 147,
  '/venue/': 145,
  '/find-us/': 145,
  '/book/': 150,
  '/privacy/': 144,
};

function scriptsOf(html: string): string[] {
  const srcs = new Set<string>();
  for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
    const attrs = m[1]!;
    if (/\bnoModule\b/i.test(attrs)) continue;
    const src = /\bsrc="([^"]+)"/.exec(attrs)?.[1];
    if (src?.startsWith('/_next/')) srcs.add(src);
  }
  return [...srcs];
}

let failed = false;
const rows: Array<Record<string, string | number>> = [];
for (const [route, budget] of Object.entries(BUDGETS)) {
  const html = readFileSync(join(out, route, 'index.html'), 'utf8');
  const kb =
    scriptsOf(html).reduce((sum, src) => sum + gzipSync(readFileSync(join(out, src))).length, 0) /
    1024;
  const ok = kb <= budget;
  if (!ok) failed = true;
  rows.push({ route, 'KB gzip': Number(kb.toFixed(1)), budget, result: ok ? 'pass' : 'FAIL' });
}
console.table(rows);
if (failed) {
  console.error('JS budget exceeded.');
  process.exit(1);
}
console.log('JS budgets pass.');
