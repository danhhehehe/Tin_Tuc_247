import { test, expect } from '@playwright/test';
import { mockApi, openHome, stabilizePage } from './helpers.js';

test('visual trang chủ desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'visual baselines are captured once with explicit desktop/mobile viewports');

  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await stabilizePage(page);
  await expect(page).toHaveScreenshot('home-desktop.png', { fullPage: true, animations: 'disabled', caret: 'hide', timeout: 15000 });
});

test('visual trang chủ mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'visual baselines are captured once with explicit desktop/mobile viewports');

  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await stabilizePage(page);
  await expect(page).toHaveScreenshot('home-mobile.png', { fullPage: true, animations: 'disabled', caret: 'hide', timeout: 15000 });
});

test('visual trang chi tiết tin', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'visual baselines are captured once with explicit desktop/mobile viewports');

  await mockApi(page);
  await page.goto('/article/tin-bong-da-moi-nhat');
  await stabilizePage(page);
  await expect(page).toHaveScreenshot('article-detail.png', { fullPage: true, animations: 'disabled', caret: 'hide', timeout: 15000 });
});

test('visual trang nguồn tin', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'visual baselines are captured once with explicit desktop/mobile viewports');

  await mockApi(page);
  await page.goto('/sources');
  await stabilizePage(page);
  await expect(page).toHaveScreenshot('sources.png', { fullPage: true, animations: 'disabled', caret: 'hide', timeout: 15000 });
});

test('visual bảng giá lúa gạo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'visual baselines are captured once with explicit desktop/mobile viewports');

  await openHome(page);
  await page.locator('.rice-open-board:visible').first().click();
  await stabilizePage(page);
  await expect(page).toHaveScreenshot('rice-price-board.png', { fullPage: true, animations: 'disabled', caret: 'hide', timeout: 15000 });
});
