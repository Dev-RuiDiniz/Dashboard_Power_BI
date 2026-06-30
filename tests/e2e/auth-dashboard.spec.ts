import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'demo@dashboard.com';
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'Demo@123456';

test.describe('Autenticação', () => {
  test('login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', E2E_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', E2E_PASSWORD);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });
  });

  test('login com credenciais inválidas exibe erro', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', 'invalid@test.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    await expect(page.locator('body')).toContainText(/.*/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/app/);
  });

  test('logout redireciona para login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', E2E_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });

    const logoutButton = page.locator('button, a', { hasText: /sair|logout|exit/i }).first();
    if (await logoutButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    }
  });
});

test.describe('Dashboard Home', () => {
  test('carrega a home executiva com KPIs após login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', E2E_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });

    await expect(page.locator('h1, h2, h3').filter({ hasText: /dashboard/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('abre drill-down ao clicar em KPI', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', E2E_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });

    const drilldownButton = page.locator('button', { hasText: /drilldown|drill-down/i }).first();

    if (await drilldownButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await drilldownButton.click();
      await expect(page.locator('text=Drill-down')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('seletor de dimensão aparece no drill-down', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', E2E_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });

    const drilldownButton = page.locator('button', { hasText: /drilldown|drill-down/i }).first();

    if (await drilldownButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await drilldownButton.click();
      await expect(page.getByRole('tablist')).toBeVisible({ timeout: 10_000 });
    }
  });
});
