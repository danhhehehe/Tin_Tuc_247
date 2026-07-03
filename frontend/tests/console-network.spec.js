import { test, expect } from '@playwright/test';
import { mockApi } from './helpers.js';

test('không có console error, pageerror hoặc lỗi network nghiêm trọng', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  const badResponses = [];
  const failedRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();
    const isIgnoredAsset = /favicon|logo-tintuc247|missing-news-image|\.svg|\.png|\.jpg|\.jpeg|\.webp/i.test(url);
    if ((status >= 500 || status === 404) && !isIgnoredAsset) {
      badResponses.push(`${status} ${url}`);
    }
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    const type = request.resourceType();
    if (!['image', 'media', 'font'].includes(type)) {
      failedRequests.push(`${type} ${url}: ${request.failure()?.errorText || 'failed'}`);
    }
  });

  await mockApi(page);
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await page.waitForLoadState('networkidle');

  expect(pageErrors, `page errors:\n${pageErrors.join('\n')}`).toEqual([]);
  expect(consoleErrors, `console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  expect(badResponses, `bad responses:\n${badResponses.join('\n')}`).toEqual([]);
  expect(failedRequests, `failed requests:\n${failedRequests.join('\n')}`).toEqual([]);
});
