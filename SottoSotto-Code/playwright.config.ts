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
