import { defineConfig } from '@playwright/test'

const isCI = Boolean(process.env.CI)
const localBaseUrl = 'http://127.0.0.1:4173'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBaseUrl
const EDGE_EXECUTABLE_PATH =
  process.env.PLAYWRIGHT_EDGE_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    : undefined)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 1080 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    launchOptions: EDGE_EXECUTABLE_PATH ? { executablePath: EDGE_EXECUTABLE_PATH } : undefined,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npx vite --host 127.0.0.1 --port 4173 --strictPort',
        url: localBaseUrl,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
})
