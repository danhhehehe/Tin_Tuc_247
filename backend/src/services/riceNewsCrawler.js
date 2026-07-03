import FeedSource from '../models/FeedSource.js';
import { syncOneFeed } from './newsSyncService.js';

export async function getRiceHtmlSources() {
  return FeedSource.find({
    category: 'lua-gao',
    type: { $in: ['html-list', 'html-article'] },
    enabled: true,
    active: { $ne: false }
  }).sort({ priority: -1, name: 1 });
}

export async function crawlRiceSources() {
  const sources = await getRiceHtmlSources();
  const results = [];

  console.log('[RICE CRAWL START]');
  console.log(`Total sources: ${sources.length}`);

  for (const source of sources) {
    const result = await syncOneFeed(source);
    results.push(result);
    if (result.ok) {
      console.log('[RICE SOURCE OK]');
      console.log(`Name: ${source.name}`);
      console.log(`URL: ${source.url}`);
      console.log(`Type: ${source.type}`);
      console.log(`Fetched articles: ${result.total}`);
      console.log(`Inserted: ${result.inserted}`);
      console.log(`Updated: ${result.updated}`);
      console.log(`Skipped: ${result.skipped}`);
    } else {
      console.log('[RICE SOURCE ERROR]');
      console.log(`Name: ${source.name}`);
      console.log(`URL: ${source.url}`);
      console.log(`Type: ${source.type}`);
      console.log(`Reason: ${result.error}`);
      if (result.status) console.log(`HTTP status: ${result.status}`);
    }
  }

  const success = results.filter((item) => item.ok).length;
  const failed = results.length - success;
  console.log('[RICE CRAWL DONE]');
  console.log(`Success sources: ${success}`);
  console.log(`Failed sources: ${failed}`);

  return { sources, results, success, failed };
}
