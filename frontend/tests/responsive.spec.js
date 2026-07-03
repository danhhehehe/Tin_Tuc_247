import { test, expect } from '@playwright/test';
import { expectNoHorizontalOverflow, openHome } from './helpers.js';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`responsive ${viewport.name}: không tràn ngang và khối chính vẫn hiện`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'viewport matrix runs once on desktop Chrome');

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openHome(page);

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Tin|bóng đá|lúa|gạo/i);
    await expect(page.locator('article.article-card').first()).toBeVisible();
    await expect(page.locator('.rice-widget:visible').first()).toBeVisible();
    await expect(page.locator('.football-widget')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
