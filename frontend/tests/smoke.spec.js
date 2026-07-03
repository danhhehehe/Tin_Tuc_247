import { test, expect } from '@playwright/test';
import { openHome } from './helpers.js';

test('trang chủ mở được, có nội dung và không hiện lỗi thô', async ({ page }) => {
  await openHome(page);

  const body = page.locator('body');
  await expect(body).toBeVisible();
  await expect(body).toContainText(/Tin|Tức|247|bóng đá|lúa|gạo|nông nghiệp/i);

  const pageState = await page.evaluate(() => {
    const bodyBox = document.body.getBoundingClientRect();
    const text = document.body.innerText.trim();
    return {
      height: bodyBox.height,
      textLength: text.length,
      background: getComputedStyle(document.body).backgroundColor,
    };
  });

  expect(pageState.height).toBeGreaterThan(400);
  expect(pageState.textLength).toBeGreaterThan(200);
  await expect(body).not.toContainText(/Something went wrong|Cannot read properties|Internal Server Error|NaN/i);
});
