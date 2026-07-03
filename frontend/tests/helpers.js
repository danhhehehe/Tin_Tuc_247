import { expect } from '@playwright/test';

const now = '2026-07-03T10:00:00.000Z';

export const articles = [
  {
    _id: 'a1',
    slug: 'tin-bong-da-moi-nhat',
    title: 'Tin bóng đá mới nhất trong ngày',
    summary: 'Lịch thi đấu, tỉ số và các diễn biến đáng chú ý được cập nhật liên tục.',
    description: 'Bản tin bóng đá có lịch, tỉ số và video nổi bật.',
    content: 'Nội dung chi tiết về tin bóng đá mới nhất, lịch thi đấu và tỉ số hôm nay.',
    category: 'bong-da',
    sourceName: 'Tin Tức 247',
    publishedAt: now,
    fetchedAt: now,
    imageUrl: '/missing-news-image.jpg',
    views: 24,
  },
  {
    _id: 'a2',
    slug: 'gia-lua-gao-dbscl',
    title: 'Giá lúa gạo ĐBSCL cập nhật mới',
    summary: 'Bảng giá lúa gạo có dữ liệu tham khảo theo khu vực và nguồn tin.',
    description: 'Giá lúa, giá gạo và thông tin thị trường nông nghiệp.',
    content: 'Nội dung chi tiết về giá lúa gạo, khu vực ĐBSCL và nguồn cập nhật.',
    category: 'lua-gao',
    sourceName: 'Bản tin lúa gạo',
    publishedAt: now,
    fetchedAt: now,
    imageUrl: '',
    views: 18,
  },
  {
    _id: 'a3',
    slug: 'nong-nghiep-xanh',
    title: 'Nông nghiệp xanh tăng tốc',
    summary: 'Các mô hình sản xuất mới giúp nông dân giảm chi phí và tăng năng suất.',
    description: 'Tin nông nghiệp mới nhất trong nước.',
    content: 'Nội dung chi tiết về nông nghiệp xanh và chuyển đổi số trong sản xuất.',
    category: 'nong-nghiep',
    sourceName: 'Nông nghiệp Việt',
    publishedAt: now,
    fetchedAt: now,
    imageUrl: '',
    views: 12,
  },
  {
    _id: 'a4',
    slug: 'cong-nghe-ai',
    title: 'Công nghệ AI hỗ trợ đọc tin nhanh',
    summary: 'Trợ lý AI giúp tìm kiếm và tóm tắt tin tức theo nhu cầu.',
    description: 'Ứng dụng công nghệ trong trải nghiệm đọc tin.',
    content: 'Nội dung chi tiết về AI, tìm kiếm và tóm tắt tin tức.',
    category: 'cong-nghe',
    sourceName: 'Tech Daily',
    publishedAt: now,
    fetchedAt: now,
    imageUrl: '',
    views: 9,
  },
];

const categories = [
  { key: 'moi-nhat', label: 'Mới nhất', icon: '•', count: 4 },
  { key: 'nong-nghiep', label: 'Nông nghiệp', icon: '•', count: 1 },
  { key: 'lua-gao', label: 'Lúa gạo', icon: '•', count: 1 },
  { key: 'bong-da', label: 'Bóng đá', icon: '•', count: 1 },
  { key: 'cong-nghe', label: 'Công nghệ', icon: '•', count: 1 },
];

const ricePrices = [
  {
    variety: 'Lúa OM 18',
    group: 'lua-tuoi',
    priceText: '8.200 đ/kg',
    unit: 'đ/kg',
    region: 'ĐBSCL',
    sourceName: 'Giá lúa tham khảo',
    sourceUrl: 'https://example.com/rice',
    priceDate: now,
    fetchedAt: now,
    trend: 'stable',
    changeText: 'Ổn định',
    referenceOnly: true,
  },
  {
    variety: 'Gạo nguyên liệu IR 504',
    group: 'gao-nguyen-lieu',
    priceText: '12.500 đ/kg',
    unit: 'đ/kg',
    region: 'An Giang',
    sourceName: 'Thị trường gạo',
    priceDate: now,
    fetchedAt: now,
    trend: 'up',
    changeText: '+100 đ',
    referenceOnly: true,
  },
];

const sources = [
  {
    _id: 's1',
    name: 'Báo Nông nghiệp',
    url: 'https://example.com/rss',
    homepage: 'https://example.com',
    category: 'nong-nghiep',
    enabled: true,
    lastStatus: 'success',
  },
  {
    _id: 's2',
    name: 'Tin thể thao',
    url: 'https://example.com/sport-rss',
    homepage: 'https://example.com/sport',
    category: 'bong-da',
    enabled: true,
    lastStatus: 'success',
  },
];

function json(body, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}

function filteredArticles(url) {
  const query = (url.searchParams.get('q') || '').toLowerCase();
  const category = url.searchParams.get('category');
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 24);
  let data = articles;

  if (category) data = data.filter((item) => item.category === category);
  if (query) {
    data = data.filter((item) => {
      const text = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
      return text.includes(query);
    });
  }

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageData = data.slice(start, start + limit);

  return {
    data: pageData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      displayCap: 100,
    },
  };
}

export async function mockApi(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api', '') || '/';

    if (path.startsWith('/articles/') && !path.includes('/featured') && !path.includes('/categories') && !path.includes('/stats')) {
      const slug = decodeURIComponent(path.replace('/articles/', ''));
      const article = articles.find((item) => item.slug === slug);
      return route.fulfill(json(article || { message: 'Not found' }, article ? 200 : 404));
    }

    if (path === '/articles') return route.fulfill(json(filteredArticles(url)));
    if (path === '/articles/featured') return route.fulfill(json({ data: articles.slice(0, 3) }));
    if (path === '/articles/categories/list') return route.fulfill(json(categories));
    if (path === '/articles/stats/overview') {
      return route.fulfill(json({
        total: articles.length,
        sourceCount: sources.length,
        newest: articles[0],
        popular: articles.slice(0, 3),
      }));
    }

    if (path === '/sync/status') {
      return route.fulfill(json({
        articleCount: articles.length,
        activeSourceCount: sources.length,
        syncIntervalMinutes: 30,
        lastSync: now,
        nextSync: now,
        syncing: false,
        total: articles.length,
        displayCap: 100,
      }));
    }
    if (path === '/sync/run') return route.fulfill(json({ message: 'Đã cập nhật tin.', syncing: false }));
    if (path === '/sync/logs') return route.fulfill(json([{ _id: 'l1', createdAt: now, message: 'Cập nhật thành công.' }]));

    if (path === '/assistant/status') {
      return route.fulfill(json({ providers: { local: { configured: true } } }));
    }
    if (path === '/assistant/chat' || path === '/assistant/search') {
      const body = request.postDataJSON?.() || {};
      const query = String(body.query || '');
      const data = query.toLowerCase().includes('zzzzzzzztest') ? [] : articles.slice(0, 2);
      return route.fulfill(json({
        provider: 'local',
        model: 'fallback',
        answer: data.length
          ? `Tóm tắt nhanh cho "${query}": có tin mới phù hợp.`
          : `Không tìm thấy tin phù hợp cho "${query}".`,
        suggestions: ['bóng đá', 'lúa gạo'],
        data,
      }));
    }

    if (path === '/rice-prices/latest') {
      return route.fulfill(json({ data: ricePrices, message: 'Dữ liệu giá lúa gạo tham khảo.' }));
    }
    if (path === '/rice-prices/sync') {
      return route.fulfill(json({ data: ricePrices, message: 'Đã cập nhật bảng giá lúa gạo.' }));
    }

    if (path === '/football/widget') {
      return route.fulfill(json({
        mode: 'fallback-news',
        provider: 'local',
        message: 'Tin bóng đá fallback đang sẵn sàng.',
        config: { theSportsDbMode: 'fallback' },
        data: {
          today: [],
          live: [],
          finished: [],
          news: [articles[0]],
          highlights: [],
        },
      }));
    }
    if (path === '/football/sync') return route.fulfill(json({ message: 'Đã cập nhật bóng đá.' }));

    if (path === '/sources') return route.fulfill(json(sources));
    if (path.startsWith('/sources/')) return route.fulfill(json({ ok: true }));

    return route.fulfill(json({ message: `Unhandled test endpoint: ${path}` }, 200));
  });
}

export async function openHome(page) {
  await mockApi(page);
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('article.article-card').first()).toBeVisible();
}

export async function stabilizePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
      .pulse-dot {
        animation: none !important;
      }
    `,
  });
  await page.waitForLoadState('networkidle');
}

export async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

export function importantInternalLinks(hrefs) {
  return [...new Set(hrefs)]
    .filter(Boolean)
    .filter((href) => href.startsWith('/'))
    .filter((href) => !href.startsWith('//'))
    .slice(0, 12);
}
