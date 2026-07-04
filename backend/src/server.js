import { loadEnv } from './config/env.js';

loadEnv();

const [
  { default: app },
  { connectDB },
  { default: Article },
  { startFootballScheduler },
  { seedDefaultFeeds },
  { startMarketScheduler, startNewsScheduler },
  { syncAllFeedsLocked }
] = await Promise.all([
  import('./app.js'),
  import('./config/db.js'),
  import('./models/Article.js'),
  import('./jobs/footballScheduler.js'),
  import('./services/feedSeeder.js'),
  import('./services/scheduler.js'),
  import('./services/newsSyncService.js')
]);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

async function prepareData() {
  await connectDB(MONGO_URI);
  const sourceCount = await seedDefaultFeeds();
  console.log(`Ready with ${sourceCount} RSS sources.`);

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

app.listen(PORT, () => {
  console.log(`Tin Tuc 247 API running on port ${PORT}`);
});

prepareData().catch((error) => {
  console.error('Startup data preparation failed:', error.message);
  if (!process.env.RENDER) {
    process.exitCode = 1;
  }
});
