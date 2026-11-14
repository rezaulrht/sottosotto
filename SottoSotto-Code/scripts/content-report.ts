/**
 * Content report and mock guard (D45, ARCHITECTURE §11.2).
 *
 *   npm run content:report   validate data, print and write content-report.json
 *   npm run content:guard    same, and exit 1 in production while anything is flagged
 *
 * The only production override is ALLOW_MOCK_IN_PRODUCTION=yes-i-know (emergencies only).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rawFiles } from '../src/content/raw';
import { countByReason, flaggedValues } from '../src/content/report';
import { ContentError, validateContent } from '../src/content/validate';
import { mockOverride, siteEnv } from '../src/lib/env';

const guard = process.argv.includes('--guard');
const env = siteEnv();

try {
  validateContent(rawFiles);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
console.log('✓ All data files are valid.');

const flags = flaggedValues(rawFiles);
const counts = countByReason(flags);
const table = () =>
  console.table(
    flags.map((f) => ({
      file: f.file,
      path: f.path,
      label: f.label ?? '',
      reasons: f.reasons.join(', '),
    })),
  );

writeFileSync(
  fileURLToPath(new URL('../content-report.json', import.meta.url)),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), siteEnv: env, total: flags.length, counts, flags },
    null,
    2,
  ) + '\n',
);

if (!guard || flags.length === 0 || env !== 'production') {
  if (!guard) table();
  console.log(`Flagged values: ${flags.length} (SITE_ENV=${env}). Full list: content-report.json`);
  process.exit(0);
}

table();

if (mockOverride()) {
  console.warn(
    `⚠ ALLOW_MOCK_IN_PRODUCTION is set: building production with ${flags.length} flagged values. ` +
      'The mock badge stays visible and pages are noindex. Not for launch.',
  );
  process.exit(0);
}

console.error(
  `✗ Production build refused: ${flags.length} flagged values remain (listed above). ` +
    'Replace them with confirmed client data, or build with SITE_ENV=staging.',
);
process.exit(1);
