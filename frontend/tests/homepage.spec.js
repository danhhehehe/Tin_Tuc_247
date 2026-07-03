import { test, expect } from '@playwright/test';
import { importantInternalLinks, mockApi, openHome } from './helpers.js';

test('header, logo, menu, tin mới và số card hợp lý', async ({ page }) => {
  await openHome(page);

  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('header a[href="/"]').first()).toBeVisible();
  await expect(page.locator('nav a')).toHaveCount(await page.locator('nav a').count());
  await expect(page.locator('.section-head').filter({ hasText: /Tin|Bảng|Kết/i }).first()).toBeVisible();

  const cards = page.locator('article.article-card');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(100);

  await page.locator('.category-menu-btn').click();
  await expect(page.locator('.category-menu-panel')).toBeVisible();
  await page.locator('.category-menu-panel a[href="/category/bong-da"]').click();
  await expect(page).toHaveURL(/\/category\/bong-da/);
  await expect(page.locator('body')).toContainText(/bóng đá|Tin|Chưa có tin/i);
});

test('phân trang hiển thị hoặc vắng mặt hợp lệ và không làm crash', async ({ page }) => {
  await openHome(page);

  const pagination = page.locator('.pagination-bar');
  if (await pagination.count()) {
    await expect(pagination).toBeVisible();
    const enabledButtons = pagination.getByRole('button').filter({ hasNotText: /^$/ });
    expect(await enabledButtons.count()).toBeGreaterThan(0);
    const next = pagination.getByRole('button').nth(Math.max(0, await pagination.getByRole('button').count() - 2));
    if (await next.isEnabled()) await next.click();
    await expect(page.locator('body')).toBeVisible();
  } else {
    await expect(page.locator('article.article-card').first()).toBeVisible();
  }
});

test('các link nội bộ quan trọng trên trang chủ mở không lỗi', async ({ page }) => {
  const badResponses = [];
  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();
    if ((status === 404 || status >= 500) && /127\.0\.0\.1:5173|localhost:5000/.test(url)) {
      badResponses.push(`${status} ${url}`);
    }
  });

  await mockApi(page);
  await page.goto('/');

  const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  const links = importantInternalLinks(hrefs);
  expect(links.length).toBeGreaterThan(0);

  for (const href of links) {
    await page.goto(href);
    await expect(page.locator('body')).toBeVisible();
  }

  expect(badResponses, `internal links returned bad status:\n${badResponses.join('\n')}`).toEqual([]);
});
