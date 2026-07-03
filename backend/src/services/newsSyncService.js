import Parser from 'rss-parser';
import axios from 'axios';
import Article from '../models/Article.js';
import FeedSource from '../models/FeedSource.js';
import SyncLog from '../models/SyncLog.js';
import { crawlHtmlArticleSource, crawlHtmlListSource, extractArticleDetail } from './htmlCrawlerService.js';
import { extractFirstImage, limitText, makeSlug, estimateReadTime, stripHtml } from '../utils/text.js';
import { makeTags, smartCategory } from '../utils/category.js';
import { detectBetterCategory, getRiceRelevanceScore, isRiceArticle } from '../utils/categoryValidator.js';

const FEED_TIMEOUT = Number(process.env.FEED_TIMEOUT_MS || 10000);
const SYNC_CONCURRENCY = Number(process.env.SYNC_CONCURRENCY || 4);
const FEED_RETRIES = Number(process.env.FEED_RETRIES || 2);

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36 TinTuc247/1.2',
  Accept: 'application/rss+xml, application/xml, text/xml, text/html, */*'
};

const parser = new Parser({
  timeout: FEED_TIMEOUT,
  headers: REQUEST_HEADERS,
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator']
    ]
  }
});

let activeSyncPromise = null;
let activeSyncStartedAt = null;
let indexesReadyPromise = null;

export function isSyncActive() {
  return Boolean(activeSyncPromise);
}

export function getActiveSyncInfo() {
  return {
    syncing: isSyncActive(),
    startedAt: activeSyncStartedAt
  };
}

export async function syncAllFeedsLocked() {
  if (activeSyncPromise) return activeSyncPromise;
  activeSyncStartedAt = new Date();
  activeSyncPromise = syncAllFeeds().finally(() => {
    activeSyncPromise = null;
    activeSyncStartedAt = null;
  });
  return activeSyncPromise;
}

async function ensureArticleIndexes() {
  if (!indexesReadyPromise) {
    indexesReadyPromise = Article.syncIndexes().catch((error) => {
      indexesReadyPromise = null;
      throw error;
    });
  }
  return indexesReadyPromise;
}

function getNestedMediaUrl(media) {
  if (!media) return '';
  if (media.$?.url) return media.$.url;
  if (media.url) return media.url;
  if (Array.isArray(media)) return getNestedMediaUrl(media[0]);
  return '';
}

function getImage(item) {
  return (
    item.imageUrl ||
    item.enclosure?.url ||
    getNestedMediaUrl(item.mediaContent) ||
    getNestedMediaUrl(item.mediaThumbnail) ||
    item.image?.url ||
    extractFirstImage(item.contentEncoded || item.content || item.description || item.summary || item.contentSnippet || '')
  );
}

function normalizeDate(item) {
  const date = item.isoDate || item.pubDate || item.published || item.updated;
  const parsed = date ? new Date(date) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizeUrl(url = '') {
  return String(url)
    .replace(/&utm_[^&]+/g, '')
    .replace(/\?utm_[^#]+/g, '')
    .trim();
}

function cleanTitle(title = '') {
  return stripHtml(title)
    .replace(/\s+-\s+VnExpress$/i, '')
    .replace(/\s+-\s+Tuoi Tre Online$/i, '')
    .trim();
}

function chooseLongestText(...values) {
  return values
    .map((value) => stripHtml(value || ''))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || '';
}

function getAuthor(item) {
  return stripHtml(item.creator || item.author || item['dc:creator'] || '').slice(0, 160);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status = error.response?.status || error.statusCode || error.status;
  return !status || status === 408 || status === 429 || status >= 500;
}

function classifyError(error) {
  const rawMessage = error?.message || error?.cause?.message || (typeof error === 'string' ? error : '');
  const code = error.code || error.cause?.code || '';
  const aggregateMessage = error?.name === 'AggregateError' || code === 'EACCES'
    ? `${error.name || 'Network error'}${code ? ` (${code})` : ''}`
    : '';
  const message = rawMessage || aggregateMessage || JSON.stringify(error || {});
  const status = error.response?.status || error.statusCode || error.status;
  let type = 'unknown';

  if (code === 'ECONNABORTED' || /timeout/i.test(message)) type = 'timeout';
  else if (status) type = 'http';
  else if (['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'EACCES'].includes(code)) type = 'network';
  else if (/Non-whitespace before first tag|Invalid character|Unexpected close tag|RSS\/XML|XML/i.test(message)) type = 'parse';
  else if (error.name?.includes('Mongo') || /duplicate key|validation|E11000|Updating the path/i.test(message)) type = 'mongo';

  return { type, status, reason: message };
}

function logSourceError(source, error, attempts = 1) {
  const details = classifyError(error);
  console.error('[RSS ERROR]');
  console.error(`Source: ${source.name}`);
  console.error(`URL: ${source.url}`);
  if (details.status) console.error(`HTTP status: ${details.status}`);
  console.error(`Type: ${details.type}`);
  console.error(`Attempts: ${attempts}`);
  console.error(`Reason: ${details.reason}`);
  return details;
}

async function fetchFeed(source) {
  try {
    return await parser.parseURL(source.url);
  } catch (parseUrlError) {
    const response = await axios.get(source.url, {
      timeout: FEED_TIMEOUT,
      responseType: 'text',
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        ...REQUEST_HEADERS,
        Referer: source.homepage || 'https://www.google.com/'
      }
    });

    const xml = String(response.data || '').trim();
    if (!xml.includes('<rss') && !xml.includes('<feed') && !xml.includes('<rdf')) {
      throw new Error(`Source did not return valid RSS/XML. Initial parser error: ${parseUrlError.message}`);
    }
    return parser.parseString(xml);
  }
}

async function fetchFeedWithRetry(source) {
  let lastError;

  for (let attempt = 1; attempt <= FEED_RETRIES + 1; attempt += 1) {
    try {
      const feed = await fetchFeed(source);
      return { feed, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt > FEED_RETRIES || !isRetryableError(error)) break;
      await sleep(500 * attempt);
    }
  }

  lastError.attempts = FEED_RETRIES + 1;
  throw lastError;
}

async function fetchSource(source) {
  if (source.type === 'html-list') {
    const result = await crawlHtmlListSource(source);
    return { feed: result, attempts: 1 };
  }
  if (source.type === 'html-article') {
    const result = await crawlHtmlArticleSource(source);
    return { feed: result, attempts: 1 };
  }
  return fetchFeedWithRetry(source);
}

async function upsertArticleFromItem(item, source, index) {
  const title = cleanTitle(item.title || '');
  const rawUrl = item.link || item.guid || item.id || '';
  const url = normalizeUrl(rawUrl);
  if (!title || !url) return { skipped: true };

  let hydratedItem = item;
  const initialText = chooseLongestText(item.contentEncoded, item.content, item.description, item.summary, item.contentSnippet);
  const detailHydrationLimit = Number(process.env.RSS_DETAIL_PER_SOURCE || 3);
  if ((source.type === 'rss' || source.type === 'google-news' || !source.type) && index < detailHydrationLimit && initialText.length < 600) {
    try {
      const detail = await extractArticleDetail(url, { ...source.toObject?.(), type: 'html-article' });
      hydratedItem = {
        ...item,
        ...detail,
        title: item.title || detail.title,
        link: url,
        crawlType: source.type === 'google-news' ? 'google-news' : 'rss'
      };
    } catch (error) {
      console.warn(`[DETAIL SKIP] ${source.name} | ${url} | ${error.message}`);
    }
  }

  const description = chooseLongestText(hydratedItem.description, hydratedItem.summary, hydratedItem.contentSnippet);
  const fullText = chooseLongestText(hydratedItem.contentEncoded, hydratedItem.content, hydratedItem.description, hydratedItem.summary, hydratedItem.contentSnippet);
  const summary = limitText(description || fullText || title, 420);
  const content = fullText || summary;
  const articleForValidation = { title, summary, description, content, tags: [] };
  let category = smartCategory(title, `${summary} ${content}`, source.category);
  const betterCategory = detectBetterCategory(articleForValidation, category);
  if (betterCategory === 'giao-thong') {
    category = 'giao-thong';
  } else if ((source.category === 'lua-gao' || category === 'lua-gao') && !isRiceArticle(articleForValidation)) {
    category = detectBetterCategory(articleForValidation, 'khac');
  }
  const tags = makeTags(title, `${summary} ${content}`, category);
  const relevanceScore = getRiceRelevanceScore({ ...articleForValidation, tags });
  const imageUrl = getImage(hydratedItem) || '';
  const publishedAt = normalizeDate(hydratedItem);
  const slugBase = makeSlug(title, url);
  const slug = `${slugBase}-${Math.abs(hashCode(url)).toString(36)}`;
  const now = new Date();
  const readingTime = estimateReadTime(`${title} ${summary} ${content}`);

  const doc = {
    title,
    slug,
    summary,
    content,
    description: description || summary,
    imageUrl,
    url,
    source: source.name,
    sourceName: source.name,
    sourceUrl: source.homepage,
    category,
    tags,
    language: source.language || 'vi',
    author: getAuthor(hydratedItem),
    publishedAt,
    fetchedAt: now,
    readTime: readingTime,
    readingTime,
    crawlType: hydratedItem.crawlType || source.type || 'rss',
    relevanceScore,
    isFeatured: index < 2 && source.priority >= 4,
    aiBrief: makeAiBrief(title, summary, category)
  };

  const existed = await Article.exists({ url });
  await Article.findOneAndUpdate(
    { url },
    { $set: doc },
    { upsert: true, new: true }
  );

  return {
    inserted: existed ? 0 : 1,
    updated: existed ? 1 : 0
  };
}

function makeAiBrief(title, summary, category) {
  const label = category.replaceAll('-', ' ');
  const base = summary || title;
  return `Tóm tắt nhanh: Tin thuộc nhóm ${label}. ${limitText(base, 180)}`;
}

function hashCode(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export async function syncOneFeed(source) {
  await ensureArticleIndexes();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const maxItems = Number(process.env.MAX_ITEMS_PER_FEED || 25);

  try {
    const { feed, attempts = 1 } = await fetchSource(source);
    const items = (feed.items || []).slice(0, maxItems);

    for (const [index, item] of items.entries()) {
      try {
        const result = await upsertArticleFromItem(item, source, index);
        inserted += result.inserted || 0;
        updated += result.updated || 0;
        skipped += result.skipped ? 1 : 0;
      } catch (error) {
        const details = logSourceError(source, error, attempts);
        await FeedSource.findByIdAndUpdate(source._id, {
          lastFetchedAt: new Date(),
          lastStatus: 'failed',
          lastError: `Mongo save error: ${details.reason}`
        });
        return {
          ok: false,
          source: source.name,
          url: source.url,
          inserted,
          updated,
          skipped,
          total: items.length,
          error: details.reason,
          errorType: details.type,
          status: details.status,
          attempts
        };
      }
    }

    await FeedSource.findByIdAndUpdate(source._id, {
      lastFetchedAt: new Date(),
      lastStatus: 'success',
      lastError: ''
    });

    console.log('[SOURCE OK]');
    console.log(`Name: ${source.name}`);
    console.log(`URL: ${source.url}`);
    console.log(`Type: ${source.type || 'rss'}`);
    console.log(`Fetched articles: ${items.length}`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    return { ok: true, source: source.name, url: source.url, type: source.type || 'rss', inserted, updated, skipped, total: items.length, attempts };
  } catch (error) {
    const attempts = error.attempts || 1;
    const details = logSourceError(source, error, attempts);
    await FeedSource.findByIdAndUpdate(source._id, {
      lastFetchedAt: new Date(),
      lastStatus: 'failed',
      lastError: details.reason
    });
    return {
      ok: false,
      source: source.name,
      url: source.url,
      type: source.type || 'rss',
      inserted,
      updated,
      skipped,
      total: 0,
      error: details.reason,
      errorType: details.type,
      status: details.status,
      attempts
    };
  }
}

async function runWithLimit(items, limit, handler) {
  const results = [];
  let cursor = 0;
  const workerCount = Math.max(1, Math.min(limit, items.length));

  async function worker() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      try {
        results[currentIndex] = await handler(items[currentIndex], currentIndex);
      } catch (error) {
        results[currentIndex] = {
          ok: false,
          source: items[currentIndex]?.name || 'Unknown source',
          url: items[currentIndex]?.url || '',
          type: items[currentIndex]?.type || 'rss',
          inserted: 0,
          updated: 0,
          skipped: 0,
          total: 0,
          error: error.message || 'Unexpected sync error',
          errorType: 'unexpected',
          attempts: 1
        };
      }
    }
  }

  await Promise.allSettled(Array.from({ length: workerCount }, worker));
  return results;
}

export async function syncAllFeeds() {
  const startedAt = new Date();
  console.log('[SYNC START]');
  const log = await SyncLog.create({ startedAt: new Date() });
  const sources = await FeedSource.find({ enabled: true, active: { $ne: false } }).sort({ priority: -1, name: 1 });
  console.log(`Total sources: ${sources.length}`);

  const results = await runWithLimit(sources, SYNC_CONCURRENCY, syncOneFeed);

  const inserted = results.reduce((sum, item) => sum + (item?.inserted || 0), 0);
  const updated = results.reduce((sum, item) => sum + (item?.updated || 0), 0);
  const skipped = results.reduce((sum, item) => sum + (item?.skipped || 0), 0);
  const failed = results.filter((item) => !item?.ok).length;
  const success = results.filter((item) => item?.ok).length;
  const errors = results
    .filter((item) => !item?.ok)
    .map((item) => ({
      source: item.source,
      url: item.url,
      type: item.type,
      status: item.status,
      reason: item.error,
      errorType: item.errorType,
      attempts: item.attempts
    }));

  log.finishedAt = new Date();
  log.totalFeeds = sources.length;
  log.inserted = inserted;
  log.updated = updated;
  log.skipped = skipped;
  log.failed = failed;
  log.success = success;
  log.sourceErrors = errors;
  log.message = `Synced ${sources.length} sources: ${success} success, inserted ${inserted}, updated ${updated}, skipped ${skipped}, failed ${failed}.`;
  await log.save();
  const durationMs = log.finishedAt.getTime() - log.startedAt.getTime();
  console.log('[RSS SYNC SUMMARY]');
  console.log(`Total sources: ${sources.length}`);
  console.log(`Success sources: ${success}`);
  console.log(`Failed sources: ${failed}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Duration: ${Math.round(durationMs / 1000)}s`);
  if (errors.length) console.table(errors);
  console.log('[SYNC DONE]');
  console.log(`Success sources: ${success}`);
  console.log(`Failed sources: ${failed}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Duration: ${Math.round((new Date().getTime() - startedAt.getTime()) / 1000)}s`);

  return {
    ...log.toObject(),
    totalSources: sources.length,
    successSources: success,
    failedSources: failed,
    inserted,
    updated,
    skipped,
    errors,
    results
  };
}
