import { test, expect } from '@playwright/test';
import { openHome } from './helpers.js';

test('khu vực bóng đá hiển thị và có fallback khi không có lịch thật', async ({ page }) => {
  await openHome(page);

  const widget = page.locator('.football-widget');
  await expect(widget).toBeVisible();
  await expect(widget).toContainText(/bóng đá|thể thao|lịch|tỉ số|tin bóng đá|fallback/i);
  await expect(widget).not.toContainText(/Chưa cấu hình API bóng đá/i);
});

test('tab bóng đá bấm được và không làm trống giao diện', async ({ page }) => {
  await openHome(page);

  const tabs = page.locator('.football-tabs button');
  const total = await tabs.count();
  expect(total).toBeGreaterThan(0);
  for (let index = 0; index < total; index += 1) {
    await tabs.nth(index).click();
    await expect(page.locator('.football-widget')).toContainText(/bóng đá|thể thao|lịch|tỉ số|tin/i);
  }
});
