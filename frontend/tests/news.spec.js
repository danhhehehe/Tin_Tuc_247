import { test, expect } from '@playwright/test';
import { openHome } from './helpers.js';

test('click một tin bất kỳ mở được trang chi tiết', async ({ page }) => {
  await openHome(page);

  await page.locator('article.article-card a.article-title').first().click();
  await expect(page).toHaveURL(/\/article\//);
  await expect(page.locator('article h1, main h1, h1').first()).toBeVisible();
  await expect(page.locator('body')).toContainText(/Nội dung|Tóm tắt|Nguồn|Tin Tức|bóng đá|lúa gạo/i);

  const backLink = page.locator('a[href="/"]').first();
  if (await backLink.count()) {
    await backLink.click();
    await expect(page).toHaveURL(/\/$/);
  } else {
    await page.goBack();
    await expect(page.locator('body')).toBeVisible();
  }
});

test('danh mục mở được và hiển thị tin hoặc trạng thái rỗng hợp lý', async ({ page }) => {
  await openHome(page);

  for (const category of ['nong-nghiep', 'lua-gao', 'bong-da', 'cong-nghe']) {
    await page.goto(`/category/${category}`);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Cannot read properties|Internal Server Error|Something went wrong/i);
    const hasCards = await page.locator('article.article-card').count();
    const hasEmptyState = await page.locator('body').getByText(/Chưa có tin|Không tìm thấy|tin/i).count();
    expect(hasCards + hasEmptyState).toBeGreaterThan(0);
  }
});

test('ảnh trong card không để biểu tượng vỡ phá giao diện', async ({ page }) => {
  await openHome(page);
  await page.waitForLoadState('networkidle');

  const images = page.locator('article.article-card img');
  const totalImages = await images.count();
  for (let index = 0; index < totalImages; index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }
  await expect(page.locator('article.article-card img[src*="missing-news-image"]')).toHaveCount(0);

  const imageStates = await page.locator('article.article-card img').evaluateAll(async (images) => {
    const waitForImage = (img) => new Promise((resolve) => {
      if (img.complete) return resolve();
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      setTimeout(done, 2000);
    });

    for (const img of images) {
      img.scrollIntoView({ block: 'center' });
      await waitForImage(img);
    }

    return images.map((img) => ({
      src: img.currentSrc || img.src,
      complete: img.complete,
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
  });

  expect(imageStates.length).toBeGreaterThan(0);
  for (const state of imageStates) {
    expect(state.complete, `image did not complete: ${state.src}`).toBeTruthy();
    expect(state.width, `broken image width: ${state.src}`).toBeGreaterThan(0);
    expect(state.height, `broken image height: ${state.src}`).toBeGreaterThan(0);
  }
});

test('không render quá nhiều card trên một trang', async ({ page }) => {
  await openHome(page);
  const count = await page.locator('article.article-card').count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(100);
});
