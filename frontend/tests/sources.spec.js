import { test, expect } from '@playwright/test';
import { mockApi } from './helpers.js';

test('trang Lấy tin từ đâu mở được và không còn chữ quản trị thừa', async ({ page }) => {
  await mockApi(page);
  await page.goto('/sources');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('h1').first()).toContainText(/Lấy tin|Nguồn|tin/i);
  await expect(page.getByText('Quản trị đơn giản')).toHaveCount(0);
  await expect(page.getByText('Quản lý nguồn tin RSS')).toHaveCount(0);
});

test('danh sách nguồn tin có tên, link hoặc trạng thái hợp lệ', async ({ page }) => {
  await mockApi(page);
  await page.goto('/sources');

  const sourceCards = page.locator('.source-card');
  await expect(sourceCards.first()).toBeVisible();
  await expect(sourceCards.first()).toContainText(/Báo|Tin|Đang|nguồn|Nhóm/i);
  await expect(sourceCards.first().locator('a[href]').first()).toBeVisible();
});
