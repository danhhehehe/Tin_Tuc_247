import FeedSource from '../models/FeedSource.js';
import { defaultFeeds } from '../data/defaultFeeds.js';

export async function seedDefaultFeeds() {
  const operations = defaultFeeds.map((feed) => ({
    updateOne: {
      filter: { url: feed.url },
      update: {
        $set: {
          name: feed.name,
          url: feed.url,
          homepage: feed.homepage || '',
          type: feed.type || (feed.url.includes('news.google.com') ? 'google-news' : 'rss'),
          category: feed.category,
          language: feed.language || 'vi',
          priority: feed.priority || 1,
          active: feed.active !== false,
          parserConfig: feed.parserConfig || {},
          crawlFrequencyMinutes: feed.crawlFrequencyMinutes || 30
        },
        $setOnInsert: {
          enabled: true,
          lastStatus: 'pending',
          lastError: ''
        }
      },
      upsert: true
    }
  }));

  if (operations.length) {
    await FeedSource.bulkWrite(operations, { ordered: false });
  }

  return FeedSource.countDocuments();
}
