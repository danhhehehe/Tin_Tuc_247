import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Article from '../src/models/Article.js';
import FeedSource from '../src/models/FeedSource.js';
import SyncLog from '../src/models/SyncLog.js';
import { seedDefaultFeeds } from '../src/services/feedSeeder.js';
import { syncAllFeedsLocked } from '../src/services/newsSyncService.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tin_tuc_247';

async function main() {
  await connectDB(MONGO_URI);
  console.log('🧹 Đang xóa dữ liệu tin, nguồn RSS và log cũ...');
  await Promise.all([
    Article.deleteMany({}),
    FeedSource.deleteMany({}),
    SyncLog.deleteMany({})
  ]);

  const sourceCount = await seedDefaultFeeds();
  console.log(`✅ Đã tạo lại ${sourceCount} nguồn RSS mặc định.`);
  console.log('🔄 Đang kéo tin mới lần đầu...');
  const log = await syncAllFeedsLocked();
  console.log(`✅ ${log.message}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Reset và đồng bộ thất bại:', error);
  process.exit(1);
});
