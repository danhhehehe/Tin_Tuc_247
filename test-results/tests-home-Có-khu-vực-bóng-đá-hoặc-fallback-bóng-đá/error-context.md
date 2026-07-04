# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\home.spec.js >> Có khu vực bóng đá hoặc fallback bóng đá
- Location: tests\home.spec.js:18:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Trang chủ Tin Tức 247 mở được', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   await expect(page).toHaveTitle(/Tin|News|247/i);
  7  | 
  8  |   await expect(page.locator('body')).toContainText(/tin|mới|bóng đá|lúa|gạo/i);
  9  | });
  10 | 
  11 | test('Không hiện chữ quản trị/RSS thừa ngoài giao diện', async ({ page }) => {
  12 |   await page.goto('/');
  13 | 
  14 |   await expect(page.getByText('Quản trị đơn giản')).toHaveCount(0);
  15 |   await expect(page.getByText('Quản lý nguồn tin RSS')).toHaveCount(0);
  16 | });
  17 | 
  18 | test('Có khu vực bóng đá hoặc fallback bóng đá', async ({ page }) => {
> 19 |   await page.goto('/');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  20 | 
  21 |   await expect(page.locator('body')).toContainText(/bóng đá|thể thao|lịch|tỉ số/i);
  22 | });
  23 | 
  24 | test('Có khu vực lúa gạo hoặc bảng giá lúa gạo', async ({ page }) => {
  25 |   await page.goto('/');
  26 | 
  27 |   await expect(page.locator('body')).toContainText(/lúa|gạo|giá/i);
  28 | });
```