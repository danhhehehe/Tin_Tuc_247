import Article from '../../models/Article.js';
import { normalizeTextFields } from '../../utils/textNormalize.js';

export const footballNewsFallbackProvider = {
  name: 'article-db',
  hasConfig() {
    return process.env.FOOTBALL_FALLBACK_TO_NEWS !== 'false';
  },
  async fetchNews(limit = 5) {
    if (!this.hasConfig()) return { ok: false, reason: 'FOOTBALL_FALLBACK_TO_NEWS=false', news: [] };
    const rows = await Article.find({ category: 'bong-da' })
      .sort({ publishedAt: -1, fetchedAt: -1, createdAt: -1 })
      .limit(limit)
      .select('title slug summary sourceName source publishedAt fetchedAt url')
      .lean();
    return {
      ok: rows.length > 0,
      reason: rows.length ? '' : 'no football articles',
      news: rows.map((item) => normalizeTextFields(item, ['title', 'summary', 'sourceName', 'source']))
    };
  }
};
