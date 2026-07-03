import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import Article from './models/Article.js';
import { startFootballScheduler } from './jobs/footballScheduler.js';
import { seedDefaultFeeds } from './services/feedSeeder.js';
import { startMarketScheduler, startNewsScheduler } from './services/scheduler.js';
import { syncAllFeedsLocked } from './services/newsSyncService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247';

async function bootstrap() {
  await connectDB(MONGO_URI);
  const sourceCount = await seedDefaultFeeds();
  console.log(`Ready with ${sourceCount} RSS sources.`);

  app.listen(PORT, () => {
    console.log(`Tin Tức 247 API running at http://localhost:${PORT}`);
  });

  startNewsScheduler();
  startMarketScheduler();
  startFootballScheduler();

  if (process.env.AUTO_SYNC_ON_START !== 'false') {
    const articleCount = await Article.countDocuments();
    if (articleCount === 0) {
      console.log('Database has no articles. Running first RSS sync...');
      syncAllFeedsLocked()
        .then((log) => console.log(`Initial sync done: ${log.message}`))
        .catch((error) => console.error('Initial RSS sync failed:', error.message));
    } else {
      console.log(`Startup sync skipped: ${articleCount} articles already exist.`);
    }
  }
}

bootstrap();
