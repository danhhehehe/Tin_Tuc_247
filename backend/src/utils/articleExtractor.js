import axios from 'axios';
import { load } from 'cheerio';
import { limitText, stripHtml } from './text.js';

const TIMEOUT = Number(process.env.HTML_CRAWL_TIMEOUT_MS || process.env.FEED_TIMEOUT_MS || 10000);

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36 TinTuc247/1.2',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

export function normalizeSpace(text = '') {
  return stripHtml(text)
    .replace(/\b(Doc tiep|Xem them|Binh luan|Chia se)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function absoluteUrl(url = '', baseUrl = '') {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return '';
  }
}

export async function fetchHtml(url) {
  const response = await axios.get(url, {
    timeout: TIMEOUT,
    responseType: 'text',
    maxRedirects: 5,
    headers: REQUEST_HEADERS,
    validateStatus: (status) => status >= 200 && status < 400
  });
  return String(response.data || '');
}

export function pickText($, selectors = []) {
  for (const selector of selectors) {
    const node = $(selector).first();
    const value = normalizeSpace(node.text() || node.attr('content'));
    if (value) return value;
  }
  return '';
}

export function pickAttr($, selectors = [], attr = 'content') {
  for (const selector of selectors) {
    const value = $(selector).first().attr(attr);
    if (value) return String(value).trim();
  }
  return '';
}

export function extractContent($) {
  const selectors = [
    '.article-content', '.detail-content', '.content-detail', '.news-content',
    '.entry-content', '.post-content', '.single-content', '.article__body',
    '.fck_detail', '.detail-cmain', '.cms-body', '.maincontent', 'article'
  ];

  for (const selector of selectors) {
    const clone = $(selector).first().clone();
    clone.find([
      'script', 'style', 'nav', 'footer', 'header', 'iframe', 'form',
      '.comment', '.comments', '.ads', '.advertisement', '.banner',
      '.related', '.social', '.share', '.breadcrumb'
    ].join(',')).remove();
    const text = normalizeSpace(clone.text());
    if (text.length > 120) return text;
  }

  return '';
}

export function looksJavascriptRendered(html = '') {
  const text = String(html || '');
  return /enable javascript|bat javascript|requires javascript|__next|nuxt|window\.__INITIAL_STATE__|id="root"/i.test(text);
}

export function extractArticleFromHtml(html, url, source = {}) {
  const $ = load(html);
  const title = pickText($, [
    'h1',
    '.article-title',
    '.detail-title',
    '.entry-title',
    '.post-title',
    'meta[property="og:title"]',
    'title'
  ]);
  const description = pickText($, [
    'meta[name="description"]',
    'meta[property="og:description"]',
    '.sapo',
    '.summary',
    '.lead',
    '.article-summary'
  ]);
  const content = extractContent($) || description;
  const imageUrl = absoluteUrl(
    pickAttr($, ['meta[property="og:image"]']) ||
      pickAttr($, ['meta[name="twitter:image"]']) ||
      pickAttr($, ['img'], 'src') ||
      pickAttr($, ['img'], 'data-src'),
    url
  );
  const author = pickText($, ['.author', '.article-author', '[rel="author"]', '.byline']);
  const publishedAtText = pickAttr($, ['meta[property="article:published_time"]']) ||
    pickAttr($, ['time'], 'datetime') ||
    pickText($, ['time', '.date', '.time', '.publish-date']);
  const publishedAt = publishedAtText ? new Date(publishedAtText) : new Date();

  return {
    title,
    link: url,
    contentSnippet: limitText(description || content, 420),
    description,
    content,
    contentEncoded: content,
    imageUrl,
    enclosure: imageUrl ? { url: imageUrl } : undefined,
    author,
    pubDate: Number.isNaN(publishedAt.getTime()) ? new Date().toISOString() : publishedAt.toISOString(),
    crawlType: source.type || 'html-article'
  };
}
