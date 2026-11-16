import { defineConfig, devices } from '@playwright/test';

// Smoke tests run against the static export in out/ (build first: npm run build:staging).
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    // A stored "Reject" keeps the cookie banner out of other specs' way;
    // tests/e2e/consent.spec.ts starts without it.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3100',
          localStorage: [
            {
              name: 'consent.v1',
              value: JSON.stringify({ analytics: false, version: 1, date: '2026-11-16' }),
            },
          ],
        },
      ],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npx --yes serve@14.2.4 out -l 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
  },
});
