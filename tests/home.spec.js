import { test, expect } from '@playwright/test';

test('Trang chủ Tin Tức 247 mở được', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Tin|News|247/i);

  await expect(page.locator('body')).toContainText(/tin|mới|bóng đá|lúa|gạo/i);
});

test('Không hiện chữ quản trị/RSS thừa ngoài giao diện', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Quản trị đơn giản')).toHaveCount(0);
  await expect(page.getByText('Quản lý nguồn tin RSS')).toHaveCount(0);
});

test('Có khu vực bóng đá hoặc fallback bóng đá', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toContainText(/bóng đá|thể thao|lịch|tỉ số/i);
});

test('Có khu vực lúa gạo hoặc bảng giá lúa gạo', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toContainText(/lúa|gạo|giá/i);
});