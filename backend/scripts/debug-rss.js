import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import FeedSource from '../src/models/FeedSource.js';
import { seedDefaultFeeds } from '../src/services/feedSeeder.js';
import { syncOneFeed } from '../src/services/newsSyncService.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247';
const limit = Math.min(Math.max(Number(process.argv[2] || 3), 1), 10);

async function main() {
  await connectDB(MONGO_URI);
  await seedDefaultFeeds();

  const sources = await FeedSource.find({ enabled: true }).sort({ priority: -1, name: 1 }).limit(limit);
  console.log(`Debugging ${sources.length} RSS source(s)...`);

  for (const source of sources) {
    const result = await syncOneFeed(source);
    console.log(JSON.stringify(result, null, 2));
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('debug:rss failed:', error);
  process.exit(1);
});
