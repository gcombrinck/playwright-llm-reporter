"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)('homepage has title and links to intro page', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await (0, test_1.expect)(page).toHaveTitle(/Playwright/);
});
(0, test_1.test)('homepage has title and links to intro page - Negative', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await (0, test_1.expect)(page).toHaveTitle(/Playwrights/);
    await page.screenshot({ path: 'screenshots/homepage-negative.png' });
});
test_1.test.skip('skipped test', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await (0, test_1.expect)(page).toHaveTitle(/Playwright/);
});
(0, test_1.test)('long running test', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await (0, test_1.expect)(page).toHaveTitle(/Playwright/);
});
