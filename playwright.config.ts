import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:5175'

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    storageState: {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [{ name: 'khpl-analytik', value: 'anonym' }],
        },
      ],
    },
    viewport: { width: 1024, height: 768 },
    channel: 'chrome',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 5175 --strictPort',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
