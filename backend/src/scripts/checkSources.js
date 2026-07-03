import dotenv from 'dotenv';
import axios from 'axios';
import { load } from 'cheerio';
import { connectDB } from '../config/db.js';
import FeedSource from '../models/FeedSource.js';
import { seedDefaultFeeds } from '../services/feedSeeder.js';
import { looksJavascriptRendered } from '../utils/articleExtractor.js';

dotenv.config();

const TIMEOUT = Number(process.env.SOURCE_CHECK_TIMEOUT_MS || 8000);

function classify(error) {
  return {
    ok: false,
    status: error.response?.status || '',
    message: error.message || 'Unknown error',
    needsJs: false,
    hasArticle: false
  };
}

async function checkSource(source) {
  try {
    const response = await axios.get(source.url, {
      timeout: TIMEOUT,
      responseType: 'text',
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 TinTuc247/1.2',
        Accept: 'application/rss+xml, application/xml, text/html, */*'
      },
      validateStatus: (status) => status >= 200 && status < 500
    });

    const body = String(response.data || '');
    const $ = load(body);
    const isFeed = /<rss|<feed|<rdf/i.test(body);
    const hasArticle = isFeed
      ? $('item, entry').length > 0
      : $('article a[href], h1, h2 a[href], h3 a[href], .news-item a[href], a[href]').length > 0;
    const needsJs = Boolean(source.parserConfig?.requiresJs) || (!hasArticle && looksJavascriptRendered(body));

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      message: response.status >= 400 ? `HTTP ${response.status}` : '',
      needsJs,
      hasArticle
    };
  } catch (error) {
    return classify(error);
  }
}

await connectDB(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247');
await seedDefaultFeeds();

const sources = await FeedSource.find({ enabled: true, active: { $ne: false } }).sort({ category: 1, priority: -1, name: 1 }).lean();
const results = [];

console.log('[SOURCE CHECK START]');
console.log(`Total sources: ${sources.length}`);

for (const source of sources) {
  const result = await checkSource(source);
  results.push({ source, result });
  const marker = result.ok && result.hasArticle ? '[SOURCE OK]' : '[SOURCE WARN]';
  console.log(marker);
  console.log(`Name: ${source.name}`);
  console.log(`URL: ${source.url}`);
  console.log(`Type: ${source.type || 'rss'}`);
  console.log(`HTTP status: ${result.status || 'n/a'}`);
  console.log(`Has article: ${result.hasArticle}`);
  console.log(`Needs JavaScript: ${result.needsJs}`);
  if (result.message) console.log(`Message: ${result.message}`);
}

const ok = results.filter(({ result }) => result.ok && result.hasArticle).length;
const needsJs = results.filter(({ result }) => result.needsJs).length;
console.log('[SOURCE CHECK DONE]');
console.log(`Accessible with articles: ${ok}`);
console.log(`Needs JavaScript: ${needsJs}`);
console.log(`Failed or empty: ${sources.length - ok}`);

process.exit(0);
