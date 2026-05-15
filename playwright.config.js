import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5175/personal-expense-tracker/',
    headless: true,
  },
  // Don't spin up a server — we started it manually
  webServer: undefined,
})
