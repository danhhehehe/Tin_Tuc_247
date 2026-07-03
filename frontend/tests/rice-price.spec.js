import { test, expect } from '@playwright/test';
import { openHome } from './helpers.js';

test('khu vực giá lúa gạo hiển thị và có dữ liệu fallback', async ({ page }) => {
  await openHome(page);

  const riceWidget = page.locator('.rice-widget:visible').first();
  await expect(riceWidget).toBeVisible();
  await expect(riceWidget).toContainText(/lúa|gạo|giá|ĐBSCL|tham khảo/i);
});

test('bảng giá lúa gạo lớn mở được và có cột quan trọng', async ({ page }) => {
  await openHome(page);

  await page.locator('.rice-open-board:visible').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('table')).toBeVisible();
  await expect(dialog).toContainText(/Loại|Giá|Khu vực|Nguồn|Nhóm/i);
  await expect(dialog.locator('tbody tr').first()).toBeVisible();
});

test('nút đọc tin lúa gạo điều hướng không lỗi', async ({ page }) => {
  await openHome(page);

  await page.locator('.rice-open-board:visible').first().click();
  await page.getByRole('dialog').locator('a[href="/category/lua-gao"]').click();
  await expect(page).toHaveURL(/\/category\/lua-gao/);
  await expect(page.locator('body')).toContainText(/lúa|gạo|tin|giá/i);
});
