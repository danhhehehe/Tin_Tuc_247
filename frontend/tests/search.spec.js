import { test, expect } from '@playwright/test';
import { openHome } from './helpers.js';

test('tìm kiếm từ khóa phổ biến có kết quả hoặc thông báo hợp lệ', async ({ page }) => {
  await openHome(page);

  const input = page.locator('.assistant-actions input').first();
  await input.fill('bóng đá');
  await page.locator('.assistant-actions .primary-btn').first().click();

  await expect(page.locator('body')).toContainText(/bóng đá|Tóm tắt|tin|Không tìm thấy/i);
  await expect(page.locator('body')).not.toContainText(/Cannot read properties|Something went wrong/i);
});

test('tìm kiếm từ khóa linh tinh không crash và có phản hồi rõ', async ({ page }) => {
  await openHome(page);

  const input = page.locator('.assistant-actions input').first();
  await input.fill('zzzzzzzztest');
  await page.locator('.assistant-actions .primary-btn').first().click();

  await expect(page.locator('body')).toContainText(/Không tìm thấy|zzzzzzzztest|tin phù hợp|thử/i);
  await expect(page.locator('body')).toBeVisible();
});

test('AI assistant phản hồi bằng fallback/local khi cần', async ({ page }) => {
  await openHome(page);

  await page.locator('.assistant-actions input').first().fill('Tóm tắt tin mới nhất');
  await page.locator('.assistant-actions .primary-btn').first().click();

  await expect(page.locator('.ai-answer-card').first()).toContainText(/local|Tóm tắt|tin mới|AI/i);
});
