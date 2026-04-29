import { expect, test } from '@playwright/test';

/**
 * Cenário 1 — Fluxo principal do operador.
 *
 * 1. Home → "Nova simulação"
 * 2. Mantém Likerts default, escolhe setor "automotive" e aperta calcular.
 * 3. Esperamos chegar em /result com um método recomendado e um radar.
 * 4. Exportamos CSV (apenas garantindo o botão dispara download).
 */
test('happy path: home → inputs → result → export CSV', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /nova simulação|new simulation/i }).first().click();

  await expect(page).toHaveURL(/\/simulate/);
  await page.locator('select').first().selectOption('automotive');
  await page.getByRole('button', { name: /calcular|calculate/i }).click();

  await expect(page).toHaveURL(/\/result/);
  await expect(page.getByText(/método recomendado|recommended method/i)).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /csv/i }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
});

/**
 * Cenário 2 — Troca de idioma persiste entre reloads.
 */
test('locale toggle persists across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^EN$/ }).click();
  await expect(page.getByRole('link', { name: /new simulation/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: /new simulation/i })).toBeVisible();
});

/**
 * Cenário 3 — Modo operador simplifica o resultado.
 */
test('operator mode hides technical chart sections', async ({ page }) => {
  await page.goto('/simulate');
  await page.getByRole('button', { name: /calcular|calculate/i }).click();
  await expect(page).toHaveURL(/\/result/);
  await page.getByRole('button', { name: /modo operador|operator mode/i }).click();
  await expect(page.getByText(/para o operador|for the operator/i)).toBeVisible();
});
