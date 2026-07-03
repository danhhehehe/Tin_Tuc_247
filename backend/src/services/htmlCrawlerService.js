import { load } from 'cheerio';
import { limitText } from '../utils/text.js';
import { absoluteUrl, extractArticleFromHtml, fetchHtml, looksJavascriptRendered, normalizeSpace } from '../utils/articleExtractor.js';

export async function extractArticleDetail(url, source) {
  const html = await fetchHtml(url);
  return extractArticleFromHtml(html, url, source);
}

function extractListItems(html, source) {
  const $ = load(html);
  const items = [];
  const baseUrl = source.url;
  const linkSelectors = source.parserConfig?.itemSelector || 'article a[href], .news-item a[href], .post a[href], .item a[href], h2 a[href], h3 a[href], a[href]';

  $(linkSelectors).each((_, element) => {
    const href = $(element).attr('href');
    const url = absoluteUrl(href, baseUrl);
    const title = normalizeSpace($(element).attr('title') || $(element).text());
    if (!url || !title || title.length < 12) return;
    if (items.some((item) => item.link === url)) return;

    const parent = $(element).closest('article, .news-item, .post, .item, li, div');
    const description = normalizeSpace(parent.find('.summary, .desc, .sapo, p').first().text());
    const imageUrl = absoluteUrl(parent.find('img').first().attr('src') || parent.find('img').first().attr('data-src') || '', baseUrl);

    items.push({
      title,
      link: url,
      contentSnippet: limitText(description, 420),
      description,
      imageUrl,
      enclosure: imageUrl ? { url: imageUrl } : undefined,
      pubDate: new Date().toISOString(),
      crawlType: 'html-list'
    });
  });

  return items.slice(0, Number(process.env.MAX_ITEMS_PER_HTML_SOURCE || 12));
}

export async function crawlHtmlListSource(source) {
  const html = await fetchHtml(source.url);
  const items = extractListItems(html, source);

  if (!items.length) {
    const reason = source.parserConfig?.requiresJs || looksJavascriptRendered(html)
      ? 'JavaScript-rendered page, need Playwright/Puppeteer or API endpoint'
      : 'No article links found with HTML selectors';
    throw new Error(`Source name: ${source.name}; URL: ${source.url}; Reason: ${reason}`);
  }

  const detailLimit = Number(process.env.HTML_DETAIL_PER_SOURCE || 5);
  const withDetails = [];
  for (const item of items) {
    if (withDetails.length < detailLimit) {
      try {
        const detail = await extractArticleDetail(item.link, source);
        withDetails.push({ ...item, ...detail, title: detail.title || item.title });
        continue;
      } catch {
        // List item is still useful when detail crawl fails.
      }
    }
    withDetails.push(item);
  }

  return { items: withDetails };
}

export async function crawlHtmlArticleSource(source) {
  const item = await extractArticleDetail(source.url, source);
  if (!item.title || !item.link) throw new Error('HTML article missing title or URL');
  return { items: [item] };
}
