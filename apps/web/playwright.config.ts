import { defineConfig, devices } from '@playwright/test';

/**
 * Config Playwright para testes e2e do frontend.
 *
 * Para rodar localmente:
 *   pnpm --filter @ahcf-cps/web exec playwright install --with-deps
 *   pnpm --filter @ahcf-cps/web exec playwright test
 *
 * Em CI: adicionar um job dedicado (não roda no CI padrão para manter
 * builds rápidos). Ver `.github/workflows/ci.yml`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-tablet', use: { ...devices['iPad (gen 7)'] } },
  ],
});
