import { test, expect } from '@playwright/test';

test('homepage has title and links to intro page', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('homepage has title and links to intro page - Negative', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwrights/);
  await page.screenshot({ path: 'screenshots/homepage-negative.png' });
});

test.skip('skipped test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('long running test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await new Promise(resolve => setTimeout(resolve, 10000));
  await expect(page).toHaveTitle(/Playwright/);
});